import { todayKey } from "./day";
import { findMap } from "../data/maps";
import { KILLS_TO_UNLOCK_NEXT, monsterKillCount } from "./mapProgress";

function freshBossState() { return { day: todayKey(), defeatedMapIds: [] }; }

export function mapBossState(player) {
  return player.mapBoss?.day === todayKey() ? player.mapBoss : freshBossState();
}

// Haritayı tamamlamak = bir sonraki haritaya geçiş şartıyla aynı: haritadaki
// HER canavardan KILLS_TO_UNLOCK_NEXT tane kesmek (bkz. utils/mapProgress.js).
export function mapCompletion(player, mapId, map = findMap(mapId)) {
  const total = map.monsters.length;
  const done = map.monsters.filter((m) => monsterKillCount(player, m.id) >= KILLS_TO_UNLOCK_NEXT).length;
  return { done, total, complete: done >= total };
}

// Muhafız günde bir kez çıkar ama haritayı tamamlamadan kesilemez.
export function canFightMapBoss(player, mapId, map) {
  if (mapBossState(player).defeatedMapIds.includes(mapId)) return { ok: false, reason: "defeatedToday" };
  const completion = mapCompletion(player, mapId, map);
  if (!completion.complete) return { ok: false, reason: "mapIncomplete", done: completion.done, total: completion.total };
  return { ok: true };
}

export function registerMapBossDefeat(player, mapId) {
  const state = mapBossState(player);
  if (state.defeatedMapIds.includes(mapId)) return player;
  return { ...player, mapBoss: { ...state, defeatedMapIds: [...state.defeatedMapIds, mapId] } };
}
