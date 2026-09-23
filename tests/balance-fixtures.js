import {initialPlayer,playerMaxHp,playerMaxMp,totalStats,playerDef,armorSetDamageReduction} from '../src/utils/player';
import {comparablePlayer} from '../src/utils/pvpBalance';
import {gmBuildAccessory} from '../src/utils/loot';
import {classSkills,computeSkillDamage} from '../src/utils/skills';
import {createDuel,stepDuel,selectDuelSkill} from '../src/utils/duelEngine';
import {CLASSES} from '../src/data/classes';
import {MAPS} from '../src/data/maps';
import {mitigate,MONSTER_DEF_K,PLAYER_DEF_K,hitChance} from '../src/utils/combat';
import {makeWings} from '../src/utils/wings';
export const classes=['warrior','rogue','mage'];
export function fixture(cls,level,tier,plus=5){
 let ref=initialPlayer(cls,'human','Test');ref.level=level;ref.equipped.mainHand={tier,upgradeLevel:plus};
 for(const slot of ['head','chest','legs','gauntlets','boots'])ref.equipped[slot]={tier:Math.min(tier,5),upgradeLevel:plus};
 let p=comparablePlayer(ref,cls);const family={warrior:'guardian',rogue:'ranger',mage:'arcane'}[cls];
 // Actual catalog items, +0, no paid bonuses in baseline.
 const {ACCESSORY_SETS}=requireAccessories;
 for(const [key,slot] of [['earring1','earring'],['earring2','earring'],['necklace','necklace'],['ring1','ring'],['ring2','ring'],['belt','belt']]){
  const a=ACCESSORY_SETS[slot].find(a=>a.tier===Math.min(tier,5)&&a.family===family);if(a)p.equipped[key]=gmBuildAccessory(slot,a.tier,0,a.name);
 }
 const all=classSkills(cls).filter(s=>s.unlockLevel<=level);
 const best=type=>all.filter(s=>s.effect.type===type).at(-1)?.id;
 p.skills={known:all.map(s=>s.id),loadout:['heal','buffAtk','dot','damage','execute'].map(best).filter(Boolean)};
 p.hp=playerMaxHp(p);p.mp=playerMaxMp(p);return p;
}
import * as requireAccessories from '../src/data/accessories';
export function simulateDuel(a,b,seed){let s=createDuel(a,b,{seed,fullHealth:true});while(!s.finished)s=stepDuel(s);return s;}
export function pve(p,m,seed=1,{potions=false}={}){
 let rng=seed;const random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;};
 const maxHp=playerMaxHp(p), maxMp=playerMaxMp(p);let hp=maxHp,mp=maxMp,mhp=m.hp,dot=null,buff=null,cd={};
 const skills=classSkills(p.class).filter(s=>p.skills.loadout.includes(s.id)),atk=totalStats(p).atk,def=playerDef(p),cls=CLASSES[p.class];let turns=0,hpCd=0,mpCd=0,hpUsed=0,mpUsed=0;
 while(hp>0&&mhp>0&&turns<150){turns++;
  if(dot){mhp-=dot.damage;if(--dot.left===0)dot=null;if(mhp<=0)break;}
  const skill=selectDuelSkill({hp,maxHp,mp,skills,cooldowns:cd,buff},{hp:mhp,maxHp:m.hp,dot});
  for(const k in cd)cd[k]=Math.max(0,cd[k]-1);
  const mult=buff?.mult||1;if(buff&&--buff.left===0)buff=null;
  if(potions&&hp/maxHp<.35&&hpCd===0&&hpUsed<5){hp=Math.min(maxHp,hp+720);hpCd=3;hpUsed++;}
  else if(potions&&mp<40&&mpCd===0&&mpUsed<3){mp=Math.min(maxMp,mp+1920);mpCd=3;mpUsed++;}
  else if(skill){const e=skill.effect;mp-=skill.mpCost;cd[skill.id]=skill.cooldown;
   if(e.type==='heal')hp=Math.min(maxHp,hp+Math.round(maxHp*e.pct));
   else if(e.type==='buffAtk')buff={mult:e.mult,left:e.turns};
   else if(e.type==='dot')dot={damage:Math.round(computeSkillDamage(skill,{clsAtk:cls.atk,atk,monsterDef:m.def,monsterHpPct:1,rand:()=>0})*mult),left:e.turns};
   else mhp-=Math.round(computeSkillDamage(skill,{clsAtk:cls.atk,atk,monsterDef:m.def,monsterHpPct:mhp/m.hp,rand:(a,b)=>Math.floor(random()*(b-a+1))+a})*mult);
  }else if(random()<hitChance(p.stats.dex+(p.equipped.wings?3:0),m.atk,p.level))mhp-=Math.max(1,Math.round(mitigate((cls.atk+atk*.9)*mult*(random()<cls.crit?1.8:1),m.def,MONSTER_DEF_K)));
  hpCd=Math.max(0,hpCd-1);mpCd=Math.max(0,mpCd-1);
  if(mhp>0&&random()<hitChance(m.atk,p.stats.dex+(p.equipped.wings?3:0),p.level))hp-=Math.max(1,Math.round(mitigate(m.atk,def,PLAYER_DEF_K)*(1-armorSetDamageReduction(p,'monster'))));
 }
 return {win:mhp<=0,turns,hp:Math.max(0,hp)/maxHp,mp:mp/maxMp,hpUsed,mpUsed};
}
export function matrix(samples=200){
 const pvp=[],pveRows=[];
 for(const [tier,level] of [[1,15],[2,25],[3,40],[4,50],[5,60],[6,65]]){
  for(const plus of [1,5,8])for(const [a,b] of [['warrior','rogue'],['warrior','mage'],['rogue','mage']]){
   const pa=fixture(a,level,tier,plus),pb=fixture(b,level,tier,plus);let wins=0,draw=0,rounds=0;for(let i=1;i<=samples;i++){const d=simulateDuel(pa,pb,i*7919);wins+=d.winner===0;draw+=d.winner===null;rounds+=d.round;}
   pvp.push({tier,level,plus,a,b,winPct:100*wins/samples,draw,rounds:Math.round(rounds/samples)});
  }
 }
 for(const [index,map] of MAPS.entries())for(const cls of classes)for(const gear of ['current','previous','starter']){
  const level=Math.round((map.levelMin+map.levelMax)/2),tier=gear==='starter'?1:Math.max(1,index+1-(gear==='previous'?1:0));
  const p=fixture(cls,level,tier,gear==='starter'?1:5);if(gear==='starter'){for(const k in p.equipped)if(k!=='mainHand')p.equipped[k]=null;}
  const monsters=map.monsters;
  for(const m of monsters){let wins=0,turns=0,hp=0;for(let i=1;i<=samples;i++){const r=pve(p,m,i*7919);wins+=r.win;turns+=r.turns;hp+=r.hp;}
   pveRows.push({map:map.name,cls,level,gear,monster:m.name,winPct:100*wins/samples,turns:Math.round(turns/samples*10)/10,hpPct:Math.round(hp/samples*100),weaponTier:p.equipped.mainHand?.tier});}
 }
 return {pvp,pve:pveRows};
}
