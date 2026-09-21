import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.NYXIA_PLAYWRIGHT||'C:/Users/akcel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:360,height:740}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/chrome-harness.html',r=>r.fulfill({contentType:'text/html',body:'<html><body><div id="root"></div></body></html>'}));
 await page.goto('http://127.0.0.1:5177/nyxia-online/chrome-harness.html');
 await page.evaluate(async()=>{
  const refresh=await import('/nyxia-online/@react-refresh');refresh.default.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>t=>t;window.__vite_plugin_react_preamble_installed__=true;
  const React=(await import('/nyxia-online/node_modules/.vite/deps/react.js')).default;
  const {createRoot}=(await import('/nyxia-online/node_modules/.vite/deps/react-dom_client.js')).default;
  const {default:Global}=await import('/nyxia-online/src/components/GlobalStyle.jsx');
  const {default:Hub}=await import('/nyxia-online/src/components/Hub.jsx');
  const {default:Portrait}=await import('/nyxia-online/src/components/MonsterPortrait.jsx');
  const {MAPS}=await import('/nyxia-online/src/data/maps.js');
  const {monsterFaceRects,monsterAtlases,monsterPortraitFor}=await import('/nyxia-online/src/data/monsterPortraits.js');
  for(const map of MAPS)for(const monster of [...map.monsters,{id:`map_boss_${map.id}`,isBoss:true}]){const art=monsterPortraitFor(monster);if(!art?.face||!art.source)throw Error('Missing portrait: '+monster.id);}
  const {default:Ticker}=await import('/nyxia-online/src/components/NoticeTicker.jsx');
  const {LanguageProvider}=await import('/nyxia-online/src/i18n/LanguageContext.jsx');
  const {initialPlayer}=await import('/nyxia-online/src/utils/player.js');
  const {styles}=await import('/nyxia-online/src/styles.js');
  const h=React.createElement,root=createRoot(document.querySelector('#root'));
  function App(){
   const [player,setPlayer]=React.useState({...initialPlayer('warrior','human','Nyxia'),level:65,currentMapId:'crimson_battlefront',tutorialSeen:true,firstPurchaseBonusClaimed:true,dailyLogin:{streak:1,lastClaimDay:new Date().toDateString()}});
   const [tab,setTab]=React.useState('battle'),[bank,setBank]=React.useState([]),[gold,setGold]=React.useState(0),[notice,setNotice]=React.useState(null),[lang,setLang]=React.useState('tr');
   window.setNotice=setNotice;window.setLang=setLang;window.setTab=setTab;
   return h(LanguageProvider,{lang,setLang},h(Global),h('div',{style:styles.appRoot},notice?h('button',{className:'game-notice',style:{display:'flex',gap:8,padding:12,width:'100%',marginTop:20}},h(Ticker,null,notice),h('span',null,'02:59')):h(Hub,{player,setPlayer,tab,setTab,bank,setBank,bankGold:gold,setBankGold:setGold,username:'VisualQA',pushToast:()=>{},onChangeCharacter:()=>{},onChangeRace:()=>{},onOpenSettings:()=>{},unlockedSlots:3,onUnlockSlot:()=>{}})));
  }
  window.gallery=()=>root.render(h('div',{style:{display:'grid',gridTemplateColumns:'repeat(6,100px)',gap:8,background:'#171c28',color:'white'}},...Object.entries(monsterFaceRects).flatMap(([atlas,rects])=>rects.map((r,i)=>h('div',{key:atlas+i},h('svg',{viewBox:r.join(' '),width:100,height:100},h('image',{href:monsterAtlases[atlas],width:atlas==='fallow'?1448:1536,height:atlas==='fallow'?1086:1024})),h('small',null,atlas+' '+i))))));
  root.render(h(App));
 });
 await mkdir('output',{recursive:true});await page.locator('.fantasy-dock').waitFor();await page.waitForTimeout(500);

 await page.locator('.monster-hunt-card').first().waitFor();
 await page.screenshot({path:'output/monster-cards-crimson.png'});
 assert.equal(await page.locator('.monster-hunt-card').count(),4);
 assert.equal(await page.locator('.monster-hunt-card svg[data-monster-portrait]').count(),4);
 await page.locator('.monster-attack').first().click();await page.locator('.battle-scene').waitFor();
 await page.setViewportSize({width:660,height:800});await page.evaluate(()=>gallery());await page.waitForTimeout(400);await page.screenshot({path:'output/monster-portrait-gallery.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('PASS: portraits rendered; Crimson cards; selecting monster starts battle; no browser errors.');
}finally{await browser.close();}

