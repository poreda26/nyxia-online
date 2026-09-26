import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium}=require('C:/Users/akcel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'),sharp=require('C:/Users/akcel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:700,height:800},reducedMotion:'reduce'});
 await page.route('**/neck-audit.html',r=>r.fulfill({contentType:'text/html',body:'<style>body{margin:0;background:transparent}*{animation:none!important}</style><div id="root"></div>'}));
 await page.goto('http://127.0.0.1:5177/nyxia-online/neck-audit.html');
 await page.evaluate(async()=>{const r=await import('/nyxia-online/@react-refresh');r.default.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>t=>t;window.__vite_plugin_react_preamble_installed__=true;await import('/nyxia-online/tests/equipment-gallery.jsx')});
 for(const race of ['human','karus']){
  await page.evaluate(r=>gripCase('warrior',r,11,7),race);
  await page.evaluate(()=>new Promise(ok=>requestAnimationFrame(()=>requestAnimationFrame(ok))));
  await page.evaluate(()=>Promise.all([...document.querySelectorAll('svg image')].map(i=>new Promise(ok=>{const im=new Image();im.onload=ok;im.src=i.getAttribute('href')}))));
  const fig=page.locator('.character-figure');
  await fig.screenshot({path:`output/totem-${race}.png`,omitBackground:true});
  await page.evaluate(()=>{const svg=document.querySelector('.character-figure');for(const g of svg.children)if(g.tagName.toLowerCase()==='g'&&!g.querySelector('[data-held-weapon]'))g.style.display='none';svg.querySelectorAll('.weapon-effect').forEach(g=>g.style.display='none');});
  const actual=await sharp(await fig.screenshot({omitBackground:true})).ensureAlpha().raw().toBuffer();
  await page.locator('[data-held-weapon]').evaluate(e=>e.removeAttribute('mask'));
  const reference=await sharp(await fig.screenshot({omitBackground:true})).ensureAlpha().raw().toBuffer();
  let expected=0,kept=0;
  const offset=race==='karus'?-10:0;
  for(let y=200+offset;y<=225+offset;y++){
   const x=90+(430-(y-offset))*(318-90)/(430-146);
   for(let dx=-8;dx<=8;dx++){
    const i=(y*602+Math.round(x+92)+dx)*4+3;
    if(reference[i]>200){expected++;if(actual[i]>180)kept++;}
   }
  }
  console.log(`${race}: ${kept}/${expected} actual shaft pixels retained above hand`);
  assert.ok(expected>250&&kept/expected>.95,`${race}: weapon neck is being cut by the extraction mask`);
  await page.reload();await page.evaluate(async()=>{const r=await import('/nyxia-online/@react-refresh');r.default.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>t=>t;window.__vite_plugin_react_preamble_installed__=true;await import('/nyxia-online/tests/equipment-gallery.jsx')});
 }
}finally{await browser.close()}
