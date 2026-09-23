import SkillEffect from './SkillEffect';
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
import CharacterFigure from './CharacterFigure';
import {useTranslation} from '../i18n/LanguageContext';

// Read-only presentation: no timers, rewards, combat decisions or storage writes.
export const hasBattleScene = monster => !!battleVisualFor(monster);
function Figure({rect,label,source=actors,size=[1448,1086]}) {
  const clip=useId();
  return <svg className="battle-figure" viewBox={rect.join(' ')} preserveAspectRatio="xMidYMax meet" role="img" aria-label={label}>
    <defs><clipPath id={clip}><rect x={rect[0]} y={rect[1]} width={rect[2]} height={rect[3]}/></clipPath></defs>
    <image href={source} width={size[0]} height={size[1]} clipPath={`url(#${clip})`} />
  </svg>;
}
// enemyScale: kullanıcı isteği ("Boss oldukları için diğerlerinden en az
// 2-3 kat daha büyük olsun") — Savaş Alanı bossları ödünç canavar sanatı
// kullandığı için (bkz. data/warzone.js#WARZONE_BOSSES'in visualSourceId'i)
// aradaki farkı büyüklükle gösteriyoruz. Ayakları aynı yerde kalsın diye
// (.battle-enemy zaten bottom:16% ile konumlanıyor) ölçek alttan-ortadan
// büyüyor, bkz. aşağıdaki transformOrigin.
export default function BattleScene({player,monster,battle,map,visual,enemyScale}) {
  const {t,tm}=useTranslation();
  const art=battleVisualFor(monster);
  if(!art) return null;
  const rect=art.rect;
  const support=visual.type==='heal'||visual.type==='buffAtk'||visual.type==='buffDef'||visual.type==='potion';
  const ranged=player.class!=='warrior';
  const active=visual.id>0;
  const incoming=active&&battle.monsterHp>0?visual.incoming:null;
  // Kullanıcı isteği: canavara vurduğumuzda da (incoming'in aynısı, ters
  // yönde) bir "−X"/"Iskaladın" uçan yazısı görünsün. Can çeken (heal)
  // becerilerde/potlarda da aynı uçan yazı sistemi "+X" olarak (bkz.
  // .outgoing-heal, BattleTab.jsx#useSkill/handlePotion) — outgoing.heal
  // true ise hep "hit" sayılır, kritik/ıskalama kavramı heal'de yok.
  const outgoing=active?visual.outgoing:null;
  return <section className="battle-scene" aria-label={t('battle.sceneTitle')} style={art.atlas==='fallow'?{backgroundImage:`url(${arena})`}:{backgroundImage:`url(${regions})`,backgroundSize:'300% 200%',backgroundPosition:`${(art.background%3)*50}% ${Math.floor(art.background/3)*100}%`}}>
    <div className="battle-scene-title">{t('battle.sceneTitle')}<span>{map.name}</span></div>
    <div className="battle-hud">
      <div><strong>{player.nickname || t('battle.you')}</strong><meter aria-label={t('battle.yourHp')} min="0" max={playerMaxHp(player)} value={player.hp}/><small>{player.hp} / {playerMaxHp(player)}</small><meter className="mana" aria-label={t('battle.yourMp')} min="0" max={playerMaxMp(player)} value={player.mp}/><small>MP {player.mp} / {playerMaxMp(player)}</small></div>
      <div><strong>{tm(monster)}</strong><meter aria-label={t('battle.enemyHp')} min="0" max={battle.monsterMaxHp} value={battle.monsterHp}/><small>{battle.monsterHp} / {battle.monsterMaxHp}</small><small>{monster.isBoss?t('battle.boss'):t('battle.enemy')}</small></div>
    </div>
    <div key={visual.id} className={`battle-cast ${active?'is-active':''} ${support?'is-support':''} ${ranged?'is-ranged':''} ${incoming?'has-counter':''} ${incoming?.hit?'incoming-hit':''} ${battle.monsterHp<=0?'is-victory':''}`}>
      <div className="battle-unit battle-hero"><div className="battle-motion"><CharacterFigure player={player}/></div><span className="battle-unit-name">{player.nickname || t('battle.you')}</span></div>
      <div className="battle-unit battle-enemy" style={enemyScale?{transform:`scale(${enemyScale})`,transformOrigin:'50% 100%'}:undefined}><div className="battle-motion"><Figure rect={rect} label={tm(monster)} source={enemyAtlases[art.atlas]} size={art.size}/></div><span className="battle-unit-name" style={enemyScale?{transform:`scale(${1/enemyScale})`}:undefined}>{tm(monster)}</span></div>
      {active&&visual.skillId&&<SkillEffect id={visual.skillId} type={visual.type}/>}
      {active&&!visual.skillId&&<><i className={`battle-effect ${support?'battle-aura':ranged?'battle-projectile':'battle-slash'}`} />{!support&&<i className="battle-impact" aria-hidden="true"/>}</>}
      {incoming&&<>{incoming.hit&&<><i className="battle-counter" aria-hidden="true"/><i className="incoming-burst" aria-hidden="true"/></>}<span className={`incoming-number ${incoming.hit?'':'incoming-miss'}`}>{incoming.hit?`−${incoming.damage}`:t('battle.missIncoming')}</span></>}
      {outgoing&&<span className={`outgoing-number ${outgoing.heal?'outgoing-heal':outgoing.hit?(outgoing.crit?'outgoing-crit':''):'outgoing-miss'}`}>{outgoing.heal?`+${outgoing.damage}`:outgoing.hit?`−${outgoing.damage}`:t('battle.missOutgoing')}</span>}
    </div>
    <div className="battle-scene-caption">{battle.monsterHp<=0?t('battle.enemyDefeated'):visual.label||t('battle.readyForBattle')}</div>
  </section>;
}
