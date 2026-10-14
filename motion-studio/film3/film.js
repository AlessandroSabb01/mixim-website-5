/* Création Virale — v3 hook test (8.5 s, 9:16). After-Effects-style kinetic type over glowing colour fields,
   client footage living inside morphing shapes, floating 3D deco. Brand blue leads (>50% of colour),
   violet / pink / lime are accents. window.seek(t) paints frame t (pure function of t). */
(() => {
  const P = new URLSearchParams(location.search);
  const W = +(P.get("w") || 1080), H = +(P.get("h") || 1920);
  const A = "../assets/";
  const C = { bg: "#050505", white: "#FFFFFF", blue: "#2C5BFF", blueHi: "#6A8CFF", violet: "#8B5CF6", pink: "#FF3D8B", lime: "#C6FF3D" };
  const rgba = (hex, a) => { const v = parseInt(hex.slice(1), 16); return `rgba(${v >> 16},${(v >> 8) & 255},${v & 255},${a})`; };

  /* ---------- math ---------- */
  function mulberry32(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const hash = (i, seed = 1) => mulberry32((Math.imul(i | 0, 2654435761) ^ Math.imul(seed, 40503)) >>> 0)();
  const vnoise = (x, seed) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash(i, seed) * (1 - u) + hash(i + 1, seed) * u; };
  const sn = (x, seed) => (vnoise(x, seed) - 0.5) * 2;
  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const lerp = (a, b, t) => a + (b - a) * t;
  const ez = {
    outExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    inExpo: (t) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
    inOutExpo: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2),
    outCubic: (t) => 1 - Math.pow(1 - t, 3),
    inCubic: (t) => t * t * t,
    outBack: (t) => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
  };
  const spring = (dt, f = 2.4, d = 7) => (dt <= 0 ? 0 : 1 - Math.exp(-d * dt) * Math.cos(2 * Math.PI * f * dt));

  /* ---------- beat grid ---------- */
  let BTS = [], PER = 0.5;
  const bt = (b) => { const n = BTS.length; if (b <= 0) return BTS[0] + b * PER; if (b >= n - 1) return BTS[n - 1] + (b - n + 1) * PER; const i = Math.floor(b); return BTS[i] + (b - i) * (BTS[i + 1] - BTS[i]); };
  const tb = (t) => (t - BTS[0]) / PER;
  const pb = (t, b0, b1) => clamp((t - bt(b0)) / (bt(b1) - bt(b0)));
  const pr = (t, b, sec) => clamp((t - bt(b)) / sec);
  const since = (t, b) => t - bt(b);
  const CUES = [];
  const cue = (beat, type, gain = 1, pan = 0, extra = {}) => CUES.push({ beat, type, gain, pan, ...extra });

  /* ---------- DOM ---------- */
  const stage = document.getElementById("stage");
  Object.assign(stage.style, { width: W + "px", height: H + "px" });
  const el = (parent, css = {}, tag = "div", cls = "a") => { const e = document.createElement(tag); e.className = cls; Object.assign(e.style, css); parent.appendChild(e); return e; };
  const vis = (e, v) => { e.style.visibility = v ? "visible" : "hidden"; };
  function T(e, o = {}) {
    const { x = 0, y = 0, z = 0, s = 1, sx = 1, sy = 1, r = 0, rx = 0, ry = 0, op = 1 } = o;
    e.style.transform = `translate3d(${x}px,${y}px,${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotate(${r}deg) scale(${s * sx},${s * sy})`;
    e.style.opacity = op;
    vis(e, op > 0.001);
  }
  const font = (size, weight = 800, lh = 1.0, track = -0.045) => ({ font: `${weight} ${size}px/${lh} Geist`, letterSpacing: `${track}em` });
  const mctx = document.createElement("canvas").getContext("2d");
  const measure = (s, size, weight = 800, track = -0.045) => { mctx.font = `${weight} ${size}px Geist`; mctx.letterSpacing = `${track * size}px`; return mctx.measureText(s).width; };

  /* ---------- footage: frame sequences ---------- */
  let USES = {};
  const pending = [];
  function frameOf(c, id, local) {
    const u = USES[id];
    const i = Math.max(0, Math.min(u.frames - 1, Math.floor(local * 30 + 1e-6))) + 1;
    const src = `${A}broll/frames/${id}/${String(i).padStart(4, "0")}.jpg`;
    if (c.cur !== src) { c.cur = src; c.img.src = src; pending.push(c.img.decode().catch(() => {})); }
  }

  /* ---------- shapes: one clip-path family, so any shape can morph into any other ---------- */
  // box aspect (w/h) + four corner radii in % of the box. Same family = smooth morphs.
  const SH = {
    circle:   { a: 1.0,  r: [50, 50, 50, 50] },
    squircle: { a: 0.8,  r: [22, 22, 22, 22] },
    arch:     { a: 0.7,  r: [50, 50, 7, 7] },
    leaf:     { a: 0.85, r: [50, 7, 50, 7] },
    pill:     { a: 0.56, r: [50, 50, 50, 50] },
    drop:     { a: 0.9,  r: [50, 50, 50, 8] },
    card:     { a: 0.5625, r: [9, 9, 9, 9] },
  };
  const mixShape = (A_, B_, k) => ({ a: lerp(A_.a, B_.a, k), r: A_.r.map((v, i) => lerp(v, B_.r[i], k)) });
  function shapeClip(parent) {
    const box = el(parent, { overflow: "hidden", background: "#0b0b0b", transformOrigin: "50% 50%", willChange: "transform" });
    const img = el(box, { width: "100%", height: "100%", objectFit: "cover", display: "block" }, "img", "");
    img.decoding = "sync";
    const rim = el(box, { inset: 0, width: "100%", height: "100%", boxShadow: "inset 0 0 0 2px rgba(255,255,255,.14)" });
    return { box, img, rim, cur: "" };
  }
  // place a shape clip: centre (cx, cy), area-normalised size `size` (height of box), shape spec, transforms
  function putShape(c, sp, cx, cy, size, o = {}) {
    const h = size, w = size * sp.a;
    Object.assign(c.box.style, { width: w + "px", height: h + "px", borderRadius: `${sp.r[0]}% ${sp.r[1]}% ${sp.r[2]}% ${sp.r[3]}%` });
    c.rim.style.borderRadius = c.box.style.borderRadius;
    T(c.box, { x: cx - w / 2, y: cy - h / 2, ...o });
  }

  /* ---------- layers ---------- */
  const cam = el(stage, { width: W + "px", height: H + "px", transformOrigin: "50% 50%" });
  // each layer is flat (stacking by zIndex, text always above footage) with its own perspective for its children
  const layer = (z) => el(cam, { width: W + "px", height: H + "px", zIndex: z, perspective: "1700px", perspectiveOrigin: "50% 50%" });
  const S = {};

  /* ===== colour field: drifting glow blobs (blue leads) ===== */
  const BLOBS = [
    { c: C.blue, x: 0.3, y: 0.3, s: 1.25 }, { c: C.blue, x: 0.75, y: 0.72, s: 1.35 }, { c: C.blueHi, x: 0.55, y: 0.5, s: 0.9 },
    { c: C.violet, x: 0.85, y: 0.2, s: 0.85 }, { c: C.pink, x: 0.15, y: 0.85, s: 0.75 },
  ];
  // per-cut accent during the shape burst (b8-12): blue keeps the majority
  const CUT_ACC = [C.blue, C.violet, C.blue, C.pink, C.blue, C.lime, C.blue, C.violet];
  function buildField() {
    const root = layer(1);
    const D = 1200;
    S.blobs = BLOBS.map((b) => el(root, { width: D + "px", height: D + "px", borderRadius: "50%", mixBlendMode: "screen",
      background: `radial-gradient(circle, ${rgba(b.c, 0.85)} 0%, ${rgba(b.c, 0.35)} 32%, ${rgba(b.c, 0.08)} 55%, ${rgba(b.c, 0)} 70%)` }));
    S.acc = el(root, { width: D + "px", height: D + "px", borderRadius: "50%", mixBlendMode: "screen" });
    S.vignette = el(root, { width: W + "px", height: H + "px", background: "radial-gradient(ellipse at 50% 50%, rgba(5,5,5,0) 40%, rgba(5,5,5,.75) 100%)" });
    S.fieldD = D;
  }
  function field(t) {
    const b = tb(t), D = S.fieldD;
    // energy: dark before b0, a punch on each hook word, a big swell at b3, pumping with the kick from b8
    let en = 0.25 + 0.2 * clamp((t - bt(-0.5)) / 0.4);
    for (let i = 0; i < 4; i++) { const d = since(t, i); if (d >= 0) en += (i === 3 ? 0.55 : 0.18) * Math.exp(-d / (i === 3 ? 0.7 : 0.25)); }
    if (b >= 3) en += 0.15;
    if (b >= 5.6 && b < 8) en *= 1 - 0.55 * ez.inCubic(pb(t, 5.6, 6.2)) + 0.4 * pb(t, 6, 8);
    if (b >= 8) { const ph = b - Math.floor(b); en = 0.62 + 0.3 * (1 - Math.exp(-ph * PER / 0.16)); }
    if (b >= 15.5) en += 0.6 * ez.inExpo(pb(t, 15.5, 16)) * (1 - pr(t, 16, 0.9));
    BLOBS.forEach((bl, i) => {
      const x = W * (bl.x + 0.16 * sn(t * 0.32 + i * 7, 11 + i)), y = H * (bl.y + 0.12 * sn(t * 0.27 + i * 3, 21 + i));
      const big = 1 + 0.35 * Math.exp(-Math.max(0, since(t, 3)) / 0.8) * (t >= bt(3) ? 1 : 0);
      T(S.blobs[i], { x: x - D / 2, y: y - D / 2, s: bl.s * big * (0.9 + 0.15 * en), op: clamp(en * (i < 3 ? 1 : 0.75)) });
    });
    // accent blob follows the cut colour in the burst, rests on violet otherwise
    const ci = clamp(Math.floor((b - 8) * 2), 0, 7);
    const ac = b >= 8 && b < 12 ? CUT_ACC[ci] : b >= 12 ? C.blue : C.violet;
    S.acc.style.background = `radial-gradient(circle, ${rgba(ac, 0.9)} 0%, ${rgba(ac, 0.3)} 35%, ${rgba(ac, 0)} 68%)`;
    const ax = W * (0.5 + 0.1 * sn(t * 0.5, 5)), ay = H * (0.5 + 0.08 * sn(t * 0.4, 6));
    const aop = b >= 8 ? 0.55 + 0.35 * Math.exp(-Math.max(0, since(t, 8 + ci * 0.5)) / 0.25) : 0.25 * clamp(en);
    T(S.acc, { x: ax - D / 2, y: ay - D / 2, s: 1.1, op: aop });
  }

  /* ===== floating deco: hairline rings, outline squircles, crosses, dots, in depth ===== */
  const DECO_N = 18;
  function buildDeco() {
    const back = layer(2), front = layer(6);
    S.deco = [];
    for (let i = 0; i < DECO_N; i++) {
      const kind = ["ring", "sq", "plus", "dot", "pill", "ring", "dot"][i % 7];
      const col = [C.white, C.blueHi, C.white, C.blue, C.white, C.violet, C.pink, C.blue, C.lime][i % 9];
      const sz = 40 + hash(i, 3) * 140;
      const z = -900 + hash(i, 4) * 1100;
      const host = z > -150 && i % 3 === 0 ? front : back;
      const css = { width: sz + "px", height: (kind === "pill" ? sz * 0.42 : sz) + "px", boxSizing: "border-box", transformOrigin: "50% 50%" };
      let e;
      if (kind === "ring") e = el(host, { ...css, borderRadius: "50%", border: `3px solid ${rgba(col, 0.75)}` });
      else if (kind === "sq") e = el(host, { ...css, borderRadius: "26%", border: `3px solid ${rgba(col, 0.7)}` });
      else if (kind === "pill") e = el(host, { ...css, borderRadius: "999px", border: `3px solid ${rgba(col, 0.7)}` });
      else if (kind === "dot") e = el(host, { ...css, width: sz * 0.32 + "px", height: sz * 0.32 + "px", borderRadius: "50%", background: col, boxShadow: `0 0 40px ${rgba(col, 0.8)}` });
      else { e = el(host, css); e.innerHTML = `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M12 4v16M4 12h16" stroke="${rgba(col, 0.8)}" stroke-width="2.2" stroke-linecap="round"/></svg>`; }
      S.deco.push({ e, x: hash(i, 1), y: hash(i, 2), z, sz, rs: (hash(i, 5) - 0.5) * 70, seed: i });
    }
  }
  function deco(t) {
    const b = tb(t);
    const kick = t >= bt(3) ? spring(since(t, 3), 1.2, 4.5) : 0;            // b3: everything is blown outward
    const suck = ez.inExpo(pb(t, 15.4, 16));                                    // b16: everything rushes to the centre
    S.deco.forEach((d) => {
      const fx = W * (d.x + 0.05 * sn(t * 0.4, d.seed)), fy = H * (d.y + 0.04 * sn(t * 0.35, d.seed + 40)) - t * 40 * (1 + d.z / 1200);
      let x = fx - W / 2, y = fy - H / 2;
      const push = 1 + 0.45 * kick * (t < bt(5.6) ? 1 : 1 - pb(t, 5.6, 6.2));
      x *= push * (1 - suck); y *= push * (1 - suck);
      const pulse = b >= 8 ? 1 + 0.12 * Math.exp(-(b - Math.floor(b)) * PER / 0.12) : 1;
      const appear = clamp((t - bt(-1) - d.seed * 0.03) / 0.6);
      T(d.e, { x: W / 2 + x - d.sz / 2, y: H / 2 + y - d.sz / 2, z: d.z, r: d.rs * t + d.seed * 20, rx: 25 * Math.sin(t * 0.7 + d.seed), ry: 30 * Math.cos(t * 0.6 + d.seed),
        s: pulse * (1 - 0.8 * suck), op: appear * (b >= 5.8 && b < 6.6 ? 0.35 : 1) * (1 - pr(t, 16, 0.4)) });
    });
  }

  /* ===== hook: one slam per word, footage morphing behind (b0-6) ===== */
  const HOOK = ["Votre", "business", "mérite", "d'exploser."];
  const HOOK_SH = ["circle", "squircle", "arch"];
  const ORBIT = [["circle", -0.32, -0.27, 330], ["pill", 0.33, -0.22, 400], ["leaf", -0.36, 0.2, 340], ["drop", 0.34, 0.25, 330], ["squircle", 0.02, -0.4, 250], ["arch", 0.0, 0.38, 290]];
  function buildHook() {
    const root = layer(4);
    S.hookShapes = ORBIT.map(() => shapeClip(root));
    const tx = layer(5);
    S.hookWords = HOOK.map((w, i) => {
      const size = Math.min(i === 3 ? 230 : 300, ((W - 110) / measure(w, 100)) * 100);
      const d = el(tx, { ...font(size), color: C.white, whiteSpace: "pre", textShadow: "0 12px 70px rgba(0,0,0,.45)", transformOrigin: "50% 55%" });
      if (i === 3) {
        d.textContent = "";
        const letters = [...w].map((ch) => { const s = el(d, { display: "inline-block", position: "relative", backgroundImage: `linear-gradient(100deg, #B9C8FF, ${C.blueHi} 30%, #8E7BFF 70%, #FF6FA8)`,
          backgroundSize: `${measure(w, size)}px 100%`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", textShadow: "none", filter: `drop-shadow(0 0 30px ${rgba(C.blue, 0.65)})` }, "span", ""); s.textContent = ch; return s; });
        let acc = 0; letters.forEach((s) => { s.style.backgroundPosition = `${-acc}px 0`; acc += measure(s.textContent, size); });
        return { d, size, wd: measure(w, size), letters };
      }
      d.textContent = w;
      return { d, size, wd: measure(w, size) };
    });
  }
  function hook(t) {
    const b = tb(t);
    const live = b < 6.2;
    // words
    S.hookWords.forEach((w, i) => {
      if (!live) return vis(w.d, false);
      const din = since(t, i) + 0.03, dout = i < 3 ? since(t, i + 1) + 0.03 : since(t, 5.6);
      const x = (W - w.wd) / 2, y = H / 2 - w.size * 0.55;
      if (din < 0 || (i < 3 && dout > 0.16)) return vis(w.d, false);
      const e = ez.outExpo(clamp(din / 0.32));
      const o = i < 3 ? ez.inCubic(clamp(dout / 0.16)) : 0;
      if (i < 3) {
        T(w.d, { x, y, z: -500 * o, s: lerp(1.45, 1, e) * (1 - 0.25 * o), op: clamp(din / 0.05) * (1 - o) });
        w.d.style.letterSpacing = `${lerp(0.12, -0.045, e)}em`;
      } else {
        // d'exploser.: letters assemble from a 3D scatter, breathe, then fly through the camera
        T(w.d, { x, y, s: 1 + 0.025 * Math.sin(Math.max(0, din) * 9) * (b > 3.6 ? 1 : 0), op: 1 });
        w.letters.forEach((s, j) => {
          const e2 = spring(din - j * 0.012, 2.1, 7.5);
          const ang = hash(j, 31) * Math.PI * 2, dist = 300 + hash(j, 32) * 500;
          const fly = ez.inExpo(clamp((since(t, 5.55) - j * 0.02) / 0.35));
          const sx = Math.cos(ang) * dist * (1 - e2), sy = Math.sin(ang) * dist * (1 - e2), sz = (hash(j, 34) - 0.3) * 1400 * (1 - e2) + fly * 1500;
          s.style.transform = `translate3d(${sx}px,${sy}px,${sz}px) rotate(${(hash(j, 33) - 0.5) * 160 * (1 - e2)}deg)`;
          s.style.opacity = clamp(din / 0.05) * (1 - fly);
        });
      }
    });
    // footage: a single shape morphing b0-3 (flip on each beat hides the clip swap), then splitting into six orbiting shapes
    S.hookShapes.forEach((c, k) => {
      if (!live) return vis(c.box, false);
      if (b < 3 - 0.05) {
        if (k > 0) return vis(c.box, false);
        const i = clamp(Math.floor(b + 0.05), 0, 2);
        const d = since(t, i) + 0.05, e = ez.outExpo(clamp(d / 0.34));
        const from = SH[HOOK_SH[Math.max(0, i - 1)]], to = SH[HOOK_SH[i]];
        const sp = i === 0 ? to : mixShape(from, to, e);
        const size = lerp(i === 0 ? 0 : [560, 760, 820][i - 1], [560, 760, 820][i], i === 0 ? ez.outBack(clamp(d / 0.4)) : e);
        putShape(c, sp, W / 2, H / 2, Math.max(1, size), { ry: (i % 2 ? -1 : 1) * 75 * (1 - e) * (i ? 1 : 0), r: [0, -7, 6][i] * e, op: clamp((t - bt(-0.1)) / 0.1) });
        frameOf(c, `hook${i}`, Math.max(0, t));
        return;
      }
      // split: b3 -> six shapes spring out to orbit slots, orbit during b3-5.6, collapse into the centre by b6
      const [shp, ox, oy, size] = ORBIT[k];
      const d = since(t, 3) + 0.05, e = spring(d - k * 0.02, 1.6, 6.5);
      const ang = (b - 3) * 0.12;
      const rx_ = ox * Math.cos(ang) - oy * 0.56 * Math.sin(ang), ry_ = oy * Math.cos(ang) + (ox / 0.56) * Math.sin(ang) * 0.3;
      const col = ez.inExpo(pb(t, 5.5, 6.05));
      const cx = W / 2 + rx_ * W * e * (1 - col), cy = H / 2 + ry_ * H * e * (1 - col);
      putShape(c, SH[shp], cx, cy, size * (0.35 + 0.65 * clamp(e, 0, 1.15)) * (1 - 0.9 * col), { z: -200 + 100 * Math.sin(k + b), r: (k % 2 ? 1 : -1) * (8 + 4 * Math.sin(b + k)), ry: 18 * Math.sin(t * 1.3 + k), op: 1 - col });
      frameOf(c, `hook${k}`, Math.max(0, t) + k * 0.3);
    });
  }

  /* ===== "Voici comment." (b6-8): left-aligned type, a blue marker, three shapes ===== */
  function buildVoici() {
    const root = layer(5);
    const size = 190, m = 80;
    const mk = (s, y) => { const mask = el(root, { left: m + "px", top: y + "px", overflow: "hidden", padding: "0.12em 0.1em 0.18em 0", width: W - m + "px" }); const ink = el(mask, { ...font(size), color: C.white, whiteSpace: "pre", position: "relative", transformOrigin: "0 100%" }, "div", ""); ink.textContent = s; return { mask, ink }; };
    const y0 = H * 0.36;
    const marker = el(root, { left: m - 18 + "px", top: y0 + size * 1.02 + 30 + "px", width: measure("comment.", size) + 46 + "px", height: size * 0.98 + "px", borderRadius: "999px", background: C.blue, transformOrigin: "0 50%", boxShadow: `0 0 80px ${rgba(C.blue, 0.7)}` });
    S.voici = { root, a: mk("Voici", y0), b: mk("comment.", y0 + size * 1.02), marker, shapes: ["circle", "squircle", "pill"].map(() => shapeClip(root)) };
  }
  function voici(t) {
    const V = S.voici, b = tb(t);
    const live = b >= 5.9 && b < 8.05;
    vis(V.root, live);
    if (!live) { V.shapes.forEach((c) => vis(c.box, false)); return; }
    const out = ez.inExpo(pb(t, 7.7, 8.02));
    const riseIn = (o, b0) => { const e = ez.outExpo(pr(t, b0 - 0.03, 0.34)); o.ink.style.transform = `translateY(${(1 - e) * 115}%) scaleY(${1 + (1 - e) * 0.25})`; };
    riseIn(V.a, 6); riseIn(V.b, 7);
    T(V.marker, { sx: ez.outExpo(pr(t, 7.05, 0.32)), op: t >= bt(7) ? 1 : 0 });
    T(V.root, { s: 1 + out * 1.8, z: out * 400, op: 1 - out });
    V.root.style.transformOrigin = "50% 45%";
    V.shapes.forEach((c, k) => {
      const d = since(t, 6 + k * 0.5) + 0.03, e = ez.outExpo(clamp(d / 0.4));
      if (d < 0) return vis(c.box, false);
      putShape(c, SH[["circle", "squircle", "pill"][k]], 220 + k * 300 + (1 - e) * 600, H * 0.74, 300, { r: (1 - e) * 40, ry: (1 - e) * -70, op: clamp(d / 0.05) });
      frameOf(c, `tile${k * 5}`, Math.max(0, d));
    });
  }

  /* ===== shape burst (b8-12): eight cuts on 8ths, one morphing hero shape, marquee rows ===== */
  const CUT_SH = ["circle", "arch", "squircle", "leaf", "pill", "drop", "card", "circle"];
  function buildBurst() {
    const root = layer(3);
    const rows = [];
    for (let r = 0; r < 4; r++) {
      const solid = r % 2 === 1;
      const d = el(root, { ...font(210, 800, 1, -0.04), whiteSpace: "pre", color: solid ? rgba(C.white, 0.09) : "transparent", WebkitTextStroke: solid ? "0" : `2px ${rgba(C.white, 0.22)}`, transformOrigin: "0 50%" });
      d.textContent = "CRÉATION VIRALE · ".repeat(6);
      rows.push(d);
    }
    S.burst = { root, rows, hero: shapeClip(layer(4)) };
  }
  function burst(t) {
    const Bu = S.burst, b = tb(t);
    const live = b >= 7.9 && b < 16.2;
    vis(Bu.root, live);
    if (!live) return vis(Bu.hero.box, false);
    // marquee: four rows, alternating directions, tilted, from the drop to the end
    const rw = measure("CRÉATION VIRALE · ", 210, 800, -0.04);
    Bu.rows.forEach((d, r) => {
      const dir = r % 2 ? 1 : -1, sp = 520 + r * 60;
      const off = ((t - bt(8)) * sp * dir) % rw;
      const y = H * (0.14 + r * 0.24);
      T(d, { x: -rw + off - 200, y, r: -9, op: ez.outExpo(pr(t, 8, 0.5)) * (1 - ez.inExpo(pb(t, 15.4, 16))) });
    });
    if (b >= 12) return vis(Bu.hero.box, false);
    const i = clamp(Math.floor((b - 8) * 2), 0, 7), d = since(t, 8 + i * 0.5) + 0.02;
    const e = ez.outExpo(clamp(d / 0.24));
    const from = SH[CUT_SH[Math.max(0, i - 1)]], to = SH[CUT_SH[i]];
    const sp = mixShape(from, to, e);
    const size = [900, 1150, 1050, 1000, 1250, 980, 1300, 1000][i];
    putShape(Bu.hero, sp, W / 2 + (i % 2 ? 1 : -1) * 30 * (1 - e), H / 2, size * lerp(1.12, 1, e), { ry: (i % 2 ? -1 : 1) * 70 * (1 - e), r: (i % 2 ? 1 : -1) * 4 * (1 - e), op: 1 });
    frameOf(Bu.hero, `burst${i}`, Math.max(0, d));
  }

  /* ===== mosaic (b12-16): five shapes float in 3D around the brand name, then everything is sucked in ===== */
  const MOS = [["circle", -0.27, -0.27, 360, 7], ["pill", 0.3, -0.25, 440, 9], ["arch", -0.3, 0.24, 420, 11], ["leaf", 0.29, 0.26, 360, 13], ["squircle", 0.0, -0.05, 0, 0]];
  function buildMosaic() {
    const root = layer(4);
    S.mos = { root, shapes: MOS.slice(0, 4).map(() => shapeClip(root)) };
    const tx = layer(5);
    const size = 175;
    const word = (s, y, grad) => { const d = el(tx, { ...font(size), whiteSpace: "pre", transformOrigin: "50% 50%",
      ...(grad ? { backgroundImage: `linear-gradient(100deg, #FFFFFF, #C3D0FF 50%, #9DB2FF)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: `drop-shadow(0 0 34px ${rgba(C.blue, 0.7)})` } : { color: C.white, textShadow: "0 10px 60px rgba(0,0,0,.5)" }) });
      d.textContent = s; return { d, w: measure(s, size), y }; };
    S.mos.words = [word("Création", H / 2 - size * 1.05, false), word("Virale.", H / 2 - size * 0.02, true)];
    S.mos.size = size;
  }
  function mosaic(t) {
    const M = S.mos, b = tb(t);
    const live = b >= 11.9 && b < 16.6;
    if (!live) { M.shapes.forEach((c) => vis(c.box, false)); M.words.forEach((w) => vis(w.d, false)); return; }
    const suck = ez.inExpo(pb(t, 15.45, 16));
    const swayY = 9 * Math.sin((t - bt(12)) * 1.6), swayX = 5 * Math.sin((t - bt(12)) * 1.1);
    M.shapes.forEach((c, k) => {
      const [shp, ox, oy, size] = MOS[k];
      const d = since(t, 12 + k * 0.5) + 0.03, e = spring(d, 1.5, 6.5);
      if (d < 0) return vis(c.box, false);
      const cx = W / 2 + ox * W * (1 - suck) + sn(t * 0.6, k + 70) * 18, cy = H / 2 + oy * H * (1 - suck) + sn(t * 0.5, k + 80) * 22;
      putShape(c, SH[shp], cx, cy, size * clamp(e, 0, 1.2) * (1 - 0.95 * suck), { z: -150 + 80 * Math.sin(t + k), rx: swayX + 10 * Math.sin(t * 1.4 + k), ry: swayY + 14 * Math.cos(t * 1.2 + k), r: (k % 2 ? 1 : -1) * (6 + 3 * Math.sin(t * 2 + k)), op: clamp(d / 0.05) });
      frameOf(c, `tile${[3, 8, 14, 19][k]}`, Math.max(0, d));
    });
    M.words.forEach((w, i) => {
      const d = since(t, 12 + i * 0.5) + 0.03, e = ez.outExpo(clamp(d / 0.4));
      if (d < 0) return vis(w.d, false);
      w.d.style.letterSpacing = `${lerp(0.25, -0.045, e)}em`;
      const ww = measure(w.d.textContent, M.size, 800, lerp(0.25, -0.045, e));
      T(w.d, { x: (W - ww) / 2, y: w.y, ry: swayY * 0.4, s: (1 + 0.02 * Math.sin(t * 3)) * (1 + 2.5 * suck), op: clamp(d / 0.06) * (1 - suck) });
    });
  }

  /* ===== flash + camera ===== */
  function buildFlash() {
    S.flash = el(stage, { width: W + "px", height: H + "px", zIndex: 15, mixBlendMode: "screen", background: `radial-gradient(circle at 50% 50%, ${rgba(C.white, 0.9)} 0%, ${rgba(C.blueHi, 0.7)} 25%, ${rgba(C.blue, 0.35)} 55%, ${rgba(C.blue, 0)} 85%)` });
  }
  function flash(t) {
    let f = 0;
    for (const [b, a] of [[3, 0.55], [8, 0.65], [16, 1]]) { const d = since(t, b); if (d >= -0.04) f = Math.max(f, a * (d < 0 ? (d + 0.04) / 0.04 : Math.exp(-d / (b === 16 ? 0.35 : 0.14)))); }
    T(S.flash, { op: f });
  }
  function camera(t) {
    let s = 1, x = 0, y = 0, r = 0;
    for (const [b, a] of [[0, 0.03], [1, 0.03], [2, 0.03], [3, 0.08], [6, 0.02], [7, 0.02], [8, 0.07], [12, 0.03], [16, 0.06]]) { const d = since(t, b); if (d >= 0) s += a * Math.exp(-d / 0.12); }
    for (const [b, a] of [[3, 22], [8, 16], [16, 18]]) { const d = since(t, b); if (d >= 0 && d < 0.6) { const e = a * Math.exp(-d / 0.13); x += e * sn(d * 30, b); y += e * sn(d * 30, b + 50); r += e * 0.025 * sn(d * 22, b + 9); } }
    // drop: every kick nudges the frame
    const b = tb(t);
    if (b >= 8 && b < 16) s += 0.012 * Math.exp(-(b - Math.floor(b)) * PER / 0.08);
    cam.style.transform = `translate(${x}px,${y}px) rotate(${r}deg) scale(${s})`;
  }
  function buildGrain() {
    const g = el(stage, { width: W + 256 + "px", height: H + 256 + "px", zIndex: 20, mixBlendMode: "overlay", opacity: 0.12, pointerEvents: "none" });
    const cv = document.createElement("canvas"); cv.width = cv.height = 256;
    const cx = cv.getContext("2d"), im = cx.createImageData(256, 256), rnd = mulberry32(7);
    for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (rnd() + rnd() + rnd() - 1.5) * 120; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    cx.putImageData(im, 0, 0);
    g.style.backgroundImage = `url(${cv.toDataURL()})`;
    S.grain = g;
  }

  /* ---------- sound design ---------- */
  function buildCues() {
    [0.6, 0.65, 0.72, 0.95].forEach((g, i) => cue(i, "slam", g));
    cue(1, "zip", 0.35, -0.3, { dir: 1 }); cue(2, "zip", 0.35, 0.3, { dir: -1 });
    cue(3, "thump", 0.9); cue(3, "bloom", 0.5); cue(3.05, "sparkle", 0.55);
    [4, 4.5, 5, 5.25].forEach((b, i) => cue(b, "glint", 0.3, -0.4 + i * 0.27, { step: i }));
    cue(5.85, "air", 0.55, 0, { dir: -1 });
    cue(6, "slam", 0.5); cue(7, "slam", 0.55);
    [6, 6.5, 7].forEach((b, i) => cue(b, "zip", 0.3, 0.4 - i * 0.4, { dir: 1 }));
    cue(7.9, "air", 0.6, 0, { dir: 1 });
    cue(8, "thump", 0.85); cue(8, "slam", 0.7); cue(8, "bloom", 0.45);
    for (let i = 1; i < 8; i++) cue(8 + i * 0.5, "zip", 0.32, i % 2 ? 0.4 : -0.4, { dir: i % 2 ? 1 : -1 });
    cue(12, "bloom", 0.5);
    for (let k = 0; k < 4; k++) { cue(12 + k * 0.5, "zip", 0.28, [-0.5, 0.5, -0.45, 0.45][k], { dir: 1 }); cue(12.05 + k * 0.5, "glint", 0.3, [-0.5, 0.5, -0.45, 0.45][k], { step: k + 2 }); }
    cue(12, "slam", 0.5); cue(12.5, "slam", 0.45);
    cue(15.75, "air", 0.6, 0, { dir: -1 });
    cue(16, "thump", 1.0); cue(16, "shimmer", 0.6); cue(16.05, "sparkle", 0.5);
  }

  /* ---------- frame ---------- */
  async function seek(t) {
    pending.length = 0;
    field(t); deco(t); hook(t); voici(t); burst(t); mosaic(t); flash(t); camera(t);
    const f = Math.floor(t * 30 + 1e-6);
    T(S.grain, { x: -Math.floor(hash(f, 3) * 256), y: -Math.floor(hash(f, 4) * 256), op: 0.12 });
    await Promise.all(pending);
  }

  window.DURATION = 8.5;
  window.ready = (async () => {
    const [beats, uses] = await Promise.all([
      fetch("../beats3.json").then((r) => r.json()),
      fetch("../assets/broll/uses.json").then((r) => r.json()),
    ]);
    BTS = beats.beats; PER = beats.period; USES = uses;
    for (const w of ["700", "800"]) await document.fonts.load(`${w} 100px Geist`);
    await document.fonts.ready;
    buildField(); buildDeco(); buildBurst(); buildHook(); buildVoici(); buildMosaic(); buildFlash(); buildGrain(); buildCues();
    window.CUES = CUES.map((c) => ({ ...c, t: bt(c.beat) }));
    window.seek = seek;
    await seek(0);
    return { W, H, FMT: "portrait", cues: CUES.length };
  })();
})();
