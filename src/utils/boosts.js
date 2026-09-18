import { BOOST_SCROLLS, BOOST_SCROLL_PACK_SIZE, BOOST_DURATION_MIN, boostScrollDef, boostScrollName } from "../data/boostScrolls";
import { addItemToInventory } from "./inventory";

const DURATION_MS = BOOST_DURATION_MIN * 60 * 1000;

// player.activeBoosts: { [scrollId]: expiresAt } — premium abonelikle aynı
// "duvar saati" deseni (bkz. utils/premium.js#activePremiumTier), tur
// bazlı değil: oyun kapalıyken de süre işler, tur sayısına bağlı değil.
function activeExpiry(player, scrollId) {
  const expiresAt = player.activeBoosts?.[scrollId];
  return expiresAt && expiresAt > Date.now() ? expiresAt : null;
}

export function boostTimeLeftMs(player, scrollId) {
  const expiresAt = activeExpiry(player, scrollId);
  return expiresAt ? expiresAt - Date.now() : 0;
}

// percent tipindeki takviyeler için çarpan (aktif değilse 1 — no-op).
export function boostMultiplier(player, scrollId) {
  if (!activeExpiry(player, scrollId)) return 1;
  const def = boostScrollDef(scrollId);
  return def?.type === "percent" ? 1 + def.magnitude : 1;
}

// flat tipindeki takviyeler için düz bonus (aktif değilse 0).
export function boostFlatBonus(player, scrollId) {
  if (!activeExpiry(player, scrollId)) return 0;
  const def = boostScrollDef(scrollId);
  return def?.type === "flat" ? def.magnitude : 0;
}

function stackKeyFor(scrollId) { return `boostScroll:${scrollId}`; }

export function makeBoostScrollStack(scrollId, count = 1) {
  return {
    id: stackKeyFor(scrollId),
    kind: "boostScroll",
    boostId: scrollId,
    name: boostScrollName(scrollId, "tr"),
    count,
    weight: 0.5,
    stackable: true,
    stackKey: stackKeyFor(scrollId),
  };
}

// Bir parşömeni tüketip takviyeyi aktive eder. Zaten aktifse süreyi
// SIFIRLAMAZ, kalan süreye 30 dakika daha EKLER (kullanıcı elinde
// birden fazla parşömen varsa art arda kullanıp süreyi uzatabilsin diye) —
// bkz. activeExpiry'nin base hesabı.
export function useBoostScroll(player, scrollId) {
  const stack = player.inventory.find((i) => i.kind === "boostScroll" && i.boostId === scrollId);
  if (!stack || stack.count <= 0) return { player, used: false, reason: "noScrollsLeft" };

  const inventory = stack.count - 1 <= 0
    ? player.inventory.filter((i) => i.id !== stack.id)
    : player.inventory.map((i) => (i.id === stack.id ? { ...i, count: i.count - 1 } : i));

  const base = activeExpiry(player, scrollId) || Date.now();
  const expiresAt = base + DURATION_MS;
  return {
    player: { ...player, inventory, activeBoosts: { ...(player.activeBoosts || {}), [scrollId]: expiresAt } },
    used: true,
    expiresAt,
  };
}

// 20'lik paket satın alır — kullanıcı isteği: "Elmas ile satılan
// paketlerinde 20 li paket halinde olacak." Çanta doluysa/ağırlık yetmezse
// elmas HARCANMAZ (ScrollShop.jsx#buyScroll ile aynı desen — result.added
// false dönerse çağıran orijinal, değişmemiş player'ı görür).
export function buyBoostScrollPack(player, scrollId) {
  const def = boostScrollDef(scrollId);
  if (!def) return { player, bought: false, reason: "invalidScroll" };
  if (player.diamonds < def.packCost) return { player, bought: false, reason: "notEnoughDiamonds" };
  const result = addItemToInventory(
    { ...player, diamonds: player.diamonds - def.packCost },
    makeBoostScrollStack(scrollId, BOOST_SCROLL_PACK_SIZE)
  );
  if (!result.added) return { player, bought: false, reason: result.reason };
  return { player: result.player, bought: true };
}

// TopBar'daki aktif takviye şeridi için — sadece şu an süresi devam eden
// takviyeleri, kalan süreyle birlikte döner.
export function activeBoostsList(player) {
  return BOOST_SCROLLS
    .map((def) => ({ def, msLeft: boostTimeLeftMs(player, def.id) }))
    .filter((b) => b.msLeft > 0);
}
