import { CLASSES } from "../data/classes";
import { potionAmount, potionTiersFor } from "../data/potions";
import { wingDexBonus } from "../data/wings";
import { totalStats, playerDef, playerMaxHp, playerMaxMp, armorSetDamageReduction } from "../utils/player";
import { mitigate, hitChance, varyDamage, MONSTER_DEF_K, PLAYER_DEF_K } from "../utils/combat";
import { classSkills, computeSkillDamage, computeSkillHeal, refreshSkillBuff } from "../utils/skills";

// Savaş motoru (Faz 3d): tek bir savaşın tur tur hesabı, SAF ve tohumludur. İstemci savaşı bu motorla
// oynar (anında geri bildirim); sunucu aynı motorla, kendi verdiği tohum ve oyuncunun gönderdiği eylem
// dizisiyle savaşı baştan oynatıp sonucu kendisi bulur (bkz. game/battle.js `battle/settle`). Rastgelelik
// yalnızca tohumdan gelir, sırası sabittir; bu yüzden istemci ne vurduğunu/ne düştüğünü seçemez.
// Eylem: { type: "attack" } | { type: "skill", id } | { type: "potion", kind: "hp" | "mp" }.
export const POTION_COOLDOWN_TURNS = 2;
export const MIN_TURN_MS = 300; // gerçek oyunda bir eylemin en kısa süresi (kilit 320 ms); sunucu süre tabanı bunun ucuz bir alt sınırıdır
export const MAX_FIGHT_ACTIONS = 4000;

const nextSeed = (seed) => (Math.imul(seed, 1664525) + 1013904223) >>> 0;

export function stockOf(player) {
  const stock = { hp: {}, mp: {} };
  for (const item of player.inventory || []) {
    if (item.kind === "potion" && (item.potionType === "hp" || item.potionType === "mp") && item.count > 0) {
      stock[item.potionType][item.tier] = (stock[item.potionType][item.tier] || 0) + item.count;
    }
  }
  return stock;
}

export function createFight(player, monster, seed) {
  return {
    seed: (seed >>> 0) || 1,
    turn: 0,
    monsterHp: monster.hp,
    monsterMaxHp: monster.hp,
    hp: playerMaxHp(player),
    mp: playerMaxMp(player),
    buffs: [],
    dot: null,
    skillCooldowns: {},
    potionCooldowns: { hp: 0, mp: 0 },
    wear: { weapon: 0, armor: 0 },
    stock: stockOf(player),
    used: { hp: {}, mp: {} },
    ended: null, // "win" | "lose"
  };
}

const buffMult = (buffs, stat) => buffs.filter((b) => b.stat === stat).reduce((m, b) => m * b.mult, 1);

export function bestPotionTier(fight, kind) {
  for (let tier = 1; tier <= potionTiersFor(kind).length; tier++) if ((fight.stock[kind]?.[tier] || 0) > 0) return tier;
  return null;
}

// Eylemin şimdi yapılıp yapılamayacağı (durumu değiştirmez). Hata kodu arayüz mesajına da çevrilir.
export function checkAction(fight, player, action) {
  if (fight.ended) return "ended";
  if (!action || typeof action !== "object") return "invalidAction";
  if (action.type === "attack") return null;
  if (action.type === "skill") {
    const skill = classSkills(player.class).find((s) => s.id === action.id);
    if (!skill || !(player.skills?.known || []).includes(skill.id)) return "unknownSkill";
    if ((fight.skillCooldowns[skill.id] || 0) > 0) return "skillCooldown";
    if (fight.mp < skill.mpCost) return "noMana";
    return null;
  }
  if (action.type === "potion") {
    if (action.kind !== "hp" && action.kind !== "mp") return "invalidAction";
    if ((fight.potionCooldowns[action.kind] || 0) > 0) return "potionCooldown";
    if (!bestPotionTier(fight, action.kind)) return "noPotion";
    return null;
  }
  return "invalidAction";
}

