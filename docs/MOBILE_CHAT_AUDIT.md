# Mobil sohbet düzeni

GitHub main 90d806d üzerindeki arkadaşlar ve kapatılabilir özel mesaj sekmeleri korunarak düzenlendi.

- Konuşma şeridi yatay kayar; uzun isimler kısaltılır, okunmamış mesaj işareti ve ayrı dokunulabilir kapatma düğmesi vardır.
- Mesaj listesi kendi içinde kayar; yazma alanı ekranın ve alt menünün içinde kalır. Kısa görsel viewport üst bilgiyi daraltır.
- Özel mesajlar zaman bilgisi, avatar ve çerçevelerle gösterilir. Her konuşmanın taslağı ayrıdır; geciken başka konuşma yanıtı aktif mesajları ezmez.
- Hub okunmuş bilgisini değişmediyse güncellemez; kararsız callback kaynaklı tekrar sorgulama döngüsü giderildi.
- Arkadaş formu, öneriler ve uzun isimler dar ekranlarda uyarlanır.

Doğrulama: scripts/check-mobile.mjs 10 ana ekranı 320×568, 360×640, 390×844, 430×932, 768×1024, 844×390, 568×320 boyutlarında tarar; ayarlar, eşya penceresi ve görsel viewport küçülmesi kontrol edilir. scripts/check-dm-mobile.mjs 8 gelen konuşma, taslak/alıcının ayrılması, kapatma, sorgu sayısı, uzun mesajlar ve 390×340 klavye görünümü testlerini çalıştırır. Testler gerçek React bileşenlerini, sahte API yanıtlarıyla kullanır; gerçek oyunculara mesaj gönderilmez. Fiziksel iOS/Android mağaza paketleri bu kontrolde çalıştırılmadı.
