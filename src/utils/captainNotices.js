import { MONSTER_QUESTS } from "../data/quests";
import { questProgress, isQuestClaimed } from "./quests";
import { dailyQuestProgress } from "./dailyQuests";
import { DAILY_QUEST_SLOTS } from "../data/dailySystems";
import { WEEKLY_QUESTS } from "../data/weeklyQuests";
import { weeklyQuestProgress } from "./weeklyQuests";
import { MAP_COLLECTIONS, collectionProgress } from "./collection";

// Kaptan'ın hangi alt sekmesinde ödülü alınmayı bekleyen bir şey var — alt
// çubuktaki Kaptan noktası ile Kaptan içindeki sekme noktaları aynı kaynaktan
// beslenir, böylece bildirimin nerede olduğu belli olur.
export function captainSubtabNotices(player) {
  return {
    quests: MONSTER_QUESTS
      .filter((q) => player.level >= q.requiredLevel)
      .some((q) => questProgress(player, q).done && !isQuestClaimed(player, q.id)),
    daily: DAILY_QUEST_SLOTS.some((_, i) => { const p = dailyQuestProgress(player, i); return p.done && !p.claimed; }),
    weekly: WEEKLY_QUESTS.some((q) => { const p = weeklyQuestProgress(player, q); return p.done && !p.claimed; }),
    book: MAP_COLLECTIONS.some((c) => { const p = collectionProgress(player, c); return p.done && !p.claimed; }),
  };
}

export const hasCaptainNotice = (player) => Object.values(captainSubtabNotices(player)).some(Boolean);
