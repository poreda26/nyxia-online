import {DEFAULT_DROP_CONFIG} from '../src/data/dropRules.js';
import {LOOT_ADMIN_CATALOG} from '../src/data/lootAdminCatalog.js';
import {MAPS} from '../src/data/maps.js';
import {WARZONE_BOSSES} from '../src/data/warzone.js';
const catalog=new Map(LOOT_ADMIN_CATALOG.map(x=>[x.key,x]));
export const dropMetadata={maps:MAPS.map(m=>({id:m.id,name:m.name,monsters:[...m.monsters.map(x=>({id:x.id,name:x.name})),{id:`map_boss_${m.id}`,name:`${m.name} Muhafızı`}]})),bosses:WARZONE_BOSSES.map(b=>({id:b.id,name:b.name})),catalog:LOOT_ADMIN_CATALOG};
export function validateDropRules(raw){
 const fail=()=>{throw Object.assign(new Error('INVALID_DROP_SETTINGS'),{status:400});};
 const table=value=>{
  if(!Array.isArray(value)||!value.length||value.length>100)fail();
  return value.map(x=>{const item=catalog.get(x?.key);if(!item||!Number.isFinite(x.weight)||x.weight<=0||x.weight>100000||!Number.isInteger(x.level)||x.level<1||x.level>(item.maxLevel||8))fail();return {key:x.key,weight:x.weight,level:x.level};});
 };
 const walk=(base,input)=>{
  if(!input||typeof input!=='object'||Array.isArray(input))fail();
  const result=structuredClone(base);
  for(const [key,v] of Object.entries(input)){
   if(key==='loot' && (Object.hasOwn(base,'dropChance')||Object.hasOwn(base,'equipDropChance'))){result.loot=v===null?null:table(v);continue;}
   if(!Object.hasOwn(base,key))fail();
   if(typeof base[key]==='object')result[key]=walk(base[key],v);
   else {
    const chance=/Chance$|Pct$/.test(key),max=chance?1:/Mult$/.test(key)?100:10000000;
    if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>max||(!chance&&!/Mult$/.test(key)&&!Number.isInteger(v)))fail();
    if(key==='guaranteedChests' && v>10)fail();
    if(key==='guaranteedChestTier' && (v<1||v>6))fail();
    result[key]=v;
   }
  }
  for(const [min,max] of [['goldMin','goldMax'],['bonusGoldMin','bonusGoldMax']])if(result[min]>result[max])fail();
  if(result.weaponPct+result.armorPct>1.00000001)fail();
  return result;
 };
 if(!raw||typeof raw!=='object'||Array.isArray(raw))fail();
 const {chestTables,...rest}=raw;const result=walk(DEFAULT_DROP_CONFIG,rest);
 if(chestTables!==undefined){if(!chestTables||typeof chestTables!=='object'||Array.isArray(chestTables))fail();result.chestTables={};for(const [key,value] of Object.entries(chestTables)){if(!['1','2','3','4','5','6','special'].includes(key))fail();result.chestTables[key]=value===null?null:table(value);}}
 return result;
}
export function createDropSettings(db){
 db.exec(`CREATE TABLE IF NOT EXISTS live_drop_settings(id INTEGER PRIMARY KEY CHECK(id=1), revision INTEGER NOT NULL,data TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS drop_settings_history(revision INTEGER PRIMARY KEY,data TEXT NOT NULL,created_at INTEGER NOT NULL);`);
 const get=()=>{const row=db.prepare('SELECT * FROM live_drop_settings WHERE id=1').get();return {revision:row?.revision||0,data:row?JSON.parse(row.data):structuredClone(DEFAULT_DROP_CONFIG)};};
 const save=(revision,raw)=>{const current=get();if(current.revision!==revision)throw Object.assign(new Error('DROP_CONFLICT'),{status:409});const data=validateDropRules(raw);db.prepare('INSERT OR IGNORE INTO drop_settings_history VALUES(?,?,?)').run(current.revision,JSON.stringify(current.data),Date.now());db.prepare('INSERT OR REPLACE INTO live_drop_settings VALUES(1,?,?)').run(revision+1,JSON.stringify(data));return {revision:revision+1,data};};
 return {get,save};
}
