import { allocateStat, respecStats } from "../utils/player";
import { STAT_CAP } from "../data/stats";
import { unlockSkill, setLoadoutSlot } from "../utils/skills";
import { setActiveTitle } from "../utils/achievements";

// Karakter gelişimi (Faz 3b): statü dağıtma/sıfırlama, beceri öğrenme/kuşanma, unvan.
const fail = (state, reason, extra = {}) => ({ state, result: { ok: false, reason, ...extra } });
const done = (state, extra = {}) => ({ state, result: { ok: true, ...extra } });

const MAX_ALLOCATE_PER_CALL = 200;

// Beceri öğrenme nedenleri çeviri anahtarı + değişkenler olarak döner; metni arayüz kendi dilinde yazar.
const keyT = (key, vars) => JSON.stringify({ key, vars: vars || {} });

export const characterReducers = {
  // Basılı tutunca hızlı dağıtım tek istekte yığınlanır: count kadar tekrar, sınırlarda kendiliğinden durur.
  "stat/allocate"(state, { stat, count = 1 }) {
    if (typeof stat !== "string" || !Object.hasOwn(state.player.stats, stat)) return fail(state, "invalidStat");
    if (!Number.isInteger(count) || count < 1 || count > MAX_ALLOCATE_PER_CALL) return fail(state, "invalidAmount");
    let player = state.player;
    let applied = 0;
    for (let i = 0; i < count; i++) {
      const next = allocateStat(player, stat);
      if (next === player) break;
      player = next;
      applied++;
    }
    if (applied === 0) return fail(state, player.statPoints <= 0 ? "noStatPoints" : "statCap", { cap: STAT_CAP });
    return done({ ...state, player }, { applied });
  },

  "stat/respec"(state) {
    const r = respecStats(state.player);
    if (!r.reset) return fail(state, r.reason, r.reasonVars ? { reasonVars: r.reasonVars } : {});
    return done({ ...state, player: r.player }, { statPoints: r.player.statPoints, cost: r.cost });
  },

  "skill/learn"(state, { skillId }) {
    const r = unlockSkill(state.player, skillId, keyT, "tr");
    if (!r.unlocked) return fail(state, "skillLocked", { detail: r.reason });
    return done({ ...state, player: r.player });
  },

  "skill/loadout"(state, { slot, skillId }) {
    const { player } = state;
    const known = player.skills?.known || [];
    if (!Number.isInteger(slot) || slot < 0 || slot >= (player.skills?.loadout?.length ?? 5)) return fail(state, "invalidSlot");
    if (skillId !== null && !known.includes(skillId)) return fail(state, "skillNotKnown");
    return done({ ...state, player: setLoadoutSlot(player, slot, skillId) });
  },

  "title/set"(state, { achievementId }) {
    return done({ ...state, player: setActiveTitle(state.player, achievementId ?? null) });
  },
};

