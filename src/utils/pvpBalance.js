import {CLASSES} from '../data/classes';
import {initialPlayer,totalStats,playerMaxHp,playerDef,armorSetDamageReduction,equipItem,isBroken,armorLevelBonus} from './player';
import {gmWeaponTemplates,gmBuildWeaponById,gmBuildArmor} from './loot';
import {mitigate,hitChance} from './combat';

// Same snapshot and damage rule for either side; suitable for a future
// authoritative server. No opponent-dependent stat scaling in damage.
export function pvpSnapshot(p) {
 const base=CLASSES[p.class];
 const items=Object.values(p.equipped).filter(i=>i&&!isBroken(i));
 const weapon=items.filter(i=>i.kind==='weapon').reduce((n,i)=>n+(i.atk||0),0)/({warrior:1,rogue:.94,mage:1.12}[p.class]);
 const armor=items.filter(i=>i.kind==='armor');
 const investment=p.stats[base.mainStat]-base.baseStats[base.mainStat]+(p.class==='mage'?Math.max(0,p.stats.int-70):0);
 const gearBonus=items.reduce((n,i)=>n+(i.statBonus?.[base.mainStat]||0),0)+armor.reduce((n,i)=>n+armorLevelBonus(i.upgradeLevel),0);
 const power=(18+weapon*(.8+.006*(investment+gearBonus)+.005*p.level))/(1+.8*base.crit);
 const defense=armor.reduce((n,i)=>n+(i.def||0),0)*({warrior:1,rogue:1.44,mage:1.67}[p.class]);
 // Keep world HP in UI and storage. Convert normalized duel damage back
 // to the defender's HP scale, preserving healing and potion behavior.
 const duelHp=200+p.level*12+Math.max(0,p.stats.sta-base.baseStats.sta)*4+items.reduce((n,i)=>n+(i.hp||0),0);
 return {cls:p.class,level:p.level,dex:80,hp:playerMaxHp(p),maxHp:playerMaxHp(p),duelHp,
  atk:power,def:defense*.65+p.level,crit:base.crit,
  reduction:armorSetDamageReduction(p,'pvp')};
}
export function pvpDamage(a,b,critical=false,random=Math.random) {
 const raw=mitigate(a.atk*(critical?1.8:1),b.def,170)*(1-(b.reduction||0))*(b.maxHp/b.duelHp);
 return Math.max(1,Math.floor(raw)+(random()<raw%1?1:0));
}
export function rollPvpDamage(a,b,random=Math.random) {
 if(random()>=hitChance(a.dex,b.dex,a.level)) return null;
 return pvpDamage(a,b,random()<a.crit,random);
}
export function comparablePlayer(reference,cls) {
 let p=initialPlayer(cls,reference.race,'Rakip');p.level=reference.level;p.awakened=reference.awakened;
 let points=10+3*(p.level-1);
 const tier=reference.equipped.mainHand?.tier||1;
 if(cls==='mage') {const goal=[0,70,100,124,160,160,160][tier];const spend=Math.min(points,goal-70);p.stats.int+=spend;points-=spend;}
 const main=CLASSES[cls].mainStat,spend=Math.min(points,255-p.stats[main]);p.stats[main]+=spend;p.stats.sta+=points-spend;
 const plus=reference.equipped.mainHand?.upgradeLevel||1;
 const weapons=gmWeaponTemplates(cls).filter(w=>w.tier<=tier).map(w=>gmBuildWeaponById(cls,w.id,plus)).filter(w=>!equipItem(p,w).blocked).sort((a,b)=>b.atk-a.atk);
 if(weapons[0])p=equipItem(p,weapons[0]).player;
 for(const slot of ['head','chest','legs','gauntlets','boots']) {
  const original=reference.equipped[slot];if(!original)continue;
  for(let t=1;t<=original.tier;t++){const item=gmBuildArmor(cls,slot,t,original.upgradeLevel);if(item&&!equipItem(p,item).blocked)p=equipItem(p,item).player;}
 }
 return p;
}
