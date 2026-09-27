import React from 'react';
import {createRoot} from 'react-dom/client';
import Global from '../src/components/GlobalStyle';
import Hub from '../src/components/Hub';
import Ticker from '../src/components/NoticeTicker';
import {LanguageProvider} from '../src/i18n/LanguageContext';
import {initialPlayer} from '../src/utils/player';
import {styles} from '../src/styles';
import Settings from '../src/components/SettingsModal';
import {loadSettings,saveSetting,applyDisplaySettings} from '../src/utils/settings';
import {makeScrollStack,makeBonusScrollStack,makeAccessoryScrollStack} from '../src/utils/inventory';
import {makeBoostScrollStack} from '../src/utils/boosts';
import ItemIcon from '../src/components/ItemIcon';
  const h=React.createElement,root=createRoot(document.querySelector('#root'));
  function App(){
   const [prefs,setPrefs]=React.useState(loadSettings),[open,setOpen]=React.useState(false),[gallery,setGallery]=React.useState(false);
   React.useEffect(()=>applyDisplaySettings(prefs),[prefs]);
   const update=(k,v)=>{saveSetting(k,v);setPrefs(p=>({...p,[k]:v}));if(k==='language')setLang(v);};
   window.openSettings=()=>setOpen(true);window.closeSettings=()=>setOpen(false);window.showAssets=()=>setGallery(true);window.readPrefs=loadSettings;
   const settings=open?h(Settings,{preferences:prefs,onPreferenceChange:update,musicVolume:prefs.musicVolume,musicMuted:prefs.musicMuted,onMusicVolumeChange:v=>update('musicVolume',v),onToggleMusicMute:()=>update('musicMuted',!prefs.musicMuted),sfxVolume:prefs.sfxVolume,sfxMuted:prefs.sfxMuted,onSfxVolumeChange:v=>update('sfxVolume',v),onToggleSfxMute:()=>update('sfxMuted',!prefs.sfxMuted),lang:prefs.language,onLangChange:v=>update('language',v),theme:prefs.theme,onThemeChange:v=>update('theme',v),onClose:()=>setOpen(false)}):null;
   const [player,setPlayer]=React.useState({...initialPlayer('warrior','human','Nyxia'),level:65,diamonds:1000,tutorialSeen:true,firstPurchaseBonusClaimed:true,dailyLogin:{streak:1,lastClaimDay:new Date().toDateString()}});
   const [tab,setTab]=React.useState('captain'),[bank,setBank]=React.useState([]),[gold,setGold]=React.useState(0),[notice,setNotice]=React.useState(null),[lang,setLang]=React.useState('tr');
   window.currentPlayer=player;window.updatePlayer=setPlayer;window.setNotice=setNotice;window.setLang=setLang;window.setTab=setTab;
   return h(LanguageProvider,{lang,setLang},h(Global),settings,gallery?h('div',{style:{background:'#141923',color:'#fff',padding:16,display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}},...['exp','gold','atk','np','def','hp'].map(id=>h('div',{key:id},h(ItemIcon,{item:{kind:'boostScroll',boostId:id},size:70}),id)),...Array.from({length:6},(_,i)=>h('div',{key:'s'+i},h(ItemIcon,{item:{kind:'scroll',tier:i+1},size:70}),'T'+(i+1))),h(ItemIcon,{item:{kind:'bonusScroll'},size:70}),h(ItemIcon,{item:{kind:'accessoryScroll'},size:70}),...[1,3,5,6].map(tier=>h(ItemIcon,{key:'c'+tier,item:{kind:'chest',tier},size:70})),h(ItemIcon,{item:{kind:'chest',special:true,tier:6},size:70})):h('div',{style:styles.appRoot},notice?h('button',{className:'game-notice',style:{display:'flex',gap:8,padding:12,width:'100%',marginTop:20}},h(Ticker,null,notice),h('span',null,'02:59')):h(Hub,{player,setPlayer,tab,setTab,bank,setBank,bankGold:gold,setBankGold:setGold,username:'VisualQA',pushToast:()=>{},onChangeCharacter:()=>{},onChangeRace:()=>{},onOpenSettings:()=>setOpen(true),unlockedSlots:3,onUnlockSlot:()=>{}})));
  }
  root.render(h(App));
