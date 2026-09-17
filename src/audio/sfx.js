// Savaş efekt sesleri — vuruş, ıskalama, hasar alma. bgMusic.js ile aynı
// paylaşılan AudioContext'i kullanır (bkz. audioContext.js) ama kendi
// bağımsız ses seviyesi/mute durumuna sahip — Ayarlar'da Müzik ve Efekt
// sesleri ayrı ayrı kısılıp açılabiliyor. Sahnesi olmayan, tamamen kod ile
// sentezlenen kısa perküsif sesler (osilatör + gürültü buffer), hiçbir ses
// dosyası yok.
import { getAudioContext, ensureAudioStarted, getNoiseBuffer } from "./audioContext";

let master = null;
let volume = 0.6;
let muted = false;

function bus() {
  const ctx = ensureAudioStarted();
  if (!master) {
    master = ctx.createGain();
    master.gain.value = muted ? 0 : volume;
    master.connect(ctx.destination);
  }
  return ctx;
}

export function setSfxVolume(v) {
  volume = Math.max(0, Math.min(1, v));
  if (master) master.gain.setTargetAtTime(muted ? 0 : volume, getAudioContext().currentTime, 0.05);
}

export function setSfxMuted(m) {
  muted = m;
  if (master) master.gain.setTargetAtTime(muted ? 0 : volume, getAudioContext().currentTime, 0.05);
}

// Oyuncunun ya da canavarın vuruşu — kritik vuruşlarda daha keskin/yüksek
// bir metalik çınlama + ekstra "ring" katmanı eklenir.
export function playHit({ crit = false } = {}) {
  const ctx = bus();
  const now = ctx.currentTime;

  const src = ctx.createBufferSource();
  src.buffer = getNoiseBuffer();
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = crit ? 2600 : 1800;
  bp.Q.value = crit ? 3.5 : 2.2;
  const g = ctx.createGain();
  g.gain.setValueAtTime(crit ? 0.65 : 0.42, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + (crit ? 0.22 : 0.14));
  src.connect(bp); bp.connect(g); g.connect(master);
  src.start(now); src.stop(now + 0.3);

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(crit ? 180 : 140, now);
  osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
  const og = ctx.createGain();
  og.gain.setValueAtTime(crit ? 0.5 : 0.3, now);
  og.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
  osc.connect(og); og.connect(master);
  osc.start(now); osc.stop(now + 0.2);

  if (crit) {
    const ring = ctx.createOscillator();
    ring.type = "triangle";
    ring.frequency.value = 1200;
    const rg = ctx.createGain();
    rg.gain.setValueAtTime(0.18, now);
    rg.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    ring.connect(rg); rg.connect(master);
    ring.start(now); ring.stop(now + 0.32);
  }
}

// Iskalama — hafif bir "hoş" rüzgar sesi, darbe yok.
export function playMiss() {
  const ctx = bus();
  const now = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = getNoiseBuffer();
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass"; hp.frequency.value = 900;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.18, now + 0.05);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
  src.connect(hp); hp.connect(g); g.connect(master);
  src.start(now); src.stop(now + 0.25);
}

// Oyuncu hasar aldığında — playHit'ten daha donuk/alçak, "vurulmak" hissi.
export function playHurt() {
  const ctx = bus();
  const now = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = getNoiseBuffer();
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass"; lp.frequency.value = 900; lp.Q.value = 0.6;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.4, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  src.connect(lp); lp.connect(g); g.connect(master);
  src.start(now); src.stop(now + 0.25);

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(110, now);
  osc.frequency.exponentialRampToValueAtTime(45, now + 0.15);
  const og = ctx.createGain();
  og.gain.setValueAtTime(0.35, now);
  og.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
  osc.connect(og); og.connect(master);
  osc.start(now); osc.stop(now + 0.25);
}
