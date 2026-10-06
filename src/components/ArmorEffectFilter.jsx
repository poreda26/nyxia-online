export default function ArmorEffectFilter({effect:e}){
 return <>
  {/* Slot masks contain artificial cut edges. Lighting their rims outlines
      every joint, so use a softly inset surface light instead. */}
  <feMorphology in="SourceAlpha" operator="erode" radius={e.radius} result="inner"/>
  <feGaussianBlur in="inner" stdDeviation={e.blur*1.5} result="soft"/>
  <feComposite in="soft" in2="SourceAlpha" operator="in" result="surface"/>
  <feFlood floodColor={e.color} floodOpacity={e.strong?.26+e.tier*.035:.12+e.tier*.022}/>
  <feComposite in2="surface" operator="in"/>
 </>;
}
