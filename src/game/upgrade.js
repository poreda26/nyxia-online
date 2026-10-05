import { GEAR_TIERS } from "../data/tiers";
import { MAX_UPGRADE_LEVEL, upgradeSuccessChance, bumpedStats, applyLevelData, scrollPrice } from "../utils/upgrade";
import { addItemToInventory, makeScrollStack, makeBonusScrollStack, makeAccessoryScrollStack } from "../utils/inventory";
import { accessoryUpgradeBlocked, buildUpgradedAccessory } from "../utils/accessoryUpgrade";
import { newlyUnlocked } from "../utils/achievements";

// Dükkân ve yükseltme (Faz 2b). Forge'a konan eşya/parşömenler artık çantadan GERÇEKTEN
// çıkıp oyuncunun `forge` / `accForge` alanında bekler (önceden yalnızca ekran durumuydu):
// bu sayede yarım kalan bir yükseltme kaybolmaz, çanta dışındaki eşya satılamaz/kuşanılamaz
// ve yükseltme zarı, parşömen tüketimi ve sonuç tek yerde, sunucuda çözülür.
export const SCROLL_BOX_COUNT = 9;
export const ACCESSORY_SLOT_COUNT = 3;
export const ACCESSORY_SCROLL_PRICE = 50000;

const fail = (state, reason, extra = {}) => ({ state, result: { ok: false, reason, ...extra } });
const done = (state, extra = {}) => ({ state, result: { ok: true, ...extra } });

const emptyForge = () => ({ item: null, boxes: Array(SCROLL_BOX_COUNT).fill(null), bonus: false });
const emptyAccForge = () => ({ slots: Array(ACCESSORY_SLOT_COUNT).fill(null), scroll: false });
const forgeOf = (player) => {
  const f = player.forge;
  return { item: f?.item || null, boxes: Array.from({ length: SCROLL_BOX_COUNT }, (_, i) => f?.boxes?.[i] || null), bonus: !!f?.bonus };
};
const accForgeOf = (player) => {
  const f = player.accForge;
  return { slots: Array.from({ length: ACCESSORY_SLOT_COUNT }, (_, i) => f?.slots?.[i] || null), scroll: !!f?.scroll };
};

// Çantaya bir parşömen geri koyar (dolu çantada bile kaybolmasın diye kapasite aranmaz).
function giveBackScroll(inventory, tier) {
  const existing = inventory.find((it) => it.kind === "scroll" && it.tier === tier);
  return existing
    ? inventory.map((it) => (it.id === existing.id ? { ...it, count: it.count + 1 } : it))
    : [...inventory, makeScrollStack(tier, 1)];
}
function takeScroll(inventory, matches) {
  const stack = inventory.find(matches);
  if (!stack || stack.count <= 0) return null;
  return stack.count - 1 <= 0 ? inventory.filter((it) => it.id !== stack.id) : inventory.map((it) => (it.id === stack.id ? { ...it, count: it.count - 1 } : it));
}

function returnAllForge(player) {
  const f = forgeOf(player);
  let inventory = [...player.inventory];
  if (f.item) inventory.push(f.item);
  f.boxes.forEach((box) => { if (box) inventory = giveBackScroll(inventory, box.tier); });
  if (f.bonus) inventory.push(makeBonusScrollStack());
  return { ...player, inventory, forge: emptyForge() };
}
function returnAllAccForge(player) {
  const f = accForgeOf(player);
  let inventory = [...player.inventory];
  f.slots.forEach((it) => { if (it) inventory.push(it); });
  if (f.scroll) {
    const existing = inventory.find((it) => it.kind === "accessoryScroll");
    inventory = existing ? inventory.map((it) => (it.id === existing.id ? { ...it, count: it.count + 1 } : it)) : [...inventory, makeAccessoryScrollStack(1)];
  }
  return { ...player, inventory, accForge: emptyAccForge() };
}

