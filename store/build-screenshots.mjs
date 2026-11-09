// Google Play ekran görüntüleri: gerçek oyun ekranlarına başlık ekler (1080x1920, 9:16).
// Kullanım (depo kökünden): node store/build-screenshots.mjs   (Playwright ve msedge gerekir; NYXIA_PLAYWRIGHT ile yol verilebilir)
import{createRequire}from'node:module';import{mkdirSync,readFileSync}from'node:fs';import{fileURLToPath,pathToFileURL}from'node:url';
const require=createRequire(import.meta.url),{chromium}=require(process.env.NYXIA_PLAYWRIGHT||'playwright');
const root=fileURLToPath(new URL('./',import.meta.url));
const SETS={
 tr:{dir:'screenshots',lang:'tr',items:[
  ['01-savas.png','Altı bölge,<br>sayısız canavar'],
  ['02-zindan.png','Boss ve zindan<br>savaşları'],
  ['03-envanter.png','Karakterini kuşan,<br>kanat tak'],
  ['04-karakter.png','Üç sınıf:<br>Warrior, Rogue, Mage'],
  ['05-klan.png','Klanını kur,<br>ortak depoyu kullan'],
  ['06-yukselt.png','Silahını ve zırhını<br>+8’e yükselt']]},
 en:{dir:'screenshots/en',lang:'en',items:[
  ['01-battle.png','Six regions,<br>countless monsters'],
  ['02-dungeon.png','Fight bosses<br>and dungeons'],
  ['03-inventory.png','Equip your hero<br>and wings'],
  ['04-character.png','Three classes:<br>Warrior, Rogue, Mage'],
  ['05-clan.png','Build a clan with<br>a shared vault'],
  ['06-captain.png','Quests, daily rewards<br>and the monster book']]}
};
const html=(img,caption)=>`<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box}body{margin:0;width:1080px;height:1920px;overflow:hidden;font-family:Georgia,'Times New Roman',serif;background:radial-gradient(ellipse at 50% 0%,#3a1f66 0%,#1a1033 38%,#0a0814 100%);position:relative}
.glow{position:absolute;left:140px;top:360px;width:800px;height:1500px;border-radius:90px;box-shadow:0 0 220px 40px #8a5cff44}
.brand{position:absolute;top:70px;left:0;right:0;text-align:center;font:700 30px Arial,sans-serif;letter-spacing:12px;color:#d8b86e}
.cap{position:absolute;top:128px;left:40px;right:40px;text-align:center;font-weight:700;font-size:84px;line-height:1.08;color:#fff3d6;text-shadow:0 4px 24px #000}
.phone{position:absolute;left:155px;top:410px;width:770px;height:1540px;border-radius:64px;border:5px solid #c9a65c;overflow:hidden;background:#000;box-shadow:0 30px 80px #000c}
.phone img{display:block;width:100%;height:100%;object-fit:cover;object-position:top}
</style></head><body><div class="brand">NYXIA ONLINE</div><div class="cap">${caption}</div><div class="glow"></div><div class="phone"><img src="${img}"></div></body></html>`;
const b=await chromium.launch({channel:process.env.NYXIA_BROWSER||'msedge',headless:true});
try{
 for(const[name,set]of Object.entries(SETS)){
  mkdirSync(`${root}screenshots-v2/${name}`,{recursive:true});
  const p=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
  let n=0;
  for(const[file,caption]of set.items){
   n++;const src='data:image/png;base64,'+readFileSync(`${root}${set.dir}/${file}`).toString('base64');
   await p.setContent(html(src,caption),{waitUntil:'load'});await p.waitForTimeout(250);
   await p.screenshot({path:`${root}screenshots-v2/${name}/${String(n).padStart(2,'0')}.png`});
  }
  await p.close();console.log(name,'hazır:',n,'görsel');
 }
}finally{await b.close();}
