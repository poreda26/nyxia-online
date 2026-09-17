// Knight Online'ın "efsane" ana müziğine öykünen, tamamen özgün, Web Audio
// API ile canlı sentezlenen bir arka plan müziği motoru. Hiçbir ses dosyası
// yüklemiyor/örneklemiyor — telif hakkı riski yok, sadece osilatör +
// gürültü buffer'larından oluşan bir "sanal orkestra". Nota zamanlaması
// klasik "lookahead scheduler" deseniyle yapılıyor (setInterval'ın kendi
// gecikmesine güvenmek yerine, audioCtx.currentTime'a göre önceden
// planlanıyor) — bu yüzden tempo kaymaz, sekme arka plana alınsa bile.

const BPM = 84;
const BEAT = 60 / BPM; // saniye
const STEP = BEAT / 2; // 8'lik nota
const SCHEDULE_AHEAD = 0.2; // saniye
const LOOKAHEAD_MS = 25;

const HZ = {
  D2: 73.42, F2: 87.31, G2: 98.0, A2: 110.0, Bb2: 116.54, C3: 130.81,
  D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, Bb3: 233.08, C4: 261.63,
  D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, Bb4: 466.16, C5: 523.25, D5: 587.33,
};

// D minör doğal ölçeğinde 4 barlık kahramanca ilerleme: i - VI - III - VII
// (Dm - Bb - F - C). KO'nun kale/savaş temalarındaki tipik minör-epik
// kadansa yakın bir his veriyor.
const PROGRESSION = [
  { bass: ["D2", "D2", "A2", "D2"], chord: ["D3", "F3", "A3"],
    dense: ["D4", "A3", "F3", "A3", "D4", "F4", "A3", "F3"],
    sparse: ["D4", null, "A3", null, "F3", null, "A3", null] },
  { bass: ["Bb2", "Bb2", "F2", "Bb2"], chord: ["Bb3", "D4", "F4"],
    dense: ["F4", "D4", "Bb3", "D4", "F4", "Bb4", "D4", "Bb3"],
    sparse: ["F4", null, "D4", null, "Bb3", null, "D4", null] },
  { bass: ["F2", "F2", "C3", "F2"], chord: ["F3", "A3", "C4"],
    dense: ["C4", "A3", "F3", "A3", "C4", "F4", "A3", "F3"],
    sparse: ["C4", null, "A3", null, "F3", null, "A3", null] },
  { bass: ["C3", "C3", "G2", "C3"], chord: ["C4", "E4", "G4"],
    dense: ["G4", "E4", "C4", "E4", "D4", "C4", "A3", "G3"],
    sparse: ["G4", null, "E4", null, "C4", null, "D4", null] },
];

function makeNoiseBuffer(ctx) {
  const length = ctx.sampleRate * 1;
  const buf = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function makeReverbImpulse(ctx, duration = 2.8, decay = 3.2) {
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * duration);
  const impulse = ctx.createBuffer(2, length, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
  }
  return impulse;
}

export function createBgMusicEngine() {
  let ctx = null;
  let master, dry, wetSend, noiseBuffer;
  let timerId = null;
  let playing = false;
  let step = 0; // 0..31 (4 bar x 8 step)
  let loopCount = 0;
  let nextNoteTime = 0;

  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);

    dry = ctx.createGain();
    dry.gain.value = 1;
    dry.connect(master);

    const convolver = ctx.createConvolver();
    convolver.buffer = makeReverbImpulse(ctx);
    wetSend = ctx.createGain();
    wetSend.gain.value = 0.55;
    wetSend.connect(convolver);
    convolver.connect(master);

    noiseBuffer = makeNoiseBuffer(ctx);
    nextNoteTime = ctx.currentTime + 0.1;
  }

  function playKick(time) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(120, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.18);
    g.gain.setValueAtTime(0.85, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.38);
    osc.connect(g); g.connect(dry); g.connect(wetSend);
    osc.start(time); osc.stop(time + 0.4);
  }

  function playWarDrum(time, accent = false) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = accent ? 1400 : 1900; bp.Q.value = 0.9;
    const g = ctx.createGain();
    g.gain.setValueAtTime(accent ? 0.55 : 0.32, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + (accent ? 0.3 : 0.16));
    src.connect(bp); bp.connect(g); g.connect(dry); g.connect(wetSend);
    src.start(time); src.stop(time + 0.35);
  }

  function playCrash(time) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass"; hp.frequency.value = 2200;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.28, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 1.6);
    src.connect(hp); hp.connect(g); g.connect(dry); g.connect(wetSend);
    src.start(time); src.stop(time + 1.7);
  }

  function playBass(freq, time, dur) {
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, time);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(0.38, time + 0.02);
    g.gain.setValueAtTime(0.38, time + dur * 0.55);
    g.gain.linearRampToValueAtTime(0, time + dur);
    osc.connect(g); g.connect(dry); g.connect(wetSend);
    osc.start(time); osc.stop(time + dur + 0.05);
  }

  function playPad(freqs, time, dur, bright) {
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = bright ? 1500 : 1000;
    filter.Q.value = 0.4;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(0.16, time + 1.0);
    g.gain.setValueAtTime(0.16, time + dur - 0.7);
    g.gain.linearRampToValueAtTime(0, time + dur);
    filter.connect(g); g.connect(dry); g.connect(wetSend);
    freqs.forEach((f) => {
      [-5, 5].forEach((detune) => {
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.value = f;
        osc.detune.value = detune;
        osc.connect(filter);
        osc.start(time); osc.stop(time + dur + 0.1);
      });
    });
  }

  function playMelody(freq, time, dur, velocity) {
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, time);
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 5.5;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 3;
    lfo.connect(lfoGain); lfoGain.connect(osc.detune);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(velocity, time + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.connect(g); g.connect(dry); g.connect(wetSend);
    osc.start(time); lfo.start(time);
    osc.stop(time + dur + 0.05); lfo.stop(time + dur + 0.05);
  }

  function scheduleStep(s, time) {
    const bar = Math.floor(s / 8) % 4;
    const sub = s % 8;
    const bars = PROGRESSION[bar];
    const dense = loopCount % 2 === 0;

    if (sub === 0) {
      playPad(bars.chord.map((n) => HZ[n]), time, BEAT * 4, dense);
      if (bar === 0 && loopCount % 4 === 0) playCrash(time);
    }
    if (sub % 2 === 0) {
      playBass(HZ[bars.bass[sub / 2]], time, BEAT * 0.9);
      playKick(time);
    } else {
      playWarDrum(time, sub === 3 || sub === 7);
    }
    const mel = (dense ? bars.dense : bars.sparse)[sub];
    if (mel) playMelody(HZ[mel], time, STEP * 1.6, dense ? 0.2 : 0.15);
  }

  function scheduler() {
    while (nextNoteTime < ctx.currentTime + SCHEDULE_AHEAD) {
      scheduleStep(step, nextNoteTime);
      nextNoteTime += STEP;
      step++;
      if (step >= 32) { step = 0; loopCount++; }
    }
  }

  return {
    start() {
      init();
      if (ctx.state === "suspended") ctx.resume();
      if (playing) return;
      playing = true;
      nextNoteTime = ctx.currentTime + 0.1;
      timerId = setInterval(scheduler, LOOKAHEAD_MS);
    },
    stop() {
      playing = false;
      if (timerId) clearInterval(timerId);
      timerId = null;
      if (ctx && ctx.state === "running") ctx.suspend();
    },
    isPlaying() { return playing; },
  };
}
