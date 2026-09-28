import React,{useState} from 'react';
import {fixture} from './balance-fixtures';
import {totalStats,playerDef} from '../src/utils/player';
import {createRoot} from 'react-dom/client';
import {LanguageProvider} from '../src/i18n/LanguageContext';
import GlobalStyle from '../src/components/GlobalStyle';
import ClanDungeonPanel from '../src/components/ClanDungeonPanel';
import {initialPlayer} from '../src/utils/player';
import {CLASSES} from '../src/data/classes';
function Test(){const [player,setPlayer]=useState(()=>fixture(window.dungeonTestClass||'mage',65,6,8));window.testPlayer=player;return <LanguageProvider><GlobalStyle/><main style={{maxWidth:430,margin:'auto',padding:12}}><ClanDungeonPanel player={player} setPlayer={setPlayer} cls={CLASSES[player.class]} atk={totalStats(player).atk} def={playerDef(player)} pushToast={()=>{}}/></main></LanguageProvider>}
createRoot(document.getElementById('root')).render(<Test/>);
