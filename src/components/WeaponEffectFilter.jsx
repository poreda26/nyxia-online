// Effects follow the clipped weapon silhouette; body pixels never seed the light.
export default function WeaponEffectFilter({effect,spread=1}){
 const {key,color,strong}=effect;
 if(key==='temper')return <>
  <feMorphology in="SourceAlpha" operator="dilate" radius={(strong?3:1.8)*spread} result="rim"/>
  <feComposite in="rim" in2="SourceAlpha" operator="out" result="edge"/>
  <feGaussianBlur in="edge" stdDeviation={(strong?3:1.5)*spread} result="soft"/>
  <feFlood floodColor={color} floodOpacity={strong?.8:.5}/><feComposite in2="soft" operator="in" result="glow"/>
  <feFlood floodColor="#f3f6fa" floodOpacity={strong?.6:.35}/><feComposite in2="edge" operator="in" result="shine"/>
  <feMerge><feMergeNode in="glow"/><feMergeNode in="shine"/></feMerge>
 </>;
 const lightning=key==='lightning',flame=key==='flame',ice=key==='ice';
 const radius=(strong?(lightning?22:18):(lightning?14:11))*spread;
 const core=flame?'#fff395':ice?'#ffffff':lightning?'#eaffff':'#f5c5ff';
 return <>
  <feMorphology in="SourceAlpha" operator="dilate" radius={radius} result="expanded"/>
  {lightning&&<feMorphology in="SourceAlpha" operator="dilate" radius={radius-(strong?6:4)*spread} result="innerArc"/>}
  <feComposite in="expanded" in2={lightning?'innerArc':'SourceAlpha'} operator="out" result="edge"/>
  <feTurbulence type="fractalNoise" baseFrequency={flame?'.035 .095':lightning?'.035':'.065'} numOctaves="2" seed="12" result="noise"/>
  <feDisplacementMap in="edge" in2="noise" scale={(lightning?(strong?52:34):flame?(strong?30:19):ice?6:13)*spread} xChannelSelector="R" yChannelSelector="G" result="energy"/>
  <feOffset in="energy" dy={flame?-9*spread:0} result="lifted"/>
  <feGaussianBlur in="lifted" stdDeviation={lightning?.7:flame?3:ice?6:4} result="softEdge"/>
  <feFlood floodColor={color}/><feComposite in2="softEdge" operator="in" result="aura"/>
  <feFlood floodColor={core} floodOpacity={lightning?1:0}/><feComposite in2="softEdge" operator="in" result="arcCore"/>
  <feGaussianBlur in="aura" stdDeviation={(strong?12:7)*spread} result="bloom"/>
  <feMorphology in="SourceAlpha" operator="dilate" radius={ice?5:2.5} result="rim"/>
  <feComposite in="rim" in2="SourceAlpha" operator="out" result="rimEdge"/>
  <feFlood floodColor={core}/><feComposite in2="rimEdge" operator="in" result="lightRim"/>
  <feFlood floodColor={core} floodOpacity={ice?.23:flame?.18:0}/><feComposite in2="SourceAlpha" operator="in" result="surface"/>
  <feMerge><feMergeNode in="bloom"/><feMergeNode in="aura"/><feMergeNode in="arcCore"/><feMergeNode in="lightRim"/><feMergeNode in="surface"/></feMerge>
 </>;
}
