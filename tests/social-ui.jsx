import TopBar from '../src/components/TopBar';
import {CLASSES} from '../src/data/classes';
import {AVATAR_FRAMES} from '../src/data/avatarFrames';
import {buildBonusGear} from '../src/utils/firstPurchaseBonus';
import CharacterFigure from '../src/components/CharacterFigure';
import ItemIcon from '../src/components/ItemIcon';
import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {LanguageProvider} from '../src/i18n/LanguageContext';
import ClanTab from '../src/components/ClanTab';
import ChatTab from '../src/components/ChatTab';
import Avatar,{AvatarPicker} from '../src/components/Avatar';
import {initialPlayer} from '../src/utils/player';
import {MonsterFigure} from '../src/components/BattleScene';
import {battleVisualFor} from '../src/data/battleVisuals';
import actors from '../src/assets/battle/actors-v1.png';
import GlobalStyle from '../src/components/GlobalStyle';
import '../src/components/GameChrome.css';
const root=createRoot(document.getElementById('root'));
function App({view}){
 const [player,setPlayer]=useState(()=>({...initialPlayer('warrior','human','Test'),diamonds:5000}));
 window.socialPlayer=player;
 const art=battleVisualFor({id:'nadas_devi'});
 return <LanguageProvider lang="tr" setLang={()=>{}}><GlobalStyle/><div style={{width:'100%',maxWidth:430,margin:'auto',padding:12,boxSizing:'border-box',fontFamily:'var(--font-body)',color:'var(--text-primary)',background:'var(--bg-panel)'}}>
 <TopBar player={player} setPlayer={setPlayer} cls={CLASSES[player.class]} maxHp={140} atk={10} def={5}/>
 {view==='frames'?<div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:22,padding:12}}>{AVATAR_FRAMES.map(f=><Avatar key={f.id} id='paint-dragon' frameId={f.id} size={64}/>)}</div>:view==='rewards'?<>{['warrior','rogue','mage'].flatMap(cls=>['human','karus'].map(race=>{const gear=buildBonusGear(cls),weapon=gear.find(i=>i.kind==='weapon'),p={...initialPlayer(cls,race,'Test'),equipped:{mainHand:weapon,...Object.fromEntries(gear.filter(i=>i.kind==='armor').map(i=>[i.slot,i]))}};return <section key={cls+race}><h3>{race} — {weapon.name}</h3><ItemIcon item={weapon} size={70}/><div style={{height:350}}><CharacterFigure player={p}/></div></section>}))}</>:view==='clan'?<ClanTab player={player} setPlayer={setPlayer} pushToast={()=>{}}/>:view==='chat'?<ChatTab player={player} setPlayer={setPlayer} bank={[]} setBank={()=>{}} pushToast={()=>{}}/>:<><AvatarPicker value="human-warrior" onChange={()=>{}}/><AvatarPicker clan value="wolf" onChange={()=>{}}/><div style={{width:300,height:300}}><MonsterFigure rect={art.rect} outline={art.clip} label="Nadas Devi" source={actors} size={art.size}/></div></>}
 </div></LanguageProvider>;
}
window.socialView=view=>root.render(<App key={view} view={view}/>);
window.socialView('gallery');
