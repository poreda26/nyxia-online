import assert from 'node:assert/strict';
import {fixture,pve} from './balance-fixtures';
import {prepareWarzoneAction,buildHuntMonster} from '../src/utils/warzoneCombat';
import {classSkills} from '../src/utils/skills';
import {MAPS} from '../src/data/maps';
import {playerMaxHp,playerMaxMp} from '../src/utils/player';
import {ACHIEVEMENTS} from '../src/data/achievements';
import {setActiveTitle,isAchievementUnlocked} from '../src/utils/achievements';
const templates=MAPS.find(m=>m.id==='crimson_battlefront').monsters;
for(const cls of ['warrior','rogue','mage']){
 const p=fixture(cls,65,6,8);p.hp=Math.floor(playerMaxHp(p)*.5);
 for(const s of classSkills(cls)){
  const player={...p,skills:{known:[s.id],loadout:[s.id]}};
  const before=JSON.stringify(player),m=buildHuntMonster(templates[0],1.5),r=prepareWarzoneAction(player,m,{},s.id);
  assert.ok(prepareWarzoneAction({...player,skills:{known:[],loadout:[]}},m,{},s.id).error,'ownership '+s.id);
  assert.ok(!r.error,s.id);assert.equal(r.player.mp,player.mp-s.mpCost);assert.equal(JSON.stringify(player),before);
  if(s.cooldown>0)assert.ok(prepareWarzoneAction(r.player,m,r.state,s.id).error,'cooldown '+s.id);
  if(s.mpCost>0)assert.ok(prepareWarzoneAction({...player,mp:0},m,{},s.id).error,'mana '+s.id);
  if(s.effect.type==='heal')assert.ok(r.heal>0);
  if(['damage','execute'].includes(s.effect.type))assert.ok(r.damage>0);
  if(s.effect.type==='dot')assert.ok(prepareWarzoneAction(r.player,m,r.state).damage>0);
 }
 let wins=0,oldWins=0,turns=0;
 for(const m of templates)for(let seed=1;seed<=100;seed++){
  const r=pve(fixture(cls,65,6,8),buildHuntMonster(m,1.5),seed,{potions:true});wins+=r.win;turns+=r.turns;
  oldWins+=pve(fixture(cls,65,6,8),{...m,hp:Math.round(m.hp*1.5),atk:Math.round(m.atk*1.5),def:Math.round(m.def*1.5)},seed,{potions:true}).win;
 }
 const count=templates.length*100;console.log(cls,JSON.stringify({oldWinPct:oldWins/count*100,newWinPct:wins/count*100,turns:turns/count}));assert.ok(wins/count>.9,cls+' endgame farm');
}
const p=fixture('mage',65,6,8);p.monsterKills={test:5000};assert.ok(isAchievementUnlocked(p,ACHIEVEMENTS.find(a=>a.id==='endless_hunt')));assert.equal(setActiveTitle(p,'endless_hunt').activeTitle,'endless_hunt');assert.equal(new Set(ACHIEVEMENTS.map(a=>a.id)).size,ACHIEVEMENTS.length);
console.log('All class skills: mana, cooldown, healing, DOT, ownership and achievements passed.');
