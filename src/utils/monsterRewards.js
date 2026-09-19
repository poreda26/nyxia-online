import { rand, uid } from "./random";
import { rollMapLoot } from "./loot";
import { xpToNext, xpLevelPenaltyMultiplier, MAX_LEVEL, playerMaxHp, playerMaxMp, clampGold, formatGold } from "./player";
import { addItemToInventory } from "./inventory";
import { premiumExpMultiplier, premiumDropMultiplier } from "./premium";
import { clanExpMultiplier } from "./clan";
import { eventExpMultiplier } from "./events";
import { boostMultiplier } from "./boosts";
import { learnFreeSkills } from "./skills";
import { MONSTER_QUESTS } from "../data/quests";
import { registerDailyKill, ensureDailyQuestsFresh } from "./dailyQuests";
import { DAILY_QUEST_SLOTS } from "../data/dailySystems";
import { registerWeeklyKill } from "./weeklyQuests";
import { registerMapBossDefeat, canFightMapBoss } from "./mapBoss";
import { MAPS } from "../data/maps";
import { getMonsterRewardConfig } from "./dropConfig";

// Called exactly once per defeated monster, outside React state updaters.
// Shared by the original panel battles and the real-time world.
function pickDropTier(tier) { return Math.random() < 0.5 ? tier : Math.max(1, tier - 1); }
// opts: { goldMult, dropMult } — isteğe bağlı EK çarpanlar (varsayılan 1),
// premium/boost parşömenlerinin üstüne biniyor. Savaş Alanı'nın "Canavar
// Ara" riskli farm yolu (bkz. components/WarzoneTab.jsx) bunu normal
// avlanmadan yüksek altın/drop oranı vermek için kullanıyor — bu fonksiyonun
// kendisi ne çağrıldığı yeri ne de "warzone" kavramını biliyor, sadece
// çarpanları alıp uyguluyor.
export function grantMonsterReward(p, m, map, opts = {}) {
  if(m.mapBoss&&!canFightMapBoss(p,map.id).ok)return {player:p,drops:null,blockedReasonKey:'battle.bossDefeatedToday',tone:'warn'};
  // Kullanıcı isteği: "Tüm dropları düzenleyebileceğim bir sistem" —
  // altın/xp/eşya-şansı/sandık-şansı artık m/map'in kendi ham alanları
  // yerine bkz. utils/dropConfig.js'den okunuyor (admin.html'de bir
  // override yoksa aynen m/map'in ham değerlerine düşüyor, davranış değişmez).
  const rewardCfg = getMonsterRewardConfig(m, map);
  const expMult = premiumExpMultiplier(p) * clanExpMultiplier(p) * eventExpMultiplier(p) * boostMultiplier(p, "exp");
  const dropMult = premiumDropMultiplier(p) * (opts.dropMult ?? 1);
  const goldMult = boostMultiplier(p, "gold") * (opts.goldMult ?? 1);
  let np = { ...p, inventory: [...p.inventory], chests: [...p.chests], monsterKills: { ...p.monsterKills } };
  const killsBefore = np.monsterKills[m.id] || 0;
  np.monsterKills[m.id] = killsBefore + 1;
  const goldGain = Math.round(rand(rewardCfg.goldMin, rewardCfg.goldMax) * goldMult);
  const levelPenalty = xpLevelPenaltyMultiplier(p.level, map.levelMax);
  const xpGain = p.level >= MAX_LEVEL ? 0 : Math.round(rewardCfg.xp * expMult * levelPenalty);
  // Kullanıcı isteği: "Karakterin üstünde en fazla 2.000.000.000 gold
  // bulunabilir... bu paranın üstüne çıkmaya çalışıldığında sistem buna
  // izin vermesin." — öldürme ödülü gibi otomatik akışlarda "hata" yerine
  // sessizce tavanda tutuluyor (App.jsx'teki güvenlik ağıyla aynı tavan),
  // gösterilen mesaj da gerçek kazancı yansıtsın diye clamp SONRASI fark alınıyor.
  const goldBefore = np.gold;
  np.gold = clampGold(np.gold + goldGain);
  const actualGoldGain = np.gold - goldBefore;
  np.xp += xpGain;

  // Kullanıcı isteği: "hepsini çevir" — bu fonksiyon React dışı (hook yok),
  // bu yüzden hazır Türkçe cümle basmak yerine BattleTab.jsx'in t() ile
  // biçimlendireceği YAPILANDIRILMIŞ (typed) bir drops dizisi döndürüyor.
  let drops = [];
  if (actualGoldGain > 0) drops.push({ type: "gold", amount: actualGoldGain });
  if (xpGain > 0) drops.push({ type: "xp", amount: xpGain });

  const relatedQuest = MONSTER_QUESTS.find((q) => q.monsterId === m.id);
  if (relatedQuest && !(p.claimedQuests || []).includes(relatedQuest.id)) {
    const current = np.monsterKills[m.id];
    if (current >= relatedQuest.target) {
      if (killsBefore < relatedQuest.target) {
        drops.push({ type: "questComplete" });
      }
    } else {
      drops.push({ type: "questProgress", current, target: relatedQuest.target });
    }
  }

  const freshNp = ensureDailyQuestsFresh(np);
  const dailyKillsBefore = freshNp.dailyQuests.killsToday;
  np = registerDailyKill(freshNp);
  np = registerWeeklyKill(np, m);
  DAILY_QUEST_SLOTS.forEach((slot) => {
    const wasDone = dailyKillsBefore >= slot.target;
    const isDone = np.dailyQuests.killsToday >= slot.target;
    if (isDone && !wasDone) {
      drops.push({ type: "dailyQuestComplete", target: slot.target });
    }
  });

  if (Math.random() < rewardCfg.dropChance * dropMult) {
    const dropTier = pickDropTier(map.tier);
    const item = rollMapLoot(dropTier, map.tier);
    if (item) {
      const addResult = addItemToInventory(np, item);
      np = addResult.player;
      if (addResult.added) np.hasNewItemNotice = true;
      drops.push(addResult.added
        ? { type: "itemDropped", kind: item.kind, itemName: item.name }
        : { type: "itemDropFailed", itemName: item.name, reason: addResult.reason });
    }
  }
  if (Math.random() < rewardCfg.chestChance * dropMult) {
    const chestTier = pickDropTier(map.tier);
    const chest = { id: uid(), tier: chestTier };
    np.chests.push(chest);
    drops.push({ type: "chestDropped", tier: chestTier });
  }
  if (m.mapBoss) {
    np = registerMapBossDefeat(np, map.id);
    np.chests.push({ id: uid(), tier: map.tier });
    drops.push({ type: "guardChest", tier: map.tier });
  }

  const levelBefore = p.level;
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
    drops.push({ type: "levelUpToast", level: np.level, statPoints: levelsGained * 3 });
  }
  np = learnFreeSkills(np);
  // Kullanıcı isteği: "5 Lvl oldun!" tarzında bir widget — bu geçişte hangi
  // haritanın (varsa) yeni açıldığını da bilmesi gerekiyor. Birden fazla
  // seviye birden atlansa bile (nadir, büyük bir XP kazancında) aralıktaki
  // İLK yeni haritayı buluyoruz — BattleTab'daki widget onu gösterecek.
  const unlockedMap = leveled ? MAPS.find((m) => m.levelMin > levelBefore && m.levelMin <= np.level) : null;
  const levelUp = leveled ? { fromLevel: levelBefore, toLevel: np.level, levelsGained, statPointsGained: levelsGained * 3, unlockedMap } : null;
  return { player: np, drops, blockedReasonKey: null, tone: leveled ? "level" : "loot", levelUp };
}
