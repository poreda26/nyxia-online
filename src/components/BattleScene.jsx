import actors from '../assets/battle/actors-v1.png';
import {useId} from 'react';
import {playerMaxHp,playerMaxMp} from '../utils/player';
import arena from '../assets/battle/arena-v1.png';
import regions from '../assets/battle/regions-v1.png';
import ashen from '../assets/battle/ashen-v1.png';
import frost from '../assets/battle/frost-v1.png';
import sanctuary from '../assets/battle/sanctuary-v1.png';
import abyss from '../assets/battle/abyss-v1.png';
import crimson from '../assets/battle/crimson-v1.png';
import {battleVisualFor} from '../data/battleVisuals';
const enemyAtlases={fallow:actors,ashen,frost,sanctuary,abyss,crimson};
import './BattleScene.css';

// Read-only presentation: no timers, rewards, combat decisions or storage writes.
const heroes = {warrior: [[8,8,349,386],[373,8,356,386]], rogue: [[729,0,357,393],[1090,0,358,393]], mage: [[2,398,359,363],[382,398,342,363]]};
export const hasBattleScene = monster => !!battleVisualFor(monster);
function Figure({rect,label,source=actors,size=[1448,1086]}) {
  const clip=useId();
  return <svg className="battle-figure" viewBox={rect.join(' ')} preserveAspectRatio="xMidYMax meet" role="img" aria-label={label}>
    <defs><clipPath id={clip}><rect x={rect[0]} y={rect[1]} width={rect[2]} height={rect[3]}/></clipPath></defs>
    <image href={source} width={size[0]} height={size[1]} clipPath={`url(#${clip})`} />
  </svg>;
}
export default function BattleScene({player,monster,battle,map,visual}) {
  const art=battleVisualFor(monster);
  if(!art) return null;
  const rect=art.rect;
  const hero=(heroes[player.class]||heroes.warrior)[player.race==='karus'?1:0];
  const support=visual.type==='heal'||visual.type==='buffAtk'||visual.type==='buffDef'||visual.type==='potion';
  const ranged=player.class!=='warrior';
  const active=visual.id>0;
  return <section className="battle-scene" aria-label="Savaş sahnesi" style={art.atlas==='fallow'?{backgroundImage:`url(${arena})`}:{backgroundImage:`url(${regions})`,backgroundSize:'300% 200%',backgroundPosition:`${(art.background%3)*50}% ${Math.floor(art.background/3)*100}%`}}>
    <div className="battle-scene-title">Savaş<span>{map.name}</span></div>
    <div className="battle-hud">
      <div><strong>{player.nickname || 'Sen'}</strong><meter aria-label="Canın" min="0" max={playerMaxHp(player)} value={player.hp}/><small>{player.hp} / {playerMaxHp(player)}</small><meter className="mana" aria-label="Manan" min="0" max={playerMaxMp(player)} value={player.mp}/><small>MP {player.mp} / {playerMaxMp(player)}</small></div>
      <div><strong>{monster.name}</strong><meter aria-label="Düşman canı" min="0" max={battle.monsterMaxHp} value={battle.monsterHp}/><small>{battle.monsterHp} / {battle.monsterMaxHp}</small><small>{monster.isBoss?'BOSS':'DÜŞMAN'}</small></div>
    </div>
    <div key={visual.id} className={`battle-cast ${active?'is-active':''} ${support?'is-support':''} ${ranged?'is-ranged':''} ${battle.monsterHp<=0?'is-victory':''}`}>
      <div className="battle-unit battle-hero"><div className="battle-motion"><Figure rect={hero} label={player.class==='rogue'?'Okçu':player.class==='mage'?'Büyücü':'Savaşçı'}/></div><span className="battle-unit-name">{player.nickname || 'Sen'}</span></div>
      <div className="battle-unit battle-enemy"><div className="battle-motion"><Figure rect={rect} label={monster.name} source={enemyAtlases[art.atlas]} size={art.size}/></div><span className="battle-unit-name">{monster.name}</span></div>
      {active&&<><i className={`battle-effect ${support?'battle-aura':ranged?'battle-projectile':'battle-slash'}`} /><i className="battle-counter" /></>}
    </div>
    <div className="battle-scene-caption">{battle.monsterHp<=0?'Düşman yenildi':visual.label||'Savaşa hazır'}</div>
  </section>;
}
