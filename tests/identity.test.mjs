import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { createApi } from '../server/app.mjs';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'k1', alg: 'RS256', use: 'sig' };
const CLIENT = 'test-client.apps.googleusercontent.com';
const b64 = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const makeToken = (claims, { key = privateKey, kid = 'k1', alg = 'RS256' } = {}) => {
  const head = b64({ alg, kid, typ: 'JWT' });
  const body = b64({ iss: 'https://accounts.google.com', aud: CLIENT, exp: Math.floor(Date.now() / 1000) + 600, sub: 'g-1', email: 'player@example.com', email_verified: true, ...claims });
  return `${head}.${body}.${sign('RSA-SHA256', Buffer.from(`${head}.${body}`), key).toString('base64url')}`;
};
const codeOf = (mail) => /kodun: (\d{6})/.exec(mail.text)[1];

test('Google sign-in, email codes and password reset are verified by the server', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'nyxia-identity-'));
  const web = 'http://localhost:5177';
  const mails = [];
  const api = createApi({
    database: join(dir, 'test.sqlite'), origin: web, secure: false,
    authOptions: { clientIds: { google: [CLIENT] }, fetchJwks: async () => [jwk], mailer: { configured: true, send: async (mail) => { mails.push(mail); } } },
  });
  await new Promise((resolve) => api.server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${api.server.address().port}`;
  const call = async (path, { method = 'GET', body, cookie } = {}) => {
    const r = await fetch(`${url}/api/${path}`, { method, headers: { Origin: web, 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: r.status, body: await r.json().catch(() => ({})), cookie: r.headers.get('set-cookie')?.split(';')[0] };
  };
  try {
    assert.deepEqual((await call('auth/providers')).body, { google: { clientId: CLIENT }, apple: null, email: true });

    // Forged, expired, wrong-audience or wrong-key tokens are refused.
    const other = generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey;
    // (login attempts share a per-IP limiter, so the list stays short; format checks are covered by the unit-level branches.)
    for (const bad of [makeToken({}, { key: other }), makeToken({ aud: 'someone-else' }), makeToken({ exp: 1 }), makeToken({ iss: 'https://evil.example' })]) {
      assert.equal((await call('login/social', { method: 'POST', body: { provider: 'google', idToken: bad } })).status, 401);
    }
    assert.equal((await call('login/social', { method: 'POST', body: { provider: 'apple', idToken: makeToken({}) } })).status, 400, 'apple is not configured');

    // First Google login creates an account, the second one returns to the same account.
    const first = await call('login/social', { method: 'POST', body: { provider: 'google', idToken: makeToken({}) } });
    assert.equal(first.status, 200);
    assert.match(first.body.name, /^oyuncu_[a-z0-9]+$/);
    const security = await call('account/security', { cookie: first.cookie });
    assert.deepEqual([security.body.email, security.body.identities], ['player@example.com', ['google']]);
    const busy = await call('login/social', { method: 'POST', body: { provider: 'google', idToken: makeToken({}) } });
    assert.equal(busy.status, 409, 'single-session rule applies to social login too');
    const again = await call('login/social', { method: 'POST', body: { provider: 'google', idToken: makeToken({}), force: true } });
    assert.equal(again.body.name, first.body.name);
    assert.equal((await call('me', { cookie: first.cookie })).status, 401);

    assert.equal((await call('account/security', { cookie: again.cookie })).body.passwordless, true);
    // A Google-only account can delete itself by proving the Google identity again (it has no password to type).
    // (checked at the end with a throw-away account)

    // The verified Google email can be used to reset the password and to log in.
    await call('password/forgot', { method: 'POST', body: { email: 'nobody@example.com' } });
    assert.equal(mails.length, 0, 'unknown emails get the same answer but no mail');
    assert.equal((await call('password/forgot', { method: 'POST', body: { email: 'Player@Example.com' } })).status, 200);
    assert.equal(mails.length, 1);
    const code = codeOf(mails[0]);
    assert.equal((await call('password/reset', { method: 'POST', body: { email: 'player@example.com', code: code === '000000' ? '111111' : '000000', password: 'brand-new-password-1' } })).status, 400);
    assert.equal((await call('password/reset', { method: 'POST', body: { email: 'player@example.com', code, password: 'short' } })).status, 400);
    assert.equal((await call('password/reset', { method: 'POST', body: { email: 'player@example.com', code, password: 'brand-new-password-1' } })).status, 200);
    assert.equal((await call('password/reset', { method: 'POST', body: { email: 'player@example.com', code, password: 'brand-new-password-2' } })).status, 400, 'a code works once');
    assert.equal((await call('me', { cookie: again.cookie })).status, 401, 'reset signs out every session');
    const byEmail = await call('login', { method: 'POST', body: { name: 'player@example.com', password: 'brand-new-password-1' } });
    assert.equal(byEmail.status, 200);
    assert.equal(byEmail.body.name, first.body.name);
    assert.equal((await call('login', { method: 'POST', body: { name: 'player@example.com', password: 'wrong-password-123', force: true } })).status, 401);

    // A normal account adds and verifies an email, and cannot take an email another account owns.
    const normal = await call('register', { method: 'POST', body: { name: 'normal_user', password: 'long-test-password-123' } });
    assert.equal((await call('account/email', { method: 'POST', body: { email: 'player@example.com' }, cookie: normal.cookie })).status, 409);
    assert.equal((await call('account/email', { method: 'POST', body: { email: 'not-an-email' }, cookie: normal.cookie })).status, 400);
    assert.equal((await call('account/email', { method: 'POST', body: { email: 'normal@example.com' }, cookie: normal.cookie })).status, 200);
    assert.equal((await call('account/email', { method: 'POST', body: { email: 'normal@example.com' }, cookie: normal.cookie })).status, 429, 'codes cannot be spammed');
    const verifyCode = codeOf(mails.at(-1));
    for (let i = 0; i < 5; i++) await call('account/email/verify', { method: 'POST', body: { email: 'normal@example.com', code: verifyCode === '123456' ? '654321' : '123456' }, cookie: normal.cookie });
    assert.equal((await call('account/email/verify', { method: 'POST', body: { email: 'normal@example.com', code: verifyCode }, cookie: normal.cookie })).status, 400, 'too many wrong tries burn the code');

    // A Google identity cannot belong to two accounts; a free one can be linked and brings its verified email.
    assert.equal((await call('account/identity', { method: 'POST', body: { provider: 'google', idToken: makeToken({}) }, cookie: normal.cookie })).status, 409);
    const second = await call('login/social', { method: 'POST', body: { provider: 'google', idToken: makeToken({ sub: 'g-3', email: 'third@example.com' }) } });
    assert.equal((await call('account/delete', { method: 'POST', body: { provider: 'google', idToken: makeToken({ sub: 'g-1' }) }, cookie: second.cookie })).status, 403, 'another identity cannot delete this account');
    assert.equal((await call('account/delete', { method: 'POST', body: { provider: 'google', idToken: makeToken({ sub: 'g-3', email: 'third@example.com' }) }, cookie: second.cookie })).status, 200);
    assert.equal((await call('me', { cookie: second.cookie })).status, 401);
    const linked = await call('account/identity', { method: 'POST', body: { provider: 'google', idToken: makeToken({ sub: 'g-2', email: 'second@example.com' }) }, cookie: normal.cookie });
    assert.equal(linked.status, 200);
    assert.deepEqual([linked.body.email, linked.body.identities], ['second@example.com', ['google']]);
  } finally { await api.close(); }
});
