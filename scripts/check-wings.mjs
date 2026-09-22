import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.NYXIA_PLAYWRIGHT||'C:/Users/akcel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:360,height:740}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/chrome-harness.html',r=>r.fulfill({contentType:'text/html',body:'<html><body><div id="root"></div></body></html>'}));
 await page.goto('http://127.0.0.1:5177/nyxia-online/chrome-harness.html');
 await page.evaluate(async()=>{
  const refresh=await import('/nyxia-online/@react-refresh');refresh.default.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>t=>t;window.__vite_plugin_react_preamble_installed__=true;
  const React=(await import('/nyxia-online/node_modules/.vite/deps/react.js')).default;
  const {createRoot}=(await import('/nyxia-online/node_modules/.vite/deps/react-dom_client.js')).default;
  const {default:Global}=await import('/nyxia-online/src/components/GlobalStyle.jsx');
  const {default:Hub}=await import('/nyxia-online/src/components/Hub.jsx');
  const {default:Ticker}=await import('/nyxia-online/src/components/NoticeTicker.jsx');
  const {LanguageProvider}=await import('/nyxia-online/src/i18n/LanguageContext.jsx');
  const {initialPlayer}=await import('/nyxia-online/src/utils/player.js');
  const {styles}=await import('/nyxia-online/src/styles.js');
  const h=React.createElement,root=createRoot(document.querySelector('#root'));
  function App(){
   const [player,setPlayer]=React.useState({...initialPlayer('warrior','human','Nyxia'),level:65,diamonds:10000,tutorialSeen:true,firstPurchaseBonusClaimed:true,dailyLogin:{streak:1,lastClaimDay:new Date().toDateString()}});
   const [tab,setTab]=React.useState('market'),[bank,setBank]=React.useState([]),[gold,setGold]=React.useState(0),[notice,setNotice]=React.useState(null),[lang,setLang]=React.useState('tr');
   window.currentPlayer=player;window.updatePlayer=setPlayer;window.setNotice=setNotice;window.setLang=setLang;window.setTab=setTab;
   return h(LanguageProvider,{lang,setLang},h(Global),h('div',{style:styles.appRoot},notice?h('button',{className:'game-notice',style:{display:'flex',gap:8,padding:12,width:'100%',marginTop:20}},h(Ticker,null,notice),h('span',null,'02:59')):h(Hub,{player,setPlayer,tab,setTab,bank,setBank,bankGold:gold,setBankGold:setGold,username:'VisualQA',pushToast:()=>{},onChangeCharacter:()=>{},onChangeRace:()=>{},onOpenSettings:()=>{},unlockedSlots:3,onUnlockSlot:()=>{}})));
  }
  root.render(h(App));
 });
 await mkdir('output',{recursive:true});await page.locator('.fantasy-dock').waitFor();await page.waitForTimeout(500);


 await page.locator('.diamond-store-entry').click();
 await page.locator('.wings-shop').waitFor();
 const flight=page.locator('.wing-preview .wing-flight').first();
 const before=await flight.evaluate(e=>getComputedStyle(e).transform);
 await page.waitForTimeout(350);
 assert.notEqual(await flight.evaluate(e=>getComputedStyle(e).transform),before);
 assert.equal(await page.locator('.wing-choices .wing-flight').first().evaluate(e=>getComputedStyle(e).animationName),'none');
 await page.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await flight.evaluate(e=>getComputedStyle(e).animationName),'none');
 await page.emulateMedia({reducedMotion:'no-preference'});

 for(const width of [360,320]){
  await page.setViewportSize({width,height:740});
  await page.screenshot({path:`output/wings-store-${width}.png`});
  assert.equal(await page.locator('.diamond-store').evaluate(e=>e.scrollWidth>e.clientWidth+1),false);
 }
 // Choosing a design is only a preview, never an equip or payment.
 await page.getByRole('button',{name:'Buz Ankası',exact:true}).click();
 assert.equal(await page.evaluate(()=>currentPlayer.diamonds),10000);
 assert.equal(await page.evaluate(()=>currentPlayer.equipped.wings),null);
 await page.locator('.wing-buy').click();
 await page.locator('.wing-purchase-confirm').getByRole('button',{name:'Satın al',exact:true}).click();
 assert.equal(await page.evaluate(()=>currentPlayer.diamonds),8000);
 assert.equal(await page.evaluate(()=>currentPlayer.inventory.filter(i=>i.kind==='wings').length),1);
 assert.equal(await page.locator('.wing-buy').isDisabled(),true);
 for(const label of ['Premium','Destekler','Elmas Al']){
  await page.locator('.diamond-store-tabs').getByRole('button',{name:label,exact:true}).click();
  await page.screenshot({path:`output/wing-store-${label.replaceAll(' ','-')}.png`});
 assert.equal(await page.locator('.diamond-store').evaluate(e=>e.scrollWidth>e.clientWidth+1),false);
 }
 await page.locator('.diamond-store-tabs').getByRole('button',{name:'Premium',exact:true}).click();
 await page.locator('.premium-shop .rpg-card button').first().click();
 assert.equal(await page.evaluate(()=>currentPlayer.premium.tier),'mythic');
 assert.equal(await page.evaluate(()=>currentPlayer.diamonds),5000);
 await page.locator('.premium-shop .rpg-row button').first().click();
 assert.equal(await page.evaluate(()=>currentPlayer.diamonds),4500);
 assert.equal(await page.evaluate(()=>currentPlayer.inventory.some(i=>i.kind==='raceScroll')),true);
 await page.getByRole('button',{name:'Kapat',exact:true}).click();
 await page.evaluate(()=>setTab('inventory'));
 await page.locator('.equipment-layout').waitFor();
 // Use the real bag and equip actions.
 await page.locator('[data-screen="inventory"] .wing-art[data-wing-art="frost"]').last().click({force:true});
 await page.getByRole('button',{name:'Kuşan',exact:true}).click();
 assert.equal(await page.evaluate(()=>currentPlayer.equipped.wings.wingId),'frost');
 assert.equal(await page.locator('.paperdoll-character [data-equipped-wings]').count(),1);
 await page.screenshot({path:'output/wings-equipped.png'});
 await page.locator('.wing-slot').click();
 await page.getByRole('button',{name:'Çıkar',exact:true}).click();
 assert.equal(await page.evaluate(()=>currentPlayer.equipped.wings),null);
 assert.equal(await page.locator('.paperdoll-character [data-equipped-wings]').count(),0);
 // All six identities: same back slot, no foreground duplicate or clipped view box.
 for(const cls of ['warrior','rogue','mage'])for(const race of ['human','karus']){
  await page.evaluate(async({cls,race})=>{
   const {initialPlayer}=await import('/nyxia-online/src/utils/player.js');
   const {makeWings}=await import('/nyxia-online/src/utils/wings.js');
   const {gmBuildArmor}=await import('/nyxia-online/src/utils/loot.js');
   const p={...currentPlayer,...initialPlayer(cls,race,'Wing QA'),level:65,tutorialSeen:true,firstPurchaseBonusClaimed:true};
   p.equipped.wings=makeWings(cls==='mage'?'twilight':cls==='rogue'?'grove':'dawn');
   for(const slot of ['chest','head','legs','gauntlets','boots'])p.equipped[slot]=gmBuildArmor(cls,slot,4,7);
   updatePlayer(p);
  },{cls,race});
  await page.waitForTimeout(150);
  await page.locator('.equipment-layout').screenshot({path:`output/wing-${race}-${cls}.png`});
  assert.equal(await page.locator('.paperdoll-character [data-equipped-wings]').count(),1);
 }
 assert.deepEqual(errors,[]);console.log('PASS: store sections at 320/360; preview, 2000-diamond purchase, inventory equip/remove and six character identities.');
}finally{await browser.close();}
