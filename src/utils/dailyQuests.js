import { todayKey } from "./day";
import { DAILY_QUEST_SLOTS } from "../data/dailySystems";
import { highestUnlockedMap } from "../data/maps";
import { uid } from "./random";

// Kaptan'ın kalıcı canavar-görevlerinden (data/quests.js#MONSTER_QUESTS)
// AYRI, her gün sıfırlanan 3 basamaklı bir "bugün X canavar öldür" merdiveni
// — kullanıcı isteği: her gün geri gelmek için somut bir sebep. Hangi
// canavarı/haritayı öldürdüğü önemli değil, sadece bugünkü toplam öldürme
// sayısı (killsToday) sayılıyor.
function freshDailyQuests() {
  return { day: todayKey(), killsToday: 0, claimed: DAILY_QUEST_SLOTS.map(() => false) };
}

// Gün değiştiyse sıfırlar, değişmediyse dokunmaz — hem öldürme sayacını
// artıran taraf (BattleTab) hem görüntüleyen taraf (CaptainTab) aynı "taze
// mi" kontrolünü tekrarlamasın diye tek bir yerden.
export function ensureDailyQuestsFresh(player) {
  const dq = player.dailyQuests;
  if (dq && dq.day === todayKey()) return player;
  return { ...player, dailyQuests: freshDailyQuests() };
}

// BattleTab#applyLoot her öldürmede bunu çağırır — monsterKills'e ek olarak,
// ondan bağımsız bir "bugünkü toplam" sayacı.
export function registerDailyKill(player) {
  const p = ensureDailyQuestsFresh(player);
  return { ...p, dailyQuests: { ...p.dailyQuests, killsToday: p.dailyQuests.killsToday + 1 } };
}

export function dailyQuestProgress(player, slotIndex) {
  const dq = player.dailyQuests || freshDailyQuests();
  const slot = DAILY_QUEST_SLOTS[slotIndex];
  const current = dq.day === todayKey() ? dq.killsToday : 0;
  return { current: Math.min(current, slot.target), target: slot.target, done: current >= slot.target, claimed: dq.day === todayKey() && !!dq.claimed[slotIndex] };
}

export function claimDailyQuest(player, slotIndex) {
  const p = ensureDailyQuestsFresh(player);
  const dq = p.dailyQuests;
  const slot = DAILY_QUEST_SLOTS[slotIndex];
  if (!slot) return { player: p, claimed: false, reason: "Geçersiz görev." };
  if (dq.claimed[slotIndex]) return { player: p, claimed: false, reason: "Ödül zaten alındı." };
  if (dq.killsToday < slot.target) return { player: p, claimed: false, reason: "Görev henüz tamamlanmadı." };

  let next = {
    ...p,
    gold: p.gold + slot.goldReward,
    xp: p.xp + slot.xpReward,
    dailyQuests: { ...dq, claimed: dq.claimed.map((c, i) => (i === slotIndex ? true : c)) },
  };
  if (slot.chest) {
    const tier = highestUnlockedMap(next.level).tier;
    next = { ...next, chests: [...next.chests, { id: uid(), tier }] };
  }
  return { player: next, claimed: true, quest: slot };
}
