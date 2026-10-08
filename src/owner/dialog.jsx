import React,{useEffect,useRef,useState} from 'react';
// Panel içi onay/giriş penceresi (tarayıcının confirm/prompt kutuları yerine).
// ask({title,text,confirmLabel,tone:'danger',input:true|{label,defaultValue}}) → onay: true (ya da yazılan metin), vazgeç: null/false.
export function ask(options){
 return new Promise(resolve=>window.dispatchEvent(new CustomEvent('owner:ask',{detail:{...options,resolve}})));
}
export function DialogHost(){
 const [queue,setQueue]=useState([]),[value,setValue]=useState(''),field=useRef(null);
 useEffect(()=>{const on=e=>setQueue(q=>[...q,e.detail]);window.addEventListener('owner:ask',on);return()=>window.removeEventListener('owner:ask',on);},[]);
 const current=queue[0];
 useEffect(()=>{if(current){setValue(current.input?.defaultValue||'');setTimeout(()=>field.current?.focus(),30);}},[current]);
 if(!current)return null;
 const wantsInput=!!current.input;
 const close=result=>{current.resolve(result);setQueue(q=>q.slice(1));};
 const submit=()=>{if(wantsInput){const text=value.trim();if(text.length>=(current.input.min??3))close(text);}else close(true);};
 return <div className="dialog-backdrop" role="presentation" onClick={()=>close(wantsInput?null:false)}>
  <div className="dialog-card" role="alertdialog" aria-modal="true" aria-label={current.title} onClick={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key==='Escape')close(wantsInput?null:false);if(e.key==='Enter'&&wantsInput&&!e.shiftKey)submit();}}>
   <h3>{current.title}</h3>
   {current.text&&<p>{current.text}</p>}
   {wantsInput&&<label>{current.input.label||'Gerekçe'}<input ref={field} value={value} onChange={e=>setValue(e.target.value)} placeholder={current.input.placeholder||''}/></label>}
   <div className="dialog-actions">
    <button onClick={()=>close(wantsInput?null:false)}>Vazgeç</button>
    <button className={current.tone==='danger'?'danger':'primary'} disabled={wantsInput&&value.trim().length<(current.input.min??3)} onClick={submit}>{current.confirmLabel||(wantsInput?'Kaydet':'Onayla')}</button>
   </div>
  </div>
 </div>;
}
