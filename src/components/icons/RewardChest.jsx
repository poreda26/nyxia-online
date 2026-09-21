import {useId} from 'react';
export default function RewardChest({size=88}){
 const id=useId();
 return <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
 <defs><linearGradient id={id} x2="0" y2="1"><stop stopColor="#fff1b6"/><stop offset=".5" stopColor="#deb867"/><stop offset="1" stopColor="#855124"/></linearGradient><radialGradient id={`${id}-glow`}><stop stopColor="#ffc956" stopOpacity=".5"/><stop offset="1" stopColor="#ffc956" stopOpacity="0"/></radialGradient></defs>
 <circle cx="50" cy="49" r="48" fill={`url(#${id}-glow)`}/>
 <path d="M20 49Q20 27 39 27H65Q81 28 81 48L75 78L28 83Z" fill="#3d2735" stroke={`url(#${id})`} strokeWidth="3"/>
 <path d="M20 49L67 53L81 48M67 53L65 79M31 31Q27 40 29 50L35 81M60 28Q68 35 67 53" stroke={`url(#${id})`} strokeWidth="5"/>
 <path d="M20 49L67 53L81 48" stroke="#fff3bd" strokeWidth="2"/>
 <path d="M44 48L54 49L54 64L44 63Z" fill={`url(#${id})`}/><path d="M49 53V58" stroke="#472b26" strokeWidth="2"/>
 <path d="M49 7L52 17L62 20L52 23L49 33L46 23L36 20L46 17Z" fill="#fff2b8"/><path d="M81 17L83 23L89 25L83 27L81 33L79 27L73 25L79 23Z" fill="#edc979"/>
 </svg>;
}
