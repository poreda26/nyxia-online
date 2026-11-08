import React,{useState}from'react';import{createRoot}from'react-dom/client';import{flushSync}from'react-dom';
import logo from '../../src/assets/brand/nyxia-logo.png';import regions from '../../src/assets/battle/regions-v1.png';import arena from '../../src/assets/battle/arena-v1.png';
import appleBadge from '../nyxia-fragman/badges/AppStore_icon_noCTA.svg';import googleBadge from '../nyxia-fragman/badges/GooglePlay_icon_noCTA.svg';
import{MonsterFigure}from'../../src/components/BattleScene';import{monsterAtlases}from'../../src/data/monsterPortraits';import{battleVisualFor}from'../../src/data/battleVisuals';
import CharacterFigure from'../../src/components/CharacterFigure';import ItemIcon from'../../src/components/ItemIcon';import{fixture}from'../../tests/balance-fixtures';import{makeWings}from'../../src/utils/wings';import{LanguageProvider}from'../../src/i18n/LanguageContext';
// Sinematik fragman 2: yükseltme gerilimi, klan ve boss, savaş alanı düellosu, oyuncu pazarı. Oyun arayüzü yok; oyunun kendi sanatı.
// Her sahne farklı zırh kademesi kullanır: klan T3 (+7), düello T4 (+7) ve T5 (+8), pazar karışık kademeler.
const build=(cls,tier,plus,race,wing)=>{const p={...fixture(cls,65,tier,plus),nickname:'Nyxia',race};p.equipped.wings=makeWings(wing);return p;};
const clanTrio=[build('warrior',3,7,'karus','ember'),build('rogue',3,7,'elmorad','twilight'),build('mage',3,7,'elmorad','frost')];
const duelists=[build('rogue',4,7,'elmorad','twilight'),build('warrior',5,8,'karus','frost')];
const gear=(cls,tier,plus,slot)=>fixture(cls,65,tier,plus).equipped[slot];
const shelf=[gear('mage',5,8,'mainHand'),gear('warrior',4,8,'mainHand'),gear('rogue',3,8,'mainHand'),gear('warrior',2,7,'chest'),gear('rogue',3,7,'head'),gear('mage',4,7,'legs'),gear('warrior',5,7,'gauntlets'),gear('rogue',5,8,'chest'),gear('mage',3,7,'boots'),gear('warrior',1,7,'head'),gear('rogue',4,8,'boots'),gear('mage',2,8,'chest')].filter(Boolean);
const FORGE_WEAPON={kind:'weapon',name:'Kavurucu Asa',tier:5};
const STARTS=[0,4.6,17.8,26.8,36.3,44.3,50.5];
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),ease=v=>1-Math.pow(1-clamp(v),3);
const shake=(l,at,dur=.35,amp=7)=>{const d=l-at;return d>=0&&d<dur?Math.sin(d*90)*(1-d/dur)*amp:0};
const win=(l,a,b,c,d)=>clamp((l-a)/(b-a))*clamp((d-l)/(d-c));// a→b girer, c→d çıkar
// Karakter efektleri oyunda gerçek saatle yanıp söner. Kare kare çekimde rastgele patlamasın diye silah parıltıları en parlak anda SABİTLENİR (+7/+8 belli olsun); yalnızca nefes alma zamana bağlıdır.
const PEAK={'weapon-pulse':.5,'weapon-flame':.25,'weapon-lightning':.45,'weapon-triad':.17,'poison-aura':.5,'ice-radiance':.5,'flame-radiance':.25,'lightning-radiance':.4,'armor-aura':.5,'armor-stars':.5};
window.settle=t=>{for(const a of document.getAnimations()){a.pause();const n=a.animationName||'';if(/breathe/.test(n)){a.currentTime=t*1000;continue;}const k=PEAK[n];if(k==null){a.currentTime=0;continue;}const ct=a.effect.getComputedTiming();a.currentTime=(ct.delay||0)+k*ct.duration;}};
const css=`*{box-sizing:border-box}body{margin:0;background:#000;color:#f6efdc;font-family:Georgia,'Times New Roman',serif}.film{position:relative;width:540px;height:960px;overflow:hidden;background:#000}.layer{position:absolute;inset:0}.armor-effect,.armor-sweep{display:none!important}.bgwrap{position:absolute;left:-210px;top:0;width:960px;height:960px;overflow:hidden}.bgcell{width:960px;height:960px;background-repeat:no-repeat;background-size:2880px 1920px}.vig{background:radial-gradient(ellipse at 50% 46%,transparent 38%,#000d 100%)}.ember{position:absolute;border-radius:50%}.flash{background:#fff4d8}.big{position:absolute;left:20px;right:20px;text-align:center;font-weight:700;line-height:1.18;text-shadow:0 3px 26px #000,0 0 3px #000}.sub{position:absolute;left:28px;right:28px;text-align:center;font-style:italic;line-height:1.25;text-shadow:0 2px 16px #000,0 0 3px #000}.fig .character-figure{width:100%;height:100%;filter:drop-shadow(0 14px 18px #000b)}.fig{position:absolute}.mon svg{display:block;width:100%;height:100%}.card{position:absolute;display:flex;align-items:center;justify-content:center;border:1px solid #c6a66188;border-radius:14px;background:linear-gradient(#1a140a,#0b0905);box-shadow:0 0 22px #e8bf7322}.endlogo{position:absolute;left:100px;top:190px;width:340px;height:280px;object-fit:contain;mix-blend-mode:screen}.soon{position:absolute;left:0;right:0;text-align:center}.badges{position:absolute;left:0;right:0;top:600px;display:flex;justify-content:center;align-items:center;gap:20px}.badges img{display:block;height:64px;width:auto}`;
const bossOf=map=>battleVisualFor({id:`map_boss_${map}`,isBoss:true});
function Embers({t,tint,n=26,speed=1}){return<div className="layer" style={{pointerEvents:'none'}}>{Array.from({length:n},(_,i)=>{const sp=(18+(i*7)%22)*speed,x=(i*83+Math.sin(t*.8+i)*14)%540,y=960-((i*131+t*sp*5)%1000)+40,s=3+(i%3);return<i key={i} className="ember" style={{left:x,top:y,width:s,height:s,background:tint,boxShadow:`0 0 8px ${tint}`,opacity:.12+.3*Math.abs(Math.sin(t*1.7+i))}}/>})}</div>}
function Bg({idx,zoom,bright=.6}){const col=idx%3,row=Math.floor(idx/3);return<div className="bgwrap"><div className="bgcell" style={{backgroundImage:`url(${regions})`,backgroundPosition:`${-col*960}px ${-row*960}px`,transform:`scale(${zoom})`,filter:`brightness(${bright}) saturate(1.1)`}}/></div>}
function Prologue({l,t}){const a=ease(l/1.2)*clamp((4.6-l)/.6);
 return<section className="layer" style={{background:'#000'}}><div className="layer" style={{background:`radial-gradient(ellipse at 50% 85%,rgba(150,60,10,${.3+.1*Math.sin(t*2)}),transparent 65%)`,opacity:a}}/><Embers t={t} tint="#ff8a3a" n={22}/>
  <div className="big" style={{top:410,fontSize:36,opacity:win(l,.4,1.2,2.6,3.2)}}>Güç bir gecede gelmez.</div>
  <div className="big" style={{top:410,fontSize:40,opacity:win(l,3.1,3.8,4.1,4.6),color:'#f3d79a'}}>Peki bedeli ne?</div></section>}
