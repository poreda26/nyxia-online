# Nyxia Online sinematik fragman

Çıktı: **nyxia-fragman-1080x1920.mp4**, 36 saniye, dikey, 24 fps, H.264/AAC. Oyun arayüzü yok; oyunun kendi bölge, canavar ve karakter sanatı kullanılır. Müzik oyunun `mist-valley.mp3` dosyası, vuruş/yükseliş/çan sesleri FFmpeg ile üretilir (dış ses dosyası yok).

Akış: prolog, altı bölge (her birinde o bölgenin boss'u), kahramanlar, bitiş kartı (logo, "Çok Yakında!", App Store ve Google Play ikonları).

## Mağaza ikonları (`badges/`)
- `Download_on_the_App_Store_Badge_TR_black.svg`, `Download_on_the_App_Store_Badge_EN_black.svg`: Apple App Store Marketing Tools, resmi rozet (değiştirilmemiş).
- `GetItOnGooglePlay_Badge_Web_color_Turkish.svg`: Google Partner Marketing Hub, resmi rozet (değiştirilmemiş).
- `AppStore_icon_noCTA.svg`, `GooglePlay_icon_noCTA.svg`: videoda kullanılan türevler. Resmi rozetlerden yalnızca "indirin" çağrı yazısı çıkarılmış, ikon ve "App Store" / "Google Play" yazısı dikeyde ortalanmıştır.

Uyarı: Apple ve Google kılavuzları rozetlerin değiştirilmesini yasaklar ve "Download / Get it" rozetini yalnızca yayındaki uygulama için ister. Bu türevler Instagram gibi kendi kanallarımız için kullanılıyor; mağaza reklamı ya da Play video alanı için değişmemiş resmi rozetler kullanılmalı. Apple, paylaşımda şu marka metnini ister: "Apple ve Apple logosu, Apple Inc.'in ABD'de ve diğer ülkelerde tescilli ticari markalarıdır. App Store, Apple Inc.'in hizmet markasıdır." Google için: "Google Play ve Google Play logosu Google LLC'nin ticari markalarıdır." Bu metinler videoda yok, paylaşım açıklamasına konabilir.

## Zırh görünümü
Kahramanlardaki zırhın üstüne binen "+8 zırh ışığı" (`.armor-effect`, `.armor-sweep`) kare kare çekimde zırhı mavi-yeşil, yarı saydam gösteriyordu. Fragman sayfası (`fragman.jsx` içindeki CSS) bu iki katmanı kapatır; oyunun kendi dosyalarına dokunulmaz. Kalan efektler (nefes alma hariç) `render.mjs` tarafından sakin bir konumda sabitlenir, böylece animasyonlar rastgele parlamaz.

## Yeniden üretme (depo kökünden)
1. `npx vite --port 5188 --host 127.0.0.1 --strictPort` ile Vite'ı açın.
2. `NYXIA_FFMPEG=<ffmpeg yolu> node marketing/nyxia-fragman/build-audio.mjs` (ses)
3. `NYXIA_FFMPEG=<ffmpeg yolu> NYXIA_PLAYWRIGHT=<playwright yolu> node marketing/nyxia-fragman/render.mjs` (video)

Bitiş kartındaki yazılar `fragman.jsx` içindeki `End` bileşenindedir.
