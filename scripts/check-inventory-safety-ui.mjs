import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium}=require('C:/Users/akcel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/inventory-test.html',r=>r.fulfill({contentType:'text/html',body:'<meta name="viewport" content="width=device-width,initial-scale=1"><div id="root"></div>'}));
 await page.goto('http://127.0.0.1:5188/nyxia-online/inventory-test.html');
 await page.evaluate(async()=>{const r=await import('/nyxia-online/@react-refresh');r.default.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>t=>t;window.__vite_plugin_react_preamble_installed__=true;await import('/nyxia-online/tests/inventory-safety-ui.jsx')});
 await page.locator('.rpg-bag-grid').waitFor();assert.equal(await page.getByLabel('Başka sınıfa ait').count(),32);
 await page.getByRole('button',{name:'Sandıklar (2)',exact:true}).click();
 await page.getByRole('button').filter({hasText:'Kırmak için dokun'}).first().click();
 assert.equal(await page.evaluate(()=>testPlayer.chests.length),2);assert.equal(await page.locator('.reward-modal').count(),0);
 assert.ok(await page.evaluate(()=>messages.some(m=>m.includes('Envanter dolu'))));
 await page.getByRole('button',{name:'Tümünü Aç (2)',exact:true}).click();assert.equal(await page.evaluate(()=>testPlayer.chests.length),2);
 await page.evaluate(()=>freeSlot());await page.getByRole('button',{name:'Tümünü Aç (2)',exact:true}).click();
 assert.equal(await page.evaluate(()=>testPlayer.chests.length),1);assert.equal(await page.evaluate(()=>testPlayer.inventory.length),32);
 assert.equal(await page.evaluate(()=>testPlayer.milestones.chestsOpened),1);
 assert.deepEqual(errors,[]);console.log('Inventory UI: wrong-class weapon badges, full single/bulk chest warnings, partial bulk preservation passed.');
}finally{await browser.close();}
