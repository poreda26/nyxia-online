import actors from '../assets/battle/actors-v1.png';
import ashen from '../assets/battle/ashen-v1.png';
import frost from '../assets/battle/frost-v1.png';
import sanctuary from '../assets/battle/sanctuary-v1.png';
import abyss from '../assets/battle/abyss-v1.png';
import crimson from '../assets/battle/crimson-v1.png';
import {battleVisualFor} from './battleVisuals';
export const monsterAtlases={fallow:actors,ashen,frost,sanctuary,abyss,crimson};
// Individually framed faces, in original atlas pixels. Quadrupeds, hoods,
// horns and tall helmets cannot share one automatic top-center crop.
export const monsterFaceRects={
 fallow:[[4,844,166,166],[309,770,178,178],[576,845,172,172],[823,826,174,174],[1131,759,201,201]],
 ashen:[[89,38,236,236],[489,124,281,281],[1180,220,265,265],[85,484,239,239],[623,474,264,264],[1140,556,255,255]],
 frost:[[9,135,257,257],[593,174,292,292],[1148,48,192,192],[10,658,269,269],[653,527,171,171],[1200,506,179,179]],
 sanctuary:[[227,18,139,139],[665,2,148,148],[1171,4,189,189],[183,515,151,151],[659,482,161,161],[1070,522,163,163]],
 abyss:[[41,19,325,325],[666,78,160,160],[1048,34,264,264],[13,546,280,280],[663,529,159,159],[1122,527,218,218]],
 crimson:[[181,13,188,188],[707,25,176,176],[1059,12,276,276],[3,584,267,267],[520,501,257,257],[1026,630,239,239]],
};
export function monsterPortraitFor(monster){const art=battleVisualFor(monster);return art?{...art,source:monsterAtlases[art.atlas],face:monsterFaceRects[art.atlas][art.index]}:null;}
