import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {mkdtempSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createApi} from '../server/app.mjs';
import {DatabaseSync} from 'node:sqlite';
import {migrateCharacterClans} from '../server/clan-characters.mjs';
test('characters isolate membership, invitations, rank, donations and dungeon turns',async()=>{
 const dbFile=join(mkdtempSync(join(tmpdir(),'nyxia-clans-')),'t.sqlite');
 const api=createApi({database:dbFile,secure:false,origin:'http://localhost:5177'});
 await new Promise(r=>api.server.listen(0,'127.0.0.1',r));const url=`http://127.0.0.1:${api.server.address().port}/api/`;
 let cookie;
 const call=async(path,key,body,method=body?'POST':'GET')=>{const r=await fetch(url+path,{method,headers:{Origin:'http://localhost:5177','Content-Type':'application/json',...(cookie?{Cookie:cookie}:{}),...(key?{'X-Character-Key':key}:{})},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};};
 try{
  cookie=(await call('register',null,{name:'clantester',password:'test-password-long'})).cookie;
  const data={characters:[{id:'hero',nickname:'MainHero',level:50},{id:'alt',nickname:'AltHero',level:20},null],bank:[[]],diamonds:10000};
  assert.equal((await call('backup',null,{revision:0,data},'PUT')).status,200);
  { const grant=new DatabaseSync(dbFile); grant.prepare('UPDATE wallets SET diamonds=5000').run(); grant.close(); }
  assert.equal((await call('clan','hero',{name:'First Clan'})).status,200);
  assert.equal((await call('clan/mine','alt')).data.clan,null);
  assert.equal((await call('backup',null,{revision:1,data:{...data,characters:[null,data.characters[1],null]}},'PUT')).status,409);
  assert.equal((await call('clan/mine','forged')).status,409);
  assert.equal((await call('clan/donate','alt',{currency:'np',amount:10})).status,409);
  assert.equal((await call('clan/invite','hero',{name:'AltHero'})).status,200);
  assert.equal((await call('clan/invites','hero')).data.length,0);
  const invite=(await call('clan/invites','alt')).data[0];assert.ok(invite);
  assert.equal((await call(`clan/invites/${invite.id}/accept`,'hero',{})).status,409);
  assert.equal((await call(`clan/invites/${invite.id}/accept`,'alt',{})).status,200);
  const clan=(await call('clan/mine','hero')).data.clan;
  assert.deepEqual(clan.members.map(m=>m.name).sort(),['AltHero','MainHero']);
  assert.equal((await call('clan/avatar','alt',{avatarId:'wolf'},'PATCH')).status,403);
  const vault=(await call('clan/vault','hero')).data;
  assert.equal(vault.capacity,60);assert.equal(vault.role,'leader');
  assert.equal((await call('clan/permissions','alt',{permissions:vault.permissions},'PATCH')).status,403);
  const restricted=structuredClone(vault.permissions);restricted.member.donate=false;restricted.member.dungeon=false;restricted.member.invite=false;
  assert.equal((await call('clan/permissions','hero',{permissions:restricted},'PATCH')).status,200);
  assert.equal((await call('clan/donate','alt',{currency:'np',amount:15})).status,403);
  assert.equal((await call('clan/dungeon/enter','alt',{})).status,403);
  assert.equal((await call('clan/invite','alt',{name:'Nobody'})).status,403);
  assert.equal((await call('clan/permissions','hero',{permissions:vault.permissions},'PATCH')).status,200);

  assert.equal((await call('clan/donate','alt',{currency:'np',amount:15})).status,200);
  assert.equal((await call('clan/mine','hero')).data.clan.myDonatedNp,0);
  assert.equal((await call('clan/mine','alt')).data.clan.myDonatedNp,15);
  assert.equal((await call('clan/dungeon/enter','hero',{})).status,200);
  assert.equal((await call('clan/dungeon','alt')).data.lockedByMe,false);
  assert.equal((await call('clan/dungeon/enter','alt',{})).status,409);
  assert.equal((await call('clan/dungeon/attack','alt',{damage:1})).status,403);
  assert.equal((await call('clan/dungeon/attack','hero',{damage:0})).status,200);
  assert.equal((await call('clan/dungeon/leave','alt',{})).status,200);
  assert.equal((await call('clan/dungeon','hero')).data.lockedByMe,true);
  await call('clan/dungeon/leave','hero',{});
  assert.equal((await call('clan/dungeon/enter','alt',{})).status,200);
  assert.equal((await call('clan/dungeon','hero')).data.attempts.entriesUsed,1);
  await call('clan/dungeon/leave','alt',{});
  assert.equal((await call('clan/promote','hero',{accountId:1,characterKey:'alt'})).status,200);
  assert.equal((await call('clan/mine','alt')).data.clan.myRole,'officer');
  assert.equal((await call('clan/leave','hero',{})).status,200);
  assert.equal((await call('clan/mine','hero')).data.clan,null);
  assert.equal((await call('clan/mine','alt')).data.clan.myRole,'leader');
  {const grant=new DatabaseSync(dbFile);grant.prepare('INSERT INTO clan_vault(clan_id,item,created_at) VALUES(?,?,?)').run(clan.id,JSON.stringify({id:'kept',kind:'weapon'}),Date.now());grant.close();}
  assert.equal((await call('clan/leave','alt',{})).status,409,'last member cannot destroy stored items');
  assert.equal((await call('clan/mine','alt')).data.clan.myRole,'leader');
  {const grant=new DatabaseSync(dbFile);grant.prepare('DELETE FROM clan_vault WHERE clan_id=?').run(clan.id);grant.close();}
  assert.equal((await call('clan/leave','alt',{})).status,200);
 }finally{await api.close();}
});
test('legacy migration preserves clan, rank, donations and attempts on the old main character only',()=>{
 const db=new DatabaseSync(':memory:');
 db.exec(`PRAGMA foreign_keys=ON;
 CREATE TABLE accounts(id INTEGER PRIMARY KEY);INSERT INTO accounts VALUES(1);
 CREATE TABLE backups(account INTEGER PRIMARY KEY,data TEXT);INSERT INTO backups VALUES(1,'{"characters":[{"level":5},{"level":50}]}');
 CREATE TABLE clans(id INTEGER PRIMARY KEY);INSERT INTO clans VALUES(9);
 CREATE TABLE clan_members(account_id INTEGER PRIMARY KEY,clan_id INTEGER,role TEXT,joined_at INTEGER,donated_np INTEGER);INSERT INTO clan_members VALUES(1,9,'leader',123,555);
 CREATE TABLE clan_invites(id INTEGER PRIMARY KEY,clan_id INTEGER,from_account INTEGER,to_account INTEGER,created_at INTEGER);
 CREATE TABLE clan_dungeon_attempts(account_id INTEGER,day_key TEXT,entries_used INTEGER,first_entry_at INTEGER);INSERT INTO clan_dungeon_attempts VALUES(1,'today',1,123);
 CREATE TABLE clan_dungeon_state(clan_id INTEGER,locked_by INTEGER);INSERT INTO clan_dungeon_state VALUES(9,1);`);
 try{migrateCharacterClans(db);migrateCharacterClans(db);
  assert.deepEqual({...db.prepare('SELECT * FROM clan_members').get()},{account_id:1,character_key:'slot:1',clan_id:9,role:'leader',joined_at:123,donated_np:555});
  assert.equal(db.prepare('SELECT * FROM clan_dungeon_attempts').get().character_key,'slot:1');
  assert.equal(db.prepare('SELECT * FROM clan_dungeon_state').get().locked_character,'slot:1');
  assert.equal(db.prepare('SELECT COUNT(*) n FROM clan_members_migration_backup').get().n,1);
 }finally{db.close();}
});
