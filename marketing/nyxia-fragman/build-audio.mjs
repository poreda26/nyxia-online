// Fragman sesi: oyunun kendi müziği + üretilmiş vuruş (boom), gerilim yükselişi ve çan sesleri. Dış ses dosyası kullanılmaz.
import{spawnSync}from'node:child_process';
const ffmpeg=process.env.NYXIA_FFMPEG||'ffmpeg',out='marketing/nyxia-fragman/fragman-audio.wav';
const hits=[3200,7200,11200,15200,19200,23200,27200];// sahne geçişleri; sonuncusu kahramanlar
const parts=[
 '[2:a]lowpass=f=260,afade=t=out:st=0:d=2.4[bn]',
 '[1:a][bn]amix=inputs=2:normalize=0,volume=1.1,aformat=channel_layouts=stereo[boom]',
 `[boom]asplit=${hits.length}${hits.map((_,i)=>`[b${i}]`).join('')}`,
 ...hits.map((ms,i)=>`[b${i}]adelay=${ms}|${ms},volume=${i===hits.length-1?1.25:.9}[d${i}]`),
 '[3:a]highpass=f=600,lowpass=f=6000,afade=t=in:st=0:d=2.4:curve=exp,volume=.5,aformat=channel_layouts=stereo,adelay=24800|24800[r]',
 '[4:a]aformat=channel_layouts=stereo,adelay=31700|31700[c]',
 '[0:a]atrim=0:36,asetpts=PTS-STARTPTS,volume=.7,afade=t=in:d=1.5,afade=t=out:st=34:d=2,aformat=channel_layouts=stereo[m]',
 `[m]${hits.map((_,i)=>`[d${i}]`).join('')}[r][c]amix=inputs=${hits.length+3}:normalize=0:duration=longest,alimiter=limit=0.9,volume=.9,atrim=0:36[out]`,
];
const args=['-y','-loglevel','error',
 '-i','src/assets/audio/mist-valley.mp3',
 '-f','lavfi','-i','aevalsrc=sin(2*PI*t*(38+120*exp(-t*9)))*exp(-t*2.6):s=44100:d=2.4',
 '-f','lavfi','-i','anoisesrc=d=2.4:c=brown:a=0.6',
 '-f','lavfi','-i','anoisesrc=d=2.4:c=white:a=0.5',
 '-f','lavfi','-i','aevalsrc=(sin(2*PI*660*t)+0.5*sin(2*PI*990*t)+0.3*sin(2*PI*1320*t))*exp(-t*1.4)*0.3:s=44100:d=3.5',
 '-filter_complex',parts.join(';'),'-map','[out]','-ar','44100','-c:a','pcm_s16le',out];
const r=spawnSync(ffmpeg,args,{encoding:'utf8',windowsHide:true});
if(r.status)throw Error(r.stderr);
console.log('ses hazır:',out);
