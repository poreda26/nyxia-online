import { MONSTER_QUESTS, AWAKENING_QUEST } from "../data/quests";

// Progress is always derived live from player.monsterKills (a plain
// cumulative counter incremented in BattleTab#applyLoot on every kill) —
// there's no separate "accepted/in-progress" quest state to track, since
// every quest on the board is always available and just tracks itself.
export function questProgress(player, quest) {
  const current = player.monsterKills?.[quest.monsterId] || 0;
  return { current: Math.min(current, quest.target), target: quest.target, done: current >= quest.target };
}

export function isQuestClaimed(player, questId) {
  return (player.claimedQuests || []).includes(questId);
}

export function claimQuest(player, questId) {
  const quest = MONSTER_QUESTS.find((q) => q.id === questId);
  if (!quest) return { player, claimed: false, reason: "Geçersiz görev." };
  if (isQuestClaimed(player, questId)) return { player, claimed: false, reason: "Ödül zaten alındı." };
  const { done } = questProgress(player, quest);
  if (!done) return { player, claimed: false, reason: "Görev henüz tamamlanmadı." };
  return {
    player: {
      ...player,
      gold: player.gold + quest.goldReward,
      xp: player.xp + quest.xpReward,
      claimedQuests: [...(player.claimedQuests || []), questId],
    },
    claimed: true,
    quest,
  };
}

// Skill-unlock gate (see utils/skills.js#canUnlockSkill) — a tier counts as
// "proven" once either of its two monster quests has been claimed, not
// both. Kaptan gives two quests per tier on purpose (real choice in which
// monster to focus), but only one is required to move a skill forward.
export function isTierQuestClaimed(player, tier) {
  return MONSTER_QUESTS.some((q) => q.tier === tier && isQuestClaimed(player, q.id));
}

export function awakeningProgress(player) {
  const entries = Object.entries(AWAKENING_QUEST.targets).map(([monsterId, target]) => ({
    monsterId,
    current: Math.min(player.monsterKills?.[monsterId] || 0, target),
    target,
  }));
  const done = entries.every((e) => e.current >= e.target);
  return { entries, done };
}

export function claimAwakening(player) {
  if (player.awakened) return { player, claimed: false, reason: "Zaten Uyanmışsın." };
  if (player.level < AWAKENING_QUEST.requiredLevel) return { player, claimed: false, reason: `Seviye ${AWAKENING_QUEST.requiredLevel} gerekiyor.` };
  if (!awakeningProgress(player).done) return { player, claimed: false, reason: "Sınav henüz tamamlanmadı." };
  return { player: { ...player, awakened: true }, claimed: true };
}
