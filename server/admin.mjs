// Owner identity is provisioned locally, never from a character flag or HTTP body.
export function createAdmin(db, { read, fail }) {
  db.exec(`CREATE TABLE IF NOT EXISTS panel_owner(singleton INTEGER PRIMARY KEY CHECK(singleton=1), account INTEGER NOT NULL REFERENCES accounts(id));
    CREATE TABLE IF NOT EXISTS account_blocks(account INTEGER PRIMARY KEY REFERENCES accounts(id), reason TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS admin_audit(id INTEGER PRIMARY KEY, actor INTEGER NOT NULL, action TEXT NOT NULL, target TEXT NOT NULL, reason TEXT NOT NULL, created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS admin_snapshots(id INTEGER PRIMARY KEY, account INTEGER NOT NULL, data TEXT NOT NULL, created_at INTEGER NOT NULL);`);
  const owner = id => db.prepare('SELECT account FROM panel_owner WHERE singleton=1').get()?.account === id;
  const blocked = id => !!db.prepare('SELECT account FROM account_blocks WHERE account=?').get(id);
  const audit = (id, action, target, reason) => db.prepare('INSERT INTO admin_audit(actor,action,target,reason,created_at) VALUES(?,?,?,?,?)').run(id, action, String(target), reason, Date.now());
  const transaction = fn => { db.exec('BEGIN IMMEDIATE'); try { const result = fn(); db.exec('COMMIT'); return result; } catch(e) { db.exec('ROLLBACK'); throw e; } };
  const commit = (id, revision, data) => {
    const old = db.prepare('SELECT * FROM backups WHERE account=?').get(id);
    if (!old || old.revision !== revision) throw fail(409,'BACKUP_CONFLICT');
    if (!data || !Array.isArray(data.characters) || data.characters.length !== 3) throw fail(400,'INVALID_BACKUP');
    // This editor never deletes an existing character or rewrites its identity.
    const before = JSON.parse(old.data);
    before.characters.forEach((c,i) => { if(c && (!data.characters[i] || c.id !== data.characters[i].id)) throw fail(400,'CHARACTER_IDENTITY_REQUIRED'); });
    for(const key of ['diamonds','bankGold']) if(data[key] !== undefined && (!Number.isSafeInteger(data[key]) || data[key] < 0 || data[key]>999999999)) throw fail(400,'INVALID_CURRENCY');
    for(const c of data.characters) if(c) {
      if(typeof c !== 'object' || Array.isArray(c)) throw fail(400,'INVALID_CHARACTER');
      if(c.level !== undefined && (!Number.isSafeInteger(c.level) || c.level<1 || c.level>65)) throw fail(400,'LEVEL_MUST_BE_1_TO_65');
      for(const key of ['gold','xp','level']) if(c[key] !== undefined && (!Number.isSafeInteger(c[key]) || c[key]<0 || c[key]>999999999)) throw fail(400,'INVALID_CHARACTER');
    }
    const json = JSON.stringify(data), now = Date.now();
    db.prepare('INSERT INTO admin_snapshots(account,data,created_at) VALUES(?,?,?)').run(id,old.data,now);
    db.prepare('UPDATE backups SET revision=?,data=?,updated=? WHERE account=?').run(revision+1,json,now,id);
    db.prepare('INSERT INTO backup_history VALUES(?,?,?,?)').run(id,revision+1,json,now);
    return {revision:revision+1};
  };
  async function handle(req, path, account, send) {
    if(!owner(account.id)) throw fail(403,'OWNER_ONLY');
    const url = new URL(req.url,'http://localhost');
    if(req.method === 'GET') {
      if(path === '/api/admin/overview') return send(200,{
        owner:account.name, accounts:db.prepare('SELECT COUNT(*) n FROM accounts').get().n,
        sessions:db.prepare('SELECT COUNT(DISTINCT account) n FROM sessions WHERE expires>?').get(Date.now()).n,
        clans:db.prepare('SELECT COUNT(*) n FROM clans').get().n,
        stalls:db.prepare('SELECT COUNT(*) n FROM market_stalls').get().n,
        authoritative:false
      });
      if(path === '/api/admin/accounts') return send(200,db.prepare(`SELECT a.id,a.name,b.revision,b.updated,EXISTS(SELECT 1 FROM account_blocks x WHERE x.account=a.id) blocked FROM accounts a LEFT JOIN backups b ON b.account=a.id WHERE a.name LIKE ? ORDER BY a.id DESC LIMIT 100 OFFSET ?`).all('%'+(url.searchParams.get('q')||'').slice(0,24)+'%',Math.max(0,Number(url.searchParams.get('offset'))||0)));
      if(path === '/api/admin/account') {
        const id = Number(url.searchParams.get('id'));
        const a = db.prepare('SELECT id,name FROM accounts WHERE id=?').get(id);
        if(!a) throw fail(404,'ACCOUNT_NOT_FOUND');
        const b = db.prepare('SELECT * FROM backups WHERE account=?').get(id);
        return send(200,{...a,blocked:blocked(id),revision:b?.revision||0,data:b?JSON.parse(b.data):null,snapshots:db.prepare('SELECT id,created_at FROM admin_snapshots WHERE account=? ORDER BY id DESC LIMIT 30').all(id)});
      }
      if(path === '/api/admin/audit') return send(200,db.prepare('SELECT * FROM admin_audit ORDER BY id DESC LIMIT 200').all());
      if(path === '/api/admin/chat') return send(200,db.prepare('SELECT id,author,text,created_at FROM chat_messages ORDER BY id DESC LIMIT 100').all());
      if(path === '/api/admin/clans') return send(200,db.prepare('SELECT c.*, (SELECT COUNT(*) FROM clan_members m WHERE m.clan_id=c.id) members FROM clans c ORDER BY id DESC LIMIT 200').all());
      if(path === '/api/admin/market') return send(200,db.prepare('SELECT account,seller_name,items,listed_at,duration_hours FROM market_stalls ORDER BY listed_at DESC LIMIT 200').all().map(r=>({...r,items:JSON.parse(r.items)})));
      if(path === '/api/admin/duels') return send(200,db.prepare('SELECT * FROM duel_history ORDER BY id DESC LIMIT 100').all());
    }
    if(req.method === 'POST') {
      const b = await read(req);
      const reason = typeof b?.reason === 'string' ? b.reason.trim().slice(0,300) : '';
      if(reason.length<3) throw fail(400,'REASON_REQUIRED');
      const result = transaction(()=>{
        const id = Number(b.id);
        if(path === '/api/admin/account/save' || path === '/api/admin/account/restore') {
          let data = b.data;
          if(path.endsWith('/restore')) {
            const snapshot=db.prepare('SELECT data FROM admin_snapshots WHERE id=? AND account=?').get(b.snapshot,id);
            if(!snapshot) throw fail(404,'SNAPSHOT_NOT_FOUND');
            data=JSON.parse(snapshot.data);
          }
          const saved=commit(id,b.revision,data); audit(account.id,path,id,reason); return saved;
        }
        if(path === '/api/admin/account/block' || path === '/api/admin/account/revoke') {
          if(id===account.id) throw fail(400,'OWNER_PROTECTED');
          if(!db.prepare('SELECT id FROM accounts WHERE id=?').get(id)) throw fail(404,'ACCOUNT_NOT_FOUND');
          if(path.endsWith('/block')) {
            if(typeof b.blocked!=='boolean') throw fail(400,'INVALID_BLOCK');
            if(b.blocked) db.prepare('INSERT OR REPLACE INTO account_blocks VALUES(?,?)').run(id,reason);
            else db.prepare('DELETE FROM account_blocks WHERE account=?').run(id);
          }
          db.prepare('DELETE FROM sessions WHERE account=?').run(id);
          audit(account.id,path+ (path.endsWith('/block')?':'+b.blocked:''),id,reason); return {ok:true};
        }
        if(path === '/api/admin/chat/remove') {
          const row=db.prepare('SELECT * FROM chat_messages WHERE id=?').get(id);
          if(!row) throw fail(404,'MESSAGE_NOT_FOUND');
          db.prepare('DELETE FROM chat_messages WHERE id=?').run(id);
          audit(account.id,path,id,reason); return {ok:true};
        }
        if(path === '/api/admin/clan/update') {
          if(typeof b.name!=='string' || b.name.trim().length<3 || b.name.length>24) throw fail(400,'INVALID_CLAN_NAME');
          if(!db.prepare('SELECT id FROM clans WHERE id=?').get(id)) throw fail(404,'CLAN_NOT_FOUND');
          if(db.prepare('SELECT id FROM clans WHERE name=? AND id!=?').get(b.name.trim(),id)) throw fail(409,'CLAN_NAME_TAKEN');
          db.prepare('UPDATE clans SET name=? WHERE id=?').run(b.name.trim(),id);
          audit(account.id,path,id,reason); return {ok:true};
        }
        throw fail(404,'NOT_FOUND');
      });
      return send(200,result);
    }
    throw fail(404,'NOT_FOUND');
  }
  return {handle,owner,blocked};
}
