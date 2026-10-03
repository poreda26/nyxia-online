import { timingSafeEqual } from 'node:crypto';
import { DIAMOND_PACK_AMOUNTS } from '../src/data/diamondPrices.js';

// Gerçek parayla elmas satışı (Faz 1c). Elmas YALNIZCA mağaza makbuzu doğrulanmış bir
// satın alımdan sonra, sunucuda ve işlem kimliği başına BİR KEZ yazılır. İstemcinin
// "satın aldım" demesi hiçbir şey yapmaz.
//
// Makbuz doğrulamasını RevenueCat yapar (Apple/Google makbuzlarını kendisi doğrular) ve
// sonucu imzalı bir webhook ile bu uca bildirir. Webhook gizli anahtarı
// REVENUECAT_WEBHOOK_SECRET ortam değişkeninden gelir; yoksa uç kapalıdır (503).
// RevenueCat'te "App User ID" = bu oyundaki hesap kimliği (accounts.id) olmalıdır.
const CREDIT_EVENTS = new Set(['INITIAL_PURCHASE', 'NON_RENEWING_PURCHASE']);
const REFUND_EVENTS = new Set(['CANCELLATION', 'REFUND']);

const safeEqual = (a, b) => {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
};

export function createIap(db, { fail, wallet, secret = null, allowSandbox = false }) {
  db.exec(`CREATE TABLE IF NOT EXISTS iap_purchases(
    transaction_id TEXT PRIMARY KEY, account INTEGER NOT NULL REFERENCES accounts(id), platform TEXT NOT NULL, product_id TEXT NOT NULL,
    diamonds INTEGER NOT NULL, environment TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'credited', created_at INTEGER NOT NULL, refunded_at INTEGER)`);

  const configured = () => !!secret;

  // RevenueCat webhook'u. headers: istek başlıkları, body: JSON gövdesi.
  const handleRevenueCat = (headers, body, now = Date.now()) => {
    if (!configured()) throw fail(503, 'IAP_NOT_CONFIGURED');
    const given = /^Bearer (.+)$/.exec(headers.authorization || '')?.[1];
    if (!given || !safeEqual(given, secret)) throw fail(401, 'INVALID_WEBHOOK');
    const event = body?.event;
    if (!event || typeof event !== 'object') throw fail(400, 'INVALID_EVENT');
    const type = String(event.type || '');
    if (!CREDIT_EVENTS.has(type) && !REFUND_EVENTS.has(type)) return { ignored: true, type };

    const environment = String(event.environment || 'PRODUCTION').toUpperCase();
    if (environment !== 'PRODUCTION' && !allowSandbox) return { ignored: true, reason: 'sandbox' };
    const productId = String(event.product_id || '').split(':')[0];
    const diamonds = DIAMOND_PACK_AMOUNTS[productId];
    const transactionId = String(event.transaction_id || event.original_transaction_id || '').slice(0, 120);
    const accountId = Number(event.app_user_id);
    if (!diamonds || !transactionId || !Number.isSafeInteger(accountId)) throw fail(400, 'INVALID_EVENT');
    if (!db.prepare('SELECT 1 FROM accounts WHERE id=?').get(accountId)) throw fail(404, 'ACCOUNT_NOT_FOUND');

    return wallet.atomic(() => {
      const existing = db.prepare('SELECT * FROM iap_purchases WHERE transaction_id=?').get(transactionId);
      if (CREDIT_EVENTS.has(type)) {
        if (existing) {
          if (existing.account !== accountId) throw fail(409, 'TRANSACTION_ACCOUNT_MISMATCH');
          return { duplicate: true, diamonds: wallet.balance(accountId) };
        }
        db.prepare('INSERT INTO iap_purchases(transaction_id,account,platform,product_id,diamonds,environment,created_at) VALUES(?,?,?,?,?,?,?)')
          .run(transactionId, accountId, String(event.store || 'unknown').slice(0, 20), productId, diamonds, environment, now);
        return { credited: diamonds, diamonds: wallet.creditInTransaction(accountId, diamonds, 'iap', transactionId, now) };
      }
      // İade: elmasın harcanmış kısmı geri alınamaz; bakiye kadarı düşülür (negatif olmaz).
      if (!existing || existing.status === 'refunded') return { ignored: true, reason: existing ? 'already-refunded' : 'unknown-transaction' };
      const clawed = Math.min(existing.diamonds, wallet.balance(accountId));
      db.prepare("UPDATE iap_purchases SET status='refunded', refunded_at=? WHERE transaction_id=?").run(now, transactionId);
      const balance = clawed > 0 ? wallet.debitInTransaction(accountId, clawed, 'iap-refund', transactionId, now) : wallet.balance(accountId);
      return { refunded: existing.diamonds, clawedBack: clawed, diamonds: balance };
    });
  };

  return { configured, handleRevenueCat };
}
