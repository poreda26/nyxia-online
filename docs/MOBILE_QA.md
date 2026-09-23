# Mobil arayüz kontrolü

23 Eylül 2026: `node scripts/check-mobile.mjs`; WebKit için PowerShell'de `$env:NYXIA_ENGINE='webkit'`.

- 320×568, 360×640, 390×844, 430×932, 768×1024, 844×390, 568×320.
- Chromium ve WebKit mobil emülasyonu; dokuz ana ekran, Ayarlar, eşya detay penceresi, daraltılmış klavye alanı.
- VisualViewport yüksekliği, safe-area CSS boşlukları, yatay kaydırılabilir alt menü, kaydırılabilir modal içerikleri.
- Ayarlar: mevcut ses/dil/tema, haptik anahtarı, azaltılmış hareket, düşük efekt modu, yüksek kontrast, rehber, yerel kayıt açıklaması. Tercihler cihazda saklanır; hesap/karakterler değiştirilmez.
- Arka plana geçişte ses susturulur; dönüşte kullanıcının ses tercihi korunur.
- Parşömenler ScrollArt; sandıklar RewardChest üzerinden envanter/mağaza/yükseltme/açılışta ortak çizilir.

Bu otomasyon gerçek iPhone/Android cihaz testi veya mağaza onayı değildir. Yayından önce fiziksel cihazlarda çentik/ana ekran göstergesi, gerçek klavye, uygulamadan çıkış/dönüş ve dokunma performansı kontrol edilmelidir. Mevcut gerçek para ödeme entegrasyonu bu arayüz çalışmasının kapsamında değildir.
