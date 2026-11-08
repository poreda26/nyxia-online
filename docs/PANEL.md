# Sahip paneli rehberi (panel.nyxiaonline.com)

Giriş: sahip hesabıyla (`panel:true` ile). Moderatörler de aynı adresten girer ama yalnızca izinli sekmeleri görür.

## Sekmeler
| Sekme | Ne işe yarar | Kim |
|---|---|---|
| Genel bakış | Hesap, aktif oyuncu, klan, tezgâh, açık şikayet/talep sayıları | sahip, moderatör |
| İstatistik ve sağlık | Günlük/haftalık aktif oyuncu, yeni kayıtlar, reklam izleme ve ödenen elmas, dolaşımdaki elmas, yaş grupları, elmas hareketleri, sunucu sağlığı (çalışma süresi, bellek, disk, son yedek), yüksek bakiye izleme, satın almalar | sahip |
| Hediye ve posta | Tek oyuncuya ya da herkese elmas, altın, premium kuponu, parşömen ve mesaj gönderir. Oyuncu oyunda üstteki zarf simgesinden alır. | sahip |
| Duyuru ve bakım | Ekranın üstünde duyuru çubuğu (TR/EN, süreli), bakım modu (oyuncuları çıkarır), en düşük istemci sürümü | sahip |
| Duyuru e-postası | Duyuru izni veren, e-postası doğrulanmış, 18+ oyunculara toplu e-posta; izinli listeyi CSV indirir | sahip |
| Yetkililer ve araçlar | Moderatör ekle/çıkar; yaş yüzünden kilitli hesapları düzelt | sahip |
| Oyuncular | Kayıt inceleme/düzenleme/geri yükleme, ban, susturma, GM verme; hesap kurtarma (e-posta değiştir/sil, geçici şifre, doğum tarihi) | sahip (moderatör: yalnızca susturma) |
| Drop ve sandıklar, Pazar, Düellolar, İşlem geçmişi | Ekonomi ayarları ve denetim | sahip (Ban/mute, Sohbet, Şikayetler, Klanlar, Pazar, Düellolar, Destek talepleri moderatöre de açık) |

## Güvenlik sınırları
- Hediye üst sınırı (tek oyuncu): 10.000 elmas, 5.000.000 altın, en çok 5 kupon, 50 parşömen. Herkese: 1.000 elmas, 1.000.000 altın, 2 kupon, 10 parşömen ve onay için `HERKES` yazılır.
- Her yönetim işlemi gerekçesiyle "İşlem geçmişi"ne yazılır; gerekçesiz işlem yapılmaz.
- Duyuru e-postası: 13 yaş altı ve 18 yaş altına, izin vermeyene gönderilmez. Onay için `GONDER` yazılır. Resend ücretsiz plan günde 100 e-posta; fazlası "Devam et" ile ertesi gün.
- Geçici şifre bir kez gösterilir; eski şifre geçersiz olur ve oturumlar kapanır.
- Bakım modu: sahip ve moderatörler panelde çalışmaya devam eder. Oyuncular `503 MAINTENANCE` alır ve bakım ekranını görür.
- En düşük istemci sürümünü yükseltmeden önce yeni sürümün mağazada yayında olduğundan emin ol.

## Teknik not
Sunucu kodu: `server/ops.mjs` (posta, duyuru, istatistik, sağlık, e-posta, kurtarma), `server/admin.mjs` (yollar ve roller). Posta ödülü oyunda `mail/claim` eylemiyle (`src/game/community.js`) teslim edilir; elmas sunucu kasasından verilir.
