import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {createApi} from '../server/app.mjs';
test('owner panel: deny GM/anonymous, preserve revisions, restore, ban, audit, survive restart',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'nyxia-owner-')),database=join(dir,'test.sqlite');
 let app=createApi({database,origin:'http://test.local',secure:false});
 await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
 let url=`http://127.0.0.1:${app.server.address().port}`;
 async function call(path,body,cookie,origin='http://test.local',method=body?'POST':'GET'){
  const r=await fetch(url+'/api/'+path,{method,headers:{Origin:origin,'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},...(body?{body:JSON.stringify(body)}:{})});
  return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};
 }
 try{
  const a=await call('register',{name:'owner',password:'test-long-password-123'}), b=await call('register',{name:'friend',password:'test-long-password-123'});
  assert.equal((await call('admin/overview')).status,401);
  assert.equal((await call('admin/overview',null,a.cookie)).status,403);
  const db=new DatabaseSync(database);db.prepare('INSERT INTO panel_owner VALUES(1,1)').run();db.close();
  const data={characters:[{id:'hero',name:'Tester',isGM:true,level:5,gold:500,inventory:[{id:'weapon-1',upgradeLevel:8}],quests:{test:true}},null,null],bank:[],diamonds:100};
  assert.equal((await call('backup',{revision:0,data},b.cookie,undefined,'PUT')).status,200);
  for(const path of ['overview','accounts','account?id=2','chat','clans','market','duels','audit']){
   assert.equal((await call('admin/'+path,null,b.cookie)).status,403);
   const r=await call('admin/'+path,null,a.cookie);assert.equal(r.status,200,path);
   assert.ok(!JSON.stringify(r.data).includes('"password"'));
  }
  const edited=structuredClone(data);edited.diamonds=250;
  assert.equal((await call('admin/account/save',{id:2,revision:1,data:edited,reason:'test adjustment'},b.cookie)).status,403);
  assert.equal((await call('admin/account/save',{id:2,revision:1,data:edited,reason:'test adjustment'},a.cookie,'http://evil.local')).status,403);
  assert.equal((await call('admin/account/save',{id:2,revision:1,data:edited,reason:'test adjustment'},a.cookie)).status,200);
  assert.equal((await call('backup',{revision:1,data},b.cookie,undefined,'PUT')).status,409);
  let detail=(await call('admin/account?id=2',null,a.cookie)).data;
  assert.deepEqual(detail.data.characters,data.characters);assert.equal(detail.snapshots.length,1);
  assert.equal((await call('admin/account/save',{id:2,revision:2,data:{...edited,characters:[null,null,null]},reason:'bad deletion'},a.cookie)).status,400);
  assert.equal((await call('admin/account/restore',{id:2,revision:2,snapshot:detail.snapshots[0].id,reason:'undo test'},a.cookie)).status,200);
  assert.deepEqual((await call('backup',null,b.cookie)).data.data,data);
  assert.equal((await call('admin/account/block',{id:1,blocked:true,reason:'lock owner'},a.cookie)).status,400);
  assert.equal((await call('admin/account/block',{id:2,blocked:true,reason:'test ban'},a.cookie)).status,200);
  assert.equal((await call('backup',null,b.cookie)).status,401);
  assert.equal((await call('login',{name:'friend',password:'test-long-password-123'})).status,403);
  assert.equal((await call('admin/account/block',{id:2,blocked:false,reason:'test unban'},a.cookie)).status,200);
  assert.equal((await call('login',{name:'friend',password:'test-long-password-123'})).status,200);
  assert.equal((await call('admin/audit',null,a.cookie)).data.length,4);
  await app.close(); app=createApi({database,origin:'http://test.local',secure:false});
  await new Promise(r=>app.server.listen(0,'127.0.0.1',r)); url=`http://127.0.0.1:${app.server.address().port}`;
  assert.equal((await call('admin/overview',null,a.cookie)).status,200);
  assert.equal((await call('admin/account?id=2',null,a.cookie)).data.snapshots.length,2);
 }finally{await app.close();rmSync(dir,{recursive:true});}
});
