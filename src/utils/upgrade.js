// T6 eklendi — Yükseltme Ustası'nın parşömen tezgahı gerçek T6 eşyalar
// (Giantic Axe, Eagle's Eye vb., bkz. data/warriorWeapons.js, rogueWeapons.js)
// eklenmeden ÖNCE yazılmıştı, tezgah hâlâ T1-T5'te duruyordu — bug testinde
// bulundu: bir oyuncu %3 şansla bir T6 eşsiz eşya düşürse bile onu ASLA
// yükseltemiyordu (harita/dünya canavarı loot tier'ı da 5'te tavanlanıyor,
// bkz. data/maps.js, data/warzone.js#WORLD_BOSS.lootTier). Fiyat, mevcut
// x5/x2 dönüşümlü artış desenine uyuyor (1000*5).
const SCROLL_PRICES = { 1: 10, 2: 50, 3: 100, 4: 500, 5: 1000, 6: 5000 };
export function scrollPrice(tierId) { return SCROLL_PRICES[tierId] ?? 0; }

export const MAX_UPGRADE_LEVEL = 8;

// Hidden from players — chance to advance from `level` to `level + 1` on a
// press. A failed press destroys both the staged item and the scroll, so
// the odds get harsher the higher the item already is.
const UPGRADE_CHANCE = {
  0: 1, // +0 -> +1
  1: 1, // +1 -> +2
  2: 1, // +2 -> +3
  3: 0.9, // +3 -> +4
  4: 0.75, // +4 -> +5
  5: 0.5, // +5 -> +6
  6: 0.25, // +6 -> +7
  7: 0.08, // +7 -> +8
};

// Bonus Parşömen's real effect when staged alongside the normal tier scroll
// (see components/UpgradeTab.jsx) — a full replacement chance table, not an
// add-on to UPGRADE_CHANCE. Deliberately never surfaced to players as exact
// numbers (see UpgradeTab's preview, which shows no percentage at all when
// a bonus scroll is active) — the item's own description just says it
// "increases the upgrade chance," nothing more specific than that.
const BONUS_SCROLL_CHANCE = {
  0: 1, 1: 1, 2: 1, 3: 1, 4: 1, // +0 through +5: guaranteed
  5: 0.65, // +5 -> +6
  6: 0.35, // +6 -> +7
  7: 0.15, // +7 -> +8
};

export function upgradeSuccessChance(level, useBonusScroll = false) {
  return useBonusScroll ? (BONUS_SCROLL_CHANCE[level] ?? 0) : (UPGRADE_CHANCE[level] ?? 0);
}

// Pure stat math for one upgrade step — used both to actually apply a
// successful press and to render the "Dene" preview without touching state.
// Only used for items WITHOUT authored per-level data (see statsAtLevel
// below) — a ×1.18 approximation, not real numbers.
export function bumpedStats(item) {
  return {
    atk: item.atk ? Math.round(item.atk * 1.18) : 0,
    def: item.def ? Math.round(item.def * 1.18) : 0,
    hp: item.hp ? Math.round(item.hp * 1.18) : 0,
    mp: item.mp ? Math.round(item.mp * 1.18) : 0,
  };
}

// Bazı eşyalar (gerçek KO ekran görüntülerinden birebir girilmiş) artık
// +1'den +10'a kadar HER seviyenin gerçek değerlerini kendi üzerinde
// `levels` dizisi olarak taşıyor — bumpedStats'ın ×1.18 TAHMİNİ yerine
// gerçek sayılar. `level` 1-tabanlı (upgradeLevel ile aynı). Dizinin
// sonundan taşarsa (henüz o kadar seviye girilmemiş bir eşya) son bilinen
// seviyede kilitli kalır. Oyuncunun asıl forge sistemi hâlâ
// MAX_UPGRADE_LEVEL'da (+8) duruyor — +9/+10 verisi burada GM'in önceden
// test edebilmesi ve ileride sınırı yükselttiğimizde hazır olması için var.
export function statsAtLevel(item, level) {
  const levels = item.levels;
  if (!levels || levels.length === 0) return null;
  const idx = Math.min(Math.max(level, 1), levels.length) - 1;
  return levels[idx];
}

// `levels` taşıyan bir eşyayı verilen seviyeye göre yeniden kurar — atk/
// def/hp/mp/statBonus/reqStats/elementBonus/resistances, hepsi o seviyenin
// gerçek satırından. weight/attackSpeed gibi HER zaman sabit kalan alanlar
// şablon kökünde kalır (bkz. utils/loot.js#buildWeaponFromTemplate),
// seviyeye göre değişmez. Durability bazı eşyalerde (Giantic Axe) sabit,
// bazılarında (Glave) seviyeyle büyüyor — satırda varsa o kazanır, yoksa
// eşyanın mevcut (kök seviyeden gelen) değeri korunur; ikisinde de eşya
// her zaman tam dayanıklılıkla kurulur (currentDurability = durability).
export function applyLevelData(item, level) {
  const data = statsAtLevel(item, level);
  if (!data) return item;
  const durability = data.durability ?? item.durability;
  return {
    ...item,
    atk: data.atk ?? 0,
    def: data.def ?? 0,
    hp: data.hp ?? 0,
    mp: data.mp ?? 0,
    elementBonus: data.elementBonus ?? item.elementBonus ?? null,
    // `elements` — tek bir `element`/`elementBonus` yerine BİRDEN FAZLA
    // element hasarı birden taşıyan eşyalar için (bkz. data/casterWeapons.js
    // #Staff of <selfname>/Ron's Staff, "hem glacier hem lightning hem de
    // flame" isteği) — [{ key, bonus }, ...] şeklinde, ItemTooltip'te
    // `item.element` tekilinin yanında ayrıca render ediliyor.
    elements: data.elements ?? item.elements ?? null,
    statBonus: data.statBonus ?? item.statBonus ?? null,
    reqStats: data.reqStats ?? item.reqStats,
    resistances: data.resistances ?? null,
    itemGrade: data.itemGrade ?? null,
    durability, currentDurability: durability,
    upgradeLevel: level,
  };
}
