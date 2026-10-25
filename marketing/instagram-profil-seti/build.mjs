// Nyxia Online — Instagram profil seti: 3 gönderi (1080x1350) + 6 öne çıkan kapağı (1080x1920).
// Çalıştır: node marketing/instagram-profil-seti/build.mjs
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.NYXIA_PLAYWRIGHT || 'C:/Users/akcel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const out = path.join(root, 'marketing/instagram-profil-seti');
const img = (p) => pathToFileURL(path.join(root, p)).href;
await mkdir(path.join(out, 'html'), { recursive: true });

const css = `
*{box-sizing:border-box}html,body{margin:0}
body{font-family:Georgia,'Times New Roman',serif;color:#f4e6bf;background:#0b0c10}
.post{width:1080px;height:1350px;position:relative;overflow:hidden;background:#0b0c10}
.cover{width:1080px;height:1920px;position:relative;overflow:hidden;background:#0b0c10}
.bg{position:absolute;inset:0;background-size:cover;background-position:center}
.shade{position:absolute;inset:0}
.gold{color:#e8c776}
.sans{font-family:'Segoe UI',Arial,sans-serif}
.pill{display:inline-flex;align-items:center;gap:14px;padding:22px 44px;border-radius:60px;font:700 30px 'Segoe UI',Arial,sans-serif;letter-spacing:1px;color:#1a1020;background:linear-gradient(180deg,#f3d98d,#c9972f);box-shadow:0 10px 40px rgba(201,151,47,.35),0 0 0 2px rgba(255,235,170,.6) inset}
.ornament{height:2px;background:linear-gradient(90deg,transparent,#c9972f,transparent)}
`;

const page = (w, h, body, extra = '') => `<!doctype html><html lang="tr"><meta charset="utf-8"><style>${css}${extra}</style><body>${body}</body></html>`;

// ---------- Gönderi 1: Beta herkese açık ----------
const post1 = page(1080, 1350, `
<div class="post">
  <div class="bg" style="background-image:url(${img('site/img/hero.jpg')});filter:saturate(.9)"></div>
  <div class="shade" style="background:linear-gradient(180deg,rgba(8,6,18,.55) 0%,rgba(8,6,18,.35) 30%,rgba(8,6,18,.88) 70%,#08060f 100%)"></div>
  <div class="shade" style="background:radial-gradient(60% 40% at 50% 28%,rgba(139,77,255,.35),transparent 70%)"></div>
  <img src="${img('site/nyxia-logo.png')}" style="position:absolute;left:50%;top:60px;width:330px;transform:translateX(-50%);filter:drop-shadow(0 8px 30px rgba(139,77,255,.6))">
  <div style="position:absolute;left:0;right:0;top:470px;text-align:center;padding:0 70px">
    <div class="sans" style="font-size:22px;letter-spacing:8px;color:#b9a3ff;font-weight:600">BETA HERKESE AÇIK</div>
    <h1 style="margin:22px 0 0;font-size:100px;line-height:1.02;letter-spacing:-2px;color:#f6e7bd;text-shadow:0 4px 30px rgba(0,0,0,.7)">Tarayıcını aç,<br><span class="gold">maceraya başla.</span></h1>
    <p class="sans" style="margin:26px auto 0;font-size:30px;line-height:1.4;color:#d8d0e6;max-width:760px">Kurulum yok. Telefonda da bilgisayarda da oyna.</p>
  </div>
  <div style="position:absolute;left:0;right:0;bottom:60px;text-align:center">
    <img src="${img('site/img/chars/warrior-human.webp')}" style="height:300px;margin:0 -10px;vertical-align:bottom;filter:drop-shadow(0 12px 18px rgba(0,0,0,.7))">
    <img src="${img('site/img/chars/rogue-human.webp')}" style="height:280px;margin:0 -10px;vertical-align:bottom;filter:drop-shadow(0 12px 18px rgba(0,0,0,.7))">
    <img src="${img('site/img/chars/mage-human.webp')}" style="height:300px;margin:0 -10px;vertical-align:bottom;filter:drop-shadow(0 12px 18px rgba(0,0,0,.7))">
    <div style="margin-top:34px"><span class="pill">Betayı oyna · link profilde</span></div>
  </div>
</div>`);

