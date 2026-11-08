// Fragman 2 sesi: oyunun kendi müziği (70. saniyeden) + üretilmiş vuruş, demir sesi, gerilim yükselişi ve bozuk para sesleri. Bitiş geçişinde itici çın yerine yumuşak, sıcak bir geçiş sesi vardır. Dış ses dosyası yok.
import{spawnSync}from'node:child_process';
const ffmpeg=process.env.NYXIA_FFMPEG||'ffmpeg',out='marketing/nyxia-fragman-2/fragman2-audio.wav',DUR=50.5;
// Sahne başlangıçları (sn): forge 4.6, klan 17.8, düello 26.8, pazar 36.3, bitiş 44.3
const booms=[[4600,.55],[13600,1.2],[17800,.9],[22600,.8],[26800,.9],[31800,1.3],[36300,.9]];// sahne geçişleri, yükseltme patlaması (13.6), boss kükremesi, düello çarpışması (31.8)
const clangs=[7600,8700,9800],risers=[11200,29400],tinkles=[37200,37550,37900,38250,38600],pads=[44300];
const parts=['[2:a]lowpass=f=260,afade=t=out:st=0:d=2.4[bn]','[1:a][bn]amix=inputs=2:normalize=0,volume=1.1,aformat=channel_layouts=stereo[boom]'];
const labels=[];
const fan=(src,label,items,fx)=>{parts.push(`${src}asplit=${items.length}${items.map((_,i)=>`[${label}${i}]`).join('')}`);items.forEach((it,i)=>{const ms=Array.isArray(it)?it[0]:it,vol=Array.isArray(it)?it[1]:1;parts.push(`[${label}${i}]${fx}adelay=${ms}|${ms},volume=${vol}[${label}d${i}]`);labels.push(`[${label}d${i}]`);});};
fan('[boom]','b',booms,'');
fan('[5:a]aformat=channel_layouts=stereo,','c',clangs.map(ms=>[ms,.8]),'');
fan('[3:a]highpass=f=600,lowpass=f=6000,afade=t=in:st=0:d=2.4:curve=exp,aformat=channel_layouts=stereo,','r',risers.map(ms=>[ms,.5]),'');
fan('[6:a]aformat=channel_layouts=stereo,','t',tinkles.map(ms=>[ms,.6]),'');
fan('[4:a]aformat=channel_layouts=stereo,lowpass=f=900,','h',pads.map(ms=>[ms,1]),'');
parts.push(`[0:a]atrim=0:${DUR},asetpts=PTS-STARTPTS,volume=.8,afade=t=in:d=1.5,afade=t=out:st=${DUR-2.5}:d=2.5,aformat=channel_layouts=stereo[m]`);
parts.push(`[m]${labels.join('')}amix=inputs=${labels.length+1}:normalize=0:duration=longest,alimiter=limit=0.9,volume=.9,atrim=0:${DUR}[out]`);
const args=['-y','-loglevel','error','-ss','70','-i','src/assets/audio/mist-valley.mp3',
 '-f','lavfi','-i','aevalsrc=sin(2*PI*t*(38+120*exp(-t*9)))*exp(-t*2.6):s=44100:d=2.4',
 '-f','lavfi','-i','anoisesrc=d=2.4:c=brown:a=0.6',
 '-f','lavfi','-i','anoisesrc=d=2.4:c=white:a=0.5',
 // yumuşak geçiş: yavaş yükselen, alçak ve sıcak üç ses (sol, si, sol), uzun sönümlü; keskin başlangıç yok
 '-f','lavfi','-i',"aevalsrc='(sin(2*PI*196*t)+0.7*sin(2*PI*246.94*t)+0.5*sin(2*PI*392*t))*min(t/1.6,1)*exp(-max(t-1.6,0)*0.5)*0.18':s=44100:d=6",
 '-f','lavfi','-i','aevalsrc=(sin(2*PI*880*t)+0.6*sin(2*PI*1397*t)+0.4*sin(2*PI*2216*t))*exp(-t*9)*0.5:s=44100:d=1.2',
 '-f','lavfi','-i','aevalsrc=(sin(2*PI*2093*t)+0.5*sin(2*PI*3136*t))*exp(-t*14)*0.25:s=44100:d=0.6',
 '-filter_complex',parts.join(';'),'-map','[out]','-ar','44100','-c:a','pcm_s16le',out];
const r=spawnSync(ffmpeg,args,{encoding:'utf8',windowsHide:true});
if(r.status)throw Error(r.stderr);
console.log('ses hazır:',out);
