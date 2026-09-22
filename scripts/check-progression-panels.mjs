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
   const [player,setPlayer]=React.useState({...initialPlayer('warrior','human','Nyxia'),level:65,diamonds:1000,tutorialSeen:true,firstPurchaseBonusClaimed:true,dailyLogin:{streak:1,lastClaimDay:new Date().toDateString()}});
   const [tab,setTab]=React.useState('captain'),[bank,setBank]=React.useState([]),[gold,setGold]=React.useState(0),[notice,setNotice]=React.useState(null),[lang,setLang]=React.useState('tr');
   window.currentPlayer=player;window.setNotice=setNotice;window.setLang=setLang;window.setTab=setTab;
   return h(LanguageProvider,{lang,setLang},h(Global),h('div',{style:styles.appRoot},notice?h('button',{className:'game-notice',style:{display:'flex',gap:8,padding:12,width:'100%',marginTop:20}},h(Ticker,null,notice),h('span',null,'02:59')):h(Hub,{player,setPlayer,tab,setTab,bank,setBank,bankGold:gold,setBankGold:setGold,username:'VisualQA',pushToast:()=>{},onChangeCharacter:()=>{},onChangeRace:()=>{},onOpenSettings:()=>{},unlockedSlots:3,onUnlockSlot:()=>{}})));
  }
  root.render(h(App));
 });
 await mkdir('output',{recursive:true});await page.locator('.fantasy-dock').waitFor();await page.waitForTimeout(500);

 for(const width of [360,320])for(const theme of ['dark','light']){
  await page.setViewportSize({width,height:740});await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
  for(const tab of ['captain','character']){
   await page.evaluate(tab=>setTab(tab),tab);await page.waitForTimeout(100);
   for(let i=1;i<4;i++){
    await page.locator('[data-screen='+tab+'] .rpg-tabs').first().locator('button').nth(i).click();
    const target=tab==='character'?['','.skill-card','.achievement-card','.dye-preview-stage'][i]:['','.journal-step','.weekly-step','.collection-entry'][i];
    await page.locator(target).first().scrollIntoViewIfNeeded();await page.waitForTimeout(100);
    await page.screenshot({path:'output/progression-'+tab+'-'+i+'-'+width+'-'+theme+'.png'});
    assert.equal(await page.locator('[data-screen='+tab+']').evaluate(e=>e.scrollWidth>e.clientWidth+1),false,tab+' overflow');
   }
  }
 }
 await page.locator('.dye-tile').nth(1).click();assert.equal(await page.evaluate(()=>currentPlayer.diamonds),1000);assert.ok(!await page.evaluate(()=>currentPlayer.armorDye));
 await page.locator('.dye-preview-actions button').click();assert.equal(await page.evaluate(()=>currentPlayer.armorDye),'crimson');assert.equal(await page.evaluate(()=>currentPlayer.diamonds),750);assert.equal(await page.locator('.dye-preview-actions button').isDisabled(),true);
 await page.locator('.dye-tile').first().click();await page.locator('.dye-preview-actions button').click();assert.equal(await page.evaluate(()=>currentPlayer.armorDye),null);assert.equal(await page.evaluate(()=>currentPlayer.diamonds),750);
 await page.locator('.dye-tile').nth(1).click();await page.locator('.dye-preview-actions button').click();assert.equal(await page.evaluate(()=>currentPlayer.diamonds),750);
 await page.locator('[data-screen=character] .rpg-tabs').first().locator('button').nth(1).click();assert.equal(await page.locator('.skill-card').count(),13);await page.locator('.skill-card').first().getByRole('button').click();assert.equal(await page.evaluate(()=>currentPlayer.skills.known.length),1);
 await page.locator('.progression-filter button').nth(1).click();assert.equal(await page.locator('.skill-card').count(),1);await page.locator('.skill-card').first().getByRole('button').click();assert.ok(await page.evaluate(()=>currentPlayer.skills.loadout.includes('w1')));
 assert.deepEqual(errors,[]);console.log('PASS: six progression views in dark/light at 320/360; learn/filter/equip skill; preview is free, purchase charges once, owned/original apply free.');
}finally{await browser.close();}
