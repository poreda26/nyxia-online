import { DatabaseSync } from 'node:sqlite';
import { existsSync } from 'node:fs';
// Kullanım: DATABASE_PATH=... node server/set-economy.mjs <hesap> [kapat]
// Hesap için sunucu ekonomisini açar/kapatır (altın, envanter, depo yalnızca sunucu eylemleriyle değişir).
// Herkes için açmak: sunucuda ECONOMY_FOR_ALL=1.
const file = process.env.DATABASE_PATH || 'server/data/nyxia.sqlite';
const name = process.argv[2]?.trim().toLowerCase();
const off = ['kapat', 'off'].includes(process.argv[3]);
if (!name || !existsSync(file)) throw new Error('Örnek: DATABASE_PATH=... node server/set-economy.mjs oyuncuadi   (kapatmak için sonuna "kapat")');
const db = new DatabaseSync(file);
try {
  const account = db.prepare('SELECT id,name FROM accounts WHERE name=?').get(name);
  if (!account) throw new Error('Hesap bulunamadı.');
  db.exec('CREATE TABLE IF NOT EXISTS economy_accounts(account INTEGER PRIMARY KEY REFERENCES accounts(id), enabled_at INTEGER NOT NULL)');
  if (off) db.prepare('DELETE FROM economy_accounts WHERE account=?').run(account.id);
  else db.prepare('INSERT OR IGNORE INTO economy_accounts(account,enabled_at) VALUES(?,?)').run(account.id, Date.now());
  console.log(`${account.name} (#${account.id}): sunucu ekonomisi ${off ? 'kapatıldı' : 'açıldı'}.`);
} finally { db.close(); }
