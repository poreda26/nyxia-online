import { todayKey } from "./day";
import { SOLO_DUNGEON_DAILY_LIMIT, EXTRA_DUNGEON_ENTRIES_PER_PURCHASE, EXTRA_DUNGEON_ENTRY_COST_DIAMONDS } from "../data/soloDungeon";

function freshEntries() {
  return { day: todayKey(), entriesUsed: 0, extraPurchased: 0 };
}

function todaysEntries(player) {
  const sd = player.soloDungeon;
  return sd && sd.day === todayKey() ? sd : freshEntries();
}

export function dungeonEntriesLeft(player) {
  const sd = todaysEntries(player);
  return Math.max(0, SOLO_DUNGEON_DAILY_LIMIT + (sd.extraPurchased || 0) - sd.entriesUsed);
}

export function canEnterSoloDungeon(player) {
  if (dungeonEntriesLeft(player) <= 0) return { ok: false, reason: "Bugünkü zindan giriş hakların bitti — yarın tekrar gel." };
  return { ok: true };
}

export function consumeDungeonEntry(player) {
  const sd = todaysEntries(player);
  return { ...player, soloDungeon: { ...sd, entriesUsed: sd.entriesUsed + 1 } };
}

// Kullanıcı isteği: "Günlük Solo Zindan hakkı sadece günde 1 kere 150
// elmasa +1 hak olarak satın alınabilecek" — extraPurchased zaten
// todaysEntries/freshEntries ile her gün 0'a sıfırlanıyor, o yüzden
// "bugün zaten satın alındı mı" kontrolü de aynı alana bakmak kadar basit.
export function hasBoughtExtraDungeonEntryToday(player) {
  return (todaysEntries(player).extraPurchased || 0) > 0;
}

// Elmasla ekstra zindan girişi — kullanıcı isteği: "Zindana giriş hakkı
// eklensin" (bkz. components/DiamondShopModal.jsx). extraPurchased da
// entriesUsed gibi günlük sıfırlanıyor (todaysEntries/freshEntries) —
// kalıcı bir yükseltme değil, sadece bugüne özel. Günde sadece 1 satın
// alma hakkı var (bkz. hasBoughtExtraDungeonEntryToday yukarıda).
export function buyExtraDungeonEntries(player) {
  if (hasBoughtExtraDungeonEntryToday(player)) return { player, bought: false, reason: "alreadyBoughtToday" };
  if (player.diamonds < EXTRA_DUNGEON_ENTRY_COST_DIAMONDS) return { player, bought: false, reason: "notEnoughDiamonds" };
  const sd = todaysEntries(player);
  return {
    player: {
      ...player,
      diamonds: player.diamonds - EXTRA_DUNGEON_ENTRY_COST_DIAMONDS,
      soloDungeon: { ...sd, extraPurchased: (sd.extraPurchased || 0) + EXTRA_DUNGEON_ENTRIES_PER_PURCHASE },
    },
    bought: true,
  };
}
