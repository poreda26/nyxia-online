// Site üretici: oyun verisinden wiki + tanıtım sayfalarını (site/) ve görsel listesini (site/img/manifest.json) üretir.
// Kullanım: node scripts/build-site.mjs   (ardından python scripts/site/images.py ile görseller hazırlanır)
import { build } from 'esbuild';
import { mkdirSync, writeFileSync, copyFileSync, rmSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const assets = join(root, 'src', 'assets');
const out = join(root, 'site');
const tmp = join(root, 'scripts', '_site_data.mjs');

// Görsel içe aktarmaları dosya yoluna çevrilir (assets/...), böylece wiki hangi görselin hangi eşyaya ait olduğunu bilir.
const imagePlugin = {
  name: 'image-paths',
  setup(b) {
    b.onLoad({ filter: /\.(png|webp|jpe?g|svg|gif)$/ }, (args) => ({ contents: `export default ${JSON.stringify('assets/' + relative(assets, args.path).replace(/\\/g, '/'))};`, loader: 'js' }));
    b.onLoad({ filter: /\.(mp3|ogg|wav|mp4|woff2?)$/ }, () => ({ contents: 'export default "";', loader: 'js' }));
  },
};

await build({
  entryPoints: [join(root, 'scripts', 'site', 'data.js')], bundle: true, platform: 'node', format: 'esm', outfile: tmp,
  plugins: [imagePlugin], define: { 'import.meta.env.DEV': 'false' }, logLevel: 'error',
});
const { collect } = await import(pathToFileURL(tmp).href + '?v=' + Date.now());
rmSync(tmp, { force: true });
const data = collect();

const { buildPages, imgKey } = await import('./site/pages.mjs');
const { buildStatic } = await import('./site/static.mjs');
const pages = { ...buildPages(data), ...buildStatic(data) };

mkdirSync(join(out, 'wiki'), { recursive: true });
for (const [file, html] of Object.entries(pages)) writeFileSync(join(out, file), html);

// Hangi eşya görselleri gerekiyor?
const items = new Map();
for (const w of [...data.weapons, ...data.originals]) if (w.image) items.set(imgKey(w.image), w.image);
mkdirSync(join(out, 'img'), { recursive: true });
writeFileSync(join(out, 'img', 'manifest.json'), JSON.stringify({ items: [...items].map(([key, path]) => ({ key, src: path })) }, null, 1));
writeFileSync(join(root, 'scripts', 'site', 'wiki-data.json'), JSON.stringify(data));
// Yasal sayfalar ve simgeler oyunla aynı kaynaktan (public/) gelir; site tek başına yayınlanabilsin diye kopyalanır.
for (const file of ['privacy.html', 'terms.html', 'delete-account.html', 'legal.css', 'favicon.png', 'favicon-32.png', 'apple-touch-icon.png']) copyFileSync(join(root, 'public', file), join(out, file));
copyFileSync(join(root, 'src', 'assets', 'brand', 'nyxia-logo.png'), join(out, 'nyxia-logo.png'));
console.log(`Sayfa: ${Object.keys(pages).length}, eşya görseli: ${items.size}`);
