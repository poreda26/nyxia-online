import { WARRIOR_WEAPONS as warrior, WEAPON_TYPE_ICON, WEAPON_TYPE_SPEED, WEAPON_TYPE_RANGE } from './warriorWeapons';
import { ROGUE_WEAPONS as rogue } from './rogueWeapons';
import { CASTER_WEAPONS as mage } from './casterWeapons';
import {ORIGINAL_WEAPONS} from './originalWeapons';

// Nyxia progression, independent of reference-game numbers. Names remain
// stable asset keys. Upgrade success/destruction rules are unchanged.
export const WEAPON_BALANCE_VERSION = 2;
export const WEAPON_TIER_LEVEL = [0, 1, 15, 25, 40, 50, 60];
const power = [0, 20, 48, 76, 104, 132, 154];
const growth = [1, 1.07, 1.14, 1.22, 1.31, 1.42, 1.57, 1.78, 1.98, 2.2];
const bases = {warrior:65, rogue:70, mage:70};
const families = {warrior, rogue, mage};

function balanceFamily(table, cls) {
  const expanded = [...table,...ORIGINAL_WEAPONS.filter(w=>w.cls===cls)];
  return expanded.map(w=>{
    const peers=expanded.filter(x=>x.tier===w.tier);
    const rank=peers.indexOf(w);
    const factor=w.powerFactor ?? [1,.96,1.04][rank%3];
    const level=WEAPON_TIER_LEVEL[w.tier];
    const available=10+3*(level-1);
    const req=cls==='mage' ? [
      {key:'int',value:w.tier===1?70:70+Math.floor(available*.42)},
      {key:'mag',value:70+Math.floor(available*.20)},
    ] : [{key:cls==='warrior'?'str':'dex',value:bases[cls]+Math.floor(available*.72)}];
    const offset=w.reqOffset ?? rank-1;
    req[req.length-1]={...req.at(-1),value:req.at(-1).value+offset};
    return {...w,balanceVersion:WEAPON_BALANCE_VERSION,artName:w.artName||w.name,
      levels:growth.map((mult,i)=>({
        atk:Math.round(power[w.tier]*factor*mult*(cls==='mage'?1.12:cls==='rogue'?.94:1)),
        hp:Math.round((w.id?w.hp:(rank%3===1?power[w.tier]*.35:0))*mult),
        mp:Math.round((w.id?w.mp:(rank%3===0?power[w.tier]*.2:0))*mult),
        statBonus:null,elementBonus:Math.round(w.tier*3*mult),
        reqStats:req,durability:3000+w.tier*2000+i*500,
      })),reqStats:req};
  });
}
export const BALANCED_WEAPONS=Object.fromEntries(Object.entries(families).map(([cls,table])=>[cls,balanceFamily(table,cls)]));

export function rebalanceSavedWeapon(item) {
  if(!item || item.kind!=='weapon' || item.balanceVersion===WEAPON_BALANCE_VERSION) return item;
  const replacement=ORIGINAL_WEAPONS.find(w=>w.cls===item.cls&&w.legacyName===item.name);
  const w=BALANCED_WEAPONS[item.cls]?.find(w=>w.name===(replacement?.name||item.name))
    || (['Short Blade','Wood Staff'].includes(item.name)?BALANCED_WEAPONS[item.cls]?.find(w=>w.tier===1):null);
  if(!w) return item;
  const data=w.levels[Math.max(0,Math.min(9,(item.upgradeLevel||1)-1))];
  const ratio=item.durability>0?Math.max(0,Math.min(1,item.currentDurability/item.durability)):1;
  return {...item,...data,name:replacement?w.name:item.name,weaponType:w.weaponType,element:w.element||null,lore:w.lore||null,levels:w.levels,artName:w.artName,balanceVersion:WEAPON_BALANCE_VERSION,
    ...(replacement?{icon:WEAPON_TYPE_ICON[w.weaponType],attackSpeed:w.attackSpeed??WEAPON_TYPE_SPEED[w.weaponType],range:w.range??WEAPON_TYPE_RANGE[w.weaponType],elements:w.elements||null,weaponSlot:w.weaponSlot||'twoHand'}:{}),
    currentDurability:Math.round(data.durability*ratio)};
}
