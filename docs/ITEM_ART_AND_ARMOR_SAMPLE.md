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


## +7 / +8 zırh ve Mage düzeltmesi

Zırh ışığı her parçanın gerçek upgradeLevel ve katalog tier'ından okunur. +1–+6 ışık almaz; +7 yavaşça yanıp söner, +8 sürekli ışık ve kayan parıltı gösterir. T1–T5 yoğunluk/kenar/ışık yayılımı kademeli artar. Parçanın kendi silüet ve slot maskesi kullanılır; ellik ışığı tutuş katmanından sonra çizilir. Hareketi azalt tercihi desteklenir.

Elementi olmayan Mage asalarına yalnızca görsel, açık mor büyü ışığı eklendi. Prismatic Triad Staff ve Ron's Staff'ın eksik çok-elementli görünüm bilgisi orijinal katalogdan okunur; üç renk sırayla yanar. Hasar ve kayıt verileri değişmez. Mage sap kesimleri artık el merkezlerinden zikzak çizmez: her silahın düz ekseni ve dip ucu ayrı tanımlıdır; Human/Karus satır farkları uygulanır. Uç başlığıyla sap kesimi üst üste gelerek kopuk birleşimi önler. Mevcut PNG tasarımları korunur.

Kontrol: 30 dünya testi, 14 görünüm testi, tarayıcıda 90 tier/upgrade durumu ve iki ırkta 46 Mage silah efekti; silah çıkarma, 128 silah/ırk geçişi, kayıt değişmezliği ve hareketi azalt tercihi. Prova ekranındaki Zırh yükseltme seçicisinden +7/+8 denenebilir.
