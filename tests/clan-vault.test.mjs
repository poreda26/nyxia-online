import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {createClanVault} from '../server/clan-vault.mjs';
import {createGame} from '../server/game.mjs';
import * as logic from '../server/game-logic.generated.mjs';
import {DEFAULT_CLAN_PERMISSIONS} from '../src/data/clanPermissions.js';
const sword={id:'blade',kind:'weapon',name:'Test Sword',weight:1,upgradeLevel:8,atk:50,noTrade:false};
function setup(){
 const db=new DatabaseSync(':memory:');db.exec(`PRAGMA foreign_keys=ON;CREATE TABLE accounts(id INTEGER PRIMARY KEY,name TEXT);INSERT INTO accounts VALUES(1,'a'),(2,'b');CREATE TABLE clans(id INTEGER PRIMARY KEY);INSERT INTO clans VALUES(1),(2);CREATE TABLE clan_members(account_id INTEGER,character_key TEXT,clan_id INTEGER,role TEXT);INSERT INTO clan_members VALUES(1,'hero',1,'leader'),(2,'hero',1,'member'),(2,'alt',2,'leader');CREATE TABLE backups(account INTEGER PRIMARY KEY,revision INTEGER,data TEXT,updated INTEGER);CREATE TABLE backup_history(account INTEGER,revision INTEGER,data TEXT,created_at INTEGER);`);
 const hero=(id,inventory=[])=>({...logic.createCharacter('warrior','human','Test'),id,inventory});
 db.prepare('INSERT INTO backups VALUES(?,?,?,?)').run(1,1,JSON.stringify({characters:[hero('hero',[sword,{...sword,id:'bound',noTrade:true}])],bank:[]}),1);
 db.prepare('INSERT INTO backups VALUES(?,?,?,?)').run(2,1,JSON.stringify({characters:[hero('hero'),hero('alt')],bank:[]}),1);
 const fail=(status,code)=>Object.assign(new Error(code),{status,code});const vault=createClanVault(db,{fail});const game=createGame(db,{fail,logic,keyOf:c=>c.id,all:true,hooks:vault.hooks});const member=(account,key='hero')=>db.prepare('SELECT * FROM clan_members WHERE account_id=? AND character_key=?').get(account,key);
 return {db,vault,game,member};
}
test('vault transfers real items atomically; roles, clan isolation, binding and repeat withdrawals are enforced',()=>{
 const {db,vault,game,member}=setup();try{
 assert.throws(()=>vault.update(member(2),DEFAULT_CLAN_PERMISSIONS),/LEADER_REQUIRED/);
 assert.throws(()=>vault.update(member(1),{member:{withdraw:true}}),/INVALID_PERMISSIONS/);
 assert.equal(game.act(1,'hero','clan/vaultDeposit',{itemId:'bound'}).result.reason,'clanItemBound');
 assert.equal(game.act(1,'hero','clan/vaultDeposit',{itemId:'fake',item:sword}).result.reason,'itemNotFound');
 assert.equal(game.act(1,'hero','clan/vaultDeposit',{itemId:'blade'}).result.ok,true);
 const row=vault.view(member(1)).items[0];assert.deepEqual(row.item,sword);
 assert.equal(game.act(1,'hero','clan/vaultDeposit',{itemId:'blade'}).result.ok,false);
 assert.equal(game.act(2,'hero','clan/vaultWithdraw',{vaultId:row.id}).result.reason,'clanPermissionDenied');
 assert.equal(game.act(2,'alt','clan/vaultWithdraw',{vaultId:row.id}).result.reason,'itemNotFound');
 const permissions=structuredClone(DEFAULT_CLAN_PERMISSIONS);permissions.member.withdraw=true;permissions.member.deposit=false;vault.update(member(1),permissions);
 const withdrawn=game.act(2,'hero','clan/vaultWithdraw',{vaultId:row.id,item:{...sword,atk:99999}});
 assert.equal(withdrawn.result.ok,true);assert.deepEqual(withdrawn.patch.inventory[0],sword);
 assert.equal(game.act(2,'hero','clan/vaultWithdraw',{vaultId:row.id}).result.reason,'itemNotFound');
 assert.equal(game.act(2,'hero','clan/vaultDeposit',{itemId:'blade'}).result.reason,'clanPermissionDenied');
 assert.equal(vault.view(member(1)).items.length,0);assert.equal(vault.view(member(1)).log.length,2);
 assert.equal(vault.allowed(member(1),'withdraw'),true);
 }finally{db.close();}
});
test('full inventory and full vault preserve items without partial transfer',()=>{
 const {db,vault,game,member}=setup();try{
 game.act(1,'hero','clan/vaultDeposit',{itemId:'blade'});const id=vault.view(member(1)).items[0].id;
 const p=JSON.parse(db.prepare('SELECT data FROM backups WHERE account=1').get().data);p.characters[0].inventory=Array.from({length:32},(_,i)=>({...sword,id:'f'+i}));db.prepare('UPDATE backups SET data=? WHERE account=1').run(JSON.stringify(p));
 assert.equal(game.act(1,'hero','clan/vaultWithdraw',{vaultId:id}).result.reason,'clanBagFull');assert.equal(vault.view(member(1)).items.length,1);
 for(let i=1;i<60;i++)db.prepare('INSERT INTO clan_vault(clan_id,item,created_at) VALUES(1,?,1)').run(JSON.stringify({...sword,id:'v'+i}));
 assert.equal(game.act(1,'hero','clan/vaultDeposit',{itemId:'f0'}).result.reason,'clanVaultFull');
 assert.equal(JSON.parse(db.prepare('SELECT data FROM backups WHERE account=1').get().data).characters[0].inventory.length,32);
 }finally{db.close();}
});
