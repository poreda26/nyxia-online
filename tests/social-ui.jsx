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
 {view==='clan'?<ClanTab player={player} setPlayer={setPlayer} pushToast={()=>{}}/>:view==='chat'?<ChatTab player={player} setPlayer={setPlayer} bank={[]} setBank={()=>{}} pushToast={()=>{}}/>:<><AvatarPicker value="human-warrior" onChange={()=>{}}/><AvatarPicker clan value="wolf" onChange={()=>{}}/><div style={{width:300,height:300}}><MonsterFigure rect={art.rect} outline={art.clip} label="Nadas Devi" source={actors} size={art.size}/></div></>}
 </div></LanguageProvider>;
}
window.socialView=view=>root.render(<App key={view} view={view}/>);
window.socialView('gallery');
