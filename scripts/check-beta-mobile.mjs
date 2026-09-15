import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.NYXIA_PLAYWRIGHT||'C:/Users/akcel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
const base=process.env.NYXIA_CHECK_URL||'http://127.0.0.1:5176/nyxia-online/';
try {
 const page=await browser.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/beta-harness.html',route=>route.fulfill({contentType:'text/html',body:'<html><head></head><body><div id="root"></div></body></html>'}));
 await page.goto(base+'beta-harness.html');
 await page.evaluate(async()=>{
  const refresh=await import('/nyxia-online/@react-refresh');refresh.default.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>t=>t;window.__vite_plugin_react_preamble_installed__=true;
  const React=(await import('/nyxia-online/node_modules/.vite/deps/react.js')).default;
  const {createRoot}=(await import('/nyxia-online/node_modules/.vite/deps/react-dom_client.js')).default;
  const {default:Inventory}=await import('/nyxia-online/src/components/InventoryTab.jsx');
  const {default:Screen}=await import('/nyxia-online/src/components/ScreenPanel.jsx');
  const {default:Global}=await import('/nyxia-online/src/components/GlobalStyle.jsx');
  const {initialPlayer,equipItem,totalStats,playerDef}=await import('/nyxia-online/src/utils/player.js');
  const {CLASSES}=await import('/nyxia-online/src/data/classes.js');
  const {default:Battle}=await import('/nyxia-online/src/components/BattleTab.jsx');
  const {gmBuildArmor,gmWeaponTemplates,gmBuildWeaponById}=await import('/nyxia-online/src/utils/loot.js');
  const h=React.createElement,root=createRoot(document.querySelector('#root'));
  window.showCharacter=(cls,race,battle=false)=>{
   let p={...initialPlayer(cls,race,'Beta'),level:65,awakened:true,stats:{str:255,dex:255,int:255,mag:255,sta:60}};
   const weapon=gmWeaponTemplates(cls).find(w=>w.name===({warrior:'Iron Impact',rogue:"Eagle's Eye",mage:'Elysium'}[cls]));
   p=equipItem(p,gmBuildWeaponById(cls,weapon.id,8)).player;
   for(const slot of ['head','chest','legs','gauntlets','boots'])p=equipItem(p,gmBuildArmor(cls,slot,4,8)).player;
   function Demo(){const [player,setPlayer]=React.useState(p),[bank,setBank]=React.useState([[],[],[]]);return h(React.Fragment,null,h(Global),h('div',{style:{height:'100%',maxWidth:420,margin:'auto',display:'flex',flexDirection:'column',background:'#0b0c10',color:'#eee'}},h('header',{style:{height:90,flexShrink:0}},'Beta — '+cls+' / '+race),h(Screen,{screen:battle?'battle':'inventory'},battle?h(Battle,{player,setPlayer,cls:CLASSES[cls],def:playerDef(player),atk:totalStats(player).atk,pushToast:()=>{}}):h(Inventory,{player,setPlayer,bank,setBank,pushToast:()=>{}})),h('footer',{style:{height:64,flexShrink:0}},'Dünya · Savaş · Envanter')))}
   root.render(h(Demo,{key:cls+race}));
  };
 });
 await mkdir('output',{recursive:true});
 for(const [width,height] of [[360,640],[390,844],[430,932]])for(const cls of ['warrior','rogue','mage'])for(const race of ['human','karus']){
  await page.setViewportSize({width,height});await page.evaluate(({cls,race})=>window.showCharacter(cls,race),{cls,race});
  await page.waitForSelector(`svg[data-character="${race}-${cls}"]`);
  await page.evaluate(()=>Promise.all([...document.querySelectorAll('svg image')].map(el=>new Promise(resolve=>{const img=new Image();img.onload=resolve;img.onerror=resolve;img.src=el.getAttribute('href')}))));
  const result=await page.evaluate(()=>{const portrait=document.querySelector('.paperdoll-character-equipped'),figure=portrait.querySelector('svg'),p=portrait.getBoundingClientRect(),f=figure.getBoundingClientRect();return {pageOverflow:document.documentElement.scrollHeight>innerHeight+1,centerError:Math.abs((p.top+p.bottom-f.top-f.bottom)/2),equipment:document.querySelector('.equipment-layout').getBoundingClientRect().bottom,viewport:document.querySelector('[data-screen]').getBoundingClientRect().bottom};});
  assert.equal(result.pageOverflow,false);assert.ok(result.centerError<4,JSON.stringify(result));assert.ok(result.equipment<=result.viewport,JSON.stringify(result));
  if(width===390)await page.screenshot({path:`output/beta-${race}-${cls}.png`});
  await page.getByRole('button',{name:/^Çanta/}).click();
  await page.getByRole('button',{name:'Depo',exact:true}).click();
  await page.getByRole('button',{name:'Kuşanılmış',exact:true}).click();
  await page.locator('.equipment-layout [title^="Göğüslük:"]').click();
  await page.getByRole('button',{name:'Çıkar',exact:true}).click();
  assert.ok(!(await page.locator('svg[data-character]').getAttribute('data-armor-slots')).split(',').includes('chest'));
 }
 await page.setViewportSize({width:360,height:640});await page.evaluate(()=>window.showCharacter('warrior','human',true));
 await page.getByRole('button',{name:'Savaşı Başlat',exact:true}).first().click();
 await page.waitForSelector('.battle-mobile');
 await page.screenshot({path:'output/beta-battle-small.png'});
 const battleFits=await page.locator('.battle-action-dock').evaluate(el=>el.getBoundingClientRect().bottom<=document.querySelector('[data-screen]').getBoundingClientRect().bottom);
 assert.ok(battleFits,'Battle actions must fit in the phone viewport');
 assert.deepEqual(errors,[]);console.log('PASS: 18 mobile equipment layouts, equip/unequip, small-phone battle controls, no page overflow or browser errors.');
} finally {await browser.close()}
