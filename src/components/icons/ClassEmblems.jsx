import {useId} from 'react';
function Emblem({type,size=24,color,...props}) {
 const id=useId(),accent=type==='warrior'?'#e99b68':type==='rogue'?'#8be0ae':'#b9a1ff';
 return <svg {...props} width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
  <defs><linearGradient id={id} x2=".8" y2="1"><stop stopColor="#fff2cb"/><stop offset=".48" stopColor="#c5a473"/><stop offset="1" stopColor="#725130"/></linearGradient></defs>
  <path d="M32 3L56 15V37L45 52L32 61L19 52L8 37V15Z" fill="#121c26" stroke={`url(#${id})`} strokeWidth="2"/>
  <path d="M32 8L51 18V36L41 48L32 55L23 48L13 36V18Z" fill={accent} fillOpacity=".13" stroke={accent} strokeOpacity=".35"/>
  {type==='warrior'?<g strokeLinejoin="round"><path d="M32 10L38 22L34 41H30L26 22Z" fill="#dceaf0" stroke="#738a9d"/><path d="M21 37L32 41L43 37L41 43L34 45V53H30V45L23 43Z" fill={`url(#${id})`}/><path d="M32 14V37" stroke="white"/></g>:type==='rogue'?<g strokeLinecap="round" strokeLinejoin="round"><path d="M22 12Q53 32 22 52" stroke={`url(#${id})`} strokeWidth="5"/><path d="M22 12L30 32L22 52" stroke="#d5ecdc" strokeWidth="1.4"/><path d="M14 40L46 23" stroke="#d6e7dd" strokeWidth="3"/><path d="M47 22L40 24L44 29Z" fill={accent}/><path d="M14 40L14 34M18 38L18 32" stroke={accent} strokeWidth="2"/></g>:<g><path d="M28 34L24 53L30 55L35 34" fill={`url(#${id})`}/><path d="M34 10L43 24L34 39L24 24Z" fill={accent} stroke="#efe5ff" strokeWidth="1.5"/><path d="M34 10L33 26L43 24M33 26L34 39L24 24Z" fill="#6659b4"/><path d="M20 19L17 22M47 34L50 37M46 13V18M44 15H49" stroke="#e6d2ff" strokeWidth="2"/></g>}
 </svg>;
}
export const WarriorEmblem=props=><Emblem {...props} type="warrior"/>;
export const RogueEmblem=props=><Emblem {...props} type="rogue"/>;
export const MageEmblem=props=><Emblem {...props} type="mage"/>;
