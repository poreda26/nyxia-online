import { todayKey } from "./day";
import { SOLO_DUNGEON_DAILY_LIMIT } from "../data/soloDungeon";

function freshEntries() {
  return { day: todayKey(), entriesUsed: 0 };
}

export function dungeonEntriesLeft(player) {
  const sd = player.soloDungeon;
  if (!sd || sd.day !== todayKey()) return SOLO_DUNGEON_DAILY_LIMIT;
  return Math.max(0, SOLO_DUNGEON_DAILY_LIMIT - sd.entriesUsed);
}

export function canEnterSoloDungeon(player) {
  if (dungeonEntriesLeft(player) <= 0) return { ok: false, reason: "Bugünkü zindan giriş hakların bitti — yarın tekrar gel." };
  return { ok: true };
}

export function consumeDungeonEntry(player) {
  const sd = player.soloDungeon && player.soloDungeon.day === todayKey() ? player.soloDungeon : freshEntries();
  return { ...player, soloDungeon: { day: todayKey(), entriesUsed: sd.entriesUsed + 1 } };
}
