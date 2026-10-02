import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApi } from '../server/app.mjs';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('account deletion removes every trace, hands clans over and protects the panel owner', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'nyxia-delete-'));
  const file = join(dir, 'test.sqlite');
  const origin = 'http://localhost:5177';
  const api = createApi({ database: file, origin, secure: false });
  await new Promise(resolve => api.server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${api.server.address().port}/api/`;
  const call = async (path, { method = 'GET', body, cookie, key } = {}) => {
    const r = await fetch(base + path, { method, headers: { Origin: origin, 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}), ...(key ? { 'X-Character-Key': key } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: r.status, data: await r.json().catch(() => ({})), cookie: r.headers.get('set-cookie')?.split(';')[0] };
  };
  const password = 'long-test-password-123';
  const register = async name => (await call('register', { method: 'POST', body: { name, password } })).cookie;
  const db = new DatabaseSync(file);
  const count = (sql, ...params) => db.prepare(sql).get(...params).n;
  try {
    const alice = await register('alice');
    const bob = await register('bob');
    const carol = await register('carol');
    const aliceId = db.prepare("SELECT id FROM accounts WHERE name='alice'").get().id;
    const bobId = db.prepare("SELECT id FROM accounts WHERE name='bob'").get().id;
    const backupOf = nickname => ({ characters: [{ id: nickname.toLowerCase(), nickname, level: 50 }, null, null], bank: [[]], diamonds: 10 });
    assert.equal((await call('backup', { method: 'PUT', body: { revision: 0, data: backupOf('AliceHero') }, cookie: alice })).status, 200);
    assert.equal((await call('backup', { method: 'PUT', body: { revision: 0, data: backupOf('BobHero') }, cookie: bob })).status, 200);

    // Alice founds a clan and invites Bob; both talk in chat, befriend each other and DM.
    assert.equal((await call('clan', { method: 'POST', body: { name: 'Doomed Clan' }, cookie: alice, key: 'alicehero' })).status, 200);
    assert.equal((await call('clan/invite', { method: 'POST', body: { name: 'BobHero' }, cookie: alice, key: 'alicehero' })).status, 200);
    const invite = (await call('clan/invites', { cookie: bob, key: 'bobhero' })).data[0];
    assert.equal((await call(`clan/invites/${invite.id}/accept`, { method: 'POST', body: {}, cookie: bob, key: 'bobhero' })).status, 200);
    for (const [cookie, author] of [[alice, 'AliceHero · Lv.50'], [alice, 'AliceHero · Lv.51'], [bob, 'BobHero · Lv.10']]) {
      assert.equal((await call('chat/messages', { method: 'POST', body: { author, text: 'selam', isGM: false }, cookie })).status, 200);
    }
    const now = Date.now();
    db.prepare('INSERT INTO friendships VALUES(?,?,?)').run(Math.min(aliceId, bobId), Math.max(aliceId, bobId), now);
    db.prepare('INSERT INTO direct_messages(from_account,to_account,text,created_at) VALUES(?,?,?,?)').run(aliceId, bobId, 'hi', now);
    db.prepare('INSERT INTO direct_messages(from_account,to_account,text,created_at) VALUES(?,?,?,?)').run(bobId, aliceId, 'yo', now);
    db.prepare('INSERT INTO duel_history(challenger,opponent,winner,created_at) VALUES(?,?,?,?)').run(aliceId, bobId, 'me', now);
    db.prepare('INSERT INTO push_prefs(account_id) VALUES(?)').run(aliceId);
    db.prepare('INSERT INTO push_subscriptions VALUES(?,?,?,?,?)').run(aliceId, 'https://push.example/1', 'k', 'a', now);
    db.prepare('INSERT INTO market_stalls VALUES(?,?,?,?,?)').run(aliceId, 'Alice', '[]', now, 24);

    // Wrong password is rejected without touching anything.
    assert.equal((await call('account/delete', { method: 'POST', body: { password: 'wrong-password-123' }, cookie: alice })).status, 403);
    assert.equal((await call('account/delete', { method: 'POST', body: {}, cookie: alice })).status, 400);
    assert.equal(count('SELECT COUNT(*) n FROM accounts WHERE id=?', aliceId), 1);

    // The panel owner cannot delete the account that runs the panel.
    db.prepare('INSERT INTO panel_owner VALUES(1,?)').run(db.prepare("SELECT id FROM accounts WHERE name='carol'").get().id);
    assert.equal((await call('account/delete', { method: 'POST', body: { password }, cookie: carol })).status, 409);

    const deleted = await call('account/delete', { method: 'POST', body: { password }, cookie: alice });
    assert.equal(deleted.status, 200);

    // Everything tied to Alice is gone; Bob's data and the clan survive.
    for (const [table, column] of [['sessions', 'account'], ['backups', 'account'], ['backup_history', 'account'], ['market_stalls', 'account'], ['push_prefs', 'account_id'], ['push_subscriptions', 'account_id'], ['clan_members', 'account_id'], ['account_activity', 'account']]) {
      assert.equal(count(`SELECT COUNT(*) n FROM ${table} WHERE ${column}=?`, aliceId), 0, table);
    }
    assert.equal(count('SELECT COUNT(*) n FROM accounts WHERE id=?', aliceId), 0);
    assert.equal(count('SELECT COUNT(*) n FROM friendships'), 0);
    assert.equal(count('SELECT COUNT(*) n FROM direct_messages'), 0);
    assert.equal(count('SELECT COUNT(*) n FROM duel_history'), 0);
    assert.deepEqual(db.prepare('SELECT author FROM chat_messages').all().map(r => r.author), ['BobHero · Lv.10']);
    assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(), []);
    assert.equal(count('SELECT COUNT(*) n FROM backups WHERE account=?', bobId), 1);
    const clan = (await call('clan/mine', { cookie: bob, key: 'bobhero' })).data.clan;
    assert.equal(clan.name, 'Doomed Clan');
    assert.equal(clan.myRole, 'leader');
    assert.equal(db.prepare('SELECT founder_account f FROM clans').get().f, bobId);

    // The old session is dead, the name is free again, and a sole member's clan disappears with them.
    assert.equal((await call('me', { cookie: alice })).status, 401);
    assert.equal((await call('login', { method: 'POST', body: { name: 'alice', password } })).status, 401);
    assert.equal((await call('account/delete', { method: 'POST', body: { password }, cookie: bob })).status, 200);
    assert.equal(count('SELECT COUNT(*) n FROM clans'), 0);
    assert.equal(count('SELECT COUNT(*) n FROM clan_members'), 0);
    assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(), []);
    assert.equal((await call('register', { method: 'POST', body: { name: 'alice', password } })).status, 200);
  } finally { db.close(); await api.close(); rmSync(dir, { recursive: true }); }
});
