# Mağaza rozetleri

Bu klasördeki `.svg` dosyaları Apple ve Google'ın telifli marka sanatıdır, bu yüzden depoya konmaz (`.gitignore`). Videoyu yeniden üretmek için:

1. **Apple rozeti** (İngilizce, siyah): `https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/black/en-us` adresindeki dosyayı `Download_on_the_App_Store_Badge_EN_black.svg` adıyla bu klasöre kaydet. Resmi kılavuz: `developer.apple.com/app-store/marketing/guidelines/`.
2. **Google rozeti** (Türkçe): Google Partner Marketing Hub, "Lockups, icons, & badges" sayfası, "Get it on Google Play Badges > Digital > svg" klasöründeki `GetItOnGooglePlay_Badge_Web_color_Turkish.svg` dosyasını bu klasöre kaydet.
3. `node marketing/nyxia-fragman/derive-badges.mjs` komutu "indirin" yazısı çıkarılmış `AppStore_icon_noCTA.svg` ve `GooglePlay_icon_noCTA.svg` dosyalarını üretir.

Uyarı: Apple ve Google kılavuzları rozetin değiştirilmesini yasaklar. Türev dosyalar yalnızca Instagram gibi kendi kanallarımız için kullanılır; mağaza reklamı için değişmemiş resmi rozetler gerekir. Orijinal ve türev dosyaların yedeği sahibinin yedek klasöründe durur.
