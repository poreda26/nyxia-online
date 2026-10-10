import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApi } from '../server/app.mjs';

test('support tickets: public create/view/reply with a secret key, owner-only answers, limits', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'nyxia-tickets-'));
  const site = 'https://nyxiaonline.com';
  const panel = 'https://panel.nyxiaonline.com';
  const mails = [];
  const api = createApi({
    database: join(dir, 'test.sqlite'), origin: panel, extraOrigins: [site], secure: false,
    authOptions: { mailer: { configured: true, send: async (mail) => { mails.push(mail); } }, notifyEmail: 'staff@example.com' },
  });
  await new Promise((resolve) => api.server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${api.server.address().port}`;
  const call = async (path, { method = 'GET', body, origin = site, cookie } = {}) => {
    const r = await fetch(`${url}/api/${path}`, { method, headers: { Origin: origin, 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: r.status, body: await r.json().catch(() => ({})), cookie: r.headers.get('set-cookie')?.split(';')[0] };
  };
  const valid = { email: 'Player@Example.com', username: 'Tester_1', category: 'bug', subject: 'Boss ödülü gelmedi', message: 'Dün boss kestim ama sandık gelmedi, yardım eder misiniz?' };
  try {
    // Needs no login and no client build header (the site is not the game client).
    const created = await call('support/tickets', { method: 'POST', body: valid });
    assert.equal(created.status, 200);
    assert.match(created.body.code, /^NX-[A-Z2-9]{6}$/);
    assert.match(created.body.key, /^[a-f0-9]{24}$/);
    assert.equal(mails.length, 2, 'the player and the staff mailbox are notified');
    assert.match(mails[0].text, /ticket\.html\?c=NX-/);
    assert.equal(mails[0].to, 'player@example.com');

    // Bad input and bots.
    assert.equal((await call('support/tickets', { method: 'POST', body: { ...valid, email: 'nope' } })).status, 400);
    assert.equal((await call('support/tickets', { method: 'POST', body: { ...valid, subject: 'a' } })).status, 400);
    assert.equal((await call('support/tickets', { method: 'POST', body: { ...valid, message: 'kısa' } })).status, 400);
    const bot = await call('support/tickets', { method: 'POST', body: { ...valid, email: 'bot@example.com', website: 'http://spam' } });
    assert.equal(bot.status, 200);
    assert.equal(db(dir).prepare('SELECT COUNT(*) n FROM tickets').get().n, 1, 'the honeypot ticket is not stored');

    // Reading needs the right code AND key.
    const { code, key } = created.body;
    const seen = await call('support/tickets/view', { method: 'POST', body: { code, key } });
    assert.equal(seen.status, 200);
    assert.deepEqual([seen.body.status, seen.body.messages.length, seen.body.messages[0].author], ['open', 1, 'user']);
    assert.equal(seen.body.email, undefined, 'the email never goes back out');
    assert.equal((await call('support/tickets/view', { method: 'POST', body: { code, key: '0'.repeat(24) } })).status, 404);
    assert.equal((await call('support/tickets/view', { method: 'POST', body: { code: 'NX-ZZZZZZ', key } })).status, 404);

    // Player reply.
    const replied = await call('support/tickets/reply', { method: 'POST', body: { code, key, message: 'Ekran görüntüsü yok ama saat 21:00 civarıydı.' } });
    assert.equal(replied.status, 200);
    assert.equal(replied.body.messages.length, 2);

    // Owner answers from the panel; others cannot.
    const register = async (name) => (await call('register', { method: 'POST', origin: panel, body: { name, password: 'long-test-password-123' } }));
    const ownerLogin = await register('boss_owner');
    const normal = await register('normal_user');
    db(dir).exec("INSERT INTO panel_owner(singleton, account) SELECT 1, id FROM accounts WHERE name='boss_owner'");
    const asNormal = await call('admin/tickets', { origin: panel, cookie: normal.cookie });
    assert.equal(asNormal.status, 403);
    const list = await call('admin/tickets', { origin: panel, cookie: ownerLogin.cookie });
    assert.equal(list.status, 200);
    assert.equal(list.body.counts.open, 1);
    const id = list.body.items[0].id;
    assert.equal((await call('admin/ticket?id=' + id, { origin: panel, cookie: ownerLogin.cookie })).body.email, 'player@example.com');
    const answered = await call('admin/ticket/reply', { method: 'POST', origin: panel, cookie: ownerLogin.cookie, body: { id, message: 'Kaydı inceledik, sandığını yeniden gönderdik.' } });
    assert.equal(answered.status, 200);
    assert.equal(answered.body.status, 'answered');
    assert.match(mails.at(-1).text, /yanıt verdik/);
    assert.equal(mails.at(-1).to, 'player@example.com');
    const afterAnswer = await call('support/tickets/view', { method: 'POST', body: { code, key } });
    assert.deepEqual(afterAnswer.body.messages.map((m) => m.author), ['user', 'user', 'staff']);

    // Closing, then the player writes again: it reopens.
    await call('admin/ticket/reply', { method: 'POST', origin: panel, cookie: ownerLogin.cookie, body: { id, message: 'Sorun çözüldü, kapatıyorum.', close: true } });
    assert.equal((await call('support/tickets/view', { method: 'POST', body: { code, key } })).body.status, 'closed');
    const reopened = await call('support/tickets/reply', { method: 'POST', body: { code, key, message: 'Tekrar oldu, bir daha bakar mısınız?' } });
    assert.equal(reopened.body.status, 'open');
    assert.equal((await call('admin/tickets', { origin: panel, cookie: ownerLogin.cookie })).body.counts.open, 1);

    // Per-email limit: 3 tickets an hour.
    for (let i = 0; i < 2; i++) assert.equal((await call('support/tickets', { method: 'POST', body: { ...valid, subject: 'Başka konu ' + i } })).status, 200);
    assert.equal((await call('support/tickets', { method: 'POST', body: { ...valid, subject: 'Dördüncü' } })).status, 429);

    // The overview shows the open count for the panel.
    assert.equal((await call('admin/overview', { origin: panel, cookie: ownerLogin.cookie })).body.openTickets, 3);

    // A foreign browser origin is refused.
    assert.equal((await call('support/tickets', { method: 'POST', origin: 'https://evil.example', body: valid })).status, 403);
  } finally { await api.close(); }

  function db(directory) { return new DatabaseSync(join(directory, 'test.sqlite')); }
});
