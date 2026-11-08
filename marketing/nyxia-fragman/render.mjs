import{createRequire}from'node:module';import{spawn}from'node:child_process';import{once}from'node:events';
// Depo kökünden çalıştırın: Vite 5188 portunda açık olmalı. Önce build-audio.mjs ile sesi üretin.
const require=createRequire(import.meta.url),ffmpeg=process.env.NYXIA_FFMPEG||'ffmpeg',{chromium}=require(process.env.NYXIA_PLAYWRIGHT||'playwright');
const FPS=24,SECONDS=36,FRAMES=FPS*SECONDS,OUT='marketing/nyxia-fragman/nyxia-fragman-1080x1920.mp4';
const enc=spawn(ffmpeg,['-y','-loglevel','error','-f','image2pipe','-vcodec','mjpeg','-framerate',String(FPS),'-i','pipe:0','-i','marketing/nyxia-fragman/fragman-audio.wav','-vf','scale=in_range=pc:out_range=tv,format=yuv420p','-color_range','tv','-c:v','libx264','-preset','slow','-crf','18','-c:a','aac','-b:a','160k','-t',String(SECONDS),'-movflags','+faststart',OUT],{windowsHide:true});
let err='';enc.stderr.on('data',d=>err+=d);const done=once(enc,'close');
const b=await chromium.launch({channel:process.env.NYXIA_BROWSER||'msedge',headless:true});
try{const p=await b.newPage({viewport:{width:540,height:960},deviceScaleFactor:2});p.on('pageerror',e=>{throw e});
 await p.goto(process.env.NYXIA_VIDEO_URL||'http://127.0.0.1:5188/nyxia-online/marketing/nyxia-fragman/index.html');
 await p.waitForFunction(()=>typeof window.frame==='function');await p.waitForTimeout(2000);
 for(let f=0;f<FRAMES;f++){await p.evaluate(t=>{window.frame(t);for(const a of document.getAnimations()){a.pause();a.currentTime=/breathe/.test(a.animationName||'')?t*1000:0;}},f/FPS);const buf=await p.screenshot({type:'jpeg',quality:93});if(!enc.stdin.write(buf))await once(enc.stdin,'drain');if(f%96===0)console.log(`${f}/${FRAMES} kare`);}
 enc.stdin.end();const[code]=await done;if(code)throw Error(err);console.log('BİTTİ:',OUT);
}finally{await b.close()}
