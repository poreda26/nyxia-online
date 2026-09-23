import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApi } from '../server/app.mjs';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('accounts isolate backups, reject stale writes, preserve items and survive restart', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'nyxia-api-'));
  const options = { database: join(dir, 'test.sqlite'), origin: 'http://localhost:5177', secure: false };
  let api = createApi(options);
  const listen = async () => { await new Promise(resolve => api.server.listen(0, '127.0.0.1', resolve)); return `http://127.0.0.1:${api.server.address().port}`; };
  let url = await listen();
  const call = async (path, method = 'GET', body, cookie, origin = options.origin) => {
    const r = await fetch(url + '/api/' + path, { method, headers: { Origin: origin, 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: r.status, body: await r.json(), cookie: r.headers.get('set-cookie')?.split(';')[0] };
  };
  try {
    assert.equal((await call('backup')).status, 401);
    assert.equal((await call('register', 'POST', { name: 'alice', password: 'short' })).status, 400);
    const credentials = { name: 'alice', password: 'long-test-password-123' };
    const a = await call('register', 'POST', credentials);
    assert.equal(a.status, 200);
    assert.equal((await call('register', 'POST', credentials)).status, 409);
    assert.equal((await call('login', 'POST', { ...credentials, password: 'incorrect-password' })).status, 401);
    const b = await call('register', 'POST', { ...credentials, name: 'bob' });
    const data = { characters: [{ id: 'hero', inventory: [{ id: 'original-item', upgradeLevel: 8 }], quests: { done: true } }, null, null], bank: [[{ id: 'bank-item' }]], diamonds: 777 };
    assert.equal((await call('backup', 'PUT', { revision: 0, data }, a.cookie, 'https://evil.example')).status, 403);
    assert.equal((await call('backup', 'PUT', { revision: 0, data }, a.cookie)).body.revision, 1);
    assert.equal((await call('backup', 'PUT', { revision: 0, data }, a.cookie)).status, 409);
    assert.deepEqual((await call('backup', 'GET', null, a.cookie)).body.data, data);
    assert.equal((await call('backup', 'GET', null, b.cookie)).body.data, null);
    const concurrent = await Promise.all([1, 2].map(() => call('backup', 'PUT', { revision: 1, data }, a.cookie)));
    assert.deepEqual(concurrent.map(r => r.status).sort(), [200, 409]);
    await api.close(); api = createApi(options); url = await listen();
    assert.deepEqual((await call('backup', 'GET', null, a.cookie)).body.data, data);
    assert.equal((await call('backup', 'GET', null, a.cookie)).body.trusted, false);
    assert.equal((await call('logout', 'POST', {}, a.cookie)).status, 200);
    assert.equal((await call('me', 'GET', null, a.cookie)).status, 401);
    assert.equal((await call('login', 'POST', credentials)).status, 200);
    assert.equal((await call('backup', 'PUT', { revision: 2, data: { characters: [] } }, b.cookie)).status, 400);
    assert.equal((await call('backup', 'PUT', { revision: 2, data: { ...data, padding: 'x'.repeat(2 * 1024 * 1024) } }, b.cookie)).status, 413);
    for (let i = 0; i < 14; i++) await call('login', 'POST', { ...credentials, password: 'incorrect-password' });
    assert.equal((await call('login', 'POST', credentials)).status, 429);
  } finally { await api.close(); rmSync(dir, { recursive: true }); }
});
