import { randomBytes, randomInt, verify } from 'node:crypto';

// "Reklam izle, elmas kazan" (ödüllü reklam). Elmas ASLA istemcinin "izledim" demesiyle verilmez:
//  - mod 'admob': reklam ağı (Google AdMob) ödülü sunucumuza imzalı bir geri çağrıyla (SSV) bildirir; imza Google'ın
//    herkese açık anahtarlarıyla doğrulanır, aynı işlem kimliği iki kez ödenmez.
//  - mod 'test': yalnızca izin verilen hesaplarda (ADS_TEST_ACCOUNTS) ve yalnızca bilet açıldıktan kısa süre sonra;
//    geliştirme/önizleme içindir, herkese açık ortamda KULLANILMAZ.
// Ödül miktarını (5/10/15) her durumda sunucu rastgele seçer; bekleme süresi hesap başınadır.
export const AD_REWARDS = [{ amount: 5, weight: 60 }, { amount: 10, weight: 30 }, { amount: 15, weight: 10 }];
export const AD_COOLDOWN_MS = 6 * 60 * 60 * 1000;
const TICKET_TTL_MS = 15 * 60 * 1000;
const TEST_MIN_WATCH_MS = 4000;
const KEYS_URL = 'https://www.gstatic.com/admob/reward/verifier-keys.json';

export function pickAdReward(roll = randomInt(0, AD_REWARDS.reduce((sum, r) => sum + r.weight, 0))) {
  let acc = 0;
  for (const r of AD_REWARDS) { acc += r.weight; if (roll < acc) return r.amount; }
  return AD_REWARDS[0].amount;
}

