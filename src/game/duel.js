import { createDuel, stepDuel } from "../utils/duelEngine";
import { awardNationalPoint, penalizeNationalPoint, applyWeeklyRollover } from "../utils/nationalPoint";

// Savaş Alanı düellosu ve haftalık geçiş (Faz 3c). Düello motoru saf ve deterministiktir: sonucu sunucu,
// kendi bildiği oyuncu durumu + sunucunun seçtiği rakip anlık görüntüsü + sunucunun verdiği tohumla
// AYNEN hesaplar; istemci aynı motorla yalnızca animasyonu oynatır. Ödül/ceza sonucu sunucudan gelir.
// Rakip, tohum ve bekleyen düello kaydı sunucu kancalarındandır (server/app.mjs `duel/*`).
const fail = (state, reason, extra = {}) => ({ state, result: { ok: false, reason, ...extra } });
const done = (state, extra = {}) => ({ state, result: { ok: true, ...extra } });

const MAX_STEPS = 120;

export function simulateDuel(player, opponent, seed) {
  let engine = createDuel(player, opponent, { seed, fullHealth: true });
  for (let i = 0; i < MAX_STEPS && !engine.finished; i++) engine = stepDuel(engine);
  return engine.finished ? engine.winner : null;
}

export const duelReducers = {
  // Yeni düello: önceki bekleyen düello bırakıldıysa (`forfeit`) yenilgi sayılır.
  "duel/start"(state, { opponentAccountId, opponentName, opponent, seed, forfeit }) {
    if (!opponent || !Number.isSafeInteger(seed)) return fail(state, "noOpponent");
    const player = forfeit ? penalizeNationalPoint(state.player) : state.player;
    return done({ ...state, player }, { opponentAccountId, opponentName, opponent, seed, forfeited: !!forfeit });
  },

  "duel/resolve"(state, { opponent, seed }) {
    if (!opponent || !Number.isSafeInteger(seed)) return fail(state, "noDuel");
    const winner = simulateDuel(state.player, opponent, seed);
    if (winner === 0) {
      const awarded = awardNationalPoint(state.player);
      const player = { ...awarded.player, milestones: { ...awarded.player.milestones, duelsWon: (awarded.player.milestones?.duelsWon || 0) + 1 } };
      return done({ ...state, player }, { winner: "me", gain: awarded.gain });
    }
    if (winner === 1) return done({ ...state, player: penalizeNationalPoint(state.player) }, { winner: "opponent" });
    return done(state, { winner: "draw" });
  },

  "duel/concede"(state, { opponent }) {
    if (!opponent) return fail(state, "noDuel");
    return done({ ...state, player: penalizeNationalPoint(state.player) }, { winner: "opponent" });
  },

  // Hafta değişince haftalık puan sıfırlanır; ilk 3'e girdiyse bekleyen elmas talebi (sunucu doğrular) oluşur.
  "week/rollover"(state) {
    const r = applyWeeklyRollover(state.player);
    return done({ ...state, player: r.player }, { rank: r.rank, rolled: r.player !== state.player });
  },
};
