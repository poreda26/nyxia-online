import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, createHash, scrypt as derive, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(derive);
const hash = value => createHash('sha256').update(value).digest('hex');
const fail = (status, code) => Object.assign(new Error(code), { status });
const LIMIT = 2 * 1024 * 1024;

// Client backups are deliberately separate from future authoritative game state.
export function createApi({ database = ':memory:', origin = 'http://localhost:5177', secure = true } = {}) {
  const db = new DatabaseSync(database);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS accounts(id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL, salt TEXT NOT NULL, password TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, account INTEGER NOT NULL REFERENCES accounts(id), expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS backups(account INTEGER PRIMARY KEY REFERENCES accounts(id), revision INTEGER NOT NULL, data TEXT NOT NULL, updated INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS backup_history(account INTEGER NOT NULL REFERENCES accounts(id), revision INTEGER NOT NULL, data TEXT NOT NULL, updated INTEGER NOT NULL, PRIMARY KEY(account,revision));`);
  const attempts = new Map();
  const rateLimit = address => {
    const now = Date.now();
    for (const [key, value] of attempts) if (value.until < now) attempts.delete(key);
    const entry = attempts.get(address) || { count: 0, until: now + 60000 };
    if (++entry.count > 12 || attempts.size > 10000) throw fail(429, 'TOO_MANY_ATTEMPTS');
    attempts.set(address, entry);
  };
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
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return send(204, null);
      }
      if (req.method !== 'GET' && (req.headers.origin !== origin || !req.headers['content-type']?.startsWith('application/json'))) throw fail(403, 'INVALID_REQUEST_ORIGIN');
      const path = new URL(req.url, 'http://localhost').pathname;
      if (path === '/api/health' && req.method === 'GET') return send(200, { ok: true, mode: 'account-backup', authoritative: false });
      if (['/api/register', '/api/login'].includes(path) && req.method === 'POST') {
        rateLimit(req.socket.remoteAddress);
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
      throw fail(404, 'NOT_FOUND');
    } catch (error) { send(error.status || 500, { error: error.status ? error.message : 'SERVER_ERROR' }); }
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  return { server, close: () => new Promise(resolve => server.close(() => { db.close(); resolve(); })) };
}
