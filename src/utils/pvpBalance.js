import {ACCESSORY_SETS} from '../data/accessories';
import {boostMultiplier,boostFlatBonus} from './boosts';
import {wingMultiplier,wingStaminaBonus} from '../data/wings';
import {CLASSES} from '../data/classes';
import {initialPlayer,totalStats,playerMaxHp,playerDef,armorSetDamageReduction,equipItem,isBroken,armorLevelBonus} from './player';
import {gmWeaponTemplates,gmBuildWeaponById,gmBuildArmor,gmBuildAccessory} from './loot';
import {mitigate,hitChance} from './combat';

export const PVP_POWER_CURVE={"warrior":[[1,1],[15,1],[25,1],[40,1],[50,1],[60,1],[65,1]],"rogue":[[1,1.024],[15,1.024],[25,1.022],[40,1.121],[50,1.027],[60,1.137],[65,1.307]],"mage":[[1,0.698],[15,0.698],[25,0.677],[40,0.842],[50,0.79],[60,0.894],[65,0.993]]};
export const PVP_UPGRADE_CURVE={"warrior":{},"rogue":{"15":[0.9794749999999999,1,1],"25":[1,0.985,1.019475],"40":[0.9439499999999998,0.996216,1.096108],"50":[1.131962,1.04,1.0555999999999999],"60":[1.033068,1,1.0244],"65":[0.8794079999999999,0.92,0.92]},"mage":{"15":[0.9,0.985,1.2125],"25":[0.8865,1,1.2],"40":[0.9079200000000001,1.0176399999999999,1.32975],"50":[1.10968,1.08,1.1880000000000002],"60":[1.0120000000000002,0.97,1.1340000000000001],"65":[0.8627499999999999,0.9888,1.06575]}};
export function pvpSkillPower(cls,level,plus=5){const points=PVP_POWER_CURVE[cls];const i=points.findIndex(p=>p[0]>=level);if(i<=0)return points[i<0?points.length-1:0][1];const a=points[i-1],b=points[i];const base=a[1]+(b[1]-a[1])*(level-a[0])/(b[0]-a[0]);
 const factor=row=>{if(!row)return 1;return plus<=5?row[0]+(row[1]-row[0])*(plus-1)/4:row[1]+(row[2]-row[1])*(plus-5)/3;};
 return base*(factor(PVP_UPGRADE_CURVE[cls][a[0]])+(factor(PVP_UPGRADE_CURVE[cls][b[0]])-factor(PVP_UPGRADE_CURVE[cls][a[0]]))*(level-a[0])/(b[0]-a[0]));}
// Same snapshot and damage rule for either side; suitable for a future
// authoritative server. No opponent-dependent stat scaling in damage.
export function pvpSnapshot(p) {
 const base=CLASSES[p.class];
 const items=Object.values(p.equipped).filter(i=>i&&!isBroken(i));
 // Warrior has the larger HP pool. Rogue compensates through its bow damage
 // and critical rate; this coefficient is calibrated against equal T4 gear.
 const weapon=items.filter(i=>i.kind==='weapon').reduce((n,i)=>n+(i.atk||0),0)/({warrior:1,rogue:1.10,mage:1.04}[p.class]);
 const armor=items.filter(i=>i.kind==='armor');
 const accessories=items.filter(i=>i.kind==='accessory');
 const bonusStats=items.reduce((all,i)=>Object.entries(i.statBonus||{}).reduce((next,[key,value])=>({...next,[key]:(next[key]||0)+value}),all),{});
 const investment=p.stats[base.mainStat]-base.baseStats[base.mainStat]+(bonusStats[base.mainStat]||0)+(p.class==='mage'?Math.max(0,p.stats.int+(bonusStats.int||0)-70):0);
 const gearBonus=p.class==='mage'?0:armor.reduce((n,i)=>n+armorLevelBonus(i.upgradeLevel),0);
 const power=(18+weapon*(.8+.006*(investment+gearBonus)+.005*p.level))/(1+.8*base.crit);
 const defense=(armor.reduce((n,i)=>n+(i.def||0),0)+accessories.reduce((n,i)=>n+(i.def||0),0))*({warrior:1,rogue:1.44,mage:1.67}[p.class]);
 // Keep world HP in UI and storage. Convert normalized duel damage back
 // to the defender's HP scale, preserving healing and potion behavior.
 const duelHp=200+boostFlatBonus(p,'hp')+p.level*12+(bonusStats.sta||0)*4+Math.max(0,p.stats.sta-base.baseStats.sta)*4+items.reduce((n,i)=>n+(i.hp||0),0);
 const antiDef={};for(const item of items){const d=item.defenseAbility;if(d?.vs)antiDef[d.vs]=(antiDef[d.vs]||0)+Math.max(0,d.value||0);}
 const accessoryPower=1+Math.min(.15,accessories.reduce((n,i)=>n+(i.attackPowerPct||0),0));
 return {weaponType:p.equipped.mainHand?.weaponType||'sword',antiDef,cls:p.class,level:p.level,dex:p.stats.dex+(bonusStats.dex||0),hp:playerMaxHp(p),maxHp:playerMaxHp(p),duelHp,
  atk:power*wingMultiplier(p, "atk")*boostMultiplier(p,"atk")*accessoryPower,def:(defense*.65+p.level)*boostMultiplier(p,"def"),crit:base.crit,
  reduction:armorSetDamageReduction(p,'pvp')};
}
export function pvpDamage(a,b,critical=false,random=Math.random) {
 const weapon=a.weaponType==='crossbow'?'bow':a.weaponType;
 const points=b.antiDef?.[weapon]||0;const anti=Math.min(.25,points/(100+points));
 const raw=(1-anti)*mitigate(a.atk*(critical?1.8:1),b.def,170)*(1-(b.reduction||0))*(b.maxHp/b.duelHp);
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
 for(const key of ['necklace','belt','ring1','ring2','earring1','earring2']){
  const item=reference.equipped[key];if(!item)continue;
  const family={warrior:'guardian',rogue:'ranger',mage:'arcane'}[cls];
  const template=ACCESSORY_SETS[item.slot]?.find(a=>a.tier===item.tier&&a.family===family);
  p.equipped[key]=item.defenseAbility?{...item}:template?gmBuildAccessory(item.slot,item.tier,item.upgradeLevel||0,template.name):{...item};
 }
 p.equipped.wings=reference.equipped.wings?{...reference.equipped.wings}:null;
 p.activeBoosts={...reference.activeBoosts};
 return p;
}
