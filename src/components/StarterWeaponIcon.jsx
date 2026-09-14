import {useId} from 'react';
import {weaponIconArt} from '../data/starterWeaponArt';
import {weaponEffects} from '../data/weaponEffects';
const atlases=import.meta.glob('../assets/items/*weapons-v1.png',{eager:true,query:'?url',import:'default'});

export default function StarterWeaponIcon({item,size,source}){
 const id=useId(),art=weaponIconArt(item.name),cell=art?.index||0,x=source?0:cell%3*418,y=source?0:Math.floor(cell/3)*418;
 const atlas=source||atlases[`../assets/items/${art?.sheet}.png`],dimension=source?418:1254;
 const effects=weaponEffects(item);
 return <svg width={size} height={size} viewBox={`${x} ${y} 418 418`} role="img" aria-label={item.name} style={{flexShrink:0,borderRadius:5,overflow:'hidden'}} data-item-art={item.name}>
  <defs>{effects.map(e=><filter key={e.key} id={`${id}-${e.key}`} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
   <feColorMatrix type="luminanceToAlpha"/>
   <feComponentTransfer><feFuncA type="linear" slope="3" intercept="-.28"/></feComponentTransfer>
   <feGaussianBlur stdDeviation={e.key==='temper'?2:e.strong?9:5} result="lightmask"/>
   <feFlood floodColor={e.color} floodOpacity={e.strong?.85:.5}/><feComposite in2="lightmask" operator="in"/>
  </filter>)}</defs>
  <image href={atlas} width={dimension} height={dimension}/>
  {effects.map(e=><image key={e.key} href={atlas} width={dimension} height={dimension} filter={`url(#${id}-${e.key})`} style={{mixBlendMode:'screen',opacity:e.strong?.5:.3}}/>)}
 </svg>;
}
