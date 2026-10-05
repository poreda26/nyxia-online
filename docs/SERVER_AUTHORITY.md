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
| 2.0 | **Motor**: paylaşılan oyun mantığı paketi, `POST /api/game/act`, hesap başına sunucu ekonomisi bayrağı, istemci `act()` katmanı (bayrak kapalıyken aynı kurallar yerelde) | Yapıldı (bayrak kapalı) |
| 2a | **Altın + envanter + depo**: kuşan/çıkar/sat/onar/depo/sandık/takviye parşömeni eylemleri | Envanter sekmesi yapıldı; dükkânlar, yükseltme, ırk/sınıf parşömeni, elmas mağazası eşyaları sırada |
| 2b | **Yükseltme**: zarı sunucu atar, parşömen tüketimi sunucuda | Normal savaş + zindan + kapı yapıldı (battle/start, kill, death, retreat, potion, dungeonEntry, map/teleport); Savaş Alanı avı/boss ve dünya motoru sırada |
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

## Faz 2: ekonomi motoru (nasıl çalışıyor)

- `src/game/actions.js`: oyun kuralları. Her eylem `(state, payload) -> { state, result }`; eşyalar
  kimlikle bulunur, istemcinin gönderdiği nesneye güvenilmez. Aynı dosya iki yerde çalışır.
- `scripts/build-game-logic.mjs` (`npm run build:logic`): kuralları ve kullandığı saf fonksiyonları
  `server/game-logic.generated.mjs` içine paketler. Paket depoda durur; `tests/game-logic.test.mjs`
  eskiyse testi düşürür. Kurallar değişince `npm run build:logic` çalıştırıp sunucuya birlikte yükle.
- `server/game.mjs`: hesap bayrağı (`economy_accounts`; `server/set-economy.mjs hesap [kapat]` ya da
  sunucuda `ECONOMY_FOR_ALL=1`), eylem uygulama (tek transaction) ve yedek sabitleme. Bayrak açıkken
  altın / çanta / kuşanılanlar / sandıklar / depo / depo altını istemcinin yedeğinden değil sunucudan gelir;
  yeni karakterin başlangıç ekonomisini kurallar belirler. Sunucuda rastgelelik kriptografik kaynaktan.
- `src/game/client.js`: bileşenler `act(tip, yük)` çağırır. Bayrak kapalıysa kurallar istemcide çalışır
  (davranış değişmez), açıksa sunucuya gider ve dönen yama (yalnızca değişen alanlar) yansıtılır.
- Bayrak, tüm ekonomi yolları (kazanç + harcama) dönüştürülene kadar HERKES için kapalı kalır; aksi halde
  henüz dönüştürülmemiş istemci yolları sunucu tarafından geri alınırdı.

Dönüştürülmeyi bekleyen ekonomi yolları: canavar / sandık / görev / koleksiyon / günlük ödülleri (kaynaklar),
NPC dükkânı ve iksirler, yükseltme (UpgradeTab), takı yükseltme, pazar, ırk/sınıf parşömeni, elmas mağazası
eşya teslimleri, klan bağışları, beceri öğrenme, stat sıfırlama, ölüm cezası.


## Faz 3a: savaş gelirleri (yapıldı: normal savaş)

Eylemler `src/game/battle.js`: `battle/start` (savaşı bildirir; kilitli canavar, yanlış harita, zindan sırası denetlenir),
`battle/kill` (canavar kimlikten verilerden kurulur; ödül `grantMonsterReward` ile verilir; bildirimden en az 700 ms
geçmeli, bir savaş bir kez öder), `battle/death`, `battle/retreat`, `battle/potion`, `map/teleport`, `battle/dungeonEntry`.
Silah/zırh aşınması savaş sonunda tek raporla gelir (en fazla 1500 vuruş). Sunucu, her eylemden önce sahibin yayınladığı
canlı drop kurallarını uygular.

