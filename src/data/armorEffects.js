import {armorTier} from './armorRig.js';
const colors=['','#bed1df','#83caff','#baacff','#6fe7ff','#ffdb80'];
// Presentation only: never add bonuses or modify the equipped item.
export function armorEffect(item,cls,slot){
 const tier=armorTier(item,cls,slot),plus=Number(item?.upgradeLevel);
 if(!tier||plus<7||!Number.isFinite(plus))return null;
 return {tier,plus,strong:plus>=8,color:colors[tier],radius:1+tier*.45,blur:1+tier*.5,intensity:.35+tier*.1,duration:4.8-tier*.4};
}
