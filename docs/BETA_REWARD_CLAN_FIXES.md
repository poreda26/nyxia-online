# Drop, savaş ve klan düzeltmeleri — 28 Eylül 2026

- Drop atölyesinde tier/tür/sınıf/isim filtreleri artık havuza da uygulanır. Eşya seçilince oran editörü görünür alana gelir. Yüzde yazıp Enter veya alan dışına tıklamak diğer ağırlıkları orantılı günceller; yayınlama yine açıklama ve sürüm kontrolü ister. Tek eşya %100'dür; %0 için listeden çıkarılır.
- Klan Dungeon'a giriş sunucu onayını bekler, ardından ayrı tam ekran karşılaşma açılır. Oyuncu ve düşman karşılıklıdır. Üç sınıfta kuşanılmış beceriler, mana, tur bekleme süreleri, DOT, buff, heal ve HP/MP iksirleri çalışır. Destek eylemi sunucuya sıfır hasarlı tur olarak gider; öldürülen canavar karşılık vurmaz. Savaş Alanı bossları katıl düğmesiyle; av ve otomatik PvP ayrı karşılaşma ekranında açılır.
- Tekli/toplu sandık ödülü çantaya eklenmeden sandık tüketilmez. Dolu çanta, ağırlık sınırı veya boş havuzda sandık korunur. Toplu açılım ilk başarısız ödülde durur; kalan sandıklar saklanır. Animasyon sırasında sekme kapatılsa bile kazanılan eşya önceden kaydedilmiş olur.
- Başka sınıfın silah ve zırhları çantada/depo ekranında engel işareti taşır; detay ve kuşanma butonu aynı kısıtı gösterir.
- Kullanıcının onayıyla Mythic %10, Apex %5 canavar altını bonusu eklendi. Satış bonusundan ayrıdır; normal/solo/harita bossu ve av ödüllerinde altın parşömeni ve av çarpanıyla çarpılır. Savaş Alanı boss altınında da uygulanır. Eksik premium boss eşya/sandık/parşömen drop çarpanları düzeltildi. Rastgele temel altın korunur; farklı iki kesimin tutarı farklı olabilir.

## Karaktere özel klan verisi

- Üyelik, rol, bağış, davet ve günlük Dungeon girişleri `(account_id, character_key)` ile ayrılır. Sunucu seçilen karakteri hesabın yedeğinde doğrular. Kilit başka yan karakter tarafından kullanılamaz veya bırakılamaz.
- Eski üyelik, eski sistemin ana karakter kabul ettiği en yüksek seviyeli karaktere atanır. Eşitlikte ilk karakter korunur. Eski ID'siz karakterler mevcut slot anahtarını kullanır; yeni oluşturulanlara kalıcı ID verilir. Mevcut klan, hazine, rol ve bağışlar korunur. Klan üyesi karakter silinmeden önce ayrılmalıdır; sunucu da bunu denetler.
- İlk backend açılışında `migrateCharacterClans` SQLite transaction içinde bir kez çalışır. Eski üyelik/davet/giriş kayıtları foreign key içermeyen `*_migration_backup` tablolarında ayrıca kalır. Üretim dağıtımından önce normal veritabanı yedeği alınmalıdır.
- Frontend ve backend birlikte yayınlanmalı. GitHub'a push canlı VM'nin güncellendiği anlamına gelmez. Bu değişiklik oyunun mevcut istemciye dayanan hasar/ekonomi modelini sunucu otoriteli hale getirmez.

## Kontroller

- `npm run test:rewards`: dolu çanta, ağırlık, boş havuz, kısmi toplu açılım, aynı sandığı tekrar açma; 1.782 sınıf/canavar/premium karşılaştırması; EXP/drop/altın parşömeni ve sınır kontrolü.
- `npm run test:clans`: karakter ayrımı, davet, yetki, bağış, zindan kilidi/giriş, silme engeli ve eski veri dönüşümü.
- `node --test tests/server.test.mjs tests/admin.test.mjs tests/social-avatars.test.mjs`.
- `npm run test:world`, `npm run test:warzone`, `npm run build`.
- Yerel Vite 5188: `check-owner-ui.mjs` filtre/oran düzenlemesi; `check-dungeon-ui.mjs` üç sınıf × üç ekran × dört durum; `check-warzone-ui.mjs` ayrı boss/av ekranları ve beceriler; `check-inventory-safety-ui.mjs` gerçek sandık butonları ve engel işaretleri.
