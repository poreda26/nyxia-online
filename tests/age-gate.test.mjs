import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApi } from '../server/app.mjs';
import { parseBirthDate, ageOf } from '../server/age.mjs';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'k1', alg: 'RS256', use: 'sig' };
const CLIENT = 'age-client.apps.googleusercontent.com';
const b64 = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const makeToken = (claims) => {
  const head = b64({ alg: 'RS256', kid: 'k1', typ: 'JWT' });
  const body = b64({ iss: 'https://accounts.google.com', aud: CLIENT, exp: Math.floor(Date.now() / 1000) + 600, sub: 'age-1', email: 'kid@example.com', email_verified: true, ...claims });
  return `${head}.${body}.${sign('RSA-SHA256', Buffer.from(`${head}.${body}`), privateKey).toString('base64url')}`;
};
const yearsAgo = (years, extraDays = 0) => {
  const d = new Date(Date.now() - extraDays * 86400000);
  d.setUTCFullYear(d.getUTCFullYear() - years);
  return d.toISOString().slice(0, 10);
};

test('birth dates are parsed strictly and ages are exact', () => {
  assert.equal(parseBirthDate('2020-02-30'), null);
  assert.equal(parseBirthDate('not a date'), null);
  assert.equal(parseBirthDate('2999-01-01'), null);
  assert.equal(parseBirthDate('1800-01-01'), null);
  const now = Date.UTC(2026, 9, 11);
  assert.equal(ageOf(parseBirthDate('2013-10-11', now), now), 13, 'turns 13 today');
  assert.equal(ageOf(parseBirthDate('2013-10-12', now), now), 12, 'turns 13 tomorrow');
});

test('accounts need a birth date; under the minimum age no account is created', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'nyxia-age-'));
  const dbFile = join(dir, 't.sqlite');
  const web = 'http://localhost:5177';
  const mails = [];
  const api = createApi({
    database: dbFile, origin: web, secure: false, ageGate: true,
    authOptions: { clientIds: { google: [CLIENT] }, fetchJwks: async () => [jwk], mailer: { configured: true, send: async (mail) => { mails.push(mail); } } },
  });
  await new Promise((resolve) => api.server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${api.server.address().port}`;
  const call = async (path, { method = 'GET', body, cookie } = {}) => {
    const r = await fetch(`${url}/api/${path}`, { method, headers: { Origin: web, 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: r.status, body: await r.json().catch(() => ({})), cookie: r.headers.get('set-cookie')?.split(';')[0] };
  };
  const accounts = () => { const db = new DatabaseSync(dbFile); const n = db.prepare('SELECT COUNT(*) n FROM accounts').get().n; db.close(); return n; };
  try {
    // Username registration
    assert.equal((await call('register', { method: 'POST', body: { name: 'nobirth', password: 'abcd1234' } })).status, 400, 'birth date is required');
    assert.equal((await call('register', { method: 'POST', body: { name: 'badbirth', password: 'abcd1234', birthDate: '2020-13-40' } })).status, 400);
    assert.equal((await call('register', { method: 'POST', body: { name: 'tiny', password: 'abcd1234', birthDate: yearsAgo(12) } })).status, 403, 'a 12-year-old is refused');
    assert.equal((await call('register', { method: 'POST', body: { name: 'almost', password: 'abcd1234', birthDate: yearsAgo(13, -1) } })).status, 403, 'turns 13 tomorrow');
    assert.equal(accounts(), 0, 'no account was created for refused sign-ups');
    const ok = await call('register', { method: 'POST', body: { name: 'teen13', password: 'abcd1234', birthDate: yearsAgo(13) } });
    assert.equal(ok.status, 200);
    assert.equal((await call('me', { cookie: ok.cookie })).body.needsBirthDate, false);

    // Email registration is refused before a code is even sent
    assert.equal((await call('register/email/start', { method: 'POST', body: { email: 'kid@example.com', birthDate: yearsAgo(10) } })).status, 403);
    assert.equal(mails.length, 0);
    assert.equal((await call('register/email/start', { method: 'POST', body: { email: 'kid@example.com' } })).status, 400);

    // Google: a new identity first needs a birth date, and nothing is created until it is valid
    const before = accounts();
    const token = makeToken({});
    assert.equal((await call('login/social', { method: 'POST', body: { provider: 'google', idToken: token } })).status, 428);
    assert.equal((await call('login/social', { method: 'POST', body: { provider: 'google', idToken: token, birthDate: yearsAgo(11) } })).status, 403);
    assert.equal(accounts(), before);
    assert.equal((await call('login/social', { method: 'POST', body: { provider: 'google', idToken: token, birthDate: yearsAgo(20) } })).status, 200);
    assert.equal(accounts(), before + 1);
    assert.equal((await call('login/social', { method: 'POST', body: { provider: 'google', idToken: token, force: true } })).status, 200, 'an existing identity needs no birth date');

    // Older accounts without a birth date are asked once; a too-young answer locks the account
    { const db = new DatabaseSync(dbFile); db.prepare("UPDATE accounts SET birth_date=NULL WHERE name='teen13'").run(); db.close(); }
    const legacy = await call('login', { method: 'POST', body: { name: 'teen13', password: 'abcd1234', force: true } });
    assert.equal(legacy.status, 200);
    assert.equal((await call('me', { cookie: legacy.cookie })).body.needsBirthDate, true);
    assert.equal((await call('account/birthdate', { method: 'POST', body: { birthDate: 'x' }, cookie: legacy.cookie })).status, 400);
    assert.equal((await call('account/birthdate', { method: 'POST', body: { birthDate: yearsAgo(9) }, cookie: legacy.cookie })).status, 403);
    assert.equal((await call('me', { cookie: legacy.cookie })).status, 401, 'the session of a locked account is closed');
    assert.equal((await call('login', { method: 'POST', body: { name: 'teen13', password: 'abcd1234', force: true } })).status, 403, 'a locked account cannot sign in');
  } finally { api.server.close(); }
});
