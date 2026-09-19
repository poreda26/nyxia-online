// Savaş Alanı — ayrı bir "harita" değil, ayrı bir sekme (bkz.
// components/WarzoneTab.jsx): burada seviyelenme yok, sadece Dünya Canavarı
// (herkesin vurabildiği, en çok hasarı verenin drop'u aldığı) ve açık PvP var.
export const WARZONE_UNLOCK_LEVEL = 50;

// Kapı ışınlanma ücretine (bkz. data/maps.js#GATE_TELEPORT_COST) paralel —
// Savaş Alanı'na her girişte (sekmeye her dönüşte, bkz. WarzoneTab'ın
// "entered" onay ekranı) alınan tek seferlik ışınlanma ücreti.
export const WARZONE_TELEPORT_COST = 50;

// Gerçek-zamanlı tick aralığı — hayaletlerin boss'a vurması / pusu ihtimali
// bu ritimde değerlendirilir (bkz. utils/warzoneCombat.js).
export const WARZONE_TICK_MS = 3000;

// Kullanıcı isteği: "Alan kısmındaki canavarlar sadece bosslar olacak,
// belirli bir süreyle çıkacak, kimse ne zaman çıkacağını bilmeyecek...
// 3-4 saat aralığında ortaya çıkacak... saldırmak için son 3 dakika."
// Her boss'un kendi ZAMAN DİLİMİ ("slot") takvimi var — bkz.
// utils/warzoneBoss.js#bossSchedule. Sabit bir saat yerine, her slot'un
// İÇİNDE boss'un TAM NE ZAMAN çıkacağı boss id + slot index'ten türeyen
// bir tohumla (seededRng) belirleniyor — bu yüzden hem "kimse bilmiyor"
// (her slot farklı bir an) hem de sunucu olmadan bile HERKES (aslında tek
// oyuncu) sayfayı yenilese/sekme değiştirse bile AYNI takvimi görüyor (saf
// duvar-saati fonksiyonu, hiçbir yerde saklanmıyor).
export const WARZONE_BOSS_SLOT_HOURS = 3.5; // ortalama 3-4 saatlik pencere
export const WARZONE_BOSS_FIGHT_WINDOW_MIN = 3; // aktifken saldırı süresi (dakika)

// Kullanıcı isteği: "Bosslar çıkmadan önce herkes boss odasına katılacak.
// Boss Saldırıları 3-2-1 diye geri sayımla açılacak." — boss'un gerçek
// çıkışından (spawnAt) GATHER_SECONDS kadar önce "oda" açılıyor (ghost'lar
// "toplanmış" gösteriliyor), son COUNTDOWN_SECONDS'de ise büyük bir 3-2-1
// sayacı gösteriliyor. Her ikisi de utils/warzoneBoss.js#bossSchedule'ın
// SAF fonksiyonundan türüyor, hiçbir ek state gerekmiyor.
export const WARZONE_BOSS_GATHER_SECONDS = 20;
export const WARZONE_BOSS_COUNTDOWN_SECONDS = 3;

// Alanda aynı anda kaç hayalet rakip bulunsun, biri düellodan çıkınca (ölüm
// ya da kaçış) kaç saniye sonra yenisiyle değişsin.
export const GHOST_POPULATION = 3;
export const GHOST_REPLACE_SECONDS = 20;

// Kullanıcı isteği: "Düello ararsa" (kendi seçtiği hayalete meydan okumak)
// güvenli NP yolu kalsın — Pusu artık SADECE "Canavar Ara" ile aktif
// avlanırken (bkz. WarzoneTab.jsx'in `hunt` durumu) tetiklenebiliyor,
// oyuncu boşta gezip rakip seçerken değil. Bu, "hangi rakibe gireceğimi
// seçip riskten kaçarım" sorununu ortadan kaldırıyor — asıl kazanç (ve
// asıl risk) avlanmaktan geliyor, seçici düello'dan değil.
export const AMBUSH_CHANCE_PER_TICK = 0.10;

// Canavar Ara — riskli farm yolu. Crimson Battlefront'un canavar havuzunu
// kullanıyor (bkz. WarzoneTab.jsx#huntAction, utils/monsterRewards.js'in
// opts parametresi), normal avlanmadan yüksek altın/drop oranıyla. Pusuya
// düşüp kaybedersen National Point'e ek olarak ÜSTÜNDEKİ (Depo'daki DEĞİL,
// player.gold) altının bir kısmını kaybedersin — bu yüzden risk gerçek.
// Güç/oranlar kullanıcı isteğiyle ince ayar yapılıyor, tek yerden.
//
// WARZONE_HUNT_POWER_MULT SADECE canavarın hp/atk/def'ine uygulanıyor
// (bkz. WarzoneTab.jsx#startHunt) — xp/altın/drop ÖDÜLÜ Crimson
// Battlefront'un kendi (data/maps.js'teki) taban değerlerinden geliyor,
// bilerek karıştırılmıyor: "ne kadar güçlü" ile "ne kadar ödül" ayrı ayrı
// ayarlanabilsin diye. Örn. güç çarpanını artırmak canavarı zorlaştırır
// ama WARZONE_HUNT_GOLD_MULT'a dokunmadıkça ödülü büyütmez.
export const WARZONE_HUNT_POWER_MULT = 1.5;
export const WARZONE_HUNT_GOLD_MULT = 1.5;
export const WARZONE_HUNT_DROP_MULT = 1.3;
export const WARZONE_HUNT_AMBUSH_GOLD_LOSS_PCT = 0.08;
export const WARZONE_HUNT_AMBUSH_GOLD_LOSS_CAP = 500;

