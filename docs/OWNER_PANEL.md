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

Bu panel sunucudaki kayıt ve topluluk yönetimini sağlar. Oyunun ekonomi hesapları hâlâ kısmen istemciye güvenir; panel bunları otoriter yapmaz. Eşya/skill/map katalogları ve drop oranları kodda olduğundan canlı katalog değişikliği bu sürümde panelden yayınlanmaz. Ödeme sağlayıcısı, iade ve mağaza ödeme doğrulaması henüz bağlı değildir; panel hayali ödeme verileri göstermez. Geçerli oturum sayısı anlık online oyuncu sayısı değildir.

Yetki her `/api/admin/` isteğinde sunucuda kontrol edilir; HttpOnly SameSite oturum çerezi, origin kontrolü, mevcut giriş hız sınırlaması kullanılır. Mevcut oyundaki istemci GM komutu panel yetkisine bağlanmamıştır.

Test: `node --test tests/admin.test.mjs tests/server.test.mjs`; üretim derlemesi `npm run build`.

## Dogrulama

27 Eylul 2026: Owner/GM access separation, CSRF rejection, revision conflict, snapshot restore, ban and restart persistence passed. Desktop 1440px and mobile 390px/320px UI sections and invalid JSON handling passed with mock data. No live accounts changed. Run scripts/check-owner-ui.mjs against local Vite on port 5188.