Bayrak AÇILMADAN önce kapanması gereken pin listesi (sunucu bu alanları yedekten geri çevirmeli):
`xp, level, statPoints, monsterKills, mapBoss, soloDungeon, dungeonRun, fight, boosts, eventExpBonus, currentMapId`
(+ görev/beceri/NP alanları 3b'de). `eventExpBonus` bugün GM komutuyla istemcide yazılıyor; sunucu komutuna taşınmalı.

### Savaş Alanı (yapıldı)
`warzone/enter` (giriş ücreti), `warzone/bossLoot` (hak sunucudaki `boss_loot_claims` satırıdır; boss kimliği ondan
alınır, satır aynı işlemde silinir), `warzone/huntSearch` → `huntStart` → `huntKill` (arama süresi + savaş bildirimi +
asgari süre), `warzone/leave`. Av/boss ölümü ve potu `battle/death` ve `battle/potion` ile gider.
Düello NP/kupa sonuçları 3c'de. `src/world/engine.js` (WorldTab) hiçbir yerde bağlı değil: ölü kod, taşınmadı.
Pin listesine eklenecek: `warzone, huntSearch`.

### Kaptan, günlük ödüller, çark, etkinlik, rehber (yapıldı)
`src/game/progress.js`: `captain/quest|awaken|daily|weekly|book|buyNp`, `dailyLogin/claim`, `wheel/claimItem`,
`event/join|credit`, `tutorial/gift|topUp`. `server/game.mjs` "kanca" (hooks) düzeni: hak kaynağı sunucuda olan
eylemlerde (boss hakkı, günlük giriş cüzdan kaydı, çarkın bekleyen ödülü) istemcinin yolladığı veri sunucudaki kayıtla
değiştirilir ve kayıt aynı işlemde tüketilir. Gün sınırı artık herkes için İstanbul (`utils/day.js`, `utils/week.js`).
Pin listesine eklenecek: `dailyLogin, dailyQuests, weeklyQuests, claimedQuests, claimedCollections, awakened,
scheduledEvents, tutorialGift, wheelAppliedAt, nationalPoint, weeklyPoint`.

### Dükkân + yükseltme (yapıldı)
`src/game/upgrade.js`: `shop/buyScroll|buyAccessoryScroll`, `forge/stageItem|returnItem|stageScroll|returnScroll|stageBonus|returnBonus|clear|press`,
`accessory/stageItem|returnItem|stageScroll|returnScroll|clear|press`. Forge'a konanlar çantadan gerçekten çıkıp
`player.forge` / `player.accForge` alanında durur (sekme kapanınca `clear` ile geri döner); zar sunucuda atılır.
Pin listesine eklenecek: `forge, accForge`.
Kontrol aracı: tanımsız isim yakalamak için `eslint` + `no-undef` kuralı (bkz. oturum scratchpad'i) src'de temiz çalışır.

### Pazar, iksir dükkânı, klan (yapıldı)
`src/game/market.js`: `shop/buyPotion`, `market/openStall|addItem|buy|takeBack` (tezgah satırı `market_stalls` sunucu kancalarıyla aynı
işlemde yazılır; satıcıya ödeme satıcının depo altınına; çanta doluysa satın alma reddedilir, eşya kaybolmaz).
`src/game/clan.js`: `clan/donate` (altın/NP/malzeme; elmas hâlâ cüzdan yolundan), `clan/leave` (iade gerçek bağış toplamından),
`clan/claimMaterials` (klan zindanı düşenleri `pending_grants` tablosuna yazılır, eylemle verilir). Bayrak açıkken eski
pazar-yazma uçları, altın/malzeme bağışı ve klan ayrılma ucu 409 `USE_GAME_ACT` döner.
Klan zindanı potu/ölümü `battle/potion` ve `battle/death` ile gider. Yerel mod (bayrak kapalı) pazar/klan için eski uçları kullanır.

### Elmas mağazası teslimleri, statü, beceri (yapıldı)
`src/game/diamonds.js`: `diamond/buy` (kancası cüzdan tahsilatını `spendInTransaction` ile aynı işlemde yapar; premium hakkı da orada
verilir; teslim başarısız olursa — çanta dolu, günlük sınır vb. — işlem geri alınır, elmas düşmez). Türler: premium, wings,
bonusScroll, raceScroll, jobScroll, dungeonEntry, bankPage, boostPack. Boya/avatar/çerçeve/3. slot hâlâ `/api/wallet/spend` hak yolundan.
`src/game/character.js`: `stat/allocate` (basılı tutma 250 ms'de tek istekte yığınlanır), `stat/respec`, `skill/learn`,
`skill/loadout`, `title/set`. Pin listesine eklenecek: `stats, statPoints, skills, activeTitle, premium (zaten), unlockedSlots (zaten)`.
Kalan: ırk/meslek parşömeni KULLANIMI (envanterde kullanım eylemi), yeni karakter oluşturma, pin listesi + bayrak.

### Düello, hafta geçişi, parşömen kullanımı, GM araçları, pin listesi (yapıldı)
- `src/game/duel.js`: `duel/start` (rakip + tohum sunucudan; bırakılan önceki düello yenilgi), `duel/resolve` (sonucu sunucu AYNI motorla
  kendisi hesaplar: kazanma NP+, kayıp NP-), `duel/concede`, `week/rollover` (hafta geçişi; bekleyen elmas talebini sunucu yazar ve
  `/api/wallet/weekly-rank` talebi artık istemciden değil sunucudaki bekleyen talepten okur). Rakip yalnızca düello alanlarıyla gelir.
- `src/game/character.js`: `scroll/job`, `scroll/race` (ırk hesap geneli; sunucu bütün karakterlere yazar).
- `src/game/gm.js`: `gm/exec|give|clearInventory|giveAllChests` (yetki sunucuda `admin.isGm`).
- Pin listesi (`server/game.mjs` ECONOMY_FIELDS) tamamlandı: altın/envanter/kuşanılan/sandık + seviye, XP, statü, beceri, sınıf, öldürme sayaçları,
  görevler, günlük/haftalık sayaçlar, harita, zindan, forge, güç takviyeleri, NP/haftalık puan. Yeni (sunucuda kaydı olmayan) karakterin bu alanları
  kuralların başlangıç karakterinden alınır; ırk sunucudaki hesap değerine sabitlenir.
- Bayrağı açmak: `DATABASE_PATH=... node server/set-economy.mjs <hesap>` (tek hesap) → test → sunucuda `ECONOMY_FOR_ALL=1`.

### Akıcılık (iyimser eylemler) ve en düşük istemci sürümü
- `src/game/client.js`: sunucu yolunda sonucu önceden bilinen eylemler (`OPTIMISTIC_ACTIONS`: çanta, onarım, depo, pot, statü, forge yerleştirme,
  dükkân...) aynı saf kuralla önce yerelde uygulanır, ekran hemen güncellenir; onay sırayla arkadan gider. Sunucu reddederse ya da ağ
  kopuksa sunucudaki gerçek durum yüklenir (`resync`) ve "işlem yapılamadı" uyarısı çıkar. Rastgele/sunucu verili eylemler sonucu beklemeye devam eder.
  Savaşta ölüm/öldürme isteği canavar ölür ölmez gider (animasyon beklenmez).
- En düşük istemci sürümü: `src/version.js` CLIENT_BUILD (şu an 1) her istekte `X-Client-Build` ile gider. Sunucu `app_config.min_build`
  (ya da `MIN_CLIENT_BUILD` ortam değişkeni) daha büyükse 426 `CLIENT_OUTDATED` döner; uygulama "Güncelleme gerekli" ekranı açar.
  Ayar: `DATABASE_PATH=... node server/set-min-build.mjs <build> [güncelleme-bağlantısı]` (0 = kapalı). Sağlık, sahip paneli ve ödeme servisi muaftır.
  Eski APK'lar başlığı hiç göndermediği için min_build ≥ 1 olunca bloklanır. Kural/API değişince CLIENT_BUILD'i artırıp min_build'i ona çek.

### Savaşın kendisi sunucuda (yapıldı: normal savaş + solo zindan)
`src/game/fight.js`: tohumlu, saf savaş motoru (`createFight`, `stepFight`, `replayFight`). `battle/start` sunucu tohumu verir; istemci savaşı bu motorla
oynar (anında geri bildirim) ve bitince eylem dizisini `battle/settle` ile gönderir. Sunucu savaşı baştan oynatır; sonuç (kazan/öl/geri çekil),
ödül, silah/zırh aşınması ve harcanan potlar sunucunun hesabıdır. Süre tabanı: tur başına 300 ms (1,5 sn ağ payı düşülür). İstemcinin hasar/ödül/aşınma
söylemesi kalmadı; `battle/kill` kaldırıldı. CLIENT_BUILD = 2.
Henüz bu motora geçmeyenler (sınırlı hile payı): Canavar Ara avı (`warzone/huntKill` yalnızca süre denetler), Dünya Canavarı hasarı ve klan zindanı
hasarı (istemci hasarı yollar, sunucu üst sınır koyar).

### Av ve paylaşımlı hedefler (yapıldı)
- Canavar Ara avı da aynı savaş motoruyla: `warzone/huntStart` tohum verir, `warzone/huntSettle` eylem dizisini baştan oynatır (kazan/öl/geri çekil, ödül, aşınma, potlar).
  `warzone/huntKill` kaldırıldı. CLIENT_BUILD = 3.
- Dünya Canavarı ve klan zindanı: tek istek hasarı, hesabın karakterlerinin yapabileceği EN YÜKSEK hasarla sınırlı (`maxActionDamage`, şanslı zar + kritik + beceri +
  en iyi güçlendirme varsayılır) ve hesap başına en az 450 ms vuruş aralığı vardır. Bu tam benzetim değil ama hileli devasa vuruşları ve saniyede onlarca vuruşu keser.
