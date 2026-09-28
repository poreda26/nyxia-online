export function savedCharacters(db,accountId){
 try{return JSON.parse(db.prepare('SELECT data FROM backups WHERE account=?').get(accountId)?.data||'{}').characters||[];}catch{return [];}
}
export const characterKey=(character,index)=>String(character?.id||`slot:${index}`);
export function primaryCharacter(db,accountId,chars=savedCharacters(db,accountId)){
 let index=0;
 chars.forEach((c,i)=>{if(c&&(!chars[index]||(c.level||0)>(chars[index].level||0)))index=i;});
 return {key:characterKey(chars[index],index),character:chars[index],index};
}
// One-time transactional migration. No characters, items, clans or treasury are removed.
export function migrateCharacterClans(db){
 if(db.prepare('PRAGMA table_info(clan_members)').all().some(c=>c.name==='character_key'))return;
 db.exec('BEGIN IMMEDIATE');
 try{
  db.exec(`ALTER TABLE clan_members RENAME TO clan_members_legacy;
   CREATE TABLE clan_members(account_id INTEGER NOT NULL REFERENCES accounts(id),character_key TEXT NOT NULL,clan_id INTEGER NOT NULL REFERENCES clans(id),role TEXT NOT NULL,joined_at INTEGER NOT NULL,donated_np INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(account_id,character_key));
   ALTER TABLE clan_invites RENAME TO clan_invites_legacy;
   CREATE TABLE clan_invites(id INTEGER PRIMARY KEY AUTOINCREMENT,clan_id INTEGER NOT NULL REFERENCES clans(id),from_account INTEGER NOT NULL REFERENCES accounts(id),to_account INTEGER NOT NULL REFERENCES accounts(id),to_character TEXT NOT NULL,created_at INTEGER NOT NULL,UNIQUE(clan_id,to_account,to_character));
   ALTER TABLE clan_dungeon_attempts RENAME TO clan_dungeon_attempts_legacy;
   CREATE TABLE clan_dungeon_attempts(account_id INTEGER NOT NULL REFERENCES accounts(id),character_key TEXT NOT NULL,day_key TEXT NOT NULL,entries_used INTEGER NOT NULL DEFAULT 0,first_entry_at INTEGER,PRIMARY KEY(account_id,character_key,day_key));
   ALTER TABLE clan_dungeon_state ADD COLUMN locked_character TEXT;`);
  for(const r of db.prepare('SELECT * FROM clan_members_legacy').all())db.prepare('INSERT INTO clan_members VALUES(?,?,?,?,?,?)').run(r.account_id,primaryCharacter(db,r.account_id).key,r.clan_id,r.role,r.joined_at,r.donated_np);
  for(const r of db.prepare('SELECT * FROM clan_invites_legacy').all())db.prepare('INSERT INTO clan_invites VALUES(?,?,?,?,?,?)').run(r.id,r.clan_id,r.from_account,r.to_account,primaryCharacter(db,r.to_account).key,r.created_at);
  for(const r of db.prepare('SELECT * FROM clan_dungeon_attempts_legacy').all())db.prepare('INSERT INTO clan_dungeon_attempts VALUES(?,?,?,?,?)').run(r.account_id,primaryCharacter(db,r.account_id).key,r.day_key,r.entries_used,r.first_entry_at);
  for(const r of db.prepare('SELECT clan_id,locked_by FROM clan_dungeon_state WHERE locked_by IS NOT NULL').all())db.prepare('UPDATE clan_dungeon_state SET locked_character=? WHERE clan_id=?').run(primaryCharacter(db,r.locked_by).key,r.clan_id);
  // Keep audit snapshots without foreign keys that could block later clan deletion.
  db.exec(`CREATE TABLE clan_members_migration_backup AS SELECT * FROM clan_members_legacy;
   CREATE TABLE clan_invites_migration_backup AS SELECT * FROM clan_invites_legacy;
   CREATE TABLE clan_attempts_migration_backup AS SELECT * FROM clan_dungeon_attempts_legacy;
   DROP TABLE clan_members_legacy; DROP TABLE clan_invites_legacy; DROP TABLE clan_dungeon_attempts_legacy;`);
  db.exec('COMMIT');
 }catch(e){db.exec('ROLLBACK');throw e;}
}
