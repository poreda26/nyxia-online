# Karakter zırhları ve eşya görselleri

Human ve Karus için Warrior, Rogue, Mage sınıflarının T1–T5 zırh görünümleri hazırlandı: 15 set, iki ırkla 30 tam görünüm. Katalogdaki 75 eşyanın kask, göğüslük, pantolon, ellik ve bot yuvaları ayrı katmanlardan çizilir. Farklı tier parçaları birlikte kullanılabilir. Ana oyun ve Kuşanılmış önizlemesi aynı CharacterFigure bileşenini kullanır.

## Görünüm sistemi

- Zırhsız temel beden açık gövde, yıpranmış bez alt kıyafet ve sargılardan oluşur. Çıkarılan parça bu temel bedeni açar.
- armorRig.js, sınıf + slot + gerçek katalog adı üzerinden görünüm tier'ını bulur. Hiçbir istatistik, gereksinim, set bonusu, eşya kimliği, upgrade veya kayıt değişmez.
- Göğüslük/ellik bölgelerinin çakışması düzeltildi. Katmanların örtüştüğü her pikselin tek sahibi vardır; ellik göğüslüğün eksik bölümünü tamamlamaz.
- Gövde zırhı ile eldeki silah ayrı katmanlardır. Sınıfın sabit beden pozu silahın ölçülmüş tutuş noktasına hizalanır; Rogue yay ve arbalet için ayrı kol pozları kullanır. Eldiven ve parmaklar silahın önüne çizilir.
- +7/+8 element ışıkları mevcut silahın kendi bölgesini izler. Poison mor; flame turuncu; lightning ve ice farklı mavi/beyaz efektler kullanır. Elementi olmayan silahın ışığı yalnızca görseldir.

## Kaynaklar

Kullanıcının mevcut Warrior ve Rogue zırh resimleri referans alındı; eksik aileler ve Mage kıyafetleri sınıfın malzeme/renk ilerlemesine göre tasarlandı. Mevcut envanter ikonları korunur; bu çalışma karakter üstündeki zırh görünümünü tamamlar. Önceki silah aşamasında 41 silah ikonu yenilenmiş, kalan 20 özgün ikon korunmuştu.

PNG dosyaları src/assets/characters/weapons/*-armor-t*.png, warrior-4-chitin-sample.png ve *-cloth-base.png altında. Görseller yerleşik image_gen ile üretildi. İstemler armor-catalog-prompts.json ve önceki item-armor-prompts.json içinde; PNG pikselleri programla yeniden çizilmez. index-character-atlases.ps1, saydamlık/silüet maskelerini çıkarır.

## Prova ve doğrulama

character-check.html tüm sınıf/ırk, beş zırh yuvası, T1–T5, silah ve upgrade seçimini destekler. Eski ?armor=chitin adresi de çalışır. Başlangıç zırhsızdır; Seti kuşan düğmesi seçilen seti giydirir. Gerçek equipItem yordamı bellekteki prova karakterine uygulanır; localStorage yazılmaz.

Kontroller: 30 dünya testi; 6 silah efekti testi; 4 zırh katalog/bağımsız yuva/regresyon testi. Tarayıcıda 150 tek parça takma-çıkarma; karışık tier zırhlarla bütün silah geçişleri; 128 silah/ırk geçişi; dört element +6/+7/+8 ve nefes animasyonu. audit-armor-appearance.mjs, 30 set görünümünü görsel kontrol için üretir.

