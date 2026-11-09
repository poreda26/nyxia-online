# Mağaza sayfası metinleri (Google Play)

Uygulama adı (en çok 30 karakter): **Nyxia Online**
Kategori: Oyun → Rol Yapma (Role Playing)
İletişim e-postası: `onlinenyxia@gmail.com` (no-reply adresi KULLANMA)
Web sitesi: https://nyxiaonline.com
Gizlilik politikası: https://nyxiaonline.com/privacy.html
Hesap silme adresi: https://nyxiaonline.com/delete-account.html

## Metinler (kopyalanacak hazır dosyalar, `store/` klasöründe)
Düz metin dosyalarıdır, Play Console'a olduğu gibi yapıştırılır.
- Türkçe kısa açıklama (en çok 80): `store/kisa-aciklama-tr.txt` (71 karakter)
- Türkçe tam açıklama (en çok 4000): `store/aciklama-tr.txt` (2.335 karakter)
- English short description: `store/kisa-aciklama-en.txt` (71)
- English full description: `store/aciklama-en.txt` (2.412)

8 Kasım 2026'da Testers Community raporundaki "açıklamada anahtar kelime ve ayrıntı az" geri bildirimi üzerine yeniden yazıldı: online RPG, klan, boss, PvP, düello, oyuncu pazarı, zindan, haftalık sıralama gibi aranabilir kelimeler, özellik başlıkları ve Türkçe/İngilizce dil desteği eklendi. "MMORPG" kelimesi bilerek kullanılmaz (oyunun yapısına göre fazla iddialı).

## Grafikler
- Simge 512×512: `store/icon-512.png`
- Öne çıkan grafik 1024×500: `store/feature-graphic.png`
- **Başlıklı telefon ekran görüntüleri (1080×1920, 9:16), gerçek oyun ekranları:**
  - Türkçe: `store/screenshots-v2/tr/01.png` ... `06.png`
  - İngilizce: `store/screenshots-v2/en/01.png` ... `06.png`
  - Yeniden üretmek için: `node store/build-screenshots.mjs` (Playwright ve msedge gerekir). Başlıklar betiğin içindeki `SETS` listesindedir.
- Ham (başlıksız) ekran görüntüleri: `store/screenshots/` (Türkçe), `store/screenshots/en/` (İngilizce).

## Play Console'a yükleme adımları
1. **Büyüme → Mağaza varlığı → Ana mağaza girişi** (Türkçe): kısa ve tam açıklamayı yapıştır, eski telefon ekran görüntülerini silip `screenshots-v2/tr` altındaki 6 görseli yükle.
2. **Çeviriler → İngilizce (Amerika Birleşik Devletleri) – en-US ekle** (yapay zekâ ile çevirmeyi seçme, hazır metinlerimiz var): İngilizce kısa ve tam açıklamayı yapıştır, uygulama adı `Nyxia Online`, `screenshots-v2/en` altındaki 6 görseli yükle. Simge ve öne çıkan grafik Türkçedekiyle aynı kalabilir.
3. Kaydet, sonra **Yayın özeti**'nde değişiklikleri incelemeye gönder. Mağaza girişi değişiklikleri yeni sürüm gerektirmez, kısa sürede incelenir.

## Sürüm notları (ilk yayın)
TR: `Nyxia Online'a hoş geldin! İlk sürüm: üç sınıf, altı bölge, klanlar, savaş alanı ve oyuncu pazarı.`
EN: `Welcome to Nyxia Online! First release: three classes, six regions, clans, the Warzone and a player market.`
