// Site iskeleti: üst menü, wiki kenar menüsü, alt bilgi. Tüm sayfalar bunu kullanır.
export const INSTAGRAM = 'https://www.instagram.com/nyxiaonline/';
export const DISCORD = 'https://discord.gg/K7aUAPhVFz';
// Resmi marka simgeleri (Google Play, Apple, Discord)
export const playIcon = '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="#FFD500" d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594z"/><path fill="#00A0FF" d="M1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924z"/><path fill="#00F076" d="M13.544 10.989l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973z"/><path fill="#FF3A44" d="M13.544 13.056l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z"/></svg>';
export const appleIcon = '<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>';
export const discordIcon = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>';
export const instagramIcon = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>';
// Tarayıcı eski CSS/JS'i önbellekte tutmasın diye her üretimde değişen sürüm eki
const V = Date.now().toString(36);
export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const num = (value) => (Number.isFinite(value) ? value.toLocaleString('tr-TR') : '—');

// [slug (Türkçe), Türkçe başlık, İngilizce başlık, İngilizce slug]
export const WIKI_PAGES = [
  ['index', 'Başlangıç rehberi', 'Getting started', 'index'],
  ['siniflar', 'Sınıflar ve yetenekler', 'Classes and skills', 'classes'],
  ['bolgeler', 'Bölgeler ve canavarlar', 'Regions and monsters', 'regions'],
  ['zindanlar', 'Zindanlar ve bosslar', 'Dungeons and bosses', 'dungeons'],
  ['silahlar', 'Silahlar', 'Weapons', 'weapons'],
  ['zirhlar', 'Zırhlar ve takılar', 'Armor and accessories', 'armor'],
  ['gelistirme', 'Eşya geliştirme', 'Item upgrading', 'upgrading'],
  ['klan', 'Klanlar', 'Clans', 'clans'],
  ['savas-alani', 'Savaş alanı', 'Warzone', 'warzone'],
  ['ekonomi', 'Ekonomi ve elmas', 'Economy and diamonds', 'economy'],
  ['sss', 'Sık sorulan sorular', 'FAQ', 'faq'],
];
export const wikiSlug = (lang, slug) => (lang === 'en' ? (WIKI_PAGES.find(([s]) => s === slug) || [])[3] || slug : slug);
// Türkçe sayfa yolundan İngilizce karşılığına (ve tersine) çeviri.
export const altPagePath = (path, lang) => {
  if (lang === 'tr') {
    const wiki = /^wiki\/(.+)\.html$/.exec(path);
    if (wiki) return `en/wiki/${wikiSlug('en', wiki[1])}.html`;
    if (path === 'wiki/') return 'en/wiki/';
    return `en/${path}`;
  }
  const rest = path.replace(/^en\//, '');
  const wiki = /^wiki\/(.+)\.html$/.exec(rest);
  if (wiki) return `wiki/${(WIKI_PAGES.find(([, , , en]) => en === wiki[1]) || [wiki[1]])[0]}.html`;
  return rest;
};

const UI = {
  tr: { nav: [['', 'Ana sayfa', 'home'], ['wiki/', 'Wiki', 'wiki'], ['@beta/', 'Beta ▶', 'beta'], ['support.html', 'Destek', 'support']], menu: 'Ana menü', wikiMenu: '☰ Wiki menüsü', privacy: 'Gizlilik Politikası', terms: 'Kullanım Koşulları', del: 'Hesap Silme', support: 'Destek', other: 'EN', otherLabel: 'English' },
  en: { nav: [['', 'Home', 'home'], ['wiki/', 'Wiki', 'wiki'], ['@beta/', 'Play Beta ▶', 'beta'], ['support.html', 'Support', 'support']], menu: 'Main menu', wikiMenu: '☰ Wiki menu', privacy: 'Privacy Policy', terms: 'Terms of Use', del: 'Delete Account', support: 'Support', other: 'TR', otherLabel: 'Türkçe' },
};

// path: sitedeki yol (ör. "en/wiki/classes.html"). root: o dilin kök klasörüne göreli yol, assetRoot: sitenin köküne.
export function page({ title, description, body, active = '', wikiActive = null, extraHead = '', script = '', lang = 'tr', path = 'index.html' }) {
  const ui = UI[lang];
  const depth = path.split('/').length - 1;
  const assetRoot = '../'.repeat(depth);
  const root = lang === 'en' ? '../'.repeat(Math.max(0, depth - 1)) : assetRoot;
  const altPath = altPagePath(path, lang);
  const altLang = lang === 'en' ? 'tr' : 'en';
  const nav = ui.nav.map(([href, label, id]) => `<a href="${href.startsWith('@') ? assetRoot + href.slice(1) : root + href}"${active === id ? ' class="on" aria-current="page"' : ''}>${label}</a>`).join('');
  const side = wikiActive === null ? '' : `<aside class="wiki-nav" aria-label="Wiki"><strong>Wiki</strong>${WIKI_PAGES.map(([slug, trLabel, enLabel]) => `<a href="${root}wiki/${slug === 'index' ? '' : wikiSlug(lang, slug) + '.html'}"${wikiActive === slug ? ' class="on"' : ''}>${esc(lang === 'en' ? enLabel : trLabel)}</a>`).join('')}</aside>`;
  const legal = (file) => `${assetRoot}${file}${lang === 'en' ? '#en' : ''}`;
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} · Nyxia Online</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)} · Nyxia Online">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="https://nyxiaonline.com/img/og.jpg">
<meta name="theme-color" content="#0B0C10">
<link rel="alternate" hreflang="${altLang}" href="https://nyxiaonline.com/${altPath}">
<link rel="alternate" hreflang="${lang}" href="https://nyxiaonline.com/${path}">
<link rel="icon" href="${assetRoot}favicon-32.png">
<link rel="apple-touch-icon" href="${assetRoot}apple-touch-icon.png">
<link rel="stylesheet" href="${assetRoot}site.css?v=${V}">
${extraHead}
</head>
<body>
<header class="top">
  <a class="brand" href="${root}./"><img src="${assetRoot}favicon.png" alt=""><strong>NYXIA ONLINE</strong></a>
  <nav class="links" aria-label="${ui.menu}">${nav}</nav>
  <div class="social"><a class="ig-icon dc-icon" href="${DISCORD}" target="_blank" rel="noopener" aria-label="Discord" title="Discord">${discordIcon}</a><a class="ig-icon" href="${INSTAGRAM}" target="_blank" rel="noopener" aria-label="Instagram: @nyxiaonline" title="Instagram">${instagramIcon}</a><a id="lang" href="${assetRoot}${altPath}" hreflang="${altLang}" lang="${altLang}" aria-label="${ui.otherLabel}" title="${ui.otherLabel}">${ui.other}</a></div>
