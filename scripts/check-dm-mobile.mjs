import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium}=require('C:/Users/akcel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),errors=[],sent=[];
 page.on('pageerror',e=>errors.push(e.message));
 const friends=Array.from({length:8},(_,i)=>({accountId:i+1,name:`UzunKarakterAdı_${i+1}_EjderMuhafızı`,lastMessageAt:Date.now()-1000}));
 let gets=0;
 await page.route('**/api/**',async route=>{
  const req=route.request(),path=new URL(req.url()).pathname;let data=[];
  if(path.endsWith('/social/friends'))data={friends,incoming:[{id:1,fromName:'ArkadaşİsteğiUzunİsim'}],outgoing:[]};
  else if(path.endsWith('/social/suggestions'))data=friends.map(f=>({...f,avatarId:'paint-dragon',level:65,mutualFriends:2}));
  else if(path.includes('/social/messages/')){
   const account=Number(path.split('/').at(-1));
   if(req.method()==='POST'){sent.push({account,...req.postDataJSON()});data={ok:true};}
   else{gets++;data=[{id:account,mine:false,text:`Arkadaş ${account}: Birlikte zindana girelim mi? `+'UzunMesaj'.repeat(12),avatarId:'paint-dragon',frameId:'sun',createdAt:Date.now()-10000},{id:account+100,mine:true,text:'Hazırım!',avatarId:'pixel-dwarf',frameId:'frost',createdAt:Date.now()-5000}];}
  }else if(path.endsWith('/clan/mine'))data={clan:null};else if(path.endsWith('/market/stall'))data={stall:null};else if(path.endsWith('/market/stalls'))data={stalls:[]};
  await route.fulfill({contentType:'application/json',body:JSON.stringify(data)});
 });
 await page.route('**/dm-harness.html',r=>r.fulfill({contentType:'text/html',body:'<meta name="viewport" content="width=device-width,initial-scale=1"><div id="root"></div>'}));
 await page.goto('http://127.0.0.1:5177/nyxia-online/dm-harness.html');
 await page.evaluate(async()=>{const r=await import('/nyxia-online/@react-refresh');r.default.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>t=>t;window.__vite_plugin_react_preamble_installed__=true;await import('/nyxia-online/tests/mobile-ui.jsx')});
 await page.locator('.fantasy-dock').waitFor();await page.evaluate(()=>setTab('chat'));
 await page.locator('.conversation-chip').nth(7).waitFor();
 await page.locator('.conversation-select').first().click();await page.getByText(/Arkadaş 1:/).waitFor();
 await page.locator('.rpg-chat-compose input').fill('Birinci arkadaşa taslak');
 await page.locator('.conversation-select').nth(1).click();await page.getByText(/Arkadaş 2:/).waitFor();
 assert.equal(await page.locator('.rpg-chat-compose input').inputValue(),'');
 await page.locator('.conversation-select').first().click();assert.equal(await page.locator('.rpg-chat-compose input').inputValue(),'Birinci arkadaşa taslak');
 await page.locator('.rpg-chat-compose button').click();await page.waitForFunction(()=>document.querySelector('.rpg-chat-compose input').value==='');
 assert.equal(sent[0].account,1);
 for(const [width,height] of [[320,568],[390,844],[430,932],[844,390],[390,340]]){
  await page.setViewportSize({width,height});await page.locator('.rpg-chat-compose input').focus();
  await page.waitForFunction(h=>Math.abs(parseFloat(document.documentElement.style.getPropertyValue('--app-height'))-h)<2,height);
  const bounds=await page.locator('.rpg-chat-compose input').boundingBox();assert.ok(bounds.y>=0&&bounds.y+bounds.height<=height,`composer clipped ${width}x${height}`);
  assert.ok(await page.locator('[data-screen="chat"]>div').evaluate(e=>e.scrollWidth<=e.clientWidth+1));
  const dock=await page.locator('.fantasy-dock').boundingBox();assert.ok(bounds.y+bounds.height<=dock.y+1,'composer behind navigation');
  assert.ok(await page.locator('.rpg-chat-compose input').evaluate(e=>{const r=e.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===e}),'input covered');
  await page.screenshot({path:`output/dm-${width}-${height}.png`});
 }
 assert.ok(gets<12,`DM polling loop: ${gets}`);
 await page.locator('.conversation-close').first().click();assert.equal(await page.locator('.conversation-chip').count(),7);
 await page.setViewportSize({width:320,height:568});await page.evaluate(()=>setTab('friends'));await page.locator('.friends-panel .rpg-row').first().waitFor();
 assert.ok(await page.locator('[data-screen="friends"]>div').evaluate(e=>e.scrollWidth<=e.clientWidth+1));await page.screenshot({path:'output/friends-320.png'});
 assert.deepEqual(errors,[]);console.log('PASS: eight incoming DM tabs, separate drafts, correct recipient, close, bounded polling, friends and keyboard/landscape layouts');
}finally{await browser.close()}
