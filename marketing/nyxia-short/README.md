# Nyxia Online reklam videosu

Güncel çıktı: **nyxia-short-v4-1080x1920.mp4** — 24 saniye, 1080×1920, 24 fps, H.264/AAC.

Gerçek oyun bileşenleri: savaş, +7 → +8 yükseltme gösterimi, üç sınıfın kanatlı karakterleri, ekipman vitrini ve mağaza duyurusu. Müzik oyunun `mist-valley.mp3` dosyasıdır. Canlı hesaplar değiştirilmez; yükseltme tanıtım gösterimidir.

## Yeniden üretme

Depo kökünde Vite sunucusunu 5188 portunda açın. Playwright ve FFmpeg gereklidir.
`node marketing/nyxia-short/render.mjs` komutunu depo kökünden çalıştırın.

- `NYXIA_FFMPEG`: FFmpeg yürütülebilir dosyasının yolu (varsayılan PATH üzerindeki ffmpeg).
- `NYXIA_PLAYWRIGHT`: Playwright modül yolu (varsayılan playwright).
- `NYXIA_BROWSER`: kurulu Chromium tarayıcı kanalı (varsayılan msedge).
- `NYXIA_VIDEO_URL`: yerel Vite önizleme adresi.

Zırh ışıkları slotların kesim çizgilerini vurgulamak yerine yumuşak yüzey ışığı kullanır. +7 nabız ve +8 parıltı animasyonları korunur.
