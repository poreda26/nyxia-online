import { currentWeekId } from "./week";
import { WEEKLY_QUESTS } from "../data/weeklyQuests";
import { highestUnlockedMap } from "../data/maps";
import { uid } from "./random";

function freshWeeklyQuests() { return { weekId: currentWeekId(), kills: 0, bosses: 0, claimed: [] }; }
export function ensureWeeklyQuestsFresh(player) {
  return player.weeklyQuests?.weekId === currentWeekId() ? player : { ...player, weeklyQuests: freshWeeklyQuests() };
}
export function registerWeeklyKill(player, monster) {
  const p = ensureWeeklyQuestsFresh(player);
  return { ...p, weeklyQuests: { ...p.weeklyQuests, kills: p.weeklyQuests.kills + 1, bosses: p.weeklyQuests.bosses + (monster.mapBoss ? 1 : 0) } };
}
export function weeklyQuestProgress(player, quest) {
  const state = player.weeklyQuests?.weekId === currentWeekId() ? player.weeklyQuests : freshWeeklyQuests();
  const current = quest.type === "bosses" ? state.bosses : state.kills;
  return { current: Math.min(current, quest.target), target: quest.target, done: current >= quest.target, claimed: state.claimed.includes(quest.id) };
}
export function claimWeeklyQuest(player, id) {
  const quest = WEEKLY_QUESTS.find((q) => q.id === id);
  const p = ensureWeeklyQuestsFresh(player);
  if (!quest) return { player: p, claimed: false, reason: "Geçersiz görev." };
  const progress = weeklyQuestProgress(p, quest);
  if (progress.claimed) return { player: p, claimed: false, reason: "Ödül zaten alındı." };
  if (!progress.done) return { player: p, claimed: false, reason: "Görev henüz tamamlanmadı." };
  let next = { ...p, gold: p.gold + quest.goldReward, xp: p.xp + quest.xpReward, weeklyQuests: { ...p.weeklyQuests, claimed: [...p.weeklyQuests.claimed, id] } };
  if (quest.chest) next = { ...next, chests: [...next.chests, { id: uid(), tier: highestUnlockedMap(next.level).tier }] };
  return { player: next, claimed: true, quest };
}
