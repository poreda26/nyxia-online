import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.NYXIA_PLAYWRIGHT || 'C:/Users/akcel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:430,height:850}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.NYXIA_CHECK_URL || 'http://127.0.0.1:5175/nyxia-online/character-check.html');
 if(process.env.NYXIA_CHECK_CLASS)await page.getByLabel('Sınıf',{exact:true}).selectOption(process.env.NYXIA_CHECK_CLASS);
 if(process.env.NYXIA_CHECK_RACE)await page.getByLabel('Irk',{exact:true}).selectOption(process.env.NYXIA_CHECK_RACE);
 const chosen=process.env.NYXIA_CHECK_WEAPON||'Glave';
 await page.getByLabel('Silah',{exact:true}).selectOption(chosen);
 await page.waitForFunction(name=>[...document.querySelectorAll('svg[data-weapon]')].filter(e=>e.dataset.weapon===name).length===2,chosen);
 await page.waitForFunction(()=>[...document.querySelectorAll('svg image')].every(i=>i.getAttribute('href')));
 await page.evaluate(()=>Promise.all([...document.querySelectorAll('svg image')].map(i=>new Promise((resolve,reject)=>{const img=new Image();img.onload=resolve;img.onerror=reject;img.src=i.getAttribute('href')}))));
 await mkdir('output',{recursive:true});await page.screenshot({path:'output/character-preview.png',fullPage:true});
 if(process.argv.includes('--effects')){
  await page.getByLabel('Sınıf',{exact:true}).selectOption('warrior');
  for(const [name,element] of [['Raptor','poison'],['Hell Breaker','flame'],['Iron Impact','lightning'],['Blade Axe','ice']]){
   await page.getByLabel('Silah',{exact:true}).selectOption(name);
   for(const plus of [6,7,8]){
    await page.getByLabel('Upgrade',{exact:true}).selectOption(String(plus));
    await page.waitForFunction(({plus,element})=>{const effects=[...document.querySelectorAll('.weapon-effect')];return plus===6?effects.length===0:effects.length===2&&effects.every(e=>e.dataset.element===element&&e.dataset.upgrade===String(plus))},{plus,element});
   }
  }
  const figure=page.locator('.paperdoll-character .character-figure');
  const transform=await figure.evaluate(e=>getComputedStyle(e).transform);
  await page.waitForFunction(previous=>getComputedStyle(document.querySelector('.paperdoll-character .character-figure')).transform!==previous,transform);
  await page.getByLabel('Silah',{exact:true}).selectOption('');
  await page.waitForFunction(()=>!document.querySelector('.weapon-effect'));
  console.log('Four elements at +6/+7/+8, unequip and portrait breathing verified.');
 }
 if(process.argv.includes('--all')){
  let count=0;
  for(const cls of ['warrior','rogue','mage'])for(const race of ['human','karus']){
   await page.getByLabel('Sınıf',{exact:true}).selectOption(cls);await page.getByLabel('Irk',{exact:true}).selectOption(race);
   const names=await page.getByLabel('Silah',{exact:true}).locator('option').evaluateAll(os=>os.filter(o=>!o.disabled).map(o=>o.value));
   for(const name of names){await page.getByLabel('Silah',{exact:true}).selectOption(name);await page.waitForFunction(({name,identity})=>{const a=[...document.querySelectorAll('svg.character-figure')];return a.length===2&&a.every(e=>e.dataset.weapon===name&&e.dataset.character===identity)},{name,identity:race+'-'+cls});await page.evaluate(()=>Promise.all([...document.querySelectorAll('svg image')].map(i=>new Promise((resolve,reject)=>{const img=new Image();img.onload=resolve;img.onerror=reject;img.src=i.getAttribute('href')}))));count++;}
  }
  console.log('Browser equipment/preview transitions:',count);
 }
 if(errors.length)throw new Error(errors.join('\n'));console.log('No browser errors; screenshot saved.');
}finally{await browser.close();}