// ---------- Gönderi 2: Takip et, ödülünü al ----------
const gem = `<svg width="64" height="64" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9c8ff"/><stop offset="1" stop-color="#8b4dff"/></linearGradient></defs><path d="M32 4 56 22 32 60 8 22Z" fill="url(#g)" stroke="#f3d98d" stroke-width="2.5" stroke-linejoin="round"/><path d="M8 22H56M20 22 32 4 44 22 32 60Z" fill="none" stroke="#fff8" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
const potion = (c1, c2) => `<svg width="64" height="64" viewBox="0 0 64 64"><path d="M26 6h12v4h-2v10l12 24a10 10 0 0 1-9 14H25a10 10 0 0 1-9-14l12-24V10h-2Z" fill="#1c1626" stroke="#f3d98d" stroke-width="2.5" stroke-linejoin="round"/><path d="M20 40h24l5 8a8 8 0 0 1-7 12H22a8 8 0 0 1-7-12Z" fill="${c1}"/><circle cx="26" cy="46" r="3" fill="${c2}"/></svg>`;
const crown = `<svg width="64" height="64" viewBox="0 0 64 64"><path d="M8 48 4 20l16 14 12-22 12 22 16-14-4 28Z" fill="#c9972f" stroke="#f3d98d" stroke-width="2.5" stroke-linejoin="round"/><rect x="8" y="50" width="48" height="8" rx="2" fill="#a67a1f" stroke="#f3d98d" stroke-width="2.5"/></svg>`;
const row = (icon, title, sub) => `<div style="display:flex;align-items:center;gap:26px;padding:34px 34px;border-radius:24px;background:linear-gradient(90deg,rgba(139,77,255,.22),rgba(255,255,255,.04));border:1px solid rgba(232,199,118,.35)"><div style="flex:none;width:84px;height:84px;border-radius:20px;background:rgba(11,8,22,.8);display:grid;place-items:center;border:1px solid rgba(232,199,118,.45)">${icon}</div><div><div style="font:700 42px Georgia,serif;color:#f6e7bd">${title}</div><div class="sans" style="font-size:24px;color:#bfb5d6;margin-top:4px">${sub}</div></div></div>`;
const post2 = page(1080, 1350, `
<div class="post">
  <div class="bg" style="background-image:url(${img('site/img/regions/abyssal_pit.webp')});filter:blur(14px) saturate(1.1);transform:scale(1.15)"></div>
  <div class="shade" style="background:linear-gradient(180deg,rgba(10,6,22,.78),rgba(10,6,22,.94))"></div>
  <div class="shade" style="background:radial-gradient(70% 45% at 50% 0%,rgba(139,77,255,.4),transparent 70%)"></div>
  <div style="position:absolute;inset:0;padding:70px 80px">
    <div style="display:flex;align-items:center;gap:20px"><img src="${img('site/nyxia-logo.png')}" style="height:96px"><div class="sans" style="font-size:22px;letter-spacing:7px;color:#b9a3ff;font-weight:600">NYXIA ONLINE</div></div>
    <h1 style="margin:90px 0 0;font-size:112px;line-height:1;letter-spacing:-2px;color:#f6e7bd">Takip et.<br><span class="gold">Ödülünü al.</span></h1>
    <p class="sans" style="margin:30px 0 50px;font-size:32px;color:#d8d0e6;line-height:1.4">Instagram'ı takip et, Discord'a katıl. İkisi için de ayrı ayrı:</p>
    <div style="display:grid;gap:24px">
      ${row(gem, '50 Elmas', 'Hesabına anında yatar')}
      ${row(potion('#e2425c', '#ff9aa9'), '5 HP + 5 MP iksiri', 'Zindana hazır başla')}
      ${row(crown, '1 saat Mythic Premium', 'Kuponu envanterinden kullan')}
    </div>
    <div class="ornament" style="margin:60px 0 34px"></div>
    <div class="sans" style="display:flex;justify-content:space-between;align-items:center;font-size:25px;color:#cfc5e6">
      <span>Oyunda: Ayarlar → Oyun rehberi → <b class="gold">Topluluk ödülü</b></span><span style="font-size:22px;color:#9d92b8">Hesap başına bir kez</span>
    </div>
    <div class="sans" style="margin-top:30px;font-size:27px;color:#e8c776;font-weight:600">🎁 Instagram ve Discord'da düzenli çekilişler yapıyoruz.</div>
  </div>
