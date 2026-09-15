import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)(process.env.NYXIA_PLAYWRIGHT||'C:/Users/akcel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const b=await chromium.launch({channel:'msedge',headless:true});
try{
 const p=await b.newPage({viewport:{width:430,height:920}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(process.env.NYXIA_CHECK_URL||'http://127.0.0.1:5175/nyxia-online/character-check.html');
 const saved=await p.evaluate(()=>JSON.stringify(localStorage));let armorChecks=0,mageChecks=0;
 for(const cls of ['warrior','rogue','mage'])for(const race of ['human','karus']){
  await p.getByLabel('Sınıf',{exact:true}).selectOption(cls);await p.getByLabel('Irk',{exact:true}).selectOption(race);
  for(const tier of [1,2,3,4,5]){
   await p.getByLabel('Set seviyesi',{exact:true}).selectOption(String(tier));await p.getByRole('button',{name:'Seti kuşan',exact:true}).click();
   for(const plus of [6,7,8]){
    await p.getByLabel('Zırh yükseltme',{exact:true}).selectOption(String(plus));
    assert.equal(await p.locator('.armor-effect').count(),plus<7?0:10);
    assert.equal(await p.locator('.armor-sweep').count(),plus===8?10:0);
    const fx=await p.locator('.armor-effect').evaluateAll(es=>es.map(e=>({tier:+e.dataset.tier,plus:+e.dataset.upgrade,animation:getComputedStyle(e).animationName})));
    for(const e of fx){assert.equal(e.tier,tier);assert.equal(e.plus,plus);assert.equal(e.animation,plus===7?'armor-blink':'armor-radiance')}
    armorChecks++;
   }
  }
  await p.getByLabel('Ellik',{exact:true}).selectOption('0');assert.equal(await p.locator('[data-armor-effect="gauntlets"]').count(),0);
  await p.getByRole('button',{name:'Tüm zırhları çıkar',exact:true}).click();assert.equal(await p.locator('.armor-effect').count(),0);
 }
 await p.getByLabel('Sınıf',{exact:true}).selectOption('mage');
 for(const race of ['human','karus']){
  await p.getByLabel('Irk',{exact:true}).selectOption(race);
  const names=await p.getByLabel('Silah',{exact:true}).locator('option').evaluateAll(os=>os.map(o=>o.value).filter(Boolean));
  for(const name of names){
   await p.getByLabel('Silah',{exact:true}).selectOption(name);await p.getByLabel('Upgrade',{exact:true}).selectOption('8');
   assert.ok(await p.locator('.weapon-effect').count()>=2,name);
   if(['Prismatic Triad Staff',"Ron's Staff"].includes(name))assert.equal(await p.locator('.weapon-effect-multi').count(),6);
   mageChecks++;
  }
 }
 await p.getByLabel('Set seviyesi',{exact:true}).selectOption('5');await p.getByRole('button',{name:'Seti kuşan',exact:true}).click();
 await p.screenshot({path:'output/upgrade-effects-mobile.png',fullPage:true});
 await p.emulateMedia({reducedMotion:'reduce'});
 for(const name of await p.locator('.armor-effect').evaluateAll(es=>es.map(e=>getComputedStyle(e).animationName)))assert.equal(name,'none');
 assert.equal(await p.evaluate(()=>JSON.stringify(localStorage)),saved);assert.deepEqual(errors,[]);
 console.log(`PASS: ${armorChecks} tier/upgrade cases across 6 characters; ${mageChecks} Mage weapon effects; unequip, reduced motion and save preserved.`);
}finally{await b.close()}
