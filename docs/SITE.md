# nyxiaonline.com: tanıtım sitesi, wiki, destek ve fragman

`site/` klasörü sunucuda `/var/www/nyxia-site` olarak yayınlanır (Caddy, bkz. `deploy/oracle/Caddyfile`). `/api/*` oyun sunucusuna gider.
Sahip paneli `https://panel.nyxiaonline.com/owner.html` adresindedir.

## Yeniden üretmek (oyun verisi ya da metinler değişince)
```bash
node scripts/build-site.mjs        # wiki + ana sayfa + destek sayfaları (oyun verisinden otomatik)
python scripts/site/images.py      # görselleri küçültüp site/img altına koyar
python scripts/site/trailer.py     # fragman (site/trailer.mp4, ~9 dk sürer; oyunun görselleri + müziği)
```
Wiki sayıları `src/data` içinden okunur, elle yazılmış sayı yoktur. **Bilerek yayınlanmayanlar:** eşya geliştirme şansları, drop ve sandık oranları (oyunda da gizli). Wiki onları yalnızca niteliksel anlatır.

## Destek talepleri (ticket)
- Oyuncu `support.html`'den talep açar (oturum gerekmez). Kod `NX-XXXXXX` ve gizli anahtar verilir; takip bağlantısı `ticket.html?c=KOD#k=ANAHTAR` (anahtar bağlantının `#` kısmında olduğu için sunucu günlüklerine girmez).
- Sahip panelinde **Destek talepleri** sekmesi: liste, konuşma, yanıt, yanıtla ve kapat, yeniden aç. Genel bakışta bekleyen sayısı görünür.
- E-posta bildirimleri `RESEND_API_KEY` + `MAIL_FROM` tanımlıysa gider (oyuncuya "talebin alındı" ve "yanıt verildi", sahibe `SUPPORT_NOTIFY_EMAIL` adresine "yeni talep"). Tanımlı değilse talepler yine kaydedilir; panelden bakılır.
- Sınırlar: e-posta başına saatte 3 / günde 8, tüm site için günde 300 talep (`TICKET_DAILY_LIMIT`), IP başına dakikada 30 istek, bal kabı alanı, mesaj uzunluğu sınırları.
