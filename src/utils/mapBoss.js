import { todayKey } from "./day";

function freshBossState() { return { day: todayKey(), defeatedMapIds: [] }; }

export function mapBossState(player) {
  return player.mapBoss?.day === todayKey() ? player.mapBoss : freshBossState();
}

export function canFightMapBoss(player, mapId) {
  const state = mapBossState(player);
  return { ok: !state.defeatedMapIds.includes(mapId) };
}

export function registerMapBossDefeat(player, mapId) {
  const state = mapBossState(player);
  if (state.defeatedMapIds.includes(mapId)) return player;
  return { ...player, mapBoss: { ...state, defeatedMapIds: [...state.defeatedMapIds, mapId] } };
}
