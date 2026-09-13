import {useId} from 'react';
import {characterAppearance} from '../data/characterAppearance';
import './CharacterFigure.css';
const atlases=import.meta.glob('../assets/characters/weapons/*.png',{eager:true,query:'?url',import:'default'});
const glow={flame:'#eb8f36',ice:'#8bd8ed',lightning:'#91afff',poison:'#9bd46f'};

export default function CharacterFigure({player,className=''}){
 const clip=useId();
 const appearance=characterAppearance(player);
 if(!appearance?.frame)return <div className="character-loading" role="status">Görünüm hazırlanıyor</div>;
 const {frame,size,atlasKey,weaponName,upgrade,element}=appearance;
 const source=atlases[`../assets/characters/weapons/${atlasKey}.png`];
 const label=`${appearance.identity} · ${weaponName||'Silahsız'}${weaponName?` +${upgrade}`:''}`;
 return <svg key={appearance.key} className={`character-figure ${className}`} viewBox={frame.rect.join(' ')} preserveAspectRatio="xMidYMax meet" role="img" aria-label={label} data-character={appearance.identity} data-weapon={weaponName||''} data-look={appearance.armorLook} style={upgrade>=7?{filter:`drop-shadow(0 0 ${upgrade>=8?4:2}px ${glow[element]||'#deb46c'})`}:undefined}>
  <defs><clipPath id={clip}><path d={frame.mask}/></clipPath></defs>
  <image key={source} href={source} width={size[0]} height={size[1]} clipPath={`url(#${clip})`}/>
 </svg>;
}
