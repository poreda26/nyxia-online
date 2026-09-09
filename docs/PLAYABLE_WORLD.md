# Nyxia — Oynanabilir Dünya / İlk Sürüm

**Güncel görsel çalışma:** [VISUAL_V4.md](VISUAL_V4.md). V4'te İnsan/Ork savaşçı atlasları ve mevcut eşyalardan ayrı silah katmanı eklendi. T4/T5 miğfer ve göğüslük katmanları kuşanılan eşyaya göre değişir. V2/V3 oyun kuralları korunur.

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

`npm run test:world`: 16 davranış testi (hareket/çarpışma, menzil, saldırı tekrarı, ekipman etkisi, mana/beceri, iksir, duraklatma, ölüm, kampta güvenlik, ödül/seviye ve kayıt round-trip).

`npm run build`: üretim derlemesi. Tarayıcıda dokunmatik etkileşim ve gerçek Android/iOS performans testi henüz yapılmadı.

Bu ilk sürümde:

- Gerçek oyuncu eşleştirme, ortak dünya, sunucu otoritesi ve ağ senkronizasyonu yok.
- Oyuncu karakterlerinde dört kare yürüyüş ve dört kare saldırı dizisi vardır. Ön/arka görünüm ve sağ/sol yansıtma kullanılır; sekiz ayrı yönden çizilmiş animasyon değildir. Yaratıklar önceki sürümdeki görsellerini kullanır.
- Kuşanılan eşya statları anında etkilidir; gerçek item görseli karakter yanında küçük bir rozet olarak görünür. Silahın elde katmanlı animasyonla değişmesi ve zırh setlerinin model üzerinde değişmesi sonraki aşamadır.
- Büyük kaya/orman/nehir engelleri için yaklaşık çarpışma hacimleri vardır; tam navigation mesh ve gelişmiş yol bulma yok. Geri dönerken takılan yaratık beş saniyede yuvasına sıfırlanır.
- Beceri bekleme/etki süreleri gerçek zamana çevrilmiştir (tur başına 1,5 sn; minimum beceri bekleme 1,2 sn). Çoklu oyuncu dengesi için ayrıca ayarlanmalıdır.

Sonraki dilim: mobil cihazda animasyon geri bildirimi, yaratık animasyonları ve elde ekipman katmanları. Ardından kimlik doğrulamalı, sunucunun hareket/savaş/ödülü doğruladığı ortak dünya.


## V2 — Yürüyüş, saldırı ve yalnızca okçu Rogue

- İnsan Warrior, Ork Warrior ve Mage için ön/arka yürüyüş ve saldırı kareleri; Rogue için ayrı yaylı okçu atlası.
- Rogue daima menzilli, başlangıç silahı Bow. Hançer/yakın dövüş silahı kuşanması engellenir. Eski kayıtların Rogue hançerleri (kuşanılmış ve envanterdeki) ID, stat ve yükseltme değerleri korunarak Bow olarak taşınır.
- Yürüyüş döngüsü gerçekten alınan mesafeye bağlıdır; duvara dayanırken yürümeye devam etmez.
- Saldırı 0,56 sn sürer; yakın dövüş teması 0,28 sn, menzilli temas 0,40 sn sonra uygulanır. Saldırı sırasında karakter ayaklarını sabitler. Ok/büyü uçuşu gösterilir.
- Duraklatma animasyonu ve bekleyen hasarı dondurur; ölüm bekleyen saldırıyı iptal eder.
- Var olan item görseli hâlâ rozet olarak görünür. Sprite üzerindeki silah her item ile birebir değişmez.
- 16 davranış testi ve üretim derlemesi geçti; fiziksel telefonda animasyon testi yapılmadı.

V1'i kullanıyorsan V2 ZIP'ini ayrı bir klasöre çıkar, `source` içinde önce `npm ci`, sonra `npm run dev -- --host 0.0.0.0` çalıştır. Eski terminali kapatıp aynı adres/port ve tarayıcıyla açarsan cihaz kayıtların korunur. Tarayıcı verilerini silme. Yeni klasöre eski kaynakları kopyalamana gerek yok.

Paketin `nyxia-v1-to-v2.patch` dosyası yalnızca V1 geliştirme commit'i (73a84df) üzerine uygulanır. `nyxia-playable-world.patch` ise orijinal temel commit f847420 üzerine V1 ve V2'yi birlikte uygular. Aynı değişiklikleri iki kez uygulama. Güncel GitHub değişikliklerin varsa kaynak ZIP'ini üstüne yazmak yerine uygun patch'i ayrı bir dalda üç yönlü birleştir.

Görseller yerleşik imagegen ile üretildi. Projeye alınan dosyalar: `src/assets/world/hero-animations.png`, `src/assets/world/archer-animations.png`. İkisinin de gerçek alfa kanalı doğrulandı. Ana atlasın Rogue satırları kullanılmaz; Rogue yalnızca ayrı okçu atlasından çizilir.

Görsel briefleri: Ana atlas: dört karakter, 8×8 kare, her karakter için ön/arka dört yürüyüş ve dört saldırı karesi; şeffaf arka plan, sabit ölçek ve ayak hizası. Okçu atlası: yeşil pelerinli, yay ve sadak taşıyan okçu, 4×4 kare; ön yürüyüş, ön yay çekme/bırakma, arka yürüyüş, arka yay çekme/bırakma; gerçek şeffaflık, hançer yok.


## V3 — Rahat hareket ve zemine oturma

Geniş orman/çalı engelleri kaldırıldı. Yalnızca batıdaki su ve üç görünür kayanın küçük tabanları çarpışmaya katılır. Ek çarpışma payı 12 pikselden 3 piksele, harita kenar payı 100 pikselden 40 piksele indirildi. Çapraz hareket önce bütün olarak denenir, engelde eksen boyunca kaymaya devam edilir.

Oyuncu, canavar ve NPC çizimleri atlas karelerinin gerçek alfa sınırından ölçülen ayak hizasına oturur (`footAnchors.json`). Canavar/NPC'lerde yapay yukarı-aşağı salınım kaldırıldı; yere temas gölgeleri daraltıldı. Sprite dosyaları değiştirilmedi.

V3 tam kaynak paketi bağımsız çalışır. `nyxia-v2-to-v3.patch` yalnızca V2 (6bfa440) üzerine; `nyxia-playable-world.patch` orijinal f847420 üzerine tüm sürümleri uygular. Yeni klasöre çıkarıp eski terminali kapatarak aynı adres/portta çalıştır. Önce `npm ci`, sonra `npm run dev -- --host 0.0.0.0`. Kayıtların tarayıcıda durur; tarayıcı verilerini silme.
