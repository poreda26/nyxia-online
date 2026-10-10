// Site iskeleti: üst menü, wiki kenar menüsü, alt bilgi. Tüm sayfalar bunu kullanır.
export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const num = (value) => (Number.isFinite(value) ? value.toLocaleString('tr-TR') : '—');

export const WIKI_PAGES = [
  ['index', 'Başlangıç rehberi'],
  ['siniflar', 'Sınıflar ve yetenekler'],
  ['bolgeler', 'Bölgeler ve canavarlar'],
  ['zindanlar', 'Zindanlar ve bosslar'],
  ['silahlar', 'Silahlar'],
  ['zirhlar', 'Zırhlar ve takılar'],
  ['gelistirme', 'Eşya geliştirme'],
  ['klan', 'Klanlar'],
  ['savas-alani', 'Savaş alanı'],
  ['ekonomi', 'Ekonomi ve elmas'],
  ['sss', 'Sık sorulan sorular'],
];

export function page({ title, description, root = '', body, active = '', wikiActive = null, extraHead = '', script = '' }) {
  const nav = [['', 'Ana sayfa', 'home'], ['wiki/', 'Wiki', 'wiki'], ['support.html', 'Destek', 'support']]
    .map(([href, label, id]) => `<a href="${root}${href}"${active === id ? ' class="on" aria-current="page"' : ''}>${label}</a>`).join('');
  const side = wikiActive === null ? '' : `<aside class="wiki-nav" aria-label="Wiki"><strong>Wiki</strong>${WIKI_PAGES.map(([slug, label]) => `<a href="${root}wiki/${slug === 'index' ? '' : slug + '.html'}"${wikiActive === slug ? ' class="on"' : ''}>${esc(label)}</a>`).join('')}</aside>`;
  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} · Nyxia Online</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)} · Nyxia Online">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="https://nyxiaonline.com/img/og.jpg">
<meta name="theme-color" content="#0B0C10">
<link rel="icon" href="${root}favicon-32.png">
<link rel="apple-touch-icon" href="${root}apple-touch-icon.png">
<link rel="stylesheet" href="${root}site.css">
${extraHead}
</head>
<body>
<header class="top">
  <a class="brand" href="${root}./"><img src="${root}favicon.png" alt=""><strong>NYXIA ONLINE</strong></a>
  <nav>${nav}<button id="lang" type="button" aria-label="Language" hidden>EN</button></nav>
</header>
${wikiActive === null ? `<main class="page">${body}</main>` : `<div class="wiki"><button class="wiki-toggle" type="button" aria-expanded="false">☰ Wiki menüsü</button>${side}<main class="page wiki-main">${body}</main></div>`}
<footer>
  <nav>
    <a href="${root}privacy.html">Gizlilik Politikası</a>
    <a href="${root}terms.html">Kullanım Koşulları</a>
    <a href="${root}delete-account.html">Hesap Silme</a>
    <a href="${root}support.html">Destek</a>
  </nav>
  <p>© 2026 Nyxia Online</p>
</footer>
<script src="${root}site.js"></script>
${script}
</body>
</html>
`;
}

// Küçük yardımcılar
export const tierChip = (data, tier) => `<span class="tier" style="--c:${data.tiers.colors[tier]}">${esc(data.tiers.labels[tier])}</span>`;
export const table = (head, rows, cls = '') => `<div class="table-wrap"><table class="${cls}"><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
