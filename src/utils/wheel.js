import { WINGS } from "../data/wings";
import { highestUnlockedMap } from "../data/maps";
import { addItemToInventory, addItemToAnyBankPage, makeScrollStack, makeBonusScrollStack, makeAccessoryScrollStack } from "./inventory";
import { makeBoostScrollStack } from "./boosts";
import { makeWings } from "./wings";

// Çarkın 12 dilimi aynı boyutta ve bu sırada çizilir. Oranlar BURADA YOK:
// ödülü sunucu seçer (server/wheel.mjs), istemci yalnızca sonucu gösterir.
export const WHEEL_SLICES = [
  "scroll_upgrade", "boost_exp", "mythic_1d", "scroll_accessory",
  "boost_gold", "boost_atk", "wing", "scroll_bonus",
  "boost_np", "apex_3d", "boost_def", "boost_hp",
];

const BOOST_OF = { boost_exp: "exp", boost_gold: "gold", boost_atk: "atk", boost_np: "np", boost_def: "def", boost_hp: "hp" };

export const WHEEL_PREMIUM_IDS = ["mythic_1d", "apex_3d"];
export const wheelSliceKind = (id) => (id === "mythic_1d" || id === "apex_3d" ? "premium" : id === "wing" ? "wing" : "scroll");

function buildItem(player, prizeId) {
  if (prizeId === "scroll_upgrade") return makeScrollStack(highestUnlockedMap(player.level).tier, 1);
  if (prizeId === "scroll_bonus") return makeBonusScrollStack();
  if (prizeId === "scroll_accessory") return makeAccessoryScrollStack(1);
  if (BOOST_OF[prizeId]) return makeBoostScrollStack(BOOST_OF[prizeId], 1);
  if (prizeId === "wing") return makeWings(WINGS[Math.floor(Math.random() * WINGS.length)].id);
  return null;
}

// Ödülü oyuncuya yazar. Çanta doluysa depoya düşer; ikisi de doluysa
// delivered:false döner ve ödül alınmamış kalır (kaybolmaz).
export function applyWheelPrize(player, bank, prizeId, spunAt) {
  const mark = (p) => ({ ...p, wheelAppliedAt: spunAt });
  // Premium ödülleri artık burada verilmez: sunucu çark ödülünü alırken hakkı yazar
  // (bkz. WheelModal.jsx#deliver, server /api/wheel/claim).
  if (prizeId === "mythic_1d" || prizeId === "apex_3d") return { player, bank, delivered: false };
  const item = buildItem(player, prizeId);
  if (!item) return { player, bank, delivered: false };
  const toBag = addItemToInventory(player, item);
  if (toBag.added) return { player: mark(toBag.player), bank, delivered: true, toBank: false };
  const toBank = addItemToAnyBankPage(item, bank);
  if (toBank.added) return { player: mark(player), bank: toBank.bank, delivered: true, toBank: true };
  return { player, bank, delivered: false };
}

// Aynı ödülün iki kez yazılmasını önler: sunucuya "aldım" demek ağ hatasıyla
// düşerse, bir sonraki açılışta ödül tekrar verilmez, sadece onay yinelenir.
export const wheelAlreadyApplied = (player, spunAt) => !!spunAt && (player.wheelAppliedAt || 0) >= spunAt;
