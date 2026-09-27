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
 if(p.endsWith('account'))d={id:2,name:'smtcnts',revision:14,snapshots:[],data:{diamonds:2000,bankGold:1000,characters:[{id:'a',name:'Savaşçı',classId:'warrior',race:'human',gold:500,level:20,xp:300},null,null]}};
 return r.fulfill({contentType:'application/json',body:JSON.stringify(d)});
});
for(const [width,height] of [[1440,1000],[390,844],[320,568]]){
 await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:5188/nyxia-online/owner.html');await page.locator('.hero').waitFor();
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`dashboard ${width}`);
 await page.screenshot({path:`output/owner-${width}.png`,fullPage:true});
 for(const name of ['Oyuncular','Sohbet denetimi','Klanlar','Pazar','Düellolar','İşlem geçmişi']){
  await page.getByRole('button',{name,exact:true}).click();await page.getByRole('button',{name:'Yenile',exact:true}).waitFor();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${name} ${width}`);
 }
 await page.getByRole('button',{name:'Oyuncular',exact:true}).click();await page.getByRole('button',{name:/smtcnts/}).click();await page.getByText('Hesap kaynakları').waitFor();
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`editor ${width}`);
 await page.getByText('Gelişmiş kayıt düzenleyici',{exact:false}).click();await page.getByLabel('Karakter kayıt JSON').fill('{bad');
 await page.getByLabel('İşlem açıklaması').fill('test');await page.getByRole('button',{name:'Değişiklikleri kaydet',exact:true}).click();await page.getByText('JSON geçersiz.',{exact:false}).waitFor();
}
assert.deepEqual(errors,[]);console.log('Owner UI: desktop, 390px, 320px; all sections and JSON validation passed.');
}finally{await browser.close();}

