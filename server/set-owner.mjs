import { DatabaseSync } from 'node:sqlite';
import { existsSync } from 'node:fs';
const file=process.env.DATABASE_PATH||'server/data/nyxia.sqlite';
const name=process.argv[2]?.trim().toLowerCase();
if(!name || !existsSync(file)) throw new Error('Mevcut veritabanında çalıştır: DATABASE_PATH=... node server/set-owner.mjs poreda26');
const db=new DatabaseSync(file);
try {
  const account=db.prepare('SELECT id,name FROM accounts WHERE name=?').get(name);
  if(!account) throw new Error('Hesap bulunamadı; yeni hesap oluşturulmadı.');
  db.exec('CREATE TABLE IF NOT EXISTS panel_owner(singleton INTEGER PRIMARY KEY CHECK(singleton=1), account INTEGER NOT NULL REFERENCES accounts(id))');
  const old=db.prepare('SELECT account FROM panel_owner WHERE singleton=1').get();
  if(old && old.account!==account.id) throw new Error('Panelin zaten başka bir sahibi var. Otomatik değiştirilmedi.');
  db.prepare('INSERT OR IGNORE INTO panel_owner VALUES(1,?)').run(account.id);
  console.log(`Panel sahibi: ${account.name} (hesap #${account.id}). GM karakterleri panel yetkisi kazanmaz.`);
} finally { db.close(); }
