// Sunucunun çalıştıracağı oyun mantığı paketini üretir: src/game altındaki kurallar ve
// onların kullandığı saf fonksiyonlar tek bir Node modülüne paketlenir.
//   node scripts/build-game-logic.mjs          -> server/game-logic.generated.mjs'i yazar
//   node scripts/build-game-logic.mjs --check  -> dosya güncel değilse hata ile çıkar
// Paket depoya girer (VM'de esbuild gerekmesin); tests/game-logic.test.mjs güncelliğini denetler.
import { build } from 'esbuild';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outFile = join(root, 'server', 'game-logic.generated.mjs');

export async function bundleGameLogic() {
  const result = await build({
    entryPoints: [join(root, 'src', 'game', 'index.js')],
    bundle: true, write: false, platform: 'node', format: 'esm', target: 'node22',
    // Görseller ve tarayıcıya özgü modüller sunucu paketine girmez.
    loader: { '.png': 'empty', '.svg': 'empty', '.jpg': 'empty', '.jpeg': 'empty', '.webp': 'empty', '.json': 'json' },
    define: { 'import.meta.env': '{}' },
    legalComments: 'none', logLevel: 'error',
    banner: { js: '// OTOMATİK ÜRETİLDİ — elle düzenleme. Kaynak: src/game (npm run build:logic)\n' },
  });
  return result.outputFiles[0].text.replace(/\r\n/g, '\n');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const text = await bundleGameLogic();
  if (process.argv.includes('--check')) {
    const current = existsSync(outFile) ? readFileSync(outFile, 'utf8').replace(/\r\n/g, '\n') : '';
    if (current !== text) { console.error('server/game-logic.generated.mjs güncel değil: npm run build:logic'); process.exit(1); }
    console.log('game-logic paketi güncel.');
  } else {
    writeFileSync(outFile, text);
    console.log(`Yazıldı: ${outFile} (${Math.round(text.length / 1024)} KB)`);
  }
}
