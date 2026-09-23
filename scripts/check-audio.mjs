import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/akcel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
const base='http://127.0.0.1:5177/nyxia-online/';
const errors=[];const samples=[];
try{
 const context=await browser.newContext();context.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));
 await context.route('**/audio-harness.html',r=>r.fulfill({contentType:'text/html',body:'<button id="start">Play</button>'}));
 const page=await context.newPage();await page.goto(base+'audio-harness.html');
 await page.evaluate(async()=>{
 const OriginalAudio=window.Audio;window.createdAudio=[];
 window.Audio=class extends OriginalAudio{constructor(...args){super(...args);createdAudio.push(this);}};
 const {createBgMusicEngine}=await import('/nyxia-online/src/audio/bgMusic.js');window.engine=createBgMusicEngine();engine.setMuted(true);
 document.querySelector('#start').onclick=()=>engine.start();
 });
 await page.click('#start');assert.equal(await page.evaluate(()=>createdAudio.length),0,'muted music must not fetch or allocate audio');
 await page.evaluate(()=>engine.setMuted(false));
 await page.waitForFunction(()=>createdAudio[0]?.currentTime>.15);
 const metadata=await page.evaluate(()=>({duration:createdAudio[0].duration,loop:createdAudio[0].loop}));assert.ok(metadata.duration>159&&metadata.duration<161);assert.equal(metadata.loop,true);
 await page.click('#start');assert.equal(await page.evaluate(()=>createdAudio.length),1,'gesture retries cannot create multiple music players');
 await page.evaluate(()=>engine.setMuted(true));assert.equal(await page.evaluate(()=>createdAudio[0].paused),true);
 await page.evaluate(()=>engine.setMuted(false));await page.waitForFunction(()=>!createdAudio[0].paused);
 await page.evaluate(()=>engine.setVolume(0));assert.equal(await page.evaluate(()=>createdAudio[0].paused),true);
 await page.evaluate(()=>engine.setVolume(.3));await page.waitForFunction(()=>!createdAudio[0].paused);
 await page.evaluate(()=>engine.stop());assert.equal(await page.evaluate(()=>createdAudio[0].paused),true);
 await page.close();
 const app=await context.newPage();await app.addInitScript(()=>{const A=window.Audio;window.musicElements=[];window.Audio=class extends A{constructor(...args){super(...args);musicElements.push(this);}};});
 await app.goto(base);await app.getByRole('button',{name:'Ayarlar',exact:true}).click();
 await app.waitForFunction(()=>musicElements.some(a=>a.currentTime>.1));
 await app.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 assert.equal(await app.evaluate(()=>musicElements.every(a=>a.paused)),true,'background app must pause music');
 await app.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
 await app.waitForFunction(()=>musicElements.some(a=>!a.paused));await app.close();
 const silent=await context.newPage();await silent.goto(base+'audio-harness.html');
 assert.equal(await silent.evaluate(async()=>{window.audioAllocations=0;window.AudioContext=class{constructor(){window.audioAllocations++;throw Error('Audio must not allocate while muted');}};const s=await import('/nyxia-online/src/audio/sfx.js');s.setSfxMuted(true);s.playUi();s.playHit();return audioAllocations;}),0);await silent.close();
 const cases=[['playHit',{cls:'warrior'}],['playHit',{cls:'rogue'}],['playHit',{cls:'mage'}],['playHurt'],['playMiss'],['playUpgradeSuccess'],['playUpgradeFail'],['playLevelUp'],['playChest',false],['playChest',true],['playForge'],['playPotion'],['playUi'],['mix']];
 for(const cls of ['warrior','rogue','mage'])for(let i=1;i<=13;i++)cases.push(['skill',`${cls[0]==='r'?'r':cls[0]}${i}`,cls]);
 let maxPeak=0;
 for(const [name,arg,cls] of cases){
  const p=await context.newPage();await p.goto(base+'audio-harness.html');
  const result=await p.evaluate(async({name,arg,cls,save})=>{
   window.AudioContext=class extends OfflineAudioContext{constructor(){super(2,41600,32000);window.renderContext=this;}resume(){return Promise.resolve();}};
   const sfx=await import('/nyxia-online/src/audio/sfx.js');
   if(name==='mix'){sfx.playHit({cls:'warrior',crit:true});sfx.playHurt();sfx.playUpgradeSuccess();sfx.playLevelUp();sfx.playChest(true);}else if(name==='skill'){const {SKILLS_BY_CLASS}=await import('/nyxia-online/src/data/skills.js');sfx.playSkill(SKILLS_BY_CLASS[cls].find(s=>s.id===arg),cls);}else sfx[name](arg);
   const buffer=await renderContext.startRendering(),data=buffer.getChannelData(0);let peak=0,sum=0,tail=0;
   for(let i=0;i<data.length;i++){peak=Math.max(peak,Math.abs(data[i]));sum+=data[i]*data[i];if(i>data.length-1000)tail=Math.max(tail,Math.abs(data[i]));}
   return {peak,rms:Math.sqrt(sum/data.length),tail,samples:save?Array.from(data):null};
  },{name,arg,cls,save:name!=='skill'});
  assert.ok(result.peak>0&&result.peak<.99,`${name} ${arg} peak ${result.peak}`);assert.ok(result.rms>.0001);assert.ok(result.tail<.001,`${name} must end cleanly`);maxPeak=Math.max(maxPeak,result.peak);if(result.samples)samples.push(...result.samples);await p.close();
 }
 await mkdir('output',{recursive:true});
 const wav=Buffer.alloc(44+samples.length*2);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(32000,24);wav.writeUInt32LE(64000,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(samples.length*2,40);samples.forEach((x,i)=>wav.writeInt16LE(Math.round(x*32767),44+i*2));await writeFile('output/nyxia-effects-preview.wav',wav);
 assert.deepEqual(errors,[]);console.log(`PASS: streamed music start/mute/resume/zero volume/cleanup, ${cases.length} rendered sound cases, peak ${maxPeak.toFixed(3)}, finite audible samples and clean tails; no browser errors.`);
}finally{await browser.close();}
