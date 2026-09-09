import { ATTACK_DURATION } from './animation';
import { MAPS } from '../data/maps';
import { CLASSES } from '../data/classes';
import { totalStats, playerDef, playerMaxHp, playerMaxMp, damageEquippedDurability, applyDeathPenalty, armorSetDamageReduction, WEAPON_SLOTS, ARMOR_SLOTS } from '../utils/player';
import { mitigate, MONSTER_DEF_K, PLAYER_DEF_K, hitChance } from '../utils/combat';
import { getSkill, computeSkillDamage, computeSkillHeal } from '../utils/skills';
import { bestAvailablePotionTier, usePotion } from '../utils/potions';
import { grantMonsterReward } from '../utils/monsterRewards';

// This module owns transient simulation state; the existing player owns progression.
// Seconds, world pixels and input commands form the future server boundary.
export const WORLD = { width: 1536, height: 1024, speed: 185, edge: 40, map: MAPS[0] };
export const CAMP = { x: 365, y: 665, radius: 160 };
export const NPCS = [
  { id: 'captain', name: 'Kaptan', x: 240, y: 595, tab: 'captain' },
  { id: 'merchant', name: 'Tüccar', x: 395, y: 715, tab: 'market' },
];
export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const spawns = [[710,590,0], [825,680,0], [740,420,0], [1010,470,1], [1120,660,1], [1110,290,2], [900,285,2]];
export function createWorld() {
  return {
    time: 0, actor: { x: CAMP.x, y: CAMP.y, facing: 1, moving: false },
    monsters: spawns.map(([x,y,type], i) => ({ id: `spawn-${i}`, template: WORLD.map.monsters[type], x, y, home: { x,y }, sprite: type + 4, hp: WORLD.map.monsters[type].hp, state: 'idle', cooldown: 1, respawnAt: 0, dot: null, facing: -1 })),
    target: null, attackAt: 0, potionAt: 0, skillAt: {}, buffs: [], effects: [],
    paused: false, death: null, swingUntil: 0, lastCombat: -100, kills: 0,
  };
}
export const inCamp = (world) => distance(world.actor, CAMP) < CAMP.radius;
export const inCombat = (world) => world.monsters.some(m => m.state === 'chase');
export function attackRange(player) {
  return player.class === 'mage' || player.class === 'rogue' || /bow/i.test(player.equipped.mainHand?.name || '') ? 235 : 82;
}
export function selectNearest(world) {
  const live = world.monsters.filter(m => m.hp > 0 && distance(world.actor, m) < 420).sort((a,b) => distance(world.actor,a) - distance(world.actor,b));
  const index = live.findIndex(m => m.id === world.target);
  world.target = live.length ? live[(index + 1) % live.length].id : null;
  return world.target;
}
// Only compact, visible solid footprints block travel. Decorative foliage is passable.
export const OBSTACLES = [
  {x:210,y:270,rx:110,ry:145}, // river at the far west
  {x:565,y:600,rx:35,ry:20},   // rock base, not surrounding leaves
  {x:924,y:414,rx:48,ry:22},
  {x:923,y:837,rx:35,ry:18},
];
export function canStand(x,y) {
  return x>=WORLD.edge && x<=WORLD.width-WORLD.edge && y>=WORLD.edge && y<=WORLD.height-WORLD.edge
    && !OBSTACLES.some(o => ((x-o.x)/(o.rx+3))**2 + ((y-o.y)/(o.ry+3))**2 < 1);
}
function movePosition(actor,dx,dy) {
  if(canStand(actor.x+dx,actor.y+dy)) {actor.x+=dx;actor.y+=dy;return;}
  if(canStand(actor.x+dx,actor.y)) actor.x+=dx;
  if(canStand(actor.x,actor.y+dy)) actor.y+=dy;
}
function clearPath(a,b) {
  const steps=Math.ceil(distance(a,b)/15);
  for(let i=1;i<steps;i++) if(!canStand(a.x+(b.x-a.x)*i/steps,a.y+(b.y-a.y)*i/steps)) return false;
  return true;
}
export function moveActor(actor, x, y, dt) {
  const length = Math.hypot(x,y);
  const scale = Math.max(1, length);
  actor.moving = length > 0.08;
  if (!actor.moving) {actor.walkTime=0;return;}
  const before={x:actor.x,y:actor.y};
  movePosition(actor,x/scale*WORLD.speed*dt,y/scale*WORLD.speed*dt);
  const travelled=distance(before,actor);
  actor.moving=travelled>0.01;
  actor.walkTime=actor.moving?(actor.walkTime||0)+travelled/WORLD.speed:0;
  if(Math.abs(y)>0.08) actor.back=y<0;
  if (Math.abs(x) > 0.08) actor.facing = x > 0 ? 1 : -1;
}
function effect(world, actor, text, color = '#f7d99b') {
  world.effects.push({ x: actor.x, y: actor.y - 62, text, color, until: world.time + 1.1 });
}
function defeat(world, monster, player, events) {
  if (monster.state === 'dead') return player;
  monster.hp = 0; monster.state = 'dead'; monster.respawnAt = world.time + 14; monster.dot = null;
  world.kills++;
  const reward = grantMonsterReward(player, monster.template, WORLD.map);
  events.push({ text: reward.msg, tone: reward.tone });
  effect(world, monster, '+XP · ALTIN', '#ffe3a0');
  return reward.player;
}
function buffMult(world, stat) { return world.buffs.filter(b => b.stat === stat).reduce((n,b) => n*b.mult,1); }
function resetEnemy(monster) {
  monster.state = 'return'; monster.returnLeft = 5; monster.hp = monster.template.hp; monster.dot = null;
}
export function command(world, player, action, random = Math.random) {
  const events = [];
  const fail = (text) => ({ player, events: [{ text, tone: 'warn' }] });
  if (world.paused || world.death) return { player, events };
  if (action.type === 'target') { selectNearest(world); return { player, events }; }
  if (action.type === 'potion') {
    if (world.time < world.potionAt) return { player, events };
    const kind = action.kind === 'mp' ? 'mp' : 'hp';
    if (player[kind] >= (kind === 'hp' ? playerMaxHp(player) : playerMaxMp(player))) return fail(kind === 'hp' ? 'Canın zaten dolu.' : 'Manan zaten dolu.');
    const tier = bestAvailablePotionTier(player, kind);
    if (!tier) return fail('İksirin kalmadı. Kamptaki tüccara uğra.');
    const result = usePotion(player,kind,tier);
    world.potionAt = world.time + 2;
    effect(world, world.actor, `+${result.healed}`, kind === 'hp' ? '#9fffa9' : '#85dfff');
    return { player: result.player, events };
  }
  if (world.time < world.attackAt) return { player, events };
  const skill = action.type === 'skill' ? getSkill(player.class, action.id) : null;
  if (action.type === 'skill' && (!skill || !player.skills.known.includes(skill.id))) return fail('Bu beceri henüz öğrenilmedi.');
  if (skill && world.time < (world.skillAt[skill.id] || 0)) return { player, events };
  if (skill && player.mp < skill.mpCost) return fail('Yeterli mana yok.');
  const selfSkill = skill && ['heal','buffAtk','buffDef'].includes(skill.effect.type);
  let target = world.monsters.find(m => m.id === world.target && m.hp > 0);
  if (!selfSkill) {
    if (!target) { selectNearest(world); target = world.monsters.find(m => m.id === world.target); }
    if (!target) return fail('Bir yaratığa yaklaş ve hedef seç.');
    if (inCamp(world)) return fail('Savaşmak için güvenli bölgeden çık.');
    if (target.state === 'return') return fail('Yaratık yuvasına dönüyor.');
    if (!clearPath(world.actor,target)) return fail('Hedefin önünde bir engel var.');
    if (distance(world.actor, target) > attackRange(player)) return fail('Hedef uzakta. Biraz daha yaklaş.');
  }
  world.attackAt = world.time + 0.65;
  world.swingStarted = world.time;
  world.swingUntil = world.time + ATTACK_DURATION;
  world.actor.moving=false;
  world.actor.walkTime=0;
  let next = player;
  if (skill) {
    next = { ...player, mp: player.mp - skill.mpCost };
    world.skillAt[skill.id] = world.time + Math.max(1.2, skill.cooldown * 1.5);
  }
  if (selfSkill) {
    if (skill.effect.type === 'heal') {
      const amount = Math.min(playerMaxHp(next) - next.hp, computeSkillHeal(skill, playerMaxHp(next)));
      next = { ...next, hp: next.hp + amount }; effect(world,world.actor,`+${amount}`,'#9fffa9');
    } else {
      const stat = skill.effect.type === 'buffAtk' ? 'atk' : 'def';
      world.buffs = world.buffs.filter(b => b.stat !== stat);
      world.buffs.push({ stat, mult: skill.effect.mult, until: world.time + skill.effect.turns*1.5 });
      effect(world,world.actor,skill.name,'#9fdcff');
    }
    return { player: next, events };
  }
  world.actor.facing = target.x >= world.actor.x ? 1 : -1;
  world.actor.back = target.y < world.actor.y-15;
  target.state = 'chase'; world.lastCombat = world.time;
  const crit = !skill && random() < CLASSES[next.class].crit;
  const hit = skill || random() < hitChance(next.stats.dex, target.template.atk, next.level);
  const atk = totalStats(next).atk * buffMult(world,'atk');
  const dmg = !hit ? 0 : skill
    ? computeSkillDamage(skill, { clsAtk: CLASSES[next.class].atk, atk, monsterDef: target.template.def, monsterHpPct: target.hp/target.template.hp, rand: (a,b) => Math.floor(random()*(b-a+1))+a })
    : Math.max(1,Math.round(mitigate((CLASSES[next.class].atk+atk*0.9)*(crit?1.8:1),target.template.def,MONSTER_DEF_K)));
  const ranged=player.class==='rogue'||player.class==='mage';
  world.pendingStrike={targetId:target.id,dmg,hit:!!hit,crit,skill,at:world.time+(ranged?0.40:0.28)};
  if(ranged) world.projectile={kind:player.class==='rogue'?'arrow':'magic',from:{x:world.actor.x,y:world.actor.y-58},to:{x:target.x,y:target.y-40},start:world.time+0.28,end:world.time+0.40};
  return { player: next, events };
}
export function stepWorld(world, player, input, delta, random = Math.random) {
  const events = [];
  if (world.paused || world.death) return { player, events };
  // No catch-up damage or teleport after a suspended browser tab.
  const dt = clamp(delta,0,0.05);
  world.time += dt;
  world.effects = world.effects.filter(e => e.until > world.time);
  world.buffs = world.buffs.filter(b => b.until > world.time);
  if(world.swingUntil>world.time) {world.actor.moving=false;}
  else moveActor(world.actor,input.x,input.y,dt);
  let next = player;
  const strike=world.pendingStrike;
  if(strike && world.time>=strike.at) {
    world.pendingStrike=null;
    const target=world.monsters.find(m=>m.id===strike.targetId && m.hp>0 && m.state!=='return');
    if(target && !inCamp(world) && clearPath(world.actor,target) && distance(world.actor,target)<=attackRange(next)+25) {
      target.hp=Math.max(0,target.hp-strike.dmg);
      effect(world,target,strike.hit?`${strike.crit?'KRİTİK ':''}${strike.dmg}`:'ISKALADI',strike.crit?'#ffbf68':'#fff4d8');
      if(strike.hit) next=damageEquippedDurability(next,WEAPON_SLOTS);
      if(strike.skill?.effect.type==='dot') target.dot={damage:Math.max(1,Math.round(strike.dmg*.45)),left:strike.skill.effect.turns,next:world.time+1.5};
      if(target.hp<=0) next=defeat(world,target,next,events);
    }
  }
  for (const m of world.monsters) {
    if (m.state === 'dead') {
      if (world.time >= m.respawnAt) Object.assign(m,{ x:m.home.x,y:m.home.y,hp:m.template.hp,state:'idle',cooldown:1 });
      continue;
    }
    if (m.state === 'return') {
      m.returnLeft -= dt;
      if(m.returnLeft<=0) {m.x=m.home.x;m.y=m.home.y;m.state='idle';continue;}
      const d = distance(m,m.home);
      if (d < 4) { m.x=m.home.x;m.y=m.home.y;m.state='idle'; }
      else { movePosition(m,(m.home.x-m.x)/d*120*dt,(m.home.y-m.y)/d*120*dt); }
      continue;
    }
    const d = distance(m,world.actor);
    if (inCamp(world) || distance(m,m.home)>290) { if (m.state === 'chase') resetEnemy(m); continue; }
    if (d<145 && clearPath(m,world.actor)) m.state='chase';
    if (m.state !== 'chase') continue;
    world.lastCombat = world.time;
    if (m.dot && world.time >= m.dot.next) {
      m.hp=Math.max(0,m.hp-m.dot.damage); effect(world,m,String(m.dot.damage),'#b3f3a5');
      m.dot.left--;m.dot.next+=1.5;if (!m.dot.left) m.dot=null;
      if (m.hp<=0) { next=defeat(world,m,next,events);continue; }
    }
    m.facing=world.actor.x>=m.x?1:-1;
    if (d>50) { movePosition(m,(world.actor.x-m.x)/d*92*dt,(world.actor.y-m.y)/d*92*dt); }
    m.cooldown-=dt;
    if (d<=64 && m.cooldown<=0 && clearPath(m,world.actor)) {
      m.cooldown=1.5;
      const hits=random()<hitChance(m.template.atk,next.stats.dex,WORLD.map.levelMax);
      const dmg=hits?Math.max(1,Math.round(mitigate(m.template.atk,playerDef(next)*buffMult(world,'def'),PLAYER_DEF_K)*(1-armorSetDamageReduction(next,'monster')))):0;
      next={ ...(hits?damageEquippedDurability(next,ARMOR_SLOTS):next),hp:Math.max(0,next.hp-dmg) };
      effect(world,world.actor,hits?`−${dmg}`:'SIYRILDIN', '#ff9b9b');
      if (next.hp<=0) {
        const result=applyDeathPenalty(next);next=result.player;
        world.death={ xpLost:result.xpLost }; world.actor.moving=false;world.pendingStrike=null;world.projectile=null;world.swingUntil=0;
        world.monsters.filter(e=>e.state==='chase').forEach(resetEnemy);
        events.push({ text:`Yenildin. ${result.xpLost} XP kaybettin.`,tone:'warn' });
        break;
      }
    }
  }
  return { player:next,events };
}
export function respawn(world) {
  world.pendingStrike=null;world.projectile=null;world.swingUntil=0;
  world.death=null;world.actor={x:CAMP.x,y:CAMP.y,facing:1,moving:false};world.target=null;world.buffs=[];
}
