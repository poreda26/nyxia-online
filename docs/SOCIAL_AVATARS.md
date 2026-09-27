# Avatarlar ve görsel düzeltmeler

- Karakter > Kozmetik veya Sohbet başlığından altı karakter portresi seçilebilir. Seçim karakterin `avatarId` alanında, mevcut kayıt/yedek sistemiyle korunur.
- Genel sohbet ve özel mesajlar gönderim anındaki avatar kimliğini saklar. Eski mesajlar güvenli varsayılan portreyle görünür; harici görsel URL kabul edilmez.
- Altı klan arması kuruluşta seçilir. Sonradan yalnızca lider değiştirebilir; yetki sunucuda kontrol edilir. Davetler ve üye listesi avatarları gösterir.
- Sunucu başlangıcında `chat_messages`, `direct_messages`, `clans` tablolarına eksikse `avatar_id` eklenir. Eski kayıtlar silinmez. Frontend ile birlikte yeni backend de VM'de çalıştırılmalıdır; yalnızca GitHub Pages yayını sunucuyu güncellemez.
- Nadas Devi kesim sınırı yanındaki sürüngenin kuyruğunu dışarıda bırakır. Aynı görseli kullanan zindan/boss görünümleri de düzelir.
- Totem Topuzu ve Warrior sapları ortak tahmini el çizgisi yerine ayrı eksenlerle kesilir. Eski poza ait parmakların çıkarıldığı bölgede kesintisiz bir sap katmanı bulunur.

Kontroller: `node --test tests/social-avatars.test.mjs tests/server.test.mjs tests/armor-appearance.test.mjs`, `node scripts/check-social-ui.mjs`, `node scripts/check-weapon-neck.mjs`, `node scripts/check-composed-grips.mjs warrior`, `npm run test:world`, `npm run build`.

Sosyal test: eski SQLite şeması, eski mesaj, iki hesap, genel/özel mesaj, klan daveti/üyeliği, lider yetkisi, geçersiz avatar ve sunucu yeniden başlatması. Tarayıcı testi gerçek bileşenleri kullanır; API çağrıları ayrı test yanıtlarına yönlendirilir, canlı oyunculara mesaj gönderilmez. 320/390/430 px ekranlarda yatay taşma kontrol edilir. Genel dünya testindeki eski takı API çağrıları, GitHub'dan alınan yeni üç kutulu forge sürümünün dışa açtığı API ile güncellendi.


## Ek avatarlar ve ilk ödeme silahları
- 12 oyuncu avatarı ve 12 klan arması; yeni altı portre SVG, yeni altı arma farklı simgelerdir.
- Kurucu Topuzu: Totem Topuzu +7 görünümü, Kırıcı Gürz +3 özellikleri.
- Şafak Kanadı: Yelkanat +7 görünümü, Boynuz Arbalet +3 özellikleri.
- Yıldız Yemini: Cennetbahçe +7 görünümü, Demir Uçlu Asa +3 özellikleri.
- Gerçek upgradeLevel 3 kalır; +7 yalnızca görseldir. Referans eşyanın gereksinimleri dahil tüm oyun değerleri korunur. Zırh ödülleri değişmedi.
- Ödüller satılamaz/takaslanamaz/yükseltilemez; pazar API'si bağlı eşyaları ve özel ödül adlarını reddeder. Mevcut kayıtlar silinmez.
- tests/first-purchase.test.js tüm özellik eşitliğini, altı ırk/sınıf görünümünü ve kayıt korunmasını kontrol eder. scripts/check-purchase-ui.mjs gerçek bileşenleri tarayıcıda yükler.
- Gerçek ödeme entegrasyonu hâlâ ayrı iştir; bu değişiklik mevcut ödül üretimi ve önizlemesini günceller.


## Fantastik avatarlar ve sohbet düzeni
Oyuncu kataloğu 24 avatara çıktı: 12 yeni özgün SVG siluet (ejder, kurt, anka, orman ruhu, gözcü, lich, iblis, yılan, baykuş, golem, tilki, kuzgun). Oyuncu seçim ızgarasında isimler gizli; erişilebilir buton adları korunuyor. Genel/özel sohbette portreler 40×40, seçimde eşit kareler; 320/390/430 pikselde uzun mesajlarla taşma kontrol edildi. Yeni avatar kimlikleri için backend kataloğu da yayınlanmalı.


## Portre dolabı ve elmas kozmetikleri
- Oyuncu avatarını değiştiren tek giriş TopBar sol üst portresidir. Karakter ve sohbet ekranları yalnızca gösterir; klan armasını değiştirme ayrı klan özelliği olarak kalır.
- Modal iki sekmelidir: Avatarlar / Çerçeveler. Son 12 raster avatar 250 elmas, önceki 24 ücretsizdir. 16 SVG çerçevenin her biri 250 elmas; çerçevesiz görünüm ücretsizdir.
- Seçim önizlemedir; ücret yalnızca açıkça “250 ◆ · Satın al ve kuşan” ile düşer. Sahip olunan seçenek yeniden ücret alınmadan kuşanılır. Yetersiz bakiye ve tekrar tıklamalar korunur.
- ownedAvatars, ownedAvatarFrames, avatarFrameId mevcut karakter kaydı ve yedekleme akışında saklanır. Oyun değerleri değişmez. Elmas işlemleri mevcut oyun ekonomisi gibi istemci karakter durumu üzerinden yapılır; sunucu otoriteli bir ekonomi uygulandığı iddia edilmez.
- Çerçeve mesajla birlikte gönderilir; SQLite chat_messages/direct_messages frame_id sütunları eklemeli migrasyonla açılır. Eski mesajlar çerçevesiz kalır, yeni genel/özel mesajlar ve klan üye listesi çerçeveyi taşır. Backend de güncellenmelidir.
- Testler: tests/avatar-cosmetics.test.mjs; tests/social-avatars.test.mjs; scripts/check-social-ui.mjs (satın alma, tek giriş, portre+çerçeve mesajı ve 320/390/430 ekranlar).
