import React,{useState}from'react';import{createRoot}from'react-dom/client';import{flushSync}from'react-dom';
import logo from '../../src/assets/brand/nyxia-logo.png';import appleBadge from './badges/AppStore_icon_noCTA.svg';import googleBadge from './badges/GooglePlay_icon_noCTA.svg';import regions from '../../src/assets/battle/regions-v1.png';
import{MonsterFigure}from'../../src/components/BattleScene';import{monsterAtlases}from'../../src/data/monsterPortraits';import{battleVisualFor}from'../../src/data/battleVisuals';
import CharacterFigure from'../../src/components/CharacterFigure';import{fixture}from'../../tests/balance-fixtures';import{makeWings}from'../../src/utils/wings';import{LanguageProvider}from'../../src/i18n/LanguageContext';
// Sinematik fragman: oyun arayüzü yok; yalnızca oyunun kendi bölge, canavar ve karakter sanatı.
const heroes=['warrior','rogue','mage'].map((c,i)=>{const p={...fixture(c,65,5,8),nickname:'Nyxia',race:i===0?'karus':'elmorad'};p.equipped.wings=makeWings(['frost','ember','twilight'][i]);return p;});
const REGIONS=[
 {map:'fallow_valley',title:'FALLOW VALLEY',line:'Her destan burada başlar.',tint:'#86d46f',bg:0},
 {map:'ashen_canyon',title:'ASHEN CANYON',line:'Küllerin altında bir şey uyanıyor.',tint:'#ff7a3a',bg:1},
 {map:'frostburn_summit',title:'FROSTBURN SUMMIT',line:'Zirvede donmuş bir nöbet var.',tint:'#8fd3ff',bg:2},
 {map:'ruined_sanctuary',title:'RUINED SANCTUARY',line:'Lanetli rahipler dua etmeyi bıraktı.',tint:'#b49bff',bg:3},
 {map:'abyssal_pit',title:'ABYSSAL PIT',line:'Karanlığın dibi seni çağırıyor.',tint:'#a45bff',bg:4},
 {map:'crimson_battlefront',title:'CRIMSON BATTLEFRONT',line:'Kızıl cephe. Son savaş.',tint:'#ff4a4a',bg:5},
];
const STARTS=[0,3.2,7.2,11.2,15.2,19.2,23.2,27.2,31.7,36],HERO=7;
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),ease=v=>1-Math.pow(1-clamp(v),3);
const css=`*{box-sizing:border-box}body{margin:0;background:#000;color:#f6efdc;font-family:Georgia,'Times New Roman',serif}.film{position:relative;width:540px;height:960px;overflow:hidden;background:#000}.layer{position:absolute;inset:0}.bgwrap{position:absolute;left:-210px;top:0;width:960px;height:960px;overflow:hidden}.bgcell{width:960px;height:960px;background-repeat:no-repeat;background-size:2880px 1920px}.mon{position:absolute;left:60px;width:420px;height:470px;top:290px}.mon svg{display:block;width:100%;height:100%}.vig{background:radial-gradient(ellipse at 50% 46%,transparent 38%,#000d 100%)}.bar{position:absolute;left:0;right:0;background:#000}.title{position:absolute;left:0;right:0;top:128px;text-align:center;font-size:26px;font-weight:700;color:#f3d79a;text-shadow:0 2px 22px #000,0 0 28px var(--tint)}.line{position:absolute;left:30px;right:30px;top:178px;text-align:center;font-size:21px;font-style:italic;color:#efe6d0;text-shadow:0 2px 14px #000}.ember{position:absolute;width:5px;height:5px;border-radius:50%;filter:blur(.6px)}.flash{background:#fff4d8}.hero{position:absolute;bottom:92px}.hero .character-figure{width:100%;height:100%;filter:drop-shadow(0 14px 18px #000b)}.big{position:absolute;left:20px;right:20px;text-align:center;font-weight:700;text-shadow:0 3px 26px #000}.rune{position:absolute;left:40px;top:330px;width:460px;height:460px;border:1px solid #c6a66155;border-radius:50%;box-shadow:0 0 70px #8169de22,inset 0 0 55px #8169de18}.rune:before{content:"";position:absolute;inset:20px;border:1px dashed #d8ba7444;border-radius:50%}.armor-effect,.armor-sweep{display:none!important}.endlogo{position:absolute;left:100px;top:190px;width:340px;height:280px;object-fit:contain;mix-blend-mode:screen}.soon{position:absolute;left:0;right:0;text-align:center}.badges{position:absolute;left:0;right:0;top:600px;display:flex;justify-content:center;align-items:center;gap:20px}.badges img{display:block;height:64px;width:auto}.credit{bottom:26px;padding:0 8px;font-size:8.4px;line-height:1.5;color:#8d88a3;font-family:Arial,sans-serif}`;
const bossOf=map=>battleVisualFor({id:`map_boss_${map}`,isBoss:true});
function Embers({t,tint,n=30}){return<div className="layer" style={{pointerEvents:'none'}}>{Array.from({length:n},(_,i)=>{const sp=18+(i*7)%22,x=(i*83+Math.sin(t*.8+i)*14)%540,y=960-((i*131+t*sp*5)%1000)+40;return<i key={i} className="ember" style={{left:x,top:y,background:tint,boxShadow:`0 0 8px ${tint}`,opacity:.12+.3*Math.abs(Math.sin(t*1.7+i))}}/>})}</div>}
function Region({r,l,len,t}){
 const art=bossOf(r.map),col=r.bg%3,row=Math.floor(r.bg/3);
 const enter=ease(l/.5),exit=clamp((len-l)/.45),op=Math.min(enter,exit),shake=l<.35?Math.sin(l*90)*(1-l/.35)*7:0;
 const reveal=ease((l-.35)/1.1),zoom=1.05+l*.018,monScale=.94+reveal*.06+l*.012;
 const tOp=ease((l-.5)/.5),lOp=ease((l-1.3)/.6);
 return<section className="layer" style={{opacity:op,transform:`translate(${shake}px,${shake*.6}px)`,'--tint':r.tint}}>
  <div className="bgwrap"><div className="bgcell" style={{backgroundImage:`url(${regions})`,backgroundPosition:`${-col*960}px ${-row*960}px`,transform:`scale(${zoom})`,filter:'brightness(.62) saturate(1.1)'}}/></div>
  <div className="layer" style={{background:'linear-gradient(#000a,transparent 34%,transparent 62%,#000c)'}}/>
  <div className="mon" style={{opacity:reveal,transform:`scale(${monScale}) translateY(${(1-reveal)*30}px)`,transformOrigin:'50% 100%',filter:`brightness(${.12+.88*reveal}) drop-shadow(0 0 ${22*reveal}px ${r.tint}99)`}}><MonsterFigure rect={art.rect} outline={art.clip} label={r.title} source={monsterAtlases[art.atlas]} size={art.size}/></div>
  <Embers t={t} tint={r.tint}/>
  <div className="layer vig"/>
  <div className="title" style={{opacity:tOp,letterSpacing:`${12-6*tOp}px`,transform:`translateY(${(1-tOp)*10}px)`}}>{r.title}</div>
  <div className="line" style={{opacity:lOp}}>{r.line}</div>
  <div className="layer flash" style={{opacity:Math.max(0,.55-l*3.2)}}/>
 </section>}
