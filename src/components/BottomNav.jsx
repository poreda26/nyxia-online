import {useEffect,useRef} from 'react';
import {useTranslation} from '../i18n/LanguageContext';
import MenuEmblem from './icons/MenuEmblem';
import './GameChrome.css';
const TABS=['battle','inventory','market','upgrade','captain','clan','warzone','chat','character'];
export default function BottomNav({tab,setTab,notifications={}}){
 const {t}=useTranslation(),rail=useRef(null);
 useEffect(()=>{const active=rail.current?.querySelector('[aria-current="page"]');if(!active)return;const parent=rail.current;const left=active.offsetLeft-(parent.clientWidth-active.offsetWidth)/2;parent.scrollTo({left,behavior:(document.documentElement.dataset.motion==='reduced'||window.matchMedia('(prefers-reduced-motion: reduce)').matches)?'instant':'smooth'});},[tab]);
 return <nav className="fantasy-dock">
  <div className="dock-rail" ref={rail}>
   {TABS.map(key=><button type="button" key={key} className={`dock-button ${tab===key?'is-active':''}`} aria-current={tab===key?'page':undefined} onClick={()=>setTab(key)}>
    <span className="dock-medallion"><MenuEmblem name={key}/>{notifications[key]&&<i className="dock-notification"/>}</span>
    <span className="dock-label">{t(`nav.${key}`)}</span>
   </button>)}
  </div>
  <div className="dock-gems" aria-hidden="true">{TABS.map(key=><i key={key} className={tab===key?'is-active':''}/>)}</div>
 </nav>;
}
