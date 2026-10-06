import {CLAN_PERMISSIONS,DEFAULT_CLAN_PERMISSIONS,clanAllowed,CLAN_VAULT_CAPACITY} from '../src/data/clanPermissions.js';
export function createClanVault(db,{fail}){
 db.exec(`CREATE TABLE IF NOT EXISTS clan_permissions(clan_id INTEGER PRIMARY KEY REFERENCES clans(id) ON DELETE CASCADE,data TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS clan_vault(id INTEGER PRIMARY KEY AUTOINCREMENT,clan_id INTEGER NOT NULL REFERENCES clans(id) ON DELETE CASCADE,item TEXT NOT NULL,created_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS clan_vault_log(id INTEGER PRIMARY KEY AUTOINCREMENT,clan_id INTEGER NOT NULL REFERENCES clans(id) ON DELETE CASCADE,account_id INTEGER NOT NULL,character_key TEXT NOT NULL,action TEXT NOT NULL,item_name TEXT NOT NULL,created_at INTEGER NOT NULL);`);
 const permissions=id=>JSON.parse(db.prepare('SELECT data FROM clan_permissions WHERE clan_id=?').get(id)?.data||JSON.stringify(DEFAULT_CLAN_PERMISSIONS));
 const allowed=(m,key)=>!!m&&clanAllowed(m.role,permissions(m.clan_id),key);
 const membership=(account,key)=>db.prepare('SELECT * FROM clan_members WHERE account_id=? AND character_key=?').get(account,key);
 const log=(m,account,key,action,name,now)=>{db.prepare('INSERT INTO clan_vault_log(clan_id,account_id,character_key,action,item_name,created_at) VALUES(?,?,?,?,?,?)').run(m.clan_id,account,key,action,name,now);};
 const view=m=>{
  if(!m)throw fail(403,'NOT_IN_CLAN');
  return {permissions:permissions(m.clan_id),capacity:CLAN_VAULT_CAPACITY,role:m.role,items:db.prepare('SELECT id,item FROM clan_vault WHERE clan_id=? ORDER BY id').all(m.clan_id).map(r=>({id:r.id,item:JSON.parse(r.item)})),log:db.prepare('SELECT l.*,a.name AS account_name FROM clan_vault_log l LEFT JOIN accounts a ON a.id=l.account_id WHERE l.clan_id=? ORDER BY l.id DESC LIMIT 50').all(m.clan_id)};
 };
 const update=(m,roles)=>{
  if(m?.role!=='leader')throw fail(403,'LEADER_REQUIRED');
  if(!roles||Object.keys(roles).some(k=>!['officer','member'].includes(k)))throw fail(400,'INVALID_PERMISSIONS');
  const clean={};for(const role of ['officer','member']){if(!roles[role]||Object.keys(roles[role]).some(k=>!CLAN_PERMISSIONS.includes(k)))throw fail(400,'INVALID_PERMISSIONS');clean[role]={};for(const key of CLAN_PERMISSIONS){if(typeof roles[role][key]!=='boolean')throw fail(400,'INVALID_PERMISSIONS');clean[role][key]=roles[role][key];}}
  db.prepare('INSERT INTO clan_permissions VALUES(?,?) ON CONFLICT(clan_id) DO UPDATE SET data=excluded.data').run(m.clan_id,JSON.stringify(clean));return clean;
 };
 const hooks={
  'clan/vaultDeposit':({account,characterKey,payload,now})=>{
   const m=membership(account,characterKey);if(!allowed(m,'deposit'))return {fail:'clanPermissionDenied'};
   if(db.prepare('SELECT COUNT(*) AS n FROM clan_vault WHERE clan_id=?').get(m.clan_id).n>=CLAN_VAULT_CAPACITY)return {fail:'clanVaultFull'};
   return {payload:{itemId:payload?.itemId},after:(result)=>{db.prepare('INSERT INTO clan_vault(clan_id,item,created_at) VALUES(?,?,?)').run(m.clan_id,JSON.stringify(result.item),now);log(m,account,characterKey,'deposit',result.item.name||result.item.kind,now);}};
  },
  'clan/vaultWithdraw':({account,characterKey,payload,now})=>{
   const m=membership(account,characterKey);if(!allowed(m,'withdraw'))return {fail:'clanPermissionDenied'};
   const id=Number(payload?.vaultId);if(!Number.isSafeInteger(id)||id<=0)return {fail:'itemNotFound'};
   const row=db.prepare('SELECT * FROM clan_vault WHERE id=? AND clan_id=?').get(id,m.clan_id);if(!row)return {fail:'itemNotFound'};
   const item=JSON.parse(row.item);
   return {payload:{item},after:()=>{db.prepare('DELETE FROM clan_vault WHERE id=? AND clan_id=?').run(id,m.clan_id);log(m,account,characterKey,'withdraw',item.name||item.kind,now);}};
  },
 };
 return {permissions,allowed,view,update,hooks};
}
