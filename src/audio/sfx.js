// Original, short layered Foley and magic. No downloaded sound samples.
import {getAudioContext,ensureAudioStarted,getNoiseBuffer} from './audioContext';
import {hapticHit,hapticHurt,hapticSuccess,hapticError,hapticLevelUp} from '../utils/haptics';
let master=null, volume=.6, muted=false;
const last=new Map();
function bus(key){
 if(muted||volume<=0)return null;
 const ctx=ensureAudioStarted();if(!ctx)return null;
 if(ctx.currentTime-(last.get(key)??-10)<.055)return null;
 last.set(key,ctx.currentTime);
 if(!master){
  master=ctx.createGain();master.gain.value=volume;
  const limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-14;limiter.knee.value=12;limiter.ratio.value=5;limiter.attack.value=.003;limiter.release.value=.12;
  master.connect(limiter);limiter.connect(ctx.destination);
 }
 return ctx;
}
function envelope(ctx,time,dur,level,attack=.008){
 const g=ctx.createGain();g.gain.setValueAtTime(0,time);g.gain.linearRampToValueAtTime(level,time+attack);g.gain.exponentialRampToValueAtTime(.0001,time+dur);g.gain.linearRampToValueAtTime(0,time+dur+.012);g.connect(master);return g;
}
function tone(ctx,time,freq,end,dur,level,type='sine'){
 const osc=ctx.createOscillator(),g=envelope(ctx,time,dur,level);osc.type=type;osc.frequency.setValueAtTime(freq,time);osc.frequency.exponentialRampToValueAtTime(Math.max(20,end),time+dur);osc.connect(g);osc.onended=()=>{osc.disconnect();g.disconnect();};osc.start(time);osc.stop(time+dur+.015);
}
function noise(ctx,time,freq,end,dur,level,q=.7){
 const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),g=envelope(ctx,time,dur,level,.012);src.buffer=getNoiseBuffer();filter.type='bandpass';filter.Q.value=q;filter.frequency.setValueAtTime(freq,time);filter.frequency.exponentialRampToValueAtTime(end,time+dur);src.connect(filter);filter.connect(g);src.onended=()=>{src.disconnect();filter.disconnect();g.disconnect();};src.start(time,Math.random()*.4);src.stop(time+dur+.015);
}
function chime(ctx,time,notes,level=.09,step=.085){
 notes.forEach((f,i)=>{tone(ctx,time+i*step,f,f,.42,level);tone(ctx,time+i*step,f*2.006,f*2,.19,level*.16);});
}
export function setSfxVolume(v){volume=Number.isFinite(v)?Math.max(0,Math.min(1,v)):0;if(master)master.gain.setTargetAtTime(muted?0:volume,getAudioContext().currentTime,.035);}
export function setSfxMuted(v){muted=!!v;if(master)master.gain.setTargetAtTime(muted?0:volume,getAudioContext().currentTime,.025);}
export function playHit({crit=false,cls='warrior'}={}){
 hapticHit(crit);const ctx=bus('hit');if(!ctx)return;const t=ctx.currentTime,v=crit?1.18:1,j=.97+Math.random()*.06;
 if(cls==='rogue'){
  tone(ctx,t,185*j,100,.12,.13,'triangle');noise(ctx,t+.015,2400,850,.17,.14);tone(ctx,t+.1,155,68,.13,.16);
 }else if(cls==='mage'){
  tone(ctx,t,390*j,780,.17,.07);tone(ctx,t+.05,590,290,.25,.09);noise(ctx,t+.07,1700,600,.22,.1);
 }else{
  noise(ctx,t,1700,500,.14,.19*v);tone(ctx,t+.045,172*j,62,.15,.2*v);
  [610,987,1423].forEach((f,i)=>tone(ctx,t+.05,f*j,f*j,.14+i*.045,.055*v/(i+1)));
 }
 if(crit)chime(ctx,t+.1,[740,988],.045,.025);
}
export function playMiss(){const ctx=bus('miss');if(ctx)noise(ctx,ctx.currentTime,1200,360,.21,.1);}
export function playHurt(){hapticHurt();const ctx=bus('hurt');if(!ctx)return;const t=ctx.currentTime+.18;noise(ctx,t,620,180,.17,.19);tone(ctx,t,125,46,.22,.2);}
export function playSkill(skill,cls){
 if(!skill)return;const type=skill.effect.type;
 if(type==='heal'){const ctx=bus('heal');if(ctx)chime(ctx,ctx.currentTime,[392,494,587],.08,.09);return;}
 if(type==='buffAtk'||type==='buffDef'){const ctx=bus('buff');if(ctx){const t=ctx.currentTime;noise(ctx,t,400,1300,.3,.09);chime(ctx,t,[196,294,392],.07,.065);}return;}
 if(cls==='warrior'){playHit({cls,crit:skill.effect.type==='execute'});return;}
 if(cls==='rogue'){playHit({cls});if(skill.effect.type==='dot'){const ctx=bus('poison');if(ctx)tone(ctx,ctx.currentTime+.08,360,190,.27,.045);}return;}
 hapticHit(false);const ctx=bus('spell');if(!ctx)return;const t=ctx.currentTime,n=Number(skill.id.slice(1));
 if([3,6,9].includes(n)){noise(ctx,t,600,1800,.23,.17);noise(ctx,t+.09,1100,160,.31,.2);tone(ctx,t+.1,115,47,.25,.15);}
 else if(n===5){[0,.055,.12].forEach((dt,i)=>{noise(ctx,t+dt,2400,850,.075,.16);tone(ctx,t+dt,900-i*140,310,.06,.065,'triangle');});}
 else if(n===7){chime(ctx,t,[784,1047,1319],.055,.045);noise(ctx,t,2900,1500,.24,.07);}
 else{tone(ctx,t,294,588,.2,.085);tone(ctx,t+.075,440,220,.32,.08);chime(ctx,t+.1,[587,880],.04,.06);}
}
export function playUpgradeSuccess(){hapticSuccess();const ctx=bus('upgrade');if(ctx)chime(ctx,ctx.currentTime,[392,494,587,784],.12,.075);}
export function playUpgradeFail(){hapticError();const ctx=bus('fail');if(ctx){tone(ctx,ctx.currentTime,220,164,.28,.13,'triangle');noise(ctx,ctx.currentTime,450,180,.23,.12);}}
export function playLevelUp(){hapticLevelUp();const ctx=bus('level');if(ctx){chime(ctx,ctx.currentTime,[294,392,494,587,784],.12,.105);tone(ctx,ctx.currentTime,98,98,.6,.12);}}
export function playUi(){const ctx=bus('ui');if(ctx){tone(ctx,ctx.currentTime,520,390,.055,.045);noise(ctx,ctx.currentTime,1400,900,.045,.025);}}
export function playChest(reveal=false){const ctx=bus(reveal?'treasure':'chest');if(!ctx)return;const t=ctx.currentTime;if(reveal)chime(ctx,t,[330,440,554,660],.1,.07);else{noise(ctx,t,320,750,.32,.14);tone(ctx,t,145,85,.18,.11,'triangle');}}
export function playForge(){const ctx=bus('forge');if(ctx){const t=ctx.currentTime;tone(ctx,t,420,405,.28,.09);tone(ctx,t,733,710,.18,.055);noise(ctx,t,1300,500,.12,.13);}}
export function playPotion(){const ctx=bus('potion');if(ctx){tone(ctx,ctx.currentTime,260,520,.12,.065);tone(ctx,ctx.currentTime+.09,340,680,.16,.055);}}
