import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require('C:/Users/akcel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/reward-audit.html',r=>r.fulfill({contentType:'text/html',body:'<meta name="viewport" content="width=device-width,initial-scale=1"><div id="root"></div>'}));
 await page.goto('http://127.0.0.1:5177/nyxia-online/reward-audit.html');
 await page.evaluate(async()=>{const r=await import('/nyxia-online/@react-refresh');r.default.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>t=>t;window.__vite_plugin_react_preamble_installed__=true;await import('/nyxia-online/tests/social-ui.jsx')});
 await page.evaluate(()=>socialView('rewards'));await page.locator('section').nth(5).waitFor();
 await page.evaluate(()=>Promise.all([...document.querySelectorAll('svg image')].map(i=>new Promise((ok,bad)=>{const im=new Image();im.onload=ok;im.onerror=bad;im.src=i.getAttribute('href')}))));
 await page.screenshot({path:'output/first-purchase-rewards.png',fullPage:true});
 if(errors.length)throw Error(errors.join('\n'));console.log('PASS: six reward poses and icons load without browser errors');
} finally {await browser.close()}
