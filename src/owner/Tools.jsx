import React, { useState } from 'react';
import { ask } from './dialog';

const when = (n) => (n ? new Date(n).toLocaleString('tr-TR') : '—');

// Yetkililer (moderatör) ve yaş yüzünden kilitli hesaplar.
export default function Tools({ payload, api, busy, run, reload }) {
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const staff = payload?.staff || [];
  const locked = payload?.ageLocked || [];
  const setRole = (id, role, label) => run(async () => {
    const why = reason.trim().length >= 3 ? reason.trim() : await ask({ title: label, input: { label: 'Gerekçe', placeholder: 'Örn. Discord moderatörü' } });
    if (!why) return;
    await api('admin/staff/set', { id, role, reason: why });
    setName('');
    await reload();
  });
  const addMod = () => run(async () => {
    const found = (await api(`admin/accounts?q=${encodeURIComponent(name.trim())}&offset=0`)).find((a) => a.name === name.trim().toLowerCase());
    if (!found) throw new Error('Bu kullanıcı adında hesap bulunamadı.');
    await setRole(found.id, 'mod', `${found.name} moderatör olsun mu?`);
  });
  const fixBirth = (row) => run(async () => {
    const date = await ask({ title: `${row.name}: doğru doğum tarihi`, text: 'Biçim: YYYY-AA-GG (örn. 2005-03-14). 13 yaşın altındaysa hesap kilitli kalır.', input: { label: 'Doğum tarihi', min: 10 } });
    if (!date) return;
    const why = await ask({ title: 'İşlem gerekçesi', input: { label: 'Gerekçe', placeholder: 'Örn. oyuncu yanlış tarih girdi, destek talebi NX-…' } });
    if (!why) return;
    await api('admin/account/birth', { id: row.id, birthDate: date, reason: why });
    await reload();
  });
  return (
    <>
      <section className="card">
        <h3>Yetkililer (moderatör)</h3>
        <p className="muted">Moderatör: panele girer; sohbeti denetler, mesaj siler, oyuncuyu susturur, şikayetleri sonuçlandırır ve destek taleplerini yanıtlar. Elmas, kayıt düzenleme, ban, hediye ve ayarlara erişemez.</p>
        <div className="toolbar">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="kullanıcı adı" aria-label="Kullanıcı adı" />
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="gerekçe (isteğe bağlı)" aria-label="Gerekçe" />
          <button className="primary" disabled={busy || name.trim().length < 3} onClick={addMod}>Moderatör yap</button>
        </div>
        {staff.length === 0 ? <p className="muted">Henüz moderatör yok.</p> : <table><thead><tr><th>Hesap</th><th>Rol</th><th>Eklenme</th><th /></tr></thead><tbody>{staff.map((s) => <tr key={s.id}><td>{s.name}</td><td>{s.role}</td><td>{when(s.granted_at)}</td><td><button disabled={busy} onClick={() => setRole(s.id, null, `${s.name} yetkisi kaldırılsın mı?`)}>Yetkiyi kaldır</button></td></tr>)}</tbody></table>}
      </section>
      <section className="card">
        <h3>Yaş yüzünden kilitli hesaplar</h3>
        <p className="muted">13 yaşın altında doğum tarihi giren eski hesaplar kilitlenir. Oyuncu yanlış girdiğini kanıtlarsa buradan düzeltebilirsin.</p>
        {locked.length === 0 ? <p className="muted">Kilitli hesap yok.</p> : <table><thead><tr><th>Hesap</th><th>Girilen tarih</th><th /></tr></thead><tbody>{locked.map((r) => <tr key={r.id}><td>{r.name}</td><td>{r.birth_date}</td><td><button disabled={busy} onClick={() => fixBirth(r)}>Tarihi düzelt</button></td></tr>)}</tbody></table>}
      </section>
    </>
  );
}
