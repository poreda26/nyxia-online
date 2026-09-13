import {useId} from 'react';
import {characterAppearance} from '../data/characterAppearance';
import {weaponEffects,weaponEffectPolygon} from '../data/weaponEffects';
import './CharacterFigure.css';
const atlases=import.meta.glob('../assets/characters/weapons/*.png',{eager:true,query:'?url',import:'default'});

export default function CharacterFigure({player,className='',align='xMidYMax meet'}){
 const clip=useId();
 const appearance=characterAppearance(player);
 if(!appearance?.frame)return <div className="character-loading" role="status">Görünüm hazırlanıyor</div>;
 const {frame,size,atlasKey,weaponName,upgrade}=appearance;
 const effects=appearance.supported?weaponEffects(player?.equipped?.mainHand):[];
 const source=atlases[`../assets/characters/weapons/${atlasKey}.png`];
 const label=`${appearance.identity} · ${weaponName||'Silahsız'}${weaponName?` +${upgrade}`:''}`;
 return <svg key={appearance.key} className={`character-figure ${className}`} viewBox={frame.rect.join(' ')} preserveAspectRatio={align} role="img" aria-label={label} data-character={appearance.identity} data-weapon={weaponName||''} data-look={appearance.armorLook}>
  <defs><clipPath id={clip}><path d={frame.mask}/></clipPath>
   <clipPath id={`${clip}-weapon`}><polygon points={weaponEffectPolygon(appearance)}/></clipPath>
   {effects.map(effect=><filter key={effect.key} id={`${clip}-${effect.key}`} x="-35%" y="-35%" width="170%" height="170%" colorInterpolationFilters="sRGB">
    <feFlood floodColor={effect.color} floodOpacity={effect.strong?1:.65}/><feComposite in2="SourceAlpha" operator="in" result="tint"/>
    <feGaussianBlur in="tint" stdDeviation={effect.strong?7:4} result="halo"/>
    <feMerge><feMergeNode in="halo"/><feMergeNode in="tint"/></feMerge>
   </filter>)}
  </defs>
  <image key={source} href={source} width={size[0]} height={size[1]} clipPath={`url(#${clip})`}/>
  {effects.map((effect,index)=><g key={effect.key} className={`weapon-effect weapon-effect-${effect.key} ${effect.strong?'weapon-effect-strong':''}`} data-element={effect.key} data-upgrade={upgrade} style={{animationDelay:`${index*-.7}s`}} filter={`url(#${clip}-${effect.key})`}>
   <g clipPath={`url(#${clip}-weapon)`}><path d={frame.mask} fill="white"/></g>
  </g>)}
 </svg>;
}

