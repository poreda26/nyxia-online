import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, createHash, scrypt as derive, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { readFile } from 'node:fs/promises';
import { resolve, extname, join } from 'node:path';
// Faz 4 — bu iki dosya kasıtlı olarak saf JS (tarayıcıya/React'e bağımlı
// değil, bkz. kendi dosyalarındaki importlar): boss listesini ve zamanlama
// mantığını istemciyle AYNI kaynaktan okumak için doğrudan buradan import
// ediliyor, sunucuda ayrı bir kopyası tutulmuyor (iki yerde birbirinden
// sapabilecek bir "boss listesi" olmasın diye).
import { WARZONE_BOSSES } from '../src/data/warzone.js';
import { bossSchedule } from '../src/utils/warzoneBoss.js';

const scrypt = promisify(derive);
const hash = value => createHash('sha256').update(value).digest('hex');
const fail = (status, code) => Object.assign(new Error(code), { status });
const LIMIT = 2 * 1024 * 1024;
const MARKET_DURATIONS_HOURS = new Set([1, 3, 6, 12, 24]);
const MARKET_STALL_MAX_ITEMS = 10;
const MARKET_MAX_PRICE = 999999999;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };

// Derlenmiş oyunu (staticDir, ör. dist-server/) API ile AYNI origin'den
// sunmak için — böylece VM üzerinde tek HTTP girişi yeterli olur, ayrıca
// çerez SameSite=Strict cross-site sorunlarına hiç takılmaz. Bilinmeyen
// yollar index.html'e düşer (SPA); gerçek dosya isteği path traversal'a
// karşı staticDir dışına çıkamaz (resolve+startsWith kontrolü).
async function serveStatic(res, staticDir, reqPath) {
  const safePath = resolve(join(staticDir, decodeURIComponent(reqPath)));
  const target = safePath.startsWith(resolve(staticDir)) ? safePath : staticDir;
  for (const candidate of [target, join(staticDir, 'index.html')]) {
    try {
      const body = await readFile(candidate);
      res.writeHead(200, { 'Content-Type': MIME[extname(candidate)] || 'application/octet-stream', 'Cache-Control': candidate.endsWith('index.html') ? 'no-store' : 'public, max-age=31536000, immutable' });
      return res.end(body);
    } catch { /* dosya yok, sıradaki adaya (SPA fallback) düş */ }
  }
  res.writeHead(404); res.end('Not Found');
}

const stallActive = (row, now) => !!row && now < row.listed_at + row.duration_hours * 3600000;

