# Ekipman sapı hata taraması — 24 Eylül 2026

Yırtıcı Pençe sapının boyun bağlantısında genel el yönü uzatması gerçek silah ekseninden ayrılıyordu. Warrior scythe geometrisine iki ırk için açık sap hattı eklendi. İstatistik, eşya kimliği ve kayıt yapısı değişmedi.

Doğrulama:
- check-scythe-continuity.mjs: Human/Karus × +7/+8. Gerçek tarayıcı ekran görüntüsünde yalnızca silah katmanı ayrılarak y=145–185 arasındaki 41 satırda görünür sap pikseli aranır. Eski kodda Human +7 y=145 testi başarısız; yeni kodda dört kombinasyon geçer.
- check-equipment-gallery.mjs: 122 silah/ırk görünümünün karışık zırhlarla yüklenmesi ve 30 tam set önizlemesi. Görsel inceleme; tüm piksellerin kusursuz olduğunun garantisi değildir.
- test:world: 42 test; ekipman, kayıt, savaş, bonuslar, hasar dağılımı.
- armor-appearance: 4 test; 75 zırh parçasının iki ırkı, slot bağımsızlığı.
- battle-visuals: esbuild ile paketlenerek 4 test; 27 canavar ve 36 zindan aşaması.
- test:server: hesap izolasyonu, yedek çatışması, yeniden başlatma ve giriş.
- check-duel-ui ve check-hud: üç sınıf otomatik VS, beş ekran genişliği, tarayıcı hataları.

Bu tarama tüm oyun durumlarının hatasızlığını kanıtlamaz. Silah boşluğu için görsel regresyon testi artık tekrar çalıştırılabilir.

## El üstü ortak maske düzeltmesi

- Hedef silahın üzerinde tahmini el elipsleriyle şeffaf delik açma kaldırıldı. Kesintisiz silahın üstüne gerçek kuşanılmış eldiven katmanı çizilir; efekt maskeleri ayrı kalır.
- Warrior kaynak zırh atlasındaki kılıç ucu, kolu kapsamayan dar bir çokgenle çıkarılır.
- check-grip-continuity.mjs: Ayaz Balta/Yırtıcı Pençe/Gökdev Baltası × Human/Karus × +7/+8. Tutuşun hemen üzerindeki y=213–231 satırları alfa pikseliyle doğrulanır. Eski kod Ayaz Balta Human +7 y=231'de başarısız; düzeltme 12 kombinasyonda geçer.
