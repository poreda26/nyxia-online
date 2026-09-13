import {build} from 'esbuild';
import {writeFile} from 'node:fs/promises';
import {relative} from 'node:path';
const code=`import {BALANCED_WEAPONS} from './src/data/balancedWeapons';import {itemImageFor} from './src/data/itemImages';export default Object.entries(BALANCED_WEAPONS).flatMap(([cls,ws])=>ws.map(w=>({cls,name:w.name,type:w.weaponType,path:itemImageFor(w.name,1)})));`;
const result=await build({stdin:{contents:code,resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm',plugins:[{name:'asset-paths',setup(b){b.onLoad({filter:/\.(png|svg)$/},a=>({contents:'export default '+JSON.stringify(a.path),loader:'js'}));}}]});
const {default:weapons}=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
await writeFile('docs/character-weapon-plan.json',JSON.stringify(weapons.map(w=>({...w,path:w.path?relative(process.cwd(),w.path).replaceAll('\\','/'):null})),null,2)+'\n');
console.log(JSON.stringify({count:weapons.length,missing:weapons.filter(w=>!w.path),classes:Object.fromEntries(['warrior','rogue','mage'].map(c=>[c,weapons.filter(w=>w.cls===c).length]))}));
