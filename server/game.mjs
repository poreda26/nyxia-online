import { randomInt } from 'node:crypto';

// Sunucu otoritesi (Faz 2): ekonomi eylemlerini sunucuda çalıştırır. Oyun kuralları,
// istemcinin kullandığı aynı saf fonksiyonlardır (server/game-logic.generated.mjs,
// bkz. scripts/build-game-logic.mjs). Hesap başına bir "sunucu ekonomisi" bayrağı vardır;
// bayrak açıkken altın, envanter, kuşanılanlar, sandıklar ve depo yalnızca bu eylemlerle
// değişir — istemci yedeğiyle yazdığı değerler yok sayılır.
const ECONOMY_FIELDS = ['gold', 'inventory', 'equipped', 'chests'];

// Sunucuda rastgelelik (yükseltme şansı, sandık, düşenler) kriptografik kaynaktan gelir;
// oyun kodu Math.random kullandığı için süreç genelinde değiştirilir.
const SERVER_RANDOM_RANGE = 2 ** 48 - 1; // randomInt üst sınırı
Math.random = () => randomInt(0, SERVER_RANDOM_RANGE) / (SERVER_RANDOM_RANGE + 1);

export function createGame(db, { fail, logic, keyOf, all = false, drops = () => null, hooks = {} }) {
  db.exec('CREATE TABLE IF NOT EXISTS economy_accounts(account INTEGER PRIMARY KEY REFERENCES accounts(id), enabled_at INTEGER NOT NULL)');
  const available = !!logic;

  const enabled = (account) => available && (all || !!db.prepare('SELECT 1 FROM economy_accounts WHERE account=?').get(account));
  const setEnabled = (account, on, now = Date.now()) => {
    if (on) db.prepare('INSERT OR IGNORE INTO economy_accounts(account,enabled_at) VALUES(?,?)').run(account, now);
    else db.prepare('DELETE FROM economy_accounts WHERE account=?').run(account);
  };

  const readBackup = (account) => {
    const row = db.prepare('SELECT revision,data FROM backups WHERE account=?').get(account);
    return row ? { revision: row.revision, data: JSON.parse(row.data) } : null;
  };

  // Tek bir eylem: yedeği oku, karakteri bul, kuralı çalıştır, yaz. Hepsi tek transaction'da.
  const act = (account, characterKey, type, payload, now = Date.now()) => {
    if (!available) throw fail(503, 'GAME_LOGIC_UNAVAILABLE');
    if (!enabled(account)) throw fail(409, 'ECONOMY_DISABLED');
    db.exec('BEGIN IMMEDIATE');
    try {
      const stored = readBackup(account);
      if (!stored || !Array.isArray(stored.data?.characters)) throw fail(404, 'NO_CHARACTER');
      const index = stored.data.characters.findIndex((c, i) => c && keyOf(c, i) === characterKey);
      if (index < 0) throw fail(404, 'NO_CHARACTER');
      const state = {
        player: stored.data.characters[index],
        bank: Array.isArray(stored.data.bank) ? stored.data.bank : [],
        bankGold: Number.isFinite(stored.data.bankGold) ? stored.data.bankGold : 0,
      };
      // Hak/ödül kaynağı sunucuda olan eylemler (Dünya Canavarı hakkı, günlük giriş, çark) kancadan geçer:
      // kanca aynı işlemde sunucudaki kaydı okur, istemcinin söylediği veriyi onunla DEĞİŞTİRİR ve
      // eylem başarılı olursa `after` ile kaydı tüketir.
      let after = null;
      if (Object.hasOwn(hooks, type)) {
        const prepared = hooks[type]({ account, characterKey, now, payload });
        if (prepared.fail) { db.exec('ROLLBACK'); return { revision: stored.revision, result: { ok: false, reason: prepared.fail } }; }
        payload = prepared.payload;
        after = prepared.after || null;
      }
      // Sahibin yayınladığı canlı drop kuralları, istemcidekiyle aynı biçimde uygulanır.
      const live = drops();
      if (live && logic.applyLiveDropConfig) logic.applyLiveDropConfig(live);
      const { state: next, result } = logic.applyAction(state, String(type), payload);
      if (!result.ok) { db.exec('ROLLBACK'); return { revision: stored.revision, result }; }

      // İstemciye yalnızca bu eylemle DEĞİŞEN oyuncu alanları döner (yama): istemcinin henüz
      // sunucuya geçmemiş canlı alanları (can, mana...) sunucudaki eski kopyayla ezilmesin.
      const before = stored.data.characters[index];
      const patch = {};
      for (const key of Object.keys(next.player)) if (JSON.stringify(before[key]) !== JSON.stringify(next.player[key])) patch[key] = next.player[key];
      after?.();
      const bankChanged = JSON.stringify(state.bank) !== JSON.stringify(next.bank);
      stored.data.characters[index] = next.player;
      stored.data.bank = next.bank;
      stored.data.bankGold = next.bankGold;
      const revision = stored.revision + 1;
      const json = JSON.stringify(stored.data);
      db.prepare('UPDATE backups SET revision=?,data=?,updated=? WHERE account=?').run(revision, json, now, account);
      // Geçmiş kaydı her eylemde değil, 25 revizyonda bir tutulur (eylem sıklığı yüksek).
      if (revision % 25 === 0) {
        db.prepare('INSERT INTO backup_history VALUES(?,?,?,?)').run(account, revision, json, now);
        db.prepare('DELETE FROM backup_history WHERE account=? AND revision<=?').run(account, revision - 20 * 25);
      }
      db.exec('COMMIT');
      return { revision, result, patch, ...(bankChanged ? { bank: next.bank } : {}), ...(next.bankGold !== state.bankGold ? { bankGold: next.bankGold } : {}) };
    } catch (error) { try { db.exec('ROLLBACK'); } catch { /* işlem zaten bitti */ } throw error; }
  };

  // İstemcinin yedekle yazdığı ekonomi alanlarını sunucudaki gerçeğe geri çevirir.
  // Yeni (sunucuda henüz kaydı olmayan) bir karakterin ekonomisi, kuralların
  // başlangıç karakterinden alınır; istemcinin söylediği altın/eşya dikkate alınmaz.
  const pin = (account, data) => {
    if (!enabled(account) || !data || typeof data !== 'object') return data;
    const stored = readBackup(account)?.data;
    const storedChars = new Map();
    (stored?.characters || []).forEach((c, i) => { if (c) storedChars.set(keyOf(c, i), c); });
    (Array.isArray(data.characters) ? data.characters : []).forEach((c, i) => {
      if (!c || typeof c !== 'object') return;
      const known = storedChars.get(keyOf(c, i)) || logic.newCharacterEconomy(c.class, c.race, c.nickname);
      for (const field of ECONOMY_FIELDS) if (known[field] !== undefined) c[field] = known[field]; else delete c[field];
    });
    data.bank = stored?.bank ?? data.bank?.map?.(() => []) ?? [];
    data.bankGold = stored?.bankGold ?? 0;
    return data;
  };

  return { available, enabled, setEnabled, act, pin };
}
