#!/usr/bin/env bash
# Yeni Oracle (Ubuntu 22.04/24.04, ARM) sunucusunu Nyxia için hazırlar. root olarak çalıştır: sudo bash provision.sh
# Tekrar çalıştırılabilir (idempotent). Uygulama dosyalarını ve veritabanını bu betik KOYMAZ (bkz. migrate.sh).
set -euo pipefail
DOMAIN="${DOMAIN:-nyxia.sametcantas.com}"
APP_USER=nyxia
APP_DIR=/home/$APP_USER/apps/nyxia-online
DATA_DIR=/home/$APP_USER/data

export DEBIAN_FRONTEND=noninteractive
# Eski denemelerden kalan Caddy apt deposu (kota hatası veriyor) güncellemeyi bozmasın
rm -f /etc/apt/sources.list.d/caddy-stable.list /usr/share/keyrings/caddy-stable-archive-keyring.gpg
apt-get update -y
apt-get install -y curl ca-certificates gnupg apt-transport-https debian-keyring debian-archive-keyring iptables-persistent unattended-upgrades

# --- Node 24 (yerleşik node:sqlite için 22.5+ gerekir; eski sunucuyla aynı major)
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 22 ]; then
  curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
  apt-get install -y nodejs
fi

# --- Caddy (otomatik HTTPS): resmî GitHub .deb paketi (apt deposu bazen kota yüzünden 402 veriyor)
if ! command -v caddy >/dev/null; then
  CADDY_VERSION="${CADDY_VERSION:-2.8.4}"
  curl -fsSL -o /tmp/caddy.deb "https://github.com/caddyserver/caddy/releases/download/v${CADDY_VERSION}/caddy_${CADDY_VERSION}_linux_$(dpkg --print-architecture).deb"
  dpkg -i /tmp/caddy.deb
fi

# --- Uygulama kullanıcısı ve klasörler
id -u "$APP_USER" >/dev/null 2>&1 || useradd -m -s /bin/bash "$APP_USER"
install -d -o "$APP_USER" -g "$APP_USER" "$APP_DIR" "$DATA_DIR" "$DATA_DIR/backups"
install -d -m 750 -o root -g "$APP_USER" /etc/nyxia

# --- Oracle Ubuntu imajı 80/443'ü iptables ile kapatır: aç ve kalıcı yap
for port in 80 443; do
  iptables -C INPUT -p tcp --dport "$port" -j ACCEPT 2>/dev/null || iptables -I INPUT 1 -p tcp --dport "$port" -j ACCEPT
done
netfilter-persistent save

# --- Servisler
SRC="$(cd "$(dirname "$0")" && pwd)"
sed "s/__DOMAIN__/$DOMAIN/g" "$SRC/Caddyfile" > /etc/caddy/Caddyfile
install -m 644 "$SRC/nyxia-backend.service" /etc/systemd/system/nyxia-backend.service
install -m 755 "$SRC/nyxia-backup.sh" /usr/local/bin/nyxia-backup.sh
install -m 644 "$SRC/nyxia-backup.service" /etc/systemd/system/nyxia-backup.service
install -m 644 "$SRC/nyxia-backup.timer" /etc/systemd/system/nyxia-backup.timer
systemctl daemon-reload
systemctl enable --now nyxia-backup.timer
systemctl enable nyxia-backend
systemctl enable --now caddy
systemctl reload caddy || systemctl restart caddy

echo "Hazır. Sıradaki: uygulama dosyaları + veritabanı (migrate.sh) ve /etc/nyxia/env."
