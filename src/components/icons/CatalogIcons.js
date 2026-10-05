import {createElement as h,useId} from 'react';
// Plain JS keeps data catalog imports compatible with Node's ESM loader.
const art={"Sparkles": "M16 2L20 12L30 16L20 20L16 30L12 20L2 16L12 12Z", "Flame": "M16 2Q24 10 18 15L25 10Q35 28 16 30Q0 28 6 15L12 9Q8 23 15 19Q20 13 16 2Z", "Moon": "M23 3A14 14 0 1 0 29 24A16 16 0 0 1 23 3Z", "Shield": "M16 3L28 8V18Q27 25 16 30Q5 25 4 18V8Z", "ShieldHalf": "M16 3L28 8V18Q27 25 16 30Q5 25 4 18V8ZM16 4V29", "Skull": "M8 21Q0 5 16 3Q32 5 24 21L23 29H9ZM10 12L14 15L10 18L7 15ZM22 12L18 15L22 18L25 15Z", "Compass": "M30 16A14 14 0 1 1 2 16A14 14 0 1 1 30 16ZM21 10L18 20L10 23L13 13Z", "Mountain": "M2 28L13 4L19 17L24 9L31 28ZM9 14L13 17L17 14", "Crown": "M3 8L10 15L16 3L22 15L29 8L25 28H7Z", "Hammer": "M8 29L21 12M15 5L22 1L31 12L25 18Z", "Swords": "M4 2L8 4L26 25L23 28L5 9ZM28 2L24 4L6 25L9 28L27 9Z", "Gift": "M3 12H29V29H3ZM2 8H30V15H2ZM16 8V29M16 8C1 5 9 -4 16 8C31 5 23 -4 16 8"};
function icon(name){return function CatalogIcon({size=24,...props}){const id=useId();return h('svg',{viewBox:'0 0 32 32',width:size,height:size,fill:`url(#${id})`,stroke:'#f2d99c',strokeWidth:1.5,strokeLinejoin:'round','aria-hidden':true,...props},h('defs',null,h('linearGradient',{id,x2:'1',y2:'1'},h('stop',{stopColor:'#f9e4aa'}),h('stop',{offset:'.55',stopColor:'#bca16a'}),h('stop',{offset:'1',stopColor:'#735137'}))),h('path',{d:art[name]}));}}
export const Sparkles=icon('Sparkles');
export const Flame=icon('Flame');
export const Moon=icon('Moon');
export const Shield=icon('Shield');
export const ShieldHalf=icon('ShieldHalf');
export const Skull=icon('Skull');
export const Compass=icon('Compass');
export const Mountain=icon('Mountain');
export const Crown=icon('Crown');
export const Hammer=icon('Hammer');
export const Swords=icon('Swords');
export const Gift=icon('Gift');
