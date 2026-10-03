// Elmas kasası ve satın alınan haklar (sunucu otoritesi) — bkz. server/wallet.mjs, server/entitlements.mjs.
import { call } from "../utils/api";

export const fetchWallet = (characterKey = null) => call(characterKey ? `wallet?characterKey=${encodeURIComponent(characterKey)}` : "wallet", "GET");
export const spendDiamonds = (kind, key = null, ref = null, characterKey = null) => call("wallet/spend", "POST", { kind, key, ref, characterKey });
export const claimDailyLoginServer = (characterKey) => call("wallet/daily-login", "POST", { characterKey });
export const claimWeeklyRankServer = (characterKey, weekId, rank) => call("wallet/weekly-rank", "POST", { characterKey, weekId, rank });
export const gmGrantDiamonds = (amount) => call("wallet/gm-grant", "POST", { amount });
export const gmGrantPremium = (characterKey, tier) => call("entitlements/gm-premium", "POST", { characterKey, tier });
