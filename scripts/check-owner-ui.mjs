import {dropMetadata} from '../server/drop-settings.mjs';
import {DEFAULT_DROP_CONFIG} from '../src/data/dropRules.js';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium}=require('C:/Users/akcel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/api/**',r=>{
 const p=new URL(r.request().url()).pathname;let d=[];
 if(p.endsWith('overview'))d={owner:'poreda26',accounts:128,sessions:24,clans:8,stalls:17};
 if(p.endsWith('accounts'))d=[{id:2,name:'smtcnts',revision:14,updated:Date.now()}];
 if(p.endsWith('drops')){const data=structuredClone(DEFAULT_DROP_CONFIG);data.maps[dropMetadata.maps[0].id].monsters[dropMetadata.maps[0].monsters[0].id].loot=[{key:dropMetadata.catalog[0].key,weight:1,level:1}];d={...dropMetadata,data,revision:0,history:[]};}
 if(p.endsWith('account'))d={id:2,name:'smtcnts',revision:14,snapshots:[],data:{diamonds:2000,bankGold:1000,characters:[{id:'a',nickname:'Savaşçı',class:'warrior',race:'elmorad',gold:500,level:20,xp:300,inventory:[{id:'test-sword',name:'Rusty Sword',kind:'weapon',class:'warrior',upgradeLevel:7,atk:23}],equipped:{}},null,null]}};
 return r.fulfill({contentType:'application/json',body:JSON.stringify(d)});
});
for(const [width,height] of [[1440,1000],[390,844],[320,568]]){
 await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:5188/nyxia-online/owner.html');await page.locator('.hero').waitFor();
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`dashboard ${width}`);
 await page.screenshot({path:`output/owner-${width}.png`,fullPage:true});
 for(const name of ['Oyuncular','Drop ve sandıklar','Ban ve mute','Sohbet denetimi','Klanlar','Pazar','Düellolar','İşlem geçmişi']){
  await page.getByRole('button',{name,exact:true}).click();await page.getByRole('button',{name:'Yenile',exact:true}).waitFor();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${name} ${width}`);
 }
 await page.getByRole('button',{name:'Oyuncular',exact:true}).click();await page.getByRole('button',{name:/smtcnts/}).click();await page.getByText('Hesap kaynakları').waitFor();
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`editor ${width}`);
 await page.getByRole('button',{name:/Rusty Sword/}).click();await page.getByText('Tüm özellikler ve kimlik').waitFor();
 await page.screenshot({path:`output/admin-inventory-${width}.png`,fullPage:true});
 await page.getByText('Gelişmiş kayıt düzenleyici',{exact:false}).click();await page.getByLabel('Karakter kayıt JSON').fill('{bad');
 await page.getByLabel('İşlem açıklaması').fill('test');await page.getByRole('button',{name:'Değişiklikleri kaydet',exact:true}).click();await page.getByText('JSON geçersiz.',{exact:false}).waitFor();
 await page.getByRole('button',{name:'Drop ve sandıklar',exact:true}).click();await page.getByRole('button',{name:'Sandıklar',exact:true}).click();
 await page.locator('.loot-tile-grid[aria-label="Drop eşyaları"] .loot-tile').first().click();
 await page.getByRole('button',{name:'Listeden çıkar',exact:true}).click();
 await page.getByText('ÖZEL HAVUZ',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Eşya ekle',exact:true}).click();
 await page.getByLabel('Eşya kataloğunda ara').fill(dropMetadata.catalog[0].name);
 await page.getByRole('button',{name:`${dropMetadata.catalog[0].name} ekle`,exact:true}).click();
 await page.getByRole('button',{name:'Kopyala',exact:true}).click();
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`pool ${width}`);
 await page.screenshot({path:`output/admin-drops-${width}.png`,fullPage:true});
 await page.getByRole('button',{name:'Canavarlar',exact:true}).click();
 await page.locator('.loot-tile-grid[aria-label="Drop eşyaları"] .loot-tile').click();
 await page.getByRole('button',{name:'Listeden çıkar',exact:true}).click();
 await page.getByText('Bu canavar eşya düşürmeyecek',{exact:true}).waitFor();
 page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Yapıştır',exact:true}).click();
 assert.ok(await page.locator('.loot-tile-grid[aria-label="Drop eşyaları"] .loot-tile').count()>1);
 page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Varsayılan',exact:true}).click();
 await page.getByText('VARSAYILAN HAVUZ',{exact:true}).waitFor();

}
assert.deepEqual(errors,[]);console.log('Owner UI: desktop, 390px, 320px; all sections and JSON validation passed.');
}finally{await browser.close();}

