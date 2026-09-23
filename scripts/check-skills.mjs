import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/akcel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/skill-harness.html',r=>r.fulfill({contentType:'text/html',body:'<meta name="viewport" content="width=device-width,initial-scale=1"><div id="root"></div>'}));
 await page.goto('http://127.0.0.1:5177/nyxia-online/skill-harness.html');
 await page.evaluate(async()=>{
 const base='/nyxia-online/';const refresh=await import(base+'@react-refresh');refresh.default.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>t=>t;window.__vite_plugin_react_preamble_installed__=true;
 const React=(await import(base+'node_modules/.vite/deps/react.js')).default;const {createRoot}=(await import(base+'node_modules/.vite/deps/react-dom_client.js')).default;
 const {default:Icon}=await import(base+'src/components/SkillIcon.jsx');const {default:Effect}=await import(base+'src/components/SkillEffect.jsx');const {SKILLS_BY_CLASS}=await import(base+'src/data/skills.js');
 document.body.style='background:#111820;color:#fff;margin:8px';
 createRoot(document.querySelector('#root')).render(React.createElement('div',{},Object.entries(SKILLS_BY_CLASS).map(([cls,skills])=>React.createElement('section',{key:cls},React.createElement('h3',{},cls),React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}},skills.map(skill=>React.createElement('div',{key:skill.id,style:{minWidth:0,fontSize:10,textAlign:'center',position:'relative'}},React.createElement(Icon,{skill,size:54}),React.createElement('div',{},skill.name),React.createElement(Effect,{id:skill.id,type:skill.effect.type}))))))));
 });
 await page.waitForSelector('[data-skill-art]');
 assert.equal(await page.locator('[data-skill-art]').count(),39);assert.equal(await page.locator('[data-skill-effect]').count(),39);
 const shapes=await page.locator('[data-skill-art]>g').evaluateAll(nodes=>nodes.map(n=>n.innerHTML));assert.equal(new Set(shapes).size,39);
 await page.screenshot({path:'output/skills-review.png',fullPage:true});
 await page.evaluate(()=>document.documentElement.dataset.motion='reduced');assert.equal(await page.locator('.skill-fx').first().evaluate(e=>getComputedStyle(e).display),'none');await page.evaluate(()=>delete document.documentElement.dataset.motion);
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.skill-fx').first().evaluate(e=>getComputedStyle(e).display),'none');assert.deepEqual(errors,[]);
 console.log('PASS 39 unique skill pictograms, 39 rendered effects, reduced-motion, no browser errors');
}finally{await browser.close();}

