import { diamondPrice, DAILY_LOGIN_DIAMONDS, WEEKLY_RANK_REWARDS } from '../src/data/diamondPrices.js';

// Elmas kasası (sunucu otoritesi, Faz 1). Bakiye ve her hareket sunucuda; istemci
// yalnızca bir yansımasını gösterir. Harcama fiyatını sunucu kendisi belirler
// (src/data/diamondPrices.js). Bakiye asla negatife düşemez (CHECK + işlem).
const ISTANBUL_OFFSET_MS = 3 * 60 * 60 * 1000;
const dayKey = (now) => new Date(now + ISTANBUL_OFFSET_MS).toISOString().slice(0, 10);
const previousDayKey = (now) => dayKey(now - 24 * 60 * 60 * 1000);
const MAX_SEED_BALANCE = 100_000_000;

export function createWallet(db, { fail }) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS wallets(account INTEGER PRIMARY KEY REFERENCES accounts(id), diamonds INTEGER NOT NULL DEFAULT 0 CHECK(diamonds>=0), updated_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS wallet_ledger(id INTEGER PRIMARY KEY AUTOINCREMENT, account INTEGER NOT NULL REFERENCES accounts(id), delta INTEGER NOT NULL, balance_after INTEGER NOT NULL, reason TEXT NOT NULL, ref TEXT, created_at INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS wallet_ledger_account ON wallet_ledger(account, id);
    CREATE TABLE IF NOT EXISTS daily_login_claims(account INTEGER NOT NULL REFERENCES accounts(id), character_key TEXT NOT NULL, last_day TEXT NOT NULL, streak INTEGER NOT NULL, PRIMARY KEY(account, character_key));
    CREATE TABLE IF NOT EXISTS weekly_rank_claims(account INTEGER NOT NULL REFERENCES accounts(id), character_key TEXT NOT NULL, week_id TEXT NOT NULL, rank INTEGER NOT NULL, diamonds INTEGER NOT NULL, PRIMARY KEY(account, character_key, week_id));
  `);

  const row = (id) => db.prepare('SELECT diamonds FROM wallets WHERE account=?').get(id);

  // İlk kullanımda mevcut yedekteki bakiye devralınır (bir kerelik geçiş); sonrasında
  // istemcinin yedekle gönderdiği elmas sayısı hiçbir zaman dikkate alınmaz.
  const ensure = (id, now = Date.now()) => {
    const existing = row(id);
    if (existing) return existing.diamonds;
    let seed = 0;
    const backup = db.prepare('SELECT data FROM backups WHERE account=?').get(id);
    if (backup) {
      try {
        const value = Number(JSON.parse(backup.data)?.diamonds);
        if (Number.isFinite(value) && value > 0) seed = Math.min(MAX_SEED_BALANCE, Math.floor(value));
      } catch { /* bozuk yedek: 0 ile başla */ }
    }
    db.prepare('INSERT OR IGNORE INTO wallets(account,diamonds,updated_at) VALUES(?,?,?)').run(id, seed, now);
    if (seed > 0) db.prepare('INSERT INTO wallet_ledger(account,delta,balance_after,reason,ref,created_at) VALUES(?,?,?,?,?,?)').run(id, seed, seed, 'migration', 'backup', now);
    return row(id).diamonds;
  };

  const move = (id, delta, reason, ref, now = Date.now()) => {
    const balance = ensure(id, now);
    const next = balance + delta;
    if (next < 0) throw fail(409, 'NOT_ENOUGH_DIAMONDS');
    db.prepare('UPDATE wallets SET diamonds=?, updated_at=? WHERE account=?').run(next, now, id);
    db.prepare('INSERT INTO wallet_ledger(account,delta,balance_after,reason,ref,created_at) VALUES(?,?,?,?,?,?)').run(id, delta, next, reason, ref ?? null, now);
    return next;
  };

  const atomic = (fn) => {
    db.exec('BEGIN IMMEDIATE');
    try { const result = fn(); db.exec('COMMIT'); return result; } catch (error) { db.exec('ROLLBACK'); throw error; }
  };

  const balance = (id) => ensure(id);

  // hooks.check: tahsilattan önce (geçersizse fırlatır, ücret alınmaz);
  // hooks.grant: aynı transaction'da hakkı verir ve yanıta eklenecek hak özetini döner.
  const spend = (id, kind, key, ref, now = Date.now(), hooks = {}) => {
    const price = diamondPrice(kind, key);
    if (price === null) throw fail(400, 'INVALID_PURCHASE');
    return atomic(() => {
      hooks.check?.();
      const result = { diamonds: move(id, -price, `spend:${kind}`, key == null ? ref : `${key}${ref ? ':' + ref : ''}`, now), price };
      const entitlement = hooks.grant?.();
      return entitlement ? { ...result, entitlement } : result;
    });
  };

  // Başka bir sunucu işleminin (ör. klan kurma) kendi transaction'ı içinde çağrılır.
  const spendInTransaction = (id, kind, key, ref, now = Date.now()) => {
    const price = diamondPrice(kind, key);
    if (price === null) throw fail(400, 'INVALID_PURCHASE');
    return { diamonds: move(id, -price, `spend:${kind}`, key == null ? ref : key, now), price };
  };
  const debitInTransaction = (id, amount, reason, ref, now = Date.now()) => {
    if (!Number.isSafeInteger(amount) || amount <= 0) throw fail(400, 'INVALID_AMOUNT');
    return move(id, -amount, reason, ref, now);
  };

  // Destek aracı (sahip paneli): bakiyeyi belirli bir değere ayarlar, fark deftere yazılır.
  const setBalanceInTransaction = (id, target, reason, ref, now = Date.now()) => {
    if (!Number.isSafeInteger(target) || target < 0) throw fail(400, 'INVALID_CURRENCY');
    const delta = target - ensure(id, now);
    return delta === 0 ? target : move(id, delta, reason, ref, now);
  };

  const creditInTransaction = (id, amount, reason, ref, now = Date.now()) => {
    if (!Number.isSafeInteger(amount) || amount <= 0) throw fail(400, 'INVALID_AMOUNT');
    return move(id, amount, reason, ref, now);
  };

  const credit = (id, amount, reason, ref, now = Date.now()) => {
    if (!Number.isSafeInteger(amount) || amount <= 0) throw fail(400, 'INVALID_AMOUNT');
    return atomic(() => move(id, amount, reason, ref, now));
  };

  // Günlük giriş: hak (gün başına bir kez, karakter başına) ve elmas kısmı sunucuda.
  const dailyLoginInTransaction = (id, characterKey, now = Date.now()) => {
    const today = dayKey(now);
    const claim = db.prepare('SELECT last_day,streak FROM daily_login_claims WHERE account=? AND character_key=?').get(id, characterKey);
    if (claim?.last_day === today) throw fail(409, 'DAILY_ALREADY_CLAIMED');
    const streak = claim && claim.last_day === previousDayKey(now) ? claim.streak + 1 : 1;
    const cycleIndex = (streak - 1) % DAILY_LOGIN_DIAMONDS.length;
    const diamonds = DAILY_LOGIN_DIAMONDS[cycleIndex];
    db.prepare('INSERT INTO daily_login_claims(account,character_key,last_day,streak) VALUES(?,?,?,?) ON CONFLICT(account,character_key) DO UPDATE SET last_day=excluded.last_day, streak=excluded.streak').run(id, characterKey, today, streak);
    const total = diamonds > 0 ? move(id, diamonds, 'daily-login', `${characterKey}:${today}`, now) : ensure(id, now);
    return { streak, cycleIndex, diamondsAwarded: diamonds, diamonds: total };
  };
  const dailyLogin = (id, characterKey, now = Date.now()) => atomic(() => dailyLoginInTransaction(id, characterKey, now));

  // Haftalık sıralama ödülü: sıra istemcide hesaplanıyor (Savaş Alanı puanı henüz
  // sunucuda değil, Faz 3), bu yüzden en azından hafta başına TEK talep ve üst sınır
  // sunucuda zorlanır; ödül miktarını sunucu belirler.
  const weeklyRank = (id, characterKey, weekId, rank) => atomic(() => {
    if (typeof weekId !== 'string' || !/^[\w-]{3,20}$/.test(weekId)) throw fail(400, 'INVALID_WEEK');
    if (!Number.isInteger(rank) || rank < 1 || rank > WEEKLY_RANK_REWARDS.length) return { diamondsAwarded: 0, diamonds: ensure(id) };
    const done = db.prepare('SELECT 1 FROM weekly_rank_claims WHERE account=? AND character_key=? AND week_id=?').get(id, characterKey, weekId);
    if (done) return { diamondsAwarded: 0, diamonds: ensure(id), alreadyClaimed: true };
    const amount = WEEKLY_RANK_REWARDS[rank - 1];
    db.prepare('INSERT INTO weekly_rank_claims(account,character_key,week_id,rank,diamonds) VALUES(?,?,?,?,?)').run(id, characterKey, weekId, rank, amount);
    return { diamondsAwarded: amount, diamonds: move(id, amount, 'weekly-rank', `${characterKey}:${weekId}:${rank}`) };
  });

  // Yedek verisindeki elmas alanlarını sunucudaki bakiyeye sabitler: istemci yedeğe
  // ne yazarsa yazsın bakiye değişmez.
  const clampBackup = (id, data) => {
    if (!data || typeof data !== 'object') return data;
    const diamonds = ensure(id);
    data.diamonds = diamonds;
    if (Array.isArray(data.characters)) for (const character of data.characters) if (character && typeof character === 'object' && 'diamonds' in character) character.diamonds = diamonds;
    return data;
  };

  return { balance, spend, spendInTransaction, debitInTransaction, creditInTransaction, setBalanceInTransaction, credit, dailyLogin, dailyLoginInTransaction, weeklyRank, clampBackup, atomic };
}
