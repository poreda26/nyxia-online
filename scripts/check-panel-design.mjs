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
  const {default:Ticker}=await import('/nyxia-online/src/components/NoticeTicker.jsx');
  const {LanguageProvider}=await import('/nyxia-online/src/i18n/LanguageContext.jsx');
  const {initialPlayer}=await import('/nyxia-online/src/utils/player.js');
  const {styles}=await import('/nyxia-online/src/styles.js');
  const h=React.createElement,root=createRoot(document.querySelector('#root'));
  function App(){
   const [player,setPlayer]=React.useState({...initialPlayer('warrior','human','Nyxia'),level:65,gold:100000,nationalPoint:5000,tutorialSeen:true,firstPurchaseBonusClaimed:true,dailyLogin:{streak:1,lastClaimDay:new Date().toDateString()}});
   const [tab,setTab]=React.useState('captain'),[bank,setBank]=React.useState([]),[gold,setGold]=React.useState(0),[notice,setNotice]=React.useState(null),[lang,setLang]=React.useState('tr');
   window.setNotice=setNotice;window.setLang=setLang;window.setTab=setTab;
   return h(LanguageProvider,{lang,setLang},h(Global),h('div',{style:styles.appRoot},notice?h('button',{className:'game-notice',style:{display:'flex',gap:8,padding:12,width:'100%',marginTop:20}},h(Ticker,null,notice),h('span',null,'02:59')):h(Hub,{player,setPlayer,tab,setTab,bank,setBank,bankGold:gold,setBankGold:setGold,username:'VisualQA',pushToast:()=>{},onChangeCharacter:()=>{},onChangeRace:()=>{},onOpenSettings:()=>{},unlockedSlots:3,onUnlockSlot:()=>{}})));
  }
  root.render(h(App));
 });
 await mkdir('output',{recursive:true});await page.locator('.fantasy-dock').waitFor();await page.waitForTimeout(500);

 for(const viewport of [{width:360,height:740},{width:320,height:640}]){
 await page.setViewportSize(viewport);
 for(const tab of ['inventory','market','upgrade','captain','clan','chat','character','warzone','battle']){
  await page.evaluate(tab=>setTab(tab),tab);await page.locator('[data-screen='+tab+']').waitFor();await page.waitForTimeout(200);
  await page.screenshot({path:'output/panel-'+tab+'-'+viewport.width+'.png'});
  const overflow=await page.locator('[data-screen='+tab+']').evaluate(e=>e.scrollWidth>e.clientWidth+1);assert.equal(overflow,false,tab+' viewport overflow');
  if(viewport.width===360){
   const buttons=page.locator('[data-screen='+tab+'] .rpg-tabs').first().locator('button[aria-selected]');
   const count=await buttons.count();
   for(let i=0;i<count;i++){await buttons.nth(i).click();await page.waitForTimeout(120);await page.screenshot({path:'output/panel-'+tab+'-sub-'+i+'.png'});}
  }
 }
 }
 await page.evaluate(()=>setTab('clan'));await page.waitForTimeout(150);await page.getByRole('button',{name:'Katıl',exact:true}).first().click();await page.waitForTimeout(250);await page.screenshot({path:'output/panel-clan-joined.png'});
 await page.locator('.rank-medal').first().scrollIntoViewIfNeeded();await page.screenshot({path:'output/panel-clan-ranking.png'});
 await page.evaluate(()=>setTab('warzone'));await page.waitForTimeout(200);await page.getByRole('button',{name:/^Işınlan/}).click();await page.getByRole('button',{name:'Evet',exact:true}).click();await page.getByRole('button',{name:'Sıralama',exact:true}).click();await page.locator('.rank-medal').first().waitFor();await page.screenshot({path:'output/panel-warzone-ranking.png'});
 await page.evaluate(()=>{setLang('en');document.documentElement.dataset.theme='light';setTab('upgrade')});await page.waitForTimeout(200);await page.screenshot({path:'output/panel-upgrade-en-light.png'});
 for(const tab of ['inventory','market','captain','clan','chat','character','warzone','battle']){await page.evaluate(tab=>setTab(tab),tab);await page.waitForTimeout(150);await page.screenshot({path:'output/panel-'+tab+'-en-light.png'});}
 assert.deepEqual(errors,[]);console.log('PASS: all nine screens at 320/360px; available subtabs; no content overflow or browser errors; EN/light theme.');
}finally{await browser.close();}
