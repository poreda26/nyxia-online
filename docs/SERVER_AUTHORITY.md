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
| 1b | **Hak sahipliği**: premium (satın alınan + çark), açılan karakter slotları, açılan boya/avatar/çerçeve, günlük seri | Sırada |
| 1c | **Ödeme**: Apple/Google makbuz doğrulama → elmas kredisi (mağaza öncesi şart) | Sırada |
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
