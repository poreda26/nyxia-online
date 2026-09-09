import {MAPS} from './maps.js';
import {battleAtlasBounds} from './battleAtlasBounds.js';

const regions = {
  fallow_valley:{atlas:'fallow',background:0,boss:4},
  ashen_canyon:{atlas:'ashen',background:1,boss:4},
  frostburn_summit:{atlas:'frost',background:2,boss:5},
  ruined_sanctuary:{atlas:'sanctuary',background:3,boss:4},
  abyssal_pit:{atlas:'abyss',background:4,boss:5},
  crimson_battlefront:{atlas:'crimson',background:5,boss:4},
};
const fallowRects=[[3,830,284,245],[289,761,290,325],[577,826,260,251],[833,817,270,263],[1060,757,388,329]];
// Only visual identity. Dungeon stats and reward rules stay in their existing modules.
export function battleVisualFor(monster){
  for(const map of MAPS){
    let index=map.monsters.findIndex(m=>m.id===monster?.id);
    const dungeon=monster?.id?.startsWith(`dungeon_${map.id}_`);
    if(index<0&&!dungeon) continue;
    const region=regions[map.id];
    if(dungeon) index=monster.isBoss?region.boss:map.monsters.length-1;
    return {...region,mapId:map.id,index,rect:region.atlas==='fallow'?fallowRects[index]:battleAtlasBounds[region.atlas][index],size:region.atlas==='fallow'?[1448,1086]:[1536,1024]};
  }
  return null;
}
