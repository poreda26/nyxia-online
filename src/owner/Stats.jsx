import React from 'react';

const fmt = (n) => Number(n || 0).toLocaleString('tr-TR');
const bytes = (n) => (n == null ? '—' : n > 1e9 ? (n / 1e9).toFixed(2) + ' GB' : n > 1e6 ? (n / 1e6).toFixed(1) + ' MB' : (n / 1e3).toFixed(0) + ' KB');
const when = (n) => (n ? new Date(n).toLocaleString('tr-TR') : '—');
const dur = (s) => `${Math.floor(s / 86400)}g ${Math.floor((s % 86400) / 3600)}s ${Math.floor((s % 3600) / 60)}dk`;

function Bars({ rows, value, label }) {
  const max = Math.max(1, ...rows.map(value));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 90, marginTop: 8 }}>
      {rows.map((r) => (
        <div key={r.day} title={`${r.day}: ${label(r)}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
          <small style={{ fontSize: 9 }}>{value(r) || ''}</small>
          <div style={{ width: '100%', minHeight: 2, height: `${(value(r) / max) * 66}px`, background: '#8B6FC9', borderRadius: 3 }} />
        </div>
      ))}
    </div>
  );
}

// İstatistik panosu: oyuncu sayıları, kayıtlar, reklam, ekonomi, yaş grupları, sunucu sağlığı, izleme ve satın almalar.
export default function Stats({ payload: s }) {
  if (!s?.totals) return null;
  const t = s.totals;
  const cards = [['Kayıtlı hesap', t.accounts], ['Son 24 saat aktif', t.active24h], ['Son 7 gün aktif', t.active7d], ['Şu an çevrimiçi (5 dk)', t.online5m], ['Klan', t.clans], ['Aktif premium', t.premiumActive], ['Dolaşımdaki elmas', t.diamondsInCirculation], ['Duyuru izni verenler', t.marketingOptIn], ['Doğrulanmış e-posta', t.verifiedEmails], ['Alınmamış posta', t.unclaimedMail]];
  const ageLabels = { under18: '18 yaş altı', a18_24: '18–24', a25_34: '25–34', a35: '35+', unknown: 'Bilinmiyor' };
  const h = s.health;
  return (
    <>
      <div className="metrics">{cards.map(([name, value]) => <article key={name}><strong>{fmt(value)}</strong><span>{name}</span></article>)}</div>
      <div className="cards">
        <section className="card"><h3>Yeni kayıtlar (14 gün)</h3><p className="muted">Eski hesapların kayıt tarihi bilinmediği için yalnızca yeni hesaplar sayılır.</p><Bars rows={s.signups} value={(r) => r.n} label={(r) => r.n + ' kayıt'} /></section>
        <section className="card"><h3>Reklam izleme (14 gün)</h3><p className="muted">Toplam: {fmt(s.ads.reduce((a, r) => a + r.views, 0))} izleme, {fmt(s.ads.reduce((a, r) => a + r.diamonds, 0))} elmas ödendi.</p><Bars rows={s.ads} value={(r) => r.views} label={(r) => `${r.views} izleme, ${r.diamonds} elmas`} /></section>
        <section className="card"><h3>Yaş grupları</h3>{Object.entries(s.ages).map(([k, v]) => <p key={k}>{ageLabels[k]}: <strong>{fmt(v)}</strong></p>)}</section>
        <section className="card"><h3>Elmas hareketleri (7 gün)</h3>
          {s.ledger.length === 0 ? <p className="muted">Kayıt yok.</p> : <table><thead><tr><th>Neden</th><th>Kazanılan</th><th>Harcanan</th></tr></thead><tbody>{s.ledger.map((r) => <tr key={r.reason}><td>{r.reason}</td><td>{fmt(r.earned)}</td><td>{fmt(r.spent)}</td></tr>)}</tbody></table>}
        </section>
        <section className="card"><h3>Sunucu sağlığı</h3>
          <p>Çalışma süresi: <strong>{dur(h.uptimeSec)}</strong> · Node {h.node}</p>
          <p>Bellek: {bytes(h.rss)} · Veritabanı: {bytes(h.dbSize)}</p>
          <p>Disk boş: {h.disk ? `${bytes(h.disk.free)} / ${bytes(h.disk.total)}` : '—'}</p>
          <p>Son yedek: {h.backup ? `${when(h.backup.at)} (${bytes(h.backup.size)}, ${h.backup.count} dosya)` : 'bulunamadı'}</p>
          <p>E-posta gönderimi: <span className="badge">{h.mailConfigured ? 'açık' : 'kapalı'}</span></p>
        </section>
        <section className="card"><h3>İzleme: yüksek bakiyeler</h3>
          <p className="muted">Beklenmedik büyük bakiye ya da son 24 saatte çok elmas kazanan hesaplar.</p>
          <table><thead><tr><th>Hesap</th><th>Elmas</th></tr></thead><tbody>{s.watch.topDiamonds.map((r) => <tr key={r.name}><td>{r.name}</td><td>{fmt(r.diamonds)}</td></tr>)}</tbody></table>
          <h4>Son 24 saat kazanılan</h4>
          {s.watch.bigCredits24h.length === 0 ? <p className="muted">Kayıt yok.</p> : <table><tbody>{s.watch.bigCredits24h.map((r) => <tr key={r.name}><td>{r.name}</td><td>{fmt(r.total)}</td></tr>)}</tbody></table>}
        </section>
        <section className="card"><h3>Satın almalar (son 100)</h3>
          {s.purchases.length === 0 ? <p className="muted">Henüz satın alma yok. Elmas satışı açılınca burada listelenir.</p> : <table><thead><tr><th>Tarih</th><th>Hesap</th><th>Ürün</th><th>Elmas</th><th>Durum</th></tr></thead><tbody>{s.purchases.map((p) => <tr key={p.transaction_id}><td>{when(p.created_at)}</td><td>{p.name}</td><td>{p.product_id} ({p.platform}/{p.environment})</td><td>{fmt(p.diamonds)}</td><td>{p.refunded_at ? 'iade' : p.status}</td></tr>)}</tbody></table>}
        </section>
      </div>
    </>
  );
}
