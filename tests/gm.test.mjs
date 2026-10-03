import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApi } from '../server/app.mjs';

test('GM authority lives on the server: no client flag or password grants it', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'nyxia-gm-'));
  const database = join(dir, 'test.sqlite');
  const api = createApi({ database, origin: 'http://test.local', secure: false });
  await new Promise((r) => api.server.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${api.server.address().port}/api/`;
  const call = async (path, body, cookie, method = body ? 'POST' : 'GET') => {
    const r = await fetch(url + path, { method, headers: { Origin: 'http://test.local', 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: r.status, data: await r.json().catch(() => ({})), cookie: r.headers.get('set-cookie')?.split(';')[0] };
  };
  const password = 'long-test-password-123';
  try {
    const owner = (await call('register', { name: 'owner', password })).cookie;
    const player = (await call('register', { name: 'player', password })).cookie;
    const helper = (await call('register', { name: 'helper', password })).cookie;
    const db = new DatabaseSync(database);
    db.prepare('INSERT INTO panel_owner VALUES(1,1)').run();

    assert.equal((await call('me', null, player)).data.gm, false);
    assert.equal((await call('me', null, owner)).data.gm, true, 'panel owner counts as GM');

    // A client claiming isGM:true gets a normal message.
    await call('chat/messages', { author: 'Player', text: 'ben GM miyim', isGM: true }, player);
    await call('chat/messages', { author: 'Owner', text: 'sahip burada' }, owner);
    const chat = (await call('chat/messages', null, owner)).data;
    assert.equal(chat.find((m) => m.text === 'ben GM miyim').isGM, false);
    assert.equal(chat.find((m) => m.text === 'sahip burada').isGM, true);

    // Only the owner can grant GM; it is audited and removable.
    const grantBody = { id: 3, gm: true, reason: 'ekip uyesi' };
    assert.equal((await call('admin/account/gm', grantBody, player)).status, 403);
    assert.equal((await call('admin/account/gm', grantBody, helper)).status, 403);
    assert.equal((await call('admin/account/gm', { ...grantBody, reason: '' }, owner)).status, 400);
    assert.equal((await call('admin/account/gm', { ...grantBody, id: 1 }, owner)).status, 400);
    assert.equal((await call('admin/account/gm', grantBody, owner)).status, 200);
    assert.equal((await call('me', null, helper)).data.gm, true);
    assert.equal((await call('admin/account?id=3', null, owner)).data.gm, true);
    await call('chat/messages', { author: 'Helper', text: 'gm mesaji' }, helper);
    assert.equal((await call('chat/messages', null, owner)).data.find((m) => m.text === 'gm mesaji').isGM, true);
    assert.equal(db.prepare("SELECT COUNT(*) n FROM admin_audit WHERE action LIKE '%account/gm%'").get().n, 1);
    assert.equal((await call('admin/account/gm', { id: 3, gm: false, reason: 'ekipten cikti' }, owner)).status, 200);
    assert.equal((await call('me', null, helper)).data.gm, false);

    // Deleting a GM account leaves no row behind.
    await call('admin/account/gm', grantBody, owner);
    assert.equal((await call('account/delete', { password }, helper)).status, 200);
    assert.equal(db.prepare('SELECT COUNT(*) n FROM gm_accounts WHERE account=3').get().n, 0);
    db.close();
  } finally { await api.close(); }
});