</header>
${wikiActive === null ? `<main class="page">${body}</main>` : `<div class="wiki"><button class="wiki-toggle" type="button" aria-expanded="false">${ui.wikiMenu}</button>${side}<main class="page wiki-main">${body}</main></div>`}
<footer>
  <nav>
    <a href="${legal('privacy.html')}">${ui.privacy}</a>
    <a href="${legal('terms.html')}">${ui.terms}</a>
    <a href="${legal('delete-account.html')}">${ui.del}</a>
    <a href="${root}support.html">${ui.support}</a>
    <a class="ig dc" href="${DISCORD}" target="_blank" rel="noopener" aria-label="Discord">${discordIcon} Discord</a>
    <a class="ig" href="${INSTAGRAM}" target="_blank" rel="noopener" aria-label="Instagram">${instagramIcon} @nyxiaonline</a>
  </nav>
  <p>© 2026 Nyxia Online</p>
</footer>
<script src="${assetRoot}site.js?v=${V}"></script>
${script ? script.replace(/src="([^"]+)"/g, (m, f) => `src="${assetRoot}${f}"`) : ''}
</body>
</html>
`;
}

// Küçük yardımcılar
export const tierChip = (data, tier) => `<span class="tier" style="--c:${data.tiers.colors[tier]}">${esc(data.tiers.labels[tier])}</span>`;
export const table = (head, rows, cls = '') => `<div class="table-wrap"><table class="${cls}"><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
