import './WingArt.css';
import { useId } from 'react';
import { wingDefinition } from '../data/wings';

// The inventory icon and equipped layer share the exact same feather geometry.
export default function WingArt({ wingId = 'dawn', size, className = '' }) {
  const id = useId();
  const w = wingDefinition(wingId);
  if (!w) return null;
  const crystal = w.shape === 'crystal', flame = w.shape === 'flame', shadow = w.shape === 'shadow';
  return <svg className={`wing-art ${className}`} viewBox="0 0 600 430" width={size || '100%'} height={size || '100%'} role="img" aria-label={w.name} data-wing-art={w.id} style={{'--wing-glow':w.color,'--wing-cycle':flame?'3.8s':shadow?'5.6s':'4.8s'}}>
    <defs>
      <linearGradient id={`${id}-feather`} x1="0" y1="0" x2=".8" y2="1"><stop stopColor={w.light}/><stop offset=".35" stopColor={w.color}/><stop offset=".76" stopColor={w.dark}/><stop offset="1" stopColor={w.color}/></linearGradient>
      <linearGradient id={`${id}-metal`}><stop stopColor="#443123"/><stop offset=".3" stopColor="#f6d99b"/><stop offset=".55" stopColor="#87653c"/><stop offset=".8" stopColor="#edd5a0"/><stop offset="1" stopColor="#47321f"/></linearGradient>
      <radialGradient id={`${id}-gem`}><stop stopColor="white"/><stop offset=".2" stopColor={w.light}/><stop offset=".55" stopColor={w.color}/><stop offset="1" stopColor={w.dark}/></radialGradient>
      <filter id={`${id}-aura`} x="-35%" y="-35%" width="170%" height="170%"><feGaussianBlur stdDeviation="4"/></filter>
    </defs>
    {[false,true].map(mirror=><g key={String(mirror)} transform={mirror?'translate(600 0) scale(-1 1)':undefined}><g className="wing-flight">
      <path d="M298 240C240 239 205 193 185 112L80 29C86 162 91 264 185 330L280 323Z" fill={w.dark} stroke="#131722" strokeWidth="3"/>
      {Array.from({length:12},(_,i)=>{
        const x=20+Math.pow(i/11,2)*175, y=25+i*29, rx=245+i*3, ry=205+i*7;
        const tip=flame?y-12*Math.sin(i*2):shadow?y+12:y;
        return <g key={i} className="wing-feather" style={{animationDelay:`${-i*.13}s`}}>
          <path d={crystal?`M${rx} ${ry}L${x+44} ${tip+17}L${x} ${tip}L${x+21} ${tip+64}L${rx-17} ${ry+30}Z`:`M${rx} ${ry}Q${x+42} ${tip+5} ${x} ${tip}Q${x+5} ${tip+66} ${rx-17} ${ry+30}Q${rx+3} ${ry+25} ${rx} ${ry}Z`} fill={`url(#${id}-feather)`} stroke={w.dark} strokeWidth="2"/>
          <path d={`M${x+7} ${tip+10}Q${x+60} ${tip+67} ${rx-12} ${ry+17}`} fill="none" stroke={w.light} strokeOpacity=".55" strokeWidth="1.4"/>
          {!crystal&&[.25,.4,.55,.7].map(t=><path key={t} d={`M${x+10+(rx-x)*t} ${tip+17+(ry-tip)*t}l-17 1m17 -1l-4 -13`} stroke={w.light} strokeOpacity=".24" fill="none"/>)}
        </g>;
      })}
      <g className="wing-radiance" fill="none" stroke={w.color} strokeWidth="9" filter={`url(#${id}-aura)`}><path d="M278 290Q154 224 40 47M258 310Q127 278 48 148M245 329Q171 318 95 265"/></g>
      {[0,1].map(row=><g key={row}>{Array.from({length:8},(_,i)=>{
        const x=110+i*18+row*25,y=109+i*19+row*24;
        return <g key={i}><path d={`M${x} ${y}q-32 -29 -40 -20q3 27 39 42l16 -8Z`} fill={`url(#${id}-feather)`} stroke={w.dark} strokeWidth="1.5"/><path d={`M${x-32} ${y-14}l36 30`} stroke={w.light} opacity=".6" fill="none"/></g>;
      })}</g>)}
      <path d="M298 263Q235 231 203 146Q166 110 92 48Q119 126 169 154Q188 239 271 299Z" fill={`url(#${id}-metal)`} stroke="#493a2b" strokeWidth="3"/>
      <path d="M288 274Q217 232 192 151L108 67M284 284Q207 242 182 158L121 99" fill="none" stroke={w.light} strokeWidth="2" opacity=".6"/>
      {[0,1,2,3,4].map(i=><path key={i} d={`M${190+i*19} ${175+i*20}l12 -5 6 15 -10 8Z`} fill={`url(#${id}-gem)`} stroke="#d8b974" strokeWidth="2"/>)}
      <path d="M92 90Q115 185 214 251" fill="none" stroke={w.light} strokeWidth="1" strokeDasharray="2 8" opacity=".65"/>
      <g className="wing-sparks" fill={w.light}>{Array.from({length:7},(_,i)=>{
        const x=35+i*25,y=80+i*36;
        return <g key={i} className="wing-mote" style={{animationDelay:`${-i*.57}s`,transformOrigin:`${x}px ${y}px`}}>
          {crystal?<path d={`M${x} ${y-8}l4 8 -4 8 -4 -8Z`}/>:w.shape==='leaf'?<path d={`M${x-4} ${y+7}q-3 -13 12 -15q1 13 -12 15Z`}/>:<path d={`M${x} ${y-6}l2 4 5 2 -5 2 -2 6 -2 -6 -5 -2 5 -2Z`}/>}
          <circle cx={x+8} cy={y+14} r="1.6" fill={w.color}/>
        </g>;
      })}</g>
      <path className="wing-edge-light" d="M26 35Q57 126 112 159M44 163Q76 239 155 270M93 279Q154 331 205 343" fill="none" stroke={w.light} strokeWidth="2.5" strokeLinecap="round"/>
    </g></g>)}
    <path d="M300 221L326 252L317 308L300 331L283 308L274 252Z" fill={`url(#${id}-metal)`} stroke="#352a20" strokeWidth="3"/>
    <path d="M300 239L313 261L300 299L287 261Z" fill={`url(#${id}-gem)`} stroke={w.light} strokeWidth="2"/>
  </svg>;
}