function Forge({l,len,t}){
 const op=Math.min(ease(l/.5),clamp((len-l)/.45)),ticks=[3,4.1,5.2,9];
 const lvl=l<3?4:l<4.1?5:l<5.2?6:l<9?7:8,last=ticks.filter(x=>l>=x).pop(),since=last==null?9:l-last,pop=since<.3?1+Math.sin(since/.3*Math.PI)*.14:1;
 const hold=l>=5.2&&l<9,amp=hold?(l-5.2)*1.5:0,sx=hold?Math.sin(l*70)*amp:0,sy=hold?Math.cos(l*83)*amp*.6:0,crack=hold?clamp((l-6)/2.6):0,burst=l>=9;
 const sh=shake(l,9,.5,9),halo=[.1,.2,.3,.45,.7][lvl-4]+(burst?Math.max(0,.4-(l-9)*.3):0),rays=lvl>=7?(lvl===8?.5:.28):0;
 return<section className="layer" style={{opacity:op,transform:`translate(${sh}px,${sh*.5}px)`,background:`radial-gradient(ellipse at 50% 52%,rgba(${burst?120:80},${burst?60:28},10,1),#0a0605 72%)`}}>
  <Embers t={t} tint="#ff9a3c" n={34} speed={1.6}/>
  <div className="layer" style={{background:`radial-gradient(circle at 50% 48%,rgba(255,170,70,${halo}),transparent 58%)`}}/>
  {rays>0&&<div style={{position:'absolute',left:-20,top:150,width:580,height:580,borderRadius:'50%',background:`repeating-conic-gradient(from ${l*7}deg at 50% 50%,rgba(255,205,120,${rays}) 0 4deg,transparent 4deg 18deg)`,WebkitMaskImage:'radial-gradient(circle,#000 18%,transparent 68%)',maskImage:'radial-gradient(circle,#000 18%,transparent 68%)'}}/>}
  <div style={{position:'absolute',left:100,top:290,width:340,height:340,display:'flex',alignItems:'center',justifyContent:'center',transform:`translate(${sx}px,${sy}px) scale(${pop*(burst?1.05:1)})`,filter:`drop-shadow(0 0 ${12+(lvl-4)*12+(burst?34:0)}px rgba(255,${lvl>=7?150:170},60,${.5+(lvl-4)*.12}))`}}>
   <div style={{width:326,height:326,borderRadius:36,overflow:"hidden",border:"2px solid rgba(232,191,115,"+(.45+(lvl-4)*.13)+")",boxShadow:"inset 0 0 40px rgba(255,150,50,"+(.1+(lvl-4)*.08)+")"}}><ItemIcon item={{...FORGE_WEAPON,upgradeLevel:lvl}} size={326}/></div>
   <svg width="340" height="340" style={{position:'absolute',inset:0,opacity:crack}}><polyline points="170,6 150,70 188,130 142,200 184,262 158,334" stroke="#ffe7b0" strokeWidth="3" fill="none"/><polyline points="188,130 236,150 252,206" stroke="#ffd48a" strokeWidth="2" fill="none"/></svg>
  </div>
  {ticks.map(tk=>{const d=l-tk;if(d<0||d>.7)return null;return Array.from({length:16},(_,i)=>{const a=i*Math.PI/8+tk,r=d*(tk>8?520:300);return<i key={tk+'-'+i} className="ember" style={{left:270+Math.cos(a)*r-3,top:460+Math.sin(a)*r-3,width:6,height:6,background:'#ffd98a',boxShadow:'0 0 10px #ffb347',opacity:1-d/.7}}/>})})}
  <div style={{position:'absolute',left:0,right:0,top:660,textAlign:'center',fontSize:96,fontWeight:700,color:burst?'#fff1c2':'#f3d79a',textShadow:`0 0 ${burst?50:24}px rgba(255,170,60,.8)`,transform:`scale(${pop})`}}>+{lvl}</div>
  <div className="big" style={{top:112,fontSize:46,opacity:win(l,.5,1.3,2.7,3.3)}}>Sekiz basamak.</div>
  <div className="sub" style={{top:180,fontSize:26,opacity:win(l,1.6,2.3,2.7,3.3)}}>Her basamakta bir risk.</div>
  <div className="big" style={{top:112,fontSize:46,opacity:win(l,5.4,6.1,8.7,9)}}>Ya yükselir…</div>
  <div className="big" style={{top:178,fontSize:46,opacity:win(l,6.8,7.5,8.7,9),color:'#ff9a7a'}}>…ya kırılır.</div>
  <div className="sub" style={{top:790,fontSize:30,opacity:win(l,7.8,8.4,8.7,9)}}>Sen basar mıydın?</div>
  <div className="big" style={{top:122,fontSize:44,opacity:win(l,9.6,10.3,12.4,13),color:'#f3d79a'}}>Bu sefer yükseldi.</div>
  <div className="layer vig"/><div className="layer flash" style={{opacity:burst?Math.max(0,.9-(l-9)*2.2):0}}/></section>}
