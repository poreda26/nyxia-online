import { MAPS } from "./maps.js";
import { WARZONE_BOSSES, WARZONE_HUNT_POWER_MULT, WARZONE_HUNT_GOLD_MULT, WARZONE_HUNT_DROP_MULT } from "./warzone.js";
import {buildSoloDungeonStages,buildDungeonStageChoices} from "./soloDungeon.js";
export const DEFAULT_CHEST_WEAPON_PCT = 0.46;
export const DEFAULT_CHEST_ARMOR_PCT = 0.46; // kalan (1 - weaponPct - armorPct) aksesuara gidiyor
export const DEFAULT_SPECIAL_CHEST_UNIQUE_CHANCE = 0.03;

function buildDefaultDropConfig() {
  const maps = {};
  for (const map of MAPS) {
    const monsters = {};
    for (const m of [...map.monsters,...buildSoloDungeonStages(map).flatMap((stage,i)=>stage.isBoss?[stage]:buildDungeonStageChoices(map,i))]) {
      monsters[m.id] = { goldMin: m.goldMin, goldMax: m.goldMax, xp: m.xp, dropChance: map.dropChance, chestChance: map.chestChance };
    }
    const last=map.monsters.at(-1);
    monsters[`map_boss_${map.id}`]={guaranteedChests:1,guaranteedChestTier:map.tier,goldMin:last.goldMin*3,goldMax:last.goldMax*3,xp:last.xp*3,dropChance:map.dropChance,chestChance:map.chestChance};
    maps[map.id] = { monsters };
  }
  const warzoneBosses = {};
  for (const boss of WARZONE_BOSSES) {
    warzoneBosses[boss.id] = {
      bonusGoldMin: boss.bonusGoldMin,
      bonusGoldMax: boss.bonusGoldMax,
      equipDropChance: boss.equipDropChance,
      chestDropChance: boss.chestDropChance,
      scrollDropChance: boss.scrollDropChance,
    };
  }
  return {
    maps,
    warzoneBosses,
    warzoneHunt: { powerMult: WARZONE_HUNT_POWER_MULT, goldMult: WARZONE_HUNT_GOLD_MULT, dropMult: WARZONE_HUNT_DROP_MULT },
    chests: { weaponPct: DEFAULT_CHEST_WEAPON_PCT, armorPct: DEFAULT_CHEST_ARMOR_PCT, specialUniqueChance: DEFAULT_SPECIAL_CHEST_UNIQUE_CHANCE, specialAccessoryChance: 0.01 },
  };
}

// Modül yüklenince bir kere hesaplanıyor — MAPS/WARZONE_BOSSES zaten sabit
// (module-load'da bir kere kurulan) veriler, tekrar tekrar inşa etmeye gerek yok.
export const DEFAULT_DROP_CONFIG = buildDefaultDropConfig();

