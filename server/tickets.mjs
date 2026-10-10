import { randomBytes, randomInt, timingSafeEqual } from 'node:crypto';

// Destek talepleri (ticket). Oyuncu siteden (oturum açmadan) talep açar; talebe kod + gizli anahtarla geri döner.
// Anahtar bağlantıda (#k=...) taşınır, sunucu günlüklerine girmez. Yanıtlar sahip panelinden verilir.
export const TICKET_CATEGORIES = ['account', 'bug', 'payment', 'report', 'suggestion', 'other'];
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const MAX_SUBJECT = 120;
const MAX_BODY = 4000;
const MAX_MESSAGES = 40;
const PER_EMAIL_HOUR = 3;
const PER_EMAIL_DAY = 8;
const PER_DAY = Number(process.env.TICKET_DAILY_LIMIT) || 300;
const REOPEN_WINDOW_MS = 14 * 86400000;

const clean = (value, max) => (typeof value === 'string' ? value.replace(/\r\n/g, '\n').trim().slice(0, max) : '');
const validEmail = (value) => value.length <= 120 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
const same = (a, b) => { const x = Buffer.from(String(a)); const y = Buffer.from(String(b)); return x.length === y.length && timingSafeEqual(x, y); };

export function createTickets(db, { fail, mailer, siteUrl = 'https://nyxiaonline.com', notifyEmail = null }) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tickets(id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT UNIQUE NOT NULL, key TEXT NOT NULL, email TEXT NOT NULL, username TEXT, category TEXT NOT NULL, subject TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'open', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, closed_at INTEGER);
    CREATE TABLE IF NOT EXISTS ticket_messages(id INTEGER PRIMARY KEY AUTOINCREMENT, ticket INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE, author TEXT NOT NULL, body TEXT NOT NULL, created_at INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS tickets_status ON tickets(status, updated_at);
    CREATE INDEX IF NOT EXISTS tickets_email ON tickets(email, created_at);
    CREATE INDEX IF NOT EXISTS ticket_messages_ticket ON ticket_messages(ticket, id);
  `);

  const link = (ticket) => `${siteUrl}/ticket.html?c=${ticket.code}#k=${ticket.key}`;
  // E-posta bildirimi en iyi çabayla gider; gönderilemese de talep kaydedilir.
  const notify = async (to, subject, text) => { if (!mailer?.configured || !to) return; try { await mailer.send({ to, subject, text }); } catch { /* bildirim başarısız: talep yine de geçerli */ } };

  const newCode = () => {
    for (let i = 0; i < 20; i++) {
      const code = 'NX-' + Array.from({ length: 6 }, () => CODE_ALPHABET[randomInt(0, CODE_ALPHABET.length)]).join('');
      if (!db.prepare('SELECT 1 FROM tickets WHERE code=?').get(code)) return code;
    }
    throw fail(500, 'TICKET_CODE_FAILED');
  };

  const messagesOf = (id) => db.prepare('SELECT author, body, created_at FROM ticket_messages WHERE ticket=? ORDER BY id').all(id);
  const publicView = (ticket) => ({ code: ticket.code, subject: ticket.subject, category: ticket.category, status: ticket.status, created_at: ticket.created_at, updated_at: ticket.updated_at, messages: messagesOf(ticket.id) });
  const authorize = (code, key) => {
    const ticket = typeof code === 'string' ? db.prepare('SELECT * FROM tickets WHERE code=?').get(code.trim().toUpperCase()) : null;
    if (!ticket || typeof key !== 'string' || !same(ticket.key, key)) throw fail(404, 'TICKET_NOT_FOUND');
    return ticket;
  };

  const create = async (input, now = Date.now()) => {
    // Bal kabı alanı: gizli "website" alanını dolduran botlar sessizce başarılı sanır, kayıt açılmaz.
    if (input?.website) return { code: 'NX-000000', key: '0'.repeat(24), ignored: true };
    const email = clean(input?.email, 120).toLowerCase();
    const subject = clean(input?.subject, MAX_SUBJECT);
    const body = clean(input?.message, MAX_BODY);
    const category = TICKET_CATEGORIES.includes(input?.category) ? input.category : 'other';
    const username = clean(input?.username, 24).toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!validEmail(email)) throw fail(400, 'INVALID_EMAIL');
    if (subject.length < 3) throw fail(400, 'SUBJECT_REQUIRED');
    if (body.length < 10) throw fail(400, 'MESSAGE_TOO_SHORT');
    if (db.prepare('SELECT COUNT(*) AS n FROM tickets WHERE email=? AND created_at>?').get(email, now - 3600000).n >= PER_EMAIL_HOUR) throw fail(429, 'TOO_MANY_TICKETS');
    if (db.prepare('SELECT COUNT(*) AS n FROM tickets WHERE email=? AND created_at>?').get(email, now - 86400000).n >= PER_EMAIL_DAY) throw fail(429, 'TOO_MANY_TICKETS');
    if (db.prepare('SELECT COUNT(*) AS n FROM tickets WHERE created_at>?').get(now - 86400000).n >= PER_DAY) throw fail(429, 'TOO_MANY_TICKETS');
    const ticket = { code: newCode(), key: randomBytes(12).toString('hex') };
    const id = Number(db.prepare('INSERT INTO tickets(code,key,email,username,category,subject,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)').run(ticket.code, ticket.key, email, username || null, category, subject, 'open', now, now).lastInsertRowid);
    db.prepare('INSERT INTO ticket_messages(ticket,author,body,created_at) VALUES(?,?,?,?)').run(id, 'user', body, now);
    await notify(email, `Nyxia Online destek talebin alındı (${ticket.code})`, `Merhaba,\n\nTalebini aldık. Numaran: ${ticket.code}\nDurumu ve yanıtları şu bağlantıdan takip edebilirsin:\n${link(ticket)}\n\nBu bağlantı sana özeldir, başkalarıyla paylaşma.\n\nNyxia Online`);
    await notify(notifyEmail, `Yeni destek talebi ${ticket.code}: ${subject}`, `${email}${username ? ` (${username})` : ''}\nKategori: ${category}\n\n${body}\n\nPanel: https://panel.nyxiaonline.com/owner.html`);
    return ticket;
  };

  const view = (code, key) => publicView(authorize(code, key));

  const reply = async (code, key, rawMessage, now = Date.now()) => {
    const ticket = authorize(code, key);
    const body = clean(rawMessage, MAX_BODY);
    if (body.length < 2) throw fail(400, 'MESSAGE_TOO_SHORT');
    if (ticket.status === 'closed' && ticket.closed_at && now - ticket.closed_at > REOPEN_WINDOW_MS) throw fail(409, 'TICKET_CLOSED');
    if (db.prepare('SELECT COUNT(*) AS n FROM ticket_messages WHERE ticket=? AND author=?').get(ticket.id, 'user').n >= MAX_MESSAGES) throw fail(429, 'TOO_MANY_MESSAGES');
    if (db.prepare("SELECT COUNT(*) AS n FROM ticket_messages WHERE ticket=? AND author='user' AND created_at>?").get(ticket.id, now - 60000).n >= 3) throw fail(429, 'TOO_MANY_MESSAGES');
    db.prepare('INSERT INTO ticket_messages(ticket,author,body,created_at) VALUES(?,?,?,?)').run(ticket.id, 'user', body, now);
    db.prepare("UPDATE tickets SET status='open', closed_at=NULL, updated_at=? WHERE id=?").run(now, ticket.id);
    await notify(notifyEmail, `Destek talebine yeni mesaj ${ticket.code}`, `${ticket.email}\n\n${body}\n\nPanel: https://panel.nyxiaonline.com/owner.html`);
    return publicView(db.prepare('SELECT * FROM tickets WHERE id=?').get(ticket.id));
  };

  // --- Sahip paneli
  const counts = () => ({
    open: db.prepare("SELECT COUNT(*) AS n FROM tickets WHERE status='open'").get().n,
    answered: db.prepare("SELECT COUNT(*) AS n FROM tickets WHERE status='answered'").get().n,
  });
  const list = (status) => db.prepare(`SELECT t.id, t.code, t.email, t.username, t.category, t.subject, t.status, t.created_at, t.updated_at,
      (SELECT COUNT(*) FROM ticket_messages m WHERE m.ticket=t.id) AS messages
    FROM tickets t ${['open', 'answered', 'closed'].includes(status) ? 'WHERE t.status=?' : ''} ORDER BY CASE t.status WHEN 'open' THEN 0 WHEN 'answered' THEN 1 ELSE 2 END, t.updated_at DESC LIMIT 200`).all(...(['open', 'answered', 'closed'].includes(status) ? [status] : []));
  const staffView = (id) => {
    const ticket = db.prepare('SELECT id, code, email, username, category, subject, status, created_at, updated_at FROM tickets WHERE id=?').get(Number(id));
    if (!ticket) throw fail(404, 'TICKET_NOT_FOUND');
    return { ...ticket, messages: messagesOf(ticket.id) };
  };
  const staffReply = async (id, rawMessage, close = false, now = Date.now()) => {
    const ticket = db.prepare('SELECT * FROM tickets WHERE id=?').get(Number(id));
    if (!ticket) throw fail(404, 'TICKET_NOT_FOUND');
    const body = clean(rawMessage, MAX_BODY);
    if (body.length < 2) throw fail(400, 'MESSAGE_TOO_SHORT');
    db.prepare('INSERT INTO ticket_messages(ticket,author,body,created_at) VALUES(?,?,?,?)').run(ticket.id, 'staff', body, now);
    db.prepare('UPDATE tickets SET status=?, updated_at=?, closed_at=? WHERE id=?').run(close ? 'closed' : 'answered', now, close ? now : null, ticket.id);
    await notify(ticket.email, `Nyxia Online destek talebine yanıt (${ticket.code})`, `Merhaba,\n\nDestek talebine yanıt verdik:\n\n${body}\n\nTalebin tamamı ve yanıt verme: ${link(ticket)}\n\nNyxia Online`);
    return staffView(ticket.id);
  };
  const staffSetStatus = (id, status, now = Date.now()) => {
    if (!['open', 'answered', 'closed'].includes(status)) throw fail(400, 'INVALID_STATUS');
    const result = db.prepare('UPDATE tickets SET status=?, updated_at=?, closed_at=? WHERE id=?').run(status, now, status === 'closed' ? now : null, Number(id));
    if (!result.changes) throw fail(404, 'TICKET_NOT_FOUND');
    return staffView(id);
  };

  return { create, view, reply, counts, list, staffView, staffReply, staffSetStatus };
}
