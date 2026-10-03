import {
  equipItem, unequipItem, sellPrice, repairItem, repairAllEquipped, MAX_GOLD,
} from "../utils/player";
import { isConsumable } from "../utils/itemDisplay";
import { depositToBank, withdrawFromBank } from "../utils/inventory";
import { useBoostScroll } from "../utils/boosts";
import { premiumSellMultiplier, premiumRepairDiscount } from "../utils/premium";
import { openChestSafely, openChestsSafely } from "../utils/chests";

// Ekonomi eylemleri (Faz 2): sunucu otoritesinin kuralları. Her eylem, oyunun zaten
// kullandığı saf fonksiyonları çağırır; eşyalar istemcinin gönderdiği nesneyle değil,
// KİMLİĞİYLE bulunur (sunucu kendi envanterine bakar). Aynı kod iki yerde çalışır:
//  - sunucu otoritesi açıkken sunucuda (server/game.mjs),
//  - kapalıyken istemcide (src/game/client.js).
// Sözleşme: reducer(state, payload) -> { state, result }. state = { player, bank, bankGold }.
// result.ok false ise state DEĞİŞMEZ ve result, arayüzün mesaj üretmesi için gereken
// nedenleri (reason / blocked ...) taşır. Başarıda result.ok true.
const fail = (state, reason, extra = {}) => ({ state, result: { ok: false, reason, ...extra } });
const done = (state, extra = {}) => ({ state, result: { ok: true, ...extra } });
const strip = ({ player, bank, ...rest }) => rest; // pure fonksiyon sonuçlarından yalnızca açıklayıcı alanlar

const findOwned = (player, itemId) => player.inventory.find((i) => i.id === itemId)
  || Object.values(player.equipped || {}).find((i) => i && i.id === itemId) || null;

