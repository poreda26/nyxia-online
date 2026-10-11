# Nyxia — Oynanabilir Dünya / İlk Sürüm

Bu dal mevcut React/Vite oyununa tek oyunculu, gerçek zamanlı bir Fallow Valley haritası ekler. MMORPG sunucusu henüz yoktur. Kullanıcı hesabı ve ilerleme mevcut cihaz içi kayıt sistemini kullanır.

## Çalıştırma

Node.js ve npm kurulu bir bilgisayarda proje klasöründe:

```bash
npm ci
npm run dev -- --host 0.0.0.0
```

Vite'ın gösterdiği `/nyxia-online/` adresini aç. Telefonda aynı Wi-Fi üzerinden bilgisayarın yerel IP adresini ve Vite portunu kullan. İşletim sisteminin güvenlik duvarı erişime izin vermelidir.

Mevcut kullanıcı adıyla giriş yap, karakterini seç. Yeni Dünya ekranı otomatik açılır. Başlangıç turunu ve günlük ödül penceresini kapattığında hareket başlar.

- Mobil: sol joystick; yaratığa dokun veya Hedef düğmesine bas; menzile girip Saldır'a bas.
- Bilgisayar: WASD/oklar hareket; Boşluk saldırı; Tab hedef; 1–5 beceriler; Q/E can/mana iksiri; F NPC konuşması; Esc mola.
- Kaptan ve tüccar güvenli kamptadır. Yaklaşınca konuşma düğmesi görünür.
- Çanta düğmesi mevcut envanteri açar. Dünya sekmesi seni haritaya geri getirir.
- Mola menüsünden karakter, beceri ve eski savaş/bölge menülerine ulaşabilirsin.
- Savaş sürerken menüye kaçış engellenir; güvenli kampa dön veya yaratıklardan uzaklaş.
- Yatay ekran önerilir; dikey ekran için ayrı kontrol yerleşimi bulunur.

## Bağlanan sistemler

Ekipman saldırı/savunma/can hesapları, eşya dayanıklılığı, öğrenilmiş beceriler, iksir tüketimi, altın/XP, eşya/sandık düşmesi, seviye, Kaptan görev sayacı, günlük öldürme sayacı ve karakter kaydı mevcut kodu kullanır. Normal savaş ve harita öldürmeleri ortak `src/utils/monsterRewards.js` üzerinden ödüllendirilir. Ödül rastgeleliği React state updater içinde çalışmaz.

Harita yalnızca Fallow Valley verisini kullanır. Diğer haritaların mevcut menü sistemini ve `currentMapId` kaydını değiştirmez. Her öldürmede can/mana dolması mevcut oyunun kuralıdır ve korunmuştur. Haritadaki yaratıklar 14 saniyede yeniden doğar.

## Dosya sınırları

- `src/world/engine.js`: hareket, çarpışma, hedef/menzil, gerçek zamanlı savaş, takip, geri dönüş, ölüm. Geçici dünya state'ini değiştirir; kalıcı player güncellemelerini sonuç olarak döndürür.
- `src/world/renderer.js`: kamera ve Canvas çizimi; oyun kurallarını değiştirmez.
- `src/components/WorldTab.jsx`: dokunma/klavye girdileri, yükleme, UI, duraklatma ve player köprüsü.
- `src/world/world.css`: yalnızca `.world-*` sınıflarını etkiler.
- `src/assets/world/`: özgün üretilmiş zemin ve 4×2 karakter atlası.
- `src/utils/monsterRewards.js`: iki savaş modunun ortak ödül politikası.
- `Hub`, `App`, `BottomNav`, `TutorialModal`: küçük giriş/navigasyon bağlantıları.

Harita hareketi her karede React player state'ine yazılmaz. Player yalnızca ilerleme/savaş olaylarında değişir; mevcut App kayıt effect'i bunu kaydeder. Dünya koordinatları ve yaratık state'i aynı karakter oturumunda menüler arasında korunur; sayfa yenilendiğinde kamp başlangıcına dönülür. Arka sekmeye geçiş, pencere odak kaybı ve pointer iptalinde hareket sıfırlanır; devam etmek için mola ekranından çıkılır. Geri dönülen karede zaman farkı en fazla 50 ms işlenir.

## GitHub güncellemeleriyle birleştirme

Geliştirme dalı: `feature/playable-world`. Kullanıcının `main` dalı bu çalışma sırasında değiştirilmedi. Paket tek bir geliştirme commit'ini uygulamak için Git patch içerir.

**Mevcut ve güncel deponda, önce çalışma ağacının temiz olduğundan emin ol.** Sonra:

```bash
git fetch origin
git switch -c feature/playable-world origin/main
git am -3 /dosyanin/yolu/nyxia-playable-world.patch
npm ci
npm run test:world
npm run build
```

Windows'ta patch dosyasının kendi tam yolunu yaz. Dal zaten varsa yeni dal açma; `git switch feature/playable-world` kullan. Patch daha önce uygulanmışsa tekrar uygulama.

Güncellemeler geldikçe:

```bash
git fetch origin
git switch feature/playable-world
git merge origin/main
npm run test:world
npm run build
```

Çakışma çıkarsa son değişiklikleri okuyup ilgili dosyaları birlikte çözmek gerekir. Özellikle savaş ödüllerini artık `monsterRewards.js` içinde güncelle; iki ayrı ödül uygulaması oluşturma. Tüm depoyu eski ZIP içeriğiyle körlemesine değiştirme: yeni GitHub değişikliklerini kaybedebilirsin. Birleştirme kontrol edilmeden `main` dalına taşıma.

## Doğrulama ve sınırlar

`npm run test:world`: 12 davranış testi (hareket/çarpışma, menzil, saldırı tekrarı, ekipman etkisi, mana/beceri, iksir, duraklatma, ölüm, kampta güvenlik, ödül/seviye ve kayıt round-trip).

`npm run build`: üretim derlemesi. Tarayıcıda dokunmatik etkileşim ve gerçek Android/iOS performans testi henüz yapılmadı.

Bu ilk sürümde:

- Gerçek oyuncu eşleştirme, ortak dünya, sunucu otoritesi ve ağ senkronizasyonu yok.
- Karakterler tek poz atlası, sağ/sol yansıtma, hafif hareket ve saldırı efekti kullanır. Sekiz yönlü animasyon kareleri henüz yok.
- Kuşanılan eşya statları anında etkilidir; gerçek item görseli karakter yanında küçük bir rozet olarak görünür. Silahın elde katmanlı animasyonla değişmesi ve zırh setlerinin model üzerinde değişmesi sonraki aşamadır.
- Büyük kaya/orman/nehir engelleri için yaklaşık çarpışma hacimleri vardır; tam navigation mesh ve gelişmiş yol bulma yok. Geri dönerken takılan yaratık beş saniyede yuvasına sıfırlanır.
- Beceri bekleme/etki süreleri gerçek zamana çevrilmiştir (tur başına 1,5 sn; minimum beceri bekleme 1,2 sn). Çoklu oyuncu dengesi için ayrıca ayarlanmalıdır.

Sonraki dilim: mobil cihazda oynanış geri bildirimi, gerçek yön/yürüme/saldırı sprite kareleri ve elde ekipman katmanları. Ardından kimlik doğrulamalı, sunucunun hareket/savaş/ödülü doğruladığı ortak dünya.
