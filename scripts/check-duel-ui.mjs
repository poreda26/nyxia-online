import {createRequire} from 'node:module';import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);const {chromium}=require('C:/Users/akcel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/duel-harness.html',r=>r.fulfill({contentType:'text/html',body:'<meta name="viewport" content="width=device-width,initial-scale=1"><div id="root"></div>'}));await page.goto('http://127.0.0.1:5177/nyxia-online/duel-harness.html');
 await page.evaluate(async()=>{
 const base='/nyxia-online/';const refresh=await import(base+'@react-refresh');refresh.default.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>t=>t;window.__vite_plugin_react_preamble_installed__=true;
 await import(base+'tests/duel-harness.jsx');
 });
 for(const cls of ['warrior','rogue','mage']){
 await page.evaluate(c=>show(c),cls);await page.getByRole('button',{name:'Otomatik VS dene'}).click();await page.waitForFunction(()=>document.body.innerText.includes('Tur 2'));
 assert.equal(await page.locator('.duel-scene .battle-unit').count(),2);const bounds=await page.locator('.duel-scene').boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=390,'duel scene clipped');assert.equal(await page.evaluate(()=>JSON.stringify(p)===before),true);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:`output/duel-${cls}.png`,fullPage:true});
 }
 await page.evaluate(()=>art());await page.locator('[data-jewel-art]').first().waitFor();await page.screenshot({path:'output/anti-defense-jewels.png',fullPage:true});await page.evaluate(()=>zone());await page.getByRole('button',{name:'Işınlan (50g)',exact:true}).click();await page.getByRole('button',{name:'Evet',exact:true}).click();
 await page.getByRole('button',{name:'Meydan Oku',exact:true}).first().click();await page.locator('.duel-scene').waitFor();const mana=await page.evaluate(()=>zonePlayer.mp);await page.waitForFunction(m=>zonePlayer.mp<m,mana);assert.equal(await page.locator('.duel-scene .battle-unit').count(),2);await page.screenshot({path:'output/warzone-skill-duel.png',fullPage:true});
 assert.deepEqual(errors,[]);
 console.log('PASS: three-class automatic practice, two equipped character previews, immutable player, 390px layout, accessory art and no browser exceptions.');
}finally{await browser.close();}