// Client backups are deliberately separate from future authoritative game state.
export function createApi({ database = ':memory:', origin = 'http://localhost:5177', secure = true, staticDir = null, trustedProxy = null } = {}) {
  const db = new DatabaseSync(database);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS accounts(id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL, salt TEXT NOT NULL, password TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, account INTEGER NOT NULL REFERENCES accounts(id), expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS backups(account INTEGER PRIMARY KEY REFERENCES accounts(id), revision INTEGER NOT NULL, data TEXT NOT NULL, updated INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS backup_history(account INTEGER NOT NULL REFERENCES accounts(id), revision INTEGER NOT NULL, data TEXT NOT NULL, updated INTEGER NOT NULL, PRIMARY KEY(account,revision));
    CREATE TABLE IF NOT EXISTS chat_messages(id INTEGER PRIMARY KEY AUTOINCREMENT, author TEXT NOT NULL, text TEXT NOT NULL, is_gm INTEGER NOT NULL, created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS market_stalls(account INTEGER PRIMARY KEY REFERENCES accounts(id), seller_name TEXT NOT NULL, items TEXT NOT NULL, listed_at INTEGER NOT NULL, duration_hours INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS boss_fights(boss_id TEXT NOT NULL, spawn_at INTEGER NOT NULL, hp INTEGER NOT NULL, resolved INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(boss_id,spawn_at));
    CREATE TABLE IF NOT EXISTS boss_contributions(boss_id TEXT NOT NULL, spawn_at INTEGER NOT NULL, account INTEGER NOT NULL REFERENCES accounts(id), damage INTEGER NOT NULL, PRIMARY KEY(boss_id,spawn_at,account));
    CREATE TABLE IF NOT EXISTS boss_loot_claims(id INTEGER PRIMARY KEY AUTOINCREMENT, account INTEGER NOT NULL REFERENCES accounts(id), boss_id TEXT NOT NULL, created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS duel_history(id INTEGER PRIMARY KEY AUTOINCREMENT, challenger INTEGER NOT NULL REFERENCES accounts(id), opponent INTEGER NOT NULL REFERENCES accounts(id), winner TEXT NOT NULL, created_at INTEGER NOT NULL);`);
  // Başlangıçta bir kerelik temizlik — hafta öncesinin boss kayıtları hiç
  // kullanılmayacak, DB'nin sınırsız büyümesini önler.
  {
    const cutoff = Date.now() - 7 * 86400000;
    db.prepare('DELETE FROM boss_contributions WHERE spawn_at < ?').run(cutoff);
    db.prepare('DELETE FROM boss_fights WHERE spawn_at < ?').run(cutoff);
  }
  // Ters proxy arkasında (Caddy) her istek soket düzeyinde AYNI adresten
  // (proxy'nin kendisinden) geliyor — X-Forwarded-For'a körü körüne
  // güvenmek sahte üstbilgiyle rate-limit'i atlatmaya açar, bu yüzden
  // sadece doğrudan TCP bağlantısı `trustedProxy` ise (Caddy'nin kendi IP'si)
  // o üstbilgiye bakılıyor; başka her yerden gelen istekte soket adresi esas alınır.
  const clientAddress = req => {
    if (trustedProxy && req.socket.remoteAddress === trustedProxy && req.headers['x-forwarded-for']) {
      return req.headers['x-forwarded-for'].split(',')[0].trim();
    }
    return req.socket.remoteAddress;
  };
  // Genel bir dakikalık pencere sayacı — spam/kaba-kuvvet önleme, gerçek
  // yetkilendirme değil. Her çağıran kendi Map'ini ve limitini tutar (IP
  // bazlı register/login, hesap bazlı chat/boss saldırısı gibi).
  const makeRateLimiter = max => {
    const attempts = new Map();
    return key => {
      const now = Date.now();
      for (const [k, value] of attempts) if (value.until < now) attempts.delete(k);
      const entry = attempts.get(key) || { count: 0, until: now + 60000 };
      if (++entry.count > max || attempts.size > 10000) throw fail(429, 'TOO_MANY_ATTEMPTS');
      attempts.set(key, entry);
    };
  };
  const rateLimit = makeRateLimiter(12);
  // Hesap başına, IP'den bağımsız (Caddy arkasında birçok oyuncu aynı IP'yi
  // paylaşabilir) — spam önleme, gerçek yetkilendirme değil.
  const chatRateLimit = makeRateLimiter(20);
  const bossAttackRateLimit = makeRateLimiter(60);
  const duelRateLimit = makeRateLimiter(20);
  const read = async req => {
    let size = 0; const chunks = [];
    for await (const chunk of req) {
      size += chunk.length;
      if (size > LIMIT) throw fail(413, 'BACKUP_TOO_LARGE');
      chunks.push(chunk);
    }
    try { return JSON.parse(Buffer.concat(chunks).toString()); } catch { throw fail(400, 'INVALID_JSON'); }
  };
  const cookie = (token, age) => `nyxia_session=${token}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=${age}${secure ? '; Secure' : ''}`;
  const server = createServer(async (req, res) => {
    const send = (status, body) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }); res.end(JSON.stringify(body)); };
    try {
      if (req.headers.origin && req.headers.origin !== origin) throw fail(403, 'ORIGIN_DENIED');
      if (req.headers.origin === origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Vary', 'Origin');
      }
      if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return send(204, null);
      }
      if (req.method !== 'GET' && (req.headers.origin !== origin || !req.headers['content-type']?.startsWith('application/json'))) throw fail(403, 'INVALID_REQUEST_ORIGIN');
      const path = new URL(req.url, 'http://localhost').pathname;
      if (!path.startsWith('/api/')) {
        if (!staticDir || req.method !== 'GET') throw fail(404, 'NOT_FOUND');
        return serveStatic(res, staticDir, path);
      }
      if (path === '/api/health' && req.method === 'GET') return send(200, { ok: true, mode: 'account-backup', authoritative: false });
      if (['/api/register', '/api/login'].includes(path) && req.method === 'POST') {
        rateLimit(clientAddress(req));
        const body = await read(req);
        const name = typeof body?.name === 'string' ? body.name.trim().toLowerCase() : '';
        if (!/^[a-z0-9_]{3,24}$/.test(name) || typeof body?.password !== 'string' || body.password.length < 12 || body.password.length > 128) throw fail(400, 'INVALID_CREDENTIAL_FORMAT');
        let account = db.prepare('SELECT * FROM accounts WHERE name=?').get(name);
        if (path === '/api/register') {
          const salt = randomBytes(16).toString('hex');
          const password = (await scrypt(body.password, salt, 64)).toString('hex');
          try { db.prepare('INSERT INTO accounts(name,salt,password) VALUES(?,?,?)').run(name, salt, password); }
          catch (error) { if (error.code?.startsWith('ERR_SQLITE') && db.prepare('SELECT id FROM accounts WHERE name=?').get(name)) throw fail(409, 'ACCOUNT_UNAVAILABLE'); throw error; }
          account = db.prepare('SELECT * FROM accounts WHERE name=?').get(name);
        } else {
          const candidate = await scrypt(body.password, account?.salt || 'invalid-account-salt', 64);
          if (!account || !timingSafeEqual(candidate, Buffer.from(account.password, 'hex'))) throw fail(401, 'INVALID_CREDENTIALS');
        }
        const token = randomBytes(32).toString('hex');
        db.prepare('DELETE FROM sessions WHERE expires < ?').run(Date.now());
        db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(hash(token), account.id, Date.now() + 7 * 86400000);
        res.setHeader('Set-Cookie', cookie(token, 7 * 86400));
        return send(200, { name: account.name });
      }
      const token = /(?:^|;\s*)nyxia_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie || '')?.[1];
      const account = token && db.prepare('SELECT accounts.id,accounts.name FROM sessions JOIN accounts ON accounts.id=sessions.account WHERE token=? AND expires>?').get(hash(token), Date.now());
      if (!account) throw fail(401, 'LOGIN_REQUIRED');
      if (path === '/api/me' && req.method === 'GET') return send(200, { name: account.name });
      if (path === '/api/logout' && req.method === 'POST') {
        db.prepare('DELETE FROM sessions WHERE token=?').run(hash(token));
        res.setHeader('Set-Cookie', cookie('', 0)); return send(200, { ok: true });
      }
      if (path === '/api/backup' && req.method === 'GET') {
        const row = db.prepare('SELECT * FROM backups WHERE account=?').get(account.id);
        return send(200, { revision: row?.revision || 0, data: row ? JSON.parse(row.data) : null, trusted: false });
      }
      if (path === '/api/backup' && req.method === 'PUT') {
        const body = await read(req);
        if (!Number.isSafeInteger(body?.revision) || body.revision < 0 || !body.data || typeof body.data !== 'object' || !Array.isArray(body.data.characters) || body.data.characters.length !== 3) throw fail(400, 'INVALID_BACKUP');
        // No await between version check and commit: conflicting clients cannot overwrite silently.
        db.exec('BEGIN IMMEDIATE');
        try {
          const current = db.prepare('SELECT revision FROM backups WHERE account=?').get(account.id)?.revision || 0;
          if (current !== body.revision) throw fail(409, 'BACKUP_CONFLICT');
          const revision = current + 1, data = JSON.stringify(body.data), now = Date.now();
          db.prepare('INSERT INTO backup_history VALUES(?,?,?,?)').run(account.id, revision, data, now);
          db.prepare('INSERT OR REPLACE INTO backups VALUES(?,?,?,?)').run(account.id, revision, data, now);
          db.prepare('DELETE FROM backup_history WHERE account=? AND revision<=?').run(account.id, revision - 20);
          db.exec('COMMIT'); return send(200, { revision, trusted: false });
        } catch (error) { db.exec('ROLLBACK'); throw error; }
      }
      if (path === '/api/chat/messages' && req.method === 'GET') {
        const rows = db.prepare('SELECT id,author,text,is_gm,created_at FROM chat_messages ORDER BY id DESC LIMIT 100').all().reverse();
        return send(200, rows.map(r => ({ id: r.id, author: r.author, text: r.text, isGM: !!r.is_gm, createdAt: r.created_at })));
      }
      if (path === '/api/chat/messages' && req.method === 'POST') {
        chatRateLimit(account.id);
        const body = await read(req);
        const author = typeof body?.author === 'string' ? body.author.trim().slice(0, 40) : '';
        const text = typeof body?.text === 'string' ? body.text.trim().slice(0, 500) : '';
        if (!author || !text) throw fail(400, 'INVALID_MESSAGE');
        const isGm = !!body.isGM;
        const createdAt = Date.now();
        db.prepare('INSERT INTO chat_messages(author,text,is_gm,created_at) VALUES(?,?,?,?)').run(author, text, isGm ? 1 : 0, createdAt);
        const id = db.prepare('SELECT last_insert_rowid() AS id').get().id;
        db.prepare('DELETE FROM chat_messages WHERE id <= (SELECT MAX(id) - 200 FROM chat_messages)').run();
        return send(200, { id, author, text, isGM: isGm, createdAt });
      }
      // Faz 3 — paylaşımlı pazar. Hesap başına tek tezgah (bkz. market_stalls'ın
      // PRIMARY KEY'i). `sellerId` = market_stalls.account = accounts.id: takma
      // ad (nickname) hesaplar arası benzersiz DEĞİL, bu yüzden satın alma
      // isteğinde satıcıyı bulmak için isim değil bu opak id kullanılıyor.
      if (path === '/api/market/stall' && req.method === 'GET') {
        const row = db.prepare('SELECT * FROM market_stalls WHERE account=?').get(account.id);
        if (!row) return send(200, { stall: null });
        return send(200, { stall: { sellerName: row.seller_name, items: JSON.parse(row.items), listedAt: row.listed_at, durationHours: row.duration_hours, active: stallActive(row, Date.now()) } });
      }
      if (path === '/api/market/stalls' && req.method === 'GET') {
        const now = Date.now();
        const rows = db.prepare('SELECT * FROM market_stalls WHERE account != ?').all(account.id);
        return send(200, { stalls: rows.filter(r => stallActive(r, now)).map(r => ({ sellerId: r.account, sellerName: r.seller_name, items: JSON.parse(r.items) })) });
      }
      if (path === '/api/market/stall' && req.method === 'POST') {
        const body = await read(req);
        const sellerName = typeof body?.sellerName === 'string' ? body.sellerName.trim().slice(0, 24) : '';
        const durationHours = Number(body?.durationHours);
        if (!sellerName || !MARKET_DURATIONS_HOURS.has(durationHours)) throw fail(400, 'INVALID_STALL');
        const existing = db.prepare('SELECT * FROM market_stalls WHERE account=?').get(account.id);
        if (existing) throw fail(409, stallActive(existing, Date.now()) ? 'STALL_ALREADY_OPEN' : 'STALL_EXPIRED_MUST_CLOSE');
        const listedAt = Date.now();
        db.prepare('INSERT INTO market_stalls(account,seller_name,items,listed_at,duration_hours) VALUES(?,?,?,?,?)').run(account.id, sellerName, '[]', listedAt, durationHours);
        return send(200, { stall: { sellerName, items: [], listedAt, durationHours, active: true } });
      }
      if (path === '/api/market/stall/items' && req.method === 'POST') {
        const body = await read(req);
        const price = Number(body?.price);
        if (!body?.item || typeof body.item !== 'object' || !Number.isSafeInteger(price) || price <= 0 || price > MARKET_MAX_PRICE) throw fail(400, 'INVALID_LISTING');
        db.exec('BEGIN IMMEDIATE');
        try {
          const row = db.prepare('SELECT * FROM market_stalls WHERE account=?').get(account.id);
          if (!row || !stallActive(row, Date.now())) throw fail(400, 'NO_OPEN_STALL');
          const items = JSON.parse(row.items);
          if (items.length >= MARKET_STALL_MAX_ITEMS) throw fail(400, 'STALL_FULL');
          items.push({ id: randomBytes(8).toString('hex'), item: body.item, price });
          db.prepare('UPDATE market_stalls SET items=? WHERE account=?').run(JSON.stringify(items), account.id);
          db.exec('COMMIT');
          return send(200, { stall: { sellerName: row.seller_name, items, listedAt: row.listed_at, durationHours: row.duration_hours, active: true } });
        } catch (error) { db.exec('ROLLBACK'); throw error; }
      }
      // Hem "erken kapat" (tüm id'ler) hem "süresi dolmuş tezgahtan geri al"
      // (sadece depoya sığan id'ler) burayı kullanır — istemci hangi id'lerin
      // gerçekten yerleştirildiğine kendi karar verip gönderiyor, sığmayanlar
      // tezgahta kalmaya devam eder (bkz. MarketTab.jsx#distributeReclaimedItems).
      if (path === '/api/market/stall/items' && req.method === 'DELETE') {
        const body = await read(req);
        const ids = new Set(Array.isArray(body?.itemIds) ? body.itemIds : []);
        db.exec('BEGIN IMMEDIATE');
        try {
          const row = db.prepare('SELECT * FROM market_stalls WHERE account=?').get(account.id);
          if (!row) { db.exec('COMMIT'); return send(200, { removed: [] }); }
          const items = JSON.parse(row.items);
          const removed = items.filter(entry => ids.has(entry.id));
          const remaining = items.filter(entry => !ids.has(entry.id));
          if (remaining.length === 0) db.prepare('DELETE FROM market_stalls WHERE account=?').run(account.id);
          else db.prepare('UPDATE market_stalls SET items=? WHERE account=?').run(JSON.stringify(remaining), account.id);
          db.exec('COMMIT');
          return send(200, { removed });
        } catch (error) { db.exec('ROLLBACK'); throw error; }
      }
      // Satın alma: eşya transferi ATOMİK (aynı eşya iki kişiye satılamaz,
      // kaybolmaz). Ödeme satıcıya SUNUCUDA, doğrudan onun yedeğindeki
      // bankGold'a ekleniyor — satıcı o an bağlı olmayabilir, ödemenin
      // gerçekleşmesi için istemcisinin açık olmasına bağlı KALINAMAZ.
      // Alıcının altın düşüşü ise (oyundaki HER ŞEY gibi — canavar öldürme,
      // iksir alma, GM komutları...) hâlâ istemci tarafında; dosyanın en
      // üstündeki genel nottaki güven sınırıyla aynı seviyede (authoritative
      // olmayan bir istemci teorik olarak ödemeden alabilir) — tam
      // sunucu-taraflı ekonomi Faz 4/5'in işi.
      if (path === '/api/market/buy' && req.method === 'POST') {
        const body = await read(req);
        const sellerId = Number(body?.sellerId);
        const itemId = typeof body?.itemId === 'string' ? body.itemId : '';
        if (!Number.isSafeInteger(sellerId) || !itemId) throw fail(400, 'INVALID_PURCHASE');
        if (sellerId === account.id) throw fail(400, 'CANNOT_BUY_OWN_STALL');
        db.exec('BEGIN IMMEDIATE');
        try {
          const stallRow = db.prepare('SELECT * FROM market_stalls WHERE account=?').get(sellerId);
          if (!stallRow || !stallActive(stallRow, Date.now())) throw fail(409, 'LISTING_GONE');
          const items = JSON.parse(stallRow.items);
          const idx = items.findIndex(entry => entry.id === itemId);
          if (idx === -1) throw fail(409, 'LISTING_GONE');
          const [bought] = items.splice(idx, 1);
          if (items.length === 0) db.prepare('DELETE FROM market_stalls WHERE account=?').run(sellerId);
          else db.prepare('UPDATE market_stalls SET items=? WHERE account=?').run(JSON.stringify(items), sellerId);
          const sellerBackup = db.prepare('SELECT * FROM backups WHERE account=?').get(sellerId);
          if (sellerBackup) {
            const data = JSON.parse(sellerBackup.data);
            data.bankGold = Math.min(2000000000, (data.bankGold || 0) + bought.price);
            const revision = sellerBackup.revision + 1, now = Date.now(), json = JSON.stringify(data);
            db.prepare('INSERT INTO backup_history VALUES(?,?,?,?)').run(sellerId, revision, json, now);
            db.prepare('INSERT OR REPLACE INTO backups VALUES(?,?,?,?)').run(sellerId, revision, json, now);
            db.prepare('DELETE FROM backup_history WHERE account=? AND revision<=?').run(sellerId, revision - 20);
          }
          db.exec('COMMIT');
          return send(200, { item: bought.item, price: bought.price });
        } catch (error) { db.exec('ROLLBACK'); throw error; }
      }
      // Faz 4 — paylaşımlı Dünya Canavarı. Faz geçişleri (dormant/gathering/
      // countdown/active/gone) istemci tarafında zaten hesaplanıyor (bkz.
      // utils/warzoneBoss.js#bossSchedule, WarzoneTab.jsx — burası da AYNI
      // saf fonksiyonu kullanıyor, iki ayrı takvim birbirinden sapmıyor).
      // Sunucunun tuttuğu tek şey: "active" fazdaki bosslarda PAYLAŞILAN can
      // ve katkı miktarları. Hasar İSTEMCİDE hesaplanıyor (mevcut formül
      // değişmedi) — sunucu sadece akla yatkın bir üst sınırla (bkz.
      // BOSS_HIT_CAP_RATIO) körü körüne kabul etmiyor; bu TAM anti-hile
      // değil (gerçek sunucu-taraflı hasar hesaplaması, oyuncunun gerçek
      // ekipman/istatistiklerinin sunucuda da bilinmesini gerektirir — o,
      // Faz 5'in işi), sadece en bariz istismarı (tek vuruşta boss'u
      // silme gibi) engelleyen bir akıl sağlığı sınırı.
      if (path === '/api/warzone/bosses' && req.method === 'GET') {
        const now = Date.now();
        const result = {};
        for (const boss of WARZONE_BOSSES) {
          const sched = bossSchedule(boss, now);
          if (sched.phase !== 'active') continue;
          let fight = db.prepare('SELECT * FROM boss_fights WHERE boss_id=? AND spawn_at=?').get(boss.id, sched.spawnAt);
          if (!fight) {
            db.prepare('INSERT INTO boss_fights(boss_id,spawn_at,hp,resolved) VALUES(?,?,?,0)').run(boss.id, sched.spawnAt, boss.hp);
            fight = { boss_id: boss.id, spawn_at: sched.spawnAt, hp: boss.hp, resolved: 0 };
          }
          const myDamage = db.prepare('SELECT damage FROM boss_contributions WHERE boss_id=? AND spawn_at=? AND account=?').get(boss.id, sched.spawnAt, account.id)?.damage || 0;
          const totalDamage = db.prepare('SELECT COALESCE(SUM(damage),0) AS total FROM boss_contributions WHERE boss_id=? AND spawn_at=?').get(boss.id, sched.spawnAt).total;
          result[boss.id] = { hp: fight.hp, maxHp: boss.hp, resolved: !!fight.resolved, myDamage, totalDamage };
        }
        return send(200, { bosses: result });
      }
      const attackMatch = path.match(/^\/api\/warzone\/boss\/([a-z0-9_]+)\/attack$/);
      if (attackMatch && req.method === 'POST') {
        bossAttackRateLimit(account.id);
        const boss = WARZONE_BOSSES.find(b => b.id === attackMatch[1]);
        if (!boss) throw fail(404, 'NOT_FOUND');
        const sched = bossSchedule(boss, Date.now());
        if (sched.phase !== 'active') throw fail(409, 'BOSS_NOT_ACTIVE');
        const body = await read(req);
        const damage = Number(body?.damage);
        const BOSS_HIT_CAP_RATIO = 0.5; // bkz. yukarıdaki genel not — tek vuruş boss canının yarısını aşamaz
        if (!Number.isSafeInteger(damage) || damage <= 0 || damage > boss.hp * BOSS_HIT_CAP_RATIO) throw fail(400, 'INVALID_DAMAGE');
        db.exec('BEGIN IMMEDIATE');
        try {
          let fight = db.prepare('SELECT * FROM boss_fights WHERE boss_id=? AND spawn_at=?').get(boss.id, sched.spawnAt);
          if (!fight) { db.prepare('INSERT INTO boss_fights(boss_id,spawn_at,hp,resolved) VALUES(?,?,?,0)').run(boss.id, sched.spawnAt, boss.hp); fight = { hp: boss.hp, resolved: 0 }; }
          if (fight.resolved) throw fail(409, 'BOSS_ALREADY_DEFEATED');
          const hp = Math.max(0, fight.hp - damage);
          const resolved = hp <= 0;
          db.prepare('UPDATE boss_fights SET hp=?, resolved=? WHERE boss_id=? AND spawn_at=?').run(hp, resolved ? 1 : 0, boss.id, sched.spawnAt);
          const prevMine = db.prepare('SELECT damage FROM boss_contributions WHERE boss_id=? AND spawn_at=? AND account=?').get(boss.id, sched.spawnAt, account.id)?.damage || 0;
          db.prepare('INSERT INTO boss_contributions(boss_id,spawn_at,account,damage) VALUES(?,?,?,?) ON CONFLICT(boss_id,spawn_at,account) DO UPDATE SET damage=excluded.damage').run(boss.id, sched.spawnAt, account.id, prevMine + damage);
          let wonByMe = false;
          if (resolved) {
            // Kullanıcı isteği (bot dönemimden kalan ilke, gerçek oyunculara
            // taşındı): "Düşen drop random olacak. Damage atan kişiler
            // arasında en yüksek damage'i atan kişi biraz daha şanslı
            // olacak." — hasarla orantılı ağırlıklı çekiliş, kesin değil.
            const contributions = db.prepare('SELECT account, damage FROM boss_contributions WHERE boss_id=? AND spawn_at=?').all(boss.id, sched.spawnAt);
            const total = contributions.reduce((sum, c) => sum + c.damage, 0);
            let roll = Math.random() * total, winner = contributions[contributions.length - 1]?.account;
            for (const c of contributions) { roll -= c.damage; if (roll <= 0) { winner = c.account; break; } }
            if (winner) {
              db.prepare('INSERT INTO boss_loot_claims(account,boss_id,created_at) VALUES(?,?,?)').run(winner, boss.id, Date.now());
              wonByMe = winner === account.id;
            }
          }
          db.exec('COMMIT');
          return send(200, { hp, resolved, wonByMe });
        } catch (error) { db.exec('ROLLBACK'); throw error; }
      }
      if (path === '/api/warzone/loot-claims' && req.method === 'GET') {
        const rows = db.prepare('SELECT id, boss_id, created_at FROM boss_loot_claims WHERE account=?').all(account.id);
        return send(200, { claims: rows.map(r => ({ id: r.id, bossId: r.boss_id, createdAt: r.created_at })) });
      }
      const claimMatch = path.match(/^\/api\/warzone\/loot-claims\/(\d+)\/claim$/);
      if (claimMatch && req.method === 'POST') {
        const result = db.prepare('DELETE FROM boss_loot_claims WHERE id=? AND account=?').run(Number(claimMatch[1]), account.id);
        if (result.changes === 0) throw fail(404, 'CLAIM_NOT_FOUND');
        return send(200, { ok: true });
      }
      // Faz 5 — gerçek PvP. Duello hesaplaması (bkz. utils/duelEngine.js)
      // saf/deterministik ama React ikonlarına kadar uzanan geniş bir bağımlı
      // ağacı var (bkz. data/classes.js#icon) — sunucuda çalıştırmak için o
      // ağacı ayıklamak bu fazın kapsamını çok büyütürdü. Bunun yerine
      // ASENKRON bir model: iki oyuncu aynı anda çevrimiçi olmak ZORUNDA
      // değil — sunucu rastgele GERÇEK bir başka hesabın en son senkronlanmış
      // karakter anlık görüntüsünü (bkz. backups tablosu) verir, düello o
      // anlık görüntüye karşı İSTEMCİDE (mevcut deterministic motor, değişmedi)
      // koşulur. Rakip hiçbir şey kaybetmez/kazanmaz (sadece bir hedef),
      // National Point ödülü/cezası SADECE meydan okuyanın kendi istemcisinde
      // uygulanır — oyundaki her ekonomi hareketiyle aynı güven seviyesi.
      if (path === '/api/warzone/duel/opponent' && req.method === 'GET') {
        duelRateLimit(account.id);
        const level = Number(new URL(req.url, 'http://localhost').searchParams.get('level')) || 1;
        const rows = db.prepare('SELECT backups.account AS account, backups.data AS data, accounts.name AS accountName FROM backups JOIN accounts ON accounts.id = backups.account WHERE backups.account != ?').all(account.id);
        const candidates = [];
        for (const row of rows) {
          let data;
          try { data = JSON.parse(row.data); } catch { continue; }
          const chars = Array.isArray(data?.characters) ? data.characters.filter(Boolean) : [];
          if (chars.length === 0) continue;
          const main = chars.reduce((best, c) => (!best || (c.level || 0) > (best.level || 0) ? c : best), null);
          if (!main) continue;
          candidates.push({ accountId: row.account, accountName: row.accountName, character: main });
        }
        const inRange = candidates.filter(c => Math.abs((c.character.level || 1) - level) <= 15);
        const pool = inRange.length > 0 ? inRange : candidates;
        if (pool.length === 0) return send(200, { opponent: null });
        const picked = pool[Math.floor(Math.random() * pool.length)];
        const seed = randomBytes(4).readUInt32BE(0) || 1;
        return send(200, { opponentAccountId: picked.accountId, opponentName: picked.character.nickname || picked.accountName, opponent: picked.character, seed });
      }
      if (path === '/api/warzone/duel/result' && req.method === 'POST') {
        duelRateLimit(account.id);
        const body = await read(req);
        const opponentAccountId = Number(body?.opponentAccountId);
        const winner = ['me', 'opponent', 'draw'].includes(body?.winner) ? body.winner : null;
        if (!Number.isSafeInteger(opponentAccountId) || !winner) throw fail(400, 'INVALID_DUEL_RESULT');
        db.prepare('INSERT INTO duel_history(challenger,opponent,winner,created_at) VALUES(?,?,?,?)').run(account.id, opponentAccountId, winner, Date.now());
        return send(200, { ok: true });
      }
      throw fail(404, 'NOT_FOUND');
    } catch (error) { send(error.status || 500, { error: error.status ? error.message : 'SERVER_ERROR' }); }
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  return { server, close: () => new Promise(resolve => server.close(() => { db.close(); resolve(); })) };
}
