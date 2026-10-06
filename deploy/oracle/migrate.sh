#!/usr/bin/env bash
# Nyxia'yı eski sunucudan yeni Oracle sunucusuna taşır. Yerel bilgisayardan (Git Bash) çalıştırılır.
#   bash deploy/oracle/migrate.sh prepare <yeni-sunucu-ip>   # kurulum + uygulama + ayarlar (oyun eski sunucuda çalışmaya devam eder)
#   bash deploy/oracle/migrate.sh cutover <yeni-sunucu-ip>   # eskiyi durdur, son veritabanını taşı, yenisini başlat
# Gizli anahtarlar (VAPID vb.) ekrana yazılmaz, doğrudan eski sunucudan yenisine boru ile geçer.
set -euo pipefail

MODE="${1:-}"; NEW_IP="${2:-}"
[ -n "$MODE" ] && [ -n "$NEW_IP" ] || { echo "Kullanım: migrate.sh prepare|cutover <yeni-ip>"; exit 1; }
NEW_USER="${NEW_USER:-ubuntu}"
KEY="${KEY:-$HOME/.ssh/nyxia_vm}"
OLD_HOST="${OLD_HOST:-poreda@95.70.192.102}"
OLD_PORT="${OLD_PORT:-2222}"
DOMAIN="${DOMAIN:-nyxia.sametcantas.com}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
HERE="$ROOT/deploy/oracle"

new() { ssh -i "$KEY" -o StrictHostKeyChecking=accept-new "$NEW_USER@$NEW_IP" "$@"; }
old() { ssh -i "$KEY" -p "$OLD_PORT" "$OLD_HOST" "$@"; }

prepare() {
  echo "1/5 Uygulama paketi hazırlanıyor…"
  cd "$ROOT"
  MSYS_NO_PATHCONV=1 npx vite build --outDir dist-server --base / >/dev/null
  TMP="$(mktemp -d)"; REL="$TMP/release"; mkdir -p "$REL/src"
  tar cf - --exclude='server/data' server | tar xf - -C "$REL"
  (cd src && tar cf - --exclude='*.png' --exclude='*.jpg' --exclude='*.jpeg' --exclude='*.webp' --exclude='*.svg' --exclude='*.gif' \
      --exclude='*.mp3' --exclude='*.ogg' --exclude='*.wav' --exclude='*.mp4' --exclude='*.woff' --exclude='*.woff2' .) | tar xf - -C "$REL/src"
  cp -r dist-server "$REL/dist-server"
  echo '{"name":"nyxia-server","private":true,"type":"module","dependencies":{"web-push":"^3.6.7"}}' > "$REL/package.json"
  tar czf "$TMP/release.tar.gz" -C "$REL" .
  echo "   paket: $(du -h "$TMP/release.tar.gz" | cut -f1)"

  echo "2/5 Dosyalar yeni sunucuya gönderiliyor…"
  new "rm -rf /tmp/oracle && mkdir -p /tmp/oracle"
  scp -i "$KEY" -q "$HERE"/provision.sh "$HERE"/Caddyfile "$HERE"/nyxia-backend.service "$HERE"/nyxia-backup.* "$NEW_USER@$NEW_IP:/tmp/oracle/"
  scp -i "$KEY" -q "$TMP/release.tar.gz" "$NEW_USER@$NEW_IP:/tmp/release.tar.gz"

  echo "3/5 Sunucu kuruluyor (Node, Caddy, güvenlik duvarı, servisler) — birkaç dakika sürebilir…"
  new "sudo DOMAIN=$DOMAIN bash /tmp/oracle/provision.sh"

  echo "4/5 Uygulama açılıyor ve bağımlılık kuruluyor…"
  new "sudo -u nyxia bash -c 'rm -rf /home/nyxia/apps/nyxia-online/* && tar xzf /tmp/release.tar.gz -C /home/nyxia/apps/nyxia-online && cd /home/nyxia/apps/nyxia-online && npm install --omit=dev --no-audit --no-fund'"

  echo "5/5 Ayarlar eski sunucudan kopyalanıyor (gizli değerler ekrana yazılmaz)…"
  {
    echo "PORT=3000"; echo "HOST=127.0.0.1"; echo "NODE_ENV=production"
    echo "APP_ORIGIN=https://$DOMAIN"
    echo "DATABASE_PATH=/home/nyxia/data/nyxia.sqlite"
    echo "STATIC_DIR=/home/nyxia/apps/nyxia-online/dist-server"
    echo "TRUSTED_PROXY=127.0.0.1"
    old "grep '^Environment=' ~/.config/systemd/user/nyxia-backend.service" | sed 's/^Environment=//' \
      | grep -Ev '^(PORT|HOST|NODE_ENV|APP_ORIGIN|DATABASE_PATH|STATIC_DIR|TRUSTED_PROXY)='
  } | new "sudo tee /etc/nyxia/env >/dev/null && sudo chown root:nyxia /etc/nyxia/env && sudo chmod 640 /etc/nyxia/env"
  echo "Hazırlık bitti. Oyun hâlâ ESKİ sunucuda çalışıyor. Sıradaki: DNS TTL'ini düşür, sonra 'cutover'."
}

