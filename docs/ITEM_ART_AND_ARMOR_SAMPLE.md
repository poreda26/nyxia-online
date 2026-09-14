# Eşya görselleri ve Chitin zırh provası

61 silahın iki ırktaki 122 pozu gözden geçirildi. Envanterdeki ortak/piksel ikonlar ve eksik başlangıç resimleri yerine, eldeki silahların şekillerini referans alan 41 ayrı ikon hazırlandı. Kalan 20 özgün silahın mevcut resimleri korundu. İsim, hasar, gereksinim, upgrade, set bonusu ve kayıt verileri değişmedi.

Silah ikonları ItemIcon üzerinden ortak atlas görünümünü kullanır; eski itemImageFor fonksiyonunu tek başına çağırmak yeni atlasları içermez. Başlangıç kılıcı/asası eski adları aynı ikon hücresine gider. Tüm silahlarda +7/+8 efekt rengi mevcut elementten alınır; element yoksa sade gümüş yükseltme ışığı kullanılır. Bu yeni bir hasar elementi değildir. +1–+6'ya aura eklenmez.

Görseller built-in image_gen ile üretildi; tam istemler item-armor-prompts.json içinde. PNG kaynakları src/assets/items/*weapons-v1.png ve src/assets/characters/weapons/warrior-4-chitin-sample.png. Kaynaklar değiştirilmeden saklanır; atlas hücreleri SVG ile gösterilir.

## İlk zırh örneği

Referans: kullanıcının Warrior T4 Chitin Armor görselleri; mavi çelik, altın griffin ve katmanlı plaka. Human ve Karus için Rusty Sword, Large Hacker, Weight Hammer pozları desteklenir. Beş parça ayrı ayrı gerçek equipped slotlarından seçilir; aynı isimde başka tier setler tetiklenmez. Katman önceliği eklemlerde göğüslüğün eksik eldiveni doldurmasını önler. Silah ve tutuş pikselleri orijinal kaynaktan korunur.

Bu bir onay provasıdır: character-check.html?armor=chitin artık zırhsız, bez kıyafetli bedenle açılır. Kuşan/Çıkar düğmeleri gerçek equipItem yordamını kullanan bellekteki karaktere etki eder; localStorage yazılmaz. Ortak CharacterFigure içinde armorPreview özelliğiyle etkinleşir. Ana oyundaki tüm zırhların görsel dönüşümü henüz etkinleştirilmemiştir. Diğer silah pozları ve sınıflar sonraki prova aşamasıdır; desteklenmeyen poz başka silah resmiyle değiştirilmez.

Projeye bağlı resim taraması: Rogue 25/25 zırh parçasında özel resim; Warrior 12/25 (T4/T5 ve T3 eldiven/bot); Mage 0/25. Diğer slotlar mevcut çizgi simgelerini kullanıyor. Bu, kullanıcının elindeki kaynakların eksik olduğu anlamına gelmez; yalnızca bu checkout içindeki eşleme durumudur. Sonraki zırh aşamasında kalan Warrior kaynakları bulunup bağlanmalı.

## Kontrol

30 dünya testi, 6 silah efekt testi, 2 zırh görünüm testi; 128 tarayıcı silah/ırk geçişi ve 30 ayrı zırh giyme/çıkarma kontrolü. 32 kısmi set kombinasyonu iki ırkta veri değişmezliğiyle doğrulanır. 148 envanter simgesi taraması; 6 sınıf/ırk silah panosu ve mobil zırh provası görsel olarak kontrol edilir. İksirler, takı ve yardımcı eşyaların mevcut görselleri korunur.

## Bez kıyafetli temel beden

Warrior prova atlasında iki ırkın gövdesi açık, alt bedeni yıpranmış bezle kapalı; el ve ayaklarda basit sargılar var. Metal zırh temel resimden kaldırıldı. Her çıkarılan parça bu temel bedeni gösterir. Kaynak: src/assets/characters/weapons/warrior-4-cloth-base.png (built-in image_gen). Bu aşama üç Warrior prova pozuyla sınırlıdır; ana oyunun bütün sınıf ve silah pozlarına henüz uygulanmadı. Yeni karakterlerin zırh yuvaları zaten boş olduğundan kayıt/başlangıç istatistikleri değiştirilmedi.
