import { playerMaxHp, playerMaxMp } from "./player";
import { potionAmount, potionTiersFor } from "../data/potions";

// Savaş ekranındaki tek can/mana butonu hangi kademeyi kullanacağını bilmek
// için — oyuncunun ELİNDE OLAN en düşük (en ucuz) kademeyi bulur, ucuz
// potlar önce tükenir. Hiç yoksa null.
export function bestAvailablePotionTier(player, potionType) {
  const tiers = potionTiersFor(potionType);
  for (let tier = 1; tier <= tiers.length; tier++) {
    const stack = player.inventory.find((i) => i.kind === "potion" && i.potionType === potionType && i.tier === tier);
    if (stack && stack.count > 0) return tier;
  }
  return null;
}

// Consumes one potion (belirtilen kademeden) from its bag stack and heals
// the matching resource by that kademenin sabit miktarı (bkz.
// data/potions.js#HP_POTION_TIERS/MP_POTION_TIERS — yüzdesel değil artık).
// Returns { player, healed } on success, or { player, healed: 0, reason }
// when there's nothing left in that stack.
export function usePotion(player, potionType, tier) {
  const stack = player.inventory.find((i) => i.kind === "potion" && i.potionType === potionType && i.tier === tier);
  if (!stack || stack.count <= 0) {
    return { player, healed: 0, reason: "Pot kalmadı." };
  }
  const maxStat = potionType === "hp" ? playerMaxHp(player) : playerMaxMp(player);
  const healAmt = potionAmount(potionType, tier);
  const cur = potionType === "hp" ? player.hp : player.mp;
  const next = Math.min(maxStat, cur + healAmt);
  const healed = next - cur;
  const inventory = stack.count - 1 <= 0
    ? player.inventory.filter((i) => i.id !== stack.id)
    : player.inventory.map((i) => (i.id === stack.id ? { ...i, count: i.count - 1 } : i));
  return { player: { ...player, [potionType]: next, inventory }, healed };
}
