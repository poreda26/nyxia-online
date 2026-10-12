import { COMMUNITY_PLATFORMS, COMMUNITY_REWARD } from "../data/communityReward";
import { highestUnlockedMap } from "../data/maps";
import { addItemToInventory, addItemToAnyBankPage, makePotionStack, makeScrollStack } from "../utils/inventory";
import { MAX_GOLD } from "../utils/player";
import { grantBoostPremiumMs, applyPremium, activePremiumTier, makePremiumVoucher } from "../utils/premium";
import { PREMIUM_TIERS } from "../data/premium";

const fail = (state, reason, extra = {}) => ({ state, result: { ok: false, reason, ...extra } });
const done = (state, extra = {}) => ({ state, result: { ok: true, ...extra } });

// Çanta doluysa depoya, ikisi de doluysa eylem tamamen reddedilir (ödül kaybolmaz, tekrar denenir).
function place(player, bank, item) {
  const toBag = addItemToInventory(player, item);
  if (toBag.added) return { player: toBag.player, bank };
  const toBank = addItemToAnyBankPage(item, bank);
  if (toBank.added) return { player, bank: toBank.bank };
  return null;
}

// Eşyayı çantada ya da depoda bulur.
function findVoucher(state, itemId) {
  const inBag = state.player.inventory.find((i) => i.id === itemId && i.kind === "premiumVoucher");
  if (inBag) return { item: inBag, where: "bag" };
  for (let page = 0; page < state.bank.length; page++) {
    const item = state.bank[page].find((i) => i.id === itemId && i.kind === "premiumVoucher");
    if (item) return { item, where: "bank", page };
  }
  return null;
}
const takeOne = (list, itemId) => list.flatMap((i) => (i.id !== itemId ? [i] : (i.count || 1) <= 1 ? [] : [{ ...i, count: i.count - 1 }]));

export const communityReducers = {
  // Topluluk ödülü. `diamonds` (varsa) sunucunun kasasındaki ödülden sonraki bakiyedir; yoksa (yerel mod) burada eklenir.
  "social/claim"(state, { platform, diamonds }) {
    if (!COMMUNITY_PLATFORMS.includes(platform)) return fail(state, "invalidReward");
    const claims = state.player.socialClaims || [];
    if (claims.includes(platform)) return fail(state, "alreadyClaimed");
    const potionTier = Math.min(4, highestUnlockedMap(state.player.level).tier);
    const items = [
      makePotionStack("hp", potionTier, COMMUNITY_REWARD.hpPotions),
      makePotionStack("mp", potionTier, COMMUNITY_REWARD.mpPotions),
      makePremiumVoucher(COMMUNITY_REWARD.premiumTier, COMMUNITY_REWARD.premiumHours * 3600000, { track: "boost", noTrade: true }),
    ];
    let player = { ...state.player, diamonds: Number.isSafeInteger(diamonds) ? diamonds : (state.player.diamonds || 0) + COMMUNITY_REWARD.diamonds, socialClaims: [...claims, platform] };
    let bank = state.bank;
    for (const item of items) {
      const placed = place(player, bank, item);
      if (!placed) return fail(state, "bagFull");
      player = placed.player; bank = placed.bank;
    }
    return done({ ...state, player, bank }, { platform });
  },

  // Posta ödülü (yönetici hediyesi). Yük sunucu kancasından gelir; elmas kasadan, `diamonds` ödülden sonraki bakiyedir.
  "mail/claim"(state, { gold, diamonds, vouchers, scrolls }) {
    const items = [];
    for (const v of Array.isArray(vouchers) ? vouchers : []) {
      if (!["mythic", "apex"].includes(v?.tier) || !Number.isSafeInteger(v.hours) || v.hours < 1 || v.hours > 720) return fail(state, "invalidReward");
      items.push(makePremiumVoucher(v.tier, v.hours * 3600000, { track: "boost", noTrade: true, count: Math.min(10, Math.max(1, Number(v.count) || 1)) }));
    }
    for (const s of Array.isArray(scrolls) ? scrolls : []) {
      if (!Number.isSafeInteger(s?.tier) || s.tier < 1 || s.tier > 6) return fail(state, "invalidReward");
      items.push(makeScrollStack(s.tier, Math.min(50, Math.max(1, Number(s.count) || 1))));
    }
    let player = { ...state.player };
    if (Number.isSafeInteger(gold) && gold > 0) player.gold = Math.min(MAX_GOLD, (player.gold || 0) + gold);
    if (Number.isSafeInteger(diamonds)) player.diamonds = diamonds;
    let bank = state.bank;
    for (const item of items) {
      const placed = place(player, bank, item);
      if (!placed) return fail(state, "bagFull");
      player = placed.player; bank = placed.bank;
    }
    return done({ ...state, player, bank });
  },

  // Premium kuponunu kullanır (çantadan ya da depodan). Katman/süre eşyanın kendisinden gelir; sunucu hakkı aynı işlemde yazar.
  "premium/useVoucher"(state, { itemId }) {
    const found = findVoucher(state, itemId);
    if (!found) return fail(state, "itemNotFound");
    const { item } = found;
    const tier = PREMIUM_TIERS[item.premiumTier];
    if (!tier || !Number.isSafeInteger(item.durationMs) || item.durationMs <= 0) return fail(state, "invalidVoucher");
    const now = Date.now();
    let player = state.player;
    let bank = state.bank;
    let activate;
    if (item.track === "premium") {
      const active = activePremiumTier(player);
      if (active && active.id !== item.premiumTier && PREMIUM_TIERS[active.id].price > tier.price) return fail(state, "higherPremiumActive");
      const applied = applyPremium(player, item.premiumTier, bank, item.durationMs, now);
      player = applied.player; bank = applied.bank;
      activate = { track: "premium", tier: item.premiumTier, expiresAt: applied.expiresAt };
    } else {
      player = grantBoostPremiumMs(player, item.premiumTier, item.durationMs, now);
      activate = { track: "boost", tier: item.premiumTier, expiresAt: player.premiumBoost.expiresAt };
    }
    if (found.where === "bag") player = { ...player, inventory: takeOne(player.inventory, itemId) };
    else bank = bank.map((p, i) => (i === found.page ? takeOne(p, itemId) : p));
    return done({ ...state, player, bank }, { activate });
  },
};
