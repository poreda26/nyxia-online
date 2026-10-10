import {createDropSettings,dropMetadata} from './drop-settings.mjs';
// Owner identity is provisioned locally, never from a character flag or HTTP body.
export function createAdmin(db, { read, fail, wallet }) {
  db.exec(`CREATE TABLE IF NOT EXISTS panel_owner(singleton INTEGER PRIMARY KEY CHECK(singleton=1), account INTEGER NOT NULL REFERENCES accounts(id));
    CREATE TABLE IF NOT EXISTS account_blocks(account INTEGER PRIMARY KEY REFERENCES accounts(id), reason TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS admin_audit(id INTEGER PRIMARY KEY, actor INTEGER NOT NULL, action TEXT NOT NULL, target TEXT NOT NULL, reason TEXT NOT NULL, created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS admin_snapshots(id INTEGER PRIMARY KEY, account INTEGER NOT NULL, data TEXT NOT NULL, created_at INTEGER NOT NULL);`);
  if(!db.prepare('PRAGMA table_info(account_blocks)').all().some(c=>c.name==='expires_at')) db.exec('ALTER TABLE account_blocks ADD COLUMN expires_at INTEGER');
  db.exec('CREATE TABLE IF NOT EXISTS account_mutes(account INTEGER PRIMARY KEY REFERENCES accounts(id),reason TEXT NOT NULL,expires_at INTEGER)');
  db.exec('CREATE TABLE IF NOT EXISTS account_activity(account INTEGER PRIMARY KEY REFERENCES accounts(id),last_seen INTEGER NOT NULL)');
  const seen=new Map();
  const touch=id=>{const now=Date.now();if(now-(seen.get(id)||0)<60000)return;if(seen.size>10000)seen.clear();seen.set(id,now);db.prepare('INSERT OR REPLACE INTO account_activity VALUES(?,?)').run(id,now);};
  // GM yetkisi sunucuda hesaba bağlıdır (istemcideki hiçbir bayrak/parola yetki vermez).
  // Panel sahibi her zaman GM sayılır; diğer GM'leri yalnızca sahip ekler/çıkarır.
  db.exec('CREATE TABLE IF NOT EXISTS gm_accounts(account INTEGER PRIMARY KEY REFERENCES accounts(id), granted_at INTEGER NOT NULL)');
  const drops=createDropSettings(db);
  const muted = id => !!db.prepare('SELECT 1 FROM account_mutes WHERE account=? AND (expires_at IS NULL OR expires_at>?)').get(id,Date.now());
  const owner = id => db.prepare('SELECT account FROM panel_owner WHERE singleton=1').get()?.account === id;
  const isGm = id => owner(id) || !!db.prepare('SELECT 1 FROM gm_accounts WHERE account=?').get(id);
  const blocked = id => !!db.prepare('SELECT account FROM account_blocks WHERE account=? AND (expires_at IS NULL OR expires_at>?)').get(id,Date.now());
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
    if(data.race!=null && !['elmorad','karus','human'].includes(data.race)) throw fail(400,'INVALID_RACE');
    for(const c of data.characters) if(c) {
      if(c.nickname!==undefined && (typeof c.nickname!=='string'||c.nickname.trim().length<2||c.nickname.length>24)) throw fail(400,'INVALID_NICKNAME');
      if(c.class!==undefined && !['warrior','rogue','mage'].includes(c.class)) throw fail(400,'INVALID_CLASS');
      if(c.race!==undefined && (!['elmorad','karus','human'].includes(c.race)||(data.race && c.race!==data.race))) throw fail(400,'INVALID_RACE');
    }
    const json = JSON.stringify(data), now = Date.now();
    if (wallet && Number.isSafeInteger(data.diamonds)) wallet.setBalanceInTransaction(id, data.diamonds, 'admin-adjust', 'owner-panel', now);
    db.prepare('INSERT INTO admin_snapshots(account,data,created_at) VALUES(?,?,?)').run(id,old.data,now);
    db.prepare('UPDATE backups SET revision=?,data=?,updated=? WHERE account=?').run(revision+1,json,now,id);
    db.prepare('INSERT INTO backup_history VALUES(?,?,?,?)').run(id,revision+1,json,now);
    return {revision:revision+1};
  };
  async function handle(req, path, account, send) {
    if(!owner(account.id)) throw fail(403,'OWNER_ONLY');
    const url = new URL(req.url,'http://localhost');
    if(req.method === 'GET') {
      if(path === '/api/admin/drops')return send(200,{...drops.get(),...dropMetadata,history:db.prepare('SELECT revision,created_at FROM drop_settings_history ORDER BY revision DESC LIMIT 30').all()});
      if(path === '/api/admin/sanctions')return send(200,db.prepare("SELECT a.name,s.* FROM (SELECT account,reason,expires_at,'ban' type FROM account_blocks UNION ALL SELECT account,reason,expires_at,'mute' type FROM account_mutes) s JOIN accounts a ON a.id=s.account WHERE expires_at IS NULL OR expires_at>?").all(Date.now()));
      if(path === '/api/admin/overview') return send(200,{
        owner:account.name, accounts:db.prepare('SELECT COUNT(*) n FROM accounts').get().n,
        sessions:db.prepare('SELECT COUNT(DISTINCT account) n FROM sessions WHERE expires>?').get(Date.now()).n,
        clans:db.prepare('SELECT COUNT(*) n FROM clans').get().n,
        stalls:db.prepare('SELECT COUNT(*) n FROM market_stalls').get().n,
        openReports:db.prepare("SELECT COUNT(*) n FROM user_reports WHERE status='open'").get().n,
        openTickets:(()=>{try{return db.prepare("SELECT COUNT(*) n FROM tickets WHERE status='open'").get().n;}catch{return 0;}})(),
        active:db.prepare('SELECT COUNT(*) n FROM account_activity WHERE last_seen>?').get(Date.now()-300000).n,
        authoritative:false
      });
      if(path === '/api/admin/accounts') return send(200,db.prepare(`SELECT a.id,a.name,b.revision,b.updated,(SELECT last_seen FROM account_activity WHERE account=a.id) lastSeen,EXISTS(SELECT 1 FROM account_blocks x WHERE x.account=a.id AND (x.expires_at IS NULL OR x.expires_at>strftime('%s','now')*1000)) blocked FROM accounts a LEFT JOIN backups b ON b.account=a.id WHERE a.name LIKE ? ORDER BY a.id DESC LIMIT 100 OFFSET ?`).all('%'+(url.searchParams.get('q')||'').slice(0,24)+'%',Math.max(0,Number(url.searchParams.get('offset'))||0)));
      if(path === '/api/admin/account') {
        const id = Number(url.searchParams.get('id'));
        const a = db.prepare('SELECT id,name FROM accounts WHERE id=?').get(id);
        if(!a) throw fail(404,'ACCOUNT_NOT_FOUND');
        const b = db.prepare('SELECT * FROM backups WHERE account=?').get(id);
        return send(200,{...a,lastSeen:db.prepare('SELECT last_seen FROM account_activity WHERE account=?').get(id)?.last_seen,blocked:blocked(id),muted:muted(id),gm:isGm(id),ban:db.prepare('SELECT reason,expires_at FROM account_blocks WHERE account=?').get(id),mute:db.prepare('SELECT reason,expires_at FROM account_mutes WHERE account=?').get(id),revision:b?.revision||0,data:b?JSON.parse(b.data):null,snapshots:db.prepare('SELECT id,created_at FROM admin_snapshots WHERE account=? ORDER BY id DESC LIMIT 30').all(id)});
      }
      if(path === '/api/admin/audit') return send(200,db.prepare('SELECT * FROM admin_audit ORDER BY id DESC LIMIT 200').all());
      if(path === '/api/admin/reports') return send(200,db.prepare("SELECT r.id,r.target,r.target_name,r.context,r.content,r.reason,r.details,r.created_at,r.status,r.resolved_at,r.resolution,(SELECT name FROM accounts WHERE id=r.reporter) reporter_name FROM user_reports r ORDER BY (r.status='open') DESC, r.id DESC LIMIT 200").all());
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
        if(path === '/api/admin/drops/save' || path === '/api/admin/drops/restore'){
          let data=b.data;
          if(path.endsWith('/restore')){const row=db.prepare('SELECT data FROM drop_settings_history WHERE revision=?').get(b.snapshot);if(!row)throw fail(404,'SNAPSHOT_NOT_FOUND');data=JSON.parse(row.data);}
          const result=drops.save(b.revision,data);audit(account.id,path,result.revision,reason);return result;
        }
        if(path === '/api/admin/account/mute'){
          if(id===account.id)throw fail(400,'OWNER_PROTECTED');
          if(!db.prepare('SELECT 1 FROM accounts WHERE id=?').get(id))throw fail(404,'ACCOUNT_NOT_FOUND');
          if(typeof b.muted!=='boolean')throw fail(400,'INVALID_MUTE');
          const hours=b.hours??0;if(!Number.isFinite(hours)||hours<0||hours>8760)throw fail(400,'INVALID_DURATION');
          const until=hours?Date.now()+hours*3600000:null;
          if(b.muted)db.prepare('INSERT OR REPLACE INTO account_mutes VALUES(?,?,?)').run(id,reason,until);else db.prepare('DELETE FROM account_mutes WHERE account=?').run(id);
          audit(account.id,path+':'+b.muted,id,reason+' | '+(until?new Date(until).toISOString():'kalıcı'));return {ok:true};
        }
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
            const hours=b.hours??0;if(!Number.isFinite(hours)||hours<0||hours>8760)throw fail(400,'INVALID_DURATION');
            if(b.blocked) db.prepare('INSERT OR REPLACE INTO account_blocks(account,reason,expires_at) VALUES(?,?,?)').run(id,reason,hours?Date.now()+hours*3600000:null);
            else db.prepare('DELETE FROM account_blocks WHERE account=?').run(id);
          }
          db.prepare('DELETE FROM sessions WHERE account=?').run(id);
          audit(account.id,path+ (path.endsWith('/block')?':'+b.blocked:''),id,reason+' | saat: '+(b.hours||'kalıcı')); return {ok:true};
        }
        if(path === '/api/admin/account/gm') {
          if(typeof b.gm!=='boolean') throw fail(400,'INVALID_GM');
          if(id===account.id) throw fail(400,'OWNER_PROTECTED');
          if(!db.prepare('SELECT id FROM accounts WHERE id=?').get(id)) throw fail(404,'ACCOUNT_NOT_FOUND');
          if(b.gm) db.prepare('INSERT OR IGNORE INTO gm_accounts(account,granted_at) VALUES(?,?)').run(id,Date.now());
          else db.prepare('DELETE FROM gm_accounts WHERE account=?').run(id);
          audit(account.id,path+':'+b.gm,id,reason); return {ok:true};
        }
        if(path === '/api/admin/report/resolve') {
          if(!['actioned','dismissed'].includes(b.status))throw fail(400,'INVALID_STATUS');
          const result=db.prepare("UPDATE user_reports SET status=?,resolved_at=?,resolution=? WHERE id=? AND status='open'").run(b.status,Date.now(),reason,id);
          if(!result.changes)throw fail(404,'REPORT_NOT_FOUND');
          audit(account.id,path+':'+b.status,id,reason);return {ok:true};
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
  return {handle,owner,isGm,blocked,muted,drops,touch,audit};
}