function Clan({l,len,t}){
 const op=Math.min(ease(l/.5),clamp((len-l)/.45)),sh=shake(l,0,.35,6)+shake(l,4.8,.5,9),reveal=ease((l-.3)/1.3),art=bossOf('crimson_battlefront');
 const bump=l>4.8&&l<5.3?.02*Math.sin((l-4.8)/.5*Math.PI):0;
 return<section className="layer" style={{opacity:op,transform:`translate(${sh}px,${sh*.5}px)`}}>
  <Bg idx={5} zoom={1.05+l*.014} bright={.55}/><div className="layer" style={{background:'linear-gradient(#000b,transparent 36%,transparent 60%,#000d)'}}/>
  <div className="mon" style={{position:'absolute',left:30,top:250,width:480,height:520,opacity:reveal,transform:`scale(${.95+l*.005+bump})`,transformOrigin:'50% 100%',filter:`brightness(${.1+.9*reveal}) drop-shadow(0 0 26px rgba(255,70,50,${.5*reveal}))`}}><MonsterFigure rect={art.rect} outline={art.clip} label="Boss" source={monsterAtlases[art.atlas]} size={art.size}/></div>
  <Embers t={t} tint="#ff5a3a" n={26}/>
  {clanTrio.map((p,i)=>{const d=ease((l-2.2-i*.25)/.8),x=[-6,146,298][i],w=[250,260,250][i];return<div key={p.class} className="fig" style={{left:x,width:w,height:[390,420,390][i],bottom:34,opacity:d,transform:`translateY(${(1-d)*90}px)`,zIndex:i===1?2:1}}><CharacterFigure player={p}/></div>})}
  <div className="layer vig"/>
  <div className="big" style={{top:84,fontSize:40,opacity:win(l,.8,1.5,4.6,5.2),color:'#f3d79a'}}>Bazı canavarlar<br/>tek başına yenilmez.</div>
  <div className="big" style={{top:112,fontSize:42,opacity:win(l,5.2,5.9,8.2,8.7)}}>Yanına kimi alırdın?</div>
  <div className="layer flash" style={{opacity:Math.max(0,.45-l*2.8)}}/></section>}