// Normal canavarlara göre ~3 kat drop/sandık/parşömen şansı, artı garanti
// bonus altın — "güçlü ama drop şansı yüksek" isteğini karşılıyor.
// hp/atk/def artık üçü de data/maps.js'teki T6 (Crimson Battlefront, en
// zorlu basamak) ile AYNI çarpanları kullanıyor — Dünya Canavarı endgame'in
// bir parçası, oyuncunun ATK/HP/DEF formülleri KO'nun gerçek modeline
// geçtikten sonra (bkz. utils/player.js) eski düz 2.5x'ler artık ne
// oyuncuyu tehdit ediyor ne de dengeli düşüyordu.
const WORLD_BOSS_ATK_MULT = 3.0;
const WORLD_BOSS_HP_MULT = 0.25;
const WORLD_BOSS_DEF_MULT = 3.8;
// Kullanıcı isteği: "T6 itemler sadece Savaş Alanı Bossları'ndan düşecek."
// — normal haritalar (Abyssal Pit/Crimson Battlefront) hâlâ tier 5'te
// tavanlı (bkz. data/maps.js'in üstündeki not), Canavar Ara da Crimson
// Battlefront'un (tier 5) canavarlarını kullanıyor — bu yüzden lootTier'ı
// 6'ya çekmek T6'yı GERÇEKTEN sadece bu 6 boss'a özgü kılıyor (GM'in
// /silah ve Özel Etkinlik Sandığı yolları hariç, onlar zaten oyuncuya
// açık bir "drop" değil, geliştirme/etkinlik araçları).
const BASE_BOSS_STATS = {
  hp: Math.round(7360 * WORLD_BOSS_HP_MULT),
  atk: Math.round(81 * WORLD_BOSS_ATK_MULT),
  def: Math.round(68 * WORLD_BOSS_DEF_MULT),
  lootTier: 6,
  bonusGoldMin: 300,
  bonusGoldMax: 550,
  equipDropChance: 0.45,
  chestDropChance: 0.15,
  scrollDropChance: 0.18,
};

// Kullanıcı isteği: "5-6 adet farklı bossumuz olacak" — güç/loot oranları
// şimdilik hepsinde AYNI (BASE_BOSS_STATS'ten kopyalanıyor, sadece kimlik/
// renk farklı) çünkü kullanıcı "bosslar ve dropların hepsi için az sonra
// farklı bir şey isteyeceğim" dedi — asıl ayarlama sonraki turda. name Türkçe
// kalıyor (monster/quest adlarıyla aynı desen), İngilizcesi i18n/sections/
// monsters.js'te id'ye göre aranıyor (bkz. LanguageContext.jsx#tm).
//
// Kullanıcı isteği: "Bosslar'ı da İsmine uygun diğer canavarlarımızın
// görüntülerinden alabilirsin" — kendi çizilmiş sanatları olmadığı için
// (haritaların canavar listesinde yoklar) `visualSourceId`, ismine en
// yakın DÜŞEN gerçek bir haritadaki canavarın ID'sini gösteriyor (bkz.
// data/battleVisuals.js#battleVisualFor — visualSourceId varsa id yerine
// onunla eşleşiyor). WarzoneTab.jsx BattleScene'i çağırırken ayrıca
// "2-3 kat daha büyük" isteğini enemyScale ile karşılıyor.
export const WARZONE_BOSSES = [
  { id: "meydan_cellati", name: "Meydan Cellâdı", color: "#C9425A", visualSourceId: "kizil_muhafiz", ...BASE_BOSS_STATS },
  { id: "kan_imparatoru", name: "Kan İmparatoru", color: "#8B6FC9", visualSourceId: "karanlik_cagirici", ...BASE_BOSS_STATS },
  { id: "golge_efendisi", name: "Gölge Efendisi", color: "#4FC3D9", visualSourceId: "golge_vaizi", ...BASE_BOSS_STATS },
  { id: "alev_tanrisi", name: "Alev Tanrısı", color: "#D4AF6A", visualSourceId: "alev_cellati", ...BASE_BOSS_STATS },
  { id: "buz_krali", name: "Buz Kralı", color: "#5FA8A0", visualSourceId: "don_devi", ...BASE_BOSS_STATS },
  { id: "kaos_avatari", name: "Kaos Avatarı", color: "#E8A5AF", visualSourceId: "kaos_iblisi", ...BASE_BOSS_STATS },
];

// Kullanıcı isteği: "1v1'ler otomatik savaş olacak. Karşılıklı olarak
// otomatik savaşacaklar. Kazanan bu şekilde adil ortaya çıkacak." — bu
// yüzden düellolarda artık manuel beceri/pot seçimi yok (bkz.
// WarzoneTab.jsx#runDuelTurn), eski PVP_SKILLS kiti kaldırıldı.
