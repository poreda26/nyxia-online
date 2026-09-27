import {build} from 'esbuild';
import {mkdtemp,rm,rmdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
const files={'warzone':'tests/warzone-updates.js','admin-loot':'tests/admin-loot-runtime.js'};
const entry=files[process.argv[2]];if(!entry)throw new Error('Test seçimi: warzone veya admin-loot');
const dir=await mkdtemp(join(tmpdir(),'nyxia-test-')),outfile=join(dir,'test.mjs');
try{
 await build({entryPoints:[entry],bundle:true,platform:'node',format:'esm',outfile,loader:{'.png':'dataurl','.svg':'dataurl','.webp':'dataurl','.jpg':'dataurl'},define:{'import.meta.env.DEV':'false'}});
 const result=spawnSync(process.execPath,[outfile],{stdio:'inherit'});process.exitCode=result.status??1;
}finally{await rm(outfile,{force:true});await rmdir(dir);}
