# Online geçiş — ilk aşama

24 Eylül 2026: Hesap ve sürüm kontrollü yedek API'si hazırlandı. Mevcut oyun hâlâ yerel profillerle çalışır. API henüz canlıya kurulmadı veya oyun giriş ekranına bağlanmadı. GitHub Pages Node sunucusu çalıştıramaz.

## Çalıştırma

Node 24.19 veya üzeri kullanın. Proje kökünde `npm run server`, kontroller için `npm run test:server`.
Varsayılan adres 127.0.0.1:8787; izin verilen arayüz http://localhost:5177. `APP_ORIGIN`, `PORT`, `DATABASE_PATH` ortam değişkenleriyle ayarlanır.
Üretimde `NODE_ENV=production` ve HTTPS `APP_ORIGIN` zorunlu. API'yi oyunun aynı sitesi altında `/api` reverse proxy ile sunun; GitHub Pages ile farklı site çerezlerine güvenmeyin. Node işlemi loopback üzerinden erişilir. Kalıcı disk gerekir. Veritabanı ve WAL dosyaları Git'e eklenmez.

## API

- POST /api/register ve /api/login: `{name,password}`. Kullanıcı adı 3–24 ASCII harf/rakam/alt çizgi; şifre 12–128 karakter.
- GET /api/me: oturumdaki hesabın adı.
- POST /api/logout: oturumu iptal eder.
- GET /api/backup: `{revision,data,trusted:false}`.
- PUT /api/backup: `{revision,data}`; data mevcut hesabın üç karakter slotunu ve diğer alanlarını aynen taşır. İlk sürüm 0. Eski sürümle yazma 409 döndürür; istemci bunu otomatik üzerine yazarak geçmemeli.
- GET /api/health: altyapı durumu; authoritative=false.

Şifreler ayrı tuzlarla scrypt özetidir. Oturumlar 256 bit rastgele, veritabanında özetli; HttpOnly/SameSite=Strict ve üretimde Secure çerez. Yazma istekleri açık Origin ve JSON ister. Hesap açma/giriş IP başına dakikada 12 denemeyle sınırlıdır. Yedek en çok 2 MiB; son 20 sürüm atomik işlem içinde korunur. Hesap kimliği istemciden kabul edilmez.

## Kayıtların korunması ve güven sınırı

Bu API yalnızca **güvenilmeyen eski yerel kayıtların yedeğini** tutar. Kaydı yüklemek online para/eşya yetkisi vermez. Eşya kimlikleri, +seviyeleri ve tüm diğer alanlar aynen saklanır; localStorage değişmez. Online ekonomi veritabanı bununla birleştirilmeyecek. Eski ilerlemenin online'a aktarılma politikası ayrıca belirlenmeli.

## Sonraki işler

1. Barındırma seçimi, HTTPS ve kalıcı disk; harici yedek ve geri yükleme denemesi. Reverse proxy arkasında IP sınırını proxy katmanında da uygulama.
2. Hesap ekranı, e-posta doğrulama/kurtarma; açık kullanıcı seçimiyle yerel yedek aktarımı ve çakışma ekranı. Mevcut profil adına otomatik hesap sahipliği tanımama.
3. Sunucuda karakter/ekipman gerçeği, savaş komutları ve ödüller. İstemciden altın/elmas/hasar sonucu kabul etmeme.
4. Gerçek oyuncu eşleştirme, zorunlu otomatik VS, bağlantı kopması, kilitli savaş ekipmanı.
5. Atomik pazar/takas, işlem kayıtları, tekrar isteklerin tek kez uygulanması.
6. Mobil bağlantı testleri, yük testi, izleme ve kapalı beta.

Bu aşama tüm online geçişin bittiği anlamına gelmez. Sıralamalı maçlarda geçici güç bonuslarını kapatma gibi öneriler henüz oyun kuralı olarak uygulanmadı.
