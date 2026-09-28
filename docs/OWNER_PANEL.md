# Nyxia sahip paneli

Adres: `/owner.html` (kök dizine derlenen VM yayını). GitHub Pages tabanlı derlemede `/nyxia-online/owner.html`.

## Sunucuda bir defalık kurulum

Sunucunun kullandığı **aynı DATABASE_PATH** ile, mevcut kayıtlı hesabı sahip yap:

```sh
DATABASE_PATH=/gercek/veritabani/nyxia.sqlite node server/set-owner.mjs poreda26
```

Komut yeni hesap açmaz. Mevcut hesap ID'sini tek sahip olarak kaydeder; farklı bir sahip varsa üzerine yazmaz. Şifre, API anahtarı veya GM giriş kodu kaynak koda eklenmez. Sahip varsayılan olarak yoktur: kurulum yapılana kadar API herkese kapalıdır. GM bayrağı veya benzer bir karakter adı panel erişimi vermez.

Kaynağı güncelle, mevcut dağıtımın derleme komutunu kullan (kök alan adında `npm run build -- --base=/`), oluşan dist dizinini mevcut STATIC_DIR'ye dağıt ve API servisini yeniden başlat. Veritabanı dosyasını değiştirme/silme. Normal hesap şifrenle panelden giriş yap. Canlı sunucuya erişim sağlanmadıkça bu adımlar otomatik tamamlanmış sayılmaz.

## Özellikler

- Hesap arama/sayfalama, üç karakterin incelemesi; seviye, EXP, altın, ortak elmas/depo altını, oyun içi GM düzenleme.
- Tam kayıt JSON düzenleyicisi: mevcut eşya/ekipman/görev alanlarına erişim. Eşya ID ve upgradeLevel korunmalı. Mevcut karakter ID'si değiştirilemez veya karakter silinemez.
- JSON yedek indirme, otomatik işlem öncesi snapshot, eski snapshot'a dönüş.
- Hesap engelleme/engel kaldırma ve tüm oturumları kapatma. Sahip kendini engelleyemez.
- Genel sohbet mesajı kaldırma; özel mesajlar gösterilmez.
- Klan listesi/hazine/üye sayısı ve ad düzenleme. Pazar eşya listeleri ile düellolar salt okunur.
- İşlem açıklaması zorunlu audit kaydı. Snapshot ve audit tablosu normal oyuncu API'lerine kapalıdır.

Kayıtlar revision kontrolü ve SQLite transaction ile yazılır; eski istemci kaydı sessizce üzerine yazamaz. Düzenlenen oyuncu oyunu yenileyerek güncel kaydı almalıdır. Snapshot'lar otomatik silinmez; disk kullanımı takip edilmelidir. Tam SQLite dosyası yedeği ayrıca sunucu işletiminin sorumluluğudur.

## Kapsam ve sınırlar

Bu panel sunucudaki kayıt ve topluluk yönetimini sağlar. Oyunun ekonomi hesapları hâlâ kısmen istemciye güvenir; panel bunları otoriter yapmaz. Yeni eşya/skill/map tasarımları sürüm yayını gerektirir; mevcut katalogdaki eşyalardan drop ve sandık havuzu oluşturmak panelden yapılabilir. Ödeme sağlayıcısı, iade ve mağaza ödeme doğrulaması henüz bağlı değildir; panel hayali ödeme verileri göstermez. Aktif hesap göstergesi son 5 dakikada API isteği gönderen hesapları sayar; sürekli çevrimiçi bağlantı ölçümü değildir.

## Genişletilmiş yönetim

- **Drop ve sandıklar:** Normal canavarlar, harita sonu muhafızları ve Savaş Alanı bossları. Altın/EXP, eşya/sandık/parşömen şansları, Canavar Ara çarpanları. Muhafızların garantili sandık sayısı 0–10, tier'ı 1–6 düzenlenebilir.
- Her canavara ve T1–T6/özel sandığa ayrı ağırlıklı eşya havuzu. 247 katalog girdisi; isim, sınıf, tier ve +seviye seçilir. `null` havuz varsayılana döner. Ağırlıklar birbirine oranlanır; örneğin 1 ve 3 ağırlıklı iki eşya %25 ve %75 seçilir. Canavarın temel drop şansı ayrıca uygulanır, kanat/premium gibi mevcut çarpanlar korunur. Sandıkta özel havuz seçilirse varsayılan kategori/özel eşsiz zarları atlanır; tam bir eşya üretilir.
- Kurallar sunucuda revision kontrollü transaction ile yayınlanır; açıklama ve önceki sürüm saklanır. Oyun girişte, sekmeye dönüşte ve 30 saniyede bir alır. Ağ hatasında son alınan kural korunur; hiç alınmamışsa oyun varsayılanlarını kullanır. Bu mekanizma istemci ödül hesaplamasını sunucu otoriteli yapmaz. Üretimde eski localStorage drop paneli kullanılmaz.
- **Görselli eşya inceleme:** Her karakterin çantası, kuşanılmışları, ortak depo, sandıkları. Eşyaya tıklayınca statlar ve tüm kayıt gösterilir. Gelişmiş JSON düzenleme hâlâ kullanılabilir; silme/değiştirme kayıttan önce açıkça gözden geçirilmelidir.
- **Kimlik:** Karakter adı 2–24 karakter. Human (`elmorad`) / Karus hesap genelindedir ve seçim tüm karakterlere uygulanır. Envanter ve ekipman otomatik sıfırlanmaz. Ad, ırk ve eşya verileri kaydet düğmesiyle birlikte yayınlanır.
- **Süreli ban/mute:** Saat cinsinden (kesirli saat desteklenir), 0 kalıcı; en çok 8760 saat. Ban oturumları iptal eder ve bütün oturumlu API erişimini engeller. Mute genel ve özel mesaj POST isteklerini engeller; karaktere değil hesaba uygulanır. Süre dolduğunda sunucu saatiyle otomatik biter. Eski kalıcı banlar migration ile korunur. Sahip kendini cezalandıramaz.
- **Takip:** Aktif cezalar, hesap başına son etkinlik, kayıt revision'ı, işlem geçmişi. API etkinliği hesap başına dakikada en fazla bir kez veritabanına işlenir. Klan zindanı kodu ve kayıtları korunmuştur; bu sürüm zindan aşamalarını yeniden tasarlamaz.

