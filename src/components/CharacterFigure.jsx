import {useId} from 'react';
import {characterAppearance} from '../data/characterAppearance';
import frames from '../data/characterAtlasFrames.json';
import {characterArmorRig,armorAtlas,ARMOR_SLOTS} from '../data/armorRig';
import {bowEndpoints} from '../data/weaponGeometry';
import {weaponEffects} from '../data/weaponEffects';
import WeaponEffectFilter from './WeaponEffectFilter';
import './CharacterFigure.css';
const images=import.meta.glob('../assets/characters/weapons/*.png',{eager:true,query:'?url',import:'default'});
const url=key=>images[`../assets/characters/weapons/${key}.png`];
const cellTransform=i=>`translate(${i%3*418} ${Math.floor(i/3)*627})`;
const spine=g=>{if(g.hands.length<2||!g.shaft)return '';const start=g.shaft.match(/M([^L]+)/)[1],front=g.hands[0],back=g.hands[1];return `M${start}L${back[0]},${back[1]}L${front[0]},${front[1]}L${front[0]+(front[0]-back[0])*1.2},${front[1]+(front[1]-back[1])*1.2}`;};
const holes=(g,color)=>g.hands.map(([cx,cy,rx,ry],i)=><ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill={color}/>);
export default function CharacterFigure({player,className='',align='xMidYMax meet'}){
 const id=useId(),a=characterAppearance(player),rig=a&&characterArmorRig(player,a);
 if(!rig||!a.frame)return <div className="character-loading">Görünüm hazırlanıyor</div>;
 const {sourceGeometry:sg,targetGeometry:tg,frameIndex:si,tiers,regions}=rig;
 const clothKey=armorAtlas(player.class,0),sourceFrame=frames[clothKey]?.frames[si];
 if(!sourceFrame)return <div className="character-loading">Görünüm hazırlanıyor</div>;
 const active=ARMOR_SLOTS.filter(slot=>tiers[slot]);
 const layers=[{name:'cloth',key:clothKey},...active.map(slot=>({name:slot,key:armorAtlas(player.class,tiers[slot])}))];
 const targetOffset=`translate(${-(a.frameIndex%3)*418} ${-Math.floor(a.frameIndex/3)*627})`;
 const sourceBow=bowEndpoints({atlasKey:rig.sourceKey,frameIndex:si});
 const targetBow=a.weaponName?bowEndpoints(a):null;
 const alignedBow=targetBow?.map(([x,y])=>[(x-rig.dx)/rig.scale,(y-rig.dy)/rig.scale]);
 const sourceGrip=rig.col===2?null:[184,211+(rig.row?-10:0)];
 const stringPath=(ends,pull)=>ends?`M${ends[0]}L${pull}L${ends[1]}`:'';
 const effects=a.supported?weaponEffects(player.equipped?.mainHand):[];
 const clipPath=(key,i)=>{const f=frames[key];return f?.frames[i]?<path d={f.frames[i].mask} transform={`scale(${1254/f.size[0]} ${1254/f.size[1]})`}/>:null;};
 const regionPaths=name=>ARMOR_SLOTS.map(slot=><path key={slot} d={regions[slot]} fill={(name==='cloth'?!tiers[slot]:name===slot)?'white':'black'}/>);
 return <svg className={`character-figure ${className}`} viewBox="-92 0 602 627" preserveAspectRatio={align} role="img" aria-label={`${a.identity} · ${a.weaponName||'Silahsız'}`} data-character={a.identity} data-weapon={a.weaponName||''} data-look={active.length?'armor':'cloth-base'} data-armor-slots={active.join(',')}>
 <defs>
  <clipPath id={`${id}-target`}>{clipPath(a.atlasKey,a.frameIndex)}</clipPath>
  <mask id={`${id}-source-weapon`} maskUnits="userSpaceOnUse" x="0" y="0" width="1254" height="1254"><g transform={cellTransform(si)}><path d={rig.cls==='rogue'?sg.head:''} fill="white"/><path d={spine(sg)} fill="none" stroke="white" strokeWidth="16"/>{sourceBow&&<path d={stringPath(sourceBow,sourceGrip)} fill="none" stroke="white" strokeWidth="6"/>}{holes(sg,'black')}</g></mask>
  {layers.map(layer=><g key={layer.name}>
   <clipPath id={`${id}-${layer.name}-clip`}>{clipPath(layer.key,si)}</clipPath>
   <mask id={`${id}-${layer.name}-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width="1254" height="1254"><g transform={cellTransform(si)}>{regionPaths(layer.name)}</g><rect width="1254" height="1254" fill="black" mask={`url(#${id}-source-weapon)`}/></mask>
  </g>)}
  <mask id={`${id}-target-weapon`} maskUnits="userSpaceOnUse" x="0" y="0" width="1254" height="1254"><g transform={cellTransform(a.frameIndex)}><path d={tg.head} fill="white"/><path d={spine(tg)} fill="none" stroke="white" strokeWidth="16"/>{holes(tg,'black')}</g></mask>
  <mask id={`${id}-head`} maskUnits="userSpaceOnUse" x="0" y="0" width="1254" height="1254"><g transform={cellTransform(a.frameIndex)}><path d={tg.head} fill="white"/>{holes(tg,'black')}</g></mask>
  <mask id={`${id}-grip`} maskUnits="userSpaceOnUse" x="0" y="0" width="1254" height="1254"><g transform={cellTransform(si)}>{regionPaths('gauntlets')}</g></mask>
  <clipPath id={`${id}-grip-clip`}>{clipPath(armorAtlas(player.class,tiers.gauntlets),si)}</clipPath>
  <mask id={`${id}-clearance`} maskUnits="userSpaceOnUse" x="-100" y="-100" width="1454" height="1454"><rect x="-100" y="-100" width="1454" height="1454" fill="white"/>{clipPath(a.atlasKey,a.frameIndex)}<g transform={cellTransform(a.frameIndex)}><path d={tg.head} fill="white"/>{holes(tg,'black')}</g></mask>
  {effects.map(e=><filter key={e.key} id={`${id}-effect-${e.key}`} x="-35%" y="-35%" width="170%" height="170%" colorInterpolationFilters="sRGB"><WeaponEffectFilter effect={e} spread={tg.spread}/></filter>)}
 </defs>
 <g transform={rig.transform}>
  <svg width="418" height="627" viewBox={`${si%3*418} ${Math.floor(si/3)*627} 418 627`} overflow="visible">
   {layers.map(layer=><image key={layer.name} data-armor-layer={layer.name} data-armor-tier={tiers[layer.name]||0} href={url(layer.key)} width="1254" height="1254" clipPath={`url(#${id}-${layer.name}-clip)`} mask={`url(#${id}-${layer.name}-mask)`}/>)}
  </svg>
  {alignedBow&&<g stroke="#987b50" fill="none" strokeWidth="1.5"><path d={stringPath(alignedBow,sourceGrip)}/><path d={`M${sourceGrip}L405,${sourceGrip[1]}`}/><path d={`M400,${sourceGrip[1]-4}L415,${sourceGrip[1]}L400,${sourceGrip[1]+4}`}/></g>}
 </g>
 {a.weaponName&&a.supported&&<g transform={targetOffset}>
  <image data-held-weapon={a.weaponName} href={url(a.atlasKey)} width="1254" height="1254" clipPath={`url(#${id}-target)`} mask={`url(#${id}-target-weapon)`}/>
  {effects.map(e=><g key={e.key} className={`weapon-effect weapon-effect-${e.key} ${e.strong?'weapon-effect-strong':''}`} data-element={e.key} data-upgrade={a.upgrade} mask={`url(#${id}-clearance)`}><g filter={`url(#${id}-effect-${e.key})`}><g mask={`url(#${id}-head)`}>{clipPath(a.atlasKey,a.frameIndex)}</g></g></g>)}
 </g>}
 <g transform={rig.transform}><svg width="418" height="627" viewBox={`${si%3*418} ${Math.floor(si/3)*627} 418 627`} overflow="visible"><image href={url(armorAtlas(player.class,tiers.gauntlets))} width="1254" height="1254" clipPath={`url(#${id}-grip-clip)`} mask={`url(#${id}-grip)`}/></svg></g>
 </svg>;
}

