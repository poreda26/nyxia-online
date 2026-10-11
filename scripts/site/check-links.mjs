// Yerel sunucuya karşı: tüm sayfalardaki iç bağlantı ve görselleri dolaşır, bozuk olanları listeler.
const base = process.argv[2] || 'http://localhost:8787';
const seen = new Map();
const queue = ['/'];
const bad = [];
while (queue.length) {
  const path = queue.shift();
  if (seen.has(path)) continue;
  const res = await fetch(base + path, { signal: AbortSignal.timeout(8000) }); if (process.env.DEBUG) console.log(path);
  seen.set(path, res.status);
  if (res.status !== 200) { bad.push(`${res.status} ${path}`); await res.body?.cancel(); continue; }
  if (!/text\/html/.test(res.headers.get('content-type') || '')) { await res.body?.cancel(); continue; }
  const html = await res.text();
  const dir = path.endsWith('/') ? path : path.replace(/[^/]*$/, '');
  for (const m of html.matchAll(/(?:href|src|poster)="([^"#]+)(?:#[^"]*)?"/g)) {
    let target = m[1];
    if (/^(https?:|mailto:|data:|javascript:)/.test(target)) continue;
    if (!target.startsWith('/')) target = new URL(target, base + dir).pathname + new URL(target, base + dir).search;
    target = target.split('?')[0];
    if (!seen.has(target)) queue.push(target);
  }
}
console.log(`Kontrol edilen: ${seen.size}, bozuk: ${bad.length}`);
for (const line of bad) console.log(' ', line);
process.exit(bad.length ? 1 : 0);