function Duel({l,len,t}){
 const op=Math.min(ease(l/.5),clamp((len-l)/.45)),clash=5,close=ease((l-1)/4),back=l>clash?ease((l-clash)/.5)*14:0,sh=shake(l,clash,.5,11),d=l-clash;
 return<section className="layer" style={{opacity:op,transform:`translate(${sh}px,${sh*.5}px)`}}>
  <img src={arena} style={{position:'absolute',left:-583,top:0,height:960,width:'auto',filter:'brightness(.5) saturate(1.1)'}}/><div className="layer" style={{background:'linear-gradient(#000b,transparent 38%,transparent 60%,#000c)'}}/>
  <Embers t={t} tint="#8fd3ff" n={22}/>
  {[0,1].map(k=>{const dir=k===0?-1:1,p=duelists[k],enter=ease((l-.2)/.9),x=k===0?(-34-(1-close)*70-back):(236+(1-close)*70+back);return<div key={p.class} className="fig" style={{left:x+dir*(1-enter)*280,width:340,height:530,bottom:110,opacity:enter}}><CharacterFigure player={p}/></div>})}
  {d>=0&&d<.9&&<div style={{position:'absolute',left:270-d*340,top:610-d*340,width:d*680,height:d*680,borderRadius:'50%',border:'3px solid #fff1c2',opacity:1-d/.9,boxShadow:'0 0 40px #ffd98a'}}/>}
  {d>=0&&d<.8&&Array.from({length:18},(_,i)=>{const a=i*Math.PI/9,r=d*420;return<i key={i} className="ember" style={{left:270+Math.cos(a)*r-3,top:610+Math.sin(a)*r*.7-3,width:6,height:6,background:'#fff1c2',boxShadow:'0 0 10px #ffd98a',opacity:1-d/.8}}/>})}
  <div className="layer vig"/>
  <div className="big" style={{top:92,fontSize:46,opacity:win(l,.7,1.4,8.6,9.2),color:'#f3d79a'}}>Savaş Alanı.</div>
  <div className="sub" style={{top:158,fontSize:27,opacity:win(l,1.8,2.5,4.7,5.2)}}>Bu hafta zirvede<br/>kim olacak?</div>
  <div className="sub" style={{top:158,fontSize:28,opacity:win(l,5.6,6.3,8.6,9.2),color:'#8fd3ff'}}>En iyiler elmas kazanır.</div>
  <div className="layer flash" style={{opacity:d>=0?Math.max(0,.75-d*3.2):0}}/></section>}
