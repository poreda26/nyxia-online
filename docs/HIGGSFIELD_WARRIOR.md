# Nyxia — Higgsfield savaşçı görsel çalışması

Tarih: 2026-09-08

## Durum

Üretim isteği Higgsfield Nano Banana Pro modeline gönderildi, ancak seçili Private çalışma alanı için `Out of credits` hatası döndü. Üretim başlamadı; yeni atlas ve oyun entegrasyonu henüz yok. Mevcut oyun kaynakları ve eşya görselleri değiştirilmedi.

## Kullanıcının istediği yön

İzometrik 45 derece, klasik 2000'ler MMORPG estetiği; karanlık fantezi, boyanmış metal dokular, belirgin silüet ve mobilde okunabilir karakterler. Savaşçı ile başlanacak. Rogue yalnızca okçu; Assassin yok. Envanter, ekipman, görev, kayıt, V3 hareket ve ayak hizası korunacak.

## Mevcut görsel referanslar

- src/assets/items/warrior-t4-chest.png
- src/assets/items/warrior-t4-head.png
- src/assets/items/sword-base.png

Bu üç mevcut görselin küçük referans panosu Higgsfield'a yüklendi. Media ID: 5ceb7fee-1868-4b03-97ea-b4062bdbeec8. Orijinal görseller aynı kalır.

## Hazırlanan uygulama planı — henüz uygulanmadı

1. İnsan ve Ork savaşçı için ön/arka yürüyüş atlası: 4×4, her sırada dört kare. Silah içermeyen sade alt zırhlı gövde; ayrı silah/ekipman katmanları için uygun pozlar.
2. Üretimden sonra atlas hücrelerini, gerçek alfa kanalını, karakter tutarlılığını ve ayak tabanlarını görsel olarak kontrol et. Magenta fonu şeffaflaştır; fonu ve bağımsız parçaları ayak ölçümüne dahil etme.
3. Saldırı için ayrıca tutarlı hazırlık/temas/toparlanma kareleri üret; yalnızca yürüyüş atlasını saldırı animasyonu yerine kullanma. Mevcut 0,56 saniyelik süre ve temas anları korunacak.
4. Mevcut itemImageFor eşlemesini kullanarak kuşanılan silahı el bağlantı noktasında çiz. Silahın görselini yeniden üretme. Her karede konum, açı, örtüşme sırası için metadata hazırla.
5. Envanter zırh ikonları doğrudan gövde üzerine yapıştırılmamalı: ikonlardaki dekoratif fon ve perspektif giyilebilir katman değildir. Ayrı zırh katmanları mevcut eşyalardan referansla üretilip eşya türüne bağlanmalı. Hazır olmayan katmanları tamamlanmış gibi gösterme.
6. Değişiklikleri yalnızca dünya çizim/yükleme katmanına bağla, başarısız yüklemede mevcut atlaslara dön. Kayıt formatı, savaş kuralları, eşya statları ve harita engellerini değiştirme.
7. test:world, build; tarayıcıda iki savaşçı ırkı, yönler, yürüyüş, saldırı, duraklatma, ekipman değiştirme ve Rogue/Mage geri dönüş kontrolleri.

İlk üretime gönderilen tam parametreler: higgsfield-warrior-request.json. Kredi sorunu giderildikten sonra bu istek yeniden gönderilebilir.
