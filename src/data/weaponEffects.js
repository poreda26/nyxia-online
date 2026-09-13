export const ELEMENT_COLORS = Object.freeze({poison:'#dc65ff',flame:'#ff731c',lightning:'#b49aff',ice:'#6ce7ff'});
const normalize = key => key === 'glacier' ? 'ice' : key;
export function weaponEffects(weapon) {
 if (!weapon || Number(weapon.upgradeLevel) < 7) return [];
 const keys = [weapon.element,...(weapon.elements || []).filter(e=>e.bonus>0).map(e=>e.key)].map(normalize);
 return [...new Set(keys)].filter(key=>ELEMENT_COLORS[key]).map(key=>({key,color:ELEMENT_COLORS[key],strong:Number(weapon.upgradeLevel)>=8}));
}

// Restrict the effect to the exposed weapon above the gripping hand. The
// character silhouette is intersected separately, so empty atlas space is excluded.
export function weaponEffectPolygon(appearance) {
 const {atlasKey,frameIndex,size}=appearance, col=frameIndex%3,row=Math.floor(frameIndex/3);
 const w=size[0]/3,h=size[1]/2;
 let points=[[.64,0],[1.25,0],[1.25,.36],[.74,.36],[.69,.30],[.64,.24]];
 if(atlasKey.startsWith('mage')) points=[[.62,0],[1.2,0],[1.2,.30],[.75,.30],[.68,.23],[.62,.16]];
 if(atlasKey.startsWith('rogue')) {
  const crossbow=(atlasKey==='rogue-0'&&col===2)||(atlasKey==='rogue-2'&&col===2)||(atlasKey==='rogue-3'&&col===0);
  points=crossbow?[[.65,.23],[1.18,.23],[1.18,.57],[.79,.57],[.79,.39],[.65,.34]]:[[.67,0],[1.16,0],[1.16,.80],[.81,.80],[.80,.49],[.90,.43],[.90,.31],[.67,.20]];
 }
 return points.map(([x,y])=>`${(col+x)*w},${(row+y)*h}`).join(' ');
}
