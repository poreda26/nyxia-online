// Arka plan müziği (bgMusic.js) ve savaş efektleri (sfx.js) tek bir
// AudioContext'i paylaşır — tarayıcının "ilk kullanıcı jestinden önce ses
// çalınamaz" kısıtlaması tek bir yerde çözülüyor, ikisi ayrı ses seviyesine/
// mute durumuna sahip olabiliyor (bkz. her ikisinin de kendi master gain'i).
let ctx = null;
let noiseBuffer = null;

export function getAudioContext() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

export function ensureAudioStarted() {
  const c = getAudioContext();
  if (c.state === "suspended") c.resume();
  return c;
}

// Perküsyon/vuruş efektleri için tek, paylaşılan bir beyaz gürültü buffer'ı
// — her efekt kendi buffer'ını basmak yerine bunu yeniden kullanıyor.
export function getNoiseBuffer() {
  const c = getAudioContext();
  if (!noiseBuffer) {
    const length = c.sampleRate;
    noiseBuffer = c.createBuffer(1, length, c.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}
