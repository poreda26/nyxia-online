import React from 'react';
import { ask } from './dialog';

// Oyuncu hesabı kurtarma araçları (yalnızca sahip): e-posta değiştir, geçici şifre ver, doğum tarihini düzelt.
export default function RecoveryTools({ value: v, busy, run, api, reload }) {
  const why = (title) => ask({ title, input: { label: 'Gerekçe', placeholder: 'Örn. destek talebi NX-…' } });
  const setEmail = () => run(async () => {
    const email = await ask({ title: `${v.name}: yeni e-posta`, text: 'Bu adres doğrulanmış kabul edilir; oyuncunun ona erişebildiğinden emin ol.', input: { label: 'E-posta', min: 5 } });
    if (!email) return;
    const reason = await why('İşlem gerekçesi');
    if (!reason) return;
    await api('admin/account/email', { id: v.id, email, reason });
    await reload();
  });
  const clearEmail = () => run(async () => {
    if (!(await ask({ title: `${v.name} hesabının e-postası silinsin mi?`, tone: 'danger' }))) return;
    const reason = await why('İşlem gerekçesi');
    if (!reason) return;
    await api('admin/account/email/clear', { id: v.id, reason });
  });
  const tempPassword = () => run(async () => {
    if (!(await ask({ title: `${v.name} için geçici şifre verilsin mi?`, text: 'Eski şifre geçersiz olur ve açık oturumlar kapanır. Şifreyi yalnızca bir kez göreceksin; oyuncuya güvenli bir yoldan ilet.', tone: 'danger' }))) return;
    const reason = await why('İşlem gerekçesi');
    if (!reason) return;
    const out = await api('admin/account/temp-password', { id: v.id, reason });
    await ask({ title: `Geçici şifre: ${out.password}`, text: 'Bu pencereyi kapatınca şifre bir daha gösterilmez. Oyuncu girişten sonra Ayarlar bölümünden e-postayla yeni şifre belirleyebilir.', confirmLabel: 'Kopyaladım' });
  });
  const birth = () => run(async () => {
    const date = await ask({ title: `${v.name}: doğum tarihi (YYYY-AA-GG)`, input: { label: 'Doğum tarihi', min: 10 } });
    if (!date) return;
    const reason = await why('İşlem gerekçesi');
    if (!reason) return;
    await api('admin/account/birth', { id: v.id, birthDate: date, reason });
  });
  return (
    <section className="card">
      <h3>Hesap kurtarma araçları</h3>
      <p className="muted">E-postasını kaybeden ya da yanlış doğum tarihi giren oyunculara destek için. Her işlem gerekçesiyle işlem geçmişine yazılır.</p>
      <div className="toolbar">
        <button disabled={busy} onClick={setEmail}>E-postayı değiştir</button>
        <button disabled={busy} onClick={clearEmail}>E-postayı sil</button>
        <button disabled={busy} className="danger" onClick={tempPassword}>Geçici şifre ver</button>
        <button disabled={busy} onClick={birth}>Doğum tarihini düzelt</button>
      </div>
    </section>
  );
}
