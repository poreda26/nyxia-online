import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApi } from '../server/app.mjs';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('profanity is masked, players can block and report, owner can resolve reports', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'nyxia-mod-'));
  const file = join(dir, 'test.sqlite');
  const origin = 'http://localhost:5177';
  const api = createApi({ database: file, origin, secure: false });
  await new Promise(resolve => api.server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${api.server.address().port}/api/`;
  const call = async (path, { method = 'GET', body, cookie } = {}) => {
    const r = await fetch(base + path, { method, headers: { Origin: origin, 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: r.status, data: await r.json().catch(() => ({})), cookie: r.headers.get('set-cookie')?.split(';')[0] };
  };
  const password = 'long-test-password-123';
  const db = new DatabaseSync(file);
  try {
    // Offensive names are refused, normal ones pass.
    assert.equal((await call('register', { method: 'POST', body: { name: 'xxsiktirxx', password } })).status, 400);
    const alice = (await call('register', { method: 'POST', body: { name: 'alice', password } })).cookie;
    const bob = (await call('register', { method: 'POST', body: { name: 'bob', password } })).cookie;
    const owner = (await call('register', { method: 'POST', body: { name: 'boss', password } })).cookie;
    const id = name => db.prepare('SELECT id FROM accounts WHERE name=?').get(name).id;
    db.prepare('INSERT INTO panel_owner VALUES(1,?)').run(id('boss'));

    const say = (cookie, author, text) => call('chat/messages', { method: 'POST', body: { author, text, isGM: false }, cookie });
    assert.equal((await say(alice, 'AliceHero · Lv.5', 'Merhaba siktir git FUCK')).status, 200);
    assert.equal((await say(bob, 'BobHero · Lv.7', 'selam alice')).status, 200);
    const aliceView = (await call('chat/messages', { cookie: alice })).data;
    assert.equal(aliceView[0].text, 'Merhaba ****** git ****');
    assert.deepEqual(aliceView.map(m => m.mine), [true, false]);
    assert.equal(aliceView.some(m => 'accountId' in m || 'account_id' in m), false);

    // Reports: invalid reason, self report and DM scoping are rejected; a valid one is stored once.
    const bobMessage = aliceView[1];
    assert.equal((await call('social/report', { method: 'POST', body: { messageId: bobMessage.id, reason: 'nonsense' }, cookie: alice })).status, 400);
    assert.equal((await call('social/report', { method: 'POST', body: { messageId: aliceView[0].id, reason: 'spam' }, cookie: alice })).status, 400);
    assert.equal((await call('social/report', { method: 'POST', body: { messageId: bobMessage.id, reason: 'abuse', details: 'hakaret etti' }, cookie: alice })).status, 200);
    assert.equal((await call('social/report', { method: 'POST', body: { messageId: bobMessage.id, reason: 'abuse' }, cookie: alice })).status, 200);
    assert.equal(db.prepare('SELECT COUNT(*) n FROM user_reports').get().n, 1);
    db.prepare('INSERT INTO direct_messages(from_account,to_account,text,created_at) VALUES(?,?,?,?)').run(id('bob'), id('alice'), 'dm metni', Date.now());
    const dmId = db.prepare('SELECT id FROM direct_messages').get().id;
    assert.equal((await call('social/report', { method: 'POST', body: { dmId, reason: 'spam' }, cookie: bob })).status, 404);
    assert.equal((await call('social/report', { method: 'POST', body: { dmId, reason: 'spam' }, cookie: alice })).status, 200);

    // Owner sees the queue; players do not.
    assert.equal((await call('admin/reports', { cookie: alice })).status, 403);
    const queue = (await call('admin/reports', { cookie: owner })).data;
    assert.deepEqual(queue.map(r => [r.context, r.reason, r.target_name, r.reporter_name, r.status]).sort(), [['chat', 'abuse', 'bob', 'alice', 'open'], ['dm', 'spam', 'bob', 'alice', 'open']].sort());
    assert.match(queue.find(r => r.context === 'chat').content, /selam alice/);
    assert.equal((await call('admin/report/resolve', { method: 'POST', body: { id: queue[0].id, status: 'actioned', reason: 'uyarı verildi' }, cookie: owner })).status, 200);
    assert.equal((await call('admin/report/resolve', { method: 'POST', body: { id: queue[0].id, status: 'dismissed', reason: 'tekrar' }, cookie: owner })).status, 404);

    // Blocking: friendship dissolves, the blocked player disappears from my chat only, requests are silent.
    db.prepare('INSERT INTO friendships VALUES(?,?,?)').run(Math.min(id('alice'), id('bob')), Math.max(id('alice'), id('bob')), Date.now());
    assert.equal((await call('social/block', { method: 'POST', body: { messageId: bobMessage.id }, cookie: alice })).status, 200);
    assert.equal(db.prepare('SELECT COUNT(*) n FROM friendships').get().n, 0);
    assert.deepEqual((await call('chat/messages', { cookie: alice })).data.map(m => m.author), ['AliceHero · Lv.5']);
    assert.equal((await call('chat/messages', { cookie: bob })).data.length, 2);
    assert.deepEqual((await call('social/blocks', { cookie: alice })).data, [{ accountId: id('bob'), name: 'bob' }]);
    assert.equal((await call('social/friends/request', { method: 'POST', body: { name: 'bob' }, cookie: alice })).status, 409);
    assert.equal((await call('social/friends/request', { method: 'POST', body: { name: 'alice' }, cookie: bob })).data.status, 'pending');
    assert.equal(db.prepare('SELECT COUNT(*) n FROM friend_requests').get().n, 0);
    assert.equal((await call('social/block', { method: 'POST', body: { accountId: id('alice') }, cookie: alice })).status, 400);

    // Unblocking restores the messages.
    assert.equal((await call(`social/blocks/${id('bob')}`, { method: 'DELETE', cookie: alice })).status, 200);
    assert.equal((await call('chat/messages', { cookie: alice })).data.length, 2);

    // Clan names go through the same filter.
    assert.equal((await call('clan', { method: 'POST', body: { name: 'Orospu Clan' }, cookie: alice })).status, 400);

    // Deleting the reporter keeps the evidence anonymised; deleting the target removes their reports and blocks.
    await call('social/block', { method: 'POST', body: { accountId: id('bob') }, cookie: alice });
    assert.equal((await call('account/delete', { method: 'POST', body: { password }, cookie: alice })).status, 200);
    assert.equal(db.prepare('SELECT COUNT(*) n FROM user_blocks').get().n, 0);
    assert.equal(db.prepare('SELECT COUNT(*) n FROM user_reports WHERE reporter IS NULL').get().n, 2);
    assert.equal((await call('account/delete', { method: 'POST', body: { password }, cookie: bob })).status, 200);
    assert.equal(db.prepare('SELECT COUNT(*) n FROM user_reports').get().n, 0);
    assert.equal(db.prepare('SELECT COUNT(*) n FROM chat_messages').get().n, 0);
    assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(), []);
  } finally { db.close(); await api.close(); rmSync(dir, { recursive: true }); }
});
