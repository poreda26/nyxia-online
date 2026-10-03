import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApi } from '../server/app.mjs';

const SECRET = 'webhook-secret-for-tests';

async function boot(options = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'nyxia-iap-'));
  const api = createApi({ database: join(dir, 'test.sqlite'), origin: 'http://test.local', secure: false, ...options });
  await new Promise((r) => api.server.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${api.server.address().port}/api/`;
  // Normal browser-style call (has an Origin).
  const call = async (path, body, cookie, method = body ? 'POST' : 'GET') => {
    const r = await fetch(url + path, { method, headers: { Origin: 'http://test.local', 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: r.status, data: await r.json().catch(() => ({})), cookie: r.headers.get('set-cookie')?.split(';')[0] };
  };
  // Store-service style call: no Origin, bearer secret.
  const hook = async (event, secret = SECRET) => {
    const r = await fetch(url + 'iap/revenuecat', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(secret ? { Authorization: `Bearer ${secret}` } : {}) }, body: JSON.stringify({ event }) });
    return { status: r.status, data: await r.json().catch(() => ({})) };
  };
  return { api, call, hook };
}

test('diamond purchases credit once per store transaction, only with the webhook secret', async () => {
  const { api, call, hook } = await boot({ iapWebhookSecret: SECRET });
  try {
    const password = 'long-test-password-123';
    const alice = (await call('register', { name: 'alice', password })).cookie;
    const bob = (await call('register', { name: 'bob', password })).cookie;
    const purchase = (over = {}) => ({ type: 'NON_RENEWING_PURCHASE', app_user_id: '1', product_id: 'diamonds_550', transaction_id: 'tx-1', store: 'APP_STORE', environment: 'PRODUCTION', ...over });

    // The client can never credit itself; only the secret-bearing service can.
    assert.equal((await hook(purchase(), null)).status, 401);
    assert.equal((await hook(purchase(), 'wrong-secret')).status, 401);
    assert.equal((await call('iap/revenuecat', { event: purchase() }, alice)).status, 404, 'a logged-in browser call cannot use the webhook');
    assert.equal((await call('wallet', null, alice)).data.diamonds, 0);

    const first = await hook(purchase());
    assert.equal(first.status, 200);
    assert.equal(first.data.credited, 550);
    assert.equal((await call('wallet', null, alice)).data.diamonds, 550);

    // Redelivery of the same transaction changes nothing; the same transaction for another account is refused.
    assert.equal((await hook(purchase())).data.duplicate, true);
    assert.equal((await call('wallet', null, alice)).data.diamonds, 550);
    assert.equal((await hook(purchase({ app_user_id: '2' }))).status, 409);
    assert.equal((await call('wallet', null, bob)).data.diamonds, 0);

    // Unknown product, unknown account, sandbox purchases and unrelated events.
    assert.equal((await hook(purchase({ transaction_id: 'tx-2', product_id: 'diamonds_999999' }))).status, 400);
    assert.equal((await hook(purchase({ transaction_id: 'tx-3', app_user_id: '99' }))).status, 404);
    assert.equal((await hook(purchase({ transaction_id: 'tx-4', environment: 'SANDBOX' }))).data.ignored, true);
    assert.equal((await hook({ type: 'RENEWAL', app_user_id: '1' })).data.ignored, true);
    assert.equal((await call('wallet', null, alice)).data.diamonds, 550);

    // Another real purchase adds up; spending first, then a refund only takes back what is left.
    assert.equal((await hook(purchase({ transaction_id: 'tx-5', product_id: 'diamonds_100' }))).data.diamonds, 650);
    assert.equal((await call('wallet/spend', { kind: 'bonusScroll' }, alice)).status, 409, 'cannot afford yet');
    await hook(purchase({ transaction_id: 'tx-6', product_id: 'diamonds_100' }));
    assert.equal((await call('wallet/spend', { kind: 'raceScroll' }, alice)).data.diamonds, 250);
    const refund = await hook({ ...purchase({ transaction_id: 'tx-1' }), type: 'CANCELLATION' });
    assert.equal(refund.data.refunded, 550);
    assert.equal(refund.data.clawedBack, 250, 'only the unspent part can be taken back');
    assert.equal((await call('wallet', null, alice)).data.diamonds, 0);
    assert.equal((await hook({ ...purchase({ transaction_id: 'tx-1' }), type: 'CANCELLATION' })).data.ignored, true, 'a refund applies once');
    assert.equal((await hook({ ...purchase({ transaction_id: 'never-seen' }), type: 'REFUND' })).data.ignored, true);
  } finally { await api.close(); }
});

test('the webhook is off without a secret and sandbox purchases need an explicit opt-in', async () => {
  const off = await boot();
  try {
    assert.equal((await off.hook({ type: 'NON_RENEWING_PURCHASE' })).status, 503);
  } finally { await off.api.close(); }
  const beta = await boot({ iapWebhookSecret: SECRET, iapAllowSandbox: true });
  try {
    await beta.call('register', { name: 'tester', password: 'long-test-password-123' });
    const sandbox = await beta.hook({ type: 'NON_RENEWING_PURCHASE', app_user_id: '1', product_id: 'diamonds_100', transaction_id: 'sb-1', store: 'PLAY_STORE', environment: 'SANDBOX' });
    assert.equal(sandbox.data.credited, 100, 'TestFlight / Play test purchases work when sandbox is allowed');
  } finally { await beta.api.close(); }
});
