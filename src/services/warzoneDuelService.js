// Faz 5 — gerçek PvP. Asenkron model: rakip, sunucudan rastgele seçilen
// GERÇEK bir başka hesabın en son senkronlanmış karakter anlık görüntüsü
// (rakip o an çevrimiçi olmak zorunda değil, hiçbir şey kaybetmez/kazanmaz).
// Düello hesabı hâlâ istemcide (bkz. utils/duelEngine.js, değişmedi) —
// sunucu sadece gerçek bir rakip + adil bir seed sağlıyor. Bkz.
// server/app.mjs'in /api/warzone/duel/opponent üstündeki not.
import { call } from "../utils/api";

export const fetchOpponent = (level) => call(`warzone/duel/opponent?level=${encodeURIComponent(level)}`, "GET");
export const reportDuelResult = (opponentAccountId, winner) => call("warzone/duel/result", "POST", { opponentAccountId, winner });
