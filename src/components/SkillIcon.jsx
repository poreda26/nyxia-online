import {useId} from 'react';
export const themes={w:['blade','resolve','hammer','horn','blades','bleed','quake','guillotine','brokenShield','banner','dragon','fist','vortex'],r:['arrow','bandage','target','eye','doubleArrow','poisonArrow','pierce','markedArrow','feather','wind','bullseye','leaf','arrowRain'],m:['orb','spring','flame','rune','bolt','sulfur','ice','skull','meteor','time','chaos','siphon','starfall']};
const colors={blade:'#eac079',blades:'#f49663',arrow:'#93d5b0',arrows:'#7de5c0',heart:'#83e2b9',flame:'#ff9850',shield:'#80c9ef',target:'#e0c586',poison:'#be86ef',ice:'#98eaff',orb:'#bb9bff',bolt:'#a8deff',skull:'#c593ff',meteor:'#ffa172',time:'#ddb4ff',wind:'#b3e2cb'};
export default function SkillIcon({skill,skillId,effectType,size=32,color}){
 const uid=useId(),id=skill?.id||skillId||'',n=Number(id.slice(1))||1;
 const kind=themes[id[0]]?.[n-1]||({heal:'heart',buffAtk:'flame',buffDef:'shield',dot:'poison',execute:'target'}[effectType]||'blade'),c=colors[kind]||({w:'#efb477',r:'#92dfb2',m:'#c2a4ff'}[id[0]])||'#eac079';
 const shapes={
 resolve:<path d="M22 14L32 8L42 14V30L32 39L22 30Z M14 43H50M20 50H44" stroke={c} strokeWidth="3" fill="none"/>,
 hammer:<path d="M17 15L37 10L47 24L27 32Z M30 29L17 53" stroke={c} strokeWidth="3" fill="none"/>,
 horn:<path d="M12 27L25 24L43 12L48 40L27 34L14 37Z M48 19L55 15M50 28H58" stroke={c} strokeWidth="3" fill="none"/>,
 bleed:<path d="M13 17L40 43M19 12L46 38M43 35Q59 55 44 55Q30 55 43 35Z" stroke={c} strokeWidth="3" fill="none"/>,
 quake:<path d="M7 45L19 39L26 46L35 34L45 43L57 38 M32 8V29M23 21L32 30L41 21" stroke={c} strokeWidth="3" fill="none"/>,
 guillotine:<path d="M15 52V12H49V52 M20 19H44V29L20 38Z M9 53H55" stroke={c} strokeWidth="3" fill="none"/>,
 brokenShield:<path d="M29 10L12 18L17 41L28 51L24 35L33 27Z M36 10L51 18L46 41L35 51L31 37L40 28Z" stroke={c} strokeWidth="3" fill="none"/>,
 banner:<path d="M18 55V9L47 14L40 25L48 36L18 31 M25 17L33 21L26 26" stroke={c} strokeWidth="3" fill="none"/>,
 dragon:<path d="M10 18L27 23L39 12L54 18L42 27L49 34L35 42L21 35L12 47M36 18L39 21 M22 47L42 7" stroke={c} strokeWidth="3" fill="none"/>,
 fist:<path d="M17 29V17H24V27V12H32V26V14H40V29V20H47V38L39 51H25L13 38V29Z" stroke={c} strokeWidth="3" fill="none"/>,
 vortex:<path d="M13 27Q18 4 41 16Q60 27 45 46Q27 61 15 42Q8 27 29 23Q46 21 40 37Q35 47 26 36 M44 9L53 18" stroke={c} strokeWidth="3" fill="none"/>,
 bandage:<path d="M10 25L25 10L54 39L39 54Z M20 23L41 44M25 19L46 40M18 33L31 20M31 46L44 33" stroke={c} strokeWidth="3" fill="none"/>,
 eye:<path d="M7 32Q32 7 57 32Q32 57 7 32Z M39 32A7 7 0 1 0 25 32A7 7 0 1 0 39 32" stroke={c} strokeWidth="3" fill="none"/>,
 doubleArrow:<path d="M12 51L36 13L27 17M36 13L37 24 M28 53L52 15L43 19M52 15L53 26" stroke={c} strokeWidth="3" fill="none"/>,
 poisonArrow:<path d="M10 50L48 12L36 15M48 12L45 24 M25 24Q9 42 22 42Q35 42 25 24Z" stroke={c} strokeWidth="3" fill="none"/>,
 pierce:<path d="M8 43L55 22L42 21M55 22L47 33 M29 15L36 22M39 36L45 43M32 30L29 39" stroke={c} strokeWidth="3" fill="none"/>,
 markedArrow:<path d="M13 51L48 16L35 18M48 16L46 29 M24 23L40 39M40 23L24 39" stroke={c} strokeWidth="3" fill="none"/>,
 feather:<path d="M12 51Q21 17 51 12Q52 42 22 46Z M12 51L44 20M23 37L23 25M31 30L44 30" stroke={c} strokeWidth="3" fill="none"/>,
 bullseye:<path d="M45 32A16 16 0 1 0 29 48 M38 32A9 9 0 1 0 29 41 M29 32L55 10L45 11M55 10L54 20" stroke={c} strokeWidth="3" fill="none"/>,
 leaf:<path d="M13 50Q8 13 52 12Q55 53 13 50Z M13 50L43 23M23 40V27M32 32H44" stroke={c} strokeWidth="3" fill="none"/>,
 arrowRain:<path d="M12 10V41L7 34M12 41L17 34 M32 16V53L27 46M32 53L37 46 M52 10V41L47 34M52 41L57 34" stroke={c} strokeWidth="3" fill="none"/>,
 spring:<path d="M11 44Q32 33 53 44M15 51Q32 41 49 51 M32 9Q12 32 32 35Q52 32 32 9Z" stroke={c} strokeWidth="3" fill="none"/>,
 rune:<path d="M32 9L52 21V44L32 55L12 44V21Z M22 41V23L42 41V23M22 32H42" stroke={c} strokeWidth="3" fill="none"/>,
 sulfur:<path d="M10 22Q5 10 19 12Q30 3 37 13Q55 7 55 24Z M18 32L13 43M32 32L25 51M48 32L40 53" stroke={c} strokeWidth="3" fill="none"/>,
 chaos:<path d="M32 7L38 24L55 18L44 33L55 48L37 42L32 58L26 41L8 48L19 32L8 17L26 23Z" stroke={c} strokeWidth="3" fill="none"/>,
 siphon:<path d="M17 13Q4 34 18 40Q30 35 17 13Z M44 26Q29 50 44 54Q59 50 44 26Z M27 16Q49 8 52 24M48 18L52 24L57 19" stroke={c} strokeWidth="3" fill="none"/>,
 starfall:<path d="M32 13L37 25L50 26L40 35L43 48L32 40L21 48L24 35L14 26L27 25Z M12 8L7 18M51 8L57 19M9 46L6 55" stroke={c} strokeWidth="3" fill="none"/>,
 blade:<><path d="M17 47L44 13L48 10L47 19L22 49Z" fill="#edf6ff"/><path d="M13 39L27 51M18 46L11 55" stroke="#deb978" strokeWidth="5"/></>,
 blades:<><path d="M14 12L19 13L47 45L43 50L15 18Z M49 12L44 13L16 45L21 50L48 18Z" fill="#dceaff"/><path d="M11 39L25 51M39 51L53 39" stroke="#ffd39a" strokeWidth="4"/></>,
 arrow:<><path d="M17 12Q51 32 17 52" stroke="#e2c291" strokeWidth="4" fill="none"/><path d="M17 12L27 32L17 52" stroke="#eee0bd" fill="none"/><path d="M12 39L49 23M44 21L50 22L47 29" stroke={c} strokeWidth="4"/></>,
 arrows:<>{[0,12,24].map(x=><path key={x} d={`M${9+x} 50L${27+x} 15L${19+x} 21M${27+x} 15L${29+x} 26`} stroke={c} strokeWidth="3" fill="none"/>)}</>,
 heart:<><path d="M32 50L15 33Q5 15 22 15L32 24L42 15Q59 15 49 33Z" fill={c}/><path d="M32 24V40M24 32H40" stroke="#effff6" strokeWidth="4"/></>,
 flame:<><path d="M34 8Q27 27 44 23Q60 44 38 54Q9 58 14 33L23 20L24 36Q35 33 34 8Z" fill={c}/><path d="M32 31Q45 47 31 51Q22 49 32 31Z" fill="#fff1b2"/></>,
 shield:<><path d="M32 10L51 18L48 39L32 54L16 39L13 18Z" fill={c} stroke="#e7faff" strokeWidth="2"/><path d="M32 18V43M21 29H43" stroke="#426078" strokeWidth="4"/></>,
 target:<><circle cx="32" cy="32" r="17" stroke={c} strokeWidth="3"/><circle cx="32" cy="32" r="7" fill={c}/><path d="M32 9V23M32 41V55M9 32H23M41 32H55" stroke="#fff0b5" strokeWidth="3"/></>,
 poison:<><path d="M32 9Q20 28 16 35Q9 53 32 55Q55 53 48 35Z" fill={c}/><circle cx="26" cy="38" r="4" fill="#402959"/><circle cx="39" cy="38" r="4" fill="#402959"/><path d="M26 47H39" stroke="#edd6ff" strokeWidth="3"/></>,
 ice:<>{[0,60,120].map(a=><g key={a} transform={`rotate(${a} 32 32)`}><path d="M32 9V55M24 17L32 24L40 17M24 47L32 40L40 47" stroke={c} strokeWidth="3" fill="none"/></g>)}</>,
 bolt:<path d="M34 7L14 35H29L24 58L51 26H35L43 7Z" fill={c} stroke="#f0fcff" strokeWidth="1.5"/>,
 orb:<><circle cx="32" cy="32" r="13" fill={c}/><ellipse cx="32" cy="32" rx="26" ry="11" transform="rotate(-35 32 32)" stroke="#e7d1ff" strokeWidth="2"/><path d="M31 21L37 32L31 42L26 32Z" fill="#fff"/></>,
 skull:<><path d="M18 39Q8 12 32 12Q56 12 46 39L41 43V52H24V43Z" fill={c}/><path d="M20 29L29 33M44 29L35 33" stroke="#241739" strokeWidth="5"/><path d="M30 45V52M36 45V52" stroke="#37274c" strokeWidth="2"/></>,
 meteor:<><path d="M13 42L47 9L39 31L56 20L35 52Z" fill={c}/><circle cx="25" cy="42" r="13" fill="#ffdc86"/><path d="M19 37L31 40L23 49Z" fill="#9d4e42"/></>,
 time:<><path d="M18 12H46M18 52H46" stroke={c} strokeWidth="4"/><path d="M22 14Q21 27 32 32Q43 38 42 50H22Q21 38 32 32Q43 27 42 14Z" stroke={c} strokeWidth="3"/><path d="M26 19H38L32 28ZM25 47L32 37L39 47Z" fill="#f5dfaf"/></>,
 wind:<><path d="M10 23H42Q56 23 49 13M10 33H49Q61 33 54 44M10 43H30Q44 43 36 53" stroke={c} strokeWidth="4" fill="none"/></>,
 };
 return <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" data-skill-art={id||kind} fill="none" strokeLinecap="round" strokeLinejoin="round"><defs><radialGradient id={uid}><stop stopColor={c} stopOpacity=".36"/><stop offset="1" stopColor="#101824"/></radialGradient></defs><rect x="2" y="2" width="60" height="60" rx="12" fill={`url(#${uid})`} stroke={c} strokeOpacity=".65"/><g transform={`rotate(${id[0]==='w'?(n%3-1)*8:0} 32 32)`}>{shapes[kind]}</g><path d="M8 17V8H17M47 56H56V47" stroke="#f8ddab" strokeOpacity=".65"/>{n>1&&<circle cx="53" cy="11" r={2+n/13} fill={c}/>}</svg>;
}
