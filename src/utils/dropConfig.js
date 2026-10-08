import { DEFAULT_DROP_CONFIG } from "../data/dropRules.js";
export { DEFAULT_DROP_CONFIG, DEFAULT_CHEST_WEAPON_PCT, DEFAULT_CHEST_ARMOR_PCT, DEFAULT_SPECIAL_CHEST_UNIQUE_CHANCE } from "../data/dropRules.js";
let liveConfig = null;
export function applyLiveDropConfig(config) { liveConfig = config; }
// Drop kuralları yalnızca panelden (owner.html) yayınlanan sunucu kurallarından gelir; yerel bir düzenleme yolu yoktur.
const UNSAFE_MERGE_KEYS = new Set(["__proto__", "constructor", "prototype"]);
function deepMerge(base, override) {
  if (!override || typeof override !== "object" || Array.isArray(override)) return base;
  const out = { ...base };
  for (const key of Object.keys(override)) {
    if (UNSAFE_MERGE_KEYS.has(key)) continue;
    const bv = base?.[key];
    const ov = override[key];
    out[key] = (ov && typeof ov === "object" && !Array.isArray(ov) && bv && typeof bv === "object")
      ? deepMerge(bv, ov)
      : ov;
  }
  return out;
}

export function getDropConfig() {
  if(liveConfig) return deepMerge(DEFAULT_DROP_CONFIG,liveConfig);
  return DEFAULT_DROP_CONFIG;
}

// ---- Oyunun okuma noktaları ----

// utils/monsterRewards.js#grantMonsterReward — hem normal harita
// canavarları hem Canavar Ara (Crimson Battlefront canavarlarını kullanıyor)
// bu TEK fonksiyondan geçiyor.
export function getMonsterRewardConfig(monster, map) {
  const override = getDropConfig().maps?.[map.id]?.monsters?.[monster.id];
  return {
    loot: override?.loot,
    guaranteedChests: override?.guaranteedChests ?? 1,
    guaranteedChestTier: override?.guaranteedChestTier ?? map.tier,
    goldMin: override?.goldMin ?? monster.goldMin,
    goldMax: override?.goldMax ?? monster.goldMax,
    xp: override?.xp ?? monster.xp,
    dropChance: override?.dropChance ?? map.dropChance,
    chestChance: override?.chestChance ?? map.chestChance,
  };
}

// WarzoneTab.jsx'in 6 rotasyonlu bossu için — null dönerse (hiç override
// yoksa) çağıran taraf boss'un kendi ham değerlerini kullanmaya devam eder.
export function getWarzoneBossConfig(bossId) {
  return getDropConfig().warzoneBosses?.[bossId] || null;
}

export function getWarzoneHuntConfig() {
  return getDropConfig().warzoneHunt;
}

export function getChestConfig() {
  return getDropConfig().chests;
}
