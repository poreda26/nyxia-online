import {useId} from 'react';
export default function JewelArt({item,size=40}){
 const id=useId(),tier=item.tier||1,ward=item.defenseAbility?.vs;
 const color=ward?({sword:'#e897ad',axe:'#edaf62',longspear:'#a6de91',mace:'#b1b9cc',bow:'#82ddce',staff:'#bd9df6'}[ward]):({guardian:'#f6ad72',ranger:'#8bd9ad',arcane:'#ada8f8',starter:'#a7b1b2'}[item.family]||'#9bd0e0');
 const metal=tier>=5?'#eac587':tier>=3?'#b8cad9':'#a5977e';
 return <svg width={size} height={size} viewBox="0 0 80 80" aria-label={item.name} role="img" data-jewel-art={`${item.slot}-${item.family}-${tier}`}><defs><radialGradient id={id}><stop stopColor="#fff7dd"/><stop offset=".35" stopColor={color}/><stop offset="1" stopColor="#233141"/></radialGradient></defs>
 <rect x="2" y="2" width="76" height="76" rx="15" fill="#141b22"/>
 {tier===6&&<g fill={color} stroke={metal} strokeWidth="1"><path d="M8 22L5 8L21 5M59 5L75 8L72 22M8 58L5 72L21 75M59 75L75 72L72 58" fill="none"/>{[18,40,62].map(x=><path key={x} d={`M${x} 7l3 4-3 4-3-4Z`}/>)}</g>}
 <g fill="none" stroke={metal} strokeWidth="4">
 {item.slot==='ring'?<><ellipse cx="40" cy="46" rx="22" ry="24"/><ellipse cx="40" cy="46" rx="16" ry="19" strokeWidth="1"/></>:item.slot==='necklace'?<path d="M12 12Q10 57 40 58Q70 57 68 12M18 13Q20 44 40 50Q60 44 62 13"/>:item.slot==='earring'?<><path d="M28 30Q12 11 30 10Q42 14 30 28M52 30Q68 11 50 10Q38 14 50 28"/><path d="M28 28V37M52 28V37"/></>:<><path d="M8 29Q40 22 72 29V56Q40 49 8 56Z" fill="#4b3430"/><path d="M10 37H70M10 48H70" strokeWidth="1"/></>}
 </g>
 {(item.slot==='earring'?[28,52]:[40]).map(x=><g key={x} transform={`translate(${x} ${item.slot==='ring'?23:item.slot==='necklace'?57:43})`}><path d={tier>=5?'M0 -17L14 -8L11 12L0 18L-11 12L-14 -8Z':'M0 -13L11 0L0 15L-11 0Z'} fill={`url(#${id})`} stroke={metal} strokeWidth="2"/><path d="M0 -10L-6 0L0 9L6 0Z" fill="none" stroke="#fff" strokeOpacity=".6"/>{ward&&<path d={ward==='bow'?'M-5 -8Q11 0 -5 8M-5 -8L0 0L-5 8':ward==='staff'?'M0 -9L4 -3L0 2L-4 -3ZM0 2V10':ward==='axe'?'M0 -10V10M0 -7L8 -5L7 2L0 0':ward==='mace'?'M0 -3V11M-5 -8H5V-1H-5Z':ward==='longspear'?'M0 -12L4 -5L0 -2L-4 -5ZM0 -2V12':'M0 -11L3 -7L1 6H-1L-3 -7ZM-5 5H5M0 5V11'} stroke="#fff5d4" strokeWidth="1.8" fill="none"/>}</g>)}
 {tier>=3&&<path d="M9 11H19M14 6V16M61 65H71M66 60V70" stroke={metal} strokeWidth="1.5"/>}
 </svg>;
}
