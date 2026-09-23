import './SkillEffect.css';
// Short, bounded SVG effects share the combat event; no damage timers here.
export default function SkillEffect({id,type}) {
 const cls=id?.[0], n=Number(id?.slice(1));
 const support=['heal','buffAtk','buffDef'].includes(type);
 const mode=support?(type==='heal'?'heal':'aura'):cls==='w'?(n===7?'quake':n===6?'bleed':'slash'):cls==='r'?(n===6?'poison':'arrow'):({3:'fire',5:'lightning',6:'fire',7:'ice',8:'soul',9:'meteor',11:'soul',13:'meteor'}[n]||'arcane');
 const color={heal:'#91ffc3',aura:'#ffe5a1',slash:'#ffda99',bleed:'#ff7384',quake:'#eab675',arrow:'#dcffc4',poison:'#ce8cff',fire:'#ffad54',lightning:'#b7f4ff',ice:'#93e9ff',soul:'#dcadff',meteor:'#ffc478',arcane:'#b7a6ff'}[mode];
 return <svg className={`skill-fx skill-fx-${mode} ${support?'skill-fx-self':''}`} viewBox="0 0 100 100" aria-hidden="true" data-skill-effect={id} style={{'--skill-light':color}}>
 <g className="skill-fx-mark" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
 {mode==='slash'||mode==='bleed'?<><path d="M18 80Q88 65 76 17Q55 58 18 80"/>{[5,9,13].includes(n)&&<path d="M20 19Q28 75 85 73Q44 51 20 19"/>}</>:mode==='arrow'||mode==='poison'?<>{(n===5?[-12,12]:n===13?[-18,0,18]:[0]).map(y=><path key={y} transform={`translate(0 ${y})`} d="M8 60L82 38L70 34M82 38L75 49M16 58L9 50M16 58L13 67"/>)}</>:mode==='lightning'?<path d="M39 5L23 37L45 32L34 64L61 47L51 94M45 32L79 18L65 42L88 57"/>:mode==='ice'?<>{[0,60,120].map(a=><path key={a} transform={`rotate(${a} 50 50)`} d="M50 10V90M37 22L50 34L63 22M37 78L50 66L63 78"/>)}</>:mode==='heal'?<><path d="M50 24V76M24 50H76" strokeWidth="7"/><circle cx="50" cy="50" r="35"/></>:mode==='quake'?<path d="M5 70L25 57L38 72L52 43L66 65L91 53M20 82L44 78L61 90L86 76"/>:mode==='fire'||mode==='meteor'?<><path d="M52 8Q25 39 29 62Q31 92 60 84Q89 73 70 40L64 57Q47 44 52 8Z"/>{mode==='meteor'&&<path d="M62 8L82 0M73 26L97 2M27 43L50 0"/>}</>:<><ellipse cx="50" cy="50" rx="37" ry="20"/><ellipse cx="50" cy="50" rx="20" ry="37"/><path d="M50 22L59 42L80 50L59 58L50 78L41 58L20 50L41 42Z"/></>}
 </g><circle className="skill-fx-ring" cx="50" cy="50" r="25" fill="none" stroke={color}/>
 </svg>;
}
