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
   const [player,setPlayer]=React.useState({...initialPlayer('warrior','human','Nyxia'),tutorialSeen:true,firstPurchaseBonusClaimed:true,dailyLogin:{streak:1,lastClaimDay:new Date().toDateString()}});
   const [tab,setTab]=React.useState('captain'),[bank,setBank]=React.useState([]),[gold,setGold]=React.useState(0),[notice,setNotice]=React.useState(null),[lang,setLang]=React.useState('tr');
   window.setNotice=setNotice;window.setLang=setLang;window.setTab=setTab;
   return h(LanguageProvider,{lang,setLang},h(Global),h('div',{style:styles.appRoot},notice?h('button',{className:'game-notice',style:{display:'flex',gap:8,padding:12,width:'100%',marginTop:20}},h(Ticker,null,notice),h('span',null,'02:59')):h(Hub,{player,setPlayer,tab,setTab,bank,setBank,bankGold:gold,setBankGold:setGold,username:'VisualQA',pushToast:()=>{},onChangeCharacter:()=>{},onChangeRace:()=>{},onOpenSettings:()=>{},unlockedSlots:3,onUnlockSlot:()=>{}})));
  }
  root.render(h(App));
 });
 await mkdir('output',{recursive:true});await page.locator('.fantasy-dock').waitFor();await page.waitForTimeout(500);
 for(const theme of ['dark','light']){
  await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
  await page.screenshot({path:`output/chrome-captain-${theme}.png`});
 }
 await page.evaluate(()=>{document.documentElement.dataset.theme='dark';setTab('battle')});await page.locator('[data-screen=battle]').waitFor();await page.waitForTimeout(400);await page.screenshot({path:'output/chrome-battle.png'});
 assert.equal(await page.locator('.dock-button').count(),9);
 await page.locator('.dock-button').last().click();await page.waitForTimeout(400);assert.equal(await page.locator('.dock-button[aria-current=page] .dock-label').innerText(),'Karakter');
 const dock=await page.locator('.fantasy-dock').boundingBox();assert.ok(dock.y+dock.height<=741&&dock.y>=0);
 await page.setViewportSize({width:360,height:640});await page.evaluate(()=>setTab('captain'));await page.waitForTimeout(400);await page.screenshot({path:'output/chrome-small.png'});
 await page.evaluate(()=>setNotice('Meydan Celladı Bossu ortaya çıktı! Saldırmak için son 3 dakika. Savaş alanına katıl ve ödülleri kazan.'));
 await page.locator('.notice-window.is-scrolling').waitFor();await page.mouse.move(350,500);
 const ticker=page.locator('.notice-copy');
 const initial=await ticker.evaluate(e=>e.getAnimations()[0].currentTime);await page.waitForTimeout(400);
 await page.evaluate(()=>setNotice('Meydan Celladı Bossu ortaya çıktı! Saldırmak için son 2 dakika. Savaş alanına katıl ve ödülleri kazan.'));
 const after=await ticker.evaluate(e=>e.getAnimations()[0].currentTime);assert.ok(after>initial,'notice updates preserve animation');
 await ticker.evaluate(e=>{const a=e.getAnimations()[0];a.currentTime=a.effect.getTiming().duration*.9;});
 assert.ok(await ticker.evaluate(e=>new DOMMatrix(getComputedStyle(e).transform).m41<0),'long notice moves');
 await page.locator('.game-notice').hover();assert.equal(await ticker.evaluate(e=>getComputedStyle(e).animationPlayState),'paused');
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await ticker.evaluate(e=>getComputedStyle(e).animationName),'none');assert.equal(await ticker.evaluate(e=>getComputedStyle(e).whiteSpace),'normal');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.evaluate(()=>setNotice('Kısa duyuru'));await page.waitForTimeout(100);assert.equal(await page.locator('.notice-window.is-scrolling').count(),0);
 assert.deepEqual(errors,[]);console.log('PASS: full Hub mobile dark/light; 9 navigation destinations; last tab reachable; notices scroll, preserve progress, pause, resize and respect reduced motion.');
}finally{await browser.close();}
