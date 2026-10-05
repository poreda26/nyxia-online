import {createPortal} from 'react-dom';
import {useEffect,useRef} from 'react';
import {ArrowLeft} from './icons/GameIcons';
import './EncounterScreen.css';
export default function EncounterScreen({title,onLeave,busy=false,children}){
 const root=useRef(null);
 useEffect(()=>{const previous=document.activeElement,overflow=document.body.style.overflow;document.body.style.overflow='hidden';root.current?.focus();return ()=>{document.body.style.overflow=overflow;previous?.focus?.();};},[]);
 return createPortal(<section ref={root} tabIndex={-1} className="encounter-screen" role="dialog" aria-modal="true" aria-label={title} onKeyDown={e=>{if(e.key==='Escape'&&!busy)onLeave();if(e.key==='Tab'){const items=[...root.current.querySelectorAll('button:not(:disabled),input:not(:disabled),[tabindex="0"]')];if(!items.length)return;const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}}><div className="encounter-screen-inner"><header><button disabled={busy} onClick={onLeave} aria-label="Savaştan ayrıl"><ArrowLeft size={19}/></button><strong>{title}</strong><span>VS</span></header>{children}</div></section>,document.body);
}
