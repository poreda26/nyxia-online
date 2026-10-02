import { PREMIUM_TIERS } from "../data/premium";
import { BANK_PAGES } from "./player";
import { addItemToInventory, makeBonusScrollStack } from "./inventory";

const DAY_MS = 24 * 60 * 60 * 1000;

// Satın alınan Premium (player.premium) ile Çark'tan gelen geçici Premium
// (player.premiumBoost) AYRI tutulur: çark ödülü satın alınmış aboneliği ne
// ezer ne kısaltır. Aktif olan ikisinden üst katman (fiyatı yüksek) sayılır.
function activeEntry(entry) {
  if (!entry?.tier || !entry.expiresAt || entry.expiresAt <= Date.now()) return null;
  return PREMIUM_TIERS[entry.tier] ? entry : null;
}

function effectivePremium(player) {
  const bought = activeEntry(player.premium);
  const boost = activeEntry(player.premiumBoost);
  if (!bought) return boost;
  if (!boost) return bought;
  return PREMIUM_TIERS[boost.tier].price > PREMIUM_TIERS[bought.tier].price ? boost : bought;
}

export function activePremiumTier(player) {
  const entry = effectivePremium(player);
  return entry ? PREMIUM_TIERS[entry.tier] : null;
}

export function premiumDaysLeft(player) {
  const entry = effectivePremium(player);
  if (!entry) return 0;
  return Math.max(0, Math.ceil((entry.expiresAt - Date.now()) / DAY_MS));
}

// Çark ödülü: aynı katman aktifse süre uzar, değilse şimdiden başlar.
export function grantBoostPremium(player, tierId, days) {
  if (!PREMIUM_TIERS[tierId]) return player;
  const current = activeEntry(player.premiumBoost);
  const base = current?.tier === tierId ? current.expiresAt : Date.now();
  return { ...player, premiumBoost: { tier: tierId, expiresAt: base + days * DAY_MS } };
}

export function premiumGoldMultiplier(player) { return activePremiumTier(player)?.goldMult ?? 1; }
export function premiumExpMultiplier(player) { return activePremiumTier(player)?.expMult ?? 1; }
export function premiumDropMultiplier(player) { return activePremiumTier(player)?.dropMult ?? 1; }
export function premiumSellMultiplier(player) { return activePremiumTier(player)?.sellMult ?? 1; }
export function premiumRepairDiscount(player) { return activePremiumTier(player)?.repairDiscount ?? 0; }
export function premiumNpBonus(player) { return activePremiumTier(player)?.nationalPointBonus ?? 0; }
export function premiumNpLossReduction(player) { return activePremiumTier(player)?.nationalPointLossReduction ?? 0; }

// Otomatik Saldırı her iki katmanda da açık bir perk (bkz. data/premium.js
// perks) — tek şart aktif bir Premium'un olması, tier farketmiyor.
export function hasAutoBattleAccess(player) { return !!activePremiumTier(player); }

// Buying the SAME tier while it's still active extends the existing expiry
// (time doesn't get wasted); buying a DIFFERENT tier replaces it and starts
// a fresh 15-day window from now, matching how most VIP-tier games handle
// switching rather than stacking two different tiers. `bank` is the
// account's shared depot (see App.jsx's account.bank) — passed in and
// returned separately since it no longer lives on the player object.
export function buyPremium(player, tierId, bank) {
  const tier = PREMIUM_TIERS[tierId];
  if (!tier) return { player, bank, bought: false, reason: "invalidPackage" };
  if (player.diamonds < tier.price) return { player, bank, bought: false, reason: "notEnoughDiamonds" };

  const now = Date.now();
  const sameTierActive = player.premium?.tier === tierId && activePremiumTier(player);
  const base = sameTierActive ? player.premium.expiresAt : now;
  const expiresAt = base + tier.durationDays * DAY_MS;

  let nextBank = bank;
  const targetPages = BANK_PAGES + tier.bankBonusPages;
  if (nextBank.length < targetPages) {
    nextBank = [...nextBank, ...Array.from({ length: targetPages - nextBank.length }, () => [])];
  }

  let next = { ...player, diamonds: player.diamonds - tier.price, premium: { tier: tierId, expiresAt } };
  for (let i = 0; i < tier.giftScrolls; i++) {
    const result = addItemToInventory(next, makeBonusScrollStack());
    next = result.player;
  }

  return { player: next, bank: nextBank, bought: true };
}
