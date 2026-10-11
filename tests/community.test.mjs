import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApi } from '../server/app.mjs';
import { createCharacter } from '../server/game-logic.generated.mjs';

const password = 'long-test-password-123';

test('community reward is given once per platform; premium vouchers activate from the bag or the bank', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'nyxia-community-'));
  const database = join(dir, 'test.sqlite');
  const api = createApi({ database, origin: 'http://test.local', secure: false });
  await new Promise((r) => api.server.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${api.server.address().port}/api/`;
  const call = async (path, body, cookie, method = body ? 'POST' : 'GET') => {
    const r = await fetch(url + path, { method, headers: { Origin: 'http://test.local', 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: r.status, data: await r.json().catch(() => ({})), cookie: r.headers.get('set-cookie')?.split(';')[0] };
  };
  try {
    const cookie = (await call('register', { name: 'claimer', password })).cookie;
    const data = { characters: [{ ...createCharacter('warrior', 'human', 'Hero'), id: 'hero' }, null, null], bank: [[], []], bankGold: 0, diamonds: 0 };
    assert.equal((await call('backup', { revision: 0, data }, cookie, 'PUT')).status, 200);
    { const db = new DatabaseSync(database); db.prepare('INSERT INTO economy_accounts VALUES(1,?)').run(Date.now()); db.close(); }
    const act = (type, payload = {}) => call('game/act', { characterKey: 'hero', type, payload }, cookie);

    // Instagram: 50 diamonds, 5 + 5 potions and an untradable 1-hour Mythic Premium voucher
    const first = await act('social/claim', { platform: 'instagram' });
    assert.equal(first.data.result.ok, true);
    assert.equal(first.data.patch.diamonds, 50);
    const items = first.data.patch.inventory;
    const potionCount = (list, type) => list.filter((i) => i.kind === 'potion' && i.potionType === type).reduce((n, i) => n + i.count, 0);
    const baseline = data.characters[0].inventory;
    assert.equal(potionCount(items, 'hp'), potionCount(baseline, 'hp') + 5);
    assert.equal(potionCount(items, 'mp'), potionCount(baseline, 'mp') + 5);
    const voucher = items.find((i) => i.kind === 'premiumVoucher');
    assert.deepEqual([voucher.premiumTier, voucher.durationMs, voucher.noTrade, voucher.track], ['mythic', 3600000, true, 'boost']);
    assert.equal((await call('wallet', null, cookie)).data.diamonds, 50, 'the diamonds come from the server wallet');

    // The same platform cannot be claimed again, nor with a bogus platform
    const again = await act('social/claim', { platform: 'instagram' });
    assert.equal(again.data.result.reason, 'alreadyClaimed');
    assert.equal((await act('social/claim', { platform: 'twitter' })).data.result.reason, 'invalidReward');
    assert.equal((await call('wallet', null, cookie)).data.diamonds, 50);

    // Discord: another 50, and the vouchers stack
    const second = await act('social/claim', { platform: 'discord' });
    assert.equal(second.data.result.ok, true);
    assert.equal((await call('wallet', null, cookie)).data.diamonds, 100);
    assert.equal(second.data.patch.inventory.find((i) => i.kind === 'premiumVoucher').count, 2);

    // An untradable voucher cannot be sold
    assert.equal((await act('inventory/sell', { itemId: voucher.id })).data.result.reason, 'noTrade');

    // Use one from the bag: premium starts for one hour on the server too
    const before = Date.now();
    const used = await act('premium/useVoucher', { itemId: voucher.id });
    assert.equal(used.data.result.ok, true);
    assert.equal(used.data.result.activate.track, 'boost');
    const expiresAt = used.data.patch.premiumBoost.expiresAt;
    assert.ok(expiresAt >= before + 3600000 - 1000 && expiresAt <= Date.now() + 3600000 + 1000);
    assert.equal(used.data.patch.inventory.find((i) => i.kind === 'premiumVoucher').count, 1);
    const wallet = (await call('wallet?characterKey=hero', null, cookie)).data;
    assert.deepEqual([wallet.entitlement.premiumBoost.tier, wallet.entitlement.premiumBoost.expiresAt], ['mythic', expiresAt]);

    // Move the last one to the bank and use it from there: the same tier extends the time
    assert.equal((await act('inventory/depositItem', { itemId: voucher.id, page: 0 })).data.result.ok, true);
    const fromBank = await act('premium/useVoucher', { itemId: voucher.id });
    assert.equal(fromBank.data.result.ok, true);
    assert.ok(Math.abs(fromBank.data.patch.premiumBoost.expiresAt - (expiresAt + 3600000)) < 1000);
    assert.equal(fromBank.data.bank.flat().some((i) => i.kind === 'premiumVoucher'), false, 'the voucher is gone from the bank');
    assert.equal((await act('premium/useVoucher', { itemId: voucher.id })).data.result.reason, 'itemNotFound', 'a voucher works once');

    // Premium stays pinned to the server truth in the saved backup
    const stored = (await call('backup', null, cookie)).data.data.characters[0];
    assert.equal(stored.premiumBoost.tier, 'mythic');
  } finally { api.server.close(); }
});