Dağıtımda frontend ve backend birlikte güncellenmeli ve servis yeniden başlatılmalıdır. Var olan panel sahibi korunur; yeniden sahip ataması gerekmez. Veritabanı şema eklemeleri otomatik ve kayıtları silmeden yapılır.

Ek doğrulama: `tests/admin.test.mjs` süreli cezalar, DM/genel sohbet mute, yetki, kuralların yayınlanması/çakışması/geri yüklenmesi, yanlış tablo ve yüzde reddi, ad/ırk değişiminde eşya korunması. `tests/admin-loot-runtime.js` esbuild ile Node ESM'e paketlenerek çalıştırılır; 247 eşyanın üretimi, normal/özel sandık, gerçek canavar ödülü ve varsayılana dönüş kontrol edilir. `scripts/check-owner-ui.mjs` 320/390/1440 px'de görselli envanter ve drop havuzu dahil ekranları sınar.

Yetki her `/api/admin/` isteğinde sunucuda kontrol edilir; HttpOnly SameSite oturum çerezi, origin kontrolü, mevcut giriş hız sınırlaması kullanılır. Mevcut oyundaki istemci GM komutu panel yetkisine bağlanmamıştır.

Test: `node --test tests/admin.test.mjs tests/server.test.mjs`; üretim derlemesi `npm run build`.

## Dogrulama

## Görselli drop atölyesi — 28 Eylül 2026

- Hedef listesi ve eşya kutuları: normal canavarlar, harita muhafızları, her haritanın 11 solo zindan yolu/aşaması, Savaş Alanı bossları, T1–T6 ve özel sandık.
- Katalogda isim, tier, tür ve sınıf filtresi; kutuya dokunarak +seviye/ağırlık düzenleme, kaldırma. Havuzlar hedefler arasında kopyalanabilir. Varsayılan havuzlar da gerçek dağılımlarıyla görünür; ilk değişiklik mevcut ağırlıkları korur.
- Boş canavar havuzu `[]` ekipman dropunu kapatır; `null` varsayılana döner. Boş sandık yayınlanamaz. Altın, EXP, sandık ve parşömen şansları ayrı alanlardır. Özel sandığın varsayılanı sınıfa bağlıdır; özel liste yayınlanırsa tüm sınıflara aynı liste uygulanır.
- Katalog ekipmanlarla sınırlıdır (247 kayıt). Klan zindanının dört malzemelik sunucu drop sistemi ve solo tamamlanma bonusu bu eşya havuzundan ayrıdır; bu ekranda düzenlenmez.
- Klan zindanında mevcut atlaslardan tam boy canavar, boss ayrımı, can barı, statlar ve 20 aşamalı ilerleme şeridi. Yeni raster boss çizimleri imagegen kullanım limiti nedeniyle üretilemedi; mevcut görseller kullanıldı.
- Kontroller: `node --test tests/drop-pools.test.mjs tests/admin.test.mjs`, `npm run test:admin-loot`, `npm run test:world`, `npm run build`; yerel Vite 5188 ile `node scripts/check-owner-ui.mjs` ve `node scripts/check-dungeon-ui.mjs`.
- GitHub kaynak yayını canlı VM dağıtımı değildir; yeni frontend ile `server/drop-settings.mjs` dahil backend birlikte güncellenmelidir. Eski backend yeni zindan hedeflerini/boş havuzları reddeder.

27 Eylul 2026: Owner/GM access separation, CSRF rejection, revision conflict, snapshot restore, ban and restart persistence passed. Desktop 1440px and mobile 390px/320px UI sections and invalid JSON handling passed with mock data. No live accounts changed. Run scripts/check-owner-ui.mjs against local Vite on port 5188.
