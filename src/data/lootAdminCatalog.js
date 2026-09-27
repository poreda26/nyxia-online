import {BALANCED_WEAPONS} from './balancedWeapons.js';
import {WARRIOR_SHIELDS} from './warriorWeapons.js';
import {ARMOR_SETS} from './armorSets.js';
import {ACCESSORY_SETS,MAP_ACCESSORIES} from './accessories.js';
// Stable names, never array indices, identify published reward entries.
export const LOOT_ADMIN_CATALOG=[
 ...Object.entries(BALANCED_WEAPONS).flatMap(([cls,items])=>items.map(w=>({key:`weapon:${cls}:${w.name}`,kind:'weapon',class:cls,name:w.name,tier:w.tier}))),
 ...WARRIOR_SHIELDS.map(w=>({key:`shield:${w.name}`,kind:'shield',class:'warrior',name:w.name,tier:w.tier})),
 ...ARMOR_SETS.map(w=>({key:`armor:${w.cls}:${w.slot}:${w.tier}`,kind:'armor',class:w.cls,slot:w.slot,name:w.name,tier:w.tier})),
 ...Object.entries(ACCESSORY_SETS).flatMap(([slot,items])=>items.map(w=>({key:`accessory:${slot}:${w.name}`,kind:'accessory',slot,name:w.name,tier:w.tier,maxLevel:3}))),
 ...MAP_ACCESSORIES.map(w=>({key:`accessory:${w.slot}:${w.name}`,kind:'accessory',slot:w.slot,name:w.name,tier:w.tier,maxLevel:1})),
];