function Prologue({l,t}){const a=ease(l/1.2)*clamp((3.2-l)/.6),b1=clamp((l-.5)/.6)*clamp((1.9-l)/.4),b2=clamp((l-1.9)/.6)*clamp((3.2-l)/.5);
 return<section className="layer" style={{background:'#000'}}><div className="layer" style={{background:`radial-gradient(ellipse at 50% 80%,rgba(122,27,27,${.22+.12*Math.sin(t*2)}),transparent 65%)`,opacity:a}}/><Embers t={t} tint="#ff5a3a" n={22}/>
  <div className="big" style={{top:400,fontSize:38,opacity:b1,letterSpacing:`${(1-b1)*6+2}px`}}>Gökyüzü karardı.</div>
  <div className="big" style={{top:400,fontSize:38,opacity:b2,color:'#f3d79a'}}>Ve canavarlar uyandı.</div></section>}
function Heroes({l,len,t}){const op=Math.min(ease(l/.5),clamp((len-l)/.45)),shake=l<.35?Math.sin(l*90)*(1-l/.35)*7:0;
 const pos=[{left:75,z:2,w:390,h:570},{left:-45,z:1,w:330,h:490},{left:255,z:1,w:330,h:490}];
 const t1=ease((l-1.5)/.6),t2=ease((l-2.7)/.6);
 return<section className="layer" style={{opacity:op,transform:`translate(${shake}px,0)`,background:'radial-gradient(ellipse at 50% 70%,#2b2250,#07060f 75%)'}}>
  <div className="rune" style={{transform:`rotate(${l*7}deg)`}}/><Embers t={t} tint="#e8bf73" n={26}/>
  {heroes.map((p,i)=>{const d=ease((l-.15-i*.18)/.8);return<div key={p.class} className="hero" style={{left:pos[i].left,width:pos[i].w,height:pos[i].h,zIndex:pos[i].z,opacity:d,transform:`translateY(${(1-d)*70}px)`}}><CharacterFigure player={p}/></div>})}
  <div className="layer vig"/>
  <div className="big" style={{top:130,fontSize:42,opacity:t1,color:'#f3d79a',transform:`translateY(${(1-t1)*12}px)`}}>Altı bölge. Bir lanet.</div>
  <div className="big" style={{top:190,fontSize:34,opacity:t2,fontStyle:'italic'}}>Sen ne yapacaksın?</div>
  <div className="layer flash" style={{opacity:Math.max(0,.6-l*3.2)}}/></section>}
