import { createFight, stepFight, stockOf } from "./fight";
import { applyFightAftermath } from "./battle";
import { applyDeathPenalty, playerMaxHp, playerMaxMp } from "../utils/player";

// Paylaşımlı hedeflere (Dünya Canavarı, klan zindanı) tek bir vuruş (Faz 3d). Hasarı artık istemci söylemez:
// istemci yalnızca eylemi (saldır / beceri / pot) bildirir, sunucu aynı savaş motoruyla (game/fight.js) vuruşu,
// hasarı, canavarın karşılığını, aşınmayı ve harcanan potu kendisi hesaplar. Oyuncunun savaştaki can/mana/bekleme/
// güçlendirme durumu sunucuda tutulur (`shared_fighters`); 60 sn vuruş yapılmazsa oyuncu dinlenmiş sayılır.
// Reducer saf kalır: ayrıca gereken her şey (kayıtlı savaşçı, paylaşımlı can, tohum) sunucu kancasından gelir.
const fail = (state, reason, extra = {}) => ({ state, result: { ok: false, reason, ...extra } });
const done = (state, extra = {}) => ({ state, result: { ok: true, ...extra } });

export const SHARED_REST_MS = 60000;

export const sharedReducers = {
  "shared/attack"(state, { fighter, monster, sharedHp, action, seed, now }) {
    if (!monster || !Number.isFinite(monster.hp) || !Number.isFinite(sharedHp) || !Number.isFinite(now)) return fail(state, "noServerData");
    const { player } = state;
    let base = fighter && Number.isFinite(fighter.turn) ? fighter : createFight(player, monster, seed);
    if (fighter && now - (fighter.lastAt || 0) > SHARED_REST_MS) base = { ...base, hp: playerMaxHp(player), mp: playerMaxMp(player) };
    const fight = { ...base, monsterHp: Math.max(1, sharedHp), monsterMaxHp: monster.hp, stock: stockOf(player), used: { hp: {}, mp: {} }, wear: { weapon: 0, armor: 0 }, ended: null };
    const out = stepFight(fight, player, monster, 65, action);
    if (out.error) return fail(state, out.error);
    const f = out.fight;
    const damage = Math.max(0, Math.min(sharedHp, fight.monsterHp - f.monsterHp));
    let next = applyFightAftermath(player, f);
    let xpLost = 0;
    if (f.ended === "lose") {
      const penalty = applyDeathPenalty(next);
      next = penalty.player;
      xpLost = penalty.xpLost;
    }
    const persisted = f.ended === "lose" ? null : { seed: f.seed, turn: f.turn, hp: f.hp, mp: f.mp, buffs: f.buffs, dot: f.dot, skillCooldowns: f.skillCooldowns, potionCooldowns: f.potionCooldowns, lastAt: now };
    return done({ ...state, player: next }, { events: out.events, damage, died: f.ended === "lose", targetDown: f.ended === "win", xpLost, fighter: persisted, hp: f.hp, mp: f.mp, skillCooldowns: f.skillCooldowns, potionCooldowns: f.potionCooldowns, buffs: f.buffs, dot: f.dot });
  },
};
