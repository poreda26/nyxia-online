import { mkdirSync } from 'node:fs';
import { createApi } from './app.mjs';
mkdirSync('server/data', { recursive: true });
const production = process.env.NODE_ENV === 'production';
if (production && !process.env.APP_ORIGIN?.startsWith('https://')) throw new Error('Production requires an HTTPS APP_ORIGIN');
const api = createApi({ database: process.env.DATABASE_PATH || 'server/data/nyxia.sqlite', origin: process.env.APP_ORIGIN || 'http://localhost:5177', secure: production });
api.server.listen(Number(process.env.PORT || 8787), '127.0.0.1', () => console.log('Nyxia account API listening on loopback'));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, async () => { await api.close(); process.exit(0); });
