import React, { useState } from 'react';
import { ask } from './dialog';

// Duyuru çubuğu, bakım modu ve en düşük istemci sürümü.
export default function Announce({ payload, api, busy, run, reload }) {
  const a = payload?.announcement;
  const m = payload?.maintenance;
  const [reason, setReason] = useState('');
  const [ann, setAnn] = useState({ tr: a?.tr || '', en: a?.en || '', level: a?.level || 'info', hours: '24' });
  const [maint, setMaint] = useState({ tr: m?.tr || 'Kısa bir bakım yapıyoruz. Birazdan tekrar dene.', en: m?.en || 'We are doing a short maintenance. Please try again shortly.' });
  const [build, setBuild] = useState(String(payload?.minBuild ?? 0));
  const [url, setUrl] = useState(payload?.updateUrl || '');
  const ok = reason.trim().length >= 3;
  const post = (path, body, confirm) => run(async () => {
    if (confirm && !(await ask({ title: confirm.title, text: confirm.text, tone: confirm.tone }))) return;
    await api('admin/' + path, { ...body, reason });
    await reload();
  });
  return (
    <>
      <section className="card">
        <h3>İşlem açıklaması</h3>
        <p className="muted">Aşağıdaki her işlem işlem geçmişine bu açıklamayla yazılır.</p>
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Örn. Cuma akşamı bakım duyurusu" aria-label="İşlem açıklaması" />
      </section>
      <section className="card">
        <h3>Duyuru çubuğu {a && <span className="badge">yayında</span>}</h3>
        <p className="muted">Oyuncuların ekranının üstünde (giriş ekranı dahil) görünür. Oyuncu kapatabilir.</p>
        <label>Türkçe<textarea rows={2} maxLength={300} value={ann.tr} onChange={(e) => setAnn({ ...ann, tr: e.target.value })} /></label>
        <label>İngilizce<textarea rows={2} maxLength={300} value={ann.en} onChange={(e) => setAnn({ ...ann, en: e.target.value })} /></label>
        <label>Önem<select value={ann.level} onChange={(e) => setAnn({ ...ann, level: e.target.value })}><option value="info">Bilgi</option><option value="warn">Uyarı</option></select></label>
        <label>Kaç saat yayında kalsın (0 = elle kaldırana kadar)<input type="number" min="0" max="1440" value={ann.hours} onChange={(e) => setAnn({ ...ann, hours: e.target.value })} /></label>
        <div className="toolbar">
          <button className="primary" disabled={busy || !ok || (!ann.tr.trim() && !ann.en.trim())} onClick={() => post('announce/set', { ...ann, hours: Number(ann.hours) || 0 })}>Yayınla</button>
          <button disabled={busy || !ok || !a} onClick={() => post('announce/clear', {})}>Duyuruyu kaldır</button>
        </div>
      </section>
      <section className="card">
        <h3>Bakım modu {m?.on && <span className="badge open">AÇIK</span>}</h3>
        <p className="muted">Açıkken oyuncular oyundan çıkar ve bakım ekranını görür. Sen ve moderatörler panele girmeye devam eder.</p>
        <label>Türkçe mesaj<textarea rows={2} maxLength={300} value={maint.tr} onChange={(e) => setMaint({ ...maint, tr: e.target.value })} /></label>
        <label>İngilizce mesaj<textarea rows={2} maxLength={300} value={maint.en} onChange={(e) => setMaint({ ...maint, en: e.target.value })} /></label>
        <div className="toolbar">
          {!m?.on
            ? <button className="danger" disabled={busy || !ok} onClick={() => post('maintenance/set', { on: true, ...maint }, { title: 'Bakım modu açılsın mı?', text: 'Tüm oyuncular oyundan çıkar.', tone: 'danger' })}>Bakım modunu aç</button>
            : <button className="primary" disabled={busy || !ok} onClick={() => post('maintenance/set', { on: false, ...maint })}>Bakım modunu kapat</button>}
        </div>
      </section>
      <section className="card">
        <h3>En düşük istemci sürümü</h3>
        <p className="muted">Bu numaradan eski uygulamalar "güncelleme gerekli" ekranını görür. Yeni sürümü mağazada yayınlamadan YÜKSELTME. 0 = denetim kapalı.</p>
        <label>En düşük sürüm<input type="number" min="0" max="9999" value={build} onChange={(e) => setBuild(e.target.value)} /></label>
        <label>Güncelleme bağlantısı (isteğe bağlı)<input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://play.google.com/store/apps/details?id=com.nyxiaonline.game" /></label>
        <button className="danger" disabled={busy || !ok} onClick={() => post('minbuild/set', { build: Number(build), url }, { title: `En düşük sürüm ${build} olsun mu?`, text: 'Daha eski uygulamalar oyuna giremez.', tone: 'danger' })}>Kaydet</button>
      </section>
    </>
  );
}