export const reducers = {
  "inventory/equip"(state, { itemId }) {
    const item = state.player.inventory.find((i) => i.id === itemId);
    if (!item) return fail(state, "itemNotFound");
    const result = equipItem(state.player, item);
    if (result.blocked) return fail(state, "blocked", { blocked: result.blocked });
    return done({ ...state, player: result.player });
  },

  "inventory/unequip"(state, { slot }) {
    const result = unequipItem(state.player, slot);
    if (!result.removed) return fail(state, result.reason || "nothingToRemove", strip(result));
    return done({ ...state, player: result.player });
  },

  "inventory/sell"(state, { itemId }) {
    const item = state.player.inventory.find((i) => i.id === itemId);
    if (!item) return fail(state, "itemNotFound");
    if (item.noTrade) return fail(state, "noTrade");
    const price = Math.round(sellPrice(item) * premiumSellMultiplier(state.player));
    const gold = Math.min(MAX_GOLD, state.player.gold + price);
    return done({ ...state, player: { ...state.player, gold, inventory: state.player.inventory.filter((i) => i.id !== itemId) } }, { gold: price });
  },

  "inventory/sellBulk"(state, { itemIds }) {
    const wanted = new Set(Array.isArray(itemIds) ? itemIds : []);
    // Pot/parşömen gibi tüketilebilirlerin ve takas edilemezlerin satışı toplu satıştan bilerek dışlanır.
    const sellable = state.player.inventory.filter((i) => wanted.has(i.id) && !isConsumable(i) && !i.noTrade);
    if (sellable.length === 0) return fail(state, "noneSellable");
    const total = sellable.reduce((sum, i) => sum + Math.round(sellPrice(i) * premiumSellMultiplier(state.player)), 0);
    const sold = new Set(sellable.map((i) => i.id));
    const gold = Math.min(MAX_GOLD, state.player.gold + total);
    return done({ ...state, player: { ...state.player, gold, inventory: state.player.inventory.filter((i) => !sold.has(i.id)) } }, { count: sellable.length, gold: total });
  },

  "inventory/repair"(state, { itemId }) {
    const item = findOwned(state.player, itemId);
    if (!item) return fail(state, "itemNotFound");
    const result = repairItem(state.player, item, premiumRepairDiscount(state.player), state.bank);
    if (!result.repaired) return fail(state, result.reason || "repairFailed", strip(result));
    return done({ ...state, player: result.player, bank: result.bank || state.bank }, { cost: result.cost });
  },

  "inventory/repairAll"(state) {
    const result = repairAllEquipped(state.player, premiumRepairDiscount(state.player));
    if (!result.repaired) return fail(state, result.reason || "nothingToRepair", strip(result));
    return done({ ...state, player: result.player }, { cost: result.cost });
  },

  "inventory/depositItem"(state, { itemId, page }) {
    const item = state.player.inventory.find((i) => i.id === itemId);
    if (!item) return fail(state, "itemNotFound");
    if (!Number.isInteger(page) || !state.bank[page]) return fail(state, "invalidPage");
    const result = depositToBank(state.player, item, state.bank, page);
    if (!result.moved) return fail(state, result.reason || "depositFailed", strip(result));
    return done({ ...state, player: result.player, bank: result.bank });
  },

  "inventory/withdrawItem"(state, { itemId, page }) {
    if (!Number.isInteger(page) || !state.bank[page]) return fail(state, "invalidPage");
    const item = state.bank[page].find((i) => i.id === itemId);
    if (!item) return fail(state, "itemNotFound");
    const result = withdrawFromBank(state.player, item, state.bank, page);
    if (!result.moved) return fail(state, result.reason || "withdrawFailed", strip(result));
    return done({ ...state, player: result.player, bank: result.bank });
  },

  "inventory/depositBulk"(state, { itemIds, page }) {
    if (!Number.isInteger(page) || !state.bank[page]) return fail(state, "invalidPage");
    let player = state.player, bank = state.bank, moved = 0;
    for (const id of Array.isArray(itemIds) ? itemIds : []) {
      const item = player.inventory.find((i) => i.id === id);
      if (!item) continue;
      const result = depositToBank(player, item, bank, page);
      if (result.moved) { player = result.player; bank = result.bank; moved++; }
    }
    return done({ ...state, player, bank }, { moved });
  },

  "inventory/depositGold"(state, { amount }) {
    if (!Number.isSafeInteger(amount) || amount <= 0) return fail(state, "invalidAmount");
    if (state.player.gold < amount) return fail(state, "notEnoughGold");
    if (state.bankGold + amount > MAX_GOLD) return fail(state, "bankGoldCap");
    return done({ ...state, player: { ...state.player, gold: state.player.gold - amount }, bankGold: state.bankGold + amount }, { amount });
  },

  "inventory/withdrawGold"(state, { amount }) {
    if (!Number.isSafeInteger(amount) || amount <= 0) return fail(state, "invalidAmount");
    if (state.bankGold < amount) return fail(state, "notEnoughBankGold");
    if (state.player.gold + amount > MAX_GOLD) return fail(state, "carryGoldCap");
    return done({ ...state, player: { ...state.player, gold: state.player.gold + amount }, bankGold: state.bankGold - amount }, { amount });
  },

  "inventory/openChest"(state, { chestId }) {
    const result = openChestSafely(state.player, chestId);
    if (!result.opened) return fail(state, result.reason || "chestFailed");
    return done({ ...state, player: result.player }, { item: result.item });
  },

  "inventory/openAllChests"(state) {
    const result = openChestsSafely(state.player);
    if (!result.items.length) return fail(state, result.reason || "noChests");
    return done({ ...state, player: result.player }, { items: result.items, reason: result.reason || null });
  },

  "inventory/useBoostScroll"(state, { itemId }) {
    const item = state.player.inventory.find((i) => i.id === itemId && i.kind === "boostScroll");
    if (!item) return fail(state, "itemNotFound");
    const result = useBoostScroll(state.player, item.boostId);
    if (!result.used) return fail(state, "noScrollsLeft");
    return done({ ...state, player: result.player });
  },
};

export const ACTION_TYPES = Object.keys(reducers);

// Bilinmeyen eylem ya da kötü yük sunucuyu düşürmez; uygulayıcıya "geçersiz" döner.
export function applyAction(state, type, payload = {}) {
  const reducer = Object.hasOwn(reducers, type) ? reducers[type] : null;
  if (!reducer) return fail(state, "unknownAction");
  if (payload === null || typeof payload !== "object") return fail(state, "invalidPayload");
  return reducer(state, payload);
}
