import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.NYXIA_PLAYWRIGHT||'C:/Users/akcel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:360,height:640}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/polish-harness.html',r=>r.fulfill({contentType:'text/html',body:'<html><body><div id="root"></div></body></html>'}));
 await page.goto('http://127.0.0.1:5177/nyxia-online/polish-harness.html');
 await page.evaluate(async()=>{
  const refresh=await import('/nyxia-online/@react-refresh');refresh.default.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>t=>t;window.__vite_plugin_react_preamble_installed__=true;
  const React=(await import('/nyxia-online/node_modules/.vite/deps/react.js')).default;
  const {createRoot}=(await import('/nyxia-online/node_modules/.vite/deps/react-dom_client.js')).default;
  const {default:Global}=await import('/nyxia-online/src/components/GlobalStyle.jsx');
  const {default:Daily}=await import('/nyxia-online/src/components/DailyLoginModal.jsx');
  const {default:Offer}=await import('/nyxia-online/src/components/FirstPurchaseOfferModal.jsx');
  const {default:Captain}=await import('/nyxia-online/src/components/CaptainPortrait.jsx');
  const {LanguageProvider}=await import('/nyxia-online/src/i18n/LanguageContext.jsx');
  const {CLASSES}=await import('/nyxia-online/src/data/classes.js');
  const {armorIconImage}=await import('/nyxia-online/src/data/armorIconImages.js');
  const {initialPlayer}=await import('/nyxia-online/src/utils/player.js');
  const h=React.createElement,root=createRoot(document.querySelector('#root'));let serial=0;
  window.claims=0;window.closed=0;window.bought=0;
  window.showPolish=(mode,lang='tr',cls='warrior')=>{
   const player=initialPlayer(cls,'human','Test');
   let view;
   if(mode==='gallery')view=h('div',{style:{display:'grid',gridTemplateColumns:'repeat(5,1fr)',padding:10,background:'#171c25',color:'#eee',gap:6}},...['warrior','rogue','mage'].flatMap(c=>Array.from({length:5},(_,i)=>i+1).flatMap(t=>['head','chest','gauntlets','legs','boots'].map(s=>h('div',{key:c+t+s,style:{textAlign:'center',border:'1px solid #444'}},h('img',{src:armorIconImage(c,s,t),width:76,height:76}),h('div',{style:{fontSize:9}},`${c} T${t} ${s}`))))));
   else if(mode==='art')view=h('div',{},h(Captain,{size:260}),...Object.values(CLASSES).map(c=>h(c.icon,{size:90,key:c.id})));
   else view=mode==='daily'?h(Daily,{player,setPlayer:p=>{window.claims++;window.claimedPlayer=p;},onClose:()=>window.closed++,pushToast:()=>{}}):h(Offer,{player,onBuy:()=>window.bought++,onClose:()=>window.closed++});
   root.render(h(LanguageProvider,{lang,setLang:()=>{}},h(React.Fragment,{key:++serial},h(Global),view)));
  };
 });
 await mkdir('output',{recursive:true});
 for(const theme of ['dark','light'])for(const lang of ['tr','en'])for(const mode of ['daily','offer']){
  await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
  await page.evaluate(({mode,lang})=>showPolish(mode,lang),{mode,lang});await page.locator('[role=dialog]').waitFor();await page.waitForTimeout(350);
  const box=await page.locator('[role=dialog]').boundingBox();assert.ok(box.x>=0&&box.x+box.width<=360&&box.y>=0&&box.y+box.height<=640,`${mode} fits`);
  assert.equal(await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.complete||i.naturalWidth===0).length),0);
  await page.screenshot({path:`output/polish-${mode}-${lang}-${theme}.png`});
  if(mode==='daily'){await page.locator('.reward-cta').click();await page.locator('.reward-cta').click();}else {await page.locator('.reward-cta').click();}
 }
 assert.equal(await page.evaluate(()=>window.claims),4);assert.equal(await page.evaluate(()=>window.bought),4);
 for(const cls of ['rogue','mage']){await page.evaluate(cls=>showPolish('offer','tr',cls),cls);await page.waitForTimeout(300);assert.equal(await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.complete||!i.naturalWidth).length),0);}
 await page.setViewportSize({width:600,height:1500});await page.evaluate(()=>showPolish('gallery'));await page.locator('img').last().waitFor();await page.waitForTimeout(600);assert.equal(await page.locator('img').count(),75);assert.equal(await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.complete||!i.naturalWidth).length),0);await page.screenshot({path:'output/armor-inventory-gallery.png',fullPage:true});
 await page.evaluate(()=>showPolish('art'));await page.waitForTimeout(400);await page.screenshot({path:'output/new-character-art.png'});
 assert.deepEqual(errors,[]);console.log('PASS: 75 armor images; TR/EN, light/dark reward and offer dialogs fit 360x640; all class offer images; claim/close/buy callbacks; no browser errors.');
}finally{await browser.close();}
