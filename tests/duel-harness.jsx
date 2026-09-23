import React from 'react';
import {createRoot} from 'react-dom/client';
import Global from '../src/components/GlobalStyle';
import {LanguageProvider} from '../src/i18n/LanguageContext';
import Practice from '../src/components/PracticeDuel';
import Icon from '../src/components/ItemIcon';
import {ACCESSORY_SETS} from '../src/data/accessories';
import {fixture} from './balance-fixtures';
const h=React.createElement,root=createRoot(document.querySelector('#root'));
window.show=(cls='warrior')=>{window.p=fixture(cls,50,4);window.before=JSON.stringify(p);root.render(h(LanguageProvider,{lang:'tr',setLang:()=>{}},h(Global),h(Practice,{player:p,key:cls})));};
window.art=()=>root.render(h(LanguageProvider,{lang:'tr',setLang:()=>{}},h(Global),h('div',{style:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,padding:12}},ACCESSORY_SETS.ring.filter(i=>i.tier>=5).map(i=>h('div',{key:i.name,style:{fontSize:10,color:'#eee'}},h(Icon,{item:{...i,kind:'accessory'},size:65}),i.name)))));
show();
import Warzone from '../src/components/WarzoneTab';
function Zone(){const [player,setPlayer]=React.useState(()=>({...fixture('warrior',60,5),gold:1000}));window.zonePlayer=player;return h(LanguageProvider,{lang:'tr',setLang:()=>{}},h(Global),h('div',{style:{height:'100dvh',color:'var(--text-primary)'}},h(Warzone,{player,setPlayer,pushToast:()=>{}})));}
window.zone=()=>root.render(h(Zone));
