// Savaş efekt sesleri — vuruş, ıskalama, hasar alma — ve kısa bildirim
// sesleri (yükseltme başarılı/başarısız gibi). bgMusic.js ile aynı
// paylaşılan AudioContext'i kullanır (bkz. audioContext.js) ama kendi
// bağımsız ses seviyesi/mute durumuna sahip — Ayarlar'da Müzik ve Efekt
// sesleri ayrı ayrı kısılıp açılabiliyor. Sahnesi olmayan, tamamen kod ile
// sentezlenen kısa perküsif sesler (osilatör + gürültü buffer), hiçbir ses
// dosyası yok. Bildirim sesleri kullanıcı isteğiyle bilinçli olarak kısa
// tutuldu ("insanların kafasını yormadan") — hiçbiri yarım saniyeyi geçmiyor.
import { getAudioContext, ensureAudioStarted, getNoiseBuffer } from "./audioContext";
import { hapticHit, hapticHurt, hapticSuccess, hapticError, hapticLevelUp } from "../utils/haptics";

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
  hapticHit(crit);
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
  hapticHurt();
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

// Yükseltme başarılı — parlak, kısa bir majör arpej (çan gibi triangle
// dalgası). Toplam ~350ms, tek seferlik — döngüsüz.
export function playUpgradeSuccess() {
  hapticSuccess();
  const ctx = bus();
  const now = ctx.currentTime;
  [523.25, 659.25, 783.99].forEach((freq, i) => {
    const t = now + i * 0.07;
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, t);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.3, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.connect(g); g.connect(master);
    osc.start(t); osc.stop(t + 0.4);
  });
}

// Yükseltme başarısız — donuk, alçalan iki nota. Bir alarm gibi uzamıyor,
// kısa ve net bir "olmadı" hissi (kullanıcı isteği: rahatsız etmesin).
export function playUpgradeFail() {
  hapticError();
  const ctx = bus();
  const now = ctx.currentTime;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 900;
  filter.connect(master);
  [233.08, 174.61].forEach((freq, i) => {
    const t = now + i * 0.11;
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, t);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.32, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(g); g.connect(filter);
    osc.start(t); osc.stop(t + 0.28);
  });
}

// Seviye atlama — savaştaki en büyük an, o yüzden yükseltmeden daha
// gösterişli: kısa bir "boom" (gravitas) + 5 notalık yükselen bir fanfar
// (D-F#-A-D-F# — parlak majör), son nota hafif vibratoyla sürüyor.
// Toplam ~800ms, hâlâ kısa/tek seferlik.
export function playLevelUp() {
  hapticLevelUp();
  const ctx = bus();
  const now = ctx.currentTime;

  const boom = ctx.createOscillator();
  boom.type = "sine";
  boom.frequency.setValueAtTime(160, now);
  boom.frequency.exponentialRampToValueAtTime(55, now + 0.22);
  const boomGain = ctx.createGain();
  boomGain.gain.setValueAtTime(0.55, now);
  boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
  boom.connect(boomGain); boomGain.connect(master);
  boom.start(now); boom.stop(now + 0.4);

  const notes = [293.66, 369.99, 440.0, 587.33, 739.99]; // D4 F#4 A4 D5 F#5
  notes.forEach((freq, i) => {
    const t = now + 0.08 + i * 0.09;
    const dur = i === notes.length - 1 ? 0.55 : 0.16;
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, t);
    if (i === notes.length - 1) {
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 6;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 4;
      lfo.connect(lfoGain); lfoGain.connect(osc.detune);
      lfo.start(t); lfo.stop(t + dur + 0.05);
    }
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(i === notes.length - 1 ? 0.38 : 0.3, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g); g.connect(master);
    osc.start(t); osc.stop(t + dur + 0.05);
  });
}
