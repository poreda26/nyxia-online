import { wingDefinition } from '../data/wings';
import { uid } from './random';
import { addItemToInventory } from './inventory';

export function makeWings(wingId) {
  const wing = wingDefinition(wingId);
  if (!wing) return null;
  return { id: uid(), kind: 'wings', slot: 'wings', wingId, name: wing.name, tier: 5,
    weight: 0, upgradeLevel: 0, upgradeLocked: true, noTrade: true,
    attackPowerPct: .03, expBonus: .05, dropBonus: .05,
    statBonus: { str: 3, sta: 3, dex: 3, int: 3, mag: 3 } };
}

export function buyWings(player, wingId) {
  const wing = wingDefinition(wingId);
  if (!wing) return { player, bought: false, reason: 'invalidPackage' };
  if (player.diamonds < wing.price) return { player, bought: false, reason: 'notEnoughDiamonds' };
  const result = addItemToInventory(player, makeWings(wingId));
  if (!result.added) return { player, bought: false, reason: result.reason };
  return { player: { ...result.player, diamonds: player.diamonds - wing.price }, bought: true };
}
