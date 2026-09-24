// Inspect the actual armor + weapon + hand composite, not an isolated shaft.
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/akcel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp=require('C:/Users/akcel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:700,height:800},reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/grip-audit.html',r=>r.fulfill({contentType:'text/html',body:'<style>body{margin:0;background:transparent}*{animation:none!important}</style><div id="root"></div>'}));
 await page.goto('http://127.0.0.1:5177/nyxia-online/grip-audit.html');
 await page.evaluate(async()=>{const r=await import('/nyxia-online/@react-refresh');r.default.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>t=>t;window.__vite_plugin_react_preamble_installed__=true;await import('/nyxia-online/tests/equipment-gallery.jsx')});
 let count=0;
 for(const cls of ['warrior','rogue','mage'].filter(c=>!process.argv[2]||process.argv[2]===c))for(const race of ['human','karus']){
  const crops=[];
  for(let index=0;index<30;index++){
   for(const plus of [1,7,8]){
    const info=await page.evaluate(args=>gripCase(...args),[cls,race,index,plus]);if(!info)break;
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await page.evaluate(()=>Promise.all([...document.querySelectorAll('svg image')].map(i=>new Promise((ok,no)=>{const im=new Image();im.onload=ok;im.onerror=no;im.src=i.getAttribute('href')}))));
    const png=await page.locator('.character-figure').screenshot({omitBackground:true});
    const {data,info:meta}=await sharp(png).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    const [hx,hy]=info.hand;
    // Require visible, connected material at the front grip of the full figure.
    // A small neighborhood tolerates the different finger silhouettes.
    for(let dy=-8;dy<=8;dy++){
     const y=Math.round(hy+dy),x=Math.round(hx+92);let opaque=false;
     for(let dx=-8;dx<=8;dx++)if(data[(y*meta.width+x+dx)*4+3]>160)opaque=true;
     assert.ok(opaque,`${cls}/${race}/${info.name}/+${plus}: empty composed grip row ${y}`);
    }
    if(plus===7){
     const label=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="24"><text x="3" y="16" fill="white" font-size="10">${index+1}. ${info.name.replaceAll('&','&amp;')}</text></svg>`);
     const crop=await sharp(png).extract({left:Math.round(hx+92-45),top:Math.round(hy-45),width:90,height:100}).resize(160,178).flatten({background:'#172029'}).png().toBuffer();
     const tile=await sharp({create:{width:160,height:202,channels:4,background:'#172029'}}).composite([{input:label,top:0,left:0},{input:crop,top:24,left:0}]).png().toBuffer();
     crops.push({input:tile,left:index%5*160,top:Math.floor(index/5)*202});
    }
    count++;
   }
  }
  await sharp({create:{width:800,height:Math.ceil(crops.length/5)*202,channels:4,background:'#172029'}}).composite(crops).png().toFile(`output/composed-grips-${cls}-${race}.png`);
  console.log(`PASS ${cls} ${race}: ${crops.length} weapons, +1/+7/+8; contact sheet saved`);
 }
 for(const race of ['human','karus'])for(let tier=0;tier<=5;tier++){
  const info=await page.evaluate(args=>gripCase(...args),['warrior',race,3,7,tier]);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.evaluate(()=>Promise.all([...document.querySelectorAll('svg image')].map(i=>new Promise((ok,no)=>{const im=new Image();im.onload=ok;im.onerror=no;im.src=i.getAttribute('href')}))));
  await page.locator('.character-figure').screenshot({path:`output/composed-warrior-${race}-t${tier}.png`,omitBackground:true});
  const composed=await sharp(await page.locator('.character-figure').screenshot({omitBackground:true})).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  for(const sx of [216,220,226,233]){
   const shoulderX=Math.round(sx*info.scale+info.dx+92),shoulderY=Math.round(223*info.scale+info.dy);
   assert.ok(composed.data[(shoulderY*composed.info.width+shoulderX)*4+3]>180,`${race} T${tier}: old guard removal leaves a hole at shoulder x=${sx}`);
  }
  await page.evaluate(()=>{const svg=document.querySelector('.character-figure'),last=svg.lastElementChild;for(const g of svg.children)if(g.tagName.toLowerCase()==='g'&&g!==last)g.style.visibility='hidden';last.querySelectorAll('.armor-effect').forEach(g=>g.style.visibility='hidden');});
  const {data,info:meta}=await sharp(await page.locator('.character-figure').screenshot({omitBackground:true})).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const at=(x,y)=>data[(Math.round(y*info.scale+info.dy)*meta.width+Math.round(x*info.scale+info.dx+92))*4+3];
  const shift=race==='karus'?-10:0;
  assert.ok(at(243,260+shift)>180,`${race} T${tier}: fingers missing`);
  assert.ok(at(267,231+shift)<20,`${race} T${tier}: original sword blade leaks into hand layer`);
  assert.ok(at(285,255+shift)<20,`${race} T${tier}: original sword guard leaks into hand layer`);
  await page.evaluate(()=>document.querySelectorAll('svg g').forEach(g=>g.style.visibility=''));
 }
 assert.deepEqual(errors,[]);console.log(`PASS ${count} composed equipment cases + 12 armor/cloth hand-cutout regressions; no browser errors`);
}finally{await browser.close()}
