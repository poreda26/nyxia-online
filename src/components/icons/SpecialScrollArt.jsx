import {useId} from 'react';

// Centered silhouettes share the same safe area in bags, shops and forge slots.
export default function SpecialScrollArt({item,size=48}) {
 const id=useId(),bonus=item.kind==='bonusScroll',race=item.kind==='raceScroll';
 const accent=bonus?'#c68aff':race?'#66e5ed':'#ffb85b';
 const dark=bonus?'#472668':race?'#164d61':'#633722';
 return <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={item.name||'Parşömen'} data-scroll-art={item.kind} style={{display:'block',flexShrink:0,overflow:'hidden'}}>
  <defs>
   <linearGradient id={`${id}-paper`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff6d8"/><stop offset=".45" stopColor="#e7cca0"/><stop offset="1" stopColor="#ad7843"/></linearGradient>
   <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#7c4b20"/><stop offset=".25" stopColor="#fff1b6"/><stop offset=".48" stopColor="#cc9146"/><stop offset=".7" stopColor="#ffe6a0"/><stop offset="1" stopColor="#87551f"/></linearGradient>
   <linearGradient id={`${id}-inlay`} x1="0" y1="0" x2="0" y2="1"><stop stopColor={accent}/><stop offset=".5" stopColor={dark}/><stop offset="1" stopColor="#151b2d"/></linearGradient>
   <radialGradient id={`${id}-gem`} cx=".35" cy=".25"><stop stopColor="#ffffff"/><stop offset=".22" stopColor={accent}/><stop offset="1" stopColor={dark}/></radialGradient>
  </defs>
  {bonus&&<g fill={`url(#${id}-gold)`} stroke="#6e401d" strokeWidth=".7">
   <path d="M29 32L9 22L15 40L26 49L12 43L19 60L29 66ZM71 32L91 22L85 40L74 49L88 43L81 60L71 66Z"/>
   <path d="M15 31L27 39M19 48L28 55M85 31L73 39M81 48L72 55" fill="none" stroke="#fff0bf"/>
  </g>}
  <path d="M24 16H76L72 82H28Z" fill={`url(#${id}-paper)`} stroke="#553a26" strokeWidth="2"/>
  <path d="M30 25H70L67 74H33Z" fill={dark} stroke={`url(#${id}-gold)`} strokeWidth="2"/>
  <path d="M34 29H66L63 69H37Z" fill={`url(#${id}-inlay)`} stroke={accent} strokeOpacity=".55" strokeWidth=".8"/>
  <g fill={`url(#${id}-paper)`} stroke="#674325" strokeWidth="1.5">
   <path d="M25 13H75Q81 13 81 19Q81 25 75 25H25Q19 25 19 19Q19 13 25 13Z"/>
   <path d="M27 75H73Q80 75 80 81Q80 87 73 87H27Q20 87 20 81Q20 75 27 75Z"/>
  </g>
  <g fill={`url(#${id}-gold)`} stroke="#734922" strokeWidth=".8">
   {[23,72].map(x=><g key={x}><rect x={x} y="12" width="5" height="14" rx="2"/><rect x={x} y="74" width="5" height="14" rx="2"/></g>)}
  </g>
  <path d="M31 16H69M32 78H68" stroke="#fff5d5" strokeWidth="1.5"/>
  {race?<g strokeLinejoin="round">
   <path d="M46 38Q40 30 35 39L36 49L41 54L45 49L43 45L46 43Z" fill="#e9f9ed" stroke="#9ae3e7"/>
   <path d="M54 38L56 31L60 35L65 32L64 41L67 46L63 48L62 54L55 51Z" fill="#8fc8ad" stroke="#d6fbe4"/>
   <path d="M36 31Q49 23 62 30M58 26L63 30L58 33M64 59Q51 67 38 60M42 57L37 60L42 64" fill="none" stroke="#fff0b2" strokeWidth="1.8"/>
  </g>:bonus?<g stroke={`url(#${id}-gold)`} strokeLinejoin="round">
   <path d="M37 37L34 28L43 33L50 25L57 33L66 28L63 37Z" fill={`url(#${id}-gold)`} strokeWidth="1.2"/>
   <path d="M50 36L63 43L60 59L50 67L40 59L37 43Z" fill="#2a183e" strokeWidth="2"/>
   <path d="M50 39L58 48L50 60L42 48Z" fill={`url(#${id}-gem)`} strokeWidth="1.3"/>
   <path d="M50 39V60M42 48H58" fill="none" stroke="#eed6ff" strokeWidth=".7"/>
   <path d="M33 42L28 48L34 61M67 42L72 48L66 61" fill="none" strokeWidth="2"/>
  </g>:<g fill="none" strokeLinecap="round" strokeLinejoin="round">
   <path d="M38 61L58 33L61 29L62 35L43 64M36 55L47 63" stroke="#fff0bc" strokeWidth="2.5"/>
   <path d="M39 33Q64 43 62 63L39 33M36 32L65 63" stroke="#f4c56f" strokeWidth="1.7"/>
   <path d="M61 61L40 36" stroke="#dbcaff" strokeWidth="2"/><path d="M38 28L43 33L39 39L34 34Z" fill={`url(#${id}-gem)`} stroke="#ffe7aa" strokeWidth="1"/>
  </g>}
  <path d="M44 78L43 95L50 91L57 95L56 78Z" fill={dark} stroke={`url(#${id}-gold)`} strokeWidth="1"/>
  <circle cx="50" cy="78" r="8" fill={`url(#${id}-gold)`} stroke="#7a4d28"/>
  <path d="M50 72L54 78L50 84L46 78Z" fill={`url(#${id}-gem)`} stroke="#fff0b5"/>
  {bonus&&<g fill="#fff0bc"><path d="M15 12L16 16L20 17L16 18L15 22L14 18L10 17L14 16ZM85 64L86 68L90 69L86 70L85 74L84 70L80 69L84 68Z"/><circle cx="84" cy="14" r="1.2"/><circle cx="16" cy="74" r="1.2"/></g>}
 </svg>;
}
