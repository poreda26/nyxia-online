import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApi } from '../server/app.mjs';
import { createCharacter } from '../server/game-logic.generated.mjs';

const password = 'long-test-password-123';

test('owner tools: mail gifts, announcements, maintenance, moderator role, stats and account recovery', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'nyxia-ops-'));
  const file = join(dir, 'test.sqlite');
  const origin = 'http://test.local';
  const mails = [];
  const api = createApi({ database: file, origin, secure: false, authOptions: { mailer: { configured: true, send: async (mail) => { mails.push(mail); } } } });
  await new Promise((r) => api.server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${api.server.address().port}/api/`;
  const call = async (path, body, cookie, method = body ? 'POST' : 'GET') => {
    const r = await fetch(base + path, { method, headers: { Origin: origin, 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: r.status, data: await r.json().catch(() => ({})), cookie: r.headers.get('set-cookie')?.split(';')[0] };
  };
  const db = new DatabaseSync(file);
  const register = async (name) => (await call('register', { name, password })).cookie;
  try {
    const ownerCookie = await register('boss');
    const playerCookie = await register('player');
    const modCookie = await register('helper');
    const id = (name) => db.prepare('SELECT id FROM accounts WHERE name=?').get(name).id;
    db.prepare('INSERT INTO panel_owner(singleton,account) VALUES(1,?)').run(id('boss'));
    db.prepare('INSERT INTO economy_accounts VALUES(?,?)').run(id('player'), Date.now());
    const data = { characters: [{ ...createCharacter('warrior', 'human', 'Hero'), id: 'hero' }, null, null], bank: [[], []], bankGold: 0, diamonds: 0 };
    assert.equal((await call('backup', { revision: 0, data }, playerCookie, 'PUT')).status, 200);
    const admin = (path, body) => call('admin/' + path, body, ownerCookie);
    const act = (type, payload = {}) => call('game/act', { characterKey: 'hero', type, payload }, playerCookie);

    // Announcement and maintenance are public through /api/status
    assert.deepEqual((await call('status')).data, { announcement: null, maintenance: null });
    assert.equal((await admin('announce/set', { tr: 'Bu akşam bakım', en: 'Maintenance tonight', level: 'warn', hours: 2, reason: 'test' })).status, 200);
    assert.equal((await call('status')).data.announcement.en, 'Maintenance tonight');
    assert.equal((await admin('announce/clear', { reason: 'test' })).status, 200);
    assert.equal((await call('status')).data.announcement, null);

    // Gifts: limits, confirmation for everyone, delivery through the mailbox
    const gift = { target: 'user', name: 'player', title: 'Çekiliş ödülü', body: 'Tebrikler', diamonds: 100, gold: 5000, vouchers: [{ tier: 'mythic', hours: 2, count: 1 }], scrolls: [{ tier: 1, count: 2 }], reason: 'çekiliş' };
    assert.equal((await admin('mail/send', { ...gift, diamonds: 20000 })).status, 400, 'a single gift has an upper limit');
    assert.equal((await admin('mail/send', { ...gift, target: 'all', diamonds: 2000 })).status, 400, 'a gift for everyone has a lower limit');
    assert.equal((await admin('mail/send', { ...gift, target: 'all', diamonds: 10 })).status, 400, 'a gift for everyone needs confirmation');
    assert.equal((await admin('mail/send', { ...gift, name: 'nobody' })).status, 404);
    assert.equal((await call('admin/mail/send', gift, playerCookie)).status, 403, 'players cannot send gifts');
    assert.equal((await admin('mail/send', gift)).data.sent, 1);
    const inbox = (await call('mail', null, playerCookie)).data;
    assert.equal(inbox.unread, 1);
    const mailId = inbox.items[0].id;
    const before = (await call('wallet', null, playerCookie)).data.diamonds;
    const goldBefore = (await call('backup', null, playerCookie)).data.data.characters[0].gold;
    const claimed = await act('mail/claim', { mailId });
    assert.equal(claimed.data.result.ok, true);
    assert.equal((await call('wallet', null, playerCookie)).data.diamonds, before + 100);
    assert.equal(claimed.data.patch.gold, goldBefore + 5000);
    const voucher = claimed.data.patch.inventory.find((i) => i.kind === 'premiumVoucher');
    assert.deepEqual([voucher.premiumTier, voucher.durationMs, voucher.noTrade], ['mythic', 7200000, true]);
    assert.equal((await act('mail/claim', { mailId })).data.result.reason, 'alreadyClaimed');
    assert.equal((await call('mail', null, playerCookie)).data.unread, 0);
    assert.equal((await admin('mail/send', { target: 'all', title: 'Hoş geldin', body: 'Herkese', diamonds: 10, confirm: 'HERKES', reason: 'duyuru' })).data.sent, 3);
    assert.equal((await call('mail', null, modCookie)).data.unread, 1);

    // Maintenance blocks players but not the owner
    assert.equal((await admin('maintenance/set', { on: true, reason: 'test' })).status, 200);
    assert.equal((await call('mail', null, playerCookie)).status, 503);
    assert.equal((await call('mail', null, ownerCookie)).status, 200);
    assert.deepEqual(Object.keys((await call('status')).data.maintenance), ['tr', 'en']);
    assert.equal((await admin('maintenance/set', { on: false, reason: 'test' })).status, 200);
    assert.equal((await call('mail', null, playerCookie)).status, 200);

    // Minimum client build can be changed from the panel
    assert.equal((await admin('minbuild/set', { build: 999, reason: 'test' })).status, 200);
    assert.equal((await call('mail', null, playerCookie)).status, 426);
    assert.equal((await admin('minbuild/set', { build: 0, reason: 'test' })).status, 200);

    // Moderators: limited rights
    assert.equal((await call('admin/accounts', null, modCookie)).status, 403, 'not a moderator yet');
    assert.equal((await admin('staff/set', { id: id('helper'), role: 'mod', reason: 'yardımcı' })).status, 200);
    assert.equal((await call('admin/accounts', null, modCookie)).status, 200);
    assert.equal((await call('admin/account/mute', { id: id('player'), muted: true, hours: 1, reason: 'spam' }, modCookie)).status, 200);
    assert.equal((await call('admin/stats', null, modCookie)).status, 403);
    assert.equal((await call('admin/mail/send', gift, modCookie)).status, 403);
    assert.equal((await call('admin/account/block', { id: id('player'), blocked: true, reason: 'x' }, modCookie)).status, 403);
    assert.equal((await call('admin/staff/set', { id: id('player'), role: 'mod', reason: 'x' }, modCookie)).status, 403);
    assert.equal((await call('admin/overview', null, modCookie)).data.role, 'mod');

    // Stats and health
    const stats = (await call('admin/stats', null, ownerCookie)).data;
    assert.equal(stats.totals.accounts, 3);
    assert.equal(stats.signups.length, 14);
    assert.ok(stats.health.uptimeSec >= 0 && stats.health.mailConfigured === true);

    // Account recovery: temporary password, email, age lock
    const temp = (await admin('account/temp-password', { id: id('player'), reason: 'unuttu' })).data.password;
    assert.ok(temp.length >= 14);
    assert.equal((await call('login', { name: 'player', password: temp, force: true })).status, 200);
    assert.equal((await call('login', { name: 'player', password })).status, 401, 'the old password stops working');
    assert.equal((await admin('account/email', { id: id('player'), email: 'Player@Example.com', reason: 'destek' })).data.email, 'player@example.com');
    assert.equal((await admin('account/email', { id: id('helper'), email: 'player@example.com', reason: 'destek' })).status, 409);
    assert.equal((await admin('account/birth', { id: id('player'), birthDate: '2020-01-01', reason: 'test' })).data.locked, true);
    assert.equal((await admin('tools')).data.ageLocked.length, 1);
    assert.equal((await admin('account/birth', { id: id('player'), birthDate: '1995-05-05', reason: 'yanlış tarih' })).data.locked, false);
    assert.equal((await admin('tools')).data.ageLocked.length, 0);

    // Announcement email: only opted-in adults with a verified email
    assert.equal((await admin('marketing')).data.eligible, 0);
    db.prepare('UPDATE accounts SET marketing_optin=1 WHERE id=?').run(id('player'));
    assert.equal((await admin('marketing')).data.eligible, 1);
    assert.equal((await admin('marketing/send', { subject: 'Yeni güncelleme', text: 'Merhaba, yeni güncelleme yayında.', reason: 'duyuru' })).status, 400, 'needs confirmation');
    const sent = await admin('marketing/send', { subject: 'Yeni güncelleme', text: 'Merhaba, yeni güncelleme yayında.', confirm: 'GONDER', reason: 'duyuru' });
    assert.deepEqual([sent.data.sent, sent.data.remaining], [1, 0]);
    assert.equal(mails.at(-1).to, 'player@example.com');
    assert.match(mails.at(-1).text, /duyuru izni/);
    assert.equal((await admin('marketing/continue', { campaign: sent.data.campaign, reason: 'devam' })).data.sent, 0, 'nobody is mailed twice');

    // Deleting an account removes its mail
    const playerId = id('player');
    assert.ok(db.prepare('SELECT COUNT(*) n FROM mail WHERE account=?').get(playerId).n > 0);
    assert.equal((await call('account/delete', { password: temp }, (await call('login', { name: 'player', password: temp, force: true })).cookie)).status, 200);
    assert.equal(db.prepare('SELECT COUNT(*) n FROM mail WHERE account=?').get(playerId).n, 0);

    // Everything the owner does is audited
    assert.ok((await admin('audit')).data.length >= 12);
  } finally { api.server.close(); }
});
