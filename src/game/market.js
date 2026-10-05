import { MARKET_DURATIONS_HOURS, MARKET_DURATION_FEE, MARKET_MAX_PRICE } from "../data/market";
import { isFirstPurchaseWeapon } from "../data/firstPurchaseWeapons";
import { addItemToInventory, addItemToAnyBankPage, makePotionStack } from "../utils/inventory";
import { HP_POTION_TIERS, MP_POTION_TIERS, potionPrice } from "../data/potions";

// Pazar ve iksir dükkânı (Faz 2c). Tezgah satırları sunucudaki `market_stalls` tablosundadır;
// eşya alma/verme ve altın bu eylemlerle, tezgah kaydı sunucu kancalarıyla (bkz. server/app.mjs)
// aynı işlemde değişir. Satılan eşya istemcinin söylediği nesne değil, oyuncunun çantasındaki
// gerçek eşyadır; satıcıya ödeme sunucuda satıcının deposuna yazılır.
const fail = (state, reason, extra = {}) => ({ state, result: { ok: false, reason, ...extra } });
const done = (state, extra = {}) => ({ state, result: { ok: true, ...extra } });

const LISTABLE_KINDS = ["armor", "weapon", "accessory", "clanMaterial"];

export const marketReducers = {
  "shop/buyPotion"(state, { potionType, tier, qty }) {
    if (potionType !== "hp" && potionType !== "mp") return fail(state, "invalidPotion");
    const tiers = potionType === "hp" ? HP_POTION_TIERS : MP_POTION_TIERS;
    if (!Number.isInteger(tier) || tier < 1 || tier > tiers.length) return fail(state, "invalidPotion");
    if (!Number.isInteger(qty) || qty < 1 || qty > 999) return fail(state, "invalidAmount");
    const price = potionPrice(potionType, tier) * qty;
    if (state.player.gold < price) return fail(state, "notEnoughGold");
    const result = addItemToInventory({ ...state.player, gold: state.player.gold - price }, makePotionStack(potionType, tier, qty));
    if (!result.added) return fail(state, "purchaseFailed", { detail: result.reason, reasonVars: result.reasonVars });
    return done({ ...state, player: result.player }, { price });
  },

  // Tezgah kaydını (süre, satıcı adı) sunucu kancası yazar; ücret burada altından düşer.
  "market/openStall"(state, { durationHours }) {
    if (!MARKET_DURATIONS_HOURS.includes(durationHours)) return fail(state, "stallOpenFailed");
    const fee = MARKET_DURATION_FEE[durationHours];
    if (state.player.gold < fee) return fail(state, "notEnoughForStallFee", { reasonVars: { fee } });
    return done({ ...state, player: { ...state.player, gold: state.player.gold - fee } }, { fee });
  },

  "market/addItem"(state, { itemId, price, asChest }) {
    if (!Number.isSafeInteger(price) || price <= 0 || price > MARKET_MAX_PRICE) return fail(state, "addFailed");
    const { player } = state;
    if (asChest) {
      const chest = player.chests.find((c) => c.id === itemId);
      if (!chest) return fail(state, "itemNotFound");
      return done({ ...state, player: { ...player, chests: player.chests.filter((c) => c.id !== itemId) } }, { item: { id: chest.id, kind: "chest", tier: chest.tier, special: chest.special } });
    }
    const item = player.inventory.find((i) => i.id === itemId);
    if (!item || !LISTABLE_KINDS.includes(item.kind)) return fail(state, "itemNotFound");
    if (item.noTrade || isFirstPurchaseWeapon(item)) return fail(state, "noTrade");
    return done({ ...state, player: { ...player, inventory: player.inventory.filter((i) => i.id !== itemId) } }, { item });
  },

  // `listing` ({ id, item, price }) sunucu kancasından gelir: sunucudaki gerçek tezgah satırı.
  "market/buy"(state, { listing }) {
    if (!listing || !listing.item || !Number.isSafeInteger(listing.price)) return fail(state, "marketItemGone");
    const { player } = state;
    if (player.gold < listing.price) return fail(state, "notEnoughGold");
    const paid = { ...player, gold: player.gold - listing.price };
    if (listing.item.kind === "chest") {
      return done({ ...state, player: { ...paid, chests: [...paid.chests, { id: listing.item.id, tier: listing.item.tier, special: listing.item.special }] } }, { item: listing.item, price: listing.price });
    }
    const added = addItemToInventory(paid, listing.item);
    if (!added.added) return fail(state, "bagFull", { detail: added.reason });
    return done({ ...state, player: added.player }, { item: listing.item, price: listing.price });
  },

  // Tezgahtan geri alma (erken kapat / süresi dolmuş): sığanlar sandıklara/depoya gider, sığmayanlar
  // tezgahta kalır. `entries` sunucu kancasından gelir (yalnızca bu hesabın kendi tezgah satırları).
  "market/takeBack"(state, { entries }) {
    if (!Array.isArray(entries)) return fail(state, "invalidPayload");
    let player = state.player;
    let bank = state.bank;
    const placedIds = [];
    let placedChests = 0;
    let placedItems = 0;
    for (const entry of entries) {
      if (entry.item.kind === "chest") {
        player = { ...player, chests: [...player.chests, { id: entry.item.id, tier: entry.item.tier, special: entry.item.special }] };
        placedChests++; placedIds.push(entry.id);
        continue;
      }
      const placed = addItemToAnyBankPage(entry.item, bank);
      if (placed.added) { bank = placed.bank; placedItems++; placedIds.push(entry.id); }
    }
    return done({ ...state, player, bank }, { placedIds, placedChests, placedItems, left: entries.length - placedIds.length });
  },
};

