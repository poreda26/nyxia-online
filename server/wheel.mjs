import { randomInt } from 'node:crypto';

// Günlük Çark. Ödül ağırlıkları (toplam 10000 = %100) YALNIZCA burada durur:
// istemci paketine hiç girmez, oyuncular oranları göremez. Ödülü sunucu seçer
// ve günde bir kez hak verir (İstanbul günü); istemci sadece sonucu uygular.
// Ağırlıklar: Mythic 1 gün %1, Apex 3 gün %1, rastgele kanat %0,5, kalan %97,5
// parşömenlere dağılır.
const WEIGHTS = [
  ['mythic_1d', 100],
  ['apex_3d', 100],
  ['wing', 50],
  ['scroll_upgrade', 2200],
  ['boost_exp', 1100],
  ['boost_gold', 1100],
  ['boost_atk', 1000],
  ['boost_np', 1000],
  ['boost_def', 1000],
  ['boost_hp', 1000],
  ['scroll_accessory', 950],
  ['scroll_bonus', 400],
];
const TOTAL = WEIGHTS.reduce((sum, [, weight]) => sum + weight, 0);
export const WHEEL_PRIZE_IDS = WEIGHTS.map(([id]) => id);

// roll: [0, TOTAL) aralığında tamsayı.
export function pickWheelPrize(roll) {
  let acc = 0;
  for (const [id, weight] of WEIGHTS) { acc += weight; if (roll < acc) return id; }
  return WEIGHTS[WEIGHTS.length - 1][0];
}

const ISTANBUL_UTC_OFFSET_MS = 3 * 60 * 60 * 1000;
const dayKeyAt = (now) => new Date(now + ISTANBUL_UTC_OFFSET_MS).toISOString().slice(0, 10);
const nextMidnightAt = (now) => {
  const ist = new Date(now + ISTANBUL_UTC_OFFSET_MS);
  return Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate() + 1) - ISTANBUL_UTC_OFFSET_MS;
};

export function createWheel(db, { fail }) {
  db.exec(`CREATE TABLE IF NOT EXISTS wheel_spins(account_id INTEGER PRIMARY KEY REFERENCES accounts(id), day_key TEXT NOT NULL, prize TEXT NOT NULL, spun_at INTEGER NOT NULL, claimed INTEGER NOT NULL DEFAULT 0)`);
  const rowOf = (accountId) => db.prepare('SELECT * FROM wheel_spins WHERE account_id=?').get(accountId);

  // Alınmamış ödül varsa (uygulama çökmesi, dolu çanta...) yeni çevirme
  // açılmaz; önce o ödül teslim alınır, böylece hiçbir ödül kaybolmaz.
  const status = (accountId, now = Date.now()) => {
    const row = rowOf(accountId);
    const pending = row && !row.claimed ? row.prize : null;
    const spunToday = !!row && row.day_key === dayKeyAt(now);
    return { canSpin: !spunToday && !pending, pending, spunAt: pending ? row.spun_at : null, nextSpinAt: spunToday ? nextMidnightAt(now) : now };
  };

  const spin = (accountId, now = Date.now(), roll = randomInt(0, TOTAL)) => {
    db.exec('BEGIN IMMEDIATE');
    try {
      const state = status(accountId, now);
      if (state.pending) throw fail(409, 'WHEEL_PRIZE_PENDING');
      if (!state.canSpin) throw fail(409, 'WHEEL_ALREADY_SPUN');
      const prize = pickWheelPrize(roll);
      db.prepare('INSERT INTO wheel_spins(account_id,day_key,prize,spun_at,claimed) VALUES(?,?,?,?,0) ON CONFLICT(account_id) DO UPDATE SET day_key=excluded.day_key, prize=excluded.prize, spun_at=excluded.spun_at, claimed=0')
        .run(accountId, dayKeyAt(now), prize, now);
      db.exec('COMMIT');
      return { prize, spunAt: now, nextSpinAt: nextMidnightAt(now) };
    } catch (error) { db.exec('ROLLBACK'); throw error; }
  };

  // Bekleyen ödülü (varsa) olduğu gibi döner; act işleminin kancası kullanır.
  const pendingPrize = (accountId) => {
    const row = rowOf(accountId);
    return row && !row.claimed ? { prize: row.prize, spunAt: row.spun_at } : null;
  };

  const claim = (accountId) => {
    const result = db.prepare('UPDATE wheel_spins SET claimed=1 WHERE account_id=? AND claimed=0').run(accountId);
    if (!result.changes) throw fail(404, 'NO_PENDING_PRIZE');
    return { ok: true };
  };

  return { status, spin, claim, pendingPrize };
}
