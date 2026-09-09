import { MAPS } from "../data/maps";
import { uid } from "./random";

export const MAP_COLLECTIONS = MAPS.map((map) => ({
  id: `collection_${map.id}`, mapId: map.id, name: `${map.name} Canavar Kitabı`,
  monsterIds: map.monsters.map((m) => m.id), goldReward: map.tier * 350, chestTier: map.tier,
}));

export function collectionProgress(player, collection) {
  const current = collection.monsterIds.filter((id) => (player.monsterKills?.[id] || 0) > 0).length;
  const claimed = (player.claimedCollections || []).includes(collection.id);
  return { current, target: collection.monsterIds.length, done: current === collection.monsterIds.length, claimed };
}
export function claimCollection(player, id) {
  const collection = MAP_COLLECTIONS.find((c) => c.id === id);
  if (!collection) return { player, claimed: false, reason: "Geçersiz koleksiyon." };
  const progress = collectionProgress(player, collection);
  if (progress.claimed) return { player, claimed: false, reason: "Ödül zaten alındı." };
  if (!progress.done) return { player, claimed: false, reason: "Önce bu haritadaki her canavarı en az bir kez yen." };
  return { player: { ...player, gold: player.gold + collection.goldReward, chests: [...player.chests, { id: uid(), tier: collection.chestTier }], claimedCollections: [...(player.claimedCollections || []), id] }, claimed: true, collection };
}
