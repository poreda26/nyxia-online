import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { createApi } from './app.mjs';
const production = process.env.NODE_ENV === 'production';
if (production && !process.env.APP_ORIGIN?.startsWith('https://')) throw new Error('Production requires an HTTPS APP_ORIGIN');
const database = process.env.DATABASE_PATH || 'server/data/nyxia.sqlite';
mkdirSync(dirname(database), { recursive: true });
const api = createApi({
  database,
  origin: process.env.APP_ORIGIN || 'http://localhost:5173',
  secure: production,
  staticDir: process.env.STATIC_DIR || null,
  trustedProxy: process.env.TRUSTED_PROXY || null,
  iapWebhookSecret: process.env.REVENUECAT_WEBHOOK_SECRET || null,
  iapAllowSandbox: process.env.IAP_ALLOW_SANDBOX === '1',
  economyForAll: process.env.ECONOMY_FOR_ALL === '1',
  adsMode: process.env.ADS_MODE === 'admob' ? 'admob' : 'off',
  adsTestAccounts: (process.env.ADS_TEST_ACCOUNTS || '').split(',').map((n) => n.trim().toLowerCase()).filter(Boolean),
});
// Varsayılan bağlanma adresi bilerek loopback (127.0.0.1) — dışarıya açmak
// (0.0.0.0) sadece bir ters proxy'nin arkasında, HOST ortam değişkeni
// açıkça verildiğinde devreye girer (bkz. VM dağıtımı: HOST=0.0.0.0).
const host = process.env.HOST || '127.0.0.1';
api.server.listen(Number(process.env.PORT || 8787), host, () => console.log(`Nyxia account API listening on ${host}:${process.env.PORT || 8787}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, async () => { await api.close(); process.exit(0); });
