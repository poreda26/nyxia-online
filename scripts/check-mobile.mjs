import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium,webkit}=require(process.env.NYXIA_PLAYWRIGHT||'C:/Users/akcel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await (process.env.NYXIA_ENGINE==='webkit'?webkit.launch({headless:true}):chromium.launch({channel:'msedge',headless:true}));
try{
 const page=await browser.newPage({viewport:{width:360,height:740},isMobile:true,hasTouch:true,deviceScaleFactor:1}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/chrome-harness.html',r=>r.fulfill({contentType:'text/html',body:'<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"></head><body><div id="root"></div></body></html>'}));
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
  const {default:Settings}=await import('/nyxia-online/src/components/SettingsModal.jsx');
  const {loadSettings,saveSetting,applyDisplaySettings}=await import('/nyxia-online/src/utils/settings.js');
  const {makeScrollStack,makeBonusScrollStack,makeAccessoryScrollStack}=await import('/nyxia-online/src/utils/inventory.js');
  const {makeBoostScrollStack}=await import('/nyxia-online/src/utils/boosts.js');
  const {default:ItemIcon}=await import('/nyxia-online/src/components/ItemIcon.jsx');
  const {default:ChestModal}=await import('/nyxia-online/src/components/ChestModal.jsx');
  const h=React.createElement,root=createRoot(document.querySelector('#root'));
  function App(){
   const [prefs,setPrefs]=React.useState(loadSettings),[open,setOpen]=React.useState(false),[gallery,setGallery]=React.useState(false);
   React.useEffect(()=>applyDisplaySettings(prefs),[prefs]);
   const update=(k,v)=>{saveSetting(k,v);setPrefs(p=>({...p,[k]:v}));if(k==='language')setLang(v);};
   window.openSettings=()=>setOpen(true);window.closeSettings=()=>setOpen(false);window.showAssets=()=>setGallery(true);window.readPrefs=loadSettings;
   const settings=open?h(Settings,{preferences:prefs,onPreferenceChange:update,musicVolume:prefs.musicVolume,musicMuted:prefs.musicMuted,onMusicVolumeChange:v=>update('musicVolume',v),onToggleMusicMute:()=>update('musicMuted',!prefs.musicMuted),sfxVolume:prefs.sfxVolume,sfxMuted:prefs.sfxMuted,onSfxVolumeChange:v=>update('sfxVolume',v),onToggleSfxMute:()=>update('sfxMuted',!prefs.sfxMuted),lang:prefs.language,onLangChange:v=>update('language',v),theme:prefs.theme,onThemeChange:v=>update('theme',v),onClose:()=>setOpen(false)}):null;
   const [player,setPlayer]=React.useState({...initialPlayer('warrior','human','Nyxia'),level:65,diamonds:1000,tutorialSeen:true,firstPurchaseBonusClaimed:true,dailyLogin:{streak:1,lastClaimDay:new Date().toDateString()}});
   const [tab,setTab]=React.useState('captain'),[bank,setBank]=React.useState([]),[gold,setGold]=React.useState(0),[notice,setNotice]=React.useState(null),[lang,setLang]=React.useState('tr');
   window.currentPlayer=player;window.updatePlayer=setPlayer;window.setNotice=setNotice;window.setLang=setLang;window.setTab=setTab;
   return h(LanguageProvider,{lang,setLang},h(Global),settings,gallery?h('div',{style:{background:'#141923',color:'#fff',padding:16,display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}},...['exp','gold','atk','np','def','hp'].map(id=>h('div',{key:id},h(ItemIcon,{item:{kind:'boostScroll',boostId:id},size:70}),id)),...Array.from({length:6},(_,i)=>h('div',{key:'s'+i},h(ItemIcon,{item:{kind:'scroll',tier:i+1},size:70}),'T'+(i+1))),h(ItemIcon,{item:{kind:'bonusScroll'},size:70}),h(ItemIcon,{item:{kind:'accessoryScroll'},size:70}),...[1,3,5,6].map(tier=>h(ItemIcon,{key:'c'+tier,item:{kind:'chest',tier},size:70})),h(ItemIcon,{item:{kind:'chest',special:true,tier:6},size:70})):h('div',{style:styles.appRoot},notice?h('button',{className:'game-notice',style:{display:'flex',gap:8,padding:12,width:'100%',marginTop:20}},h(Ticker,null,notice),h('span',null,'02:59')):h(Hub,{player,setPlayer,tab,setTab,bank,setBank,bankGold:gold,setBankGold:setGold,username:'VisualQA',pushToast:()=>{},onChangeCharacter:()=>{},onChangeRace:()=>{},onOpenSettings:()=>setOpen(true),unlockedSlots:3,onUnlockSlot:()=>{}})));
  }
  root.render(h(App));
 });
 await mkdir('output',{recursive:true});await page.locator('.fantasy-dock').waitFor();await page.waitForTimeout(500);


 const sizes=[[320,568],[360,640],[390,844],[430,932],[768,1024],[844,390],[568,320]];
 for(const [width,height] of sizes){
  await page.setViewportSize({width,height});
  await page.waitForFunction(height=>Math.abs(parseFloat(document.documentElement.style.getPropertyValue("--app-height"))-height)<2,height);
  for(const tab of ['battle','inventory','market','upgrade','captain','clan','warzone','chat','character']){
   await page.evaluate(tab=>setTab(tab),tab);await page.waitForTimeout(70);
   const screen=page.locator('[data-screen="'+tab+'"]');
   const overflow=await screen.locator(':scope > div').evaluate(e=>({sw:e.scrollWidth,cw:e.clientWidth}));
   assert.ok(overflow.sw<=overflow.cw+1,`${width}x${height} ${tab}: ${JSON.stringify(overflow)}`);
   const dock=await page.locator('.fantasy-dock').boundingBox();assert.ok(dock.y>=0&&dock.y+dock.height<=height+1,`dock clipped ${width}x${height} ${tab}: ${JSON.stringify(dock)} ${JSON.stringify(await page.evaluate(()=>({h:innerHeight,vh:visualViewport.height,scale:visualViewport.scale,app:document.documentElement.style.getPropertyValue('--app-height')})))}`);
  }
  await page.evaluate(()=>openSettings());
  const dialog=page.getByRole('dialog');await dialog.waitFor();
  for(const label of ['Ses ve titreşim','Görünüm','Oyun rehberi']){
   await page.locator('.settings-tabs').getByRole('button',{name:label,exact:true}).click();
   const bounds=await dialog.boundingBox();assert.ok(bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=width+1&&bounds.y+bounds.height<=height+1,`settings clipped ${width} ${height}`);
   assert.equal(await dialog.evaluate(e=>e.scrollWidth>e.clientWidth+1),false);
   if(width===390||height===320)await page.screenshot({path:`output/mobile-settings-${width}-${height}-${label.replaceAll(' ','-')}.png`});
  }
  await page.keyboard.press('Escape');await dialog.waitFor({state:'detached'});
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>openSettings());
 await page.getByRole('switch',{name:/Titreşim/}).uncheck();
 assert.equal(await page.evaluate(()=>readPrefs().haptics),false);
 await page.locator('.settings-tabs').getByRole('button',{name:'Görünüm',exact:true}).click();
 await page.getByRole('switch',{name:/Hareketi azalt/}).check();
 await page.getByRole('switch',{name:/Yüksek kontrast/}).check();
 await page.getByRole('button',{name:'Düşük',exact:true}).click();
 assert.equal(await page.evaluate(()=>readPrefs().effects),'low');assert.equal(await page.evaluate(()=>document.documentElement.dataset.motion),'reduced');
 await page.keyboard.press('Escape');await page.evaluate(()=>openSettings());
 await page.locator('.settings-tabs').getByRole('button',{name:'Görünüm',exact:true}).click();
 assert.equal(await page.getByRole('switch',{name:/Hareketi azalt/}).isChecked(),true);
 await page.locator('.settings-tabs').getByRole('button',{name:'Oyun rehberi',exact:true}).click();
 await page.getByRole('button',{name:'Oyun rehberini aç',exact:true}).click();
 await page.screenshot({path:'output/mobile-tutorial.png'});

 await page.evaluate(()=>{closeSettings();setTab('inventory');});
 await page.evaluate(async()=>{
  const {makeScrollStack,makeBonusScrollStack}=await import('/nyxia-online/src/utils/inventory.js');
  updatePlayer(p=>({...p,inventory:[makeScrollStack(5,3),makeBonusScrollStack()],chests:[{id:'qa-chest',tier:5}]}));
 });
 await page.setViewportSize({width:320,height:568});
 await page.locator('[data-screen="inventory"] [data-scroll-art="scroll"]').first().click();
 const sheet=page.locator('div[style*="border-top-left-radius: 18px"]');await sheet.waitFor();
 let bounds=await sheet.boundingBox();assert.ok(bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=321&&bounds.y+bounds.height<=569,JSON.stringify(bounds));
 await page.screenshot({path:'output/mobile-item-sheet.png'});
 // iOS can shrink only the visual viewport, leaving the layout viewport unchanged.
 await page.evaluate(()=>document.documentElement.style.setProperty('--app-height','340px'));
 bounds=await sheet.boundingBox();assert.ok(bounds.y>=0&&bounds.y+bounds.height<=341,'visual viewport sheet clipped');
 await page.evaluate(()=>document.documentElement.style.setProperty('--app-height','568px'));
 await page.mouse.click(3,3);
 await page.evaluate(()=>setTab('chat'));await page.setViewportSize({width:390,height:340});
 const input=page.locator('.rpg-chat-compose input');await input.focus();
 await page.waitForTimeout(100);bounds=await input.boundingBox();assert.ok(bounds.y>=0&&bounds.y+bounds.height<=340,'keyboard input clipped');
 assert.ok(parseFloat(await input.evaluate(e=>getComputedStyle(e).fontSize))>=16);
 await page.screenshot({path:'output/mobile-keyboard.png'});
 await page.evaluate(()=>showAssets());await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);
 await page.screenshot({path:'output/mobile-assets.png'});
 const real=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 real.on('pageerror',e=>errors.push(e.message));
 await real.goto('http://127.0.0.1:5177/nyxia-online/');
 await real.getByRole('button',{name:'Ayarlar',exact:true}).click();
 await real.locator('.settings-tabs').getByRole('button',{name:'Görünüm',exact:true}).click();
 await real.getByRole('switch',{name:/Yüksek kontrast/}).check();
 await real.reload();
 await real.waitForFunction(()=>document.documentElement.dataset.contrast==='high');
 await real.close();
 assert.deepEqual(errors,[]);
 console.log('PASS: 9 screens and settings at 7 portrait/landscape/tablet sizes; preferences persisted; reduced-motion/effects/haptics and tutorial controls.');
}finally{await browser.close();}
