import React, { useEffect, useState } from 'react';

const STATUS = { open: 'Yeni / yanıt bekliyor', answered: 'Yanıtlandı', closed: 'Kapalı' };
const CATEGORY = { account: 'Hesap', bug: 'Hata', payment: 'Ödeme', report: 'Oyuncu şikayeti', suggestion: 'Öneri', other: 'Diğer' };
const date = (n) => (n ? new Date(n).toLocaleString('tr-TR') : '—');

// Destek talepleri: liste + konuşma + yanıt. `api` sahip panelinin istek işlevidir.
export default function Tickets({ api, busy, run, onChanged }) {
  const [filter, setFilter] = useState('');
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(null);
  const [text, setText] = useState('');
  const load = async (status = filter) => setData(await api('admin/tickets' + (status ? `?status=${status}` : '')));
  useEffect(() => { run(() => load()); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const show = async (id) => { setOpen(await api('admin/ticket?id=' + id)); setText(''); };
  const send = (close) => run(async () => {
    if (text.trim().length < 2) throw new Error('Yanıt çok kısa.');
    setOpen(await api('admin/ticket/reply', { id: open.id, message: text, close }));
    setText(''); await load(); onChanged?.();
  });
  const status = (value) => run(async () => { setOpen(await api('admin/ticket/status', { id: open.id, status: value })); await load(); onChanged?.(); });

  if (open) return <section className="card ticket-thread">
    <div className="toolbar"><button onClick={() => { setOpen(null); run(() => load()); }}>← Talepler</button><h3>{open.code} · {open.subject}</h3><span className="badge">{STATUS[open.status]}</span></div>
    <p className="muted">{open.email}{open.username ? ` · oyun adı: ${open.username}` : ''} · {CATEGORY[open.category] || open.category} · açıldı {date(open.created_at)}</p>
    <div className="ticket-messages">{open.messages.map((m, i) => <div key={i} className={'ticket-msg ' + m.author}><small>{m.author === 'staff' ? 'Destek' : 'Oyuncu'} · {date(m.created_at)}</small><p>{m.body}</p></div>)}</div>
    <>
      <label>Yanıtın<textarea rows={5} value={text} maxLength={4000} onChange={(e) => setText(e.target.value)} placeholder="Oyuncuya e-postayla da gönderilir." /></label>
      <div className="toolbar"><button className="primary" disabled={busy} onClick={() => send(false)}>Yanıtla</button><button disabled={busy} onClick={() => send(true)}>Yanıtla ve kapat</button>
        {open.status === 'closed' ? <button disabled={busy} onClick={() => status('open')}>Yeniden aç</button> : <button disabled={busy} onClick={() => status('closed')}>Yanıtsız kapat</button>}</div>
    </>
  </section>;

  return <section className="card">
    <div className="toolbar"><div className="ticket-filters">{[['', 'Hepsi'], ['open', 'Bekleyen'], ['answered', 'Yanıtlanan'], ['closed', 'Kapalı']].map(([value, label]) => <button key={value} className={filter === value ? 'active' : ''} onClick={() => { setFilter(value); run(() => load(value)); }}>{label}</button>)}</div>
      {data && <span className="badge">{data.counts.open} bekleyen</span>}</div>
    {data?.items.length ? data.items.map((t) => <button className="account-card ticket-row" key={t.id} onClick={() => run(() => show(t.id))}>
      <strong>{t.code} · {t.subject}</strong>
      <small>{t.email}{t.username ? ` · ${t.username}` : ''} · {CATEGORY[t.category] || t.category} · {t.messages} mesaj · {date(t.updated_at)}</small>
      <span className={'badge ' + t.status}>{STATUS[t.status]}</span>
    </button>) : <p className="empty">Talep yok.</p>}
  </section>;
}
