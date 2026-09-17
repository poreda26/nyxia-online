import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.NYXIA_PLAYWRIGHT||'C:/Users/akcel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
 const page=await browser.newPage({viewport:{width:360,height:640}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/reward-harness.html',r=>r.fulfill({contentType:'text/html',body:'<html><body><div id="root"></div></body></html>'}));
 await page.goto((process.env.NYXIA_CHECK_URL||'http://127.0.0.1:5177/nyxia-online/')+'reward-harness.html');
 await page.evaluate(async()=>{
  const refresh=await import('/nyxia-online/@react-refresh');refresh.default.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>t=>t;window.__vite_plugin_react_preamble_installed__=true;
  const React=(await import('/nyxia-online/node_modules/.vite/deps/react.js')).default;
  const {createRoot}=(await import('/nyxia-online/node_modules/.vite/deps/react-dom_client.js')).default;
  const {default:Global}=await import('/nyxia-online/src/components/GlobalStyle.jsx');
  const {default:Forge}=await import('/nyxia-online/src/components/ForgePressModal.jsx');
  const {default:Chest}=await import('/nyxia-online/src/components/ChestModal.jsx');
  const {default:Battle}=await import('/nyxia-online/src/components/BattleScene.jsx');
  const {gmBuildWeaponById,gmWeaponTemplates}=await import('/nyxia-online/src/utils/loot.js');
  const {initialPlayer}=await import('/nyxia-online/src/utils/player.js');
  const {MAPS}=await import('/nyxia-online/src/data/maps.js');
  const t=gmWeaponTemplates('warrior').find(w=>w.name==='Raptor'),item=gmBuildWeaponById('warrior',t.id,6),next=gmBuildWeaponById('warrior',t.id,7);
  const h=React.createElement,root=createRoot(document.querySelector('#root'));let serial=0;
  window.showReward=(mode)=>{
   const view=mode.startsWith('battle')?h('div',{className:'battle-mobile'},h(Battle,{player:initialPlayer('warrior','human','Test'),monster:MAPS[0].monsters[0],map:MAPS[0],battle:{monsterHp:mode==='battle-victory'?0:60,monsterMaxHp:100},visual:{id:1,type:'attack',label:'Vuruş',incoming:mode==='battle'?null:{hit:mode!=='battle-miss',damage:24}}})):
    mode.startsWith('chest')?h(Chest,{state:{chest:{tier:4},phase:mode==='chest-open'?'shaking':'reveal',result:next},playerClass:'warrior',onClose:()=>window.closedReward=true}):
    h(Forge,{item,success:mode!=='fail',bumpedItem:next,onClose:()=>window.closedReward=true});
   root.render(h(React.Fragment,{key:++serial},h(Global),view));
  };
 });
 await mkdir('output',{recursive:true});
 await page.evaluate(()=>showReward('forge'));await page.locator('.forge-item-stage').waitFor();await page.getByRole('button',{name:/Geç/}).click();
 await page.locator('.reward-art').waitFor();assert.equal(await page.locator('.reward-plus').innerText(),'+7');assert.ok((await page.locator('.reward-stats').innerText()).includes('Raptor +7'));
 await page.screenshot({path:'output/forge-reward.png'});
 await page.evaluate(()=>showReward('fail'));await page.getByRole('button',{name:/Geç/}).click();await page.getByText('Başarısız oldu',{exact:true}).waitFor();assert.equal(await page.locator('.reward-art').count(),0);
 await page.evaluate(()=>showReward('chest-open'));await page.locator('.chest-box').waitFor();
 await page.evaluate(()=>showReward('chest-result'));await page.locator('.reward-art').waitFor();await page.screenshot({path:'output/chest-reward.png'});
 const fits=await page.locator('.reward-modal').evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight});assert.ok(fits);
 await page.evaluate(()=>showReward('battle'));await page.locator('.battle-impact').waitFor({state:'attached'});
 const layers=await page.evaluate(()=>({effect:+getComputedStyle(document.querySelector('.battle-effect')).zIndex,unit:+getComputedStyle(document.querySelector('.battle-unit')).zIndex}));assert.ok(layers.effect>layers.unit);
 await page.evaluate(()=>showReward('battle-hit'));await page.locator('.incoming-hit').waitFor({state:'attached'});
 assert.equal(await page.locator('.incoming-number').textContent(),'−24');
 assert.equal(await page.locator('.battle-hero .battle-motion').evaluate(el=>getComputedStyle(el).animationName),'hero-exchange');
 await page.evaluate(()=>showReward('battle-miss'));await page.locator('.incoming-miss').waitFor({state:'attached'});assert.equal(await page.locator('.incoming-burst').count(),0);
 await page.evaluate(()=>showReward('battle-victory'));await page.locator('.is-victory').waitFor({state:'attached'});assert.equal(await page.locator('.incoming-number').count(),0);
 assert.deepEqual(errors,[]);console.log('PASS: upgrade +7 visual and stats, failure, chest opening/result, mobile fit and foreground hit effects.');
}finally{await browser.close()}
