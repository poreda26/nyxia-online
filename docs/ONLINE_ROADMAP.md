# Online geçiş yol haritası

Son güncelleme: 26 Eylül 2026 — **Faz 2, 3, 4, 5 tamamlandı.**

## Durum özeti

Oyun artık gerçek bir çok-oyunculu backend'e bağlı: hesap/karakter sunucuda senkron, gerçek oyuncular birbirinin pazarını görüp alışveriş yapabiliyor, Dünya Canavarı'na birlikte vurup ortak loot havuzuna katkı yapıyor, ve gerçek başka bir oyuncunun karakterine karşı PvP düellosu yapılabiliyor. Bot/sahte oyuncuların hiçbir izi kalmadı.

## Tamamlananlar

- **Hesap/oturum/yedek API** (`server/app.mjs`) — scrypt şifre, HttpOnly oturum çerezi, IP başına rate limit.
- **Chat** gerçek backend'e bağlı (`/api/chat/messages`) — mesajlar SQLite'ta, tüm hesaplar aynı listeyi görüyor.
- **Bot/sahte oyuncular tamamen kaldırıldı**: Pazar'daki sahte satıcılar, Klan'daki sahte üyeler/rakip klanlar, Sıralama'daki sahte kayıtlar, Savaş Alanı'ndaki hayalet PvP rakipleri.
- **Faz 2 — Hesap senkronizasyonu**: girişte `GET /api/backup`'tan yükleniyor, her gerçek değişiklikte (savaş, satın alma, elmas, depo...) `PUT /api/backup` ile otomatik kaydediliyor. Çakışma (başka cihazdan yazma) durumunda en güncel sunucu verisi alınıyor. localStorage artık sadece yerel önbellek, sunucu asıl kaynak.
- **Faz 3 — Paylaşımlı Pazar**: `market_stalls` tablosu, gerçek oyuncular birbirinin tezgahını görüp satın alabiliyor. Satın alma SQLite transaction içinde atomik (aynı eşya iki kişiye satılamaz). Ödeme satıcıya (çevrimdışı olsa bile) doğrudan sunucuda, onun yedeğine ekleniyor.
- **Faz 4 — Paylaşımlı Dünya Canavarı**: `boss_fights`/`boss_contributions`/`boss_loot_claims` tabloları. Boss'un faz zamanlaması (`bossSchedule`) ve boss listesi istemci ile sunucunun **aynı dosyadan** (`src/utils/warzoneBoss.js`, `src/data/warzone.js`) geldiği tek kaynak. Hasar istemcide hesaplanıyor, sunucu akla yatkın bir üst sınırla (tek vuruş boss canının %50'sini aşamaz) kabul ediyor. Boss ölünce ödül ağırlıklı çekilişle (en çok hasar veren daha şanslı) gerçek bir katılımcıya gidiyor — o an çevrimdışıysa bile `loot-claims` ile bir sonraki girişinde teslim alıyor.
- **Faz 5 — Gerçek PvP eşleştirme**: `duel_history` tablosu, `GET /api/warzone/duel/opponent`. Asenkron model — rakip, sunucudan rastgele seçilen **gerçek** bir başka hesabın en son senkronlanmış karakter anlık görüntüsü (o an çevrimdışı olabilir, hiçbir şey kaybetmez). Düello mevcut deterministik motorla (`src/utils/duelEngine.js`, değişmedi) istemcide koşuluyor. Canlı testte doğrulandı: gerçek bir hesabın karakteri rakip olarak geldi, kazanıldı, sonuç sunucuya kaydedildi.
- Backend, arkadaşının VM'inde canlı: `https://nyxia.sametcantas.com` (Cloudflare Tunnel → Caddy → VM, systemd user servisi, kalıcı — `Linger=yes`).
- Statik dosya sunumu backend'e eklendi — frontend derlenip aynı origin'den API ile birlikte sunuluyor (cookie/CORS sorunu yok).

## Güven sınırı — dürüstçe kalan açık

Tüm fazlarda tutarlı bir ilke izlendi: **sunucu, kendi kontrol edebileceği şeyi (item transferi, boss HP, hesap kimliği) her zaman otoriter tutar; ama oyuncunun kendi karakterinin ATK/DEF/HP gibi çekirdek istatistikleri hâlâ istemcide hesaplanıyor ve sunucu bunu derinlemesine doğrulamıyor.** Somut olarak:

- Pazar'da alıcının altın düşüşü istemcide (satıcıya ödeme sunucuda, garanti).
- Boss'a verilen hasar miktarı istemcide hesaplanıp bir üst sınırla sunucuya bildiriliyor (tam yeniden hesaplama yok).
- Düellodaki National Point ödülü/cezası istemcide uygulanıyor.

Bu, oyundaki **diğer her ekonomi hareketiyle** (canavar öldürme, iksir alma, GM komutları) aynı güven seviyesinde — yani bir gerileme değil, mevcut mimarinin doğal sınırı. Tam çözüm — oyuncunun gerçek ekipman/istatistiklerinin sunucuda da bilinip doğrulanması (server-authoritative character state) — kapsamı çok büyük, ayrı bir gelecek girişim olarak kalıyor. İstenirse "Faz 6" olarak buraya eklenebilir.

## Ölçek

Mevcut VM (1 vCPU/2GB) 500-1000 kullanıcı için tüm bu fazları rahat karşılar (polling tabanlı, WebSocket'e hiç gerek kalmadı — boss/pazar paylaşımı birkaç saniyelik yenilemeyle yeterli, PvP asenkron olduğu için gerçek zamanlı çift-taraflı senkron gerektirmedi).

## Kayıtların korunması

Yedek API'si eski yerel kayıtları kaybetmeden sunucuya taşıdı — eşya kimlikleri, +seviyeleri ve tüm diğer alanlar aynen korunuyor.
