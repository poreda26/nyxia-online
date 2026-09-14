export const ELEMENT_COLORS = Object.freeze({poison:'#dc65ff',flame:'#ff731c',lightning:'#65deff',ice:'#6ce7ff'});
const normalize = key => key === 'glacier' ? 'ice' : key;
export function weaponEffects(weapon) {
 if (!weapon || !(Number(weapon.upgradeLevel) >= 7)) return [];
 const keys = [weapon.element,...(weapon.elements || []).filter(e=>e.bonus>0).map(e=>e.key)].map(normalize);
 const elements=[...new Set(keys)].filter(key=>ELEMENT_COLORS[key]);
 // A visual upgrade sheen is not an elemental damage bonus.
 return (elements.length?elements:['temper']).map(key=>({key,color:ELEMENT_COLORS[key]||'#d7e4ec',strong:Number(weapon.upgradeLevel)>=8}));
}
