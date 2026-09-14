import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('C:/Users/akcel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const b=await chromium.launch({channel:'msedge',headless:true});
try{
 const p=await b.newPage({viewport:{width:390,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(process.env.NYXIA_CHECK_URL||'http://127.0.0.1:5175/nyxia-online/character-check.html');
 const before=await p.evaluate(()=>JSON.stringify(localStorage));
 for(const race of ['human','karus'])for(const weapon of ['Rusty Sword','Large Hacker','Weight Hammer']){
  await p.getByLabel('Irk',{exact:true}).selectOption(race);await p.getByLabel('Silah',{exact:true}).selectOption(weapon);
  const source=await p.locator('.character-figure').first().locator('image').first().getAttribute('href');
  for(const [slot,suffix] of [['head','Helmet'],['chest','Pauldron'],['legs','Pads'],['gauntlets','Gauntlet'],['boots','Boots']]){
   const button=p.getByRole('button',{name:'Chitin Armor '+suffix,exact:true});await button.click();
   for(const view of await p.locator('.character-figure').all()){
    assert.equal(await view.getAttribute('data-armor-slots'),slot);assert.equal(await view.getAttribute('data-weapon'),weapon);
    assert.equal(await view.locator('image').first().getAttribute('href'),source);
   }
   await button.click();assert.equal(await p.locator('.character-figure').first().getAttribute('data-look'),'cloth-base');
  }
 }
 for(const suffix of ['Helmet','Pauldron','Pads','Gauntlet','Boots'])await p.getByRole('button',{name:'Chitin Armor '+suffix,exact:true}).click();
 await p.getByLabel('Silah',{exact:true}).selectOption('Rusty Sword');await p.getByLabel('Upgrade',{exact:true}).selectOption('8');
 assert.equal(await p.locator('.character-figure [data-element="temper"]').count(),2);
 assert.equal(await p.locator('[data-item-art="Rusty Sword"]').count(),1);
 await p.screenshot({path:'output/armor-sample-mobile.png',fullPage:true});
 assert.equal(await p.evaluate(()=>JSON.stringify(localStorage)),before);assert.deepEqual(errors,[]);
 console.log('PASS: 30 equip/unequip checks, both views, unchanged weapon image and save; +8 starter sheen and mobile sample.');
}finally{await b.close()}
