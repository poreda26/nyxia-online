import {useId} from 'react';
import WeaponEffectFilter from './WeaponEffectFilter';
import {characterAppearance} from '../data/characterAppearance';
import {weaponEffects} from '../data/weaponEffects';
import {weaponGeometry} from '../data/weaponGeometry';
import './CharacterFigure.css';
const atlases=import.meta.glob('../assets/characters/weapons/*.png',{eager:true,query:'?url',import:'default'});

export default function CharacterFigure({player,className='',align='xMidYMax meet'}){
 const clip=useId();
 const appearance=characterAppearance(player);
 if(!appearance?.frame)return <div className="character-loading" role="status">Görünüm hazırlanıyor</div>;
 const {frame,size,atlasKey,weaponName,upgrade}=appearance;
 const effects=appearance.supported?weaponEffects(player?.equipped?.mainHand):[];
 const geometry=weaponGeometry(appearance);
 const handHoles=geometry.hands.map(([cx,cy,rx,ry],i)=><ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill="black"/>);
 const source=atlases[`../assets/characters/weapons/${atlasKey}.png`];
 const label=`${appearance.identity} · ${weaponName||'Silahsız'}${weaponName?` +${upgrade}`:''}`;
 return <svg key={appearance.key} className={`character-figure ${className}`} viewBox={frame.rect.join(' ')} preserveAspectRatio={align} role="img" aria-label={label} data-character={appearance.identity} data-weapon={weaponName||''} data-look={appearance.armorLook}>
  <defs><clipPath id={clip}><path d={frame.mask}/></clipPath>
   <mask id={`${clip}-weapon`} maskUnits="userSpaceOnUse" x="0" y="0" width={size[0]} height={size[1]}>
    <g transform={geometry.transform}><path d={geometry.head} fill="white"/>{handHoles}</g>
   </mask>
   <mask id={`${clip}-shaft`} maskUnits="userSpaceOnUse" x="0" y="0" width={size[0]} height={size[1]}>
    <g transform={geometry.transform}><path d={geometry.shaft} fill="white"/>{handHoles}</g>
   </mask>
   <mask id={`${clip}-clearance`} maskUnits="userSpaceOnUse" x="-100" y="-100" width={size[0]+200} height={size[1]+200}>
    <rect x="-100" y="-100" width={size[0]+200} height={size[1]+200} fill="white"/>
    <path d={frame.mask} fill="black"/>
    <g transform={geometry.transform}><path d={geometry.head+geometry.shaft} fill="white"/>{handHoles}</g>
   </mask>
   {effects.map(effect=><filter key={effect.key} id={`${clip}-${effect.key}`} x="-35%" y="-35%" width="170%" height="170%" colorInterpolationFilters="sRGB">
    <WeaponEffectFilter effect={effect} spread={geometry.spread}/>
   </filter>)}
  </defs>
  <image key={source} href={source} width={size[0]} height={size[1]} clipPath={`url(#${clip})`}/>
  {effects.map((effect,index)=><g key={effect.key} className={`weapon-effect weapon-effect-${effect.key} ${effect.strong?'weapon-effect-strong':''}`} data-element={effect.key} data-upgrade={upgrade} style={{animationDelay:`${index*-.7}s`}} mask={`url(#${clip}-clearance)`}>
   <g filter={`url(#${clip}-${effect.key})`}><g mask={`url(#${clip}-weapon)`}><path d={frame.mask} fill="white"/></g></g>
   <g mask={`url(#${clip}-shaft)`} opacity={effect.strong?.25:.16}><path d={frame.mask} fill={effect.color}/></g>
  </g>)}
 </svg>;
}


