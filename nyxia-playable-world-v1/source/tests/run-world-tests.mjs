import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const directory=await mkdtemp(join(tmpdir(),'nyxia-world-'));
try {
  const outfile=join(directory,'world.test.cjs');
  await build({entryPoints:['tests/world.test.js'],bundle:true,platform:'node',format:'cjs',outfile,loader:{'.png':'dataurl','.svg':'dataurl'}});
  const result=spawnSync(process.execPath,['--test',outfile],{stdio:'inherit'});
  process.exitCode=result.status??1;
} finally {await rm(directory,{recursive:true,force:true});}
