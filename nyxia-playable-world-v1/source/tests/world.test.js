import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorld, WORLD, CAMP, OBSTACLES, canStand, command, stepWorld, moveActor, distance, respawn, inCombat } from '../src/world/engine';
import { initialPlayer, playerMaxHp, xpToNext } from '../src/utils/player';
import { grantMonsterReward } from '../src/utils/monsterRewards';
import { saveCharacterSlot, loadAccount } from '../src/utils/storage';
import { learnFreeSkills } from '../src/utils/skills';
const player=()=>learnFreeSkills(initialPlayer('warrior','karus','WorldTest'));
function encounter() {
  const w=createWorld();w.actor.x=710;w.actor.y=665;w.target=w.monsters[0].id;
  return w;
}
test('spawn, NPC camp and all monster homes are walkable',()=>{
  const w=createWorld();assert.ok(canStand(w.actor.x,w.actor.y));
  w.monsters.forEach(m=>assert.ok(canStand(m.x,m.y),m.id));
});
test('diagonal movement has no speed advantage and respects terrain',()=>{
  const a={x:760,y:700},b={...a};moveActor(a,1,0,.1);moveActor(b,1,1,.1);
  assert.ok(Math.abs(distance(a,{x:760,y:700})-distance(b,{x:760,y:700}))<.001);
  const o=OBSTACLES[2];assert.equal(canStand(o.x,o.y),false);
  const edge={x:WORLD.width-WORLD.edge,y:400};moveActor(edge,1,0,.1);assert.equal(edge.x,WORLD.width-WORLD.edge);
});
test('camp and range reject attacks without spending mana or yielding loot',()=>{
  let p=player();const w=createWorld();w.target=w.monsters[0].id;const hp=w.monsters[0].hp;
  assert.equal(command(w,p,{type:'attack'}).player,p);assert.equal(w.monsters[0].hp,hp);
  w.actor={x:750,y:850};command(w,p,{type:'attack'});assert.equal(w.monsters[0].hp,hp);
});
test('cooldown prevents click bursts and a kill is rewarded exactly once',()=>{
  let p=player();const w=encounter();w.monsters[0].hp=1;
  const first=command(w,p,{type:'attack'},()=>0.1);p=first.player;
  assert.equal(p.monsterKills.sis_kurdu,1);assert.equal(w.monsters[0].state,'dead');
  assert.equal(p.dailyQuests.killsToday,1);assert.equal(first.events.length,1);
  for(let i=0;i<30;i++)p=command(w,p,{type:'attack'},()=>0.1).player;
  assert.equal(p.monsterKills.sis_kurdu,1);
});
test('equipment damage uses current stats; changing weapon affects next hit',()=>{
  const p=player(),w=encounter();command(w,p,{type:'attack'},()=>0.1);const damage=w.monsters[0].template.hp-w.monsters[0].hp;
  const strong={...p,equipped:{...p.equipped,mainHand:{kind:'weapon',atk:150}}},w2=encounter();command(w2,strong,{type:'attack'},()=>0.1);
  assert.ok(w2.monsters[0].template.hp-w2.monsters[0].hp>damage);
});
test('known skill spends mana once, unknown skill and empty mana do not attack',()=>{
  const p=player(),w=encounter();const skill=p.skills.known[0];assert.ok(skill);
  const result=command(w,p,{type:'skill',id:skill},()=>.1);assert.ok(result.player.mp<p.mp);
  assert.equal(command(w,result.player,{type:'skill',id:skill},()=>.1).player,result.player);
  const w2=encounter(),empty={...p,mp:0};assert.equal(command(w2,empty,{type:'skill',id:skill}).player,empty);assert.equal(w2.monsters[0].hp,w2.monsters[0].template.hp);
  assert.equal(command(w2,p,{type:'skill',id:'invalid'}).player,p);
});
test('a full resource does not consume a potion and shared cooldown prevents spam',()=>{
  const p=player(),w=createWorld();assert.equal(command(w,p,{type:'potion',kind:'hp'}).player,p);
  const hurt={...p,hp:1};const healed=command(w,hurt,{type:'potion',kind:'hp'}).player;
  assert.ok(healed.hp>1);assert.notDeepEqual(healed.inventory,hurt.inventory);
  assert.equal(command(w,healed,{type:'potion',kind:'mp'}).player,healed);
});
test('paused and suspended catch-up frames cause no movement or damage burst',()=>{
  const p=player(),w=encounter();w.paused=true;const before={...w.actor};assert.equal(stepWorld(w,p,{x:1,y:0},30).player,p);assert.deepEqual(w.actor,before);
  w.paused=false;stepWorld(w,p,{x:1,y:0},30);assert.ok(distance(w.actor,before)<=WORLD.speed*.05+.001);
});
test('death penalty happens once and respawn returns to camp',()=>{
  const w=encounter();w.monsters[0].y=w.actor.y-30;w.monsters[0].cooldown=0;
  let p={...player(),hp:1,xp:100};p=stepWorld(w,p,{x:0,y:0},.05,()=>0).player;
  assert.ok(w.death);assert.equal(p.hp,playerMaxHp(p));const xp=p.xp;
  for(let i=0;i<20;i++)p=stepWorld(w,p,{x:0,y:0},.05,()=>0).player;
  assert.equal(p.xp,xp);respawn(w);assert.equal(w.death,null);assert.equal(distance(w.actor,CAMP),0);
});
test('returning to camp disengages enemies without awarding a kill',()=>{
  const p=player(),w=encounter();w.monsters[0].state='chase';w.actor={x:CAMP.x,y:CAMP.y};
  const result=stepWorld(w,p,{x:0,y:0},.05);assert.equal(inCombat(w),false);assert.equal(result.player,p);assert.equal(w.kills,0);
});
test('shared rewards level up, retain unrelated fields and do not mutate input',()=>{
  const p={...player(),xp:xpToNext(1)-1,customFutureField:'preserved'};const copy=JSON.stringify(p);
  const result=grantMonsterReward(p,WORLD.map.monsters[0],WORLD.map);
  assert.ok(result.player.level>p.level);assert.equal(result.player.customFutureField,'preserved');assert.equal(JSON.stringify(p),copy);
});
test('world progression persists through the existing character-slot storage',()=>{
  const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)};
  const w=encounter();w.monsters[0].hp=1;const p=command(w,player(),{type:'attack'},()=>.1).player;
  saveCharacterSlot('world-test',0,p);const restored=loadAccount('world-test').characters[0];
  assert.equal(restored.gold,p.gold);assert.equal(restored.monsterKills.sis_kurdu,1);assert.deepEqual(restored.inventory,p.inventory);
});
