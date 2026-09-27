import {useState} from 'react';
import {Award,Lock,CheckCircle2} from 'lucide-react';
import {ACHIEVEMENTS} from '../data/achievements';
import {isAchievementUnlocked} from '../utils/achievements';
import {useTranslation} from '../i18n/LanguageContext';
import './AchievementsPanel.css';
export default function AchievementsPanel({player,onTitle}){
 const {t,lang}=useTranslation(),[filter,setFilter]=useState('all');
 const unlocked=ACHIEVEMENTS.filter(a=>isAchievementUnlocked(player,a));
 return <section className="achievement-journal"><header><Award size={38}/><div><small>{lang==='en'?'CHRONICLE OF HEROES':'KAHRAMANLIK GÜNLÜĞÜ'}</small><h2>{lang==='en'?'Leave your mark':'Efsaneni yaz'}</h2><p>{unlocked.length} / {ACHIEVEMENTS.length} {lang==='en'?'titles unlocked':'unvan açıldı'}</p></div></header><div className="achievement-filters">{[['all','Tümü','All'],['open','Tamamlanan','Completed'],['locked','Devam eden','In progress']].map(([id,tr,en])=><button key={id} aria-pressed={filter===id} onClick={()=>setFilter(id)}>{lang==='en'?en:tr}</button>)}</div>{player.activeTitle&&<button className="achievement-clear" onClick={()=>onTitle(null)}>{t('character.achievements.removeTitleBtn')}</button>}
 {ACHIEVEMENTS.filter(a=>filter==='all'||isAchievementUnlocked(player,a)===(filter==='open')).map(a=>{
 const open=isAchievementUnlocked(player,a),active=player.activeTitle===a.id,goal=a.target||1;
 const n=a.type==='kills'?Object.values(player.monsterKills||{}).reduce((s,n)=>s+n,0):a.type==='level'?player.level:a.type==='counter'?(player.milestones?.[a.counter]||0):open?1:0;
 const Icon=a.icon;return <article key={a.id} className={`journal-entry ${open?'complete':''} ${active?'equipped':''}`} style={{'--medal':a.color}}><div className="achievement-medal"><Icon size={30}/></div><div className="journal-body"><div className="journal-title"><h3>{t(`character.achievements.${a.id}.name`)}</h3>{open?<CheckCircle2 size={16}/>:<Lock size={14}/>}</div><p>{t(`character.achievements.${a.id}.desc`)}</p><div className="journal-track" role="progressbar" aria-label={t(`character.achievements.${a.id}.name`)} aria-valuemin={0} aria-valuemax={goal} aria-valuenow={Math.min(n,goal)}><span style={{width:`${Math.min(100,n/goal*100)}%`}}/></div><small>{Math.min(n,goal).toLocaleString()} / {goal.toLocaleString()} · {t(`character.achievements.${a.id}.title`)}</small>{open&&<button disabled={active} onClick={()=>onTitle(a.id)}>{t(active?'character.achievements.usingTitleBtn':'character.achievements.useTitleBtn')}</button>}</div></article>;
 })}</section>;
}
