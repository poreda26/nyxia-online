import {classSkills,computeSkillDamage,computeSkillHeal,refreshSkillBuff} from './skills';
import {totalStats,playerMaxHp} from './player';
import {CLASSES} from '../data/classes';
import {rand} from './random';
export function prepareWarzoneAction(player,monster,state={},skillId=null){
 const skill=skillId?classSkills(player.class).find(s=>s.id===skillId):null;
 if(skillId&&(!skill||!player.skills?.known?.includes(skillId)||!player.skills?.loadout?.includes(skillId)))return {error:'Beceri kuşanılmış değil.'};
 if(skill&&(state.skillCooldowns?.[skillId]||0)>0)return {error:'Beceri bekleme süresinde.'};
 if(skill&&player.mp<skill.mpCost)return {error:'Yeterli mana yok.'};
 let buffs=(state.buffs||[]).map(b=>({...b,turnsLeft:b.turnsLeft-1})).filter(b=>b.turnsLeft>0);
 const skillCooldowns=Object.fromEntries(Object.entries(state.skillCooldowns||{}).map(([k,v])=>[k,Math.max(0,v-1)]));
 let damage=state.dot?.turnsLeft>0?state.dot.dmgPerTurn:0;
 let dot=state.dot?.turnsLeft>1?{...state.dot,turnsLeft:state.dot.turnsLeft-1}:null;
 const mult=stat=>buffs.filter(b=>b.stat===stat).reduce((n,b)=>n*b.mult,1);
 let next={...player},heal=0;
 if(skill){
  next.mp-=skill.mpCost;skillCooldowns[skill.id]=skill.cooldown;
  const e=skill.effect,args={clsAtk:CLASSES[player.class].atk,atk:totalStats(player).atk,monsterDef:monster.def,monsterHpPct:monster.hp/(monster.maxHp||monster.hp),rand};
  if(e.type==='damage'||e.type==='execute')damage+=Math.max(1,Math.round(computeSkillDamage(skill,args)*mult('atk')));
  if(e.type==='heal'){heal=Math.max(0,Math.min(computeSkillHeal(skill,playerMaxHp(player)),playerMaxHp(player)-player.hp));next.hp+=heal;}
  if(e.type==='buffAtk'||e.type==='buffDef')buffs=refreshSkillBuff(buffs,e);
  if(e.type==='dot')dot={dmgPerTurn:Math.max(1,Math.round(computeSkillDamage(skill,{...args,rand:()=>0})*mult('atk'))),turnsLeft:e.turns};
 }
 return {player:next,skill,damage,heal,state:{buffs,dot,skillCooldowns},atkMult:mult('atk'),defMult:mult('def')};
}
// Keep owner power tuning, while reducing the old hunt profile independently.
export function buildHuntMonster(template,powerMult){
 const hp=Math.max(1,Math.round(template.hp*powerMult*.7));
 return {...template,hp,maxHp:hp,atk:Math.max(1,Math.round(template.atk*powerMult*.55)),def:Math.max(0,Math.round(template.def*powerMult*.7))};
}
