# Ödüllü reklam ("Reklam izle, elmas kazan")

- 6 saatte bir (hesap başına) bir reklam; ödül 5 / 10 / 15 elmas (ağırlık 60/30/10), miktarı **sunucu** seçer. Bkz. `server/ads.mjs`.
- Elmas istemcinin "izledim" demesiyle verilmez.
  - `ADS_MODE=admob`: AdMob ödülü sunucuya imzalı geri çağrıyla (SSV, `GET /api/ads/ssv`) bildirir. İmza Google'ın açık anahtarlarıyla doğrulanır, `transaction_id` bir kez ödenir. Reklam başlamadan önce sunucudan bilet alınır (`user_id` = hesap, `custom_data` = bilet).
  - `ADS_TEST_ACCOUNTS=poreda26,...`: yalnızca bu hesaplarda sahte reklam (5 sn) + sunucu ödemesi. Herkese açık ortamda bunun dışında kimse reklam göremez.
- Varsayılan `ADS_MODE` kapalı: hiç ayar yoksa özellik kimseye görünmez.

## Gerçek reklama geçmek için
1. AdMob'da uygulamayı ve **Ödüllü** reklam birimini oluştur.
2. `src/config/ads.js` içindeki birim kimliğini ve `android/app/src/main/AndroidManifest.xml` içindeki `APPLICATION_ID` değerini gerçekleriyle değiştir (şu an Google test kimlikleri).
3. Reklam biriminde "Sunucu tarafı doğrulama" aç, geri çağrı adresi: `https://nyxia.sametcantas.com/api/ads/ssv`.
4. Sunucuda `ADS_MODE=admob` ver (test hesapları listesi artık gerekmez), servisi yeniden başlat, yeni APK yayınla.
5. iOS eklendiğinde aynı akış için iOS birim kimliği ve `GADApplicationIdentifier` gerekir.
