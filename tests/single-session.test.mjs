import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApi } from '../server/app.mjs';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('an account can only be open in one place: a second login needs confirmation and closes the first', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'nyxia-session-'));
  const web = 'http://localhost:5177';
  const api = createApi({ database: join(dir, 'test.sqlite'), origin: web, secure: false });
  await new Promise((resolve) => api.server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${api.server.address().port}`;
  const native = 'https://localhost';
  const call = async (path, { method = 'GET', body, origin = native, token } = {}) => {
    const r = await fetch(`${url}/api/${path}`, { method, headers: { Origin: origin, 'Content-Type': 'application/json', 'X-Native-Client': '1', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: r.status, body: await r.json().catch(() => ({})) };
  };
  const credentials = { name: 'solo_user', password: 'long-test-password-123' };
  try {
    const first = await call('register', { method: 'POST', body: credentials });
    assert.equal(first.status, 200);
    const phone = first.body.token;
    assert.equal((await call('me', { token: phone })).status, 200);

    // Same account from another device while the first is active: refused until the player confirms.
    const refused = await call('login', { method: 'POST', body: credentials });
    assert.equal(refused.status, 409);
    assert.equal(refused.body.error, 'ACCOUNT_IN_USE');
    assert.equal((await call('me', { token: phone })).status, 200, 'the first session is untouched by the refused login');

    // A wrong password learns nothing about whether the account is open.
    assert.equal((await call('login', { method: 'POST', body: { ...credentials, password: 'wrong-password-123' } })).body.error, 'INVALID_CREDENTIALS');

    // Confirmed: the new device gets in and the old one is signed out.
    const tablet = (await call('login', { method: 'POST', body: { ...credentials, force: true } })).body.token;
    assert.match(tablet, /^[a-f0-9]{64}$/);
    assert.equal((await call('me', { token: phone })).status, 401);
    assert.equal((await call('me', { token: tablet })).status, 200);

    // Logging out frees the account: the next login needs no confirmation.
    await call('logout', { method: 'POST', token: tablet });
    const again = await call('login', { method: 'POST', body: credentials });
    assert.equal(again.status, 200);

    // A session that has been idle for a long time does not block a normal login (the app was closed without logging out).
    const idle = new DatabaseSync(join(dir, 'test.sqlite'));
    idle.exec('UPDATE sessions SET seen=1');
    idle.close();
    const reopened = await call('login', { method: 'POST', body: credentials });
    assert.equal(reopened.status, 200);
    assert.equal((await call('me', { token: again.body.token })).status, 401, 'the idle session was replaced');
  } finally { await api.close(); }
});
