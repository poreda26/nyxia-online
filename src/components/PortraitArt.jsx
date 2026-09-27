const crowns={
 knight:'M25 46L29 23L50 12L71 23L75 46L62 38L50 44L38 38Z M48 18H52V74H48Z',
 horns:'M29 39L16 16L18 43L33 53L50 37L67 53L82 43L84 16L71 39L62 22H38Z',
 ranger:'M20 63Q18 17 50 13Q82 17 80 63L66 39L50 29L34 39Z',
 mask:'M23 59L29 26L50 12L71 26L77 59L66 42L50 30L34 42Z M31 58L50 63L69 58L62 77H38Z',
 oracle:'M24 40L28 13L41 28L50 10L59 28L72 13L76 40L50 33Z',
 seer:'M19 68L28 29L40 24L50 8L60 24L72 29L81 68L64 39L50 31L36 39Z',
};
export default function PortraitArt({art,uid}){
 const metal=`${uid}-metal`,bg=`${uid}-bg`;
 return <svg viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id={bg}><stop stopColor={art.color} stopOpacity=".5"/><stop offset="1" stopColor="#0a101c"/></radialGradient><linearGradient id={metal} x2="1" y2="1"><stop stopColor="#f0e7d0"/><stop offset=".4" stopColor={art.color}/><stop offset="1" stopColor="#273443"/></linearGradient></defs>
 <path fill={`url(#${bg})`} d="M0 0H100V100H0Z"/><circle cx="50" cy="46" r="38" fill="none" stroke={art.color} strokeOpacity=".35"/>
 <path d="M7 100L15 79L37 70H63L85 79L93 100" fill={`url(#${metal})`} stroke="#172331" strokeWidth="3"/>
 <path d="M32 37Q50 22 68 37L66 62Q63 74 50 79Q37 74 34 62Z" fill={art.portrait==='horns'?'#817d58':'#b2947e'} stroke="#29262b" strokeWidth="2"/>
 <path d="M50 42L46 60L53 61M43 68L50 70L57 68" fill="none" stroke="#64505a" strokeWidth="2"/>
 <path d="M35 48L45 50M55 50L65 48" stroke="#192534" strokeWidth="5"/><path d="M37 49H43M57 49H63" stroke={art.color} strokeWidth="2"/>
 <path d={crowns[art.portrait]} fill={`url(#${metal})`} stroke="#22303d" strokeWidth="2" strokeLinejoin="round"/>
 <path d="M16 85L34 81L50 95L66 81L84 85M30 100L34 81M70 100L66 81" fill="none" stroke={art.color} strokeWidth="2"/>
 <path d="M50 82L55 88L50 94L45 88Z" fill={art.color}/>
 </svg>;
}
