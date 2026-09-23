import {useId} from 'react';
import {itemTierColor} from '../../data/itemRarity';
import {boostScrollDef} from '../../data/boostScrolls';
const marks={atk:'M40 57L61 29L65 27L64 33L45 61M38 53L49 63M40 60L36 65',def:'M39 34L51 29L64 34L61 52L51 63L41 53Z',hp:'M39 39C38 28 51 30 51 38C52 27 67 29 64 41L51 58Z',exp:'M51 27L55 39L67 42L56 47L52 60L47 48L36 44L46 39Z',gold:'M51 30L64 39L61 53L49 60L37 50L39 37Z M41 40L59 40L54 52L46 52Z',np:'M42 29L60 29L61 40L66 44L57 58L45 58L36 44L41 40Z M45 36L55 36M44 44L57 44',scroll:'M40 51L52 31L64 51M45 48L52 37L58 48M52 38V62',accessoryScroll:'M43 37L54 31L64 40L59 51L45 54L37 45Z M45 54L42 64L54 66L59 51',bonusScroll:'M51 28L56 40L69 42L59 51L61 64L50 57L39 64L41 51L32 42L46 40Z'};
export default function ScrollArt({item={},size=48}){
 const id=useId(),kind=item.kind==='boostScroll'?item.boostId:item.kind;
 const color=item.kind==='boostScroll'?boostScrollDef(item.boostId)?.color:item.kind==='bonusScroll'?'#edc971':item.kind==='accessoryScroll'?'#72d8bb':itemTierColor(item.tier||1);
 return <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={item.name||'Parşömen'} data-scroll-art={kind}>
 <defs><linearGradient id={`${id}-paper`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff3d4"/><stop offset=".45" stopColor="#dbc092"/><stop offset="1" stopColor="#926642"/></linearGradient><linearGradient id={`${id}-gold`}><stop stopColor="#503521"/><stop offset=".35" stopColor="#ffe6a5"/><stop offset=".65" stopColor="#9c733d"/><stop offset="1" stopColor="#ecd2a0"/></linearGradient><radialGradient id={`${id}-seal`}><stop stopColor="#fff3c9"/><stop offset=".3" stopColor={color}/><stop offset="1" stopColor="#382338"/></radialGradient></defs>
 <path d="M22 17L76 14L72 70Q82 74 77 84L28 89Q16 81 24 72Z" fill="#090d15" opacity=".5" transform="translate(3 3)"/>
 <path d="M23 17L75 14L70 73L28 82Z" fill={`url(#${id}-paper)`} stroke="#5b402c" strokeWidth="2"/>
 <path d="M22 17Q14 24 22 30L35 28Q28 21 36 16L75 14Q84 17 77 25L36 28M28 71Q18 79 27 85L73 81Q82 73 71 70Z" fill={`url(#${id}-paper)`} stroke="#624529" strokeWidth="2"/>
 <path d="M25 19L74 16M29 78L73 74" stroke="#fff1c9" strokeWidth="2"/><path d="M31 33L28 66M70 30L67 65" stroke="#996b3c"/>
 <path d="M21 18L20 29M35 16L34 28M28 71L26 85M67 71L65 82" stroke={`url(#${id}-gold)`} strokeWidth="5"/>
 <path d={marks[kind]||marks.scroll} fill="none" stroke={color} strokeWidth="6" opacity=".28"/><path d={marks[kind]||marks.scroll} fill="none" stroke="#48324a" strokeWidth="3" strokeLinejoin="round"/><path d={marks[kind]||marks.scroll} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
 <path d="M62 63L66 90L73 85L79 88L74 60" fill={color} stroke="#4d2938" strokeWidth="1.5"/><circle cx="66" cy="63" r="12" fill={`url(#${id}-gold)`}/><circle cx="66" cy="63" r="9" fill={`url(#${id}-seal)`} stroke="#f1da9a"/><path d="M66 56L71 63L66 69L61 63Z" fill="none" stroke="#fff0bd" strokeWidth="1.5"/>
 {item.tier&&<text x="47" y="74" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#503c2a">{['','I','II','III','IV','V','VI'][item.tier]||''}</text>}
 </svg>;
}
