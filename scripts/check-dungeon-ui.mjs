import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {clanDungeonStage} from '../src/data/clanDungeon.js';
const require=createRequire(import.meta.url),{chromium}=require('C:/Users/akcel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 let state;
 await page.route('**/api/**',r=>r.fulfill({contentType:'application/json',body:JSON.stringify(r.request().url().endsWith('/log')?[]:state)}));
 await page.route('**/dungeon-test.html',r=>r.fulfill({contentType:'text/html',body:'<meta name="viewport" content="width=device-width,initial-scale=1"><div id="root"></div>'}));
 for(const width of [320,390,768])for(const [index,mode] of [[1,'idle'],[10,'mine'],[20,'locked'],[20,'complete']]){
  const stage=clanDungeonStage(index);state={stage,monsterHp:mode==='complete'?0:stage.hp/2,stageIndex:index,totalStages:20,locked:mode==='mine'||mode==='locked',lockedByMe:mode==='mine',lockedByName:'Test',lockedUntil:Date.now()+60000,completed:mode==='complete',attempts:{entriesLeft:2,cooldownRemainingMs:0}};
  await page.setViewportSize({width,height:844});await page.goto('http://127.0.0.1:5188/nyxia-online/dungeon-test.html');
  await page.evaluate(async()=>{const r=await import('/nyxia-online/@react-refresh');r.default.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>t=>t;window.__vite_plugin_react_preamble_installed__=true;await import('/nyxia-online/tests/dungeon-ui.jsx')});
  await page.locator('.dungeon-encounter svg').waitFor();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.equal(await page.locator('.dungeon-stage-track i').count(),20);
  await page.screenshot({path:`output/dungeon-${width}-${index}-${mode}.png`,fullPage:true});
 }
 assert.deepEqual(errors,[]);console.log('Dungeon: 12 viewport/state combinations passed, no overflow or runtime errors.');
}finally{await browser.close()}
