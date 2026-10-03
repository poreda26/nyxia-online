import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApi } from '../server/app.mjs';

test('friend VS: only friends, never blocked, and only duel fields are shared', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'nyxia-vs-'));
  const api = createApi({ database: join(dir, 'test.sqlite'), origin: 'http://test.local', secure: false });
  await new Promise((r) => api.server.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${api.server.address().port}/api/`;
  const call = async (path, body, cookie, method = body ? 'POST' : 'GET') => {
    const r = await fetch(url + path, { method, headers: { Origin: 'http://test.local', 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: r.status, data: await r.json().catch(() => ({})), cookie: r.headers.get('set-cookie')?.split(';')[0] };
  };
  const password = 'long-test-password-123';
  try {
    const alice = (await call('register', { name: 'alice', password })).cookie;
    const bob = (await call('register', { name: 'bob', password })).cookie;
    const carol = (await call('register', { name: 'carol', password })).cookie;
    const hero = (id, nickname, level) => ({ id, nickname, class: 'warrior', race: 'human', level, stats: { str: 60, sta: 60, dex: 60, int: 60, mag: 60 }, equipped: {}, skills: { known: [], loadout: [null, null, null, null, null] }, gold: 123456, inventory: [{ id: 'secret-item', name: 'Gizli' }], bankGold: 999, claimedQuests: ['x'] });
    const backup = (nick, level) => ({ revision: 0, data: { characters: [hero(nick.toLowerCase(), nick, level), hero(nick.toLowerCase() + '2', nick + 'Alt', 3), null], bank: [[]], diamonds: 5 } });
    await call('backup', backup('AliceHero', 20), alice, 'PUT');
    await call('backup', backup('BobHero', 33), bob, 'PUT');

    // Not friends yet.
    assert.equal((await call('social/friends/2/duel', null, alice)).status, 403);

    // Become friends.
    assert.equal((await call('social/friends/request', { name: 'bob' }, alice)).status, 200);
    const incoming = (await call('social/friends', null, bob)).data.incoming[0];
    assert.equal((await call(`social/friends/${incoming.id}/accept`, {}, bob)).status, 200);

    const duel = await call('social/friends/2/duel', null, alice);
    assert.equal(duel.status, 200);
    assert.equal(duel.data.friendName, 'BobHero', 'highest-level character is used');
    assert.equal(duel.data.opponent.level, 33);
    assert.ok(Number.isInteger(duel.data.seed) && duel.data.seed > 0);
    for (const secret of ['gold', 'inventory', 'bankGold', 'claimedQuests']) assert.equal(secret in duel.data.opponent, false, secret);
    assert.ok(duel.data.opponent.stats && duel.data.opponent.equipped && duel.data.opponent.skills);
    assert.ok(!JSON.stringify(duel.data).includes('Gizli'));

    // Strangers cannot use someone else's friendship.
    assert.equal((await call('social/friends/2/duel', null, carol)).status, 403);
    // A friend without a saved character.
    assert.equal((await call('social/friends/request', { name: 'carol' }, alice)).status, 200);
    const carolIncoming = (await call('social/friends', null, carol)).data.incoming[0];
    await call(`social/friends/${carolIncoming.id}/accept`, {}, carol);
    assert.equal((await call('social/friends/3/duel', null, alice)).status, 404);

    // Blocking ends it in both directions.
    assert.equal((await call('social/block', { accountId: 1 }, bob)).status, 200);
    assert.equal((await call('social/friends/2/duel', null, alice)).status, 403);
    assert.equal((await call('social/friends/1/duel', null, bob)).status, 403);
  } finally { await api.close(); }
});
