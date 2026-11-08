import React,{useCallback,useEffect,useRef,useState} from 'react';
import {ask} from './dialog';
// Canlı sohbet denetimi: 3 sn'de bir yeni mesajları çeker, her mesajdan tek tıkla sustur / sil / ban uygular.
// Ceza uçları mevcut /api/admin/account/mute, /account/block ve /chat/remove uçlarıdır (hepsi işlem geçmişine yazılır).
const REASONS=[['abuse','Hakaret / küfür'],['spam','Spam / reklam'],['harass','Taciz'],['other','Kural ihlali']];
const MUTES=[[10/60,'10 dk'],[1,'1 saat'],[24,'24 saat'],[0,'Kalıcı']];
const LINK=/(https?:\/\/|www\.|discord\.gg|t\.me\/|\.(com|net|org|gg|io)\b)/i;
const MAX_ROWS=300,POLL_MS=3000;
const time=n=>new Date(n).toLocaleTimeString('tr-TR');
const nick=author=>String(author).split(' · ')[0];
export default function ChatLive({api,role}){
 const [rows,setRows]=useState([]),[live,setLive]=useState(true),[reason,setReason]=useState('abuse'),[open,setOpen]=useState(null),[filter,setFilter]=useState(''),[fresh,setFresh]=useState(()=>new Set()),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 const lastId=useRef(0),inflight=useRef(false);
 const poll=useCallback(async()=>{
  if(inflight.current)return;inflight.current=true;
  try{
   const first=lastId.current===0;
   const data=await api('admin/chat?after='+lastId.current);
   setError('');
   if(!data.length)return;
   lastId.current=Math.max(lastId.current,data[0].id);
   setFresh(first?new Set():new Set(data.map(m=>m.id)));
   setRows(old=>[...data,...old].slice(0,MAX_ROWS));
  }catch(e){setError(e.message);}finally{inflight.current=false;}
 },[api]);
 useEffect(()=>{
  poll();
  if(!live)return undefined;
  const timer=setInterval(()=>{if(document.visibilityState==='visible')poll();},POLL_MS);
  return()=>clearInterval(timer);
 },[live,poll]);
 const reasonText=()=>'Sohbet kuralı: '+REASONS.find(r=>r[0]===reason)[1];
 async function act(fn,done){setBusy(true);setError('');setNotice('');try{await fn();setNotice(done);setOpen(null);}catch(e){setError(e.message);}finally{setBusy(false);}}
 const setStatus=(account,patch)=>setRows(r=>r.map(x=>x.account===account?{...x,...patch}:x));
 const mute=(m,hours,label,remove)=>act(async()=>{
  const why=reasonText();
  await api('admin/account/mute',{id:m.account,muted:true,hours,reason:why});
  setStatus(m.account,{muted:true});
  if(remove){await api('admin/chat/remove',{id:m.id,reason:why});setRows(r=>r.filter(x=>x.id!==m.id));}
 },`${nick(m.author)} susturuldu (${label})${remove?' ve mesajı silindi':''}.`);
 const unmute=m=>act(async()=>{await api('admin/account/mute',{id:m.account,muted:false,reason:'Susturma kaldırıldı'});setStatus(m.account,{muted:false});},`${nick(m.author)} susturması kaldırıldı.`);
 const removeOnly=m=>act(async()=>{await api('admin/chat/remove',{id:m.id,reason:reasonText()});setRows(r=>r.filter(x=>x.id!==m.id));},'Mesaj silindi.');
 async function ban(m,hours,label){
  const why=await ask({title:`${nick(m.author)} engellensin mi?`,text:`${label} boyunca giriş yapamaz ve tüm oturumları kapanır.`,confirmLabel:'Engelle',tone:'danger',input:{label:'Gerekçe',defaultValue:reasonText()}});
  if(!why)return;
  await act(async()=>{await api('admin/account/block',{id:m.account,blocked:true,hours,reason:why});setStatus(m.account,{banned:true,muted:true});},`${nick(m.author)} engellendi (${label}).`);
 }
 const needle=filter.trim().toLowerCase();
 const shown=needle?rows.filter(m=>m.author.toLowerCase().includes(needle)||m.text.toLowerCase().includes(needle)):rows;
 return <section className="card chat-live">
  <div className="live-bar">
   <button className={live?'primary':''} onClick={()=>setLive(v=>!v)}><span className={'live-dot'+(live?' on':'')}/>{live?'Canlı: açık':'Duraklatıldı'}</button>
   <input aria-label="Sohbette ara" placeholder="Oyuncu adı ya da kelime ara…" value={filter} onChange={e=>setFilter(e.target.value)}/>
   <small>{shown.length} mesaj · 3 sn'de bir yenilenir</small>
  </div>
  <div className="live-bar" role="radiogroup" aria-label="Ceza gerekçesi"><small>Gerekçe:</small>{REASONS.map(([id,label])=><button key={id} role="radio" aria-checked={reason===id} className={'chip'+(reason===id?' on':'')} onClick={()=>setReason(id)}>{label}</button>)}</div>
  {error&&<div role="alert" className="error">{error}</div>}
  {notice&&<div role="status" className="success">{notice}</div>}
  <p className="muted">Yalnızca genel sohbet görünür; özel mesajlar bu panelde listelenmez. Mute sunucuda anında işler: oyuncunun bir sonraki mesajı reddedilir. Ban oturumları da kapatır.</p>
  {!shown.length&&<p className="empty muted">Henüz mesaj yok.</p>}
  {shown.map(m=><div className={'message'+(fresh.has(m.id)?' fresh':'')} key={m.id}>
   <div>
    <strong>{m.author}</strong>{m.gm?<span className="tag">GM</span>:null}{m.banned?<span className="tag bad">Engelli</span>:m.muted?<span className="tag bad">Susturulmuş</span>:null}{LINK.test(m.text)?<span className="tag warn">Bağlantı</span>:null}
    <small>{time(m.created_at)}{m.account?' · hesap #'+m.account:''}</small>
    <p>{m.text}</p>
    {open===m.id&&<div className="live-actions">
     {MUTES.map(([hours,label])=><button key={label} disabled={busy} onClick={()=>mute(m,hours,label,false)}>Sustur {label}</button>)}
     <button disabled={busy} onClick={()=>mute(m,1,'1 saat',true)}>Sil + 1 saat sustur</button>
     <button disabled={busy} onClick={()=>removeOnly(m)}>Sadece sil</button>
     {m.muted&&<button disabled={busy} onClick={()=>unmute(m)}>Susturmayı kaldır</button>}
     {role==='owner'&&<><button className="danger" disabled={busy} onClick={()=>ban(m,24,'24 saat')}>Ban 24 saat</button><button className="danger" disabled={busy} onClick={()=>ban(m,0,'kalıcı')}>Ban kalıcı</button></>}
    </div>}
   </div>
   {m.account&&!m.gm?<button disabled={busy} aria-expanded={open===m.id} onClick={()=>setOpen(open===m.id?null:m.id)}>{open===m.id?'Kapat':'Ceza ver'}</button>:<button disabled={busy} onClick={()=>removeOnly(m)}>Sil</button>}
  </div>)}
 </section>;
}
