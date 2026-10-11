# Ödüllü reklam ("Reklam izle, elmas kazan")

- 6 saatte bir (hesap başına) bir reklam; ödül 5 / 10 / 15 elmas (ağırlık 60/30/10), miktarı **sunucu** seçer. Bkz. `server/ads.mjs`.
- Elmas istemcinin "izledim" demesiyle verilmez.
  - `ADS_MODE=admob`: AdMob ödülü sunucuya imzalı geri çağrıyla (SSV, `GET /api/ads/ssv`) bildirir. İmza Google'ın açık anahtarlarıyla doğrulanır, `transaction_id` bir kez ödenir. Reklam başlamadan önce sunucudan bilet alınır (`user_id` = hesap, `custom_data` = bilet).
  - `ADS_TEST_ACCOUNTS=poreda26,...`: yalnızca bu hesaplarda sahte reklam (5 sn) + sunucu ödemesi. Herkese açık ortamda bunun dışında kimse reklam göremez.
- Varsayılan `ADS_MODE` kapalı: hiç ayar yoksa özellik kimseye görünmez.

## Durum (2026-10-11)
- AdMob hesabı açık; uygulama `Nyxia Online` (Android, `com.nyxiaonline.game`), ödüllü birim `free-diamonds`. Kimlikler `src/config/ads.js` ve `AndroidManifest.xml` içinde; sunucu doğrulama adresi `https://nyxiaonline.com/api/ads/ssv`.
- **Test reklamı varsayılan**: APK'yı `VITE_ADMOB_RELEASE=1` olmadan derlersen (debug/deneme) gerçek birim kimliğiyle ama test reklamı (isTesting) gösterilir; kendi reklamına basıp hesabı riske atma.
- **Mağaza (yayın) sürümü** gerçek reklam için şöyle derlenir: `VITE_ADMOB_RELEASE=1 npx vite build --base ./` sonra `cap sync` ve imzalı AAB.
- Sunucuda `ADS_MODE=admob` (herkese açık). Reklam birimi yeni olduğu ve uygulama Play'de yayında olmadığı için gerçek reklam az dolar; Play'e çıkınca AdMob'da uygulamayı mağaza sayfasına bağla.
- AdMob'da ödeme profilini tamamla (adres, vergi); yoksa uygulama incelemede kalır.
- iOS eklendiğinde aynı akış için iOS birim kimliği ve `GADApplicationIdentifier` gerekir.
