import { DatabaseSync } from 'node:sqlite';
import { existsSync } from 'node:fs';
// Kullanım: DATABASE_PATH=... node server/set-min-build.mjs <en-düşük-build> [güncelleme-bağlantısı]
// Bundan eski istemciler (X-Client-Build başlığı küçük ya da hiç yok) 426 CLIENT_OUTDATED alır ve güncelleme ekranı görür.
// 0 yazarsan denetim kapanır. Bağlantı verilmezse mevcut değer korunur ("-" yazarsan silinir).
const file = process.env.DATABASE_PATH || 'server/data/nyxia.sqlite';
const build = Number(process.argv[2]);
if (!Number.isInteger(build) || build < 0 || !existsSync(file)) throw new Error('Örnek: DATABASE_PATH=... node server/set-min-build.mjs 1 https://play.google.com/store/apps/details?id=...');
const db = new DatabaseSync(file);
try {
  db.exec('CREATE TABLE IF NOT EXISTS app_config(key TEXT PRIMARY KEY, value TEXT NOT NULL)');
  db.prepare('INSERT OR REPLACE INTO app_config(key,value) VALUES(?,?)').run('min_build', String(build));
  const url = process.argv[3];
  if (url === '-') db.prepare("DELETE FROM app_config WHERE key='update_url'").run();
  else if (url) db.prepare('INSERT OR REPLACE INTO app_config(key,value) VALUES(?,?)').run('update_url', url);
  console.log(`En düşük istemci sürümü: ${build}${url && url !== '-' ? ' · güncelleme bağlantısı kaydedildi' : ''}.`);
} finally { db.close(); }
