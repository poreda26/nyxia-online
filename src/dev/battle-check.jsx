import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import BattleTab from '../components/BattleTab';
import GlobalStyle from '../components/GlobalStyle';
import {initialPlayer,totalStats,playerDef} from '../utils/player';
import {classSkills} from '../utils/skills';
import {MAPS} from '../data/maps';
import {CLASSES} from '../data/classes';
function previewPlayer(c,r,n){const p=initialPlayer(c,r,n);return {...p,skills:{...p.skills,loadout:classSkills(c).slice(0,5).map(s=>s.id)}};}
function Check(){
 const [player,setPlayer]=useState(()=>previewPlayer('warrior','elmorad','Savaşçı'));
 const [toast,setToast]=useState('');
 const [mobile,setMobile]=useState(true);
 return <><GlobalStyle/><main style={{maxWidth:mobile?420:760,margin:'20px auto',padding:16,background:'#0c1419',color:'#eee'}}>
 <select aria-label="Kontrol haritası" value={player.currentMapId} onChange={e=>{const map=MAPS.find(m=>m.id===e.target.value);setPlayer(p=>({...p,currentMapId:map.id,level:map.levelMin}));}}>{MAPS.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select>
 <button onClick={()=>setMobile(!mobile)}>{mobile?'Geniş görünüm':'Mobil görünüm'}</button>
 <header style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:16}}>{['warrior','rogue','mage'].map(c=><button key={c} onClick={()=>setPlayer(previewPlayer(c,player.race,CLASSES[c].name))}>{CLASSES[c].name}</button>)}<button onClick={()=>setPlayer(previewPlayer(player.class,player.race==='karus'?'elmorad':'karus',CLASSES[player.class].name))}>İnsan / Ork</button><span>Kayıtsız savaş kontrolü</span></header>
 <BattleTab key={player.class+player.race+player.currentMapId} player={player} setPlayer={setPlayer} cls={CLASSES[player.class]} def={playerDef(player)} atk={totalStats(player).atk} pushToast={setToast}/><p role="status">{toast}</p>
 </main></>;
}
createRoot(document.getElementById('root')).render(<Check/>);
