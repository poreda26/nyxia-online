# Avatarlar ve görsel düzeltmeler

- Karakter > Kozmetik veya Sohbet başlığından altı karakter portresi seçilebilir. Seçim karakterin `avatarId` alanında, mevcut kayıt/yedek sistemiyle korunur.
- Genel sohbet ve özel mesajlar gönderim anındaki avatar kimliğini saklar. Eski mesajlar güvenli varsayılan portreyle görünür; harici görsel URL kabul edilmez.
- Altı klan arması kuruluşta seçilir. Sonradan yalnızca lider değiştirebilir; yetki sunucuda kontrol edilir. Davetler ve üye listesi avatarları gösterir.
- Sunucu başlangıcında `chat_messages`, `direct_messages`, `clans` tablolarına eksikse `avatar_id` eklenir. Eski kayıtlar silinmez. Frontend ile birlikte yeni backend de VM'de çalıştırılmalıdır; yalnızca GitHub Pages yayını sunucuyu güncellemez.
- Nadas Devi kesim sınırı yanındaki sürüngenin kuyruğunu dışarıda bırakır. Aynı görseli kullanan zindan/boss görünümleri de düzelir.
- Totem Topuzu ve Warrior sapları ortak tahmini el çizgisi yerine ayrı eksenlerle kesilir. Eski poza ait parmakların çıkarıldığı bölgede kesintisiz bir sap katmanı bulunur.

Kontroller: `node --test tests/social-avatars.test.mjs tests/server.test.mjs tests/armor-appearance.test.mjs`, `node scripts/check-social-ui.mjs`, `node scripts/check-weapon-neck.mjs`, `node scripts/check-composed-grips.mjs warrior`, `npm run test:world`, `npm run build`.

Sosyal test: eski SQLite şeması, eski mesaj, iki hesap, genel/özel mesaj, klan daveti/üyeliği, lider yetkisi, geçersiz avatar ve sunucu yeniden başlatması. Tarayıcı testi gerçek bileşenleri kullanır; API çağrıları ayrı test yanıtlarına yönlendirilir, canlı oyunculara mesaj gönderilmez. 320/390/430 px ekranlarda yatay taşma kontrol edilir. Genel dünya testindeki eski takı API çağrıları, GitHub'dan alınan yeni üç kutulu forge sürümünün dışa açtığı API ile güncellendi.