// Bir oyuncu eylemi + (canavar hâlâ ayaktaysa) canavarın karşılığı. Dönen `events` arayüzün çizimi içindir.
export function stepFight(fight, player, monster, levelCap, action) {
  const error = checkAction(fight, player, action);
  if (error) return { fight, events: [], error };

  const s = {
    ...fight,
    turn: fight.turn + 1,
    buffs: fight.buffs.map((b) => ({ ...b })),
    dot: fight.dot ? { ...fight.dot } : null,
    skillCooldowns: { ...fight.skillCooldowns },
    potionCooldowns: { ...fight.potionCooldowns },
    wear: { ...fight.wear },
    stock: { hp: { ...fight.stock.hp }, mp: { ...fight.stock.mp } },
    used: { hp: { ...fight.used.hp }, mp: { ...fight.used.mp } },
  };
  const rng = () => { s.seed = nextSeed(s.seed); return s.seed / 4294967296; };
  const randInt = (min, max) => Math.floor(rng() * (max - min + 1)) + min;
  const events = [];

  const cls = CLASSES[player.class];
  const atk = totalStats(player).atk;
  const def = playerDef(player);
  const dex = player.stats.dex + wingDexBonus(player);
  const maxHp = playerMaxHp(player);

  // 1) Süregelen etkiler: dot vurur, sayaçlar birer azalır.
  if (s.dot && s.dot.turnsLeft > 0) {
    s.monsterHp = Math.max(0, s.monsterHp - s.dot.dmgPerTurn);
    events.push({ kind: "dot", dmg: s.dot.dmgPerTurn });
  }
  s.dot = s.dot && s.dot.turnsLeft > 1 ? { ...s.dot, turnsLeft: s.dot.turnsLeft - 1 } : null;
  s.buffs = s.buffs.map((b) => ({ ...b, turnsLeft: b.turnsLeft - 1 })).filter((b) => b.turnsLeft > 0);
  for (const id of Object.keys(s.skillCooldowns)) s.skillCooldowns[id] = Math.max(0, s.skillCooldowns[id] - 1);
  for (const kind of Object.keys(s.potionCooldowns)) s.potionCooldowns[kind] = Math.max(0, s.potionCooldowns[kind] - 1);
  const atkMult = buffMult(s.buffs, "atk");

  const usePotionNow = () => {
    const kind = action.kind;
    const tier = bestPotionTier(s, kind);
    s.stock[kind][tier] -= 1;
    s.used[kind][tier] = (s.used[kind][tier] || 0) + 1;
    s.potionCooldowns[kind] = POTION_COOLDOWN_TURNS;
    const cur = kind === "hp" ? s.hp : s.mp;
    const cap = kind === "hp" ? maxHp : playerMaxMp(player);
    const next = Math.min(cap, cur + potionAmount(kind, tier));
    if (kind === "hp") s.hp = next; else s.mp = next;
    events.push({ kind: "potion", potion: kind, tier, healed: next - cur });
  };

  // Canavar etkilerden ölürse eylem yalnızca bedelini öder (mana / bekleme / pot), vuruş yapılmaz.
  if (s.monsterHp <= 0) {
    if (action.type === "skill") {
      const skill = classSkills(player.class).find((x) => x.id === action.id);
      s.mp -= skill.mpCost;
      s.skillCooldowns[skill.id] = skill.cooldown;
    } else if (action.type === "potion") usePotionNow();
    s.ended = "win";
    return { fight: s, events };
  }

  // 2) Oyuncunun eylemi.
  if (action.type === "attack") {
    const crit = rng() < cls.crit;
    const hit = rng() < hitChance(dex, monster.atk, player.level);
    const dmg = hit ? varyDamage(mitigate((cls.atk + atk * 0.9) * atkMult * (crit ? 1.8 : 1), monster.def, MONSTER_DEF_K), rng) : 0;
    s.monsterHp = Math.max(0, s.monsterHp - dmg);
    if (hit) s.wear.weapon += 1;
    events.push({ kind: "attack", hit, crit, dmg });
  } else if (action.type === "skill") {
    const skill = classSkills(player.class).find((x) => x.id === action.id);
    const e = skill.effect;
    s.skillCooldowns[skill.id] = skill.cooldown;
    s.mp -= skill.mpCost;
    if (e.type === "damage" || e.type === "execute") {
      const dmg = Math.max(1, Math.round(computeSkillDamage(skill, { clsAtk: cls.atk, atk, monsterDef: monster.def, monsterHpPct: s.monsterHp / s.monsterMaxHp, rand: randInt }) * atkMult));
      s.monsterHp = Math.max(0, s.monsterHp - dmg);
      events.push({ kind: "skill", skillId: skill.id, effect: e.type, dmg });
    } else if (e.type === "heal") {
      const amount = computeSkillHeal(skill, maxHp);
      const healed = Math.min(amount, maxHp - s.hp);
      s.hp = Math.min(maxHp, s.hp + amount);
      events.push({ kind: "skill", skillId: skill.id, effect: "heal", amount, healed });
    } else if (e.type === "buffAtk" || e.type === "buffDef") {
      s.buffs = refreshSkillBuff(s.buffs, e);
      events.push({ kind: "skill", skillId: skill.id, effect: "buff" });
    } else if (e.type === "dot") {
      const perTick = computeSkillDamage(skill, { clsAtk: cls.atk, atk, monsterDef: monster.def, monsterHpPct: 1, rand: () => 0 });
      s.dot = { dmgPerTurn: Math.max(1, Math.round(perTick * atkMult)), turnsLeft: e.turns };
      events.push({ kind: "skill", skillId: skill.id, effect: "dot" });
    }
  } else {
    usePotionNow();
  }

  if (s.monsterHp <= 0) { s.ended = "win"; return { fight: s, events }; }

  // 3) Canavarın karşılığı.
  const hits = rng() < hitChance(monster.atk, dex, levelCap);
  const defMult = buffMult(s.buffs, "def");
  const reduction = armorSetDamageReduction(player, "monster");
  const mdmg = hits ? Math.max(1, Math.round(mitigate(monster.atk, def * defMult, PLAYER_DEF_K) * (1 - reduction) + randInt(-2, 3))) : 0;
  s.hp = Math.max(0, s.hp - mdmg);
  if (hits) s.wear.armor += 1;
  events.push({ kind: "monster", hit: hits, dmg: mdmg });
  if (s.hp <= 0) s.ended = "lose";
  return { fight: s, events };
}

