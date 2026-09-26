import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApi} from '../server/app.mjs';
test('avatar migration, public/private messages, clan selection and leader-only changes survive restart',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'nyxia-avatars-')),database=join(dir,'test.sqlite'),origin='http://localhost:5177';
 const old=new DatabaseSync(database);old.exec("CREATE TABLE chat_messages(id INTEGER PRIMARY KEY AUTOINCREMENT,author TEXT NOT NULL,text TEXT NOT NULL,is_gm INTEGER NOT NULL,created_at INTEGER NOT NULL);INSERT INTO chat_messages(author,text,is_gm,created_at) VALUES('old','kept',0,1)");old.close();
 let api=createApi({database,origin,secure:false}),url;
 const listen=async()=>{await new Promise(ok=>api.server.listen(0,'127.0.0.1',ok));url=`http://127.0.0.1:${api.server.address().port}/api/`;};
 const call=async(path,method='GET',body,cookie)=>{const r=await fetch(url+path,{method,headers:{Origin:origin,'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};};
 try{
  await listen();const a=await call('register','POST',{name:'avataralice',password:'long-test-password'}),b=await call('register','POST',{name:'avatarbob',password:'long-test-password'});
  const oldRows=await call('chat/messages','GET',null,a.cookie);assert.equal(oldRows.body[0].text,'kept');assert.equal(oldRows.body[0].avatarId,'human-warrior');
  assert.equal((await call('chat/messages','POST',{author:'Alice',text:'hello',avatarId:'karus-mage'},a.cookie)).status,200);
  assert.equal((await call('chat/messages','GET',null,b.cookie)).body.at(-1).avatarId,'karus-mage');
  assert.equal((await call('chat/messages','POST',{author:'Alice',text:'bad',avatarId:'https://other/image'},a.cookie)).status,400);
  await call('social/friends/request','POST',{name:'avatarbob'},a.cookie);await call('social/friends/request','POST',{name:'avataralice'},b.cookie);
  const friend=(await call('social/friends','GET',null,a.cookie)).body.friends[0];
  assert.equal((await call(`social/messages/${friend.accountId}`,'POST',{text:'private',avatarId:'human-rogue'},a.cookie)).status,200);
  assert.equal((await call(`social/messages/${friend.accountId}`,'GET',null,a.cookie)).body[0].avatarId,'human-rogue');
  assert.equal((await call('clan','POST',{name:'Test Guardians',avatarId:'dragon'},a.cookie)).status,200);
  assert.equal((await call('clan/mine','GET',null,a.cookie)).body.clan.avatarId,'dragon');
  await call('clan/invite','POST',{name:'avatarbob'},a.cookie);const invite=(await call('clan/invites','GET',null,b.cookie)).body[0];assert.equal(invite.avatarId,'dragon');
  await call(`clan/invites/${invite.id}/accept`,'POST',{},b.cookie);
  assert.equal((await call('clan/avatar','PATCH',{avatarId:'moon'},b.cookie)).status,403);
  assert.equal((await call('clan/avatar','PATCH',{avatarId:'unknown'},a.cookie)).status,400);
  assert.equal((await call('clan/avatar','PATCH',{avatarId:'phoenix'},a.cookie)).status,200);
  await api.close();api=createApi({database,origin,secure:false});await listen();
  assert.equal((await call('clan/mine','GET',null,b.cookie)).body.clan.avatarId,'phoenix');
  assert.equal((await call('chat/messages','GET',null,b.cookie)).body.at(-1).avatarId,'karus-mage');
 }finally{await api.close();rmSync(dir,{recursive:true});}
});
