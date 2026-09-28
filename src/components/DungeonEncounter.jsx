import {MonsterFigure} from './BattleScene';
import {battleVisualFor} from '../data/battleVisuals';
import {monsterAtlases} from '../data/monsterPortraits';
import {useTranslation} from '../i18n/LanguageContext';
import './DungeonEncounter.css';

// Presentation only: stages, rewards and shared HP remain server controlled.
export default function DungeonEncounter({stage,hp,index,total,completed}){
 const {lang}=useTranslation(),en=lang==='en';
 const art=battleVisualFor({id:stage.isFinalBoss?'dungeon_crimson_battlefront_boss':stage.isMidBoss?'dungeon_ruined_sanctuary_boss':`dungeon_ashen_canyon_${index}`,isBoss:stage.isBoss});
 const pct=Math.max(0,Math.min(100,(hp/stage.hp)*100));
 return <section className={`dungeon-encounter ${stage.isFinalBoss?'final':stage.isMidBoss?'guardian':''}`} aria-label={en?'Dungeon encounter':'Zindan karşılaşması'}>
  <div className="dungeon-encounter-heading"><span>{completed?(en?'COMPLETED':'TAMAMLANDI'):stage.isFinalBoss?'FINAL BOSS':stage.isMidBoss?(en?'GUARDIAN':'GÖZCÜ'):(en?'CLAN RAID':'KLAN AKINI')}</span><small>{Math.min(index,total)} / {total}</small></div>
  <div className="dungeon-encounter-art">{art&&<MonsterFigure rect={art.rect} outline={art.clip} size={art.size} source={monsterAtlases[art.atlas]} label={stage.name}/>}</div>
  <h3>{stage.name}</h3><div className="dungeon-enemy-stats"><span>ATK <b>{stage.atk}</b></span><span>DEF <b>{stage.def}</b></span><span>EXP <b>{stage.xp}</b></span></div>
  <div className="dungeon-boss-health"><span>{Math.round(hp).toLocaleString()} / {stage.hp.toLocaleString()} HP</span><meter min="0" max="100" value={pct} aria-label={en?'Boss health':'Boss canı'}/></div>
  <div className="dungeon-stage-track" aria-label={en?'Stage progress':'Aşama ilerlemesi'}>{Array.from({length:total},(_,i)=><i key={i} className={`${i+1<index||completed?'done':''} ${i+1===index&&!completed?'current':''} ${(i+1)%10===0?'boss':''}`} title={`${i+1}. ${en?'stage':'aşama'}`}/>)}</div>
  <footer>{en?'10 · Guardian / 20 · Final Boss':'10 · Gözcü / 20 · Final Boss'}</footer>
 </section>;
}
