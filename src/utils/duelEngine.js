// Pure, deterministic automatic duel. Only a future authoritative server may
// award real online rewards. UI clicks and elapsed browser time cannot add turns.
import {pvpSnapshot,pvpDamage,pvpSkillPower} from './pvpBalance';
import {getSkill} from './skills';
import {playerMaxMp} from './player';
import {hitChance} from './combat';
export const DUEL_RULE_VERSION="2026-09-24.1";
export function createDuel(a,b,{seed=1,fullHealth=false}={}){
 const fighters=[a,b].map(p=>{const s=pvpSnapshot(p);s.atk*=pvpSkillPower(p.class,p.level,p.equipped.mainHand?.upgradeLevel||1);return {...s,name:p.nickname||p.class,mp:fullHealth?playerMaxMp(p):Math.min(p.mp,playerMaxMp(p)),maxMp:playerMaxMp(p),hp:fullHealth?s.maxHp:Math.max(0,Math.min(p.hp,s.maxHp)),skills:[...new Set(p.skills?.loadout||[])].filter(id=>p.skills?.known?.includes(id)).slice(0,5).map(id=>getSkill(p.class,id)).filter(s=>s&&s.unlockLevel<=p.level),cooldowns:{},buff:null,dot:null};});
 return {rulesVersion:DUEL_RULE_VERSION,fighters,seed:seed>>>0||1,round:0,first:seed%2,finished:false,winner:null,events:[]};
}
export function selectDuelSkill(a,b){
 const ready=a.skills.filter(s=>!a.cooldowns[s.id]&&a.mp>=s.mpCost);
 const heal=ready.filter(s=>s.effect.type==='heal').sort((x,y)=>y.effect.pct-x.effect.pct)[0];
 if(heal&&a.hp/a.maxHp<.5)return heal;
 const execute=ready.find(s=>s.effect.type==='execute'&&b.hp/b.maxHp<=s.effect.hpPctThreshold);if(execute)return execute;
 if(!a.buff&&b.hp/b.maxHp>.5){const buff=ready.filter(s=>s.effect.type==='buffAtk').sort((x,y)=>y.effect.mult-x.effect.mult)[0];if(buff)return buff;}
 if(!b.dot&&b.hp/b.maxHp>.45){const dot=ready.find(s=>s.effect.type==='dot');if(dot)return dot;}
 return ready.filter(s=>s.effect.type==='damage').sort((x,y)=>y.effect.mult-x.effect.mult)[0]||null;
}
export function stepDuel(state){
 if(state.finished)return state;
 const next={...state,round:state.round+1,events:[],fighters:state.fighters.map(f=>({...f,cooldowns:{...f.cooldowns},buff:f.buff?{...f.buff}:null,dot:f.dot?{...f.dot}:null}))};
 const random=()=>{next.seed=(Math.imul(next.seed,1664525)+1013904223)>>>0;return next.seed/4294967296;};
 const damage=(a,b,crit)=>Math.max(1,Math.round(pvpDamage(a,b,crit,random)*(.88+random()*.24)));
 const order=(state.first+state.round)%2?[1,0]:[0,1];
 for(const side of order){
  const a=next.fighters[side],b=next.fighters[1-side];
  if(a.hp<=0||b.hp<=0)break;
  if(a.dot){const damage=Math.min(a.hp,a.dot.damage);a.hp-=damage;next.events.push({side:1-side,type:'dotTick',damage,hit:true});if(--a.dot.left<=0)a.dot=null;if(a.hp<=0)break;}
  const skill=selectDuelSkill(a,b),e=skill?.effect;
  for(const id of Object.keys(a.cooldowns))a.cooldowns[id]=Math.max(0,a.cooldowns[id]-1);
  const power=a.buff?.mult||1;if(a.buff&&--a.buff.left<=0)a.buff=null;
  if(skill){a.mp-=skill.mpCost;a.cooldowns[skill.id]=skill.cooldown;}
  const event={side,skillId:skill?.id,label:skill?.name,type:e?.type||'attack',hit:true,damage:0};
  if(e?.type==='heal'){event.heal=Math.min(a.maxHp-a.hp,Math.round(a.maxHp*Math.min(.2,e.pct)));a.hp+=event.heal;}
  else if(e?.type==='buffAtk'){a.buff={mult:e.mult,left:e.turns};}
  else if(e?.type==='dot'){b.dot={damage:Math.max(1,Math.round(damage({...a,atk:a.atk*power},b,false)*e.mult)),left:e.turns};}
  else {
   event.hit=!!skill||random()<hitChance(a.dex,b.dex,a.level);
   event.crit=event.hit&&random()<a.crit;
   const mult=e?.type==='execute'?(b.hp/b.maxHp<=e.hpPctThreshold?e.mult:1):(e?.mult||1);
   if(event.hit){event.damage=Math.min(b.hp,damage({...a,atk:a.atk*power*mult},b,event.crit));b.hp-=event.damage;}
  }
  next.events.push(event);
 }
 const [a,b]=next.fighters;
 if(a.hp<=0||b.hp<=0||next.round>=100){next.finished=true;next.winner=a.hp<=0&&b.hp<=0?null:a.hp<=0?1:b.hp<=0?0:null;}
 return next;
}
