import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium}=require('C:/Users/akcel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'),sharp=require('C:/Users/akcel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[],sent=[];let clan=null,messages=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/api/**',async route=>{
  const req=route.request(),path=new URL(req.url()).pathname;let data=[];
  if(req.method()!=='GET'){
   const body=req.postDataJSON();sent.push({path,body});
   if(path==='/api/clan')clan={id:1,name:body.name,avatarId:body.avatarId,color:'#d4af6a',myRole:'leader',createdAt:Date.now(),buildingLevel:1,treasury:{gold:0,diamonds:0,np:0},myDonatedNp:0,members:[{accountId:1,name:'Test',avatarId:'human-warrior',cls:'warrior',level:1,role:'leader',donatedNp:0}]};
   if(path==='/api/clan/avatar')clan.avatarId=body.avatarId;
   if(path==='/api/chat/messages')messages.push({...body,id:messages.length+1,createdAt:Date.now()});
   data={ok:true};
  }else if(path==='/api/clan/mine')data={clan};else if(path==='/api/chat/messages')data=messages;else if(path==='/api/social/friends')data={friends:[],incoming:[],outgoing:[]};
  await route.fulfill({contentType:'application/json',body:JSON.stringify(data)});
 });
 await page.route('**/social-audit.html',r=>r.fulfill({contentType:'text/html',body:'<meta name="viewport" content="width=device-width,initial-scale=1"><div id="root"></div>'}));
 await page.goto('http://127.0.0.1:5177/nyxia-online/social-audit.html');
 await page.evaluate(async()=>{const r=await import('/nyxia-online/@react-refresh');r.default.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>t=>t;window.__vite_plugin_react_preamble_installed__=true;await import('/nyxia-online/tests/social-ui.jsx')});
 await page.locator('.battle-figure').waitFor();await page.evaluate(()=>Promise.all([...document.querySelectorAll('svg image')].map(i=>new Promise(ok=>{const im=new Image();im.onload=ok;im.src=i.getAttribute('href')}))));
 await page.screenshot({path:'output/avatars-and-giant.png',fullPage:true});
 const alphaStyle=await page.addStyleTag({content:'*{animation:none!important;transition:none!important}html,body,#root,#root>div{background:transparent!important}.battle-figure{filter:none!important}'});
 const {data,info}=await sharp(await page.locator('.battle-figure').screenshot({omitBackground:true})).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const scale=info.width/388,offset=info.height-329*scale;
 const alpha=(x,y)=>data[(Math.round((y-757)*scale+offset)*info.width+Math.round((x-1060)*scale))*4+3];
 assert.equal(alpha(1090,1010),0,'neighbor reptile tail must be absent');assert.ok(alpha(1280,950)>180,'giant torso must remain visible');
 await alphaStyle.evaluate(e=>e.remove());
 await page.evaluate(()=>socialView('chat'));await page.locator('.avatar-customize summary').click();await page.getByTitle('Human Rogue',{exact:true}).click();
 assert.equal(await page.evaluate(()=>socialPlayer.avatarId),'human-rogue');
 await page.locator('.rpg-chat-compose input').fill('Avatar test');await page.locator('.rpg-chat-compose button').click();
 await page.waitForFunction(()=>document.querySelector('.rpg-chat-msg [data-avatar="human-rogue"]'));
 assert.equal(sent.find(s=>s.path==='/api/chat/messages').body.avatarId,'human-rogue');
 await page.evaluate(()=>socialView('clan'));await page.getByRole('button',{name:/Klan kur/i}).first().click();
 await page.locator('.clan-found-form input').fill('Ay Muhafızları');await page.getByTitle('Ejder',{exact:true}).click();await page.locator('.clan-found-form>button').click();
 await page.locator('.clan-hero [data-avatar="dragon"]').waitFor();
 assert.equal(sent.find(s=>s.path==='/api/clan').body.avatarId,'dragon');
 for(const width of [320,390,430]){await page.setViewportSize({width,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'horizontal overflow');await page.screenshot({path:`output/clan-${width}.png`,fullPage:true});}
 await page.locator('.avatar-customize summary').click();await page.getByTitle('Anka',{exact:true}).click();await page.locator('.clan-hero [data-avatar="phoenix"]').waitFor();
 assert.deepEqual(errors,[]);console.log('PASS: Nadas tail alpha regression; avatar/chat payload; clan creation/change; 320/390/430 layouts; no browser errors');
}finally{await browser.close()}
