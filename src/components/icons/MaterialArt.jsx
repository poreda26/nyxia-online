import {useId} from 'react';

export default function MaterialArt({item,size=48}) {
 const id=useId(),key=item.materialKey||({Odun:'wood','Gümüş':'silver',Demir:'iron',Elmas:'diamond','Altın Külçesi':'goldBar'}[item.name]);
 const gold=key==='goldBar',silver=key==='silver';
 return <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={item.name||'Malzeme'} data-material-art={key} style={{display:'block',flexShrink:0}}>
  <defs>
   <linearGradient id={`${id}-bark`} x2=".8" y2="1"><stop stopColor="#b17842"/><stop offset=".45" stopColor="#70411f"/><stop offset="1" stopColor="#35251c"/></linearGradient>
   <linearGradient id={`${id}-metal`} x2=".5" y2="1"><stop stopColor={gold?'#fff2b2':'#f1f7fc'}/><stop offset=".4" stopColor={gold?'#e9b548':'#abbfce'}/><stop offset=".55" stopColor={gold?'#c18425':'#6a8295'}/><stop offset="1" stopColor={gold?'#8b571b':'#384b61'}/></linearGradient>
   <linearGradient id={`${id}-ore`} x2=".7" y2="1"><stop stopColor="#b5b8c4"/><stop offset=".5" stopColor="#686c80"/><stop offset="1" stopColor="#303345"/></linearGradient>
  </defs>
  {key==='wood'?<g stroke="#382218" strokeWidth="1.5" strokeLinejoin="round">
   {[{x:15,y:49},{x:31,y:61},{x:21,y:34}].map(({x,y},i)=><g key={i}><path d={`M${x} ${y}L${x+46} ${y-23}Q${x+60} ${y-21} ${x+60} ${y-9}L${x+14} ${y+17}Z`} fill={`url(#${id}-bark)`}/><path d={`M${x+15} ${y-2}L${x+47} ${y-18}M${x+20} ${y+4}L${x+54} ${y-14}`} fill="none" stroke="#c08b50" strokeWidth="1"/><ellipse cx={x+7} cy={y+8} rx="10" ry="13" transform={`rotate(-30 ${x+7} ${y+8})`} fill="#d4a666"/><ellipse cx={x+7} cy={y+8} rx="6" ry="8" transform={`rotate(-30 ${x+7} ${y+8})`} fill="none" stroke="#946038"/><path d={`M${x+4} ${y+5}q8 -2 5 8`} fill="none" stroke="#946038"/></g>)}
   <path d="M46 25L58 29L49 71L39 74Z" fill="#c3ad7d"/><path d="M50 27L42 72M54 28L46 72" stroke="#78613e" strokeWidth="1"/>
  </g>:silver||gold?<g stroke={gold?'#785022':'#435569'} strokeWidth="1.4" strokeLinejoin="round">
   <path d="M14 54L60 44L87 61L40 77L12 67Z" fill={`url(#${id}-metal)`}/><path d="M14 54L40 66L87 51L87 61L40 77L12 67Z" fill={`url(#${id}-metal)`}/>
   <path d="M26 30L66 22L85 38L45 51L22 42Z" fill={`url(#${id}-metal)`}/><path d="M26 30L45 40L80 30L85 38L45 51L22 42Z" fill={`url(#${id}-metal)`}/>
   <path d="M28 30L45 37L65 31M16 54L39 63L71 53" fill="none" stroke={gold?'#fff2b5':'#f0fbff'} strokeWidth="2"/>
   <path d="M47 29L54 27L59 30L52 33Z" fill="none" stroke={gold?'#9e691f':'#768fa4'}/>
  </g>:key==='iron'?<g stroke="#343744" strokeWidth="1.5" strokeLinejoin="round">
   <path d="M15 57L24 35L48 20L72 29L86 54L77 75L42 84L17 72Z" fill={`url(#${id}-ore)`}/><path d="M24 35L47 42L48 20L72 29L65 48L86 54L58 65L42 84L36 58L15 57Z" fill="#8e94a6"/><path d="M47 42L65 48L58 65L36 58Z" fill="#505669"/><path d="M24 35L47 42L48 20M65 48L72 29M36 58L17 72M58 65L77 75" fill="none" stroke="#ccd0d9"/><path d="M30 41L39 43M62 35L66 33M63 65L70 62M28 64L31 68" stroke="#dce5ed" strokeWidth="2"/>
  </g>:<g stroke="#a8e9ff" strokeWidth="1" strokeLinejoin="round">
   <path d="M12 38L29 19L70 19L88 38L50 84Z" fill="#39a9d1"/><path d="M12 38H88L50 84Z" fill="#156993"/><path d="M29 19L36 38L50 84L64 38L70 19Z" fill="#a4ebff"/><path d="M29 19L50 27L70 19L64 38H36Z" fill="#e6fcff"/><path d="M12 38L29 19L36 38L50 84Z" fill="#62c6e8"/><path d="M64 38L88 38L50 84Z" fill="#3587bd"/><path d="M50 27L36 38H64Z" fill="#fff"/><path d="M76 10V22M70 16H82" stroke="#fff" strokeWidth="2"/>
  </g>}
 </svg>;
}
