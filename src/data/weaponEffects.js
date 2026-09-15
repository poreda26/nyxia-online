import {CASTER_WEAPONS} from './casterWeapons.js';
export const ELEMENT_COLORS = Object.freeze({poison:'#dc65ff',flame:'#ff731c',lightning:'#65deff',ice:'#6ce7ff'});
const normalize = key => key === 'glacier' ? 'ice' : key;
export function weaponEffects(weapon) {
 if (!weapon || !(Number(weapon.upgradeLevel) >= 7)) return [];
 const template=CASTER_WEAPONS.find(w=>w.name===weapon.name);
 const staff=weapon.weaponType==='staff'||weapon.cls==='mage'||!!template;
 // Some balanced/saved staves lack the original multi-element metadata.
 // Recover only the light palette; combat values and saved data are untouched.
 const reference=template?.levels?.[Math.min(7,Number(weapon.upgradeLevel)-1)];
 const declared=weapon.elements?.length?weapon.elements:(reference?.elements||[]);
 const keys = [weapon.element||template?.element,...declared.filter(e=>e.bonus>0).map(e=>e.key)].map(normalize);
 const elements=[...new Set(keys)].filter(key=>ELEMENT_COLORS[key]);
 // A visual upgrade sheen is not an elemental damage bonus.
 return (elements.length?elements:[staff?'arcane':'temper']).map(key=>({key,color:ELEMENT_COLORS[key]||(key==='arcane'?'#c4bcff':'#d7e4ec'),strong:Number(weapon.upgradeLevel)>=8}));
}
