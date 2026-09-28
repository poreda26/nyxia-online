import React from 'react';
import {createRoot} from 'react-dom/client';
import {LanguageProvider} from '../src/i18n/LanguageContext';
import GlobalStyle from '../src/components/GlobalStyle';
import ClanDungeonPanel from '../src/components/ClanDungeonPanel';
import {initialPlayer} from '../src/utils/player';
import {CLASSES} from '../src/data/classes';
createRoot(document.getElementById('root')).render(<LanguageProvider><GlobalStyle/><main style={{maxWidth:430,margin:'auto',padding:12}}><ClanDungeonPanel player={initialPlayer('warrior','elmorad','Test')} setPlayer={()=>{}} cls={CLASSES.warrior} atk={40} def={20} pushToast={()=>{}}/></main></LanguageProvider>);
