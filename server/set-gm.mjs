import { DatabaseSync } from 'node:sqlite';
import { existsSync } from 'node:fs';
// Kullanım: DATABASE_PATH=... node server/set-gm.mjs <hesap> [kaldir]
// GM yetkisi sunucuda hesaba bağlanır; oyundaki hiçbir parola/komut yetki vermez.
// (Panel sahibi zaten GM sayılır.) Sahip panelinden de verilebilir.
const file = process.env.DATABASE_PATH || 'server/data/nyxia.sqlite';
const name = process.argv[2]?.trim().toLowerCase();
const remove = ['kaldir', 'kaldır', 'remove'].includes(process.argv[3]);
if (!name || !existsSync(file)) throw new Error('Örnek: DATABASE_PATH=... node server/set-gm.mjs oyuncuadi   (kaldırmak için sonuna "kaldir")');
const db = new DatabaseSync(file);
try {
  const account = db.prepare('SELECT id,name FROM accounts WHERE name=?').get(name);
  if (!account) throw new Error('Hesap bulunamadı; yeni hesap oluşturulmadı.');
  db.exec('CREATE TABLE IF NOT EXISTS gm_accounts(account INTEGER PRIMARY KEY REFERENCES accounts(id), granted_at INTEGER NOT NULL)');
  if (remove) db.prepare('DELETE FROM gm_accounts WHERE account=?').run(account.id);
  else db.prepare('INSERT OR IGNORE INTO gm_accounts(account,granted_at) VALUES(?,?)').run(account.id, Date.now());
  console.log(`${account.name} (hesap #${account.id}): GM ${remove ? 'kaldırıldı' : 'verildi'}.`);
} finally { db.close(); }
