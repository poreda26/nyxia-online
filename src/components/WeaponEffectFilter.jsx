// Effects follow the clipped weapon silhouette; body pixels never seed the light.
export default function WeaponEffectFilter({effect}){
 const {key,color,strong}=effect;
 const lightning=key==='lightning',flame=key==='flame',ice=key==='ice';
 const radius=strong?(lightning?22:18):(lightning?14:11);
 const core=flame?'#fff395':ice?'#ffffff':lightning?'#eaffff':'#f5c5ff';
 return <>
  <feMorphology in="SourceAlpha" operator="dilate" radius={radius} result="expanded"/>
  {lightning&&<feMorphology in="SourceAlpha" operator="dilate" radius={radius-(strong?6:4)} result="innerArc"/>}
  <feComposite in="expanded" in2={lightning?'innerArc':'SourceAlpha'} operator="out" result="edge"/>
  <feTurbulence type="fractalNoise" baseFrequency={flame?'.035 .095':lightning?'.035':'.065'} numOctaves="2" seed="12" result="noise"/>
  <feDisplacementMap in="edge" in2="noise" scale={lightning?(strong?52:34):flame?(strong?30:19):ice?6:13} xChannelSelector="R" yChannelSelector="G" result="energy"/>
  <feOffset in="energy" dy={flame?-9:0} result="lifted"/>
  <feGaussianBlur in="lifted" stdDeviation={lightning?.7:flame?3:ice?6:4} result="softEdge"/>
  <feFlood floodColor={color}/><feComposite in2="softEdge" operator="in" result="aura"/>
  <feFlood floodColor={core} floodOpacity={lightning?1:0}/><feComposite in2="softEdge" operator="in" result="arcCore"/>
  <feGaussianBlur in="aura" stdDeviation={strong?12:7} result="bloom"/>
  <feMorphology in="SourceAlpha" operator="dilate" radius={ice?5:2.5} result="rim"/>
  <feComposite in="rim" in2="SourceAlpha" operator="out" result="rimEdge"/>
  <feFlood floodColor={core}/><feComposite in2="rimEdge" operator="in" result="lightRim"/>
  <feFlood floodColor={core} floodOpacity={ice?.23:flame?.18:0}/><feComposite in2="SourceAlpha" operator="in" result="surface"/>
  <feMerge><feMergeNode in="bloom"/><feMergeNode in="aura"/><feMergeNode in="arcCore"/><feMergeNode in="lightRim"/><feMergeNode in="surface"/></feMerge>
 </>;
}
