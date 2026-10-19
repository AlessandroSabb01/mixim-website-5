/* ===================== tiny WebAudio synth: 2-bar genre sketches and sound-design palettes ===================== */
const SYNTH = (() => {
  let ac = null, out = null, live = [], endT = 0, onEnd = null, timer = 0;
  const ctx = () => {
    if (!ac) {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      out = ac.createGain(); out.gain.value = 0.55;
      const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
      out.connect(comp); comp.connect(ac.destination);
    }
    if (ac.state === "suspended") ac.resume();
    return ac;
  };
  let noiseBuf = null;
  const noise = () => { if (!noiseBuf) { const n = ac.sampleRate; noiseBuf = ac.createBuffer(1, n, n); const d = noiseBuf.getChannelData(0); let s = 7; for (let i = 0; i < n; i++) { s = (s * 16807) % 2147483647; d[i] = (s / 2147483647) * 2 - 1; } } return noiseBuf; };
  const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const env = (g, t, a, peak, d, sus = 0.0001) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(Math.max(sus, 0.0001), t + a + d); };
  const track = (n, stopAt) => { live.push(n); try { n.stop(stopAt); } catch {} };
  function osc(t, f, { type = "sine", dur = 0.3, gain = 0.2, a = 0.003, glide = null, cut = null, q = 1, pan = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
    if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + dur);
    let node = o;
    if (cut) { const fl = ac.createBiquadFilter(); fl.type = "lowpass"; fl.Q.value = q; if (Array.isArray(cut)) { fl.frequency.setValueAtTime(cut[0], t); fl.frequency.exponentialRampToValueAtTime(cut[1], t + dur); } else fl.frequency.value = cut; o.connect(fl); node = fl; }
    const p = ac.createStereoPanner ? ac.createStereoPanner() : null; if (p) p.pan.value = pan;
    node.connect(g); (p ? (g.connect(p), p) : g).connect(out);
    env(g, t, a, gain, dur); o.start(t); track(o, t + dur + 0.05);
  }
  function nz(t, { dur = 0.1, gain = 0.2, type = "highpass", f = 6000, q = 0.8, to = null, pan = 0 } = {}) {
    const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noise(); fl.type = type; fl.frequency.setValueAtTime(f, t); fl.Q.value = q; if (to) fl.frequency.exponentialRampToValueAtTime(to, t + dur);
    const p = ac.createStereoPanner ? ac.createStereoPanner() : null; if (p) p.pan.value = pan;
    s.connect(fl); fl.connect(g); (p ? (g.connect(p), p) : g).connect(out);
    env(g, t, 0.002, gain, dur); s.start(t, Math.random() * 0.5); track(s, t + dur + 0.05);
  }
  const kick = (t, v = 1, hard = false) => { osc(t, hard ? 190 : 150, { glide: 44, dur: 0.32, gain: 0.9 * v }); nz(t, { dur: 0.012, gain: 0.25 * v, f: 3000 }); };
  const snare = (t, v = 1) => { nz(t, { dur: 0.16, gain: 0.32 * v, type: "bandpass", f: 1900, q: 0.7 }); osc(t, 220, { glide: 160, dur: 0.08, gain: 0.18 * v }); };
  const clap = (t, v = 1) => { [0, 0.011, 0.022].forEach((d) => nz(t + d, { dur: 0.05, gain: 0.26 * v, type: "bandpass", f: 1400, q: 1.2 })); nz(t + 0.03, { dur: 0.16, gain: 0.12 * v, type: "bandpass", f: 1500 }); };
  const hat = (t, v = 1, open = false, pan = 0.2) => nz(t, { dur: open ? 0.16 : 0.035, gain: 0.12 * v, f: 8000, pan });
  const bass = (t, m, dur, { type = "sawtooth", cut = [2400, 220], gain = 0.3 } = {}) => { osc(t, midi(m), { type, dur, gain, cut, q: 6 }); osc(t, midi(m - 12), { dur, gain: gain * 0.7 }); };
  const chord = (t, ms, dur, { type = "sawtooth", cut = [3600, 500], gain = 0.07, a = 0.004 } = {}) => ms.forEach((m, i) => [-0.07, 0.07].forEach((det, k) => osc(t, midi(m + det), { type, dur, gain, cut, a, pan: k ? 0.3 : -0.3 })));
  const pad_ = (t, ms, dur, gain = 0.05) => ms.forEach((m) => [-0.1, 0.1].forEach((det, k) => osc(t, midi(m + det), { type: "sawtooth", dur, gain, a: dur * 0.35, cut: 1300, pan: k ? 0.4 : -0.4 })));
  const pluck = (t, m, gain = 0.12, pan = 0) => osc(t, midi(m), { type: "triangle", dur: 0.28, gain, cut: [4200, 600], pan });
  const bell = (t, m, gain = 0.1, pan = 0) => { osc(t, midi(m), { dur: 1.1, gain, pan }); osc(t, midi(m) * 2.76, { dur: 0.25, gain: gain * 0.35, pan }); };
  const keysC = (t, ms, dur, gain = 0.06) => ms.forEach((m) => { osc(t, midi(m), { dur, gain, type: "sine" }); osc(t, midi(m) * 2, { dur: dur * 0.4, gain: gain * 0.3 }); });

  const Fm = [53, 56, 60, 63], Db = [49, 53, 56, 60], Ab = [56, 60, 63, 67], Eb = [51, 55, 58, 62];
  // each genre plays two bars at its tempo
  const GENRE = {
    electrofunk: { bpm: 120, play(t, b) { const riff = [[0, 0], [0.75, 0], [1, 12], [1.5, 0], [2, 0], [2.5, 3], [2.75, 5], [3, 7], [3.5, 12], [3.75, 10]];
      for (let bar = 0; bar < 2; bar++) { const o = t + bar * 4 * b, root = bar ? 25 : 29;
        for (let i = 0; i < 4; i++) { kick(o + i * b); hat(o + (i + 0.5) * b, 1.2, true); if (i % 2) clap(o + i * b); }
        riff.forEach(([s, n]) => bass(o + s * b, root + n + 12, b * 0.22, { cut: [2600, 200] }));
        [0.5, 1.75, 2.5, 3.25].forEach((s) => chord(o + s * b, (bar ? Db : Fm).map((m) => m + 12), b * 0.35, { cut: [4200, 400], gain: 0.06 })); } } },
    techno: { bpm: 128, play(t, b) { for (let bar = 0; bar < 2; bar++) { const o = t + bar * 4 * b;
        for (let i = 0; i < 4; i++) { kick(o + i * b, 1, true); osc(o + (i + 0.5) * b, midi(29), { type: "sawtooth", dur: b * 0.4, gain: 0.12, cut: [600, 120], q: 4 }); for (let s = 0; s < 4; s++) hat(o + (i + s / 4) * b, s === 2 ? 1.3 : 0.6, s === 2, s % 2 ? 0.3 : -0.3); if (i % 2) clap(o + i * b, 0.7); }
        [0.75, 2.75].forEach((s) => chord(o + s * b, [65, 68, 72], b * 0.5, { type: "square", cut: [2600, 300], gain: 0.05 })); } } },
    lofi: { bpm: 84, play(t, b) { for (let bar = 0; bar < 2; bar++) { const o = t + bar * 4 * b;
        kick(o, 0.8); kick(o + 1.62 * b, 0.6); kick(o + 2.5 * b, 0.7); snare(o + b, 0.7); snare(o + 3 * b, 0.7);
        for (let i = 0; i < 8; i++) hat(o + (i * 0.5 + (i % 2 ? 0.08 : 0)) * b, 0.5);
        keysC(o, (bar ? Db : Fm).map((m) => m + 12), 4 * b * 0.95, 0.05); bass(o, bar ? 37 : 41, b * 1.5, { type: "triangle", cut: 600, gain: 0.25 }); nz(o, { dur: 4 * b, gain: 0.015, f: 3000, type: "bandpass" }); } } },
    cinematic: { bpm: 90, play(t, b) { pad_(t, [41, 53, 56, 60], 8 * b, 0.05); [0, 2.5, 4, 6.5].forEach((s, i) => { osc(t + s * b, 55, { glide: 34, dur: 1.2, gain: 0.8 }); nz(t + s * b, { dur: 0.6, gain: 0.25, type: "lowpass", f: 900 }); });
        [72, 75, 77, 80].forEach((m, i) => bell(t + (4 + i * 0.75) * b, m, 0.07)); } },
    corporate: { bpm: 112, play(t, b) { const arp = [0, 4, 7, 12, 7, 4];
        for (let bar = 0; bar < 2; bar++) { const o = t + bar * 4 * b, root = bar ? 65 : 60;
          for (let i = 0; i < 4; i++) { kick(o + i * b, 0.7); if (i % 2) clap(o + i * b, 0.8); hat(o + (i + 0.5) * b, 0.8); }
          for (let s = 0; s < 16; s++) pluck(o + s * b / 4, root + arp[s % 6], 0.08, s % 2 ? 0.35 : -0.35);
          chord(o, [root, root + 4, root + 7].map((m) => m - 12), 4 * b * 0.9, { type: "triangle", cut: 2600, gain: 0.04, a: 0.05 }); } } },
    ambient: { bpm: 70, play(t, b) { pad_(t, [53, 60, 63, 67], 8 * b, 0.06); [77, 84, 82, 79, 77, 75].forEach((m, i) => bell(t + i * 1.3 * b, m, 0.06, -0.4 + i * 0.16)); nz(t, { dur: 8 * b, gain: 0.02, type: "bandpass", f: 2400, to: 6000 }); } },
  };
  // sound-design palettes: four signature moves each
  const SFX = {
    glassy: (t) => { osc(t, 1650, { glide: 1900, dur: 0.06, gain: 0.25 }); [84, 87, 91].forEach((m, i) => osc(t + 0.25 + i * 0.07, midi(m), { dur: 0.3, gain: 0.12, pan: -0.3 + i * 0.3 })); Fm.forEach((m) => osc(t + 0.75, midi(m + 12), { dur: 1.2, gain: 0.05, a: 0.18 })); nz(t + 1.55, { dur: 0.45, gain: 0.12, type: "bandpass", f: 600, to: 4000 }); },
    punchy: (t) => { osc(t, 360, { glide: 90, dur: 0.25, gain: 0.6 }); nz(t, { dur: 0.05, gain: 0.3, type: "bandpass", f: 3000 }); osc(t + 0.4, 700, { glide: 3000, dur: 0.2, gain: 0.08 }); nz(t + 0.4, { dur: 0.2, gain: 0.15, type: "bandpass", f: 1200, to: 7000 }); osc(t + 0.8, 82, { glide: 40, dur: 0.6, gain: 0.8 }); kick(t + 1.3, 1, true); clap(t + 1.3, 1); },
    robotic: (t) => { [0, 0.09, 0.18].forEach((d, i) => osc(t + d, [880, 1320, 660][i], { type: "square", dur: 0.06, gain: 0.07, cut: 3000 })); osc(t + 0.45, 220, { type: "square", glide: 1760, dur: 0.3, gain: 0.06, cut: 4000 }); for (let i = 0; i < 6; i++) osc(t + 0.9 + i * 0.05, 1200 + i * 180, { type: "square", dur: 0.03, gain: 0.05 }); osc(t + 1.35, 110, { type: "sawtooth", glide: 55, dur: 0.5, gain: 0.12, cut: 900 }); },
    organic: (t) => { osc(t, 520, { glide: 380, dur: 0.12, gain: 0.3, type: "triangle" }); nz(t, { dur: 0.04, gain: 0.12, type: "bandpass", f: 2200 }); [67, 72, 75].forEach((m, i) => pluck(t + 0.35 + i * 0.12, m, 0.14, -0.3 + i * 0.3)); nz(t + 0.95, { dur: 0.6, gain: 0.08, type: "bandpass", f: 900, to: 1800, q: 0.5 }); osc(t + 1.5, 196, { dur: 0.7, gain: 0.14, type: "triangle" }); },
    minimal: (t) => { osc(t, 2100, { dur: 0.04, gain: 0.12 }); osc(t + 0.6, 2100, { dur: 0.04, gain: 0.1 }); osc(t + 1.2, midi(84), { dur: 0.6, gain: 0.08 }); },
  };
  function stop() { clearTimeout(timer); live.forEach((n) => { try { n.stop(); } catch {} }); live = []; const cb = onEnd; onEnd = null; cb?.(); }
  function run(fn, len, cb) {
    stop(); ctx();
    const t = ac.currentTime + 0.05; fn(t); endT = t + len; onEnd = cb;
    timer = setTimeout(() => { live = []; const c = onEnd; onEnd = null; c?.(); }, (len + 0.3) * 1000);
  }
  return {
    music(id, cb) { const g = GENRE[id]; if (!g) return; const b = 60 / g.bpm; run((t) => g.play(t, b), 8 * b, cb); },
    sfx(id, cb) { const f = SFX[id]; if (!f) return; run(f, 2.2, cb); },
    stop,
    progress() { return ac ? clamp(1 - (endT - ac.currentTime) / 4, 0, 1) : 0; },
  };
})();