// Sunucu doğrulaması: eylem dizisini baştan oynatır. Geçersiz/bitişten sonra eylem varsa hata döner.
export function replayFight(player, monster, levelCap, seed, actions) {
  if (!Array.isArray(actions) || actions.length > MAX_FIGHT_ACTIONS) return { error: "invalidLog" };
  let fight = createFight(player, monster, seed);
  for (const action of actions) {
    if (fight.ended) return { error: "actionsAfterEnd" };
    const out = stepFight(fight, player, monster, levelCap, action);
    if (out.error) return { error: out.error };
    fight = out.fight;
  }
  return { fight };
}

// Paylaşımlı hedeflere (Dünya Canavarı, klan zindanı) tek bir isteğin verebileceği EN YÜKSEK hasar: oyuncunun bilinen
// becerileri ve gücüyle, şanslı zar ve kritik varsayılarak hesaplanır. Sunucu bunun üstündeki hasarı reddeder; dürüst
// istemci bu sınırın altında kalır (bkz. server/app.mjs).
export function maxActionDamage(player, monsterDef) {
  const cls = CLASSES[player.class];
  if (!cls) return 0;
  const base = cls.atk + totalStats(player).atk * 0.9;
  const known = classSkills(player.class).filter((s) => (player.skills?.known || []).includes(s.id));
  const buff = known.filter((s) => s.effect.type === "buffAtk").reduce((m, s) => Math.max(m, s.effect.mult || 1), 1);
  let best = mitigate(base * 1.8 * buff, monsterDef, MONSTER_DEF_K);
  let dot = 0;
  for (const skill of known) {
    const e = skill.effect;
    if (e.type === "damage" || e.type === "execute") best = Math.max(best, mitigate(base * (e.mult || 1) * buff, monsterDef, MONSTER_DEF_K));
    else if (e.type === "dot") dot = Math.max(dot, mitigate(base * (e.mult || 1) * buff, monsterDef, MONSTER_DEF_K));
  }
  return Math.ceil((best + dot) * (1 + 1 / 13) * 1.1) + 5;
}
