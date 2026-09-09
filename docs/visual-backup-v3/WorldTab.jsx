import { useEffect, useRef, useState } from 'react';
import { Sword, Crosshair, Pause, Play, Package, Shield, ArrowLeft, Maximize2, X, RotateCcw, MapPin } from 'lucide-react';
import { WORLD, CAMP, NPCS, createWorld, stepWorld, command, respawn, inCamp, inCombat, distance, attackRange } from '../world/engine';
import { drawWorld, cameraFor } from '../world/renderer';
import { playerMaxHp, playerMaxMp, xpToNext, MAX_LEVEL } from '../utils/player';
import { getSkill, classSkills, learnFreeSkills } from '../utils/skills';
import { MONSTER_QUESTS } from '../data/quests';
import { itemImageFor, potionImageFor } from '../data/itemImages';
import archerUrl from '../assets/world/archer-animations.png';
import animationsUrl from '../assets/world/hero-animations.png';
import terrainUrl from '../assets/world/fallow-valley.png';
import atlasUrl from '../assets/world/actors.png';
import '../world/world.css';

const blankInput = () => ({ x:0,y:0 });
const loadImage = (url) => new Promise((resolve,reject)=>{ const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=url; });
function Meter({value,max,kind,label}) {
  return <div className={`world-meter ${kind}`} aria-label={`${label}: ${Math.round(value)} / ${max}`}><span style={{width:`${Math.max(0,Math.min(100,value/max*100))}%`}}/><b>{Math.round(value)} / {max}</b></div>;
}
export default function WorldTab({ player,setPlayer,setTab,sessionRef,suspended=false }) {
  const canvasRef=useRef(null),rootRef=useRef(null),input=useRef(blankInput()),keys=useRef(new Set()),joystick=useRef(null);
  const worldRef=useRef(null);
  if(!worldRef.current) { if(!sessionRef.current) sessionRef.current=createWorld();worldRef.current=sessionRef.current; }
  const world=worldRef.current;
  const live=useRef({player,setPlayer,suspended});live.current={player,setPlayer,suspended};
  const [pulse,setPulse]=useState(0),[ready,setReady]=useState(false),[error,setError]=useState(false),[paused,setPaused]=useState(false),[hint,setHint]=useState(null),[stick,setStick]=useState({x:0,y:0});
  const [reload,setReload]=useState(0);
  const art=useRef({}); const noticeUntil=useRef(0);
  const skills=(player.skills.loadout.some(Boolean)?player.skills.loadout:classSkills(player.class).filter(s=>player.skills.known.includes(s.id)).map(s=>s.id)).slice(0,5);
  const controls=useRef({});
  const notify=(text)=>{setHint(text);noticeUntil.current=performance.now()+4500;};
  const commit=(result)=>{
    if(result.player!==live.current.player) {live.current.player=result.player;live.current.setPlayer(result.player);}
    if(result.events.length) notify(result.events.map(e=>e.text).join(' · '));
  };
  const act=(action)=>{if(!ready||suspended)return;commit(command(world,live.current.player,action));setPulse(p=>p+1);};
  const resetInput=()=>{keys.current.clear();input.current=blankInput();joystick.current=null;setStick({x:0,y:0});};
  const togglePause=()=>{resetInput();setPaused(p=>!p);};
  const openPanel=(tab)=>{
    if(inCombat(world)) {notify('Önce yaratıklardan uzaklaş veya güvenli kampa dön.');return;}
    resetInput();setTab(tab);
  };
  const nearestNpc=NPCS.find(n=>distance(world.actor,n)<105);
  const interact=()=>{const npc=NPCS.find(n=>distance(world.actor,n)<105);if(npc)openPanel(npc.tab);};
  controls.current={act,togglePause,interact,skills,resetInput};
  useEffect(()=>{setPlayer(p=>learnFreeSkills(p));},[setPlayer]);
  useEffect(()=>{
    let cancelled=false;setReady(false);setError(false);
    Promise.all([loadImage(terrainUrl),loadImage(atlasUrl),loadImage(animationsUrl),loadImage(archerUrl)]).then(([terrain,atlas,animations,archer])=>{if(!cancelled){art.current={...art.current,terrain,atlas,animations,archer};setReady(true);}}).catch(()=>{if(!cancelled)setError(true);});
    return()=>{cancelled=true;};
  },[reload]);
  const AttackIcon=player.class==='rogue'?Crosshair:Sword;
  const weapon=player.equipped.mainHand;
  const weaponUrl=weapon?itemImageFor(weapon.name,weapon.upgradeLevel||0):null;
  useEffect(()=>{
    let cancelled=false;art.current.weapon=null;
    if(weaponUrl)loadImage(weaponUrl).then(img=>{if(!cancelled)art.current.weapon=img;}).catch(()=>{});
    return()=>{cancelled=true;};
  },[weaponUrl]);
  useEffect(()=>{world.paused=paused||suspended||!ready;resetInput();},[paused,suspended,ready]);
  useEffect(()=>{
    const keyDown=(e)=>{
      if(e.target instanceof HTMLElement && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
      const key=e.key.toLowerCase();
      if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' ','tab','1','2','3','4','5','q','e','f','escape'].includes(key))e.preventDefault();
      keys.current.add(key);
      if(e.repeat)return;
      const c=controls.current;
      if(key===' ')c.act({type:'attack'});
      if(key==='tab')c.act({type:'target'});
      if(key==='q'||key==='e')c.act({type:'potion',kind:key==='q'?'hp':'mp'});
      if(/^[1-5]$/.test(key) && c.skills[Number(key)-1])c.act({type:'skill',id:c.skills[Number(key)-1]});
      if(key==='f')c.interact();if(key==='escape')c.togglePause();
    };
    const keyUp=e=>keys.current.delete(e.key.toLowerCase());
    const suspend=()=>{controls.current.resetInput();world.paused=true;setPaused(true);};
    const visibility=()=>{if(document.hidden)suspend();};
    window.addEventListener('keydown',keyDown);window.addEventListener('keyup',keyUp);window.addEventListener('blur',suspend);document.addEventListener('visibilitychange',visibility);
    return()=>{window.removeEventListener('keydown',keyDown);window.removeEventListener('keyup',keyUp);window.removeEventListener('blur',suspend);document.removeEventListener('visibilitychange',visibility);controls.current.resetInput();};
  },[]);
  useEffect(()=>{
    if(!ready)return;
    const canvas=canvasRef.current,ctx=canvas.getContext('2d');
    if(!ctx){setError(true);return;}
    let width=0,height=0,frame,last=0,lastUi=0;
    const resize=()=>{const r=canvas.getBoundingClientRect();width=r.width;height=r.height;const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);};
    const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
    const tick=(now)=>{
      const dt=last?(now-last)/1000:0;last=now;
      const k=keys.current;
      const dx=input.current.x+(k.has('d')||k.has('arrowright')?1:0)-(k.has('a')||k.has('arrowleft')?1:0);
      const dy=input.current.y+(k.has('s')||k.has('arrowdown')?1:0)-(k.has('w')||k.has('arrowup')?1:0);
      if(!live.current.suspended && !document.hidden)commit(stepWorld(world,live.current.player,{x:dx,y:dy},dt));
      drawWorld(ctx,width,height,world,live.current.player,art.current);
      if(now-lastUi>100){setPulse(p=>p+1);lastUi=now;if(now>noticeUntil.current)setHint(null);}
      frame=requestAnimationFrame(tick);
    };
    frame=requestAnimationFrame(tick);
    return()=>{cancelAnimationFrame(frame);observer.disconnect();};
  },[ready]);
  const moveStick=(e)=>{
    if(joystick.current!==e.pointerId)return;
    const r=e.currentTarget.getBoundingClientRect();let x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;
    const mag=Math.hypot(x,y),limit=r.width*.32;if(mag>limit){x=x/mag*limit;y=y/mag*limit;}
    setStick({x,y});input.current={x:x/limit,y:y/limit};
  };
  const releaseStick=(e)=>{if(joystick.current!==e.pointerId)return;joystick.current=null;input.current=blankInput();setStick({x:0,y:0});};
  const selectAt=(e)=>{
    if(world.paused||world.death)return;
    const r=e.currentTarget.getBoundingClientRect(),cam=cameraFor(r.width,r.height,world.actor);
    const point={x:(e.clientX-r.left)/cam.zoom+cam.x,y:(e.clientY-r.top)/cam.zoom+cam.y+35};
    const m=world.monsters.filter(m=>m.hp>0).sort((a,b)=>distance(a,point)-distance(b,point))[0];
    if(m&&distance(m,point)<75){world.target=m.id;setPulse(p=>p+1);}
  };
  const target=world.monsters.find(m=>m.id===world.target&&m.hp>0);
  const quest=MONSTER_QUESTS.find(q=>q.monsterId===(target?.template.id||'sis_kurdu'));
  const fullScreen=async()=>{try{if(!document.fullscreenElement)await rootRef.current.requestFullscreen?.();else await document.exitFullscreen?.();}catch{notify('Bu tarayıcıda tam ekran açılamadı. Yatay ekranı kullanabilirsin.');}};
  const potionCount=kind=>player.inventory.filter(i=>i.kind==='potion'&&i.potionType===kind).reduce((s,i)=>s+i.count,0);
  return <section className="world-root" ref={rootRef} aria-label="Fallow Valley oyun alanı">
    <canvas ref={canvasRef} className="world-canvas" onPointerDown={selectAt} aria-label="Harita. WASD veya ok tuşlarıyla hareket et. Boşluk ile saldır, Tab ile hedef seç."/>
    <div className="world-vignette"/>
    <header className="world-header">
      <div className="world-player world-panel"><div className="world-avatar"><Shield size={25}/><span>{player.level}</span></div><div className="world-vitals"><strong>{player.nickname}</strong><Meter value={player.hp} max={playerMaxHp(player)} kind="hp" label="Can"/><Meter value={player.mp} max={playerMaxMp(player)} kind="mp" label="Mana"/></div></div>
      <div className="world-location"><span>NYXIA ONLINE</span><h1>Fallow Valley</h1><small>{inCamp(world)?'Güvenli bölge':'Av sahası'} · Sv. 1–15</small></div>
      <div className="world-top-actions"><button onClick={()=>openPanel('inventory')} aria-label="Envanter"><Package size={22}/>{player.hasNewItemNotice&&<i/>}</button><button onClick={fullScreen} aria-label="Tam ekran"><Maximize2 size={20}/></button><button onClick={togglePause} aria-label="Duraklat"><Pause size={21}/></button></div>
    </header>
    <aside className="world-quest world-panel"><span>AVCI GÖREVİ</span><strong>{quest?.name}</strong><div>{target?.template.name||'Sis Kurdu'} <b>{Math.min(player.monsterKills[quest?.monsterId]||0,quest?.target||50)} / {quest?.target||50}</b></div><small>Ödülünü kamptaki Kaptan'dan al.</small></aside>
    <div className="world-minimap world-panel" aria-label="Mini harita"><img src={terrainUrl} alt=""/>{world.monsters.filter(m=>m.hp>0).map(m=><i key={m.id} className="enemy" style={{left:`${m.x/WORLD.width*100}%`,top:`${m.y/WORLD.height*100}%`}}/>)}<i className="camp" style={{left:`${CAMP.x/WORLD.width*100}%`,top:`${CAMP.y/WORLD.height*100}%`}}/><i className="self" style={{left:`${world.actor.x/WORLD.width*100}%`,top:`${world.actor.y/WORLD.height*100}%`}}/><span><MapPin size={12}/> Fallow Valley</span></div>
    {target&&<div className="world-target world-panel"><strong>{target.template.name}</strong><Meter value={target.hp} max={target.template.hp} kind="enemy" label="Hedef canı"/><small>{target.state==='return'?'Yuvasına dönüyor':distance(world.actor,target)<=attackRange(player)?'Saldırı menzilinde':'Hedefe yaklaş'}</small></div>}
    <div className="world-message" role="status">{hint||(!target&&'Kamptan doğuya ilerle. Bir yaratığa dokunarak hedef seç.')}</div>
    {nearestNpc&&!paused&&<button className="world-interact" onClick={interact}>{nearestNpc.name} ile konuş <kbd>F</kbd></button>}
    <div className="world-controls">
      <div className="world-movement"><div className="world-stick" role="group" aria-label="Hareket joystick'i" onPointerDown={e=>{if(joystick.current!==null)return;joystick.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);moveStick(e);}} onPointerMove={moveStick} onPointerUp={releaseStick} onPointerCancel={releaseStick} onLostPointerCapture={releaseStick}><span className="world-stick-ring"/><span className="world-stick-knob" style={{transform:`translate(${stick.x}px,${stick.y}px)`}}/></div><small>W A S D / OK TUŞLARI</small></div>
      <div className="world-skillbar">{skills.map((id,i)=>{const s=getSkill(player.class,id);const wait=Math.max(0,(world.skillAt[id]||0)-world.time);return s&&<button key={id} className="world-skill" disabled={wait>0||player.mp<s.mpCost||paused} onClick={()=>act({type:'skill',id})} title={`${s.name} · ${s.mpCost} mana`}><kbd>{i+1}</kbd><AttackIcon size={24}/><span>{wait>0?`${Math.ceil(wait)} sn`:s.name}</span></button>;})}<div className="world-potions">{['hp','mp'].map((kind,i)=><button key={kind} disabled={world.time<world.potionAt||paused} onClick={()=>act({type:'potion',kind})} aria-label={kind==='hp'?'Can iksiri kullan':'Mana iksiri kullan'}><img src={potionImageFor(kind,1)} alt=""/><span>{potionCount(kind)}</span><kbd>{i?'E':'Q'}</kbd></button>)}</div></div>
      <div className="world-combat"><button className="world-target-btn" onClick={()=>act({type:'target'})} aria-label="Hedef değiştir"><Crosshair size={23}/><small>Hedef</small></button><button className="world-attack" disabled={world.time<world.attackAt||paused} onClick={()=>act({type:'attack'})}><AttackIcon size={34}/><span>{player.class==='rogue'?'OK AT':'SALDIR'}</span></button></div>
    </div>
    <footer className="world-footer"><span>◆ {player.gold.toLocaleString('tr-TR')} altın</span><div><i style={{width:`${player.level>=MAX_LEVEL?100:Math.min(100,player.xp/xpToNext(player.level)*100)}%`}}/></div><span>Sv. {player.level} · {player.level>=MAX_LEVEL?'MAX':`${player.xp} / ${xpToNext(player.level)} XP`}</span></footer>
    {(!ready||error)&&<div className="world-overlay"><div className="world-dialog"><h2>{error?'Harita yüklenemedi':'Vadi hazırlanıyor…'}</h2><p>{error?'Bağlantını kontrol edip yeniden deneyebilirsin.':'Karakterler ve harita yükleniyor.'}</p>{error&&<button onClick={()=>setReload(n=>n+1)}><RotateCcw size={18}/> Yeniden dene</button>}<button onClick={()=>setTab('battle')}>Savaş menüsüne dön</button></div></div>}
    {paused&&!world.death&&ready&&<div className="world-overlay"><div className="world-dialog"><button className="world-close" onClick={togglePause} aria-label="Devam et"><X/></button><span>NYXIA ONLINE</span><h2>Mola zamanı</h2><p>Harita duraklatıldı.</p><button className="primary" onClick={togglePause}><Play size={18}/> Maceraya devam et</button><button onClick={()=>openPanel('inventory')}><Package size={18}/> Envanter</button><button onClick={()=>openPanel('character')}><Shield size={18}/> Karakter ve beceriler</button><button onClick={()=>openPanel('battle')}><ArrowLeft size={18}/> Diğer bölgeler ve menüler</button><small>Hareket: WASD · Saldırı: Boşluk · Hedef: Tab<br/>Beceri: 1–5 · İksir: Q / E · Konuş: F</small><small>Bu harita şu an tek oyunculu. İlerlemen bu cihazda kaydedilir.</small></div></div>}
    {world.death&&<div className="world-overlay"><div className="world-dialog"><span>FALLOW VALLEY</span><h2>Savaş burada bitmedi.</h2><p>Yenildin. {world.death.xpLost} XP kaybettin.</p><button className="primary" onClick={()=>{respawn(world);setPaused(false);setPulse(p=>p+1);}}><RotateCcw size={18}/> Kampta yeniden doğ</button></div></div>}
  </section>;
}
