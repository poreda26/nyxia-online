export default function ArmorEffectFilter({effect:e}){
 return <>
  <feMorphology in="SourceAlpha" operator="erode" radius={e.radius*.65} result="inner"/>
  <feComposite in="SourceAlpha" in2="inner" operator="out" result="rim"/>
  <feGaussianBlur in="rim" stdDeviation={e.blur} result="soft"/>
  <feFlood floodColor={e.color} floodOpacity={e.strong?.95:.7}/><feComposite in2="soft" operator="in" result="halo"/>
  <feFlood floodColor={e.color} floodOpacity={e.strong?.35+e.tier*.09:.35}/><feComposite in2="rim" operator="in" result="edge"/>
  <feFlood floodColor={e.color} floodOpacity={e.strong?.10+e.tier*.025:.035+e.tier*.01}/><feComposite in2="SourceAlpha" operator="in" result="surface"/>
  <feMerge><feMergeNode in="halo"/><feMergeNode in="edge"/><feMergeNode in="surface"/></feMerge>
 </>;
}
