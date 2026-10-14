/* Création Virale — showreel v3 (30 s, 9:16). After-Effects-style kinetic type over glowing colour fields,
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
    inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
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
  const fnt = (size, weight = 800, lh = 1.0, track = -0.045, fam = "Geist") => ({ font: `${weight} ${size}px/${lh} ${fam}`, letterSpacing: `${track}em` });
  const measureF = (s, size, weight = 800, track = -0.045, fam = "Geist") => { mctx.font = `${weight} ${size}px ${fam}`; mctx.letterSpacing = `${track * size}px`; return mctx.measureText(s).width; };
  const disp = (e, v) => { e.style.display = v ? "" : "none"; };
  const K = 2.3, px = (v) => v * K;                                   // site CSS px -> frame px (form)
  const GR = {
    brand: `linear-gradient(100deg, #B9C8FF, ${C.blueHi} 30%, #8E7BFF 70%, #FF6FA8)`,
    ice: "linear-gradient(100deg, #FFFFFF, #C3D0FF 50%, #9DB2FF)",
  };
  const gtext = (g, glow = C.blue) => ({ backgroundImage: g, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: `drop-shadow(0 0 30px ${rgba(glow, 0.6)})` });
  const fmt = (v) => Math.round(v).toLocaleString("fr-CA").replace(/[  ]/g, " ");
  // masked text line: { mask, ink }; riseT() slides the ink up through the mask
  function mtext(parent, html, css, x, y) {
    const mask = el(parent, { left: x + "px", top: y + "px", overflow: "hidden", padding: "0.12em 0.12em 0.2em 0.04em", margin: "-0.12em -0.12em -0.2em -0.04em" });
    const ink = el(mask, { whiteSpace: "pre", position: "relative", transformOrigin: "0 100%", ...css }, "div", "");
    ink.innerHTML = html;
    return { mask, ink };
  }
  function riseT(o, p, q = 0, st = 0.25) {
    const e = ez.outExpo(p), x = ez.inExpo(q);
    o.ink.style.transform = `translateY(${(1 - e) * 118 - x * 118}%) scaleY(${1 + (1 - e) * st})`;
    vis(o.ink, p > 0 && q < 1);
  }
  // kinetic words, each in its own mask
  function words(parent, lines, o) {
    const fam = o.family || "Geist", wt = o.weight || 800, tr = o.track ?? -0.04, lh = o.lh || 1.0;
    const size = o.size || Math.min(o.max, (o.w / Math.max(...lines.map((l) => measureF(l.join(" "), 100, wt, tr, fam)))) * 100);
    const root = el(parent, { width: (o.w || W) + "px" });
    const out = []; let y = 0, i = 0;
    lines.forEach((line, li) => {
      const row = el(root, { position: "absolute", left: 0, top: y + "px", width: "100%", display: "flex", gap: `0 ${0.24 * size}px`,
        justifyContent: o.align === "center" ? "center" : "flex-start", ...fnt(size, wt, lh, tr, fam), color: C.white }, "div", "");
      line.forEach((w) => {
        const pad = 0.22 * size;
        const m = el(row, { padding: `${pad}px 0.08em ${pad}px 0.03em`, margin: `${-pad}px -0.08em ${-pad}px -0.03em` }, "span", "mask");
        const ink = el(m, o.style ? o.style(w, i) : { color: C.white }, "span", "ink");
        ink.textContent = w;
        out.push({ m, ink, i: i++, line: li, text: w });
      });
      y += size * lh;
    });
    return { root, words: out, size, height: y };
  }
  function rise(w, p, q = 0, stretch = 0.22) {
    const e = ez.outExpo(p), x = ez.inExpo(q);
    w.ink.style.transform = `translateY(${(1 - e) * 112 - x * 112}%) scaleY(${1 + (1 - e) * stretch})`;
    w.ink.style.transformOrigin = "50% 100%";
    vis(w.m, p > 0 && q < 1);
  }
  const icon = {
    sparkle: (c) => `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M12 2l2.2 6.6L21 11l-6.8 2.4L12 20l-2.2-6.6L3 11l6.8-2.4z" fill="${c}"/><path d="M19 2l.8 2.2L22 5l-2.2.8L19 8l-.8-2.2L16 5l2.2-.8z" fill="${c}"/></svg>`,
    play: (c) => `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M7 4.5v15l12-7.5z" fill="none" stroke="${c}" stroke-width="2.2" stroke-linejoin="round"/></svg>`,
    heart: (c) => `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M12 20s-7-4.3-9.2-8.6C1.2 8.1 3.1 4.5 6.6 4.5c2.1 0 3.4 1.2 4.1 2.4l1.3 1.9 1.3-1.9c.7-1.2 2-2.4 4.1-2.4 3.5 0 5.4 3.6 3.8 6.9C19 15.7 12 20 12 20z" fill="none" stroke="${c}" stroke-width="2.2"/></svg>`,
    eye: (c) => `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" fill="none" stroke="${c}" stroke-width="2.2"/><circle cx="12" cy="12" r="3" fill="none" stroke="${c}" stroke-width="2.2"/></svg>`,
    arrow: (c) => `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M7 17L17 7M9 7h8v8" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    chevron: (c) => `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M6 9l6 6 6-6" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    check: (c) => `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  };
  const ico = (parent, kind, size, color, css = {}) => { const d = el(parent, { width: size + "px", height: size + "px", ...css }); d.innerHTML = icon[kind](color); return d; };
  // glass chip with an optional icon; returns { e, w, h }
  function chip(parent, label, kind, { size = 34, h = 80, accent = false, color = C.blueHi } = {}) {
    const e = el(parent, { height: h + "px", padding: `0 ${h * 0.4}px`, borderRadius: "999px", display: "flex", alignItems: "center", gap: h * 0.16 + "px", boxSizing: "border-box",
      background: accent ? rgba(C.blue, 0.2) : "rgba(12,12,16,.8)", border: `2px solid ${accent ? rgba(C.blueHi, 0.55) : "rgba(255,255,255,.13)"}`,
      ...fnt(size, 600, 1, -0.01), color: C.white, whiteSpace: "nowrap", transformOrigin: "50% 50%", boxShadow: "0 20px 60px rgba(0,0,0,.35)" });
    if (kind) ico(e, kind, size * 1.05, color, { position: "relative" });
    const s = el(e, { position: "relative" }, "span", ""); s.textContent = label;
    const w = (kind ? size * 1.05 + h * 0.16 : 0) + measureF(label, size, 600, -0.01) + h * 0.8 + 4;
    return { e, w, h };
  }

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
  const STEP_ACC = [C.blue, C.violet, C.blue, C.pink];
  const RES_ACC = [C.pink, C.lime, C.violet];
  function energy(t) {
    const b = tb(t);
    const ph = b - Math.floor(b), pump = (base, amp) => base + amp * (1 - Math.exp(-ph * PER / 0.16));
    let en = 0.25 + 0.2 * clamp((t - bt(-0.5)) / 0.4);
    for (let i = 0; i < 4; i++) { const d = since(t, i); if (d >= 0) en += (i === 3 ? 0.55 : 0.18) * Math.exp(-d / (i === 3 ? 0.7 : 0.25)); }
    if (b >= 3) en += 0.15;
    if (b >= 5.6 && b < 8) en *= 1 - 0.55 * ez.inCubic(pb(t, 5.6, 6.2)) + 0.4 * pb(t, 6, 8);
    if (b >= 8 && b < 29.4) en = pump(0.6, 0.3);
    if (b >= 29.4 && b < 30) en = 0.05 + 0.85 * (1 - ez.inCubic(pb(t, 29.4, 30)));
    if (b >= 30 && b < 44) en = pump(0.68, 0.3) + 0.7 * Math.exp(-since(t, 30) / 0.6);
    if (b >= 42 && b < 44) en += 0.3 * Math.exp(-ph * PER / 0.3);
    if (b >= 44 && b < 54) en = 0.42 + 0.06 * Math.sin(t * 2);
    if (b >= 54) en = 0.3 + 0.35 * (b >= 57.5 ? Math.exp(-since(t, 57.5) / 0.7) : 0);
    return en;
  }
  function accentAt(b) {
    if (b >= 8 && b < 12) return CUT_ACC[clamp(Math.floor((b - 8) * 2), 0, 7)];
    if (b >= 18 && b < 30) return STEP_ACC[clamp(Math.floor((b - 18) / 3), 0, 3)];
    if (b >= 30 && b < 33) return C.pink;
    if (b >= 33 && b < 42) return RES_ACC[clamp(Math.floor((b - 33) / 3), 0, 2)];
    return C.violet;
  }
  function field(t) {
    const b = tb(t), D = S.fieldD, en = energy(t);
    BLOBS.forEach((bl, i) => {
      const x = W * (bl.x + 0.16 * sn(t * 0.32 + i * 7, 11 + i)), y = H * (bl.y + 0.12 * sn(t * 0.27 + i * 3, 21 + i));
      let big = 1;
      for (const hb of [3, 30]) { const d = since(t, hb); if (d >= 0) big += 0.35 * Math.exp(-d / 0.8); }
      T(S.blobs[i], { x: x - D / 2, y: y - D / 2, s: bl.s * big * (0.9 + 0.15 * en), op: clamp(en * (i < 3 ? 1 : 0.75)) });
    });
    // accent blob: the section colour (blue always keeps the majority of the frame)
    const ac = accentAt(b);
    S.acc.style.background = `radial-gradient(circle, ${rgba(ac, 0.9)} 0%, ${rgba(ac, 0.3)} 35%, ${rgba(ac, 0)} 68%)`;
    const ax = W * (0.5 + 0.12 * sn(t * 0.5, 5)), ay = H * (0.5 + 0.1 * sn(t * 0.4, 6));
    let aop = 0.25 * clamp(en);
    if (b >= 8 && b < 12) aop = 0.55 + 0.35 * Math.exp(-since(t, 8 + clamp(Math.floor((b - 8) * 2), 0, 7) * 0.5) / 0.25);
    else if (b >= 18 && b < 42) aop = 0.45 + 0.25 * (1 - Math.exp(-(b - Math.floor(b)) * PER / 0.2));
    else if (b >= 44) aop = 0.12;
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
    // global choreography: blown outward on b3 and b30, sucked into the centre before b30 (the implosion)
    let f = 1;
    if (b >= 3 && b < 6.2) f *= 1 + 0.45 * spring(since(t, 3), 1.2, 4.5) * (b < 5.6 ? 1 : 1 - pb(t, 5.6, 6.2));
    if (b >= 29.4 && b < 30) f *= 1 - ez.inExpo(pb(t, 29.4, 30));
    if (b >= 30 && b < 34) f *= Math.max(0, spring(since(t, 30), 1.1, 3.5)) * (1 + 0.6 * Math.exp(-since(t, 30) / 0.7));
    const drop = (b >= 8 && b < 29.4) || (b >= 30 && b < 44);
    const dim = b >= 5.8 && b < 6.6 ? 0.35 : b >= 44.3 && b < 54 ? 0.5 : b >= 54 ? 0.45 : b >= 33 && b < 42 ? 0.75 : 1;
    S.deco.forEach((d) => {
      const span = H + 500, rise_ = t * 40 * (1 + d.z / 1200);
      const fx = W * (d.x + 0.05 * sn(t * 0.4, d.seed));
      const fy = ((((d.y * H - rise_ + 0.04 * H * sn(t * 0.35, d.seed + 40)) % span) + span) % span) - 250;
      const x = (fx - W / 2) * f, y = (fy - H / 2) * f;
      const pulse = drop ? 1 + 0.12 * Math.exp(-(b - Math.floor(b)) * PER / 0.12) : 1;
      const appear = clamp((t - bt(-1) - d.seed * 0.03) / 0.6);
      T(d.e, { x: W / 2 + x - d.sz / 2, y: H / 2 + y - d.sz / 2, z: d.z, r: d.rs * t + d.seed * 20, rx: 25 * Math.sin(t * 0.7 + d.seed), ry: 30 * Math.cos(t * 0.6 + d.seed),
        s: pulse * (b >= 29.4 && b < 30 ? 1 - 0.8 * ez.inExpo(pb(t, 29.4, 30)) : 1), op: appear * dim });
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
    disp(V.root, live);
    if (!live) return;
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
    const live = b >= 7.9 && b < 14.6;
    vis(Bu.root, live);
    if (!live) return vis(Bu.hero.box, false);
    // marquee: four rows, alternating directions, tilted, from the drop to the end
    const rw = measure("CRÉATION VIRALE · ", 210, 800, -0.04);
    Bu.rows.forEach((d, r) => {
      const dir = r % 2 ? 1 : -1, sp = 520 + r * 60;
      const off = ((t - bt(8)) * sp * dir) % rw;
      const y = H * (0.14 + r * 0.24);
      T(d, { x: -rw + off - 200, y, r: -9, op: ez.outExpo(pr(t, 8, 0.5)) * (1 - ez.inExpo(pb(t, 14.1, 14.5))) });
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
    const live = b >= 11.9 && b < 14.6;
    if (!live) { M.shapes.forEach((c) => vis(c.box, false)); M.words.forEach((w) => vis(w.d, false)); return; }
    const ex = ez.inExpo(pb(t, 14.1, 14.5));                    // whip exit: shapes fly out, words lift away
    const swayY = 9 * Math.sin((t - bt(12)) * 1.6), swayX = 5 * Math.sin((t - bt(12)) * 1.1);
    M.shapes.forEach((c, k) => {
      const [shp, ox, oy, size] = MOS[k];
      const d = since(t, 12 + k * 0.5) + 0.03, e = spring(d, 1.5, 6.5);
      if (d < 0) return vis(c.box, false);
      const cx = W / 2 + ox * W * (1 + 1.8 * ex) + sn(t * 0.6, k + 70) * 18, cy = H / 2 + oy * H * (1 + 1.2 * ex) + sn(t * 0.5, k + 80) * 22;
      putShape(c, SH[shp], cx, cy, size * clamp(e, 0, 1.2) * (1 + 0.3 * ex), { z: -150 + 80 * Math.sin(t + k), rx: swayX + 10 * Math.sin(t * 1.4 + k), ry: swayY + 14 * Math.cos(t * 1.2 + k), r: (k % 2 ? 1 : -1) * (6 + 3 * Math.sin(t * 2 + k) + 40 * ex), op: clamp(d / 0.05) * (1 - ex) });
      frameOf(c, `tile${[3, 8, 14, 19][k]}`, Math.max(0, d));
    });
    M.words.forEach((w, i) => {
      const d = since(t, 12 + i * 0.5) + 0.03, e = ez.outExpo(clamp(d / 0.4));
      if (d < 0) return vis(w.d, false);
      w.d.style.letterSpacing = `${lerp(0.25, -0.045, e)}em`;
      const ww = measure(w.d.textContent, M.size, 800, lerp(0.25, -0.045, e));
      T(w.d, { x: (W - ww) / 2, y: w.y - ex * (300 + i * 120), ry: swayY * 0.4, s: 1 + 0.02 * Math.sin(t * 3), op: clamp(d / 0.06) * (1 - ex) });
    });
  }

  /* ===== agency intro (b14.5-18): the site's headline in kinetic masks, hero clip in a morphing arch, stat chips ===== */
  const AG_C = { x: W / 2, y: 1300 };
  function buildAgency() {
    const shL = layer(4), tx = layer(5);
    const pill = chip(tx, "Agence de production vidéo à Québec", "sparkle", { size: 32, h: 76, accent: true });
    const size = Math.min(124, ((W - 150) / measureF("entreprises à Québec.", 100, 800, -0.04)) * 100);
    const y0 = 420;
    const g = `style="background-image:${GR.brand};-webkit-background-clip:text;background-clip:text;color:transparent"`;
    const lines = [`Création de contenu`, `<span ${g}>vidéo</span> pour les`, `entreprises à Québec.`]
      .map((h, i) => mtext(tx, h, { ...fnt(size, 800, 1, -0.04), color: i === 2 ? "#C9CEDD" : C.white }, 76, y0 + i * size * 1.04));
    const hero = shapeClip(shL);
    const chips = [["+100", "play"], ["+40K", "heart"], ["+30K", "eye"]].map(([s, k]) => chip(tx, s, k, { size: 42, h: 92 }));
    S.ag = { shL, tx, pill, lines, size, hero, chips };
  }
  function agency(t) {
    const A_ = S.ag, b = tb(t);
    const live = b >= 14.35 && b < 17.9;
    disp(A_.shL, live); disp(A_.tx, live);
    if (!live) return;
    const p = ez.outExpo(pr(t, 14.47, 0.45));
    T(A_.pill.e, { x: 76 - (1 - p) * 80, y: 290, op: t >= bt(14.47) ? 1 : 0 });
    A_.pill.e.style.clipPath = `inset(0 ${(1 - p) * 100}% 0 0 round 999px)`;
    A_.lines.forEach((l, i) => riseT(l, pr(t, 14.72 + i * 0.25, 0.42)));
    // hero clip: pops on b15.5 as a circle, opens into an arch
    const d = since(t, 15.5) + 0.04, e = spring(d, 1.6, 6.5), m = ez.outExpo(clamp((d - 0.1) / 0.5));
    if (d < 0) vis(A_.hero.box, false);
    else {
      putShape(A_.hero, mixShape(SH.circle, SH.arch, m), AG_C.x, AG_C.y + 10 * Math.sin(t * 2), lerp(560, 840, m) * clamp(e, 0, 1.2), { ry: 8 * Math.sin(t * 1.3), r: (1 - m) * -10, op: 1 });
      frameOf(A_.hero, "hero", Math.max(0, t - bt(15.3)));
    }
    const pos = [[64, 1010], [W - 64 - A_.chips[1].w, 1170], [96, 1560]];
    A_.chips.forEach((c, i) => {
      const dd = since(t, 16 + i * 0.5) + 0.03, ee = spring(dd, 2.6, 7.5);
      T(c.e, { x: pos[i][0], y: pos[i][1] + 10 * Math.sin((t - bt(16)) * 2.4 + i), s: Math.max(0.001, ee), r: (1 - ee) * (i % 2 ? 14 : -14), op: dd > 0 ? 1 : 0 });
    });
  }

  /* ===== transitions: two-tone iris (b17.4-18.3) and two-tone pill sweep (b43.45-44.25) ===== */
  const IRIS = { b0: 17.4, cover: 17.86, b1: 18.3 }, SWEEP = { b0: 43.4, mid: 43.925, b1: 44.35 };
  function buildWipes() {
    const root = layer(14);
    const RM = Math.hypot(W, H) * 1.05;
    const circ = (c) => el(root, { width: 2 * RM + "px", height: 2 * RM + "px", borderRadius: "50%", background: c, transformOrigin: "50% 50%" });
    const pillE = (c) => el(root, { width: "5200px", height: "4000px", borderRadius: "2000px", background: c, transformOrigin: "50% 50%" });
    S.wipe = { root, RM, iv: circ(C.violet), ib: circ(C.blue), ring: el(root, { borderRadius: "50%", boxSizing: "border-box", border: `0 solid ${C.violet}` }), pv: pillE(C.violet), pb: pillE(C.blue) };
  }
  function wipes(t) {
    const Wp = S.wipe, b = tb(t), RM = Wp.RM;
    // iris from the hero clip: violet leads, blue follows, then a hole opens with a violet edge riding it
    const irisLive = b >= IRIS.b0 && b < IRIS.b1;
    if (irisLive) {
      const cx = AG_C.x, cy = AG_C.y;
      const gv = ez.inOutCubic(pb(t, IRIS.b0 - 0.1, IRIS.cover - 0.12)), gb = ez.inOutCubic(pb(t, IRIS.b0 - 0.02, IRIS.cover - 0.02));
      const hole = ez.inOutCubic(pb(t, IRIS.cover, IRIS.b1));
      T(Wp.iv, { x: cx - RM, y: cy - RM, s: Math.max(1e-4, gv), op: gv > 0 && hole === 0 ? 1 : 0 });
      T(Wp.ib, { x: cx - RM, y: cy - RM, s: Math.max(1e-4, gb), op: gb > 0 ? 1 : 0 });
      const hr = hole * RM;
      const mk = hole > 0 ? `radial-gradient(circle at ${RM}px ${RM}px, transparent ${hr}px, #000 ${hr + 1.5}px)` : "none";
      Wp.ib.style.webkitMaskImage = mk; Wp.ib.style.maskImage = mk;
      const rw = 110 * (1 - hole), rr = hr + rw;
      Object.assign(Wp.ring.style, { width: 2 * rr + "px", height: 2 * rr + "px", borderWidth: rw + "px" });
      T(Wp.ring, { x: cx - rr, y: cy - rr, op: hole > 0 && hole < 1 ? 1 : 0 });
    } else { vis(Wp.iv, false); vis(Wp.ib, false); vis(Wp.ring, false); }
    // pill sweep: two huge tilted pills pass through the frame; the scene swaps while blue covers it
    const a = (-24 * Math.PI) / 180, nx = -Math.sin(a), ny = Math.cos(a), D0 = 3200;
    const sweep = (e, p) => { const off = D0 * (1 - 2 * p); T(e, { x: W / 2 - 2600 + nx * off, y: H / 2 - 2000 + ny * off, r: -24, op: p > 0 && p < 1 ? 1 : 0 }); };
    if (b >= SWEEP.b0 && b < SWEEP.b1) {
      sweep(Wp.pv, pb(t, SWEEP.b0, SWEEP.b1 - 0.1));          // linear: a constant-speed pass (blue covers the frame ~4 frames)
      sweep(Wp.pb, pb(t, SWEEP.b0 + 0.1, SWEEP.b1));
    } else { vis(Wp.pv, false); vis(Wp.pb, false); }
  }

  /* ===== process (b18-30): rolling outline numbers, slammed titles, one shape morphing per step, a micro-graphic per step ===== */
  const STEPS = [
    ["01", "Stratégie", "On analyse votre entreprise, votre clientèle\net vos objectifs.", "step-strat", "circle", 700],
    ["02", "Production", "Photo et vidéo pro, avec coaching\ndevant la caméra.", "step-prod", "squircle", 760],
    ["03", "Montage", "Montage dynamique, sous-titres, musique\net formats verticaux.", "step-mont", "pill", 800],
    ["04", "Diffusion", "On publie sur les bonnes plateformes,\nau bon moment.", "step-diff", "arch", 780],
  ];
  const PS = { x: W / 2, y: 1270 };
  const PLAT = [["Instagram", "heart", -290, -440], ["TikTok", "play", 250, -330], ["Facebook", "eye", -300, 330], ["YouTube", "play", 230, 450]];
  function buildProcess() {
    const shL = layer(7), mL = layer(8), tx = layer(9);
    [shL, mL, tx].forEach((l) => (l.style.transformOrigin = "50% 50%"));
    const kick = chip(tx, "Notre approche", null, { size: 30, h: 70, accent: true });
    const head = words(tx, [["Une", "stratégie", "derrière"], ["chaque", "contenu."]], { size: 60, weight: 700, track: -0.035, lh: 1.04, w: W - 160 });
    T(head.root, { x: 80, y: 300 });
    const tsize = Math.min(...STEPS.map((s) => ((W - 160) / measureF(s[1], 100, 800, -0.045)) * 100), 168);
    const nums = STEPS.map((s, i) => { const w = measureF(s[0], 380, 800, -0.04); return mtext(tx, s[0], { ...fnt(380, 800, 1, -0.04), color: "transparent", WebkitTextStroke: `3px ${rgba(i % 2 ? C.violet : C.blueHi, 0.75)}` }, W - 70 - w, 380); });
    const titles = STEPS.map((s) => mtext(tx, s[1], { ...fnt(tsize, 800, 1, -0.045), color: C.white, textShadow: "0 10px 50px rgba(0,0,0,.45)" }, 76, 560));
    const descs = STEPS.map((s) => mtext(tx, s[2], { ...fnt(38, 500, 1.32, -0.01), color: "#C3C8D6" }, 80, 560 + tsize * 1.08));
    const segW = (W - 160 - 3 * 16) / 4;
    const segs = STEPS.map((_, i) => { const bg = el(tx, { left: 80 + i * (segW + 16) + "px", top: "1745px", width: segW + "px", height: "10px", borderRadius: "5px", background: "rgba(255,255,255,.14)", overflow: "hidden" }); const f = el(bg, { width: "100%", height: "100%", background: `linear-gradient(90deg, ${C.blue}, ${STEP_ACC[i] === C.blue ? C.blueHi : STEP_ACC[i]})`, transformOrigin: "0 50%" }); return f; });
    const shape = shapeClip(shL);
    // 01 strategy: target rings + rotating dashed ring + crosshair ticks
    const rings = [800, 950, 1100].map((d) => el(mL, { width: d + "px", height: d + "px", borderRadius: "50%", border: "2px solid rgba(255,255,255,.3)", boxSizing: "border-box", transformOrigin: "50% 50%" }));
    const dash = el(mL, { width: "880px", height: "880px", transformOrigin: "50% 50%" });
    dash.innerHTML = `<svg viewBox="0 0 880 880" width="880" height="880"><circle cx="440" cy="440" r="436" fill="none" stroke="${C.blueHi}" stroke-width="5" stroke-dasharray="4 26" stroke-linecap="round"/></svg>`;
    const ticks = [0, 1, 2, 3].map(() => el(mL, { width: "8px", height: "80px", borderRadius: "4px", background: C.white, transformOrigin: "50% 50%", boxShadow: `0 0 24px ${rgba(C.blue, 0.9)}` }));
    // 02 production: viewfinder corners + REC timecode
    const corners = [0, 1, 2, 3].map((k) => el(mL, { width: "110px", height: "110px", boxSizing: "border-box", borderColor: C.white, borderStyle: "solid", borderWidth: `${k < 2 ? 8 : 0}px ${k % 2 ? 8 : 0}px ${k >= 2 ? 8 : 0}px ${k % 2 ? 0 : 8}px`, borderRadius: ["22px 0 0 0", "0 22px 0 0", "0 0 0 22px", "0 0 22px 0"][k] }));
    const rec = el(mL, { display: "flex", alignItems: "center", gap: "18px", ...fnt(38, 500, 1, 0.02, '"Geist Mono"'), color: C.white, whiteSpace: "pre" });
    const recDot = el(rec, { width: "26px", height: "26px", borderRadius: "50%", background: "#FF3B3B", boxShadow: "0 0 24px rgba(255,59,59,.9)", position: "relative" }, "div", "");
    const recTxt = el(rec, { position: "relative" }, "span", "");
    // 03 montage: glass timeline with coloured clips and a playhead
    const panel = el(mL, { width: "900px", height: "140px", borderRadius: "30px", background: "rgba(12,12,16,.82)", border: "2px solid rgba(255,255,255,.12)", boxSizing: "border-box", overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,.45)" });
    const SEG = [[140, C.blue], [100, C.violet], [180, C.blueHi], [90, C.pink], [140, C.lime], [150, C.blue]];
    let sx = 28;
    const clips = SEG.map(([w, c]) => { const e = el(panel, { left: sx + "px", top: "34px", width: w + "px", height: "70px", borderRadius: "16px", background: `linear-gradient(180deg, ${c}, ${rgba(c, 0.65)})`, transformOrigin: "0 50%" }); const r = { e, x: sx }; sx += w + 8; return r; });
    const head_ = el(panel, { top: "8px", width: "6px", height: "124px", borderRadius: "3px", background: C.white, boxShadow: `0 0 20px ${rgba(C.white, 0.9)}` });
    // 04 diffusion: platform chips flying out of the clip
    const plats = PLAT.map(([n, k]) => chip(mL, n, k, { size: 34, h: 80, color: C.blueHi }));
    S.proc = { shL, mL, tx, kick, head, tsize, nums, titles, descs, segs, shape, rings, dash, ticks, corners, rec, recDot, recTxt, panel, clips, head_, plats };
  }
  function process(t) {
    const P_ = S.proc, b = tb(t);
    const live = b >= 17.86 && b < 30.05;
    [P_.shL, P_.mL, P_.tx].forEach((l) => disp(l, live));
    if (!live) return;
    const imp = ez.inExpo(pb(t, 29.4, 30));                     // the implosion that sets up "Et ça explose."
    [P_.shL, P_.mL, P_.tx].forEach((l, k) => T(l, { s: 1 - 0.92 * imp, r: imp * (k ? -25 : 60), op: 1 - imp * imp }));
    T(P_.kick.e, { x: 80, y: 210, op: 1 }); P_.kick.e.style.clipPath = `inset(0 ${(1 - ez.outExpo(pr(t, 18.0, 0.4))) * 100}% 0 0 round 999px)`;
    P_.head.words.forEach((w, i) => rise(w, pr(t, 18.1 + i * 0.12, 0.4)));
    const i = clamp(Math.floor((b - 18) / 3), 0, 3), b0 = 18 + 3 * i;
    STEPS.forEach((s, k) => {
      const k0 = 18 + 3 * k;
      const pin = k === 0 ? pr(t, 18.15, 0.45) : pr(t, k0 - 0.03, 0.38);
      const pout = k < 3 ? pb(t, k0 + 3 - 0.16, k0 + 3 + 0.02) : 0;
      riseT(P_.titles[k], pin, pout, 0.3);
      riseT(P_.nums[k], k === 0 ? pr(t, 18.3, 0.5) : pr(t, k0 + 0.02, 0.45), pout, 0.1);
      riseT(P_.descs[k], k === 0 ? pr(t, 18.45, 0.45) : pr(t, k0 + 0.12, 0.42), pout, 0.1);
      P_.segs[k].style.transform = `scaleX(${clamp((b - k0) / 3)})`;
    });
    // the clip: one shape, morphing + flipping on each step (the flip hides the clip swap)
    const d = since(t, b0) + 0.05;
    let sp, size, ry = 0;
    if (i === 0) { sp = SH.circle; size = 700 * clamp(spring(since(t, 17.95), 1.5, 6.5), 0, 1.2); }
    else { const e = ez.outExpo(clamp(d / 0.42)); sp = mixShape(SH[STEPS[i - 1][4]], SH[STEPS[i][4]], e); size = lerp(STEPS[i - 1][5], STEPS[i][5], e); ry = (i % 2 ? -1 : 1) * 80 * (1 - e); }
    size *= 1 + 0.025 * Math.exp(-(b - Math.floor(b)) * PER / 0.1);
    putShape(P_.shape, sp, PS.x, PS.y + 8 * Math.sin(t * 2.2), size, { ry, r: 3 * Math.sin(t * 1.4), op: 1 });
    frameOf(P_.shape, STEPS[i][3], Math.max(0, t - bt(b0 - 0.1)));
    const win = (k0, del = 0.25) => ez.outExpo(pr(t, k0 + del, 0.45)) * (k0 < 27 ? 1 - ez.inExpo(pb(t, k0 + 2.72, k0 + 2.98)) : 1);
    // 01 strategy
    { const a = win(18, 0.3); const on_ = b < 21.05;
      P_.rings.forEach((r, k) => { const dd = 800 + 150 * k, e = ez.outExpo(pr(t, 18.3 + k * 0.12, 0.5)), pulse = 1 + 0.02 * Math.exp(-(b - Math.floor(b)) * PER / 0.15);
        T(r, { x: PS.x - dd / 2, y: PS.y - dd / 2, s: lerp(1.4, 1, e) * pulse, op: on_ ? a * e * (k === 1 ? 0.6 : 0.9) : 0 }); });
      T(P_.dash, { x: PS.x - 440, y: PS.y - 440, r: (t - bt(18)) * 30, s: lerp(0.7, 1, a), op: on_ ? a : 0 });
      P_.ticks.forEach((k_, k) => { const ang = (k * Math.PI) / 2, rad = 520 + (1 - a) * 200; T(k_, { x: PS.x + Math.sin(ang) * rad - 4, y: PS.y - Math.cos(ang) * rad - 40, r: (k * 90), op: on_ ? a : 0 }); }); }
    // 02 production
    { const a = win(21, 0.2), on_ = b >= 20.9 && b < 24.05;
      const hw = (760 * SH.squircle.a) / 2 + 40, hh = 760 / 2 + 40;
      P_.corners.forEach((c, k) => { const sxk = k % 2 ? 1 : -1, syk = k < 2 ? -1 : 1, e = spring(since(t, 21.2) + 0.02, 2.2, 7), off = (1 - clamp(e, 0, 1.3)) * 140;
        T(c, { x: PS.x + sxk * (hw + off) - (sxk > 0 ? 110 : 0), y: PS.y + syk * (hh + off) - (syk > 0 ? 110 : 0), op: on_ && since(t, 21.2) > -0.02 ? (1 - (b >= 23.72 ? ez.inExpo(pb(t, 23.72, 23.98)) : 0)) : 0 }); });
      const lt = Math.max(0, t - bt(21));
      P_.recTxt.textContent = `REC  00:00:${String(Math.floor(lt)).padStart(2, "0")}:${String(Math.floor((lt % 1) * 30)).padStart(2, "0")}`;
      P_.recDot.style.opacity = Math.floor(lt * 2.5) % 2 ? 0.25 : 1;
      T(P_.rec, { x: PS.x - hw + 6, y: PS.y - hh - 86 + (1 - a) * 30, op: on_ ? a : 0 }); }
    // 03 montage
    { const a = win(24, 0.1), on_ = b >= 23.9 && b < 27.05;
      T(P_.panel, { x: (W - 900) / 2, y: PS.y + 320 + (1 - a) * 120, rx: (1 - a) * 50, op: on_ ? a : 0 });
      P_.clips.forEach((c, k) => { const e = spring(since(t, 24.25 + k * 0.125) + 0.02, 2.4, 7.5); c.e.style.transform = `translateX(${(1 - clamp(e, 0, 1.2)) * 260}px) scaleX(${Math.max(0.001, clamp(e, 0, 1.2))})`; c.e.style.opacity = e > 0.01 ? 1 : 0; });
      P_.head_.style.transform = `translateX(${28 + 840 * clamp((t - bt(24.5)) / (bt(26.9) - bt(24.5)))}px)`; }
    // 04 diffusion
    { const on_ = b >= 26.9;
      P_.plats.forEach((c, k) => { const [, , ox, oy] = PLAT[k], e = spring(since(t, 27.25 + k * 0.25) + 0.02, 1.9, 6.5);
        T(c.e, { x: PS.x + ox * clamp(e, 0, 1.2) - c.w / 2, y: PS.y + oy * clamp(e, 0, 1.2) - c.h / 2 + 10 * Math.sin(t * 2.2 + k), s: Math.max(0.001, 0.25 + 0.75 * clamp(e, 0, 1.15)), r: (1 - clamp(e, 0, 1)) * 30 * (k % 2 ? 1 : -1), op: on_ && since(t, 27.25 + k * 0.25) > -0.02 ? 1 : 0 }); }); }
  }

  /* ===== explosion (b30-33): shockwave, rings of footage spiralling out, "Et ça explose.", zoom-through ===== */
  const RINGS = [{ n: 6, R: 360, sz: 200, b: 31 }, { n: 10, R: 600, sz: 170, b: 32 }, { n: 14, R: 850, sz: 150, b: 32.5 }];
  const RING_SH = ["circle", "squircle", "leaf", "drop", "arch"];
  function buildBoom() {
    const L = layer(10), tx = layer(11);
    [L, tx].forEach((l) => (l.style.transformOrigin = "50% 50%"));
    const center = shapeClip(L);
    const waves = [0, 1, 2].map((k) => el(L, { borderRadius: "50%", boxSizing: "border-box", border: `${[10, 4, 2][k]}px solid ${rgba(k === 1 ? C.blueHi : C.white, 0.85)}` }));
    const sh = [];
    RINGS.forEach((rg, ri) => { for (let j = 0; j < rg.n; j++) sh.push({ c: shapeClip(L), ri, j, rg }); });
    const size = Math.min(250, ((W - 110) / measureF("explose.", 100, 800, -0.045)) * 100);
    const tw = words(tx, [["Et", "ça"], ["explose."]], { size, weight: 800, track: -0.045, lh: 0.96, w: W, align: "center",
      style: (w) => (w === "explose." ? gtext(GR.brand, C.violet) : { color: C.white, textShadow: "0 12px 60px rgba(0,0,0,.6)" }) });
    T(tw.root, { x: 0, y: H / 2 - tw.height / 2 });
    S.boom = { L, tx, center, waves, sh, tw };
  }
  function boom(t) {
    const Bm = S.boom, b = tb(t);
    const live = b >= 29.98 && b < 33.15;
    disp(Bm.L, live); disp(Bm.tx, live);
    if (!live) return;
    const zt = ez.inExpo(pb(t, 32.7, 33.12));                   // zoom through into the results
    T(Bm.L, { s: 1 + zt * 4, op: 1 - zt }); T(Bm.tx, { s: 1 + zt * 2.4, op: 1 - zt });
    const e0 = spring(since(t, 30), 1.8, 6.5), pulse = 1 + 0.04 * Math.exp(-(b - Math.floor(b)) * PER / 0.12);
    putShape(Bm.center, SH.circle, W / 2, H / 2, 560 * clamp(e0, 0, 1.25) * pulse, { r: (1 - clamp(e0, 0, 1)) * 40, op: 1 });
    frameOf(Bm.center, "boom", Math.max(0, t - bt(30)));
    Bm.waves.forEach((w, k) => { const d = since(t, 30) - k * 0.07, rr = 2300 * ez.outExpo(clamp(d / 0.9)) + 1;
      Object.assign(w.style, { width: 2 * rr + "px", height: 2 * rr + "px" }); T(w, { x: W / 2 - rr, y: H / 2 - rr, op: d > 0 ? 0.9 * (1 - clamp(d / 0.9)) : 0 }); });
    Bm.sh.forEach(({ c, ri, j, rg }, k) => {
      const d = since(t, rg.b) - j * 0.015, e = spring(d, 1.4, 6);
      if (d < 0) return vis(c.box, false);
      const rot = (t - bt(30)) * 0.35 * (ri % 2 ? -1 : 1) + ri * 0.3 + (1 - clamp(e, 0, 1)) * (ri % 2 ? 1 : -1) * 1.2;
      const th = (2 * Math.PI * j) / rg.n + rot;
      const cx = W / 2 + Math.cos(th) * rg.R * e, cy = H / 2 + Math.sin(th) * rg.R * 1.3 * e;
      putShape(c, SH[RING_SH[(j + ri) % 5]], cx, cy, rg.sz * clamp(e, 0, 1.2) * pulse, { r: (th * 180) / Math.PI * 0.15, op: 1 });
      frameOf(c, `tile${(j * 3 + ri * 7) % 24}`, Math.max(0, d) + ((j + ri) % 4) * 0.3);
    });
    Bm.tw.words.forEach((w, k) => {
      const bw = [31, 31.25, 31.5][k];
      rise(w, pr(t, bw - 0.03, 0.3));
      const dj = since(t, bw), j = dj > 0 ? (k === 2 ? 18 : 8) * Math.exp(-dj / 0.16) : 0;   // impact jitter
      w.m.style.transform = `translate(${j * sn(t * 40, k + 3)}px,${j * sn(t * 40, k + 13)}px) rotate(${j * 0.12 * sn(t * 30, k + 23)}deg)`;
    });
  }

  /* ===== results (b33-42): counters, a self-drawing growth curve, carousel whips ===== */
  const RES = [
    { id: "res-sushi", client: "Sushi X", mult: 59, label: "plus de vues Instagram\nen deux mois", from: 8873, to: 520337, plat: "Instagram", bars: [4.5, 3.3, 1.9, 156, 40.5, 21] },
    { id: "res-chalet", client: "Au Petit Chalet", mult: 18, label: "plus de vues Facebook", from: 11906, to: 216266, plat: "Facebook", bars: [8.1, 7.8, 7.2, 40, 21.4, 21.2] },
    { id: "res-mex", client: "Mexicanos", mult: 14, label: "plus de vues TikTok\nen un mois", from: 18218, to: 261432, plat: "TikTok", bars: [3.1, 2.9, 2.4, 297, 30.4, 27.5] },
  ];
  const CH_ = { x: 60, y: 950, w: W - 120, h: 600, px: 50, pt: 70, ph: 300 };
  function buildResults() {
    const L = layer(12);
    S.res = RES.map((r, ri) => {
      const acc = RES_ACC[ri];
      const root = el(L, { width: W + "px", height: H + "px", transformOrigin: "50% 50%" });
      const pill = chip(root, `Résultat client  ·  ${r.client}`, null, { size: 32, h: 74, accent: true }); T(pill.e, { x: 76, y: 280 });
      const mult = el(root, { ...fnt(360, 800, 1, -0.05), whiteSpace: "pre", fontVariantNumeric: "tabular-nums", transformOrigin: "0 70%",
        backgroundImage: `linear-gradient(100deg, #FFFFFF 15%, ${C.blueHi} 60%, ${acc})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: `drop-shadow(0 0 40px ${rgba(C.blue, 0.55)})` });
      T(mult, { x: 64, y: 380 });
      const lab = el(root, { ...fnt(42, 500, 1.28, -0.01), color: "#D2D6E2", whiteSpace: "pre" }); lab.textContent = r.label; T(lab, { x: 80, y: 772 });
      const shape = shapeClip(root);
      // chart card
      const card = el(root, { width: CH_.w + "px", height: CH_.h + "px", borderRadius: "44px", background: "rgba(12,12,16,.8)", border: "2px solid rgba(255,255,255,.1)", boxSizing: "border-box", boxShadow: "0 40px 100px rgba(0,0,0,.45)", overflow: "hidden" });
      T(card, { x: CH_.x, y: CH_.y });
      const cw = CH_.w - 2 * CH_.px, mx = Math.max(...r.bars);
      const pts = r.bars.map((v, k) => [CH_.px + (k / (r.bars.length - 1)) * cw, CH_.pt + CH_.ph * (1 - 0.05 - 0.95 * (v / mx))]);
      const cy_ = (y) => clamp(y, CH_.pt - 10, CH_.pt + CH_.ph);
      let dPath = `M${pts[0][0]},${pts[0][1]}`;
      for (let k = 0; k < pts.length - 1; k++) {
        const p0 = pts[Math.max(0, k - 1)], p1 = pts[k], p2 = pts[k + 1], p3 = pts[Math.min(pts.length - 1, k + 2)];
        dPath += ` C${p1[0] + (p2[0] - p0[0]) / 6},${cy_(p1[1] + (p2[1] - p0[1]) / 6)} ${p2[0] - (p3[0] - p1[0]) / 6},${cy_(p2[1] - (p3[1] - p1[1]) / 6)} ${p2[0]},${p2[1]}`;
      }
      const base = CH_.pt + CH_.ph, dx = (pts[2][0] + pts[3][0]) / 2;
      card.insertAdjacentHTML("beforeend", `<svg class="a" viewBox="0 0 ${CH_.w} ${CH_.h}" width="${CH_.w}" height="${CH_.h}" style="overflow:visible">
        <defs><linearGradient id="st${ri}" x1="0" x2="1"><stop offset="0" stop-color="${C.blueHi}"/><stop offset=".55" stop-color="${C.blue}"/><stop offset="1" stop-color="${acc}"/></linearGradient>
        <linearGradient id="ar${ri}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${C.blue}" stop-opacity=".45"/><stop offset="1" stop-color="${C.blue}" stop-opacity="0"/></linearGradient>
        <clipPath id="cp${ri}"><rect id="cr${ri}" x="0" y="0" width="0" height="${CH_.h}"/></clipPath></defs>
        <line x1="${CH_.px}" x2="${CH_.w - CH_.px}" y1="${base}" y2="${base}" stroke="rgba(255,255,255,.14)" stroke-width="2"/>
        <line x1="${dx}" x2="${dx}" y1="${CH_.pt - 20}" y2="${base}" stroke="rgba(255,255,255,.25)" stroke-width="2" stroke-dasharray="6 10"/>
        <path d="${dPath} L${pts[pts.length - 1][0]},${base} L${pts[0][0]},${base} Z" fill="url(#ar${ri})" clip-path="url(#cp${ri})"/>
        <path id="ln${ri}" d="${dPath}" fill="none" stroke="url(#st${ri})" stroke-width="8" stroke-linecap="round"/>
        <circle id="hd${ri}" r="14" fill="#fff" style="filter:drop-shadow(0 0 14px ${acc})"/></svg>`);
      const line = card.querySelector(`#ln${ri}`), len = line.getTotalLength();
      line.style.strokeDasharray = `${len}`;
      const tagA = el(card, { ...fnt(26, 500, 1, 0.04, '"Geist Mono"'), color: "#8F93A3", whiteSpace: "pre" }); tagA.textContent = "AVANT"; T(tagA, { x: CH_.px, y: base + 18 });
      const tagB = el(card, { ...fnt(26, 500, 1, 0.04, '"Geist Mono"'), color: C.blueHi, whiteSpace: "pre" }); tagB.textContent = "APRÈS"; T(tagB, { x: dx + 16, y: base + 18 });
      const views = el(card, { ...fnt(60, 700, 1, -0.03), color: C.white, whiteSpace: "pre", fontVariantNumeric: "tabular-nums" }); T(views, { x: CH_.px, y: base + 70 });
      const plat = el(card, { ...fnt(30, 500, 1, 0), color: "#9AA0B2", whiteSpace: "pre" }); plat.textContent = `vues · ${r.plat}`; T(plat, { x: CH_.px, y: base + 146 });
      return { root, pill, mult, lab, shape, card, line, len, head: card.querySelector(`#hd${ri}`), clip: card.querySelector(`#cr${ri}`), views, r };
    });
    S.resL = L;
  }
  function results(t) {
    const b = tb(t);
    const live = b >= 32.85 && b < 42.1;
    disp(S.resL, live);
    if (!live) return;
    S.res.forEach((R_, i) => {
      const b0 = 33 + 3 * i, r = R_.r;
      const on_ = b >= b0 - 0.35 && b < b0 + 3.2;
      disp(R_.root, on_);
      if (!on_) return;
      const inP = i === 0 ? ez.outExpo(pr(t, 32.95, 0.5)) : ez.inOutExpo(pb(t, b0 - 0.3, b0 + 0.15));
      const outP = i < 2 ? ez.inOutExpo(pb(t, b0 + 3 - 0.3, b0 + 3 + 0.15)) : ez.inExpo(pb(t, 41.7, 42.05));
      if (i === 0) T(R_.root, { s: lerp(0.6, 1, inP) * (1 - 0 * outP), x: -outP * W * 1.1, ry: outP * 30, op: inP });
      else if (i === 1) T(R_.root, { x: (1 - inP) * W * 1.1 - outP * W * 1.1, ry: (1 - inP) * -30 + outP * 30, op: 1 });
      else T(R_.root, { x: (1 - inP) * W * 1.1, ry: (1 - inP) * -30, s: 1 + outP * 1.6, op: 1 - outP });
      // multiplier counts up and slams
      const c = ez.outExpo(pb(t, b0 + 0.2, b0 + 1.2));
      R_.mult.textContent = `${Math.max(1, Math.round(lerp(1, r.mult, c)))}×`;
      const sl = since(t, b0 + 0.2);
      T(R_.mult, { x: 64, y: 380, s: sl < 0 ? 0.001 : lerp(1.5, 1, ez.outExpo(clamp(sl / 0.35))) * (1 + 0.06 * Math.exp(-Math.max(0, since(t, b0 + 1.2)) / 0.1) * (b >= b0 + 1.2 ? 1 : 0)), op: sl > -0.02 ? 1 : 0 });
      vis(R_.lab, true); R_.lab.style.opacity = ez.outExpo(pr(t, b0 + 0.45, 0.4));
      R_.lab.style.transform = `translate(80px,${772 + (1 - ez.outExpo(pr(t, b0 + 0.45, 0.4))) * 30}px)`;
      // clip in a circle, top right
      const ce = spring(since(t, b0 + 0.1), 1.8, 6.5);
      putShape(R_.shape, SH.circle, W - 170, 440 + 10 * Math.sin(t * 2 + i), 260 * clamp(ce, 0, 1.2), { r: (1 - clamp(ce, 0, 1)) * 30, op: since(t, b0 + 0.1) > 0 ? 1 : 0 });
      frameOf(R_.shape, r.id, Math.max(0, t - bt(b0 - 0.3)));
      // chart draws itself, a glowing head rides the line
      const dp = ez.inOutCubic(pb(t, b0 + 0.5, b0 + 1.8));
      R_.line.style.strokeDashoffset = `${R_.len * (1 - dp)}`;
      const hp = R_.line.getPointAtLength(R_.len * dp);
      R_.head.setAttribute("cx", hp.x); R_.head.setAttribute("cy", hp.y); R_.head.setAttribute("opacity", dp > 0 && dp < 1 ? 1 : dp >= 1 ? 1 : 0);
      R_.clip.setAttribute("width", hp.x);
      T(R_.card, { x: CH_.x, y: CH_.y + (1 - ez.outExpo(pr(t, b0 + 0.3, 0.5))) * 120, rx: (1 - ez.outExpo(pr(t, b0 + 0.3, 0.5))) * 30, op: since(t, b0 + 0.3) > -0.02 || i > 0 ? 1 : 0 });
      const vc = ez.outCubic(pb(t, b0 + 1.0, b0 + 2.3));
      R_.views.textContent = `${fmt(r.from)}  →  ${fmt(lerp(r.from, r.to, vc))}`;
    });
  }

  /* ===== 7,5 M+ (b42-44) ===== */
  function buildBig() {
    const L = layer(12);
    const size = 300;
    const num = el(L, { ...fnt(size, 800, 1, -0.045), color: C.white, whiteSpace: "pre", fontVariantNumeric: "tabular-nums", transformOrigin: "50% 60%", textShadow: "0 14px 70px rgba(0,0,0,.4)" });
    const mp = el(L, { ...fnt(size, 800, 1, -0.045), ...gtext(GR.brand, C.violet), whiteSpace: "pre", transformOrigin: "0 60%" }); mp.textContent = "M+";
    const lab = el(L, { ...fnt(46, 500, 1.2, 0.01, '"Geist Mono"'), color: C.white, whiteSpace: "pre" });
    const rings = [620, 860, 1100].map((d) => el(L, { width: d + "px", height: d + "px", borderRadius: "50%", border: `2px solid ${rgba(C.blueHi, 0.35)}`, boxSizing: "border-box", transformOrigin: "50% 50%" }));
    const orb = Array.from({ length: 10 }, () => shapeClip(L));
    S.big = { L, num, mp, lab, rings, orb, size };
  }
  function big(t) {
    const G = S.big, b = tb(t);
    const live = b >= 41.85 && b < SWEEP.mid;
    disp(G.L, live);
    if (!live) return;
    const c = ez.outCubic(pb(t, 42, 43));
    G.num.textContent = (Math.round(c * 75) / 10).toFixed(1).replace(".", ",");
    const wN = measure("7,5", G.size, 800, -0.045), wM = measure("M+", G.size, 800, -0.045), gap = 50;
    const em = ez.outExpo(clamp((since(t, 43) + 0.05) / 0.32));
    const x0 = lerp((W - wN) / 2, (W - wN - gap - wM) / 2, em), y = H / 2 - G.size * 0.62;
    T(G.num, { x: x0, y, s: lerp(1.5, 1, ez.outExpo(pr(t, 41.95, 0.45))) * (1 + 0.08 * (b >= 43 ? Math.exp(-since(t, 43) / 0.12) : 0)), op: since(t, 41.95) > 0 ? 1 : 0 });
    T(G.mp, { x: x0 + wN + gap + (1 - em) * 360, y, sx: 1 + (1 - em) * 0.6, op: since(t, 43) > -0.05 ? 1 : 0 });
    const s_ = "Vues générées pour nos clients", nch = Math.floor(Math.max(0, t - bt(43.25)) / 0.022);
    G.lab.textContent = s_.slice(0, nch);
    T(G.lab, { x: (W - measureF(s_, 46, 500, 0.01, '"Geist Mono"')) / 2, y: y + G.size + 40, op: 1 });
    G.rings.forEach((r, k) => { const d = 620 + 240 * k, e = spring(since(t, 42 + k * 0.08), 1.6, 6), p2 = b >= 43 ? 1 + 0.08 * Math.exp(-since(t, 43) / 0.2) : 1;
      T(r, { x: W / 2 - d / 2, y: H / 2 - d / 2 - 40, s: Math.max(0.001, clamp(e, 0, 1.2) * p2), r: (t - bt(42)) * (k % 2 ? 20 : -20), op: since(t, 42) > 0 ? 0.9 : 0 }); });
    G.orb.forEach((o, k) => { const e = spring(since(t, 42 + k * 0.06), 1.5, 6), th = (2 * Math.PI * k) / 10 + (t - bt(42)) * 0.6;
      const R = 640 * clamp(e, 0, 1.2);
      putShape(o, SH[RING_SH[k % 5]], W / 2 + Math.cos(th) * R * 0.82, H / 2 - 40 + Math.sin(th) * R * 1.2, 130 * clamp(e, 0, 1.2), { r: th * 20, op: since(t, 42 + k * 0.06) > 0 ? 1 : 0 });
      frameOf(o, `tile${(k * 5 + 2) % 24}`, Math.max(0, t - bt(42)) + k * 0.15); });
  }

  /* ===== contact form (b44-54): a floating glass form, typed live ===== */
  const NAME = "Jean Tremblay", MAIL = "jean@entreprise.com", MSG = "On veut des Reels qui cartonnent.";
  const TYPE = { name: [45.25, 1 / 8], mail: [47.25, 1 / 8], msg: [50.75, 1 / 16] };  // start beat, beats per character
  const LINE = "rgba(255,255,255,.1)", MUTED = "#9A9DAA";
  const txt = (parent, s, css = {}) => { const e = el(parent, { whiteSpace: "pre", ...css }); e.textContent = s; return e; };
  function buildForm() {
    const root = layer(13);
    const X = px(20);
    const kick = chip(root, "Nous joindre", null, { size: 30, h: 70, accent: true }); T(kick.e, { x: X, y: 210 });
    const h2 = words(root, [["Parlez-nous", "de"], ["vos", "idées."]], { size: 112, weight: 800, track: -0.045, lh: 1.0, w: W - 2 * X,
      style: (w) => (w === "idées." ? gtext(GR.brand, C.violet) : { color: C.white }) });
    T(h2.root, { x: X, y: 310 });
    const fyy = 310 + 2 * 112 + 56;
    const fw = W - 2 * X, pad = px(24), iw = fw - 2 * pad;
    const form = el(root, { width: fw + "px", height: "10px", borderRadius: px(20) + "px", background: "rgba(14,14,18,.86)", border: `2px solid ${LINE}`, boxSizing: "border-box", boxShadow: "0 50px 140px rgba(0,0,0,.55)", transformOrigin: "50% 0%" });
    el(form, { left: px(20) + "px", top: "-1px", width: fw - 2 * px(20) + "px", height: "4px", borderRadius: "2px", background: `linear-gradient(90deg, ${rgba(C.blueHi, 0)}, ${C.blueHi}, ${C.violet}, ${C.pink}, ${rgba(C.pink, 0)})` });
    const fields = [];
    let y = pad;
    const field = (label, ph, h = 46, kind = "input") => {
      const lab = txt(form, label, { ...fnt(px(13), 500, 1, 0), color: MUTED }); T(lab, { x: pad, y });
      y += px(13) + px(8);
      const box = el(form, { width: iw + "px", height: px(h) + "px", background: "rgba(255,255,255,.04)", border: `${px(1)}px solid ${LINE}`, borderRadius: px(12) + "px", boxSizing: "border-box" });
      T(box, { x: pad, y });
      const val = txt(box, "", { ...fnt(px(14), 400, 1.4, 0), color: C.white, whiteSpace: kind === "area" ? "pre-wrap" : "pre", width: iw - 2 * px(16) + "px" });
      T(val, { x: px(16), y: px(13) });
      const phd = txt(box, ph, { ...fnt(px(14), 400, 1.4, 0), color: "#5c5f6a" }); T(phd, { x: px(16), y: px(13) });
      const caret = el(box, { width: px(1.5) + "px", height: px(18) + "px", background: C.blueHi });
      const f = { lab, box, val, phd, caret, y0: y, h: px(h) };
      if (kind === "select") { phd.style.color = C.white; ico(box, "chevron", px(16), C.white, { left: iw - px(16) - px(16) + "px", top: px(15) + "px" }); }
      y += px(h) + px(16);
      fields.push(f); return f;
    };
    const fName = field("Prénom et nom *", "Jean Tremblay");
    const fMail = field("Courriel *", "jean@entreprise.com");
    const fSel = field("Ce qui vous intéresse", "Faites un choix", 46, "select");
    const fMsg = field("Parlez-nous de vous *", "Votre objectif, votre audience, vos échéances…", 110, "area");
    y += px(8);
    const btn = el(form, { height: px(50.5) + "px", width: iw + "px", borderRadius: "999px", display: "flex", alignItems: "center", justifyContent: "center", gap: px(8) + "px", background: "#8a8a90", color: C.bg, ...fnt(px(15), 600, 1, 0), whiteSpace: "nowrap", boxSizing: "border-box", transformOrigin: "50% 50%" });
    el(btn, { position: "relative" }, "span", "").textContent = "Envoyer ma demande";
    ico(btn, "arrow", px(16), C.bg, { position: "relative" });
    T(btn, { x: pad, y });
    const by = y; y += px(50.5) + pad;
    form.style.height = y + "px";
    const dd = el(form, { width: iw + "px", height: px(4 * 40 + 12) + "px", borderRadius: px(12) + "px", background: "#111116", border: `${px(1)}px solid ${LINE}`, boxSizing: "border-box", boxShadow: "0 30px 80px rgba(0,0,0,.6)", zIndex: 5 });
    const opts = ["Vidéos Reels", "Vidéos publicitaires", "Vidéos corporatives", "Photos"].map((o, i) => {
      const r = el(dd, { width: iw - px(12) + "px", height: px(38) + "px", borderRadius: px(8) + "px" }); T(r, { x: px(6), y: px(6) + i * px(40) });
      const s = txt(r, o, { ...fnt(px(14), 400, 1, 0), color: C.white }); T(s, { x: px(12), y: px(12) });
      return r;
    });
    const ok = el(form, { width: px(50.5) + "px", height: px(50.5) + "px", borderRadius: "999px", background: C.blue, display: "flex", alignItems: "center", justifyContent: "center", transformOrigin: "50% 50%", boxShadow: `0 0 50px ${rgba(C.blue, 0.8)}` });
    ico(ok, "check", px(26), C.white, { position: "relative" });
    const okRing = el(form, { width: px(50.5) + "px", height: px(50.5) + "px", borderRadius: "999px", border: `4px solid ${C.blueHi}`, boxSizing: "border-box", transformOrigin: "50% 50%" });
    const MS = "Message envoyé ✓ — On vous revient rapidement.";
    const msg = txt(form, MS, { ...fnt(px(14), 500, 1, 0), color: C.white });
    S.form = { root, kick, h2, form, fw, fName, fMail, fSel, fMsg, btn, by, dd, opts, ok, okRing, msg, MS, X, iw, pad, fy: fyy };
  }
  const typed = (t, s, [b0, per]) => s.slice(0, clamp(Math.floor((tb(t) - b0) / per) + 1, 0, s.length) * (tb(t) >= b0 ? 1 : 0));
  function contact(t) {
    const F = S.form, b = tb(t);
    const live = b >= SWEEP.mid - 0.02 && b < 54.6;
    disp(F.root, live);
    if (!live) return { live: false };
    const ent = ez.outExpo(pr(t, SWEEP.mid, 0.7));
    F.kick.e.style.clipPath = `inset(0 ${(1 - ez.outExpo(pr(t, 44.0, 0.4))) * 100}% 0 0 round 999px)`;
    F.h2.words.forEach((w, i) => rise(w, pr(t, 44.05 + i * 0.12, 0.4)));
    const fly = F.fy + (1 - ent) * 260;
    T(F.form, { x: F.X, y: fly, rx: (1 - ent) * 35 + 1.2 * Math.sin(t * 1.3), ry: 1.5 * Math.sin(t * 0.9), op: ent > 0 ? 1 : 0 });
    const nm = typed(t, NAME, TYPE.name), ml = typed(t, MAIL, TYPE.mail), ms = typed(t, MSG, TYPE.msg);
    const sel = b >= 50.25;
    const set = (f, v, focused) => { f.val.textContent = v; vis(f.phd, !v); f.box.style.borderColor = focused ? C.blueHi : LINE; f.box.style.boxShadow = focused ? `0 0 0 ${px(3)}px ${rgba(C.blue, 0.3)}, 0 0 40px ${rgba(C.blue, 0.35)}` : "none";
      const w = measureF(v.split("\n").pop(), px(14), 400, 0); T(f.caret, { x: px(16) + w + 2, y: px(14), op: focused && Math.floor((t * 2.5) % 2) === 0 ? 1 : focused ? 0.999 : 0 }); };
    const focus = b < 45 ? null : b < 47 ? "name" : b < 49.5 ? "mail" : b < 50.5 ? "sel" : b < 53 ? "msg" : null;
    set(F.fName, nm, focus === "name"); set(F.fMail, ml, focus === "mail");
    F.fSel.phd.textContent = sel ? "Vidéos Reels" : "Faites un choix"; F.fSel.box.style.borderColor = focus === "sel" ? C.blueHi : LINE; vis(F.fSel.caret, false);
    set(F.fMsg, ms, focus === "msg");
    const ddo = b >= 49.55 && b < 50.3, ddp = ez.outExpo(pr(t, 49.55, 0.25));
    T(F.dd, { x: F.pad, y: F.fSel.y0 + px(46) + px(6) - (1 - ddp) * 20, op: ddo ? ddp : 0 });
    F.opts.forEach((o, i) => { o.style.background = i === 0 && b >= 49.95 ? rgba(C.blue, 0.28) : "transparent"; });
    const valid = ms.length === MSG.length;
    F.btn.style.background = valid ? C.white : "#8a8a90";
    const press = b >= 53 - 0.04 && b < 53.12 ? 0.95 : 1;
    const morph = ez.inOutExpo(pb(t, 53.15, 53.6));
    F.btn.style.width = lerp(F.iw, px(50.5), morph) + "px";
    T(F.btn, { x: F.pad + (F.iw - lerp(F.iw, px(50.5), morph)) / 2, y: F.by, s: press, op: morph < 0.98 ? 1 : 0 });
    F.btn.querySelectorAll("span, div").forEach((c) => (c.style.opacity = 1 - clamp(morph * 3)));
    const okE = spring(since(t, 53.6) + 0.03, 2.4, 7);
    T(F.ok, { x: F.pad + (F.iw - px(50.5)) / 2, y: F.by, s: Math.max(0.001, okE), op: since(t, 53.6) > -0.03 ? 1 : 0 });
    const rd = since(t, 53.6);
    T(F.okRing, { x: F.pad + (F.iw - px(50.5)) / 2, y: F.by, s: 1 + 2.6 * ez.outExpo(clamp(rd / 0.6)), op: rd > 0 ? 1 - clamp(rd / 0.6) : 0 });
    const mm = ez.outExpo(pr(t, 53.75, 0.4));
    T(F.msg, { x: F.pad + (F.iw - measureF(F.MS, px(14), 500, 0)) / 2, y: F.by + px(64) + (1 - mm) * 16, op: mm });
    const fy = { name: F.fName.y0, mail: F.fMail.y0, sel: F.fSel.y0, msg: F.fMsg.y0 }[focus] ?? F.by;
    return { live: true, focus, fyStage: F.fy + fy, F };
  }

  /* ===== cursor ===== */
  function buildCursor() {
    const root = layer(16);
    const k = 1.9;
    const c = el(root, { width: 24 * k + "px", height: 36 * k + "px" });
    c.innerHTML = `<svg viewBox="-1 -1 24 36" width="${24 * k}" height="${36 * k}"><path d="M1 1 L1 27 L7.4 21.2 L11.6 31 L15.8 29.2 L11.7 19.6 L20 19.6 Z" fill="#fff" stroke="#000" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
    c.style.filter = "drop-shadow(0 6px 10px rgba(0,0,0,.45))";
    const ring = el(root, { width: "90px", height: "90px", borderRadius: "50%", border: "3px solid rgba(255,255,255,.85)", boxSizing: "border-box" });
    S.cur = { root, c, ring };
  }
  function cursor(t, fs) {
    const Cu = S.cur, b = tb(t);
    if (b >= 58.3) {                                           // last moment: the cursor clicks the logo
      disp(Cu.root, true);
      const L_ = S.logo, cx = W / 2 + 40, cy = L_.by + L_.total * 0.45;
      const e = ez.inOutCubic(pb(t, 58.3, 58.9));
      const x = lerp(W * 0.92, cx, e), y = lerp(H * 1.02, cy, e);
      const d = since(t, 59), press = d > -0.03 && d < 0.1 ? 1 : 0, ringP = d >= 0 && d < 0.4 ? d / 0.4 : -1;
      T(Cu.c, { x, y, s: 1 - 0.16 * press });
      T(Cu.ring, { x: x - 45 * (0.4 + ringP), y: y - 45 * (0.4 + ringP), s: 0.4 + ringP, op: ringP >= 0 ? 1 - ringP : 0 });
      return;
    }
    if (!fs.live || b < 44.6 || b > 54) { disp(Cu.root, false); return; }
    disp(Cu.root, true);
    const F = fs.F, fx = F.X, fy = F.fy;
    const tgt = (f, dx = 0.7, dy = 0.5) => [fx + F.pad + F.iw * dx, fy + f.y0 + f.h * dy];
    const keys = [
      [44.6, [W * 0.85, H * 0.95]],
      [45.0, tgt(F.fName)], [46.8, tgt(F.fName)],
      [47.0, tgt(F.fMail)], [49.2, tgt(F.fMail)],
      [49.5, tgt(F.fSel, 0.8)], [49.8, tgt(F.fSel, 0.8)],
      [50.2, [fx + F.pad + F.iw * 0.3, fy + F.fSel.y0 + px(46) + px(6) + px(25)]],
      [50.5, tgt(F.fMsg, 0.75, 0.35)], [52.6, tgt(F.fMsg, 0.75, 0.35)],
      [53.0, [fx + F.pad + F.iw * 0.62, fy + F.by + px(25)]], [53.6, [fx + F.pad + F.iw * 0.62, fy + F.by + px(25)]],
      [54.0, [W * 0.9, H * 1.05]],
    ];
    let p = keys[0][1];
    for (let i = 0; i < keys.length - 1; i++) { const [b0, a] = keys[i], [b1, bb] = keys[i + 1]; if (b >= b0) { const e = ez.inOutCubic(pb(t, b0, b1)); p = [lerp(a[0], bb[0], e), lerp(a[1], bb[1], e)]; } }
    let press = 0, ringP = -1;
    for (const bc of [45, 47, 49.5, 50.25, 50.5, 53]) { const d = since(t, bc); if (d > -0.03 && d < 0.1) press = 1; if (d >= 0 && d < 0.4) ringP = d / 0.4; }
    T(Cu.c, { x: p[0], y: p[1], s: 1 - 0.16 * press });
    T(Cu.ring, { x: p[0] - 45 * (0.4 + ringP), y: p[1] - 45 * (0.4 + ringP), s: 0.4 + ringP, op: ringP >= 0 ? 1 - ringP : 0 });
  }

  /* ===== ending (b54-60, approved): the check grows into the dark site background, centred tagline, centred logo, a click ===== */
  function buildLogo(svgText) {
    const root = layer(15);
    const disc = el(root, { width: "200px", height: "200px", borderRadius: "50%", background: C.blue });
    const fill = el(root, { width: W + "px", height: H + "px", background: `radial-gradient(55% 32% at 50% 50%, ${rgba(C.blue, 0.16)} 0%, rgba(5,5,5,0) 100%), radial-gradient(120% 60% at 50% 0%, #0c1022 0%, ${C.bg} 60%)` });
    const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
    const paths = [...doc.querySelectorAll("path")].map((p) => p.outerHTML);
    const mk = (vb, inner, w) => { const h = (w * vb[3]) / vb[2]; const d = el(root, { width: w + "px", height: h + "px", overflow: "hidden" }); d.innerHTML = `<svg viewBox="${vb.join(" ")}" width="${w}" height="${h}" style="display:block">${inner}</svg>`; return { d, h }; };
    const Lw = 720;
    const board = mk([0, 0, 221, 98], `${paths[0]}${paths[1]}${paths[4]}<g id="arm">${paths[2]}${paths[3]}</g><g id="boom">${paths.slice(5).join("")}</g>`, Lw);
    const wordm = mk([0, 98, 221, 42], paths[4], Lw);
    const subm = mk([0, 140, 221, 20], paths[4], Lw);
    const tag = words(root, [["Et", "si", "votre"], ["prochaine", "vidéo"], ["changeait", "tout ?"]], { size: 100, weight: 700, track: -0.035, lh: 1.04, w: W - 140, align: "center", style: (w, i) => ({ color: i >= 5 ? C.blue : C.white }) });
    const total = board.h + wordm.h + subm.h;
    S.logo = { root, disc, fill, board, wordm, subm, arm: board.d.querySelector("#arm"), boom: board.d.querySelector("#boom"), tag, Lw, bx: (W - Lw) / 2, by: (H - total) / 2, ty: (H - tag.height) / 2, total };
  }
  function lockup(t, fs) {
    const Lg = S.logo;
    const live = t >= bt(53.55);
    disp(Lg.root, live);
    if (!live) return;
    const okX = fs.F ? fs.F.X + fs.F.pad + fs.F.iw / 2 : W / 2, okY = fs.F ? fs.F.fy + fs.F.by + px(25) : H / 2;
    const g = ez.inOutExpo(pb(t, 53.85, 54.35));
    const r = lerp(px(25), Math.hypot(W, H), g);
    T(Lg.disc, { x: okX - r, y: okY - r, op: g > 0 && g < 1 ? 1 : 0 });
    { const k = clamp(g * 1.4); Lg.disc.style.background = `rgb(${Math.round(lerp(44, 5, k))},${Math.round(lerp(91, 5, k))},${Math.round(lerp(255, 5, k))})`; }
    Lg.disc.style.width = Lg.disc.style.height = 2 * r + "px";
    vis(Lg.fill, g >= 1);
    const tq = ez.inExpo(pb(t, 56.6, 57.0));
    T(Lg.tag.root, { x: 70, y: Lg.ty - tq * 60 });
    Lg.tag.words.forEach((w, i) => rise(w, clamp((t - bt(54.5 + i * 0.25) + 0.03) / 0.35), tq, 0.2));
    const LB = 57, CL = 57.5;
    const dt = t - bt(LB) + 0.02, e = spring(dt, 2.2, 7);
    const click = since(t, 59), press = click >= 0 ? 1 - 0.05 * Math.exp(-click / 0.09) * Math.min(1, click / 0.03 + 0.2) : 1;
    Lg.root.style.perspective = "none";
    const lsc = (0.55 + 0.45 * e) * press;
    T(Lg.board.d, { x: Lg.bx + (Lg.Lw * (1 - lsc)) / 2, y: Lg.by + (1 - ez.outExpo(clamp(dt / 0.5))) * 200 + Lg.board.h * (1 - press) * 0.5, s: lsc, r: (1 - e) * -6, op: dt > 0 ? 1 : 0 });
    const tc = t - bt(CL);
    let ang;
    if (tc < -0.07) ang = lerp(-12, -19, ez.outCubic(clamp((t - bt(LB + 0.25)) / (bt(CL) - 0.07 - bt(LB + 0.25)))));
    else if (tc < 0) ang = lerp(-19, 24, ez.inExpo(clamp((tc + 0.07) / 0.07)));
    else if (tc < 0.08) ang = 24;
    else ang = 24 * (1 - spring(tc - 0.08, 2.0, 6.5));
    Lg.arm.setAttribute("transform", `rotate(${ang} 71 41)`);
    Lg.boom.setAttribute("transform", `translate(110 65) scale(${Math.max(0.0001, tc < 0 ? 0 : spring(tc, 2.6, 6))}) translate(-110 -65)`);
    const wm = ez.outExpo(pr(t, CL + 0.15, 0.5)), sm = ez.outExpo(pr(t, CL + 0.5, 0.5));
    const pw = (Lg.Lw * (1 - press)) / 2;
    T(Lg.wordm.d, { x: Lg.bx + pw, y: Lg.by + Lg.board.h, s: press, op: t >= bt(CL + 0.15) ? 1 : 0 }); Lg.wordm.d.firstChild.style.transform = `translateY(${(1 - wm) * 105}%)`;
    T(Lg.subm.d, { x: Lg.bx + pw, y: Lg.by + Lg.board.h + Lg.wordm.h, s: press, op: t >= bt(CL + 0.5) ? 1 : 0 }); Lg.subm.d.firstChild.style.transform = `translateY(${(1 - sm) * 105}%)`;
  }

  /* ===== flash + camera ===== */
  function buildFlash() {
    S.flash = el(stage, { width: W + "px", height: H + "px", zIndex: 17, mixBlendMode: "screen", background: `radial-gradient(circle at 50% 50%, ${rgba(C.white, 0.9)} 0%, ${rgba(C.blueHi, 0.7)} 25%, ${rgba(C.blue, 0.35)} 55%, ${rgba(C.blue, 0)} 85%)` });
  }
  function flash(t) {
    let f = 0;
    for (const [b, a] of [[3, 0.55], [8, 0.6], [12, 0.25], [18, 0.3], [30, 0.95], [31.5, 0.3], [33, 0.35], [42, 0.4], [43, 0.55], [54, 0.3], [57.5, 0.4]]) {
      const d = since(t, b); if (d >= -0.04) f = Math.max(f, a * (d < 0 ? (d + 0.04) / 0.04 : Math.exp(-d / (b === 30 ? 0.3 : 0.14))));
    }
    T(S.flash, { op: f });
  }
  function camera(t, fs) {
    let s = 1, x = 0, y = 0, r = 0;
    const b = tb(t);
    for (const [hb, a] of [[0, 0.03], [1, 0.03], [2, 0.03], [3, 0.08], [6, 0.02], [7, 0.02], [8, 0.07], [12, 0.03], [18, 0.04], [21, 0.03], [24, 0.03], [27, 0.03], [30, 0.1], [31, 0.03], [31.5, 0.05], [32, 0.03], [32.5, 0.03], [33, 0.05], [36, 0.03], [39, 0.03], [42, 0.05], [43, 0.07], [57.5, 0.045], [59, 0.012]]) {
      const d = since(t, hb); if (d >= 0) s += a * Math.exp(-d / 0.12);
    }
    for (const [hb, a] of [[3, 22], [8, 16], [30, 30], [31.5, 14], [43, 18], [57.5, 16]]) { const d = since(t, hb); if (d >= 0 && d < 0.6) { const e = a * Math.exp(-d / 0.13); x += e * sn(d * 30, hb); y += e * sn(d * 30, hb + 50); r += e * 0.025 * sn(d * 22, hb + 9); } }
    if ((b >= 8 && b < 29.4) || (b >= 30 && b < 42)) s += 0.012 * Math.exp(-(b - Math.floor(b)) * PER / 0.08);
    // form: follow the active field so typing stays legible on a phone
    if (fs.live && fs.focus) { const target = H * 0.5 - fs.fyStage; const f = clamp(b - 45, 0, 1) * clamp(54 - b, 0, 1); y += clamp(target, -600, 200) * 1.12 * f; s *= 1 + 0.12 * f; }
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

  /* ---------- sound design: every visual event has a sound, placed on the measured grid ---------- */
  function buildCues() {
    // hook
    [0.6, 0.65, 0.72, 0.95].forEach((g, i) => cue(i, "slam", g));
    cue(1, "zip", 0.35, -0.3, { dir: 1 }); cue(2, "zip", 0.35, 0.3, { dir: -1 });
    cue(3, "thump", 0.9); cue(3, "bloom", 0.5); cue(3.05, "sparkle", 0.55);
    [4, 4.5, 5, 5.25].forEach((b, i) => cue(b, "glint", 0.3, -0.4 + i * 0.27, { step: i }));
    cue(5.85, "air", 0.55, 0, { dir: -1 });
    cue(6, "slam", 0.5); cue(7, "slam", 0.55);
    [6, 6.5, 7].forEach((b, i) => cue(b, "zip", 0.3, 0.4 - i * 0.4, { dir: 1 }));
    cue(7.9, "air", 0.6, 0, { dir: 1 });
    // burst + mosaic
    cue(8, "thump", 0.85); cue(8, "slam", 0.7); cue(8, "bloom", 0.45);
    for (let i = 1; i < 8; i++) cue(8 + i * 0.5, "zip", 0.32, i % 2 ? 0.4 : -0.4, { dir: i % 2 ? 1 : -1 });
    cue(12, "bloom", 0.5); cue(12, "slam", 0.5); cue(12.5, "slam", 0.45);
    for (let k = 0; k < 4; k++) { cue(12 + k * 0.5, "zip", 0.26, [-0.5, 0.5, -0.45, 0.45][k], { dir: 1 }); cue(12.05 + k * 0.5, "glint", 0.28, [-0.5, 0.5, -0.45, 0.45][k], { step: k + 2 }); }
    cue(14.3, "air", 0.5, 0, { dir: 1 });
    // agency
    cue(14.47, "tap", 0.5, -0.3); [14.72, 14.97, 15.22].forEach((b, i) => cue(b, "glint", 0.25, -0.2, { step: i + 1 }));
    cue(15.5, "zip", 0.35, 0, { dir: 1 }); cue(15.5, "bloom", 0.35);
    [16, 16.5, 17].forEach((b, i) => { cue(b, "tap", 0.45, [-0.5, 0.5, -0.4][i]); cue(b, "glint", 0.3, [-0.5, 0.5, -0.4][i], { step: 3 + i }); });
    cue(17.62, "air", 0.6, 0, { dir: 1 }); cue(17.86, "thump", 0.55); cue(18.05, "shimmer", 0.45);
    // process
    cue(18.15, "slam", 0.55); cue(21, "slam", 0.55); cue(24, "slam", 0.55); cue(27, "slam", 0.55);
    for (const b of [21, 24, 27]) cue(b - 0.05, "zip", 0.32, 0, { dir: b % 2 ? 1 : -1 });
    [18.3, 18.42, 18.54].forEach((b, i) => cue(b, "glint", 0.22, -0.3 + i * 0.3, { step: i }));
    cue(18.6, "shimmer", 0.35);
    cue(21.2, "tap", 0.6, -0.3); cue(21.25, "tap", 0.5, 0.3); for (const b of [22, 22.5, 23, 23.5]) cue(b, "glint", 0.15, -0.5, { step: 0 });
    for (let k = 0; k < 6; k++) cue(24.25 + k * 0.125, "tap", 0.42, -0.5 + k * 0.2);
    for (let k = 0; k < 4; k++) { cue(27.25 + k * 0.25, "zip", 0.22, [-0.5, 0.5, -0.5, 0.5][k], { dir: 1 }); cue(27.3 + k * 0.25, "glint", 0.3, [-0.5, 0.5, -0.5, 0.5][k], { step: 2 + k }); }
    cue(29.55, "air", 0.6, 0, { dir: -1 });
    // explosion
    cue(30, "thump", 1.0); cue(30, "bloom", 0.6); cue(30, "slam", 0.85); cue(30.02, "shimmer", 0.5); cue(30.05, "sparkle", 0.5);
    cue(31, "slam", 0.6); cue(31.25, "slam", 0.6); cue(31.5, "slam", 0.85); cue(31.5, "thump", 0.6);
    cue(31, "sparkle", 0.35); cue(32, "sparkle", 0.4); cue(32.5, "sparkle", 0.45);
    cue(32.9, "air", 0.6, 0, { dir: 1 });
    // results
    for (let i = 0; i < 3; i++) {
      const b0 = 33 + 3 * i;
      if (i) cue(b0 - 0.08, "zip", 0.4, 0.3, { dir: -1 });
      cue(b0 + 0.2, "slam", 0.7);
      for (let k = 0; k < 6; k++) cue(b0 + 0.25 + k * 0.125, "tap", 0.18 + 0.03 * k, 0.1);
      cue(b0 + 1.2, "glint", 0.4, 0.3, { step: 5 });
      cue(b0 + 0.3, "air", 0.35, 0, { dir: 1 });
      cue(b0 + 1.8, "glint", 0.45, 0.4, { step: 6 }); cue(b0 + 1.8, "shimmer", 0.25);
    }
    cue(41.85, "air", 0.55, 0, { dir: 1 });
    // 7,5 M+
    cue(42, "thump", 0.85); cue(42, "bloom", 0.5); cue(42, "slam", 0.65);
    for (let k = 0; k < 8; k++) cue(42 + k * 0.125, "tap", 0.15 + 0.02 * k, 0);
    cue(43, "slam", 0.9); cue(43, "thump", 0.85); cue(43.03, "sparkle", 0.55);
    for (let k = 0; k < 10; k++) cue(43.25 + k * 0.09, "key", 0.3, 0, { var: k });
    cue(SWEEP.mid - 0.1, "air", 0.65, 0, { dir: 1 }); cue(SWEEP.mid, "thump", 0.45);
    // form (UI sounds, as approved in v2)
    cue(44.05, "glint", 0.25, 0, { step: 1 });
    for (const b of [45, 47, 49.5, 50.5]) cue(b, "tap", 0.65, 0.2);
    cue(50.25, "select", 0.7);
    const keyCues = (s, [b0, per]) => [...s].forEach((ch, i) => { if (ch !== " ") cue(b0 + i * per, "key", 0.45, 0.15, { var: i }); });
    keyCues(NAME, TYPE.name); keyCues(MAIL, TYPE.mail); keyCues(MSG, TYPE.msg);
    cue(53, "tap", 0.85, 0.2); cue(53.6, "send", 0.55); cue(53.6, "ding", 0.85); cue(53.62, "shimmer", 0.35);
    // ending
    cue(54.1, "air", 0.45, 0, { dir: 1 }); cue(54, "bloom", 0.4);
    for (let i = 0; i < 7; i++) cue(54.5 + i * 0.25, "glint", 0.18, -0.3 + i * 0.1, { step: i });
    cue(57, "glint", 0.35, 0, { step: 4 }); cue(57.5, "clap", 0.6); cue(57.5, "thump", 0.75); cue(59, "tap", 1.0, 0.1); cue(59.02, "shimmer", 0.3);
  }

  /* ---------- frame ---------- */
  async function seek(t) {
    pending.length = 0;
    field(t); deco(t); hook(t); voici(t); burst(t); mosaic(t); agency(t); wipes(t); process(t); boom(t); results(t); big(t);
    const fs = contact(t);
    cursor(t, fs); lockup(t, fs); flash(t); camera(t, fs);
    const f = Math.floor(t * 30 + 1e-6);
    T(S.grain, { x: -Math.floor(hash(f, 3) * 256), y: -Math.floor(hash(f, 4) * 256), op: 0.12 });
    await Promise.all(pending);
  }

  window.DURATION = 30;
  window.ready = (async () => {
    const [beats, uses, svg] = await Promise.all([
      fetch("../beats3.json").then((r) => r.json()),
      fetch("../assets/broll/uses.json").then((r) => r.json()),
      fetch("../assets/brand/logo-white.svg").then((r) => r.text()),
    ]);
    BTS = beats.beats; PER = beats.period; USES = uses;
    for (const w of ["400", "500", "600", "700", "800"]) await document.fonts.load(`${w} 100px Geist`);
    await document.fonts.load('500 100px "Geist Mono"');
    await document.fonts.ready;
    buildField(); buildDeco(); buildBurst(); buildHook(); buildVoici(); buildMosaic(); buildAgency(); buildWipes(); buildProcess(); buildBoom(); buildResults(); buildBig(); buildForm(); buildCursor(); buildLogo(svg); buildFlash(); buildGrain(); buildCues();
    window.CUES = CUES.map((c) => ({ ...c, t: bt(c.beat) }));
    window.seek = seek;
    await seek(0);
    return { W, H, FMT: "portrait", cues: CUES.length };
  })();
})();
