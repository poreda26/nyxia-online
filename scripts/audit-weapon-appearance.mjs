import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
const {chromium}=createRequire(import.meta.url)('C:/Users/akcel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{const page=await browser.newPage({viewport:{width:1440,height:1100}});page.on('pageerror',e=>{throw e});
for(const cls of ['warrior','rogue','mage'])for(const race of ['human','karus']){
await page.goto('http://127.0.0.1:5175/nyxia-online/character-check.html');
await page.evaluate(async({cls,race})=>{
 const React=(await import('/nyxia-online/node_modules/.vite/deps/react.js')).default;
 const {createRoot}=(await import('/nyxia-online/node_modules/.vite/deps/react-dom_client.js')).default;
 const Figure=(await import('/nyxia-online/src/components/CharacterFigure.jsx')).default;
 const {gmWeaponTemplates,gmBuildWeaponById}=await import('/nyxia-online/src/utils/loot.js');
 const {BALANCED_WEAPONS}=await import('/nyxia-online/src/data/balancedWeapons.js');
 document.body.innerHTML='<div id="audit"></div>';const host=document.querySelector('#audit');
 host.style.cssText='display:grid;grid-template-columns:repeat(6,1fr);gap:12px;padding:12px;background:#182126';
 createRoot(host).render(BALANCED_WEAPONS[cls].map(w=>{const t=gmWeaponTemplates(cls).find(t=>t.name===w.name),item=gmBuildWeaponById(cls,t.id,8);return React.createElement('section',{key:w.name,style:{height:300,minWidth:0,border:'1px solid #526069',overflow:'hidden'}},React.createElement('div',{style:{height:27,textAlign:'center',fontSize:12}},w.name),React.createElement('div',{style:{height:260}},React.createElement(Figure,{player:{class:cls,race,equipped:{mainHand:item}}})));}));
},{cls,race});
await page.waitForFunction(()=>document.querySelectorAll('svg.character-figure').length>15);
await page.evaluate(()=>Promise.all([...document.querySelectorAll('svg image')].map(i=>new Promise((res,rej)=>{const im=new Image();im.onload=res;im.onerror=rej;im.src=i.getAttribute('href')}))));
await page.evaluate(()=>{document.getAnimations().forEach(a=>{a.pause();a.currentTime=1000;})});
await mkdir('output',{recursive:true});await page.screenshot({path:`output/audit-${cls}-${race}.png`,fullPage:true});console.log(cls,race,'rendered');
}
}finally{await browser.close()}

