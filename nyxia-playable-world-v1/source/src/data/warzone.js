// Savaş Alanı — ayrı bir "harita" değil, ayrı bir sekme (bkz.
// components/WarzoneTab.jsx): burada seviyelenme yok, sadece Dünya Canavarı
// (herkesin vurabildiği, en çok hasarı verenin drop'u aldığı) ve açık PvP var.
export const WARZONE_UNLOCK_LEVEL = 50;

// Kapı ışınlanma ücretine (bkz. data/maps.js#GATE_TELEPORT_COST) paralel —
// Savaş Alanı'na her girişte (sekmeye her dönüşte, bkz. WarzoneTab'ın
// "entered" onay ekranı) alınan tek seferlik ışınlanma ücreti.
export const WARZONE_TELEPORT_COST = 50;

// Boss ölünce ~bu kadar saniye sonra yeniden doğar.
export const WORLD_BOSS_RESPAWN_SECONDS = 30;

// Gerçek-zamanlı tick aralığı — hayaletlerin boss'a vurması / pusu ihtimali
// bu ritimde değerlendirilir (bkz. utils/warzoneCombat.js).
export const WARZONE_TICK_MS = 3000;

// Alanda aynı anda kaç hayalet rakip bulunsun, biri düellodan çıkınca (ölüm
// ya da kaçış) kaç saniye sonra yenisiyle değişsin.
export const GHOST_POPULATION = 3;
export const GHOST_REPLACE_SECONDS = 20;

// Meşgul değilken (ne boss'a vuruyor ne düellodaysa) her tick'te bir
// hayaletin pusu kurma (Model A "Baskın") ihtimali.
export const AMBUSH_CHANCE_PER_TICK = 0.10;

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
export const WORLD_BOSS = {
  id: "meydan_cellati",
  name: "Meydan Cellâdı",
  hp: Math.round(7360 * WORLD_BOSS_HP_MULT),
  atk: Math.round(81 * WORLD_BOSS_ATK_MULT),
  def: Math.round(68 * WORLD_BOSS_DEF_MULT),
  lootTier: 5,
  bonusGoldMin: 300,
  bonusGoldMax: 550,
  equipDropChance: 0.45,
  chestDropChance: 0.15,
  scrollDropChance: 0.18,
};

// Evrensel PvP beceri kiti — sınıf/seviye farketmeksizin Savaş Alanı'na
// giren herkeste aynı, mevcut data/warriorSkills.js vb. ile aynı
// {id, name, mpCost, cooldown, effect} şeklini paylaşır ama questTier/gold
// gerektirmez (her zaman kullanılabilir).
export const PVP_SKILLS = [
  { id: "pvp_stun", name: "Sersemlet", mpCost: 8, cooldown: 3, effect: { type: "stun" } },
  { id: "pvp_flee", name: "Kaç", mpCost: 0, cooldown: 1, effect: { type: "flee", chance: 0.5 } },
  { id: "pvp_manaburn", name: "Mana Çalma", mpCost: 12, cooldown: 3, effect: { type: "suppressHeal" } },
];
