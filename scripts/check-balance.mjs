import {build} from 'esbuild';
import {writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
await build({entryPoints:['tests/balance-fixtures.js'],bundle:true,platform:'node',format:'cjs',outfile:'output/balance-fixtures.cjs',loader:{'.png':'dataurl','.svg':'dataurl'}});
const require=createRequire(import.meta.url),{matrix}=require('../output/balance-fixtures.cjs');
const samples=Number(process.env.SAMPLES||200);const result={samplesPerCase:samples,...matrix(samples)};await writeFile(process.argv[2]||'output/balance-final.json',JSON.stringify(result,null,2));
console.table(result.pvp);console.table(result.pve.filter(r=>r.cls==='warrior'));

for(const [name,file] of [['bonuses','tests/balance-bonuses.js'],['bosses','tests/balance-bosses.js']]){
 await build({entryPoints:[file],bundle:true,platform:'node',format:'cjs',outfile:`output/${name}.cjs`,loader:{'.png':'dataurl','.svg':'dataurl'}});
 const {execFileSync}=await import('node:child_process');await writeFile(`output/balance-${name}.json`,execFileSync(process.execPath,[`output/${name}.cjs`]));
}
