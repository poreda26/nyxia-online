import { WARRIOR_WEAPONS as warrior } from './warriorWeapons';
import { ROGUE_WEAPONS as rogue } from './rogueWeapons';
import { CASTER_WEAPONS as mage } from './casterWeapons';

// Nyxia progression, independent of reference-game numbers. Names remain
// stable asset keys. Upgrade success/destruction rules are unchanged.
export const WEAPON_BALANCE_VERSION = 1;
export const WEAPON_TIER_LEVEL = [0, 1, 15, 25, 40, 50, 60];
const power = [0, 20, 48, 76, 104, 132, 154];
const growth = [1, 1.07, 1.14, 1.22, 1.31, 1.42, 1.57, 1.78, 1.98, 2.2];
const bases = {warrior:65, rogue:70, mage:70};
const families = {warrior, rogue, mage};

function balanceFamily(table, cls) {
  const expanded = [...table];
  // Each tier offers at least three alternatives with existing artwork.
  for (let tier=1; tier<=6; tier++) {
    const sources=table.filter(w=>w.tier===tier);
    for(let n=sources.length;n<3;n++) {
      const source=sources[n%sources.length];
      expanded.push({...source,name:`${source.name} · ${n===1?'Muhafız':'Avcı'}`,artName:source.name,tier});
    }
  }
  return expanded.map((w,index)=>{
    const peers=expanded.filter(x=>x.tier===w.tier);
    const rank=peers.indexOf(w)%3;
    const factor=[1,.96,1.04][rank];
    const level=WEAPON_TIER_LEVEL[w.tier];
    const available=10+3*(level-1);
    const req=cls==='mage' ? [
      {key:'int',value:w.tier===1?70:70+Math.floor(available*.42)},
      {key:'mag',value:70+Math.floor(available*.20)},
    ] : [{key:cls==='warrior'?'str':'dex',value:bases[cls]+Math.floor(available*.72)}];
    return {...w,balanceVersion:WEAPON_BALANCE_VERSION,artName:w.artName||w.name,
      levels:growth.map((mult,i)=>({
        atk:Math.round(power[w.tier]*factor*mult*(cls==='mage'?1.12:cls==='rogue'?.94:1)),
        hp:rank===1?Math.round(power[w.tier]*.35*mult):0,
        mp:rank===0?Math.round(power[w.tier]*.2*mult):0,
        statBonus:null,elementBonus:Math.round(w.tier*3*mult),
        reqStats:req,durability:3000+w.tier*2000+i*500,
      })),reqStats:req};
  });
}
export const BALANCED_WEAPONS=Object.fromEntries(Object.entries(families).map(([cls,table])=>[cls,balanceFamily(table,cls)]));

export function rebalanceSavedWeapon(item) {
  if(!item || item.kind!=='weapon' || item.balanceVersion===WEAPON_BALANCE_VERSION) return item;
  const w=BALANCED_WEAPONS[item.cls]?.find(w=>w.name===item.name)
    || (['Short Blade','Wood Staff'].includes(item.name)?BALANCED_WEAPONS[item.cls]?.find(w=>w.tier===1):null);
  if(!w) return item;
  const data=w.levels[Math.max(0,Math.min(9,(item.upgradeLevel||1)-1))];
  const ratio=item.durability>0?Math.max(0,Math.min(1,item.currentDurability/item.durability)):1;
  return {...item,...data,levels:w.levels,artName:w.artName,balanceVersion:WEAPON_BALANCE_VERSION,
    currentDurability:Math.round(data.durability*ratio)};
}