export const upgradeReducers = {
  "shop/buyScroll"(state, { tier }) {
    if (!GEAR_TIERS.includes(tier)) return fail(state, "invalidTier");
    const price = scrollPrice(tier);
    if (state.player.gold < price) return fail(state, "notEnoughGold");
    const result = addItemToInventory({ ...state.player, gold: state.player.gold - price }, makeScrollStack(tier, 1));
    if (!result.added) return fail(state, "purchaseFailed", { detail: result.reason });
    return done({ ...state, player: result.player });
  },
  "shop/buyAccessoryScroll"(state) {
    if (state.player.gold < ACCESSORY_SCROLL_PRICE) return fail(state, "notEnoughGold");
    const result = addItemToInventory({ ...state.player, gold: state.player.gold - ACCESSORY_SCROLL_PRICE }, makeAccessoryScrollStack(1));
    if (!result.added) return fail(state, "purchaseFailed", { detail: result.reason });
    return done({ ...state, player: result.player });
  },

  // ---- Silah/zırh forge'u
  "forge/stageItem"(state, { itemId }) {
    const { player } = state;
    const item = player.inventory.find((i) => i.id === itemId);
    if (!item || (item.kind !== "weapon" && item.kind !== "armor")) return fail(state, "itemNotFound");
    if (item.noTrade) return fail(state, "itemNoTrade");
    const f = forgeOf(player);
    let inventory = player.inventory.filter((i) => i.id !== itemId);
    if (f.item) inventory = [...inventory, f.item];
    return done({ ...state, player: { ...player, inventory, forge: { ...f, item } } });
  },
  "forge/returnItem"(state) {
    const { player } = state;
    const f = forgeOf(player);
    if (!f.item) return done(state);
    return done({ ...state, player: { ...player, inventory: [...player.inventory, f.item], forge: { ...f, item: null } } });
  },
  "forge/stageScroll"(state, { tier }) {
    const { player } = state;
    const f = forgeOf(player);
    const emptyIndex = f.boxes.findIndex((b) => b === null);
    if (emptyIndex === -1) return fail(state, "boxesFull");
    const inventory = takeScroll(player.inventory, (it) => it.kind === "scroll" && it.tier === tier);
    if (!inventory) return fail(state, "scrollNotFound");
    const boxes = f.boxes.map((b, i) => (i === emptyIndex ? { tier } : b));
    return done({ ...state, player: { ...player, inventory, forge: { ...f, boxes } } });
  },
  "forge/returnScroll"(state, { box }) {
    const { player } = state;
    const f = forgeOf(player);
    if (!Number.isInteger(box) || !f.boxes[box]) return done(state);
    return done({ ...state, player: { ...player, inventory: giveBackScroll(player.inventory, f.boxes[box].tier), forge: { ...f, boxes: f.boxes.map((b, i) => (i === box ? null : b)) } } });
  },
  "forge/stageBonus"(state, { itemId }) {
    const { player } = state;
    const f = forgeOf(player);
    if (f.bonus) return fail(state, "bonusFull");
    const item = player.inventory.find((i) => i.id === itemId && i.kind === "bonusScroll");
    if (!item) return fail(state, "itemNotFound");
    return done({ ...state, player: { ...player, inventory: player.inventory.filter((i) => i.id !== itemId), forge: { ...f, bonus: true } } });
  },
  "forge/returnBonus"(state) {
    const { player } = state;
    const f = forgeOf(player);
    if (!f.bonus) return done(state);
    return done({ ...state, player: { ...player, inventory: [...player.inventory, makeBonusScrollStack()], forge: { ...f, bonus: false } } });
  },
  "forge/clear"(state) {
    const f = forgeOf(state.player);
    if (!f.item && !f.bonus && f.boxes.every((b) => !b)) return done(state);
    return done({ ...state, player: returnAllForge(state.player) });
  },

  // Yükseltme: forge'daki eşya + tam bir eşleşen parşömen. Zar sunucuda atılır; başarısızlıkta
  // eşya yok olur (oyunun mevcut kuralı), başarıda aynı kimlikle +1 seviye olarak çantaya döner.
  "forge/press"(state) {
    const { player } = state;
    const f = forgeOf(player);
    const entry = f.item;
    if (!entry) return fail(state, "noItem");
    const currentLevel = entry.upgradeLevel || 0;
    if (currentLevel >= MAX_UPGRADE_LEVEL) return fail(state, "alreadyMaxLevel");
    const matching = f.boxes.map((b, i) => (b && b.tier === entry.tier ? i : -1)).filter((i) => i >= 0);
    if (matching.length === 0) return fail(state, "noScrollForTier");
    if (matching.length >= 2) return fail(state, "onlyOneScrollAllowed");
    const success = Math.random() < upgradeSuccessChance(currentLevel, f.bonus);
    const cleared = { item: null, boxes: f.boxes.map((b, i) => (i === matching[0] ? null : b)), bonus: false };
    if (!success) return done({ ...state, player: { ...player, forge: cleared } }, { success: false, item: entry });
    const bumped = entry.levels ? applyLevelData(entry, currentLevel + 1) : { ...entry, upgradeLevel: currentLevel + 1, ...bumpedStats(entry) };
    const next = {
      ...player, forge: cleared, inventory: [...player.inventory, bumped],
      milestones: bumped.upgradeLevel >= MAX_UPGRADE_LEVEL ? { ...player.milestones, maxUpgradeReached: true } : player.milestones,
    };
    return done({ ...state, player: next }, { success: true, item: entry, bumpedItem: bumped, unlocked: newlyUnlocked(player, next).map((a) => a.id) });
  },

  // ---- Takı forge'u (3 aynı takı + 1 Aksesuar Kağıdı → bir üst seviye, başarısızlık yok)
  "accessory/stageItem"(state, { itemId }) {
    const { player } = state;
    const item = player.inventory.find((i) => i.id === itemId && i.kind === "accessory");
    if (!item) return fail(state, "itemNotFound");
    const blocked = accessoryUpgradeBlocked(item);
    if (!blocked.ok) return fail(state, blocked.reason, blocked.reasonVars ? { reasonVars: blocked.reasonVars } : {});
    const f = accForgeOf(player);
    const first = f.slots.find(Boolean);
    if (first && (first.name !== item.name || (first.upgradeLevel || 0) !== (item.upgradeLevel || 0))) return fail(state, "mustMatch");
    const emptyIndex = f.slots.findIndex((s) => s === null);
    if (emptyIndex === -1) return fail(state, "slotsFull");
    return done({ ...state, player: { ...player, inventory: player.inventory.filter((i) => i.id !== itemId), accForge: { ...f, slots: f.slots.map((s, i) => (i === emptyIndex ? item : s)) } } });
  },
  "accessory/returnItem"(state, { slot }) {
    const { player } = state;
    const f = accForgeOf(player);
    if (!Number.isInteger(slot) || !f.slots[slot]) return done(state);
    return done({ ...state, player: { ...player, inventory: [...player.inventory, f.slots[slot]], accForge: { ...f, slots: f.slots.map((s, i) => (i === slot ? null : s)) } } });
  },
  "accessory/stageScroll"(state) {
    const { player } = state;
    const f = accForgeOf(player);
    if (f.scroll) return fail(state, "scrollSlotFull");
    const inventory = takeScroll(player.inventory, (it) => it.kind === "accessoryScroll");
    if (!inventory) return fail(state, "scrollNotFound");
    return done({ ...state, player: { ...player, inventory, accForge: { ...f, scroll: true } } });
  },
  "accessory/returnScroll"(state) {
    const { player } = state;
    const f = accForgeOf(player);
    if (!f.scroll) return done(state);
    const existing = player.inventory.find((it) => it.kind === "accessoryScroll");
    const inventory = existing ? player.inventory.map((it) => (it.id === existing.id ? { ...it, count: it.count + 1 } : it)) : [...player.inventory, makeAccessoryScrollStack(1)];
    return done({ ...state, player: { ...player, inventory, accForge: { ...f, scroll: false } } });
  },
  "accessory/clear"(state) {
    const f = accForgeOf(state.player);
    if (!f.scroll && f.slots.every((s) => !s)) return done(state);
    return done({ ...state, player: returnAllAccForge(state.player) });
  },
  "accessory/press"(state) {
    const { player } = state;
    const f = accForgeOf(player);
    if (!f.slots.every(Boolean) || !f.scroll) return fail(state, "notReady");
    const sample = f.slots[0];
    const upgraded = buildUpgradedAccessory(sample);
    return done({ ...state, player: { ...player, inventory: [...player.inventory, upgraded], accForge: emptyAccForge() } }, { item: sample, bumpedItem: upgraded });
  },
};