</div>`);

// ---------- Gönderi 3: Altı bölge ----------
const regions = [
  ['fallow_valley', 'Fallow Valley', 'Lv 1–15'],
  ['ashen_canyon', 'Ashen Canyon', 'Lv 15–25'],
  ['frostburn_summit', 'Frostburn Summit', 'Lv 25–40'],
  ['ruined_sanctuary', 'Ruined Sanctuary', 'Lv 40–50'],
  ['abyssal_pit', 'Abyssal Pit', 'Lv 50–60'],
  ['crimson_battlefront', 'Crimson Battlefront', 'Lv 60–65'],
];
const post3 = page(1080, 1350, `
<div class="post" style="background:linear-gradient(180deg,#0e0a1c,#08060f)">
  <div style="position:absolute;inset:0;background:radial-gradient(60% 30% at 50% 0%,rgba(139,77,255,.35),transparent 70%)"></div>
  <div style="position:absolute;inset:0;padding:70px 64px">
    <div style="display:flex;align-items:center;gap:20px"><img src="${img('site/nyxia-logo.png')}" style="height:84px"><div class="sans" style="font-size:22px;letter-spacing:7px;color:#b9a3ff;font-weight:600">NYXIA ONLINE</div></div>
    <h1 style="margin:40px 0 0;font-size:96px;line-height:1.02;letter-spacing:-2px;color:#f6e7bd">Altı bölge.<br><span class="gold">Tek yol: ileri.</span></h1>
    <p class="sans" style="margin:20px 0 40px;font-size:28px;color:#cfc5e6">Her bölgenin kendi canavarları, kendi ganimeti var.</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px">
      ${regions.map(([k, n, l]) => `<div style="position:relative;height:340px;border-radius:22px;overflow:hidden;border:1px solid rgba(232,199,118,.4);box-shadow:0 14px 40px rgba(0,0,0,.5)"><div class="bg" style="background-image:url(${img(`site/img/regions/${k}.webp`)})"></div><div class="shade" style="background:linear-gradient(180deg,transparent 40%,rgba(8,6,15,.92))"></div><div style="position:absolute;left:18px;right:18px;bottom:16px"><div style="font:700 30px Georgia,serif;color:#f6e7bd;line-height:1.1">${n}</div><div class="sans" style="font-size:22px;color:#e8c776;margin-top:6px;font-weight:600">${l}</div></div></div>`).join('')}
    </div>
    <div class="ornament" style="margin:44px 0 24px"></div>
    <div class="sans" style="font-size:25px;color:#cfc5e6;letter-spacing:2px;text-align:center">HANGİSİNDE TAKILDIN? YORUMLARA YAZ.</div>
  </div>
