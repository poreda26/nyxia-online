import { rand, pick, uid } from "./random";
import { CLASSES } from "../data/classes";
import { totalStats, playerDef, playerMaxHp } from "./player";
import { ghostNamesForRace } from "../data/warzoneNames";
import { mitigate, MONSTER_DEF_K, PLAYER_DEF_K } from "./combat";

export function opposingRace(race) { return race === "karus" ? "elmorad" : "karus"; }

// Oyuncunun kendi gücüne (sınıf + ekipman) göre ±15% varyasyonla ölçeklenen
// bir hayalet rakip üretir — her seviyede/ekipmanda adil ama garanti
// olmayan bir düello sağlar. Irk her zaman oyuncunun tersi (bkz.
// data/races.js) — aynı ırktan biriyle PK mantıksız olurdu.
export function spawnGhost(player) {
  const ownCls = CLASSES[player.class];
  const { atk: gearAtk } = totalStats(player);
  const basePower = ownCls.atk + gearAtk * 0.9;
  const baseDef = playerDef(player);
  const baseHp = playerMaxHp(player);
  const variance = () => 0.85 + Math.random() * 0.3;

  const race = opposingRace(player.race);
  const cls = pick(Object.keys(CLASSES));
  const maxHp = Math.max(20, Math.round(baseHp * variance()));

  return {
    id: uid(),
    name: pick(ghostNamesForRace(race)),
    race,
    cls,
    color: CLASSES[cls].color,
    hp: maxHp,
    maxHp,
    atk: Math.max(1, Math.round(basePower * variance())),
    def: Math.max(0, Math.round(baseDef * variance())),
  };
}

// Oyuncunun düellodaki bir vuruşunun hayalete verdiği hasar —
// BattleTab.jsx#attack'taki formülle aynı mantık.
export function ghostDamageFromPlayer(cls, atk, ghost, isCrit) {
  return Math.max(1, Math.round(mitigate((cls.atk + atk * 0.9) * (isCrit ? 1.8 : 1), ghost.def, MONSTER_DEF_K) + rand(-2, 3)));
}

// Hayaletin oyuncuya vuruşu — BattleTab.jsx#resolveMonsterTurn'daki
// canavar-karşılığı formülle aynı mantık.
export function playerDamageFromGhost(ghost, defenderDef) {
  return Math.max(1, Math.round(mitigate(ghost.atk, defenderDef, PLAYER_DEF_K) + rand(-2, 3)));
}

// Hayalet %30 altı candayken küçük ihtimalle kendini iyileştirir — Mana
// Çalma (suppressHeal) PvP becerisinin gerçek bir karşılığı olsun diye var.
// healBlocked true ise (oyuncu Mana Çalma kullandıysa) hiç denemez. Yeni
// can miktarını döner, iyileşme olmadıysa null.
export function ghostSelfHeal(ghost, healBlocked) {
  if (healBlocked) return null;
  if (ghost.hp <= 0 || ghost.hp / ghost.maxHp > 0.3) return null;
  if (Math.random() > 0.35) return null;
  const healed = Math.min(ghost.maxHp, ghost.hp + Math.round(ghost.maxHp * 0.2));
  return healed === ghost.hp ? null : healed;
}

// Bir tick'te alandaki her hayaletin Dünya Canavarı'na vurma denemesi —
// vuran her hayaletin kümülatif hasarı ayrı tutulur (tap-race için, bkz.
// data/warzone.js#WORLD_BOSS, components/WarzoneTab.jsx).
export function tickWorldBoss(boss, currentHp, ghosts, damageByGhost) {
  let hp = currentHp;
  const lines = [];
  const nextDamage = { ...damageByGhost };
  for (const g of ghosts) {
    if (hp <= 0) break;
    if (Math.random() >= 0.7) continue;
    const dmg = Math.max(1, Math.round(mitigate(g.atk * 1.1, boss.def, MONSTER_DEF_K) + rand(-3, 4)));
    hp = Math.max(0, hp - dmg);
    nextDamage[g.id] = (nextDamage[g.id] || 0) + dmg;
    lines.push(`${g.name} ${boss.name}'a ${dmg} hasar verdi.`);
  }
  return { hp, lines, damageByGhost: nextDamage };
}
