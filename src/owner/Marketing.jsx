import React, { useState } from 'react';
import { ask } from './dialog';

const when = (n) => (n ? new Date(n).toLocaleString('tr-TR') : '—');

// Duyuru e-postası: yalnızca duyuru izni veren, e-postası doğrulanmış 18+ oyunculara. Her e-postada izni kapatma bilgisi olur.
export default function Marketing({ payload, api, busy, run, reload }) {
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [reason, setReason] = useState('');
  const [result, setResult] = useState(null);
  const eligible = payload?.eligible ?? 0;
  const send = () => run(async () => {
    const typed = await ask({ title: `"${subject}" e-postası ${eligible} oyuncuya gönderilsin mi?`, text: 'Resend ücretsiz planda günde 100 e-posta sınırı vardır; fazlası ertesi gün "Devam et" ile gönderilir. Onaylamak için GONDER yaz.', input: { label: 'Onay', min: 6 }, tone: 'danger' });
    if (typed !== 'GONDER') return;
    setResult(await api('admin/marketing/send', { subject, text, confirm: 'GONDER', reason, limit: 80 }));
    await reload();
  });
  const more = () => run(async () => { setResult(await api('admin/marketing/continue', { campaign: result.campaign, reason: reason || 'devam', limit: 80 })); await reload(); });
  const exportCsv = () => run(async () => {
    const rows = await api('admin/marketing/export');
    const csv = 'kullanici,eposta\n' + rows.map((r) => `${r.name},${r.email}`).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a'); link.href = url; link.download = 'duyuru-izinli-eposta.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  return (
    <>
      <section className="card">
        <h3>Duyuru e-postası</h3>
        <p className="muted">Gönderilecek kişi sayısı: <strong>{eligible}</strong> (duyuru izni veren, e-postası doğrulanmış, 18 yaş ve üstü). E-posta gönderimi: <span className="badge">{payload?.mailConfigured ? 'açık' : 'kapalı'}</span></p>
        <label>Konu<input value={subject} maxLength={120} onChange={(e) => setSubject(e.target.value)} placeholder="Nyxia Online: yeni güncelleme yayında" /></label>
        <label>Metin (Türkçe ve İngilizce birlikte yazabilirsin)<textarea rows={8} maxLength={3000} value={text} onChange={(e) => setText(e.target.value)} /></label>
        <label>İşlem açıklaması<input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Örn. 1.1 güncelleme duyurusu" /></label>
        <div className="toolbar">
          <button className="danger" disabled={busy || !payload?.mailConfigured || eligible === 0 || subject.trim().length < 3 || text.trim().length < 10 || reason.trim().length < 3} onClick={send}>Gönder</button>
          <button disabled={busy} onClick={exportCsv}>İzinli listeyi indir (CSV)</button>
        </div>
        {result && <p>Sonuç: <strong>{result.sent}</strong> gönderildi, {result.failed} başarısız, <strong>{result.remaining}</strong> kaldı. {result.remaining > 0 && <button disabled={busy} onClick={more}>Devam et</button>}</p>}
        <p className="muted">Her e-postanın altına "duyuru izni verdiğin için aldın, Ayarlar → Hesap'tan kapatabilirsin" notu otomatik eklenir. İzin vermeyen ve 18 yaş altı oyunculara hiç gönderilmez.</p>
      </section>
      <section className="card">
        <h3>Geçmiş gönderimler</h3>
        {(payload?.campaigns || []).length === 0 ? <p className="muted">Henüz gönderim yok.</p> : <table><thead><tr><th>Tarih</th><th>Konu</th><th>Gönderilen</th></tr></thead><tbody>{payload.campaigns.map((c) => <tr key={c.id}><td>{when(c.created_at)}</td><td>{c.subject}</td><td>{c.sent}</td></tr>)}</tbody></table>}
      </section>
    </>
  );
}