cutover() {
  echo "1/5 Eski sunucu durduruluyor (yazma kesilir)…"
  old "systemctl --user stop nyxia-backend"
  echo "2/5 Son veritabanı yedeği alınıyor…"
  old "rm -f /tmp/nyxia-final.sqlite && node -e \"const {DatabaseSync}=require('node:sqlite');const d=new DatabaseSync('/home/poreda/data/nyxia-online/nyxia.sqlite');d.exec(\\\"VACUUM INTO '/tmp/nyxia-final.sqlite'\\\");\""
  TMP="$(mktemp -d)"
  ssh -i "$KEY" -p "$OLD_PORT" "$OLD_HOST" "cat /tmp/nyxia-final.sqlite" > "$TMP/nyxia-final.sqlite"
  echo "   boyut: $(du -h "$TMP/nyxia-final.sqlite" | cut -f1)"
  echo "3/5 Yeni sunucuya aktarılıyor…"
  scp -i "$KEY" -q "$TMP/nyxia-final.sqlite" "$NEW_USER@$NEW_IP:/tmp/nyxia-final.sqlite"
  new "sudo systemctl stop nyxia-backend || true; sudo rm -f /home/nyxia/data/nyxia.sqlite-wal /home/nyxia/data/nyxia.sqlite-shm; sudo install -o nyxia -g nyxia -m 640 /tmp/nyxia-final.sqlite /home/nyxia/data/nyxia.sqlite && sudo rm -f /tmp/nyxia-final.sqlite"
  old "rm -f /tmp/nyxia-final.sqlite"
  echo "4/5 Yeni sunucu başlatılıyor…"
  new "sudo systemctl start nyxia-backend && sleep 3 && systemctl is-active nyxia-backend && curl -s http://127.0.0.1:3000/api/health && echo && curl -s http://127.0.0.1:3000/api/version"
  new "sudo -u nyxia node -e \"const {DatabaseSync}=require('node:sqlite');const d=new DatabaseSync('/home/nyxia/data/nyxia.sqlite');console.log('hesap',d.prepare('select count(*) n from accounts').get().n,'yedek',d.prepare('select count(*) n from backups').get().n)\""
  echo "5/5 Bitti. ŞİMDİ DNS: $DOMAIN A kaydını $NEW_IP yap. Caddy sertifikayı DNS değişince kendisi alır (1-3 dk)."
  echo "Geri dönmek istersen: eski sunucuda 'systemctl --user start nyxia-backend' ve DNS'i eski IP'ye çevir (yeni sunucudaki yazmalar eskiye taşınmaz!)."
}

case "$MODE" in prepare) prepare ;; cutover) cutover ;; *) echo "Bilinmeyen mod: $MODE"; exit 1 ;; esac
