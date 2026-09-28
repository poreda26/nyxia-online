import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {LanguageProvider} from '../src/i18n/LanguageContext';
import GlobalStyle from '../src/components/GlobalStyle';
import InventoryTab from '../src/components/InventoryTab';
import {initialPlayer} from '../src/utils/player';
import {gmBuildWeaponById,gmWeaponTemplates} from '../src/utils/loot';
function Test(){
 const [player,setPlayer]=useState(()=>({...initialPlayer('warrior','elmorad','Test'),inventory:Array.from({length:32},(_,i)=>({...gmBuildWeaponById('mage',gmWeaponTemplates('mage')[0].id,1),id:`test-${i}`,weight:.1})),chests:[{id:'a',tier:1},{id:'b',tier:2}]}));
 window.testPlayer=player;window.freeSlot=()=>setPlayer(p=>({...p,inventory:p.inventory.slice(1)}));window.messages||=[];
 return <LanguageProvider><GlobalStyle/><main style={{maxWidth:430,margin:'auto',padding:12}}><InventoryTab player={player} setPlayer={setPlayer} bank={[[]]} setBank={()=>{}} bankGold={0} setBankGold={()=>{}} pushToast={text=>window.messages.push(text)}/></main></LanguageProvider>;
}createRoot(document.getElementById('root')).render(<Test/>);