function Market({l,len,t}){
 const op=Math.min(ease(l/.5),clamp((len-l)/.45));
 return<section className="layer" style={{opacity:op,background:'radial-gradient(ellipse at 50% 55%,#3f2c0c,#0a0805 72%)'}}>
  {Array.from({length:34},(_,i)=>{const y=((i*97+t*150)%1100)-90,x=(i*61+Math.sin(t+i)*18)%540,s=8+(i%4)*3;return<i key={i} className="ember" style={{left:x,top:y,width:s,height:s,background:'radial-gradient(circle at 35% 30%,#fff3b8,#e8b73a 60%,#9a6a14)',boxShadow:'0 0 8px #e8b73a88',opacity:.8}}/>})}
  {shelf.map((it,i)=>{const c=i%4,r=Math.floor(i/4),d=ease((l-.9-i*.15)/.5);return<div key={it.name+i} className="card" style={{left:29+c*124,top:300+r*124,width:110,height:110,opacity:d,transform:`scale(${.7+.3*d})`}}><ItemIcon item={it} size={84}/></div>})}
  <div className="layer vig"/>
  <div className="big" style={{top:78,fontSize:33,opacity:win(l,.5,1.2,4,4.6)}}>Aradığın eşya,<br/>başka bir oyuncunun<br/>tezgâhında olabilir.</div>
  <div className="big" style={{top:92,fontSize:48,opacity:win(l,4.6,5.3,7.4,8),color:'#f3d79a'}}>Pazar senin.</div>
  <div className="sub" style={{top:162,fontSize:24,opacity:win(l,5.5,6.2,7.4,8)}}>Eşyanı koy, ticaret yap.</div>
  <div className="layer flash" style={{opacity:Math.max(0,.4-l*2.6)}}/></section>}
function End({l}){const a=ease(l/.9),b=ease((l-1)/.7);
 return<section className="layer" style={{background:'radial-gradient(ellipse at 50% 42%,#1b1430,#05040a 75%)'}}>
  <img className="endlogo" src={logo} style={{opacity:a,transform:`scale(${.9+a*.1})`}}/>
  <div className="soon" style={{top:512,opacity:b,fontSize:48,fontWeight:700,color:'#f3d79a',letterSpacing:'6px',textShadow:'0 2px 28px #c98a3560'}}>ÇOK YAKINDA!</div>
  {l>=2&&<div className="badges"><img src={appleBadge} alt="App Store"/><img src={googleBadge} alt="Google Play"/></div>}</section>}
function App(){const[t,set]=useState(0);window.frame=v=>flushSync(()=>set(v));
 let s=0;for(let i=0;i<STARTS.length-1;i++)if(t>=STARTS[i])s=i;const l=t-STARTS[s],len=STARTS[s+1]-STARTS[s];
 return<LanguageProvider><style>{css}</style><main className="film">{[<Prologue l={l} t={t}/>,<Forge l={l} len={len} t={t}/>,<Clan l={l} len={len} t={t}/>,<Duel l={l} len={len} t={t}/>,<Market l={l} len={len} t={t}/>,<End l={l}/>][s]}</main></LanguageProvider>}
createRoot(document.getElementById('root')).render(<App/>);
