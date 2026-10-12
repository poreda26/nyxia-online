import { statSync, statfsSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { parseBirthDate, ageOf, MIN_AGE } from './age.mjs';

// Sahip paneli işletme araçları: oyuncu postası/hediye, duyuru ve bakım modu, istatistik ve sağlık, duyuru e-postası,
// yetkili rolleri ve hesap kurtarma. Hepsi sunucuda doğrulanır; panel yalnızca bunları çağırır.
const DAY = 86400000;
// Tek seferde verilebilecek üst sınırlar (hata ve kötüye kullanıma karşı güvenlik ağı).
export const GIFT_LIMITS = {
  user: { diamonds: 10000, gold: 5000000, voucherCount: 5, scrollCount: 50 },
  all: { diamonds: 1000, gold: 1000000, voucherCount: 2, scrollCount: 10 },
};
const VOUCHER_TIERS = ['mythic', 'apex'];
const json = (text) => { try { return text ? JSON.parse(text) : null; } catch { return null; } };
const int = (value, fallback = 0) => (Number.isSafeInteger(value) ? value : fallback);

export function createOps(db, { fail, wallet, mailer, dbPath, setPassword, revokeSessions, onConfigChange = () => {} }) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_config(key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS mail(
      id INTEGER PRIMARY KEY AUTOINCREMENT, account INTEGER NOT NULL REFERENCES accounts(id), title TEXT NOT NULL, body TEXT NOT NULL DEFAULT '',
      items TEXT NOT NULL DEFAULT '{}', sender TEXT NOT NULL DEFAULT 'Nyxia', created_at INTEGER NOT NULL, expires_at INTEGER, claimed_at INTEGER);
    CREATE INDEX IF NOT EXISTS mail_account ON mail(account, claimed_at);
    CREATE TABLE IF NOT EXISTS staff_roles(account INTEGER PRIMARY KEY REFERENCES accounts(id), role TEXT NOT NULL, granted_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS marketing_campaigns(id INTEGER PRIMARY KEY AUTOINCREMENT, subject TEXT NOT NULL, body TEXT NOT NULL, created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS marketing_sends(campaign INTEGER NOT NULL, account INTEGER NOT NULL, status TEXT NOT NULL, at INTEGER NOT NULL, PRIMARY KEY(campaign, account));
  `);
  const cfg = (key) => db.prepare('SELECT value FROM app_config WHERE key=?').get(key)?.value;
  const setCfg = (key, value) => { db.prepare('INSERT OR REPLACE INTO app_config(key,value) VALUES(?,?)').run(key, String(value)); onConfigChange(); };
  const delCfg = (key) => { db.prepare('DELETE FROM app_config WHERE key=?').run(key); onConfigChange(); };

  // ---------- Yetkililer (moderatör)
  const staffRole = (id) => db.prepare('SELECT role FROM staff_roles WHERE account=?').get(id)?.role || null;
  const isMod = (id) => staffRole(id) === 'mod';

  // ---------- Herkese açık durum: duyuru + bakım
  const status = (now = Date.now()) => {
    const a = json(cfg('announcement'));
    const m = json(cfg('maintenance'));
    return {
      announcement: a && (!a.until || a.until > now) ? { tr: a.tr || '', en: a.en || '', level: a.level === 'warn' ? 'warn' : 'info' } : null,
      maintenance: m?.on ? { tr: m.tr || '', en: m.en || '' } : null,
    };
  };
  const maintenanceOn = () => !!json(cfg('maintenance'))?.on;

  // ---------- Posta / hediye
  const mailList = (account, now = Date.now()) => {
    const rows = db.prepare('SELECT id,title,body,items,sender,created_at,expires_at,claimed_at FROM mail WHERE account=? AND (expires_at IS NULL OR expires_at>?) ORDER BY (claimed_at IS NULL) DESC, id DESC LIMIT 40').all(account, now);
    return { unread: rows.filter((r) => !r.claimed_at).length, items: rows.map((r) => ({ ...r, items: json(r.items) || {} })) };
  };
  const mailRead = (account, id, now = Date.now()) => {
    const row = db.prepare('SELECT items,claimed_at FROM mail WHERE id=? AND account=?').get(id, account);
    if (!row) throw fail(404, 'MAIL_NOT_FOUND');
    const items = json(row.items) || {};
    if (items.diamonds || items.gold || items.vouchers?.length || items.scrolls?.length) throw fail(400, 'MAIL_HAS_ITEMS');
    db.prepare('UPDATE mail SET claimed_at=COALESCE(claimed_at,?) WHERE id=?').run(now, id);
    return { ok: true };
  };
  const cleanItems = (body, limits) => {
    const diamonds = int(body.diamonds);
    const gold = int(body.gold);
    if (diamonds < 0 || diamonds > limits.diamonds) throw fail(400, 'DIAMONDS_LIMIT');
    if (gold < 0 || gold > limits.gold) throw fail(400, 'GOLD_LIMIT');
    const vouchers = (Array.isArray(body.vouchers) ? body.vouchers : []).slice(0, 4).map((v) => ({ tier: String(v?.tier), hours: int(v?.hours), count: int(v?.count, 1) })).filter((v) => v.count > 0);
    for (const v of vouchers) if (!VOUCHER_TIERS.includes(v.tier) || v.hours < 1 || v.hours > 720 || v.count > limits.voucherCount) throw fail(400, 'VOUCHER_LIMIT');
    const scrolls = (Array.isArray(body.scrolls) ? body.scrolls : []).slice(0, 4).map((s) => ({ tier: int(s?.tier), count: int(s?.count, 1) })).filter((s) => s.count > 0);
    for (const s of scrolls) if (s.tier < 1 || s.tier > 6 || s.count > limits.scrollCount) throw fail(400, 'SCROLL_LIMIT');
    return { diamonds, gold, vouchers, scrolls };
  };
  const sendMail = (body, now = Date.now()) => {
    const title = typeof body.title === 'string' ? body.title.trim().slice(0, 80) : '';
    const text = typeof body.body === 'string' ? body.body.trim().slice(0, 600) : '';
    if (title.length < 2) throw fail(400, 'TITLE_REQUIRED');
    const toAll = body.target === 'all';
    const items = cleanItems(body, toAll ? GIFT_LIMITS.all : GIFT_LIMITS.user);
    const days = Math.min(90, Math.max(1, int(body.expireDays, 30)));
    const expires = now + days * DAY;
    const insert = db.prepare('INSERT INTO mail(account,title,body,items,created_at,expires_at) VALUES(?,?,?,?,?,?)');
    if (toAll) {
      if (body.confirm !== 'HERKES') throw fail(400, 'CONFIRM_REQUIRED');
      const ids = db.prepare('SELECT id FROM accounts WHERE age_locked=0').all();
      for (const row of ids) insert.run(row.id, title, text, JSON.stringify(items), now, expires);
      return { sent: ids.length, items };
    }
    const target = db.prepare('SELECT id FROM accounts WHERE name=?').get(String(body.name || '').trim().toLowerCase());
    if (!target) throw fail(404, 'ACCOUNT_NOT_FOUND');
    insert.run(target.id, title, text, JSON.stringify(items), now, expires);
    return { sent: 1, items };
  };

  // ---------- İstatistik, sağlık, izleme
  const dayKey = (ms) => new Date(ms).toISOString().slice(0, 10);
  const stats = (now = Date.now()) => {
    const count = (sql, ...p) => db.prepare(sql).get(...p).n;
    const since = (days) => now - days * DAY;
    const signups = Object.fromEntries(Array.from({ length: 14 }, (_, i) => [dayKey(now - (13 - i) * DAY), 0]));
    for (const r of db.prepare('SELECT created_at FROM accounts WHERE created_at>?').all(since(14))) { const k = dayKey(r.created_at); if (k in signups) signups[k] += 1; }
    const ads = Object.fromEntries(Array.from({ length: 14 }, (_, i) => [dayKey(now - (13 - i) * DAY), { views: 0, diamonds: 0 }]));
    for (const r of db.prepare("SELECT rewarded_at,amount FROM ad_tickets WHERE rewarded_at>?").all(since(14))) { const k = dayKey(r.rewarded_at); if (ads[k]) { ads[k].views += 1; ads[k].diamonds += r.amount || 0; } }
    const ages = { under18: 0, a18_24: 0, a25_34: 0, a35: 0, unknown: 0 };
    for (const r of db.prepare('SELECT birth_date FROM accounts').all()) {
      const p = parseBirthDate(r.birth_date || '', now);
      if (!p) { ages.unknown += 1; continue; }
      const age = ageOf(p, now);
      if (age < 18) ages.under18 += 1; else if (age < 25) ages.a18_24 += 1; else if (age < 35) ages.a25_34 += 1; else ages.a35 += 1;
    }
    const ledger = db.prepare('SELECT reason, SUM(CASE WHEN delta>0 THEN delta ELSE 0 END) earned, SUM(CASE WHEN delta<0 THEN -delta ELSE 0 END) spent FROM wallet_ledger WHERE created_at>? GROUP BY reason ORDER BY (earned+spent) DESC LIMIT 12').all(since(7));
    return {
      totals: {
        accounts: count('SELECT COUNT(*) n FROM accounts'),
        active24h: count('SELECT COUNT(*) n FROM account_activity WHERE last_seen>?', since(1)),
        active7d: count('SELECT COUNT(*) n FROM account_activity WHERE last_seen>?', since(7)),
        online5m: count('SELECT COUNT(*) n FROM account_activity WHERE last_seen>?', now - 300000),
        clans: count('SELECT COUNT(*) n FROM clans'),
        premiumActive: count("SELECT COUNT(DISTINCT account) n FROM entitlements WHERE kind IN ('premium','premiumBoost') AND expires_at>?", now),
        marketingOptIn: count('SELECT COUNT(*) n FROM accounts WHERE marketing_optin=1'),
        verifiedEmails: count('SELECT COUNT(*) n FROM account_emails'),
        diamondsInCirculation: db.prepare('SELECT COALESCE(SUM(diamonds),0) n FROM wallets').get().n,
        unclaimedMail: count('SELECT COUNT(*) n FROM mail WHERE claimed_at IS NULL'),
      },
      signups: Object.entries(signups).map(([day, n]) => ({ day, n })),
      ads: Object.entries(ads).map(([day, v]) => ({ day, ...v })),
      ages,
      ledger,
    };
  };
  const health = (now = Date.now()) => {
    let dbSize = null; let disk = null; let backup = null;
    try { if (dbPath && existsSync(dbPath)) dbSize = statSync(dbPath).size; } catch { /* okunamadı */ }
    try { if (dbPath && existsSync(dbPath)) { const fsInfo = statfsSync(dirname(dbPath)); disk = { free: Number(fsInfo.bavail) * Number(fsInfo.bsize), total: Number(fsInfo.blocks) * Number(fsInfo.bsize) }; } } catch { /* statfs yok */ }
    try {
      const dir = join(dirname(dbPath), 'backups');
      if (existsSync(dir)) {
        const files = readdirSync(dir).map((name) => ({ name, ...statSync(join(dir, name)) })).sort((a, b) => b.mtimeMs - a.mtimeMs);
        if (files[0]) backup = { name: files[0].name, at: Math.round(files[0].mtimeMs), size: files[0].size, count: files.length };
      }
    } catch { /* yedek klasörü okunamadı */ }
    const mem = process.memoryUsage();
    return { uptimeSec: Math.round(process.uptime()), node: process.version, rss: mem.rss, dbSize, disk, backup, mailConfigured: !!mailer?.configured, now };
  };
  const watch = (now = Date.now()) => ({
    topDiamonds: db.prepare('SELECT a.name,w.diamonds FROM wallets w JOIN accounts a ON a.id=w.account ORDER BY w.diamonds DESC LIMIT 10').all(),
    bigCredits24h: db.prepare("SELECT a.name, SUM(l.delta) total FROM wallet_ledger l JOIN accounts a ON a.id=l.account WHERE l.created_at>? AND l.delta>0 AND l.reason NOT LIKE 'iap%' GROUP BY l.account ORDER BY total DESC LIMIT 10").all(now - DAY),
  });
  const purchases = () => db.prepare('SELECT p.transaction_id,a.name,p.platform,p.product_id,p.diamonds,p.environment,p.status,p.created_at,p.refunded_at FROM iap_purchases p JOIN accounts a ON a.id=p.account ORDER BY p.created_at DESC LIMIT 100').all();

  // ---------- Duyuru e-postası (yalnızca izin verenler, 18+)
  const marketingEligible = (now = Date.now()) => db.prepare('SELECT a.id,a.name,a.birth_date,e.email FROM accounts a JOIN account_emails e ON e.account=a.id WHERE a.marketing_optin=1 AND a.age_locked=0').all()
    .filter((r) => { const p = parseBirthDate(r.birth_date || '', now); return p && ageOf(p, now) >= 18; });
  const marketingFooter = '\n\n—\nBu e-postayı duyuru izni verdiğin için aldın. İstediğin zaman oyunda Ayarlar → Hesap bölümünden kapatabilirsin.\nYou received this email because you opted in to announcements. You can turn it off any time in Settings → Account in the game.';
  const marketingSendBatch = async (campaignId, limit = 80) => {
    if (!mailer?.configured) throw fail(503, 'MAIL_UNAVAILABLE');
    const campaign = db.prepare('SELECT * FROM marketing_campaigns WHERE id=?').get(campaignId);
    if (!campaign) throw fail(404, 'CAMPAIGN_NOT_FOUND');
    const sent = new Set(db.prepare('SELECT account FROM marketing_sends WHERE campaign=?').all(campaignId).map((r) => r.account));
    const pending = marketingEligible().filter((r) => !sent.has(r.id));
    let ok = 0; let failed = 0;
    for (const row of pending.slice(0, Math.max(1, Math.min(limit, 200)))) {
      try {
        await mailer.send({ to: row.email, subject: campaign.subject, text: campaign.body + marketingFooter });
        db.prepare('INSERT OR REPLACE INTO marketing_sends(campaign,account,status,at) VALUES(?,?,?,?)').run(campaignId, row.id, 'sent', Date.now());
        ok += 1;
      } catch {
        db.prepare('INSERT OR REPLACE INTO marketing_sends(campaign,account,status,at) VALUES(?,?,?,?)').run(campaignId, row.id, 'failed', Date.now());
        failed += 1;
      }
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
    return { campaign: campaignId, sent: ok, failed, remaining: Math.max(0, pending.length - ok - failed) };
  };

  // ---------- Hesap kurtarma
  const setEmail = (id, rawEmail, now = Date.now()) => {
    const email = String(rawEmail || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 120) throw fail(400, 'INVALID_EMAIL');
    if (!db.prepare('SELECT 1 FROM accounts WHERE id=?').get(id)) throw fail(404, 'ACCOUNT_NOT_FOUND');
    const owner = db.prepare('SELECT account FROM account_emails WHERE email=?').get(email);
    if (owner && owner.account !== id) throw fail(409, 'EMAIL_TAKEN');
    db.prepare('INSERT OR REPLACE INTO account_emails(account,email,verified_at) VALUES(?,?,?)').run(id, email, now);
    return { ok: true, email };
  };
  const clearEmail = (id) => { db.prepare('DELETE FROM account_emails WHERE account=?').run(id); return { ok: true }; };
  const tempPassword = async (id) => {
    if (!db.prepare('SELECT 1 FROM accounts WHERE id=?').get(id)) throw fail(404, 'ACCOUNT_NOT_FOUND');
    const alphabet = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = randomBytes(14);
    const password = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('') + 'a1';
    await setPassword(id, password);
    revokeSessions(id);
    return { password };
  };
  const setBirth = (id, value, now = Date.now()) => {
    const parsed = parseBirthDate(value, now);
    if (!parsed) throw fail(400, 'INVALID_BIRTHDATE');
    if (!db.prepare('SELECT 1 FROM accounts WHERE id=?').get(id)) throw fail(404, 'ACCOUNT_NOT_FOUND');
    const locked = ageOf(parsed, now) < MIN_AGE ? 1 : 0;
    db.prepare('UPDATE accounts SET birth_date=?, age_locked=? WHERE id=?').run(value, locked, id);
    return { ok: true, locked: !!locked };
  };
  const ageLocked = () => db.prepare('SELECT id,name,birth_date FROM accounts WHERE age_locked=1 ORDER BY id DESC LIMIT 200').all();

  return {
    staffRole, isMod, status, maintenanceOn, mailList, mailRead, sendMail, stats, health, watch, purchases,
    marketingEligible, marketingSendBatch, setEmail, clearEmail, tempPassword, setBirth, ageLocked, cfg, setCfg, delCfg,
    staffList: () => db.prepare('SELECT s.account id,a.name,s.role,s.granted_at FROM staff_roles s JOIN accounts a ON a.id=s.account ORDER BY s.granted_at').all(),
    setStaff: (id, role) => {
      if (!db.prepare('SELECT 1 FROM accounts WHERE id=?').get(id)) throw fail(404, 'ACCOUNT_NOT_FOUND');
      if (role) db.prepare('INSERT OR REPLACE INTO staff_roles(account,role,granted_at) VALUES(?,?,?)').run(id, role, Date.now());
      else db.prepare('DELETE FROM staff_roles WHERE account=?').run(id);
    },
    recentMail: () => db.prepare('SELECT m.id,a.name,m.title,m.items,m.created_at,m.claimed_at FROM mail m JOIN accounts a ON a.id=m.account ORDER BY m.id DESC LIMIT 100').all().map((r) => ({ ...r, items: json(r.items) || {} })),
    campaigns: () => db.prepare('SELECT c.id,c.subject,c.created_at,(SELECT COUNT(*) FROM marketing_sends s WHERE s.campaign=c.id AND s.status=\'sent\') sent FROM marketing_campaigns c ORDER BY c.id DESC LIMIT 20').all(),
    newCampaign: (subject, text) => Number(db.prepare('INSERT INTO marketing_campaigns(subject,body,created_at) VALUES(?,?,?)').run(subject, text, Date.now()).lastInsertRowid),
  };
}