</div>`);

// ---------- Öne çıkan kapakları (merkez 600px dairede kalır) ----------
const stroke = 'fill="none" stroke="#f3d98d" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"';
const icons = {
  oyna: `<img src="${img('site/nyxia-logo.png')}" style="width:360px;filter:drop-shadow(0 6px 24px rgba(139,77,255,.7))">`,
  siniflar: `<div style="display:flex;align-items:flex-end"><img src="${img('site/img/chars/warrior-human.webp')}" style="height:300px;margin:0 -30px"><img src="${img('site/img/chars/mage-human.webp')}" style="height:300px;margin:0 -30px"></div>`,
  bolgeler: `<div style="position:relative;width:340px;height:340px;border-radius:50%;overflow:hidden;border:5px solid #e8c776;box-shadow:0 0 50px rgba(139,77,255,.6)"><div class="bg" style="background-image:url(${img('site/img/regions/frostburn_summit.webp')})"></div></div>`,
  odul: `<svg width="300" height="300" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9c8ff"/><stop offset="1" stop-color="#8b4dff"/></linearGradient></defs><path d="M32 4 56 22 32 60 8 22Z" fill="url(#g)" stroke="#f3d98d" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 22H56M20 22 32 4 44 22 32 60Z" fill="none" stroke="#fff8" stroke-width="1.1" stroke-linejoin="round"/></svg>`,
  cekilis: `<svg width="300" height="300" viewBox="0 0 64 64" ${stroke.replace('stroke-width="5"', 'stroke-width="2.6"')}><rect x="8" y="26" width="48" height="32" rx="3"/><rect x="5" y="18" width="54" height="9" rx="2"/><path d="M32 18v40"/><path d="M32 18c-4-12-18-12-16-5 1 4 10 5 16 5Zm0 0c4-12 18-12 16-5-1 4-10 5-16 5Z"/></svg>`,
  duyuru: `<svg width="300" height="300" viewBox="0 0 64 64" ${stroke.replace('stroke-width="5"', 'stroke-width="2.6"')}><path d="M32 6c-9 0-14 8-14 18 0 10-5 14-8 18h44c-3-4-8-8-8-18 0-10-5-18-14-18Z"/><path d="M26 48c0 4 3 7 6 7s6-3 6-7"/><path d="M32 2v4"/></svg>`,
};
const cover = (key, label) => page(1080, 1920, `
<div class="cover">
  <div class="bg" style="background-image:url(${img('site/img/hero.jpg')});filter:blur(6px) saturate(.9);transform:scale(1.2)"></div>
  <div class="shade" style="background:radial-gradient(circle at 50% 50%,rgba(60,28,120,.55),rgba(8,6,15,.95) 70%)"></div>
  <div style="position:absolute;left:50%;top:50%;width:760px;height:760px;transform:translate(-50%,-50%);border-radius:50%;border:4px solid #c9972f;box-shadow:0 0 0 14px rgba(201,151,47,.12),0 0 90px rgba(139,77,255,.55) inset"></div>
  <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-56%);display:flex;align-items:center;justify-content:center;width:600px;height:480px">${icons[key]}</div>
  <div style="position:absolute;left:0;right:0;top:50%;margin-top:190px;text-align:center;font:700 74px Georgia,serif;letter-spacing:3px;color:#f6e7bd;text-shadow:0 4px 24px rgba(0,0,0,.8)">${label}</div>
</div>`);


