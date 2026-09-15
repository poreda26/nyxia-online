import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)(process.env.NYXIA_PLAYWRIGHT||'C:/Users/akcel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.NYXIA_CHECK_URL||'http://127.0.0.1:5175/nyxia-online/character-check.html');
 const before=await page.evaluate(()=>JSON.stringify(localStorage));
 const slots={head:'Kask',chest:'Göğüslük',legs:'Pantolon',gauntlets:'Ellik',boots:'Bot'};
 let checks=0;
 for(const cls of ['warrior','rogue','mage'])for(const race of ['human','karus']) {
  await page.getByLabel('Sınıf',{exact:true}).selectOption(cls);
  await page.getByLabel('Irk',{exact:true}).selectOption(race);
  const weapon=await page.getByLabel('Silah',{exact:true}).inputValue();
  for(const tier of [1,2,3,4,5])for(const [slot,label] of Object.entries(slots)) {
   await page.getByLabel(label,{exact:true}).selectOption(String(tier));
   for(const view of await page.locator('.character-figure').all()) {
    assert.equal(await view.getAttribute('data-armor-slots'),slot);
    assert.equal(await view.getAttribute('data-weapon'),weapon);
    assert.equal(await view.locator(`[data-armor-layer="${slot}"]`).getAttribute('data-armor-tier'),String(tier));
    assert.ok(await view.locator(`[data-armor-layer="${slot}"]`).getAttribute('href'));
   }
   await page.getByLabel(label,{exact:true}).selectOption('0');
   assert.equal(await page.locator('.character-figure').first().getAttribute('data-look'),'cloth-base');
   checks++;
  }
  await page.getByLabel('Göğüslük',{exact:true}).selectOption('1');
  await page.getByLabel('Ellik',{exact:true}).selectOption('5');
  const names=await page.getByLabel('Silah',{exact:true}).locator('option').evaluateAll(os=>os.map(o=>o.value));
  for(const name of names) {
   await page.getByLabel('Silah',{exact:true}).selectOption(name);
   assert.equal(await page.locator('.character-figure').first().getAttribute('data-armor-slots'),'chest,gauntlets');
   assert.equal(await page.locator('.character-figure').first().getAttribute('data-weapon'),name);
  }
  await page.evaluate(()=>Promise.all([...document.querySelectorAll('svg image')].map(i=>new Promise((resolve,reject)=>{const im=new Image();im.onload=resolve;im.onerror=()=>reject(Error(i.getAttribute('href')));im.src=i.getAttribute('href')}))));
 }
 await page.getByLabel('Sınıf',{exact:true}).selectOption('warrior');
 await page.getByLabel('Irk',{exact:true}).selectOption('human');
 await page.getByLabel('Set seviyesi',{exact:true}).selectOption('4');await page.getByRole('button',{name:'Seti kuşan',exact:true}).click();
 await page.screenshot({path:'output/armor-sample-mobile.png',fullPage:true});
 assert.equal(await page.evaluate(()=>JSON.stringify(localStorage)),before);assert.deepEqual(errors,[]);
 console.log(`PASS: ${checks} individual armor equip/unequip checks; mixed tiers with all weapons and both races; both views and saves preserved.`);
} finally {await browser.close()}
