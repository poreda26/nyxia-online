import manifest from './characterWeaponManifest.json';
import atlasFrames from './characterAtlasFrames.json';

// Armor appearances will be registered here after the weapon pass is approved.
// Equipment still owns every gameplay stat; this registry is presentation only.
export const CHARACTER_LOOKS = {base:{manifest,frames:atlasFrames}};
export const CHARACTER_IDENTITIES = Object.freeze(['human-warrior','karus-warrior','human-rogue','karus-rogue','human-mage','karus-mage']);
const aliases={warrior:{'Short Blade':'Rusty Sword'},mage:{'Wood Staff':'Wooden Staff'}};
export function characterArmorLook(){return 'base';}

export function characterAppearance(player,looks=CHARACTER_LOOKS){
 const cls=['warrior','rogue','mage'].includes(player?.class)?player.class:'warrior';
 const race=player?.race==='karus'?'karus':'human';
 const weapon=player?.equipped?.mainHand;
 const weaponName=weapon?(aliases[cls]?.[weapon.name]||weapon.name):'__unarmed__';
 const armorLook=characterArmorLook(player);
 const look=looks[armorLook]||looks.base;
 let batch=look.manifest.find(b=>b.cls===cls&&b.items.some(([name])=>name===weaponName));
 // Unknown legacy items never borrow another weapon's pose.
 if(!batch)batch=look.manifest.find(b=>b.cls===cls&&b.items.some(([name])=>name==='__unarmed__'));
 if(!batch)return null;
 let col=batch.items.findIndex(([name])=>name===weaponName);
 const supported=col>=0;
 if(col<0)col=batch.items.findIndex(([name])=>name==='__unarmed__');
 const frameIndex=(race==='karus'?3:0)+col;
 const atlasKey=armorLook==='base'&&cls==='warrior'&&weaponName==='Raptor'?'warrior-raptor-v2':batch.key;
 const atlas=look.frames[atlasKey];
 return {identity:`${race}-${cls}`,armorLook,atlasKey,frameIndex,frame:atlas?.frames[frameIndex],size:atlas?.size,
  weaponName:weapon?.name||null,supported,upgrade:weapon?.upgradeLevel||0,element:weapon?.element||null,
  key:`${race}-${cls}:${armorLook}:${atlasKey}:${frameIndex}:${weapon?.upgradeLevel||0}`};
}
