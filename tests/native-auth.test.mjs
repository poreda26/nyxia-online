import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApi } from '../server/app.mjs';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('native app origins authenticate with Bearer tokens, web keeps cookies', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'nyxia-native-'));
  const web = 'http://localhost:5177';
  const api = createApi({ database: join(dir, 'test.sqlite'), origin: web, secure: false });
  await new Promise(resolve => api.server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${api.server.address().port}`;
  const call = async (path, { method = 'GET', body, origin = web, headers = {} } = {}) => {
    const r = await fetch(`${url}/api/${path}`, { method, headers: { Origin: origin, 'Content-Type': 'application/json', ...headers }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: r.status, body: await r.json().catch(() => ({})), headers: r.headers };
  };
  const credentials = { name: 'native_user', password: 'long-test-password-123' };
  try {
    // Web login: cookie only, token never appears in the body.
    const webLogin = await call('register', { method: 'POST', body: credentials });
    assert.equal(webLogin.status, 200);
    assert.equal(webLogin.body.token, undefined);
    const cookie = webLogin.headers.get('set-cookie').split(';')[0];

    for (const nativeOrigin of ['https://localhost', 'capacitor://localhost']) {
      const nativeHeaders = { 'X-Native-Client': '1' };
      const login = await call('login', { method: 'POST', body: credentials, origin: nativeOrigin, headers: nativeHeaders });
      assert.equal(login.status, 200);
      assert.match(login.body.token, /^[a-f0-9]{64}$/);
      assert.equal(login.headers.get('set-cookie'), null);
      assert.equal(login.headers.get('access-control-allow-origin'), nativeOrigin);
      assert.equal(login.headers.get('access-control-allow-credentials'), null);

      const auth = { Authorization: `Bearer ${login.body.token}` };
      assert.equal((await call('me', { origin: nativeOrigin, headers: auth })).status, 200);
      assert.equal((await call('me', { origin: nativeOrigin })).status, 401);
      // The web cookie must not authenticate a request that comes from a native origin.
      assert.equal((await call('me', { origin: nativeOrigin, headers: { Cookie: cookie } })).status, 401);
      assert.equal((await call('logout', { method: 'POST', origin: nativeOrigin, headers: auth })).status, 200);
      assert.equal((await call('me', { origin: nativeOrigin, headers: auth })).status, 401);
    }

    // Native origin without the opt-in header gets the normal cookie flow, no token in the body.
    const noOptIn = await call('login', { method: 'POST', body: credentials, origin: 'https://localhost' });
    assert.equal(noOptIn.body.token, undefined);

    // Preflight advertises the new headers; unknown origins stay blocked.
    const preflight = await fetch(`${url}/api/me`, { method: 'OPTIONS', headers: { Origin: 'https://localhost' } });
    assert.equal(preflight.status, 204);
    assert.match(preflight.headers.get('access-control-allow-headers'), /Authorization/);
    assert.equal((await call('me', { origin: 'https://evil.example' })).status, 403);
    assert.equal((await call('login', { method: 'POST', body: credentials, origin: 'https://evil.example', headers: { 'X-Native-Client': '1' } })).status, 403);

    // The web cookie keeps working for the web origin.
    assert.equal((await call('me', { headers: { Cookie: cookie } })).status, 200);
  } finally { await api.close(); rmSync(dir, { recursive: true }); }
});
