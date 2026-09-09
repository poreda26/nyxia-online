// Development-only visual fixture. No storage imports or writes; not a game route.
import React, {useState,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import WorldTab from '../components/WorldTab';
import {initialPlayer} from '../utils/player';
import {createWorld} from '../world/engine';

function Check(){
  const [player,setPlayer]=useState(()=>initialPlayer('warrior','elmorad','Savaşçı kontrol'));
  const session=useRef(createWorld());
  const [panel,setPanel]=useState('world');
  const change=(cls,race)=>{session.current=null;setPlayer(initialPlayer(cls,race,'Görsel kontrol'));};
  return <>
    <WorldTab key={player.class+player.race} player={player} setPlayer={setPlayer} setTab={setPanel} sessionRef={session}/>
    <div style={{position:'fixed',zIndex:60,top:110,left:'35%',right:'20%',display:'flex',gap:6,flexWrap:'wrap',padding:8,background:'#09151be8',color:'#e9d39e',font:'12px sans-serif'}}>
      <button onClick={()=>change('warrior','elmorad')}>İnsan</button><button onClick={()=>change('warrior','karus')}>Ork</button>
      <button onClick={()=>change('rogue','karus')}>Okçu</button><button onClick={()=>change('mage','elmorad')}>Büyücü</button>
      <button onClick={()=>{session.current.actor.back=!session.current.actor.back;}}>Ön / Arka</button>
      <button onClick={()=>{session.current.actor.facing*=-1;}}>Sağ / Sol</button>
      <button onClick={()=>{session.current.swingStarted=session.current.time;session.current.swingUntil=session.current.time+.56;}}>Animasyon</button>
      <select aria-label="Kontrol silahı" disabled={player.class!=='warrior'} onChange={e=>{
        const [name,weaponType,upgradeLevel]=e.target.value.split('|');
        setPlayer(p=>({...p,equipped:{...p.equipped,mainHand:name==='none'?null:{...p.equipped.mainHand,name,weaponType,upgradeLevel:Number(upgradeLevel)}}}));
      }} value={player.equipped.mainHand?`${player.equipped.mainHand.name}|${player.equipped.mainHand.weaponType}|${player.equipped.mainHand.upgradeLevel}`:'none||0'}>
        <option value="Short Blade|sword|1">Başlangıç kılıcı</option><option value="Durandal|sword|1">Durandal</option>
        <option value="Mirage|sword|8">Mirage +8</option><option value="Stormweaver|sword|8">Stormweaver +8</option>
        <option value="Raptor|longspear|7">Raptor +7</option><option value="Giantic Axe|axe|8">Giantic Axe +8</option>
        <option value="none||0">Silahsız</option>
        <option value="Bow|bow|1">Okçu yayı</option><option value="Wood Staff|staff|1">Büyücü asası</option>
      </select>
      <button onClick={()=>setPlayer(p=>({...p,equipped:{...p.equipped,head:{name:'Chitin Armor Helmet'},chest:{name:'Chitin Armor Pauldron'}}}))}>T4 zırh</button>
      <button onClick={()=>setPlayer(p=>({...p,equipped:{...p.equipped,head:{name:'Chitin Shell Helmet'},chest:{name:'Chitin Shell Pauldron'}}}))}>T5 zırh</button>
      <button onClick={()=>setPlayer(p=>({...p,equipped:{...p.equipped,head:null,chest:null}}))}>Zırhı çıkar</button>
      <span>Kayıtsız görsel test · Açılan panel: {panel}</span>
    </div>
  </>;
}
createRoot(document.getElementById('root')).render(<Check/>);
