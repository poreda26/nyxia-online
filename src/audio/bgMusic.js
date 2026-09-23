import themeUrl from '../assets/audio/mist-valley.mp3';
import {ensureAudioStarted} from './audioContext';

// Stream the original 160-second score instead of synthesizing hundreds of
// voices on the phone. Web Audio gain also supports volume control on iOS.
export function createBgMusicEngine() {
 let audio=null, ctx=null, source=null, gain=null, wanted=false;
 let volume=.55, muted=false, request=0;
 function init() {
  if(audio)return;
  audio=new Audio(themeUrl);audio.loop=true;audio.preload='none';
  audio.setAttribute('playsinline','');
  ctx=ensureAudioStarted();
  if(ctx){source=ctx.createMediaElementSource(audio);gain=ctx.createGain();source.connect(gain);gain.connect(ctx.destination);}
  applyVolume();
 }
 function applyVolume(){
  const value=muted?0:volume;
  if(gain)gain.gain.setTargetAtTime(value,ctx.currentTime,.12);
  else if(audio)audio.volume=value;
 }
 function sync(){
  if(!audio)return;
  if(!wanted||muted||volume===0){request++;audio.pause();return;}
  ensureAudioStarted();
  if(!audio.paused)return;
  const version=++request;
  const promise=audio.play();
  promise?.then(()=>{if(version===request&&(!wanted||muted||volume===0))audio.pause();}).catch(()=>{});
  // A denied autoplay can be retried on the next real user gesture.
 }
 return {
  start(){wanted=true;if(!muted&&volume>0)init();sync();},
  stop(){wanted=false;request++;if(audio){audio.pause();audio.removeAttribute('src');audio.load();}source?.disconnect();gain?.disconnect();audio=null;source=null;gain=null;},
  setVolume(value){volume=Number.isFinite(value)?Math.max(0,Math.min(1,value)):0;applyVolume();if(wanted&&!audio&&!muted&&volume>0)init();sync();},
  setMuted(value){muted=!!value;applyVolume();if(wanted&&!audio&&!muted&&volume>0)init();sync();},
  isPlaying(){return !!audio&&!audio.paused&&!muted&&volume>0;},
 };
}
