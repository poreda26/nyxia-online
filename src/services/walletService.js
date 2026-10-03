// Elmas kasası (sunucu otoritesi) — bkz. server/wallet.mjs.
import { call } from "../utils/api";

export const fetchWallet = () => call("wallet", "GET");
export const spendDiamonds = (kind, key = null, ref = null) => call("wallet/spend", "POST", { kind, key, ref });
export const claimDailyLoginServer = (characterKey) => call("wallet/daily-login", "POST", { characterKey });
export const claimWeeklyRankServer = (characterKey, weekId, rank) => call("wallet/weekly-rank", "POST", { characterKey, weekId, rank });
export const gmGrantDiamonds = (amount) => call("wallet/gm-grant", "POST", { amount });