export function createAds(db, { fail, wallet, mode = 'off', testAccounts = [], fetchKeys = defaultFetchKeys }) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS ad_tickets(ticket TEXT PRIMARY KEY, account INTEGER NOT NULL REFERENCES accounts(id), created_at INTEGER NOT NULL, state TEXT NOT NULL, amount INTEGER, rewarded_at INTEGER);
    CREATE TABLE IF NOT EXISTS ad_transactions(transaction_id TEXT PRIMARY KEY, created_at INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS ad_tickets_account ON ad_tickets(account, rewarded_at);
  `);
  let keyCache = { at: 0, keys: new Map() };

  const modeFor = (accountName) => (mode === 'admob' ? 'admob' : testAccounts.includes(String(accountName).toLowerCase()) ? 'test' : 'off');
  const lastReward = (account) => db.prepare('SELECT MAX(rewarded_at) AS at FROM ad_tickets WHERE account=? AND rewarded_at IS NOT NULL').get(account)?.at || 0;

  const status = (account, accountName, now = Date.now()) => {
    const m = modeFor(accountName);
    const next = lastReward(account) + AD_COOLDOWN_MS;
    return { enabled: m !== 'off', mode: m, canWatch: m !== 'off' && now >= next, nextAt: now >= next ? now : next, rewards: AD_REWARDS.map((r) => r.amount) };
  };

  // Reklam başlamadan önce bilet alınır: reklam ağına userId=hesap, customData=bilet olarak iletilir.
  const start = (account, accountName, now = Date.now()) => {
    if (modeFor(accountName) === 'off') throw fail(403, 'ADS_DISABLED');
    if (now < lastReward(account) + AD_COOLDOWN_MS) throw fail(429, 'AD_COOLDOWN');
    db.prepare("DELETE FROM ad_tickets WHERE state='pending' AND created_at<?").run(now - TICKET_TTL_MS);
    const open = db.prepare("SELECT COUNT(*) AS n FROM ad_tickets WHERE account=? AND state='pending'").get(account).n;
    if (open >= 3) throw fail(429, 'TOO_MANY_OPEN_ADS');
    const ticket = randomBytes(16).toString('hex');
    db.prepare("INSERT INTO ad_tickets(ticket,account,created_at,state) VALUES(?,?,?,'pending')").run(ticket, account, now);
    return { ticket, userId: String(account), customData: ticket };
  };

  const grant = (ticket, account, now) => {
    if (now < lastReward(account) + AD_COOLDOWN_MS) return null;
    const amount = pickAdReward();
    return wallet.atomic(() => {
      const changed = db.prepare("UPDATE ad_tickets SET state='rewarded', amount=?, rewarded_at=? WHERE ticket=? AND account=? AND state='pending'").run(amount, now, ticket, account).changes;
      if (!changed) return null;
      wallet.creditInTransaction(account, amount, 'ad-reward', ticket, now);
      return amount;
    });
  };

  // İstemci "reklam bitti" der ve sonucu sorar. admob modunda ödül yalnızca SSV geldiyse vardır; test modunda
  // yeterli süre geçtiyse (hesap izinliyse) burada verilir.
  const claim = (account, accountName, ticket, now = Date.now()) => {
    const row = db.prepare('SELECT * FROM ad_tickets WHERE ticket=? AND account=?').get(String(ticket), account);
    if (!row) throw fail(404, 'AD_TICKET_NOT_FOUND');
    if (row.state === 'rewarded') return { rewarded: true, amount: row.amount };
    if (now - row.created_at > TICKET_TTL_MS) throw fail(410, 'AD_TICKET_EXPIRED');
    if (modeFor(accountName) === 'test' && now - row.created_at >= TEST_MIN_WATCH_MS) {
      const amount = grant(row.ticket, account, now);
      return amount ? { rewarded: true, amount } : { rewarded: false, pending: true };
    }
    return { rewarded: false, pending: true };
  };

  const getKey = async (keyId) => {
    const now = Date.now();
    if (!keyCache.keys.has(keyId) && now - keyCache.at > 60000) {
      keyCache = { at: now, keys: new Map((await fetchKeys()).map((k) => [String(k.keyId), k.pem])) };
    }
    return keyCache.keys.get(String(keyId)) || null;
  };

  // AdMob SSV geri çağrısı (kimliksiz GET): imza doğrulanır, bilet ödenir. Google'a her zaman 200 döner (yeniden deneme olmasın)
  // yalnızca imza/biçim hatasında 400.
  const ssv = async (rawQuery, now = Date.now()) => {
    const marker = rawQuery.indexOf('&signature=');
    if (marker < 0) throw fail(400, 'INVALID_SSV');
    const content = rawQuery.slice(0, marker);
    const params = new URLSearchParams(rawQuery);
    const signature = params.get('signature');
    const keyId = params.get('key_id');
    const pem = signature && keyId ? await getKey(keyId) : null;
    if (!pem || !verify('sha256', Buffer.from(content), pem, Buffer.from(signature, 'base64url'))) throw fail(400, 'INVALID_SSV');
    const transactionId = params.get('transaction_id');
    if (!transactionId) throw fail(400, 'INVALID_SSV');
    if (db.prepare('SELECT 1 FROM ad_transactions WHERE transaction_id=?').get(transactionId)) return { ok: true, duplicate: true };
    db.prepare('INSERT INTO ad_transactions(transaction_id,created_at) VALUES(?,?)').run(transactionId, now);
    const account = Number(params.get('user_id'));
    const ticket = params.get('custom_data');
    const row = Number.isSafeInteger(account) && ticket ? db.prepare("SELECT * FROM ad_tickets WHERE ticket=? AND account=? AND state='pending'").get(ticket, account) : null;
    if (!row || now - row.created_at > TICKET_TTL_MS) return { ok: true, ignored: true };
    grant(row.ticket, account, now);
    return { ok: true };
  };

  return { status, start, claim, ssv, modeFor };
}

async function defaultFetchKeys() {
  const response = await fetch(KEYS_URL);
  if (!response.ok) throw new Error('ADMOB_KEYS_UNAVAILABLE');
  return (await response.json()).keys || [];
}
