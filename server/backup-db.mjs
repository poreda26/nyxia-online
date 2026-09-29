// Günlük otomatik yedekleme — VM'de bir systemd timer bunu her gün çalıştırır
// (bkz. deploy notları). node:sqlite'ın backup() fonksiyonu SQLite'ın kendi
// "online backup" API'sini kullanıyor: WAL modundaki canlı veritabanını,
// servisi durdurmadan ve yazma isteklerini bloklamadan tutarlı bir
// anlık görüntü (snapshot) olarak kopyalar — bir dosyayı elle cp'lemekten
// farklı olarak yarım yazılmış bir sayfa yakalama riski yok.
import { DatabaseSync, backup } from 'node:sqlite';
import { mkdirSync, readdirSync, statSync, unlinkSync, existsSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';

const SOURCE = process.env.DATABASE_PATH || 'server/data/nyxia.sqlite';
const BACKUP_DIR = process.env.BACKUP_DIR || join(dirname(SOURCE), 'backups');
const KEEP = Number(process.env.BACKUP_KEEP || 14);
const STEM = basename(SOURCE, '.sqlite');

if (!existsSync(SOURCE)) {
  console.error(`Kaynak veritabanı bulunamadı: ${SOURCE}`);
  process.exit(1);
}

mkdirSync(BACKUP_DIR, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const dest = join(BACKUP_DIR, `${STEM}-${stamp}.sqlite`);

const db = new DatabaseSync(SOURCE, { readOnly: true });
try {
  await backup(db, dest);
  console.log(`Yedek alındı: ${dest}`);
} finally {
  db.close();
}

// Rotasyon: en yeni KEEP yedeği tut, gerisini sil.
const prefix = `${STEM}-`;
const backups = readdirSync(BACKUP_DIR)
  .filter((f) => f.startsWith(prefix) && f.endsWith('.sqlite'))
  .map((f) => ({ f, t: statSync(join(BACKUP_DIR, f)).mtimeMs }))
  .sort((a, b) => b.t - a.t);

for (const { f } of backups.slice(KEEP)) {
  unlinkSync(join(BACKUP_DIR, f));
  console.log(`Eski yedek silindi: ${f}`);
}
