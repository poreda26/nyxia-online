# Nyxia Online: proje durumu ve devir notu

Son güncelleme: 8 Kasım 2026. Bilgisayar formatı sonrası ya da yeni bir Claude oturumunda önce bunu okuyun. Gizli bilgi (şifre, anahtar içeriği) bu dosyada YOKTUR; yalnızca nerede durduğu yazılıdır.

## Kurallar
Kullanıcının tasarım kuralları `AGENTS.md` dosyasındadır (Türkçe ve kısa anlat, silah havuzunu tekrarla doldurma, set bonuslarını değiştirme, Rogue yalnızca okçu, ilerlemeyi koru, zırh işi kullanıcıda tamamlandı: zırh sistemine dokunulmaz).

## Proje
- Mobil online RPG. Capacitor Android + React/Vite istemci + Node/SQLite sunucu. Depo: `github.com/poreda26/nyxia-online` (yalnızca bu proje GitHub'da).
- Sunucu otoriter: ortak kurallar `src/game/*.js`, `server/game-logic.generated.mjs` içine derlenir (`npm run build:logic`).
- İstemci sürümü `src/version.js` (CLIENT_BUILD 18), sunucuda en düşük sürüm `app_config.min_build` (18).
- Android paket adı: `com.nyxiaonline.game`, versionCode 18 / 1.0.18, targetSdk 36.

## Sunucu (canlı)
- Oracle Cloud VM (Frankfurt, Ubuntu). **IP adresi ve SSH girişi bu herkese açık depoda yazılmaz**; sahibinin yedeğindeki gizli sunucu notunda (SUNUCU-BILGILERI.md) durur. Anahtar kaybolursa Oracle konsolundan yeni anahtar eklenir.
- Uygulama kullanıcısı `nyxia`, klasör `/home/nyxia/apps/nyxia-online`, servisler `nyxia-backend` ve `caddy`. Ortam değişkenleri `/etc/nyxia/env` (adları: PORT, HOST, NODE_ENV, APP_ORIGIN, DATABASE_PATH, STATIC_DIR, TRUSTED_PROXY, ECONOMY_FOR_ALL, ADS_TEST_ACCOUNTS, VAPID_*, EXTRA_ORIGINS, GOOGLE_CLIENT_IDS, RESEND_API_KEY, MAIL_FROM, ADS_MODE, SUPPORT_NOTIFY_EMAIL=onlinenyxia@gmail.com).
- Yayın tarifi: web için `MSYS_NO_PATHCONV=1 npx vite build --outDir dist-server --base /`, `tar czf`, `scp` ile `/tmp`'ye, `sudo -u nyxia tar xzf ... -C /home/nyxia/apps/nyxia-online/dist-server`. Sunucu dosyaları (`server/*.mjs`) `/home/nyxia/apps/nyxia-online/server/` altına kopyalanır, sonra `sudo systemctl restart nyxia-backend` ve `http://127.0.0.1:3000/api/health` kontrolü. Beta: `vite build --base /beta/ --outDir dist-beta`, `/var/www/nyxia-beta`. nyxiaonline.com ana sitesi statik (`/var/www/nyxia-site`). Yedekleme zamanlayıcısı sunucuda (`nyxia-backup.timer`).
- Sahip paneli: `panel.nyxiaonline.com`. 5 Kasım'da **Sohbet denetimi** canlı akışa çevrildi (`src/owner/ChatLive.jsx`, `server/admin.mjs` `/api/admin/chat?after=`); tek tıkla sustur, sil, ban. Hediye ve posta sekmesi (elmas, altın vb.) zaten vardı. Rehber: `docs/PANEL.md`.

## Google Play durumu (2 Kasım 2026'dan beri)
- Hesap onaylı, uygulama oluşturuldu, bütün politika formları dolduruldu (içerik 12+, veri güvenliği, reklamlar, hedef kitle 13+, mağaza girişi). Cevaplar: `docs/PLAY_RELEASE.md`, `docs/STORE_LISTING.md`.
- AAB 18 (1.0.18) **kapalı test "Alpha"** kanalında yayında, 177 ülke, test grubu `testers-community@googlegroups.com`, katılım bağlantısı `https://play.google.com/apps/testing/com.nyxiaonline.game`.
- testerscommunity.com Starter planı (15 test kullanıcısı) 2 Kasım'da gönderildi. 12 kişi x 14 gün dolunca Play Console'da "Üretime başvur" açılır. Tester sayısı 12'nin altına düşmemeli.
- Google girişi için Play Uygulama İmzalama SHA-1 `B0:18:C1:DE:67:35:E0:07:59:2C:2E:4C:B3:21:17:5F:D6:19:96:49` Google Cloud'da ikinci Android OAuth istemcisi olarak eklendi.
- Yükleme anahtarı: `C:\Users\akcel\NyxiaSecrets\nyxia-upload.jks` (+ `keystore.properties`). Bu anahtarın yedeği hayati önemde (kaybolursa Play destekten sıfırlama gerekir).
- Değişmesi gerekenler yayın günü: bitiş kartlarındaki "Çok Yakında", sitedeki "yakında" rozetleri, AdMob uygulamasını mağaza girişine bağlama.

## Pazarlama (`marketing/`)
- `instagram-profil-seti/`: profil, gönderiler, kapaklar, test ekibi duyurusu.
- `nyxia-short/` (24 sn, v5 32 sn) ve `nyxia-fragman/` (36 sn), `nyxia-fragman-2/` (50 sn): sinematik videolar, her klasörde README ve yeniden üretme komutları. Video üretimi için FFmpeg (Python `imageio_ffmpeg` içindeki), Playwright (msedge) ve `npx vite --port 5188` gerekir.
- Mağaza ikonları: `marketing/nyxia-fragman/badges/` (resmi rozetler ve "indirin" yazısı çıkarılmış türevler; yalnızca kendi kanallarımızda kullanılır).

## Bekleyenler
- Kapalı test süresi dolunca üretim başvurusu, açılış tarihi kararı, yayın öncesi oyuncu kayıtlarını sıfırlama (YALNIZCA kullanıcının açık onayıyla).
- Avukat incelemesi (gizlilik, şartlar), reklam doğrulama (SSV) testi, elmas satışı için Play Faturalandırma (ilk sürümde yok).
- Küçük hatalar: yeni karakter oluşturmada konsolda 404/409 gürültüsü (zararsız), 3 eski jsx testi.
- 5 Kasım ve sonrası yapılan değişikliklerin hepsi commit edilmeli (bkz. `git status`).

## Hesaplar (şifreler bu dosyada yok; kullanıcının şifre yöneticisinde olmalı)
Google hesabı (Play Console, AdMob, Cloud Console), GitHub (`poreda26`), Oracle Cloud, Resend (e-posta), alan adı sağlayıcısı (nyxiaonline.com), testerscommunity.com, Instagram (`nyxiaonline`), Discord. Oyun içi sahip hesabı panele `panel:true` ile girer.
