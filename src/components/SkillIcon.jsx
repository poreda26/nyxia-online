import {useId} from 'react';
const themes={w:['blade','heart','blade','flame','blades','poison','shield','target','blades','shield','flame','heart','blades'],r:['arrow','heart','target','target','arrows','poison','arrow','target','arrows','wind','arrow','heart','arrows'],m:['orb','heart','flame','orb','bolt','poison','ice','skull','meteor','time','orb','heart','meteor']};
const colors={blade:'#eac079',blades:'#f49663',arrow:'#93d5b0',arrows:'#7de5c0',heart:'#83e2b9',flame:'#ff9850',shield:'#80c9ef',target:'#e0c586',poison:'#be86ef',ice:'#98eaff',orb:'#bb9bff',bolt:'#a8deff',skull:'#c593ff',meteor:'#ffa172',time:'#ddb4ff',wind:'#b3e2cb'};
export default function SkillIcon({skill,skillId,effectType,size=32,color}){
 const uid=useId(),id=skill?.id||skillId||'',n=Number(id.slice(1))||1;
 const kind=themes[id[0]]?.[n-1]||({heal:'heart',buffAtk:'flame',buffDef:'shield',dot:'poison',execute:'target'}[effectType]||'blade'),c=colors[kind];
 const shapes={
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
