import { DIAMOND_PRICES, PREMIUM_DURATION_DAYS, WHEEL_PREMIUM_PRIZES, DEFAULT_UNLOCKED_SLOTS, CHARACTER_SLOTS } from '../src/data/diamondPrices.js';

// Satın alınan haklar (Faz 1b, sunucu otoritesi): premium, çark premium'u, açılan
// boyalar / avatarlar / çerçeveler ve 3. karakter slotu. Haklar yalnızca sunucuda
// bir satın alma, çark ödülü ya da GM/sahip işlemiyle doğar; yedekteki ilgili alanlar
// okunurken ve yazılırken buna sabitlenir (bkz. pin).
const DAY_MS = 24 * 60 * 60 * 1000;
const COSMETIC_ID = /^[\w-]{1,40}$/;
const MAX_COSMETICS = 80;

export function createEntitlements(db, { fail }) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS entitlements(account INTEGER NOT NULL REFERENCES accounts(id), character_key TEXT NOT NULL, kind TEXT NOT NULL, key TEXT NOT NULL, expires_at INTEGER, granted_at INTEGER NOT NULL, source TEXT NOT NULL, PRIMARY KEY(account, character_key, kind, key));
    CREATE TABLE IF NOT EXISTS entitlement_seed(account INTEGER PRIMARY KEY REFERENCES accounts(id));
  `);

  const insert = (account, characterKey, kind, key, expiresAt, source, now) =>
    db.prepare('INSERT OR REPLACE INTO entitlements(account,character_key,kind,key,expires_at,granted_at,source) VALUES(?,?,?,?,?,?,?)').run(account, characterKey, kind, key, expiresAt, now, source);

  // İlk erişimde mevcut yedekteki haklar bir kez devralınır (süreler makul üst sınıra kırpılır).
  const ensure = (account, keyOf, now = Date.now()) => {
    if (db.prepare('SELECT 1 FROM entitlement_seed WHERE account=?').get(account)) return;
    db.prepare('INSERT OR IGNORE INTO entitlement_seed(account) VALUES(?)').run(account);
    const backup = db.prepare('SELECT data FROM backups WHERE account=?').get(account);
    if (!backup) return;
    let data;
    try { data = JSON.parse(backup.data); } catch { return; }
    if (Number(data?.unlockedSlots) >= CHARACTER_SLOTS) insert(account, '', 'slot', 'third', null, 'migration', now);
    (Array.isArray(data?.characters) ? data.characters : []).forEach((c, index) => {
      if (!c || typeof c !== 'object') return;
      const ck = keyOf(c, index);
      if (!ck) return;
      for (const [field, kind, maxDays] of [['premium', 'premium', PREMIUM_DURATION_DAYS], ['premiumBoost', 'premiumBoost', Math.max(...Object.values(WHEEL_PREMIUM_PRIZES).map((p) => p.days))]]) {
        const value = c[field];
        if (value?.tier && DIAMOND_PRICES.premium[value.tier] && Number(value.expiresAt) > now) {
          insert(account, ck, kind, value.tier, Math.min(Number(value.expiresAt), now + maxDays * DAY_MS), 'migration', now);
        }
      }
      for (const id of Array.isArray(c.ownedDyes) ? c.ownedDyes : []) if (DIAMOND_PRICES.dye[id]) insert(account, ck, 'dye', id, null, 'migration', now);
      for (const [field, kind] of [['ownedAvatars', 'avatar'], ['ownedAvatarFrames', 'frame']]) {
        for (const id of (Array.isArray(c[field]) ? c[field] : []).slice(0, MAX_COSMETICS)) if (typeof id === 'string' && COSMETIC_ID.test(id)) insert(account, ck, kind, id, null, 'migration', now);
      }
    });
  };

  const activeRow = (account, ck, kind, now) => {
    const row = db.prepare('SELECT key,expires_at FROM entitlements WHERE account=? AND character_key=? AND kind=? AND expires_at>? ORDER BY expires_at DESC LIMIT 1').get(account, ck, kind, now);
    return row ? { tier: row.key, expiresAt: row.expires_at } : null;
  };
  const owned = (account, ck, kind) => db.prepare('SELECT key FROM entitlements WHERE account=? AND character_key=? AND kind=? ORDER BY key').all(account, ck, kind).map((r) => r.key);
  const hasSlot = (account) => !!db.prepare("SELECT 1 FROM entitlements WHERE account=? AND kind='slot'").get(account);

  const snapshot = (account, ck, keyOf, now = Date.now()) => {
    ensure(account, keyOf, now);
    return {
      premium: activeRow(account, ck, 'premium', now) || { tier: null, expiresAt: null },
      premiumBoost: activeRow(account, ck, 'premiumBoost', now),
      ownedDyes: owned(account, ck, 'dye'),
      ownedAvatars: owned(account, ck, 'avatar'),
      ownedAvatarFrames: owned(account, ck, 'frame'),
      unlockedSlots: hasSlot(account) ? CHARACTER_SLOTS : DEFAULT_UNLOCKED_SLOTS,
    };
  };

  // ---- Satın alma doğrulamaları (tahsilattan ÖNCE çalışır) ve hak verme (aynı transaction'da)
  const checkPremium = (account, ck, tier, keyOf, now) => {
    if (!DIAMOND_PRICES.premium[tier]) throw fail(400, 'INVALID_PURCHASE');
    ensure(account, keyOf, now);
    const active = activeRow(account, ck, 'premium', now);
    if (active && (active.tier === tier || active.tier === 'mythic')) throw fail(409, 'ALREADY_PREMIUM');
  };
  const grantPremium = (account, ck, tier, source, now) => {
    db.prepare("DELETE FROM entitlements WHERE account=? AND character_key=? AND kind='premium'").run(account, ck);
    insert(account, ck, 'premium', tier, now + PREMIUM_DURATION_DAYS * DAY_MS, source, now);
  };

  // Çark ödülü: aynı katman aktifse süre uzar, değilse şimdiden başlar.
  const grantBoost = (account, ck, prizeId, keyOf, now = Date.now()) => {
    const prize = WHEEL_PREMIUM_PRIZES[prizeId];
    if (!prize) return null;
    ensure(account, keyOf, now);
    const current = activeRow(account, ck, 'premiumBoost', now);
    const base = current?.tier === prize.tier ? current.expiresAt : now;
    db.prepare("DELETE FROM entitlements WHERE account=? AND character_key=? AND kind='premiumBoost'").run(account, ck);
    insert(account, ck, 'premiumBoost', prize.tier, base + prize.days * DAY_MS, 'wheel', now);
    return activeRow(account, ck, 'premiumBoost', now);
  };

  const checkNotOwned = (account, ck, kind, key, keyOf, now) => {
    ensure(account, keyOf, now);
    if (db.prepare('SELECT 1 FROM entitlements WHERE account=? AND character_key=? AND kind=? AND key=?').get(account, ck, kind, key)) throw fail(409, 'ALREADY_OWNED');
  };
  const grantOwned = (account, ck, kind, key, source, now) => insert(account, ck, kind, key, null, source, now);

  const checkSlot = (account, keyOf, now) => { ensure(account, keyOf, now); if (hasSlot(account)) throw fail(409, 'ALREADY_OWNED'); };
  const grantSlot = (account, source, now) => insert(account, '', 'slot', 'third', null, source, now);

  // Yedekteki hak alanlarını sunucudaki gerçeğe sabitler.
  const pin = (account, data, keyOf, now = Date.now()) => {
    if (!data || typeof data !== 'object') return data;
    ensure(account, keyOf, now);
    data.unlockedSlots = hasSlot(account) ? CHARACTER_SLOTS : DEFAULT_UNLOCKED_SLOTS;
    if (!Array.isArray(data.characters)) return data;
    data.characters.forEach((c, index) => {
      if (!c || typeof c !== 'object') return;
      const ck = keyOf(c, index);
      if (!ck) return;
      const snap = snapshot(account, ck, keyOf, now);
      c.premium = snap.premium;
      if (snap.premiumBoost) c.premiumBoost = snap.premiumBoost; else delete c.premiumBoost;
      c.ownedDyes = snap.ownedDyes;
      c.ownedAvatars = snap.ownedAvatars;
      c.ownedAvatarFrames = snap.ownedAvatarFrames;
      if (c.armorDye && !snap.ownedDyes.includes(c.armorDye)) c.armorDye = null;
      if (c.avatarFrameId && !snap.ownedAvatarFrames.includes(c.avatarFrameId)) c.avatarFrameId = null;
    });
    return data;
  };

  return { snapshot, ensure, pin, checkPremium, grantPremium, grantBoost, checkNotOwned, grantOwned, checkSlot, grantSlot };
}