// ---------- Test ekibi duyurusu (gönderi 1080x1350 + hikâye 1080x1920) ----------
const step = (n, title, sub) => `<div style="display:flex;align-items:center;gap:26px;padding:26px 32px;border-radius:24px;background:linear-gradient(90deg,rgba(139,77,255,.22),rgba(255,255,255,.04));border:1px solid rgba(232,199,118,.35)"><div style="flex:none;width:76px;height:76px;border-radius:50%;background:linear-gradient(180deg,#f3d98d,#c9972f);color:#1a1020;display:grid;place-items:center;font:700 40px Georgia,serif">${n}</div><div><div style="font:700 38px Georgia,serif;color:#f6e7bd">${title}</div><div class="sans" style="font-size:24px;color:#bfb5d6;margin-top:4px">${sub}</div></div></div>`;
const chip = (t) => `<span class="sans" style="display:inline-block;padding:12px 24px;border-radius:40px;border:1px solid rgba(232,199,118,.5);color:#e8c776;font-size:24px;font-weight:600;background:rgba(11,8,22,.55)">${t}</span>`;
const testBody = (h, extraTop) => `
  <div class="bg" style="background-image:url(${img('site/img/regions/ruined_sanctuary.webp')});filter:blur(14px) saturate(1.1);transform:scale(1.15)"></div>
  <div class="shade" style="background:linear-gradient(180deg,rgba(10,6,22,.74),rgba(10,6,22,.95))"></div>
  <div class="shade" style="background:radial-gradient(70% 40% at 50% 0%,rgba(139,77,255,.42),transparent 70%)"></div>
  <div style="position:absolute;inset:0;padding:${extraTop}px 80px 70px">
    <div style="display:flex;align-items:center;gap:20px"><img src="${img('site/nyxia-logo.png')}" style="height:92px"><div class="sans" style="font-size:22px;letter-spacing:7px;color:#b9a3ff;font-weight:600">NYXIA ONLINE</div></div>
    <div class="sans" style="margin-top:${h.gap}px;font-size:22px;letter-spacing:8px;color:#b9a3ff;font-weight:600">ANDROID TEST EKİBİ</div>
    <h1 style="margin:18px 0 0;font-size:${h.size}px;line-height:1.02;letter-spacing:-2px;color:#f6e7bd">Test ekibine<br><span class="gold">katıl.</span></h1>
    <p class="sans" style="margin:26px 0 ${h.after}px;font-size:30px;line-height:1.4;color:#d8d0e6">Nyxia Online, Google Play'de yayınlanmadan önce ilk oynayanlardan ol. Bulduğun her hata oyunu daha iyi yapar.</p>
    <div style="display:grid;gap:22px">
      ${step(1, 'Gmail adresini gönder', 'Bize DM at ya da Discord\'da yaz')}
      ${step(2, 'Davet bağlantısını al', 'Sana Play Store test bağlantısını göndereceğiz')}
      ${step(3, 'İndir ve oyna', '14 gün boyunca testte kal, gördüğün hatayı yaz')}
    </div>
    <div style="margin-top:44px;display:flex;gap:16px;flex-wrap:wrap">${chip('Android telefon')}${chip('Gmail hesabı')}${chip('14 gün')}</div>
    <div class="sans" style="margin-top:34px;font-size:26px;color:#e8c776;font-weight:600">Kontenjan sınırlı. Hemen yaz.</div>
  </div>`;
const testPost = page(1080, 1350, `<div class="post">${testBody({ size: 108, gap: 44, after: 34 }, 60)}</div>`);
const testStory = page(1080, 1920, `<div class="cover">${testBody({ size: 124, gap: 230, after: 70 }, 250)}</div>`);

const files = {
  'gonderi-1-beta-acik': [post1, 1080, 1350],
  'gonderi-2-takip-et-odul-al': [post2, 1080, 1350],
  'gonderi-3-alti-bolge': [post3, 1080, 1350],
  'gonderi-4-test-ekibi': [testPost, 1080, 1350],
  'hikaye-test-ekibi': [testStory, 1080, 1920],
  'kapak-1-oyna': [cover('oyna', 'OYNA'), 1080, 1920],
  'kapak-2-siniflar': [cover('siniflar', 'SINIFLAR'), 1080, 1920],
  'kapak-3-bolgeler': [cover('bolgeler', 'BÖLGELER'), 1080, 1920],
  'kapak-4-odul': [cover('odul', 'ÖDÜL'), 1080, 1920],
  'kapak-5-cekilis': [cover('cekilis', 'ÇEKİLİŞ'), 1080, 1920],
  'kapak-6-duyuru': [cover('duyuru', 'DUYURU'), 1080, 1920],
};

const browser = await chromium.launch({ channel: process.env.NYXIA_BROWSER || 'msedge', headless: true });
try {
  for (const [name, [html, w, h]] of Object.entries(files)) {
    const file = path.join(out, 'html', `${name}.html`);
    await writeFile(file, html);
    const p = await browser.newPage({ viewport: { width: w, height: h } });
    await p.goto(pathToFileURL(file).href);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForFunction(() => [...document.images].every((i) => i.complete));
    await p.screenshot({ path: path.join(out, `${name}.png`) });
    await p.close();
    console.log('ok', name);
  }
} finally {
  await browser.close();
}
