# Sunucu otoritesi planı (tam çevrimiçi)

Karar: oyun tamamen çevrimiçi olacak; oyuncunun cihazındaki hiçbir sayıya güvenilmeyecek.
Sunucu zaten Node; oyun kuralları JavaScript. Hedef: kuralları sunucuda çalıştırmak,
istemciyi "ne yapmak istiyorum" diyen ince bir arayüze çevirmek.

## Yöntem: alan alan devir

Sunucu, yedek (`/api/backup`) içindeki **kendi sahip olduğu alanları** istemcinin
gönderdiğinden bağımsız olarak korur. Her fazda bir alan grubu sunucuya geçer; o alanlar
için istemci artık yalnızca niyet gönderir (satın al, yükselt, savaş sonucunu bildir) ve
sunucunun cevabını gösterir. Alanların hepsi geçince `PUT /api/backup` tamamen kalkar.

Kural: sunucuya giden her işlem (1) kimlik doğrular, (2) kuralı SUNUCUDA hesaplar
(fiyat, şans, ödül miktarı), (3) tek transaction'da yazar, (4) yeni durumu döndürür.
Paylaşılan saf kurallar `src/data` ve `src/utils` altında kalır; sunucunun import
edebilmesi için açık `.js` uzantılı, bağımlılıksız dosyalar tercih edilir.

## Fazlar

| Faz | Kapsam | Durum |
| --- | --- | --- |
| 1a | **Elmas kasası**: bakiye, defter, sunucu fiyat listesi, günlük giriş elması, haftalık sıralama ödülü (talep başına tek), GM verme, klan kurma/bağış, yedekte elmas sabitleme | Yapıldı |
| 1b | **Hak sahipliği**: premium (satın alınan + çark), açılan karakter slotları, açılan boya/avatar/çerçeve (günlük seri 1a'da yapıldı) | Yapıldı |
| 1c | **Ödeme**: mağaza makbuzu → elmas kredisi (RevenueCat webhook'u, işlem başına bir kez, iade geri alma). Sunucu tarafı hazır; istemci SDK'sı + hesap kurulumu bekliyor | Sunucu yapıldı |
| 2a | **Altın + envanter + depo**: eşyalar sunucuda satır olarak, kuşan/çıkar/sat/depo | Bekliyor |
| 2b | **Yükseltme**: zarı sunucu atar, parşömen tüketimi sunucuda | Bekliyor |
| 2c | **Pazar**: tezgah işlemleri sunucudaki envantere bağlanır | Bekliyor |
| 3a | **Savaş ödülleri**: canavar ödülü (XP, altın, düşen eşya) sunucuda; savaş bildirimi doğrulanır (hız, seviye, harita kuralı) | Bekliyor |
| 3b | **İlerleme**: seviye, statlar, beceriler, görevler, başarımlar, NP | Bekliyor |
| 3c | **PvP/Savaş Alanı**: düello sonucu ve NP sunucuda | Bekliyor |

## Faz 1a'da bilinen açık kalanlar (sonraki fazlarda kapanır)

- Altın, eşya ve premium hâlâ istemcide: kendi kaydını düzenleyen biri altın/eşya ekleyebilir.
- Haftalık sıralama ödülünde sıra istemcide hesaplanıyor; sunucu yalnızca miktarı belirler,
  hafta başına tek talep ve üst sınır uygular (3b/3c'de sıra da sunucuya geçer).
- Klan hazinesine altın/NP/malzeme bağışı istemcinin düştüğü miktarla yapılıyor (2a'da kapanır).
- Yeni bir istemci sürümü çıkınca eski istemcilerin zorla güncellenmesi için en düşük sürüm
  denetimi gerekiyor (mağaza hazırlık listesinde).

## Elmas kasası kuralları (Faz 1a)

- Bakiye `wallets`, her hareket `wallet_ledger` (toplam her zaman bakiyeye eşit).
- İlk erişimde mevcut yedekteki bakiye bir kez devralınır; sonrasında yedekle gelen elmas
  sayısı yok sayılır ve yedek okunurken/yazılırken sunucu bakiyesine sabitlenir.
- Fiyatlar tek listede: `src/data/diamondPrices.js`. Veri dosyalarıyla eşleştiği
  `tests/world.test.js` içinde doğrulanır.
- Harcama akışı (istemci): yerelde dene → `POST /api/wallet/spend` → sunucu bakiyesiyle uygula.

## Faz 1b: haklar

- `entitlements` tablosu: premium (süreli), çark premium'u, boya / avatar / çerçeve, 3. slot.
  Haklar yalnızca sunucuda bir satın alma, çark ödülü ya da GM işlemiyle doğar.
- Satın alma tek istekte olur: `POST /api/wallet/spend` elmasını düşer ve hakkı aynı transaction'da verir;
  cevapta hakkın güncel özeti döner. Aynı hak ikinci kez satılmaz (`ALREADY_OWNED` / `ALREADY_PREMIUM`).
- Yedek okunurken/yazılırken ilgili alanlar sunucudaki gerçeğe sabitlenir; istemci yedekle hak ekleyemez.
- Çark: premium ödülü `POST /api/wheel/claim` ile alınırken sunucu hakkı yazar (alma + verme tek işlem).
- Mevcut hesaplar ilk erişimde yedeklerindeki hakları bir kez devralır (premium süresi 15 güne kırpılır).

## Faz 1c: elmas satın alma kurulumu (sen yapacaksın)

1. RevenueCat hesabı aç, uygulamayı ekle; Google Play ve App Store'da `diamonds_100`, `diamonds_550`,
   `diamonds_1200`, `diamonds_2500`, `diamonds_5500`, `diamonds_12000` adlı tüketilebilir ürünleri oluştur
   (kimlikler `src/data/diamondPacks.js` ile birebir aynı olmalı).
2. RevenueCat → Integrations → Webhooks: adres `https://nyxia.sametcantas.com/api/iap/revenuecat`,
   Authorization başlığı `Bearer <gizli-anahtar>`.
3. Sunucuda ortam değişkeni: `REVENUECAT_WEBHOOK_SECRET=<aynı gizli anahtar>`. TestFlight / Play test
   alımları için ayrıca `IAP_ALLOW_SANDBOX=1` (canlıya çıkarken kaldır).
4. İstemcide `@revenuecat/purchases-capacitor` kurulup `appUserID` olarak hesap kimliği (`/api/me` → `id`)
   verilecek; mağaza ekranındaki "Elmas Al" düğmeleri bu SDK'ya bağlanacak (bunu ben yaparım).
