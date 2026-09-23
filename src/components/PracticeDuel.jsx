import {useState,useEffect} from 'react';
import {createDuel,stepDuel} from '../utils/duelEngine';
import {comparablePlayer} from '../utils/pvpBalance';
import {classSkills} from '../utils/skills';
import DuelScene from './DuelScene';
import {styles} from '../styles';
import {useTranslation} from '../i18n/LanguageContext';
export default function PracticeDuel({player}){
 const {lang}=useTranslation();const [cls,setCls]=useState(player.class),[match,setMatch]=useState(null);
 useEffect(()=>{if(!match||match.state.finished)return;const timer=setTimeout(()=>setMatch(m=>({...m,state:stepDuel(m.state)})),900);return ()=>clearTimeout(timer);},[match]);
 const start=()=>{const enemy=comparablePlayer(player,cls);enemy.nickname='Antrenman';enemy.equipped={...enemy.equipped,wings:player.equipped.wings};const skills=classSkills(cls).filter(s=>s.unlockLevel<=player.level);enemy.skills={known:skills.map(s=>s.id),loadout:['heal','buffAtk','dot','damage','execute'].map(type=>skills.filter(s=>s.effect.type===type).at(-1)?.id).filter(Boolean)};setMatch({self:structuredClone(player),enemy,state:createDuel(player,enemy,{fullHealth:true,seed:Math.floor(Math.random()*4294967295)})});};
 const a=match?.state.fighters[0],b=match?.state.fighters[1],events=match?.state.events||[],out=events.find(e=>e.side===0&&e.type!=='dotTick'),inc=events.find(e=>e.side===1&&e.type!=='dotTick');
 return <section style={{...styles.combatant,display:'block',minWidth:0,color:'var(--text-primary)',fontFamily:'var(--font-body)'}}>
 <p style={{fontSize:12,lineHeight:1.6}}>{lang==='tr'?'Yerel antrenman: gerçek oyuncu bağlantısı yok. Beceri dizilimini Karakter bölümünden seç. İki taraf otomatik oynar; eşya, can, mana ve ödüller kaydını etkilemez.':'Local practice, not a connected player. Choose your skill loadout in Character. Both sides play automatically; no saved resources or rewards change.'}</p>
 {!match&&<div style={{display:'flex',gap:8,flexWrap:'wrap'}}><select aria-label="Rakip sınıfı" value={cls} onChange={e=>setCls(e.target.value)} style={styles.input}>{['warrior','rogue','mage'].map(c=><option key={c}>{c}</option>)}</select><button style={styles.primaryBtn} onClick={start}>{lang==='tr'?'Otomatik VS dene':'Start auto duel'}</button></div>}
 {match&&<><DuelScene player={{...match.self,hp:a.hp,mp:a.mp}} ghost={{name:match.enemy.nickname,cls:match.enemy.class,avatar:match.enemy,maxHp:b.maxHp}} duel={{engine:match.state,ghostHp:b.hp,finished:match.state.finished}} visual={{id:match.state.round,type:out?.type,skillId:out?.skillId,enemySkillId:inc?.skillId,enemyType:inc?.type,outgoing:out?{...out,damage:out.heal||out.damage}:null,incoming:inc?{...inc,damage:inc.heal||inc.damage}:null}}/>
 <p style={{fontSize:12}}>{match.state.finished?(match.state.winner===null?'Berabere':match.state.winner===0?'Kazandın':'Rakip kazandı'):`Tur ${match.state.round} · Otomatik savaş`}</p><button style={styles.ghostBtn} onClick={()=>setMatch(null)}>{lang==='tr'?'Antrenmandan çık':'Leave practice'}</button></>}
 </section>;
}
