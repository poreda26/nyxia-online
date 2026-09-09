import { rand, uid } from "./random";
import { rollLoot } from "./loot";
import { xpToNext, xpLevelPenaltyMultiplier, MAX_LEVEL, playerMaxHp, playerMaxMp } from "./player";
import { addItemToInventory } from "./inventory";
import { premiumExpMultiplier, premiumDropMultiplier } from "./premium";
import { clanExpMultiplier } from "./clan";
import { eventExpMultiplier } from "./events";
import { learnFreeSkills } from "./skills";
import { MONSTER_QUESTS } from "../data/quests";
import { registerDailyKill, ensureDailyQuestsFresh } from "./dailyQuests";
import { DAILY_QUEST_SLOTS } from "../data/dailySystems";

// Called exactly once per defeated monster, outside React state updaters.
// Shared by the original panel battles and the real-time world.
function pickDropTier(tier) { return Math.random() < 0.5 ? tier : Math.max(1, tier - 1); }
export function grantMonsterReward(p, m, map) {
  const expMult = premiumExpMultiplier(p) * clanExpMultiplier(p) * eventExpMultiplier(p);
  const dropMult = premiumDropMultiplier(p);
  let np = { ...p, inventory: [...p.inventory], chests: [...p.chests], monsterKills: { ...p.monsterKills } };
  const killsBefore = np.monsterKills[m.id] || 0;
  np.monsterKills[m.id] = killsBefore + 1;
  const goldGain = rand(m.goldMin, m.goldMax);
  const levelPenalty = xpLevelPenaltyMultiplier(p.level, map.levelMax);
  const xpGain = p.level >= MAX_LEVEL ? 0 : Math.round(m.xp * expMult * levelPenalty);
  np.gold += goldGain;
  np.xp += xpGain;

  let drops = [`+${goldGain} altın`];
  if (xpGain > 0) drops.push(`+${xpGain} XP`);

  const relatedQuest = MONSTER_QUESTS.find((q) => q.monsterId === m.id);
  if (relatedQuest && !(p.claimedQuests || []).includes(relatedQuest.id)) {
    const current = np.monsterKills[m.id];
    if (current >= relatedQuest.target) {
      if (killsBefore < relatedQuest.target) {
        drops.push("Görev tamamlandı! Kaptan'ın yanına uğra.");
      }
    } else {
      drops.push(`Görev: ${current}/${relatedQuest.target}`);
    }
  }

  const freshNp = ensureDailyQuestsFresh(np);
  const dailyKillsBefore = freshNp.dailyQuests.killsToday;
  np = registerDailyKill(freshNp);
  DAILY_QUEST_SLOTS.forEach((slot) => {
    const wasDone = dailyKillsBefore >= slot.target;
    const isDone = np.dailyQuests.killsToday >= slot.target;
    if (isDone && !wasDone) {
      drops.push(`Günlük görev tamamlandı! (${slot.target} öldürme)`);
    }
  });

  if (Math.random() < map.dropChance * dropMult) {
    const dropTier = pickDropTier(map.tier);
    const item = rollLoot(dropTier);
    if (item) {
      const addResult = addItemToInventory(np, item);
      np = addResult.player;
      if (addResult.added) np.hasNewItemNotice = true;
      const kindLabel = item.kind === "weapon" ? "Silah" : item.kind === "accessory" ? "Aksesuar" : "Zırh";
      drops.push(addResult.added ? `${kindLabel} düştü: ${item.name}` : `${item.name} düştü ama ${addResult.reason}`);
    }
  }
  if (Math.random() < map.chestChance * dropMult) {
    const chestTier = pickDropTier(map.tier);
    const chest = { id: uid(), tier: chestTier };
    np.chests.push(chest);
    drops.push(`Sandık düştü! (T${chestTier})`);
  }

  let leveled = false;
  let levelsGained = 0;
  while (np.level < MAX_LEVEL && np.xp >= xpToNext(np.level)) {
    np.xp -= xpToNext(np.level);
    np.level += 1;
    np.statPoints += 3;
    levelsGained += 1;
    leveled = true;
  }
  if (np.level >= MAX_LEVEL) np.xp = 0; // nothing left to carry toward
  np.hp = playerMaxHp(np);
  np.mp = playerMaxMp(np);
  if (leveled) {
    drops.push(`Seviye atladın! Lv.${np.level} (+${levelsGained * 3} statü puanı)`);
  }
  np = learnFreeSkills(np);
  return { player: np, msg: drops.join("  ·  "), tone: leveled ? "level" : "loot" };
}
