import React, { useState } from 'react';
import { ask } from './dialog';

const when = (n) => (n ? new Date(n).toLocaleString('tr-TR') : '—');
const summary = (i = {}) => [i.diamonds && `${i.diamonds} elmas`, i.gold && `${i.gold} altın`, ...(i.vouchers || []).map((v) => `${v.count || 1}× ${v.tier} ${v.hours}sa kupon`), ...(i.scrolls || []).map((s) => `${s.count}× T${s.tier} parşömen`)].filter(Boolean).join(', ') || 'yalnızca mesaj';

// Oyuncu postası: hediye ve duyuru gönder. Oyuncu bir sonraki girişte posta kutusundan alır.
export default function Gifts({ payload, api, busy, run, reload }) {
  const limits = payload?.limits || { user: {}, all: {} };
  const [f, setF] = useState({ target: 'user', name: '', title: '', body: '', diamonds: '', gold: '', voucherTier: '', voucherHours: '24', scrollTier: '', scrollCount: '1', expireDays: '30', reason: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const lim = limits[f.target] || {};
  const items = () => ({
    diamonds: Number(f.diamonds) || 0,
    gold: Number(f.gold) || 0,
    vouchers: f.voucherTier ? [{ tier: f.voucherTier, hours: Number(f.voucherHours) || 24, count: 1 }] : [],
    scrolls: f.scrollTier ? [{ tier: Number(f.scrollTier), count: Number(f.scrollCount) || 1 }] : [],
  });
  const send = () => run(async () => {
    const body = { target: f.target, name: f.name, title: f.title, body: f.body, expireDays: Number(f.expireDays) || 30, reason: f.reason, ...items() };
    const who = f.target === 'all' ? 'TÜM oyunculara' : `${f.name} hesabına`;
    if (f.target === 'all') {
      const typed = await ask({ title: `Hediye ${who} gönderilecek: ${summary(body)}`, text: 'Onaylamak için HERKES yaz.', input: { label: 'Onay', min: 6 }, tone: 'danger' });
      if (typed !== 'HERKES') return;
      body.confirm = 'HERKES';
    } else if (!(await ask({ title: `${who} gönderilsin mi?`, text: summary(body) }))) return;
    await api('admin/mail/send', body);
    setF({ ...f, title: '', body: '', diamonds: '', gold: '', voucherTier: '', scrollTier: '' });
    await reload();
  });
  return (
    <>
      <section className="card">
        <h3>Hediye / mesaj gönder</h3>
        <p className="muted">Oyuncu postayı oyunda üstteki zarf simgesinden açar. Çekiliş kazananlarına ödül vermek için kullan. Tek seferlik üst sınır: {Number(lim.diamonds || 0).toLocaleString('tr-TR')} elmas, {Number(lim.gold || 0).toLocaleString('tr-TR')} altın.</p>
        <label>Kime<select value={f.target} onChange={set('target')}><option value="user">Tek oyuncu</option><option value="all">Herkes (sınırlar daha düşük)</option></select></label>
        {f.target === 'user' && <label>Kullanıcı adı<input value={f.name} onChange={set('name')} placeholder="oyuncu adı" /></label>}
        <label>Başlık<input value={f.title} maxLength={80} onChange={set('title')} placeholder="Örn. Çekiliş ödülün" /></label>
        <label>Mesaj<textarea rows={3} value={f.body} maxLength={600} onChange={set('body')} /></label>
        <div className="cards">
          <label>Elmas<input type="number" min="0" value={f.diamonds} onChange={set('diamonds')} /></label>
          <label>Altın<input type="number" min="0" value={f.gold} onChange={set('gold')} /></label>
          <label>Premium kuponu<select value={f.voucherTier} onChange={set('voucherTier')}><option value="">Yok</option><option value="mythic">Mythic</option><option value="apex">Apex</option></select></label>
          <label>Kupon süresi (saat)<input type="number" min="1" max="720" value={f.voucherHours} onChange={set('voucherHours')} /></label>
          <label>Yükseltme parşömeni<select value={f.scrollTier} onChange={set('scrollTier')}><option value="">Yok</option>{[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>T{n}</option>)}</select></label>
          <label>Parşömen adedi<input type="number" min="1" value={f.scrollCount} onChange={set('scrollCount')} /></label>
          <label>Posta kaç gün durur<input type="number" min="1" max="90" value={f.expireDays} onChange={set('expireDays')} /></label>
        </div>
        <label>İşlem açıklaması (günlüğe yazılır)<input value={f.reason} onChange={set('reason')} placeholder="Örn. Instagram çekilişi kazananı" /></label>
        <button className="primary" disabled={busy || f.title.trim().length < 2 || f.reason.trim().length < 3 || (f.target === 'user' && !f.name.trim())} onClick={send}>Gönder</button>
      </section>
      <section className="card">
        <h3>Son gönderilen postalar</h3>
        {(payload?.recent || []).length === 0 ? <p className="muted">Henüz posta gönderilmedi.</p> : <table><thead><tr><th>Tarih</th><th>Oyuncu</th><th>Başlık</th><th>İçerik</th><th>Durum</th></tr></thead><tbody>{payload.recent.map((m) => <tr key={m.id}><td>{when(m.created_at)}</td><td>{m.name}</td><td>{m.title}</td><td>{summary(m.items)}</td><td>{m.claimed_at ? 'alındı' : 'bekliyor'}</td></tr>)}</tbody></table>}
      </section>
    </>
  );
}
