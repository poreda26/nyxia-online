#!/usr/bin/env bash
# Veritabanının tutarlı yedeğini alır (VACUUM INTO), son 14 yedeği tutar. systemd zamanlayıcısı çalıştırır.
set -euo pipefail
DB=/home/nyxia/data/nyxia.sqlite
OUT=/home/nyxia/data/backups
STAMP=$(date +%Y%m%d-%H%M)
[ -f "$DB" ] || exit 0
runuser -u nyxia -- node -e "const {DatabaseSync}=require('node:sqlite');const d=new DatabaseSync('$DB');d.exec(\"VACUUM INTO '$OUT/nyxia-$STAMP.sqlite'\");"
ls -1t "$OUT"/nyxia-*.sqlite | tail -n +15 | xargs -r rm -f