// Bitiş kartı: logo, "Çok Yakında!" ve altında mağaza ikonları (resmi rozetlerden yalnızca "indirin" yazısı çıkarılmış). Animasyonsuz, tek karede belirir.
function End({l}){const a=ease(l/.9),b=ease((l-1)/.7);
 return<section className="layer" style={{background:'radial-gradient(ellipse at 50% 42%,#1b1430,#05040a 75%)'}}>
  <img className="endlogo" src={logo} style={{opacity:a,transform:`scale(${.9+a*.1})`}}/>
  <div className="soon" style={{top:512,opacity:b,fontSize:48,fontWeight:700,color:'#f3d79a',letterSpacing:'6px',textShadow:'0 2px 28px #c98a3560'}}>ÇOK YAKINDA!</div>
  {l>=2&&<div className="badges"><img src={appleBadge} alt="App Store"/><img src={googleBadge} alt="Google Play"/></div>}</section>}
function App(){const[t,set]=useState(0);window.frame=v=>flushSync(()=>set(v));
 let s=0;for(let i=0;i<STARTS.length-1;i++)if(t>=STARTS[i])s=i;const l=t-STARTS[s],len=STARTS[s+1]-STARTS[s];
 const intro=t<1.2?70*(1-ease(t/1.2)):0;
 return<LanguageProvider><style>{css}</style><main className="film">{s===0?<Prologue l={l} t={t}/>:s<=6?<Region r={REGIONS[s-1]} l={l} len={len} t={t}/>:s===HERO?<Heroes l={l} len={len} t={t}/>:<End l={l}/>}
  <div className="bar" style={{top:0,height:intro}}/><div className="bar" style={{bottom:0,height:intro}}/>
</main></LanguageProvider>}
createRoot(document.getElementById('root')).render(<App/>);
