/* Import-Rama — pubs Google/Meta (9:16, ~14.5 s, French VO). Built on the showreel's language: Barlow Condensed
   uppercase, the brand red, black / paper, the 新 mark. Every scene is cut to the voice-over's measured words.
   ?v=1  video (1 = emballages jetables)      ?k=a  pure motion design      ?k=b  AI b-roll + motion type + captions
   window.seek(t) paints frame t (pure function of t). */
(() => {
  const P = new URLSearchParams(location.search);
  const W = +(P.get("w") || 1080), H = +(P.get("h") || 1920);
  const VID = P.get("v") || "1", K = P.get("k") || "a", FOOT = K === "b";
  const A = "../assets/importrama/", F = "../assets/imp-ads/";
  const C = { red: "#BD2A20", black: "#0A0A0A", ink: "#111111", warm: "#2A2725", paper: "#F3F1EE", white: "#FFFFFF", grey: "#C9C3BB", mid: "#57514C" };
  const M = 72;

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
  };
  const spring = (dt, f = 2.4, d = 7) => (dt <= 0 ? 0 : 1 - Math.exp(-d * dt) * Math.cos(2 * Math.PI * f * dt));
  const pr = (t, t0, dur) => clamp((t - t0) / dur);
  const inR = (t, a, b) => t >= a && t < b;

  /* ---------- the voice-over: measured word onsets (s), VO placed at OFF ---------- */
  const OFF = 0.15;
  const SCRIPTS = {
    "1": {
      len: 14.5,
      words: [["T'as", 0], ["un", 0.28], ["resto?", 0.38], ["Contenants,", 1.04], ["ustensiles,", 1.82], ["sacs\u00a0:", 2.72],
        ["tu", 3.36], ["les", 3.46], ["rachètes", 3.6], ["chaque", 4.02], ["mois.", 4.22],
        ["Import-Rama", 5.0], ["les", 5.74], ["fait", 5.86], ["fabriquer", 5.98], ["à", 6.46], ["la", 6.66], ["source,", 6.76],
        ["et", 7.1], ["s'occupe", 7.42], ["de", 7.84], ["tout.", 7.94],
        ["Envoie", 8.58], ["ta", 8.94], ["liste\u00a0:", 9.02], ["on", 9.6], ["challenge", 9.72], ["ton", 10.2], ["prix", 10.4], ["actuel.", 10.6],
        ["Demande", 11.32], ["ta", 11.72], ["soumission.", 11.88]],
      phrases: [[0, 3], [3, 6], [6, 11], [11, 15], [15, 18], [18, 22], [22, 25], [25, 30], [30, 33]],
      voEnd: 12.6,
    },
  };
  const SC = SCRIPTS[VID];
  const WT = SC.words.map(([w, t]) => ({ w, t: t + OFF }));
  const w = (i) => WT[i].t;            // onset of word i on the film timeline

  /* ---------- beat grid (cue placement only; scenes follow the voice) ---------- */
  let BTS = [0], PER = 0.5;
  const CUES = [];
  const cue = (t, type, gain = 1, pan = 0, extra = {}) => CUES.push({ beat: (t - BTS[0]) / PER, type, gain, pan, ...extra });

  /* ---------- DOM ---------- */
  const stage = document.getElementById("stage");
  Object.assign(stage.style, { width: W + "px", height: H + "px" });
  const el = (parent, css = {}, tag = "div", cls = "a") => { const e = document.createElement(tag); e.className = cls; Object.assign(e.style, css); parent.appendChild(e); return e; };
  const vis = (e, v) => { e.style.visibility = v ? "visible" : "hidden"; };
  const disp = (e, v) => { e.style.display = v ? "" : "none"; };
  function T(e, o = {}) {
    const { x = 0, y = 0, s = 1, sx = 1, sy = 1, r = 0, op = 1 } = o;
    e.style.transform = `translate3d(${x}px,${y}px,0) rotate(${r}deg) scale(${s * sx},${s * sy})`;
    e.style.opacity = op;
    vis(e, op > 0.001);
  }
  const BC = '"Barlow Condensed", "Arial Narrow", sans-serif', BR = "Barlow, Arial, sans-serif";
  const fBC = (size, wt = 800, lh = 0.86, tr = -0.005) => ({ font: `${wt} ${size}px/${lh} ${BC}`, letterSpacing: `${tr}em`, textTransform: "uppercase" });
  const mctx = document.createElement("canvas").getContext("2d");
  const measure = (s, size, wt = 800, tr = -0.005) => { mctx.font = `${wt} ${size}px ${BC}`; mctx.letterSpacing = `${tr * size}px`; return mctx.measureText(s.toUpperCase()).width; };
  const fit = (s, maxW, wt = 800, cap = 520) => Math.min(cap, (maxW / measure(s, 100, wt)) * 100);
  const dot = (c = C.red, ch = ".") => `<span style="color:${c}">${ch}</span>`;

  /* masked line: the ink rises through its mask */
  function line(parent, html, size, color, x, y, wt = 800) {
    const pad = size * 0.12;
    const m = el(parent, { left: x + "px", top: y - pad + "px", overflow: "hidden", padding: `${pad}px ${size * 0.08}px ${pad}px 0` });
    const ink = el(m, { ...fBC(size, wt), color, whiteSpace: "pre", position: "relative" }, "div", "");
    ink.innerHTML = html;
    return { m, ink, size, w: measure(ink.textContent, size, wt) };
  }
  function rise(o, p, q = 0, stretch = 0.3) {
    const e = ez.outExpo(p), x = ez.inExpo(q);
    o.ink.style.transform = `translateY(${(1 - e) * 108 - x * 108}%) scaleY(${1 + (1 - e) * stretch})`;
    o.ink.style.transformOrigin = "50% 100%";
    vis(o.m, p > 0 && q < 1);
  }
  const RISE = 0.34;     // seconds for a line to land
  function imgCell(parent, src, w_, h_) {
    const box = el(parent, { width: w_ + "px", height: h_ + "px", overflow: "hidden", background: C.warm });
    const img = el(box, { width: "100%", height: "100%", objectFit: "cover", display: "block", transformOrigin: "50% 50%" }, "img", "");
    img.src = src;
    return { box, img };
  }

  /* ---------- footage: AI b-roll as native-rate JPG sequences ---------- */
  const pending = [];
  let MAN = {};
  function footage(parent, css = {}) {
    const box = el(parent, { width: W + "px", height: H + "px", overflow: "hidden", background: C.black, ...css });
    const img = el(box, { width: "100%", height: "100%", objectFit: "cover", display: "block", transformOrigin: "50% 50%" }, "img", "");
    img.decoding = "sync";
    return { box, img, cur: "" };
  }
  function shotFrame(f, shot, local) {
    const m = MAN[shot] || { n: 1, fps: 24 };
    const i = Math.max(0, Math.min(m.n - 1, Math.floor(local * m.fps + 1e-6))) + 1;
    const src = `${F}frames/${shot}/${String(i).padStart(4, "0")}.jpg`;
    if (f.cur !== src) { f.cur = src; f.img.src = src; pending.push(f.img.decode().catch(() => {})); }
  }

  /* ---------- logo: the site's SVG, split into the 新 mark, IMPORT, RAMA and the tagline ---------- */
  const LOGO = {};
  function buildLogoParts(svgText) {
    const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
    LOGO.paths = [...doc.querySelectorAll("path")].map((p) => p.outerHTML);
    LOGO.vb = doc.documentElement.getAttribute("viewBox").split(/\s+/).map(Number);
    LOGO.parts = { glyph: [18], importW: [19, 20, 21, 22, 23, 24], rama: [25, 26, 27, 28], tag: [...Array(18).keys()] };
    const probe = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    probe.setAttribute("viewBox", LOGO.vb.join(" ")); probe.style.cssText = "position:absolute;left:-9999px;width:1168px;height:296px";
    probe.innerHTML = `<g id="gg">${LOGO.paths[18]}</g>`; document.body.appendChild(probe);
    const bb = probe.querySelector("#gg").getBBox(); probe.remove();
    LOGO.glyphBox = [bb.x, bb.y, bb.width, bb.height];
  }
  function logoSVG(parent, part, width, fill = null) {
    const [x, y, w_, h_] = part === "glyphOnly" ? LOGO.glyphBox : LOGO.vb;
    const ids = part === "glyphOnly" ? LOGO.parts.glyph : LOGO.parts[part];
    const hh = (width * h_) / w_;
    const d = el(parent, { width: width + "px", height: hh + "px" });
    let inner = ids.map((i) => LOGO.paths[i]).join("");
    if (fill) inner = inner.replace(/fill:#[0-9a-fA-F]{6}/g, `fill:${fill}`).replace(/fill="#[0-9a-fA-F]{6}"/g, `fill="${fill}"`);
    d.innerHTML = `<svg viewBox="${x} ${y} ${w_} ${h_}" width="${width}" height="${hh}" style="display:block;overflow:visible">${inner}</svg>`;
    return { d, w: width, h: hh };
  }
  /* a full lockup: glyph (red) + IMPORT + RAMA + tag, in a given ink */
  function lockup(parent, width, ink) {
    const g = el(parent, { width: width + "px", height: (width * LOGO.vb[3]) / LOGO.vb[2] + "px" });
    const parts = [logoSVG(g, "glyph", width, C.red), logoSVG(g, "importW", width, ink), logoSVG(g, "rama", width, ink), logoSVG(g, "tag", width, ink)];
    return { g, parts, w: width, h: parts[0].h };
  }
  function lockupPaint(L, t0, t) {
    const [gl, im, ra, tg] = L.parts;
    const gb = LOGO.glyphBox, vb = LOGO.vb;
    const gcx = ((gb[0] - vb[0] + gb[2] / 2) / vb[2]) * L.w, gcy = ((gb[1] - vb[1] + gb[3] / 2) / vb[3]) * L.h;
    gl.d.style.transformOrigin = `${gcx}px ${gcy}px`;
    const pop = clamp(spring(t - t0 + 0.02, 2, 6.5), 0, 1.25);
    T(gl.d, { s: Math.max(0.001, pop), op: t >= t0 ? 1 : 0 });
    const reveal = (d, b0) => { const k = ez.outExpo(pr(t, b0, 0.45)); d.d.style.clipPath = `inset(0 ${(1 - k) * 100}% 0 0)`; T(d.d, { x: (1 - k) * 30, op: t >= b0 ? 1 : 0 }); };
    reveal(im, t0 + 0.14); reveal(ra, t0 + 0.3); reveal(tg, t0 + 0.46);
  }

  /* ---------- layers ---------- */
  const cam = el(stage, { width: W + "px", height: H + "px", transformOrigin: "50% 50%" });
  const layer = (z, css = {}) => el(cam, { width: W + "px", height: H + "px", zIndex: z, overflow: "hidden", ...css });
  const S = {};
  const INK = FOOT ? C.white : C.ink;           // text over footage is white

  /* =========================================================================================
     VIDEO 1 — emballages jetables
     ========================================================================================= */
  const T1 = { s2: w(3) - 0.07, s3: w(6) - 0.16, s4: w(11) - 0.12, s5: w(22) - 0.2, s6: w(30) - 0.24, end: SC.len };
  // footage plan for k=b: [shot, film start, film end, in-point, speed]
  const SHOTS1 = [["s1", 0, T1.s2, 0.5, 1], ["s2", T1.s2, T1.s3, 0.35, 1], ["s3", T1.s3, T1.s4, 0.55, 1],
    ["s4", T1.s4, w(18) - 0.1, 0.0, 1], ["s5", w(18) - 0.1, w(20) + 0.18, 0.6, 1], ["s6", w(20) + 0.18, T1.s5, 0.9, 1],
    ["s2", T1.s5, T1.s6, 0.2, 0.5]];

  function buildFootage() {
    if (!FOOT) return;
    const root = layer(1);
    S.foot = footage(root);
    S.footShade = el(root, { width: W + "px", height: H + "px" });
  }
  function footPaint(t) {
    if (!FOOT) return;
    const sh = SHOTS1.find(([, a, b]) => t >= a && t < b) || SHOTS1[SHOTS1.length - 1];
    const [name, a, , inp, sp] = sh;
    shotFrame(S.foot, name, inp + (t - a) * sp);
    // a slow push on every shot, a punch on every cut
    const k = t - a, punch = 0.06 * Math.exp(-k / 0.18);
    const listBg = a === T1.s5;
    S.foot.img.style.transform = `scale(${(listBg ? 1.18 : 1.04) + 0.025 * k + punch})`;
    S.foot.img.style.filter = listBg ? "blur(22px) brightness(0.55) saturate(0.8)" : "contrast(1.08) saturate(1.05)";
    // readability: dark at the top where the headline sits, and at the bottom for the captions
    S.footShade.style.background = "linear-gradient(180deg, rgba(10,10,10,.82) 0%, rgba(10,10,10,.35) 38%, rgba(10,10,10,.1) 55%, rgba(10,10,10,.55) 78%, rgba(10,10,10,.85) 100%)";
    disp(S.foot.box.parentNode, t < T1.s6 + 0.3);
  }

  /* ----- S1 hook: T'AS UN RESTO? ----- */
  function buildHook() {
    const root = layer(10, { background: FOOT ? "transparent" : C.black });
    if (!FOOT) { const wm = logoSVG(root, "glyphOnly", 900, "#1A1817"); T(wm.d, { x: W - 760, y: H - 820 }); S.hwm = wm; }
    const z1 = 190, z2 = fit("RESTO?", W - 2 * M, 800, 470);
    const y = FOOT ? 300 : 620;
    S.h = { root, l1: line(root, "T'AS UN", z1, C.white, M, y), l2: line(root, `RESTO${dot(C.red, "?")}`, z2, C.white, M, y + z1 * 0.9) };
  }
  function hook(t) {
    const H_ = S.h, on = t < T1.s2;
    disp(H_.root, on); if (!on) return;
    rise(H_.l1, pr(t, w(0) - 0.08, RISE)); rise(H_.l2, pr(t, w(2) - 0.06, RISE), 0, 0.45);
    const k = 1 + 0.03 * pr(t, 0, T1.s2);
    T(H_.l2.m, { s: k }); H_.l2.m.style.transformOrigin = "0 100%";
  }

  /* ----- S2 the three products ----- */
  const PRODS = [["CONTENANTS", "contenants.webp"], ["USTENSILES", "ustensiles.webp"], ["SACS", "sacs.webp"]];
  function buildProducts() {
    const root = layer(11, { background: FOOT ? "transparent" : C.paper });
    const z = fit("USTENSILES.", W - 2 * M, 800, 250), y0 = FOOT ? 200 : 170, lh = z * 0.9;
    const lines = PRODS.map(([word], i) => line(root, `${word}${dot()}`, z, INK, M, y0 + i * lh));
    const cy = y0 + 3 * lh + 70, ch = H - cy - 150;
    const cells = FOOT ? [] : PRODS.map(([, src]) => { const c = imgCell(root, A + "img/" + src, W - 2 * M, ch); T(c.box, { x: M, y: cy }); return c; });
    S.p = { root, lines, cells, cy, ch, z };
  }
  function products(t) {
    const Pp = S.p, on = inR(t, T1.s2, T1.s3 + 0.25);
    disp(Pp.root, on); if (!on) return;
    const at = [w(3), w(4), w(5)];
    const cur = at.filter((x) => t >= x - 0.05).length - 1;
    Pp.lines.forEach((l, i) => {
      rise(l, pr(t, at[i] - 0.08, RISE));
      l.ink.style.color = i === cur ? INK : FOOT ? "rgba(255,255,255,.38)" : C.grey;
      l.ink.querySelector("span").style.color = i === cur ? C.red : "transparent";
    });
    Pp.cells.forEach((c, i) => {
      const k = ez.outExpo(pr(t, at[i] - 0.06, 0.42));
      c.box.style.clipPath = `inset(${(1 - k) * 100}% 0 0 0)`;
      c.box.style.zIndex = i;
      c.img.style.transform = `scale(${1.18 - 0.14 * k + 0.02 * (t - at[i])})`;
      vis(c.box, t >= at[i] - 0.06);
    });
  }

  /* ----- S3 CHAQUE MOIS. + month ticker ----- */
  const MONTHS = ["JANVIER", "FÉVRIER", "MARS", "AVRIL", "MAI", "JUIN", "JUILLET", "AOÛT", "SEPTEMBRE", "OCTOBRE", "NOVEMBRE", "DÉCEMBRE"];
  function buildMonthly() {
    const root = layer(12, { background: FOOT ? "transparent" : C.red });
    const zs = 104, zb = fit("CHAQUE", W - 2 * M, 800, 400), y = FOOT ? 250 : 420;
    S.m = { root, l0: line(root, "TU LES RACHÈTES", zs, C.white, M, y, 700),
      l1: line(root, "CHAQUE", zb, C.white, M, y + zs * 1.05), l2: line(root, `MOIS${dot(FOOT ? C.red : C.black)}`, zb, C.white, M, y + zs * 1.05 + zb * 0.9) };
    const by = FOOT ? 1220 : 1240, bh = 200;
    S.m.box = el(root, { left: M + "px", top: by + "px", width: W - 2 * M + "px", height: bh + "px", overflow: "hidden", background: FOOT ? C.red : C.black });
    S.m.months = MONTHS.map((mo) => el(S.m.box, { left: 0, top: 0, width: W - 2 * M + "px", height: bh + "px", ...fBC(150, 800, bh / 150), color: C.white, textAlign: "center" }, "div"));
    S.m.months.forEach((d, i) => { d.textContent = MONTHS[i]; });
    S.m.x12 = line(root, `× 12 PAR ANNÉE`, 64, C.white, M, by + bh + 40, 700);
    S.m.wipe = el(root, { width: W + "px", height: H + "px", background: FOOT ? C.red : C.red, zIndex: -1 });
  }
  function monthly(t) {
    const Mm = S.m, on = inR(t, T1.s3, T1.s4);
    disp(Mm.root, on); if (!on) return;
    // A: the red rises from the bottom over the paper; B: a red bar sweeps through the footage
    const k = ez.inOutExpo(pr(t, T1.s3, 0.22));
    Mm.root.style.background = "transparent";
    T(Mm.wipe, { y: (1 - k) * H, op: FOOT ? 1 - ez.inExpo(pr(t, T1.s3 + 0.16, 0.18)) : 1 });
    rise(Mm.l0, pr(t, w(6) - 0.08, RISE)); rise(Mm.l1, pr(t, w(9) - 0.08, RISE)); rise(Mm.l2, pr(t, w(10) - 0.06, RISE), 0, 0.45);
    const t0 = w(6), step = 0.115, i = clamp(Math.floor((t - t0) / step), 0, 11);
    const bk = ez.outExpo(pr(t, t0 - 0.1, 0.3));
    Mm.box.style.clipPath = `inset(0 ${(1 - bk) * 100}% 0 0)`; vis(Mm.box, t >= t0 - 0.1);
    Mm.months.forEach((d, j) => {
      const tj = t0 + j * step, e = ez.outExpo(pr(t, tj, 0.09));
      const y = j === i ? (1 - e) * 200 : j === i - 1 ? -ez.outExpo(pr(t, t0 + i * step, 0.09)) * 200 : 400;
      T(d, { y, op: j === i || j === i - 1 ? 1 : 0 });
    });
    rise(Mm.x12, pr(t, t0 + 11 * step + 0.05, RISE));
  }

  /* ----- S4 新 IMPORT-RAMA → FABRIQUÉ À LA SOURCE. → ON S'OCCUPE DE TOUT. + route ----- */
  const NODES = ["USINE", "BATEAU", "DOUANES", "TA PORTE"];
  function buildSource() {
    const root = layer(13, { background: FOOT ? "transparent" : C.black });
    const lw = 860;
    if (!FOOT) { const wm = logoSVG(root, "glyphOnly", 900, "#1A1817"); T(wm.d, { x: W - 760, y: H - 820 }); }
    S.s = { root, lock: lockup(root, lw, C.white) };
    S.s.lx = (W - lw) / 2; S.s.ly = FOOT ? 330 : 700;
    const z = fit("À LA SOURCE.", W - 2 * M, 800, 260), y = FOOT ? 260 : 360;
    S.s.a1 = line(root, "FABRIQUÉ", z, C.white, M, y); S.s.a2 = line(root, `À LA SOURCE${dot()}`, z, C.white, M, y + z * 0.9);
    const z2 = fit("ON S'OCCUPE", W - 2 * M, 800, 260);
    S.s.b1 = line(root, "ON S'OCCUPE", z2, C.white, M, y); S.s.b2 = line(root, `DE TOUT${dot()}`, z2, C.white, M, y + z2 * 0.9);
    const ry = y + z2 * 0.9 * 2 + (FOOT ? 120 : 150), gap = FOOT ? 130 : 150;
    S.s.rail = el(root, { left: M + 15 + "px", top: ry + 30 + "px", width: "6px", height: gap * 3 + "px", background: C.red, transformOrigin: "50% 0" });
    S.s.nodes = NODES.map((n_, i) => {
      const d = el(root, { left: M + "px", top: ry + i * gap + "px", display: "flex", alignItems: "center", gap: "34px" });
      const c = el(d, { width: "36px", height: "36px", borderRadius: "50%", background: C.red, position: "relative", boxShadow: `0 0 0 8px ${FOOT ? "rgba(10,10,10,.6)" : C.black}` }, "i", "");
      const tx = el(d, { ...fBC(84, 700, 1), color: C.white, position: "relative" }, "span", ""); tx.textContent = n_;
      const ck = el(d, { ...fBC(70, 800, 1), color: C.red, position: "relative" }, "span", ""); ck.textContent = "✓";
      return { d, c, tx, ck };
    });
  }
  function source(t) {
    const Ss = S.s, on = inR(t, T1.s4, T1.s5 + 0.26);
    disp(Ss.root, on); if (!on) return;
    // lockup: 新 pops on "Import-Rama", wordmark wipes in, then it lifts away as FABRIQUÉ arrives
    const t0 = w(11), out = ez.inExpo(pr(t, w(13) - 0.12, 0.2));
    lockupPaint(Ss.lock, t0, t);
    T(Ss.lock.g, { x: Ss.lx, y: Ss.ly - out * 120, s: 1 + 0.04 * pr(t, t0, 1), op: 1 - out });
    Ss.lock.g.style.transformOrigin = "50% 50%";
    const x1 = pr(t, w(18) - 0.2, 0.16);
    rise(Ss.a1, pr(t, w(14) - 0.06, RISE), x1); rise(Ss.a2, pr(t, w(17) - 0.1, RISE), x1, 0.45);
    rise(Ss.b1, pr(t, w(19) - 0.1, RISE)); rise(Ss.b2, pr(t, w(21) - 0.1, RISE), 0, 0.45);
    const nt = NODES.map((_, i) => w(18) + 0.04 + i * 0.25);
    const rk = clamp((t - nt[0]) / (nt[3] - nt[0]));
    Ss.rail.style.transform = `scaleY(${rk})`; vis(Ss.rail, t >= nt[0]);
    Ss.nodes.forEach((n_, i) => {
      const e = ez.outExpo(pr(t, nt[i], 0.3));
      T(n_.d, { x: (1 - e) * 60, op: e });
      const c = clamp(spring(t - nt[i] - 0.08, 2.2, 7), 0, 1.3);
      n_.ck.style.transform = `scale(${c})`; n_.ck.style.opacity = t >= nt[i] + 0.08 ? 1 : 0;
      n_.c.style.transform = `scale(${1 + 0.5 * Math.exp(-Math.max(0, t - nt[i]) / 0.12)})`;
    });
  }

  /* ----- S5 ENVOIE TA LISTE → ON CHALLENGE TON PRIX ACTUEL. ----- */
  const ROWS = [["CONTENANTS KRAFT 32 OZ", "5 000"], ["FOURCHETTES EN BOIS", "20 000"], ["SACS KRAFT", "8 000"], ["VERRES 16 OZ", "10 000"]];
  function buildList() {
    const root = layer(14, { background: FOOT ? "transparent" : C.paper });
    S.l = { root };
    const y = FOOT ? 200 : 170;
    const zA = fit("TA LISTE.", W - 2 * M, 800, 230);
    S.l.a1 = line(root, "ENVOIE", zA, INK, M, y); S.l.a2 = line(root, `TA LISTE${dot()}`, zA, INK, M, y + zA * 0.9);
    const zB = fit("TON PRIX ACTUEL.", W - 2 * M, 800, 230);
    S.l.b1 = line(root, "ON CHALLENGE", zB, INK, M, y); S.l.b2 = line(root, `TON PRIX ACTUEL${dot()}`, zB, INK, M, y + zB * 0.9);
    const cy = y + zA * 1.8 + 70, rh = 112, cw = W - 2 * M;
    S.l.card = el(root, { left: M + "px", top: cy + "px", width: cw + "px", height: rh * ROWS.length + 36 + "px", background: C.white, borderTop: `10px solid ${C.ink}`, boxShadow: FOOT ? "0 30px 80px rgba(0,0,0,.45)" : "none" });
    S.l.rows = ROWS.map(([a, b], i) => {
      const r = el(S.l.card, { left: "36px", top: 18 + i * rh + "px", width: cw - 72 + "px", height: rh + "px", borderBottom: i < ROWS.length - 1 ? `2px solid ${C.paper}` : "none", display: "flex", alignItems: "center", justifyContent: "space-between" });
      const l_ = el(r, { ...fBC(58, 700, 1), color: C.ink, position: "relative" }, "span", ""); l_.textContent = a;
      const q = el(r, { ...fBC(58, 800, 1), color: C.red, position: "relative" }, "span", ""); q.textContent = "× " + b;
      return r;
    });
    const by = cy + rh * ROWS.length + 36 + 60, bw = (cw - 28) / 2, bh = 300;
    S.l.left = el(root, { left: M + "px", top: by + "px", width: bw + "px", height: bh + "px", background: FOOT ? C.white : C.ink, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 40px", boxSizing: "border-box" });
    const lt = el(S.l.left, { ...fBC(76, 800, 0.95), color: FOOT ? C.ink : C.white, position: "relative" }, "div", ""); lt.innerHTML = "TON PRIX<br>ACTUEL";
    S.l.right = el(root, { left: M + bw + 28 + "px", top: by + "px", width: bw + "px", height: bh + "px", background: C.red, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" });
    const q = el(S.l.right, { ...fBC(200, 800, 0.9), color: C.white, position: "relative" }, "div", ""); q.textContent = "?";
    const ql = el(S.l.right, { ...fBC(40, 700, 1, 0.08), color: C.white, position: "relative" }, "div", ""); ql.textContent = "NOTRE SOUMISSION";
    S.l.vs = el(root, { left: M + bw + 14 - 56 + "px", top: by + bh / 2 - 56 + "px", width: "112px", height: "112px", borderRadius: "50%", background: FOOT ? C.white : C.paper, display: "flex", alignItems: "center", justifyContent: "center", ...fBC(52, 800, 1), color: C.ink, transformOrigin: "50% 50%" });
    S.l.vs.textContent = "VS";
    S.l.by = by; S.l.bw = bw; S.l.bh = bh;
  }
  function list(t) {
    const L = S.l, on = inR(t, T1.s5, T1.s6 + 0.3);
    disp(L.root, on); if (!on) return;
    const k = ez.inOutExpo(pr(t, T1.s5, 0.24));
    L.root.style.clipPath = `inset(${(1 - k) * 100}% 0 0 0)`;
    const xa = pr(t, w(25) - 0.2, 0.16);
    rise(L.a1, pr(t, w(22) - 0.06, RISE), xa); rise(L.a2, pr(t, w(24) - 0.08, RISE), xa, 0.45);
    rise(L.b1, pr(t, w(26) - 0.06, RISE)); rise(L.b2, pr(t, w(27) - 0.04, RISE), 0, 0.4);
    const ce = ez.outExpo(pr(t, w(22), 0.4));
    T(L.card, { y: (1 - ce) * 80, op: ce });
    L.rows.forEach((r, i) => { const e = ez.outExpo(pr(t, w(23) + i * 0.12, 0.25)); r.style.clipPath = `inset(0 ${(1 - e) * 100}% 0 0)`; });
    const le = ez.outExpo(pr(t, w(28) - 0.05, 0.35)), re = ez.outExpo(pr(t, w(29) - 0.04, 0.35));
    T(L.left, { y: (1 - le) * 120, op: le });
    T(L.right, { y: (1 - re) * 120, op: re, s: 1 + 0.06 * Math.exp(-Math.max(0, t - w(29)) / 0.12) });
    L.right.style.transformOrigin = "50% 50%";
    const v = clamp(spring(t - w(29) - 0.05, 2.4, 7), 0, 1.3);
    T(L.vs, { s: Math.max(0.001, v), op: t >= w(29) ? 1 : 0, r: (1 - clamp(v)) * -30 });
  }

  /* ----- S6 end card ----- */
  function buildEnd() {
    const root = layer(20, { background: C.paper });
    S.e = { root };
    S.e.red = el(cam, { width: W + "px", height: H + "px", background: C.red, zIndex: 19 });
    const lw = 780;
    S.e.lock = lockup(root, lw, C.ink); S.e.lx = (W - lw) / 2; S.e.ly = 470;
    const z = fit("TA SOUMISSION.", W - 2 * M, 800, 210), y = 960;
    S.e.l1 = line(root, "DEMANDE", z, C.ink, M, y); S.e.l2 = line(root, `TA SOUMISSION${dot()}`, z, C.ink, M, y + z * 0.9);
    S.e.btn = el(root, { left: M + "px", top: y + z * 1.8 + 110 + "px", height: "160px", padding: "0 64px", background: C.red, display: "flex", alignItems: "center", gap: "28px", ...fBC(70, 800, 1, 0.04), color: C.white, transformOrigin: "0 50%" });
    S.e.btn.innerHTML = `<span style="position:relative">SANS ENGAGEMENT</span><span style="position:relative;font-size:72px">→</span>`;
    S.e.url = el(root, { left: M + "px", top: y + z * 1.8 + 330 + "px", font: `500 46px/1 ${BR}`, color: C.mid });
    S.e.url.textContent = "importrama.com";
  }
  function end(t) {
    const E = S.e, t0 = T1.s6;
    // the red "?" panel blows up to full frame, then the paper rises over it
    const rk = ez.inOutExpo(pr(t, t0 - 0.18, 0.22));
    const L = S.l, bx = M + L.bw + 28, by = L.by;
    const x0 = lerp(bx, 0, rk), y0 = lerp(by, 0, rk), ww = lerp(L.bw, W, rk), hh = lerp(L.bh, H, rk);
    E.red.style.clipPath = `inset(${y0}px ${W - x0 - ww}px ${H - y0 - hh}px ${x0}px)`;
    disp(E.red, t >= t0 - 0.18 && t < t0 + 0.6);
    const pk = ez.inOutExpo(pr(t, t0 + 0.08, 0.26));
    disp(E.root, t >= t0 + 0.08);
    E.root.style.clipPath = `inset(${(1 - pk) * 100}% 0 0 0)`;
    if (t < t0 + 0.08) return;
    lockupPaint(E.lock, t0 + 0.2, t);
    T(E.lock.g, { x: E.lx, y: E.ly, s: 1 + 0.025 * pr(t, t0, 3) });
    E.lock.g.style.transformOrigin = "50% 50%";
    rise(E.l1, pr(t, Math.max(t0 + 0.24, w(30)), RISE)); rise(E.l2, pr(t, w(31) - 0.06, RISE), 0, 0.4);
    const bt0 = w(32) + 0.55, bp = clamp(spring(t - bt0, 1.8, 6), 0, 1.2);
    let pulse = 0; for (let j = 0; j < 4; j++) { const d = t - (bt0 + 0.7 + j * 0.5); if (d >= 0) pulse = Math.max(pulse, 0.05 * Math.exp(-d / 0.12)); }
    T(E.btn, { s: Math.max(0.001, bp) + pulse, op: t >= bt0 ? 1 : 0 });
    T(E.url, { op: ez.outCubic(pr(t, bt0 + 0.3, 0.4)), y: (1 - ez.outCubic(pr(t, bt0 + 0.3, 0.4))) * 20 });
  }

  /* ---------- captions (k=b): the phrase in boxes, the spoken word in red ---------- */
  function buildCaptions() {
    if (!FOOT) return;
    const root = layer(30);
    S.c = { root, phr: SC.phrases.map(([a, b]) => {
      const d = el(root, { left: M + "px", top: "1610px", width: W - 2 * M + "px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px 12px" });
      const ws = WT.slice(a, b).map((wd) => { const s = el(d, { position: "relative", padding: "8px 18px 2px", background: "rgba(10,10,10,.82)", ...fBC(86, 800, 1.05, 0.01), color: C.white, whiteSpace: "nowrap" }, "span", ""); s.textContent = wd.w; return s; });
      return { d, ws, a, b };
    }) };
  }
  function captions(t) {
    if (!FOOT) return;
    const on = t < T1.s6 - 0.05;
    disp(S.c.root, on);
    S.c.phr.forEach((p, k) => {
      const t0 = w(p.a) - 0.06, t1 = k + 1 < S.c.phr.length ? w(S.c.phr[k + 1].a) - 0.06 : SC.voEnd;
      const show = on && t >= t0 && t < t1;
      vis(p.d, show); if (!show) return;
      const e = ez.outExpo(pr(t, t0, 0.2));
      T(p.d, { y: (1 - e) * 26, op: 1 });
      p.ws.forEach((s, j) => {
        const wi = p.a + j, ts = w(wi) - 0.04, live = t >= ts && (wi + 1 >= WT.length || t < w(wi + 1) - 0.04 || j === p.ws.length - 1);
        const said = t >= ts;
        s.style.background = live ? C.red : "rgba(10,10,10,.82)";
        s.style.opacity = said ? 1 : 0.45;
        const pop = 1 + 0.12 * Math.exp(-Math.max(0, t - ts) / 0.08) * (said ? 1 : 0);
        s.style.transform = `scale(${pop})`;
      });
    });
  }

  /* ---------- camera, flash, grain ---------- */
  const KICKS = [];
  function buildFX() {
    S.flash = el(stage, { width: W + "px", height: H + "px", zIndex: 40, background: C.white, mixBlendMode: "screen" });
    const g = el(stage, { width: W + 256 + "px", height: H + 256 + "px", zIndex: 50, mixBlendMode: "overlay", opacity: 0.1, pointerEvents: "none" });
    const cv = document.createElement("canvas"); cv.width = cv.height = 256;
    const cx = cv.getContext("2d"), im = cx.createImageData(256, 256), rnd = mulberry32(11);
    for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (rnd() + rnd() + rnd() - 1.5) * 120; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    cx.putImageData(im, 0, 0);
    g.style.backgroundImage = `url(${cv.toDataURL()})`;
    S.grain = g;
    // word hits that kick the camera: [time, strength]
    KICKS.push([w(0), 0.03], [w(2), 0.05], [w(3), 0.025], [w(4), 0.025], [w(5), 0.03], [w(9), 0.025], [w(10), 0.05], [w(11), 0.04],
      [w(14), 0.02], [w(17), 0.035], [w(19), 0.02], [w(21), 0.035], [w(22), 0.02], [w(24), 0.03], [w(26), 0.02], [w(27), 0.03], [w(29), 0.05], [T1.s6 + 0.1, 0.04]);
  }
  function fx(t) {
    let f = 0;
    for (const [a, g] of [[w(2), 0.18], [T1.s2, 0.22], [T1.s4, 0.3], [w(29), 0.22], [T1.s6 + 0.08, 0.25]]) { const d = t - a; if (d >= 0) f = Math.max(f, g * Math.exp(-d / 0.09)); }
    T(S.flash, { op: f });
    let s = 1, x = 0, y = 0, r = 0;
    for (const [a, g] of KICKS) { const d = t - a; if (d >= 0) s += g * Math.exp(-d / 0.12); }
    for (const [a, g] of [[w(2), 14], [w(10), 12], [w(29), 14]]) { const d = t - a; if (d >= 0 && d < 0.5) { const e = g * Math.exp(-d / 0.11); x += e * sn(d * 30, a * 10); y += e * sn(d * 30, a * 10 + 9); r += e * 0.02 * sn(d * 20, a * 10 + 3); } }
    // a slow handheld drift under everything
    x += 4 * sn(t * 0.7, 21); y += 4 * sn(t * 0.6, 22);
    cam.style.transform = `translate(${x}px,${y}px) rotate(${r}deg) scale(${s})`;
    const fr = Math.floor(t * 30 + 1e-6);
    T(S.grain, { x: -Math.floor(hash(fr, 3) * 256), y: -Math.floor(hash(fr, 4) * 256), op: FOOT ? 0.12 : 0.09 });
  }

  /* ---------- sound design (seconds → beats on the measured grid) ---------- */
  function buildCues() {
    cue(w(0) - 0.02, "thump", 0.75); cue(w(0) - 0.02, "slam", 0.55); cue(w(2) - 0.02, "slam", 0.7); cue(w(2), "sparkle", 0.18);
    cue(T1.s2 - 0.12, "zip", 0.3, 0.3, { dir: 1 });
    [3, 4, 5].forEach((i, j) => { cue(w(i) - 0.04, "slam", 0.5 + 0.06 * j, [-0.25, 0.25, 0][j]); cue(w(i) - 0.1, "zip", 0.22, [-0.3, 0.3, 0][j], { dir: j % 2 ? -1 : 1 }); });
    cue(T1.s3 - 0.2, "air", 0.45, 0, { dir: 1 }); cue(T1.s3, "thump", 0.5);
    cue(w(6) - 0.04, "slam", 0.4); for (let j = 0; j < 12; j++) cue(w(6) + j * 0.115, "tap", 0.16 + 0.015 * j, j % 2 ? 0.3 : -0.3);
    cue(w(9) - 0.04, "slam", 0.55); cue(w(10) - 0.03, "slam", 0.7); cue(w(10) - 0.03, "thump", 0.6);
    cue(T1.s4 - 0.25, "air", 0.5, 0, { dir: -1 }); cue(w(11) - 0.02, "thump", 0.85); cue(w(11), "bloom", 0.5); cue(w(11) + 0.15, "glint", 0.3, 0, { step: 1 }); cue(w(11) + 0.3, "glint", 0.3, 0, { step: 3 });
    cue(w(14) - 0.04, "slam", 0.5); cue(w(17) - 0.08, "slam", 0.65);
    NODES.forEach((_, i) => { const t = w(18) + 0.04 + i * 0.25; cue(t, "tap", 0.4, -0.2); cue(t + 0.08, "glint", 0.32, 0.1, { step: i }); });
    cue(w(19) - 0.08, "slam", 0.5); cue(w(21) - 0.08, "slam", 0.65);
    cue(T1.s5 - 0.12, "air", 0.45, 0, { dir: 1 }); cue(w(22) - 0.04, "slam", 0.5); cue(w(24) - 0.06, "slam", 0.6);
    ROWS.forEach((_, i) => cue(w(23) + i * 0.12, "key", 0.4, 0.2, { var: i }));
    cue(w(25) - 0.2, "zip", 0.3, 0, { dir: -1 }); cue(w(26) - 0.04, "slam", 0.5); cue(w(27) - 0.02, "slam", 0.6);
    cue(w(28) - 0.05, "thump", 0.5); cue(w(29) - 0.02, "impact", 0.6); cue(w(29), "sparkle", 0.25);
    cue(T1.s6 - 0.25, "air", 0.55, 0, { dir: -1 }); cue(T1.s6 + 0.08, "thump", 0.8); cue(T1.s6 + 0.2, "bloom", 0.55);
    cue(T1.s6 + 0.34, "glint", 0.3, 0, { step: 2 }); cue(T1.s6 + 0.5, "glint", 0.3, 0, { step: 4 });
    cue(w(30), "slam", 0.45); cue(w(31) - 0.04, "slam", 0.55);
    const bt0 = w(32) + 0.55; cue(bt0, "pop", 0.55); cue(bt0, "shimmer", 0.35);
    for (let j = 0; j < 4; j++) cue(bt0 + 0.7 + j * 0.5, "tap", 0.18);
  }

  /* ---------- frame ---------- */
  async function seek(t) {
    pending.length = 0;
    footPaint(t); hook(t); products(t); monthly(t); source(t); list(t); end(t); captions(t); fx(t);
    await Promise.all(pending);
  }
  window.DURATION = SC.len;
  window.ready = (async () => {
    const [beats, svg, man] = await Promise.all([
      fetch(`../beats6-v${VID}.json`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch(A + "logo.svg").then((r) => r.text()),
      FOOT ? fetch(F + "frames/manifest.json").then((r) => r.json()) : Promise.resolve({}),
    ]);
    if (beats) { BTS = beats.beats; PER = beats.period; }
    MAN = man;
    for (const wt of ["500", "600", "700", "800"]) await document.fonts.load(`${wt} 100px "Barlow Condensed"`);
    for (const wt of ["400", "500"]) await document.fonts.load(`${wt} 100px Barlow`);
    await document.fonts.ready;
    buildLogoParts(svg);
    buildFootage(); buildHook(); buildProducts(); buildMonthly(); buildSource(); buildList(); buildEnd(); buildCaptions(); buildFX(); buildCues();
    await Promise.all([...document.images].map((im) => (im.complete ? 0 : im.decode().catch(() => {}))));
    window.CUES = CUES.map((c) => ({ ...c }));
    window.VO = { file: `assets/imp-ads/vo${VID}.mp3`, offset: OFF };
    window.seek = seek;
    await seek(0);
    return { W, H, FMT: "portrait", cues: CUES.length };
  })();
})();
