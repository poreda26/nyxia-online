import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {mkdtempSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {createApi} from '../server/app.mjs';

// Rütbeler: Normal Üye < Memur < Lider Yardımcısı < Lider. Kademe kademe terfi, rütbeye göre çıkarma, lider ayrılınca yardımcıya devir.
test('four clan ranks: step-by-step promotion, rank-based kicking, deputy inherits leadership', async () => {
  const dbFile = join(mkdtempSync(join(tmpdir(), 'nyxia-roles-')), 't.sqlite');
  const api = createApi({ database: dbFile, secure: false, origin: 'http://localhost:5177' });
  await new Promise((r) => api.server.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${api.server.address().port}/api/`;
  let cookie;
  const call = async (path, key, body, method = body ? 'POST' : 'GET') => {
    const r = await fetch(url + path, { method, headers: { Origin: 'http://localhost:5177', 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}), ...(key ? { 'X-Character-Key': key } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: r.status, data: await r.json().catch(() => ({})), cookie: r.headers.get('set-cookie')?.split(';')[0] };
  };
  try {
    cookie = (await call('register', null, { name: 'roleowner', password: 'test-password-long' })).cookie;
    const chars = [{ id: 'c1', nickname: 'Leader1', level: 50 }, { id: 'c2', nickname: 'Second2', level: 40 }, { id: 'c3', nickname: 'Third33', level: 30 }];
    assert.equal((await call('backup', null, { revision: 0, data: { characters: chars, bank: [[]], diamonds: 10000 } }, 'PUT')).status, 200);
    { const db = new DatabaseSync(dbFile); db.prepare('UPDATE wallets SET diamonds=5000').run(); db.close(); }
    assert.equal((await call('clan', 'c1', { name: 'Ranks' })).status, 200);
    for (const [key, name] of [['c2', 'Second2'], ['c3', 'Third33']]) {
      assert.equal((await call('clan/invite', 'c1', { name })).status, 200);
      const invite = (await call('clan/invites', key)).data[0];
      assert.equal((await call(`clan/invites/${invite.id}/accept`, key, {})).status, 200);
    }
    const role = async (key) => (await call('clan/mine', key)).data.clan.myRole;
    const promote = (target) => call('clan/promote', 'c1', { accountId: 1, characterKey: target });
    const demote = (target) => call('clan/demote', 'c1', { accountId: 1, characterKey: target });

    assert.equal(await role('c2'), 'member');
    assert.equal((await promote('c2')).status, 200);
    assert.equal(await role('c2'), 'officer');
    assert.equal((await promote('c2')).status, 200);
    assert.equal(await role('c2'), 'deputy');
    assert.equal((await promote('c2')).status, 200, 'already the top promotable rank: no change, no error');
    assert.equal(await role('c2'), 'deputy');
    assert.equal((await promote('c3')).status, 200);
    assert.equal(await role('c3'), 'officer');

    // Permissions: the deputy column exists with sensible defaults.
    const perms = (await call('clan/mine', 'c1')).data.clan.permissions;
    assert.ok(perms.deputy && perms.officer && perms.member);

    // Kick rules: nobody kicks an equal or higher rank; higher ranks kick lower ones.
    assert.equal((await call('clan/kick', 'c3', { accountId: 1, characterKey: 'c2' })).status, 403, 'an officer cannot remove the deputy');
    assert.equal((await call('clan/kick', 'c2', { accountId: 1, characterKey: 'c1' })).status, 400, 'nobody kicks the leader');
    assert.equal((await demote('c2')).status, 200);
    assert.equal(await role('c2'), 'officer');
    assert.equal((await promote('c2')).status, 200);

    // Leader leaves: the deputy becomes the new leader.
    assert.equal((await call('clan/leave', 'c1', {})).status, 200);
    assert.equal(await role('c2'), 'leader');
    assert.equal(await role('c3'), 'officer');
  } finally { await api.close(); }
});
