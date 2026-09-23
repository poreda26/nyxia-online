import {useId} from 'react';
export default function RewardChest({size=88,tier=5,special=false}){
 const id=useId(),color=special?'#a5e5ef':['#8cb69b','#63b9d2','#967cd0','#df9355','#ecc66a','#dd7798'][(tier-1)%6]||'#ecc66a';
 return <svg width={size} height={size} viewBox="0 0 100 100" fill="none" role="img" aria-label={special?'Özel sandık':`T${tier} sandık`} data-chest-art={special?'special':tier}>
 <defs><linearGradient id={id} x2="0" y2="1"><stop stopColor="#fff1b6"/><stop offset=".5" stopColor="#deb867"/><stop offset="1" stopColor="#855124"/></linearGradient><radialGradient id={`${id}-glow`}><stop stopColor={color} stopOpacity=".5"/><stop offset="1" stopColor={color} stopOpacity="0"/></radialGradient><linearGradient id={`${id}-wood`} x2="0" y2="1"><stop stopColor={color}/><stop offset=".45" stopColor="#393047"/><stop offset="1" stopColor="#171c2a"/></linearGradient><radialGradient id={`${id}-gem`}><stop stopColor="white"/><stop offset=".25" stopColor={color}/><stop offset="1" stopColor="#272039"/></radialGradient></defs>
 <circle cx="50" cy="49" r="48" fill={`url(#${id}-glow)`}/>

 <ellipse cx="50" cy="83" rx="34" ry="8" fill="#070b15" opacity=".5"/>
 <path d="M16 47L66 53L86 44L80 80L62 90L20 81Z" fill={`url(#${id}-wood)`} stroke={`url(#${id})`} strokeWidth="3"/>
 <path d="M22 58L61 64M22 70L60 76M71 62L81 56M70 74L80 68" stroke={color} strokeOpacity=".4"/>
 <path d="M25 51L27 81M57 55L56 87M77 51L74 82" stroke={`url(#${id})`} strokeWidth="6"/>
 <path d="M16 47L66 53L86 44M66 53L62 90M20 81L62 90L80 80" stroke={`url(#${id})`} strokeWidth="3"/>
 <g className="chest-art-lid"><path d="M16 47Q15 23 32 23L69 20Q86 21 86 44L66 53Z" fill={`url(#${id}-wood)`} stroke={`url(#${id})`} strokeWidth="3"/>
 <path d="M25 48Q24 28 35 23M58 51Q56 29 66 21M76 46Q79 31 72 22" stroke={`url(#${id})`} strokeWidth="5"/>
 <path d="M35 29L52 28L52 43L33 41Z" fill="#171b29" stroke={color}/><path d="M43 30L48 35L42 40L38 35Z" fill={`url(#${id}-gem)`}/>
 <path d="M18 46L65 51L84 43" stroke="#fff0ba" strokeWidth="1.4"/></g>
 <path d="M40 51L51 52L54 62L47 72L37 63Z" fill={`url(#${id})`} stroke="#5b4126"/><path d="M45 56L49 62L45 66L41 61Z" fill={`url(#${id}-gem)`}/>
 {[[23,56],[24,75],[57,61],[56,81],[78,56],[75,75]].map(([x,y])=><circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" fill="#fff0b7"/>)}
 <path d="M25 81L22 87L29 87L32 84M70 86L70 92L77 87L77 82" fill={`url(#${id})`}/>
 {special&&<path d="M48 3L51 13L60 16L51 19L48 29L45 19L35 16L45 13Z" fill="#e6ffff"/>}
 </svg>;
}
