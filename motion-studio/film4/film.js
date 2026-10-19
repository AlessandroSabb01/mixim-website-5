/* Import Rama — showreel (30 s, 9:16, 128 BPM). Kinetic type on a Swiss 6-column grid, built from importrama.com:
   Barlow Condensed uppercase, the brand red, the 新 mark, the site's own copy, illustrations and ship footage.
   window.seek(t) paints frame t (pure function of t). */
(() => {
  const P = new URLSearchParams(location.search);
  const W = +(P.get("w") || 1080), H = +(P.get("h") || 1920);
  const A = "../assets/importrama/";
  const C = { red: "#BD2A20", black: "#0A0A0A", ink: "#111111", warm: "#2A2725", paper: "#F3F1EE", white: "#FFFFFF", mark: "#E4DFD8" };
  const M = 72, GUT = 24, COLW = (W - 2 * M - 5 * GUT) / 6;
  const colX = (i) => M + i * (COLW + GUT);

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
    inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  };
  const spring = (dt, f = 2.4, d = 7) => (dt <= 0 ? 0 : 1 - Math.exp(-d * dt) * Math.cos(2 * Math.PI * f * dt));

  /* ---------- beat grid ---------- */
  let BTS = [], PER = 60 / 128;
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
  const disp = (e, v) => { e.style.display = v ? "" : "none"; };
  function T(e, o = {}) {
    const { x = 0, y = 0, s = 1, sx = 1, sy = 1, r = 0, op = 1 } = o;
    e.style.transform = `translate3d(${x}px,${y}px,0) rotate(${r}deg) scale(${s * sx},${s * sy})`;
    e.style.opacity = op;
    vis(e, op > 0.001);
  }
  const BC = '"Barlow Condensed", "Arial Narrow", sans-serif', BR = 'Barlow, Arial, sans-serif';
  const fBC = (size, w = 800, lh = 0.86, tr = -0.005) => ({ font: `${w} ${size}px/${lh} ${BC}`, letterSpacing: `${tr}em`, textTransform: "uppercase" });
  const fBR = (size, w = 500, lh = 1.3) => ({ font: `${w} ${size}px/${lh} ${BR}` });
  const mctx = document.createElement("canvas").getContext("2d");
  const measure = (s, size, w = 800, tr = -0.005, fam = BC) => { mctx.font = `${w} ${size}px ${fam}`; mctx.letterSpacing = `${tr * size}px`; return mctx.measureText(s.toUpperCase()).width; };
  const fit = (s, maxW, w = 800, cap = 520) => Math.min(cap, (maxW / measure(s, 100, w)) * 100);

  /* masked lines: { m, ink, w, h } ; rise() slides the ink through its mask */
  function line(parent, html, size, color, x, y, w = 800) {
    const pad = size * 0.12;
    const m = el(parent, { left: x + "px", top: y - pad + "px", overflow: "hidden", padding: `${pad}px ${size * 0.06}px ${pad}px 0` });
    const ink = el(m, { ...fBC(size, w), color, whiteSpace: "pre", position: "relative" }, "div", "");
    ink.innerHTML = html;
    return { m, ink, size, w: measure(ink.textContent, size, w) };
  }
  function rise(o, p, q = 0, stretch = 0.3) {
    const e = ez.outExpo(p), x = ez.inExpo(q);
    o.ink.style.transform = `translateY(${(1 - e) * 108 - x * 108}%) scaleY(${1 + (1 - e) * stretch})`;
    o.ink.style.transformOrigin = "50% 100%";
    vis(o.m, p > 0 && q < 1);
  }
  const dot = (c) => `<span style="color:${c}">.</span>`;
  const label = (parent, text, x, y, color = C.red, size = 30) => {
    const d = el(parent, { left: x + "px", top: y + "px", display: "flex", alignItems: "center", gap: "16px", ...fBC(size, 600, 1, 0.16), color, whiteSpace: "nowrap" });
    el(d, { width: "44px", height: "6px", background: color, position: "relative" }, "i", "");
    el(d, { position: "relative" }, "span", "").textContent = text;
    return d;
  };
  function imgCell(parent, src, x, y, w, h, css = {}) {
    const box = el(parent, { left: 0, top: 0, width: w + "px", height: h + "px", overflow: "hidden", background: C.warm, ...css });   // positioned by T()
    const img = el(box, { width: "100%", height: "100%", objectFit: "cover", display: "block", transformOrigin: "50% 50%" }, "img", "");
    img.src = A + src;
    return { box, img, x, y, w, h };
  }
  // ship footage: deterministic frame sequence
  const pending = [];
  function footage(parent, w, h) {
    const box = el(parent, { width: w + "px", height: h + "px", overflow: "hidden", background: "#0b2a2c" });
    const img = el(box, { width: "100%", height: "100%", objectFit: "cover", display: "block" }, "img", "");
    img.decoding = "sync";
    return { box, img, cur: "" };
  }
  function shipFrame(f, local) {
    const i = Math.max(0, Math.min(299, Math.floor(local * 30 + 1e-6))) + 1;
    const src = `${A}frames/ship/${String(i).padStart(4, "0")}.jpg`;
    if (f.cur !== src) { f.cur = src; f.img.src = src; pending.push(f.img.decode().catch(() => {})); }
  }

  /* ---------- logo: the site's SVG, split into the 新 mark, IMPORT, RAMA and the tagline ---------- */
  const LOGO = {};
  function buildLogoParts(svgText) {
    const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
    const paths = [...doc.querySelectorAll("path")].map((p) => p.outerHTML);
    const vb = doc.documentElement.getAttribute("viewBox");
    LOGO.vb = vb.split(/\s+/).map(Number);
    LOGO.parts = { glyph: [18], importW: [19, 20, 21, 22, 23, 24], rama: [25, 26, 27, 28], tag: [...Array(18).keys()] };
    LOGO.paths = paths;
    // measure the glyph's own box (in the logo's user space) for the stand-alone 新
    const probe = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    probe.setAttribute("viewBox", vb); probe.style.cssText = "position:absolute;left:-9999px;width:1168px;height:296px";
    probe.innerHTML = `<g id="gg">${paths[18]}</g>`; document.body.appendChild(probe);
    const bb = probe.querySelector("#gg").getBBox(); probe.remove();
    LOGO.glyphBox = [bb.x, bb.y, bb.width, bb.height];
  }
  function logoSVG(parent, part, width, fill = null) {
    const [x, y, w, h] = part === "glyphOnly" ? LOGO.glyphBox : LOGO.vb;
    const ids = part === "glyphOnly" ? LOGO.parts.glyph : LOGO.parts[part];
    const hh = (width * h) / w;
    const d = el(parent, { width: width + "px", height: hh + "px" });
    let inner = ids.map((i) => LOGO.paths[i]).join("");
    if (fill) inner = inner.replace(/fill:#[0-9a-fA-F]{6}/g, `fill:${fill}`);
    d.innerHTML = `<svg viewBox="${x} ${y} ${w} ${h}" width="${width}" height="${hh}" style="display:block;overflow:visible">${inner}</svg>`;
    return { d, w: width, h: hh };
  }

  /* ---------- layers ---------- */
  const cam = el(stage, { width: W + "px", height: H + "px", transformOrigin: "50% 50%" });
  const layer = (z) => el(cam, { width: W + "px", height: H + "px", zIndex: z, overflow: "hidden" });
  const S = {};

  /* ===== grid overlay: the Swiss signature, six columns ===== */
  function buildGrid() {
    const root = layer(30);
    S.grid = [0, 1, 2, 3, 4, 5, 6].map((i) => el(root, { left: (i < 6 ? colX(i) : W - M) - 1 + "px", top: 0, width: "2px", height: H + "px", transformOrigin: "50% 0" }));
    S.gridRoot = root;
  }
  function gridPaint(t) {
    const b = tb(t);
    const onPaper = (b >= 25.4 && b < 40) || (b >= 42 && b < 46) || b >= 54;
    const onRed = (b >= 6 && b < 10) || (b >= 40 && b < 42) || (b >= 49.4 && b < 54);
    const col = onPaper ? "rgba(17,17,17,.07)" : onRed ? "rgba(0,0,0,.13)" : "rgba(255,255,255,.07)";
    S.grid.forEach((g, i) => {
      const d = pr(t, -0.2 + i * 0.06, 0.9);
      g.style.background = col;
      T(g, { sy: ez.outExpo(d), op: 1 });
    });
  }

  /* ===== S1 hook (b0-10): SAME / BOX. BAG. CUP. → red PAY LESS FOR ANYTHING. ===== */
  const SWAP = [["BOX", "contenants.webp", "CONTAINERS — BOARD, BAGASSE, PET"], ["BAG", "sacs.webp", "BAGS — KRAFT, INSULATED, PLASTIC"], ["CUP", "verres.webp", "CUPS — HOT, COLD, LIDS"]];
  function buildHook() {
    const root = layer(2); root.style.background = C.black;
    S.h = { root };
    S.h.lab = label(root, "Packaging for restaurants", M, 214, C.red);
    const sz = 330;
    S.h.same = line(root, "SAME", sz, C.white, M - 6, 330);
    S.h.words = SWAP.map(([w]) => line(root, `${w}${dot(C.red)}`, sz, C.white, M - 6, 330 + sz * 0.9));
    S.h.cells = SWAP.map(([, src]) => imgCell(root, `img/${src}`, M, 1060, W - 2 * M, 600));
    S.h.caps = SWAP.map(([, , cap], i) => { const d = el(root, { left: M + "px", top: "1690px", ...fBC(30, 600, 1, 0.12), color: "rgba(255,255,255,.8)", whiteSpace: "nowrap" }); d.textContent = cap; return d; });
    S.h.count = el(root, { right: M + "px", left: "auto", top: "1690px", ...fBC(30, 600, 1, 0.12), color: C.red });
    // red half
    const red = layer(3); S.h.red = red;
    S.h.cols = [0, 1, 2, 3, 4, 5].map((i) => el(red, { left: i * (W / 6) + "px", top: 0, width: W / 6 + 1 + "px", height: H + "px", background: C.red }));
    const L = ["PAY LESS", "FOR", `ANYTHING${dot(C.black)}`];
    let y = 300;
    S.h.pay = L.map((s, i) => { const plain = s.replace(/<[^>]+>/g, ""); const z = fit(plain, W - 2 * M + 10, 800, i === 1 ? 470 : 520); const o = line(red, s, z, C.white, M - 4, y); y += z * 0.86 + 6; return o; });
    const tick = el(red, { left: 0, top: "1590px", width: W + "px", height: "120px", background: C.black, overflow: "hidden" });
    const row = el(tick, { top: "28px", ...fBC(64, 700, 1, 0.02), color: C.white, whiteSpace: "nowrap" });
    row.innerHTML = Array(4).fill(`SOURCED IN ASIA <i style="color:${C.red};font-style:normal">■</i> IMPORT &amp; CUSTOMS <i style="color:${C.red};font-style:normal">■</i> DELIVERED BY YOUR DISTRIBUTOR <i style="color:${C.red};font-style:normal">■</i> `).join("");
    S.h.tick = tick; S.h.row = row; S.h.rowW = measure("SOURCED IN ASIA ■ IMPORT & CUSTOMS ■ DELIVERED BY YOUR DISTRIBUTOR ■ ", 64, 700, 0.02);
  }
  function hook(t) {
    const b = tb(t), H_ = S.h;
    disp(H_.root, b < 10.1); disp(H_.red, b >= 5.98 && b < 10.1);
    if (b >= 10.1) return;
    H_.lab.style.clipPath = `inset(0 ${(1 - ez.outExpo(pr(t, -0.15, 0.5))) * 100}% 0 0)`;
    rise(H_.same, pr(t, -0.04, 0.32));
    const pulse = [2, 4].reduce((s, k) => s + (b >= k ? 0.035 * Math.exp(-since(t, k) / 0.1) : 0), 0);
    H_.same.ink.style.transform += ` scale(${1 + pulse})`;
    const k = clamp(Math.floor((b - 1) / 2), 0, 2);
    H_.words.forEach((w, i) => {
      const b0 = 1 + 2 * i, b1 = b0 + 2;
      rise(w, pr(t, b0 - 0.03, 0.26), i < 2 ? pb(t, b1 - 0.08, b1 + 0.08) : 0, 0.2);
    });
    H_.cells.forEach((c, i) => {
      const b0 = 1 + 2 * i, inP = i === 0 ? ez.outExpo(pr(t, 0.97, 0.4)) : ez.inOutExpo(pb(t, b0 - 0.25, b0 + 0.1));
      const outP = i < 2 ? ez.inOutExpo(pb(t, b0 + 2 - 0.25, b0 + 2 + 0.1)) : 0;
      if (b < b0 - 0.3 || outP >= 1) return vis(c.box, false);
      if (i === 0) { c.box.style.clipPath = `inset(${(1 - inP) * 100}% 0 0 0)`; T(c.box, { x: c.x - outP * W, y: c.y }); }
      else T(c.box, { x: c.x + (1 - inP) * W - outP * W, y: c.y });
      c.img.style.transform = `scale(${1.18 - 0.18 * ez.outCubic(pb(t, b0, b0 + 2))})`;
    });
    H_.caps.forEach((d, i) => { const on = b >= 1 + 2 * i - 0.05 && (i === 2 || b < 3 + 2 * i - 0.05); vis(d, on); d.style.clipPath = `inset(0 ${(1 - ez.outExpo(pr(t, 1 + 2 * i - 0.05, 0.35))) * 100}% 0 0)`; });
    H_.count.textContent = `0${k + 1} / 03`; vis(H_.count, b >= 0.97);
    // red: hard cut on b6, the three lines slam, ticker, then the columns drop away
    if (b >= 5.98) {
      H_.pay.forEach((o, i) => rise(o, pr(t, [6, 6.75, 7.25][i] - 0.03, 0.26), 0, 0.35));
      const tk = ez.outExpo(pr(t, 8, 0.4));
      H_.tick.style.clipPath = `inset(0 ${(1 - tk) * 100}% 0 0)`;
      H_.row.style.transform = `translateX(${-((since(t, 8) * 900) % H_.rowW)}px)`;
      H_.cols.forEach((c, i) => T(c, { x: 0, y: ez.inExpo(pb(t, 9.45 + i * 0.07, 9.95 + i * 0.07)) * H }));
      const exit = ez.inExpo(pb(t, 9.45, 10));
      [...H_.pay.map((o) => o.m), H_.tick].forEach((e, i) => { e.style.transform = `translateY(${exit * H * 1.05}px)`; });
    }
  }

  /* ===== S2 where it started (b10-26): 新 → IT STARTS IN ASIA. → ship footage + route rail ===== */
  const ROUTE = [
    ["01", "Factory · Asia", "Hand-picked factories, approved samples"],
    ["02", "Ocean freight", "Containers shipped direct"],
    ["03", "Customs", "Clearance and food-contact compliance"],
    ["04", "Warehouse · Montréal", "Container unloading"],
    ["05", "Your distributor", "Same order, same delivery"],
  ];
  function buildRoute() {
    const root = layer(1); root.style.background = C.black;
    S.r = { root };
    const fw = W, fh = H;
    S.r.foot = footage(root, fw, fh);
    S.r.shade = el(root, { width: W + "px", height: H + "px", background: "linear-gradient(90deg, rgba(10,10,10,.82) 0%, rgba(10,10,10,.55) 55%, rgba(10,10,10,.25) 100%)" });
    S.r.glyph = logoSVG(root, "glyphOnly", 760);
    S.r.lab = label(root, "Where it starts", M, 214, C.red);
    const s1 = fit("IT STARTS", W - 2 * M, 800, 300);
    S.r.l1 = line(root, "IT STARTS", s1, C.white, M - 4, 1180);
    S.r.l2 = line(root, `IN ASIA${dot(C.red)}`, s1, C.white, M - 4, 1180 + s1 * 0.88);
    // rail
    const RX = M + 18, RY0 = 470, STEP = 255;
    S.r.rail = el(root, { left: RX + "px", top: RY0 + "px", width: "4px", height: STEP * 4 + "px", background: "rgba(255,255,255,.35)", transformOrigin: "50% 0" });
    S.r.dot = el(root, { width: "36px", height: "36px", borderRadius: "50%", background: C.red, boxShadow: "0 0 0 10px rgba(189,42,32,.25)" });
    S.r.nodes = ROUTE.map(([n, ttl, sub], i) => {
      const y = RY0 + i * STEP;
      const pin = el(root, { left: RX - 8 + "px", top: y - 8 + "px", width: "20px", height: "20px", borderRadius: "50%", background: C.white, transformOrigin: "50% 50%" });
      const num = el(root, { left: RX + 50 + "px", top: y - 44 + "px", ...fBC(30, 600, 1, 0.14), color: C.red }); num.textContent = n;
      const tl = line(root, ttl, 76, C.white, RX + 50, y - 10);
      const sb = el(root, { left: RX + 52 + "px", top: y + 66 + "px", ...fBR(30, 500), color: "rgba(255,255,255,.78)", whiteSpace: "nowrap" }); sb.textContent = sub;
      return { pin, num, tl, sb, y };
    });
    S.r.RX = RX;
    S.r.photo = imgCell(root, "img/entrepot.webp", colX(3) + 20, 930, W - M - colX(3) - 20, 640);
    S.r.photoCap = el(root, { left: colX(3) + 20 + "px", top: "1590px", ...fBC(26, 600, 1, 0.12), color: "rgba(255,255,255,.75)", whiteSpace: "nowrap" }); S.r.photoCap.textContent = "Container unloading, Montréal";
    // paper columns that rise to carry us into S3
    S.r.paper = [0, 1, 2, 3, 4, 5].map((i) => el(root, { left: i * (W / 6) + "px", top: 0, width: W / 6 + 1 + "px", height: H + "px", background: C.paper }));
  }
  function route(t) {
    const b = tb(t), R = S.r;
    disp(R.root, b >= 9.4 && b < 26.2);
    if (!(b >= 9.4 && b < 26.2)) return;
    // the 新 mark: lands huge on b10, then the footage opens out of it on b12
    const g = R.glyph, gi = ez.outExpo(pr(t, 10 - 0.02, 0.6)), go = ez.inExpo(pb(t, 11.75, 12.35));
    const gs = lerp(1.7, 1, gi) * (1 + go * 2.4);
    T(g.d, { x: W / 2 - (g.w * gs) / 2, y: 560 - (g.h * gs) / 2 + 40, s: gs, op: (b >= 10 - 0.02 ? 1 : 0) * (1 - go) });
    g.d.style.transformOrigin = "0 0";
    R.lab.style.clipPath = `inset(0 ${(1 - ez.outExpo(pr(t, 10.1, 0.4))) * 100}% 0 0)`;
    const lineOut = pb(t, 11.8, 12.1);
    rise(R.l1, pr(t, 10.25, 0.3), lineOut); rise(R.l2, pr(t, 11, 0.3), lineOut);
    // footage: opens as a widening slot from the centre, ship drifts
    const op = ez.inOutExpo(pb(t, 11.85, 12.6));
    const ins = (1 - op) * 50;
    R.foot.box.style.clipPath = `inset(${ins * 0.7}% ${ins}% ${ins * 0.7}% ${ins}%)`;
    vis(R.foot.box, b >= 11.8); vis(R.shade, b >= 11.8); R.shade.style.opacity = op;
    shipFrame(R.foot, Math.max(0, t - bt(11.8)) * 0.9);
    R.foot.img.style.transform = `scale(${1.25 - 0.12 * pb(t, 12, 26)}) translateY(${-60 * pb(t, 12, 26)}px)`;
    // rail draws, the red dot travels node to node on the beat
    T(R.rail, { x: R.RX, y: 470, sy: ez.outExpo(pr(t, 13, 0.9)), op: b >= 13 ? 1 : 0 }); R.rail.style.left = "0px"; R.rail.style.top = "0px";
    let k = -1; ROUTE.forEach((_, i) => { if (b >= 14 + 2 * i - 0.02) k = i; });
    R.nodes.forEach((n, i) => {
      const b0 = 14 + 2 * i, act = i === k, past = i < k;
      const e = spring(since(t, b0) + 0.02, 2.6, 7);
      T(n.pin, { x: 0, y: 0, s: Math.max(0.001, e), op: b >= b0 - 0.02 ? 1 : 0 });
      rise(n.tl, pr(t, b0 - 0.02, 0.3), pb(t, 24, 24.4));
      const o = (b >= b0 ? 1 : 0) * (act || b >= 24 ? 1 : past ? 0.45 : 0) * (1 - pb(t, 24, 24.4));
      n.num.style.opacity = o; n.sb.style.opacity = o * ez.outExpo(pr(t, b0 + 0.15, 0.35)); n.tl.ink.style.opacity = act || b >= 24 ? 1 : 0.45;
      vis(n.num, o > 0); vis(n.sb, o > 0);
    });
    if (k >= 0) {
      const from = R.nodes[Math.max(0, k - 1)].y, to = R.nodes[k].y, e = k === 0 ? 1 : ez.outExpo(pr(t, 14 + 2 * k - 0.04, 0.45));
      T(R.dot, { x: R.RX - 16, y: lerp(from, to, e) - 16, s: 1 + 0.25 * Math.exp(-Math.max(0, since(t, 14 + 2 * k)) / 0.12), op: 1 - pb(t, 24, 24.4) });
      R.dot.style.transformOrigin = "50% 50%";
    } else vis(R.dot, false);
    // node 04: the warehouse photo
    const ph = R.photo, pin = ez.outExpo(pr(t, 20, 0.45)), pout = ez.inExpo(pb(t, 21.7, 22.1));
    vis(ph.box, b >= 20 && b < 22.15); vis(R.photoCap, b >= 20.2 && b < 22.1);
    ph.box.style.clipPath = `inset(${(1 - pin) * 100}% 0 0 0)`;
    T(ph.box, { x: ph.x + pout * (W - ph.x), y: ph.y });
    ph.img.style.transform = `scale(${1.15 - 0.15 * pin})`;
    // paper columns rise from the bottom
    R.paper.forEach((c, i) => T(c, { x: 0, y: (1 - ez.inOutExpo(pb(t, 24.9 + i * 0.07, 25.6 + i * 0.07))) * H, op: b >= 24.85 ? 1 : 0 }));
  }

  /* ===== S3 what we believe (b26-42): the promise, the three services, same order / truck / rep, PAY LESS. ===== */
  const SERV = [
    ["01", "Sourcing in Asia", "Vetted factories, approved samples, pricing\nnegotiated on volume."],
    ["02", "Turnkey importing", "Ocean freight, customs, food-contact compliance,\nwarehousing. All you see is the delivery."],
    ["03", "Distribution", "Our products land at your distributor.\nSame purchase order, same truck, same rep."],
  ];
  function buildBelieve() {
    const root = layer(4); root.style.background = C.paper;
    S.w = { root };
    S.w.mark = logoSVG(root, "glyphOnly", 900, C.mark);
    S.w.head = el(root, { width: W + "px", height: H + "px", transformOrigin: "0 0" });
    S.w.lab = label(S.w.head, "What we believe", M, 214, C.red);
    const L = ["WE DO", "THE IMPORTING", "SO YOU DON’T", `HAVE TO${dot(C.red)}`];
    let y = 300;
    S.w.lines = L.map((s) => { const z = fit(s.replace(/<[^>]+>/g, ""), W - 2 * M + 8, 800, 380); const o = line(S.w.head, s, z, C.ink, M - 4, y); y += z * 0.88 + 4; return o; });
    S.w.rows = SERV.map(([n, ttl, d], i) => {
      const y0 = 720 + i * 330, g = el(root, { width: W + "px", height: "330px", top: y0 + "px" });
      const rule = el(g, { left: M + "px", top: "0px", width: W - 2 * M + "px", height: "4px", background: C.ink, transformOrigin: "0 50%" });
      const num = line(g, n, 150, C.red, M - 4, 34);
      const tl = line(g, ttl, 78, C.ink, colX(2), 40);
      const ds = el(g, { left: colX(2) + "px", top: "136px", ...fBR(31, 500, 1.35), color: "#3A3633", whiteSpace: "pre" }); ds.textContent = d;
      return { g, rule, num, tl, ds };
    });
    const zs = fit("SAME TRUCK.", W - 2 * M, 800, 330);
    S.w.same = ["ORDER", "TRUCK", "REP"].map((w, i) => {
      const y0 = (H - 3 * zs * 0.9) / 2 - 40 + i * zs * 0.9;
      const hi = el(root, { left: M - 10 + measure("SAME ", zs) + "px", top: y0 - zs * 0.04 + "px", width: measure(w, zs) + 24 + "px", height: zs * 0.84 + "px", background: C.red, transformOrigin: "0 50%" });
      const o = line(root, `SAME <span style="color:${C.white}">${w}</span>${dot(C.ink)}`, zs, C.ink, M - 4, y0);
      return { o, hi };
    });
    // PAY LESS. on red: the block grows out of the word
    S.w.redBlk = el(root, { width: W + "px", height: H + "px", background: C.red, transformOrigin: "50% 50%" });
    const zp = fit("PAY LESS.", W - 2 * M, 800, 420);
    S.w.pay = line(root, `PAY LESS${dot(C.black)}`, zp, C.white, M - 4, H / 2 - zp * 0.45);
  }
  function believe(t) {
    const b = tb(t), Wb = S.w;
    disp(Wb.root, b >= 25.5 && b < 42.15);
    if (!(b >= 25.5 && b < 42.15)) return;
    T(Wb.mark.d, { x: W - Wb.mark.w * 0.7, y: 980 - 60 * pb(t, 26, 42), op: 1 });
    // headline, then it shrinks into a section header
    const shrink = ez.inOutExpo(pb(t, 29.5, 30.1)), hout = ez.inExpo(pb(t, 35.7, 36.05));
    T(Wb.head, { x: 0, y: -shrink * 110 - hout * 500, s: 1 - shrink * 0.62, op: 1 - hout });
    Wb.head.style.transformOrigin = `${M}px 200px`;
    Wb.lab.style.clipPath = `inset(0 ${(1 - ez.outExpo(pr(t, 26, 0.4))) * 100}% 0 0)`;
    Wb.lines.forEach((o, i) => rise(o, pr(t, [26, 26.5, 27.5, 28][i] - 0.03, 0.3)));
    // services table
    Wb.rows.forEach((r, i) => {
      const b0 = 30 + 2 * i, out = ez.inExpo(pb(t, 35.6 + i * 0.08, 36 + i * 0.08));
      disp(r.g, b >= b0 - 0.05 && out < 1);
      T(r.g, { x: -out * W, y: 0 });
      T(r.rule, { x: M, y: 0, sx: Math.max(0.001, ez.outExpo(pr(t, b0 - 0.05, 0.5))), op: 1 });
      rise(r.num, pr(t, b0, 0.35)); rise(r.tl, pr(t, b0 + 0.1, 0.35));
      r.ds.style.opacity = ez.outExpo(pr(t, b0 + 0.3, 0.4));
      r.ds.style.transform = `translate(${colX(2)}px, ${136 + (1 - ez.outExpo(pr(t, b0 + 0.3, 0.4))) * 20}px)`;
      r.ds.style.left = "0px"; r.ds.style.top = "0px";
    });
    // same order / truck / rep
    const sout = ez.inExpo(pb(t, 39.6, 40));
    Wb.same.forEach((s, i) => {
      const b0 = 36 + i;
      rise(s.o, pr(t, b0 - 0.03, 0.28), sout);
      const hp = ez.outExpo(pr(t, b0 + 0.06, 0.3));
      T(s.hi, { x: 0, y: 0, sx: Math.max(0.001, hp), op: b >= b0 && sout < 1 ? 1 : 0 });
      s.hi.style.left = M - 10 + measure("SAME ", s.o.size) + "px";
    });
    // PAY LESS. callback, red grows from the word, then breaks into the next grid
    const rp = ez.outExpo(pr(t, 40 - 0.02, 0.45));
    vis(Wb.redBlk, b >= 39.98);
    Wb.redBlk.style.clipPath = `inset(${(1 - rp) * 45}% 0 ${(1 - rp) * 45}% 0)`;
    rise(Wb.pay, pr(t, 40.05, 0.28), pb(t, 41.6, 41.9));
  }

  /* ===== S4 proof (b42-54): the four families, packaging in your image, 48 H ===== */
  const FAM = [["Containers", "Board, bagasse, PET", "contenants.webp"], ["Bags", "Kraft, insulated, plastic", "sacs.webp"], ["Cups", "Hot, cold, lids", "verres.webp"], ["Utensils", "CPLA, wood, straws", "ustensiles.webp"]];
  const PRINT = [["Burger box", "boite.webp"], ["Paper bag", "sac.webp"], ["Chopstick sleeve", "etui.webp"]];
  function buildProof() {
    const root = layer(5); root.style.background = C.paper;
    S.p = { root };
    S.p.lab = label(root, "What we import", M, 214, C.red);
    const z = fit("FOUR FAMILIES", W - 2 * M, 800, 200);
    S.p.h = line(root, `FOUR FAMILIES${dot(C.red)}`, z, C.ink, M - 4, 300);
    const cw = (W - 2 * M - GUT) / 2, ch = 560;
    S.p.cells = FAM.map(([n, d, src], i) => {
      const x = M + (i % 2) * (cw + GUT), y = 520 + Math.floor(i / 2) * (ch + 120);
      const c = imgCell(root, `img/${src}`, x, y, cw, ch);
      const red = el(c.box, { width: "100%", height: "100%", background: C.red, top: 0, left: 0 });
      const t1 = el(root, { left: x + "px", top: y + ch + 18 + "px", ...fBC(46, 800, 1, 0), color: C.ink }); t1.textContent = n;
      const t2 = el(root, { left: x + "px", top: y + ch + 70 + "px", ...fBR(26, 500), color: "#57514C", whiteSpace: "nowrap" }); t2.textContent = d;
      return { ...c, red, t1, t2 };
    });
    // custom print on black
    const dark = layer(6); dark.style.background = C.black; S.p.dark = dark;
    S.p.lab2 = label(dark, "Custom print", M, 214, C.red);
    const z2 = fit("IN YOUR IMAGE.", W - 2 * M, 800, 230);
    S.p.c1 = line(dark, "PACKAGING", z2, C.white, M - 4, 300);
    S.p.c2 = line(dark, `IN YOUR IMAGE${dot(C.red)}`, z2, C.white, M - 4, 300 + z2 * 0.88);
    S.p.prints = PRINT.map(([n, src], i) => {
      const y = 760 + i * 330, c = imgCell(dark, `img/${src}`, M, y, W - 2 * M, 290);
      const tag = el(dark, { left: M + 24 + "px", top: y + 22 + "px", padding: "10px 16px", background: C.red, ...fBC(30, 700, 1, 0.1), color: C.white }); tag.textContent = n;
      return { ...c, tag };
    });
    S.p.foot = el(dark, { left: M + "px", top: "1790px", ...fBC(34, 600, 1, 0.1), color: "rgba(255,255,255,.8)", whiteSpace: "nowrap" }); S.p.foot.textContent = "Your logo, printed at the factory.";
    // 48 H on red
    const red = layer(7); red.style.background = C.red; S.p.red = red;
    S.p.lab3 = label(red, "Price comparison", M, 300, C.white);
    S.p.big = el(red, { left: M - 10 + "px", top: "420px", ...fBC(640, 800, 0.86, -0.02), color: C.white, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" });
    const z3 = fit("NO STRINGS ATTACHED.", W - 2 * M, 800, 140);
    S.p.s1 = line(red, "SEND US WHAT YOU BUY.", z3, C.white, M - 4, 1180);
    S.p.s2 = line(red, `NO STRINGS ATTACHED${dot(C.black)}`, z3, C.black, M - 4, 1180 + z3 * 0.95);
    S.p.sq = el(red, { width: "260px", height: "260px", background: C.red, left: (W - 260) / 2 + "px", top: (H - 260) / 2 + "px", transformOrigin: "50% 50%" });
  }
  function proof(t) {
    const b = tb(t), Pf = S.p;
    disp(Pf.root, b >= 41.9 && b < 46.2); disp(Pf.dark, b >= 45.5 && b < 49.9); disp(Pf.red, b >= 49.3 && b < 54.2);
    if (b >= 41.9 && b < 46.2) {
      Pf.lab.style.clipPath = `inset(0 ${(1 - ez.outExpo(pr(t, 42, 0.4))) * 100}% 0 0)`;
      rise(Pf.h, pr(t, 42.05, 0.3), pb(t, 45.6, 45.9));
      Pf.cells.forEach((c, i) => {
        const b0 = 42 + i * 0.5, e = ez.outExpo(pr(t, b0 - 0.02, 0.35)), out = ez.inExpo(pb(t, 45.5 + i * 0.06, 45.95 + i * 0.06));
        // the red block lands first (the PAY LESS. red, broken into the grid), then wipes off to reveal the product
        c.box.style.clipPath = `inset(0 0 ${(1 - e) * 100}% 0)`;
        c.red.style.transform = `translateY(${-ez.inOutExpo(pr(t, b0 + 0.18, 0.3)) * 101}%)`;
        c.img.style.transform = `scale(${1.2 - 0.2 * ez.outCubic(pr(t, b0 + 0.15, 1.2))})`;
        T(c.box, { x: c.x, y: c.y + out * H * 0.7, op: b >= b0 - 0.02 ? 1 : 0 });
        [c.t1, c.t2].forEach((d, k) => { d.style.opacity = ez.outExpo(pr(t, b0 + 0.25 + k * 0.08, 0.3)) * (1 - out); });
      });
    }
    if (b >= 45.5 && b < 49.9) {
      Pf.dark.style.clipPath = `inset(0 0 ${(1 - ez.inOutExpo(pb(t, 45.55, 46.05))) * 100}% 0)`;
      Pf.lab2.style.clipPath = `inset(0 ${(1 - ez.outExpo(pr(t, 46, 0.4))) * 100}% 0 0)`;
      rise(Pf.c1, pr(t, 46, 0.3)); rise(Pf.c2, pr(t, 46.5, 0.3));
      Pf.prints.forEach((c, i) => {
        const b0 = 47 + i * 0.5, e = ez.outExpo(pr(t, b0 - 0.02, 0.4));
        T(c.box, { x: c.x + (1 - e) * W, y: c.y, op: b >= b0 - 0.02 ? 1 : 0 });
        c.img.style.transform = `scale(${1.15 - 0.15 * e}) translateX(${-30 * pb(t, b0, 49.5)}px)`;
        T(c.tag, { x: c.x + 24 + (1 - ez.outExpo(pr(t, b0 + 0.2, 0.35))) * 300, y: c.y + 22, op: b >= b0 + 0.2 ? 1 : 0 });
        c.tag.style.left = "0px"; c.tag.style.top = "0px";
      });
      Pf.foot.style.clipPath = `inset(0 ${(1 - ez.outExpo(pr(t, 48.5, 0.5))) * 100}% 0 0)`;
    }
    if (b >= 49.3 && b < 54.2) {
      Pf.red.style.clipPath = `inset(${(1 - ez.inOutExpo(pb(t, 49.35, 49.85))) * 100}% 0 0 0)`;
      Pf.lab3.style.clipPath = `inset(0 ${(1 - ez.outExpo(pr(t, 49.6, 0.4))) * 100}% 0 0)`;
      const c = ez.outCubic(pb(t, 49.6, 51));
      const out = ez.inExpo(pb(t, 53.3, 53.75));
      Pf.big.innerHTML = `${Math.round(48 * c)}<span style="font-size:.5em;letter-spacing:0"> H</span>`;
      T(Pf.big, { x: 0, y: (1 - ez.outExpo(pr(t, 49.6, 0.4))) * 120 - out * 200, s: 1 + 0.04 * (b >= 51 ? Math.exp(-since(t, 51) / 0.12) : 0), op: (b >= 49.6 ? 1 : 0) * (1 - out) });
      Pf.big.style.left = M - 10 + "px"; Pf.big.style.top = "420px";
      rise(Pf.s1, pr(t, 51.5, 0.3), pb(t, 53.2, 53.5)); rise(Pf.s2, pr(t, 52.5, 0.3), pb(t, 53.2, 53.5));
      // the red collapses into a square: the 新 mark's seat in the logo
      const sq = ez.inOutExpo(pb(t, 53.45, 54));
      Pf.red.style.background = sq > 0 ? "transparent" : C.red;
      T(Pf.sq, { s: lerp(Math.hypot(W, H) / 260, 1, sq), op: b >= 53.45 ? 1 : 0 });
      Pf.lab3.style.opacity = 1 - sq;
    }
  }

  /* ===== S5 logo sting (b54-64) ===== */
  function buildLogo() {
    const root = layer(8); root.style.background = C.paper;
    S.l = { root };
    const LW = W - 2 * M;
    S.l.parts = ["glyph", "importW", "rama", "tag"].map((p) => logoSVG(root, p, LW));
    S.l.LW = LW; S.l.LH = S.l.parts[0].h;
    const z = fit("FOR ANYTHING.", W - 2 * M, 800, 200);
    S.l.l1 = line(root, "PAY LESS", z, C.ink, M - 4, 1060);
    S.l.l2 = line(root, `FOR ANYTHING${dot(C.red)}`, z, C.ink, M - 4, 1060 + z * 0.88);
    S.l.cta = el(root, { left: M + "px", top: "1560px", height: "104px", padding: "0 40px", background: C.red, display: "flex", alignItems: "center", gap: "18px", ...fBC(46, 700, 1, 0.08), color: C.white, whiteSpace: "nowrap" });
    S.l.cta.innerHTML = `GET A PRICE <span style="font-family:${BR};font-weight:600">→</span>`;
    S.l.url = el(root, { left: M + "px", top: "1700px", ...fBR(36, 500), color: "#57514C" }); S.l.url.textContent = "importrama.com";
  }
  function logo(t) {
    const b = tb(t), L = S.l;
    disp(L.root, b >= 53.95);
    if (b < 53.95) return;
    const [gl, im, ra, tg] = L.parts, y0 = 520;
    // glyph: lands where the red square was (centre), then slides into its seat in the lockup
    const gw = (LOGO.glyphBox[2] / LOGO.vb[2]) * L.LW, gx0 = M + ((LOGO.glyphBox[0] - LOGO.vb[0]) / LOGO.vb[2]) * L.LW;
    const gyc = y0 + ((LOGO.glyphBox[1] - LOGO.vb[1] + LOGO.glyphBox[3] / 2) / LOGO.vb[3]) * L.LH;
    const seat = ez.inOutExpo(pb(t, 55, 55.75)), pop = spring(since(t, 54) + 0.02, 2, 6.5);
    const cx = lerp(W / 2, gx0 + gw / 2, seat), cy = lerp(H / 2, gyc, seat), s = lerp(1.6, 1, seat) * (0.6 + 0.4 * clamp(pop, 0, 1.2));
    gl.d.style.transformOrigin = `${gx0 + gw / 2 - M}px ${gyc - y0}px`;
    T(gl.d, { x: M + (cx - (gx0 + gw / 2)), y: y0 + (cy - gyc), s, op: 1 });
    const reveal = (d, b0) => { const e = ez.outExpo(pr(t, b0, 0.5)); d.d.style.clipPath = `inset(0 ${(1 - e) * 100}% 0 0)`; T(d.d, { x: M + (1 - e) * 40, y: y0, op: b >= b0 ? 1 : 0 }); };
    reveal(im, 55.5); reveal(ra, 56); reveal(tg, 56.5);
    rise(L.l1, pr(t, 57, 0.3)); rise(L.l2, pr(t, 57.5, 0.3));
    const ce = spring(since(t, 58.5) + 0.02, 2.4, 7);
    T(L.cta, { s: Math.max(0.001, clamp(ce, 0, 1.2)), op: b >= 58.5 ? 1 : 0 }); L.cta.style.transformOrigin = "0 50%";
    L.url.style.clipPath = `inset(0 ${(1 - ez.outExpo(pr(t, 59.25, 0.5))) * 100}% 0 0)`;
  }

  /* ===== camera, flash, grain ===== */
  function buildFX() {
    S.flash = el(stage, { width: W + "px", height: H + "px", zIndex: 40, background: C.white, mixBlendMode: "screen" });
    const g = el(stage, { width: W + 256 + "px", height: H + 256 + "px", zIndex: 50, mixBlendMode: "overlay", opacity: 0.1, pointerEvents: "none" });
    const cv = document.createElement("canvas"); cv.width = cv.height = 256;
    const cx = cv.getContext("2d"), im = cx.createImageData(256, 256), rnd = mulberry32(11);
    for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (rnd() + rnd() + rnd() - 1.5) * 120; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    cx.putImageData(im, 0, 0);
    g.style.backgroundImage = `url(${cv.toDataURL()})`;
    S.grain = g;
  }
  function fx(t) {
    let f = 0;
    for (const [b, a] of [[6, 0.35], [10, 0.25], [40, 0.3], [49.5, 0.2], [54, 0.3]]) { const d = since(t, b); if (d >= 0) f = Math.max(f, a * Math.exp(-d / 0.1)); }
    T(S.flash, { op: f });
    let s = 1, x = 0, y = 0, r = 0;
    for (const b of [0, 1, 3, 5, 6, 6.75, 7.25, 10, 11, 12, 14, 16, 18, 20, 22, 26, 28, 30, 32, 34, 36, 37, 38, 40, 42, 46, 47, 48, 49.5, 51, 54, 55.5, 57.5, 58.5]) {
      const d = since(t, b); if (d >= 0) s += ([6, 40, 54, 10].includes(b) ? 0.05 : 0.02) * Math.exp(-d / 0.12);
    }
    for (const [b, a] of [[6, 18], [10, 12], [40, 16], [54, 10]]) { const d = since(t, b); if (d >= 0 && d < 0.5) { const e = a * Math.exp(-d / 0.12); x += e * sn(d * 30, b); y += e * sn(d * 30, b + 9); r += e * 0.02 * sn(d * 20, b + 3); } }
    cam.style.transform = `translate(${x}px,${y}px) rotate(${r}deg) scale(${s})`;
    const fr = Math.floor(t * 30 + 1e-6);
    T(S.grain, { x: -Math.floor(hash(fr, 3) * 256), y: -Math.floor(hash(fr, 4) * 256), op: 0.1 });
  }

  /* ---------- sound design (placed on the measured grid at final render) ---------- */
  function buildCues() {
    cue(0, "slam", 0.6); [1, 3, 5].forEach((b) => { cue(b, "slam", 0.65); cue(b - 0.1, "zip", 0.3, 0.3, { dir: 1 }); });
    cue(6, "thump", 0.9); cue(6, "slam", 0.8); cue(6.75, "slam", 0.6); cue(7.25, "slam", 0.7); cue(8, "air", 0.4, 0, { dir: -1 });
    cue(9.6, "air", 0.55, 0, { dir: 1 }); cue(10, "thump", 0.8); cue(10, "bloom", 0.5); cue(10.25, "slam", 0.5); cue(11, "slam", 0.6);
    cue(12, "air", 0.5, 0, { dir: 1 }); cue(13, "shimmer", 0.3);
    [14, 16, 18, 20, 22].forEach((b, i) => { cue(b, "tap", 0.6, -0.4); cue(b + 0.05, "glint", 0.35, -0.3, { step: i }); });
    cue(20, "zip", 0.3, 0.4, { dir: -1 }); cue(25, "air", 0.55, 0, { dir: -1 });
    [26, 26.5, 27.5, 28].forEach((b) => cue(b, "slam", 0.45)); cue(29.6, "air", 0.3, 0, { dir: 1 });
    [30, 32, 34].forEach((b, i) => { cue(b, "slam", 0.6); cue(b + 0.3, "glint", 0.3, 0.2, { step: i + 2 }); });
    cue(35.7, "air", 0.5, 0, { dir: -1 }); [36, 37, 38].forEach((b) => { cue(b, "slam", 0.7); cue(b + 0.06, "zip", 0.25, 0.2, { dir: 1 }); });
    cue(40, "thump", 0.95); cue(40, "slam", 0.85); cue(40.05, "sparkle", 0.4);
    [42, 42.5, 43, 43.5].forEach((b, i) => { cue(b, "tap", 0.55, [-0.4, 0.4, -0.4, 0.4][i]); cue(b + 0.18, "zip", 0.22, [-0.4, 0.4, -0.4, 0.4][i], { dir: -1 }); });
    cue(45.6, "air", 0.5, 0, { dir: 1 }); cue(46, "slam", 0.6); cue(46.5, "slam", 0.6); [47, 47.5, 48].forEach((b) => cue(b, "zip", 0.35, 0.5, { dir: -1 }));
    cue(49.4, "air", 0.5, 0, { dir: 1 }); for (let k = 0; k < 12; k++) cue(49.6 + k * 0.12, "tap", 0.12 + 0.02 * k, 0);
    cue(51, "thump", 0.7); cue(51.5, "slam", 0.5); cue(52.5, "slam", 0.55);
    cue(53.5, "air", 0.6, 0, { dir: -1 }); cue(54, "thump", 0.9); cue(54, "bloom", 0.55); cue(55.5, "glint", 0.4, 0, { step: 2 }); cue(56, "glint", 0.4, 0, { step: 4 });
    cue(57, "slam", 0.5); cue(57.5, "slam", 0.6); cue(58.5, "tap", 0.8); cue(58.55, "shimmer", 0.4); cue(59.25, "glint", 0.3, 0, { step: 6 });
  }

  /* ---------- frame ---------- */
  async function seek(t) {
    pending.length = 0;
    gridPaint(t); hook(t); route(t); believe(t); proof(t); logo(t); fx(t);
    await Promise.all(pending);
  }
  window.DURATION = 30;
  window.ready = (async () => {
    const [beats, svg] = await Promise.all([fetch("../beats4.json").then((r) => r.json()), fetch(A + "logo.svg").then((r) => r.text())]);
    BTS = beats.beats; PER = beats.period;
    for (const w of ["500", "600", "700", "800"]) await document.fonts.load(`${w} 100px "Barlow Condensed"`);
    for (const w of ["400", "500", "600"]) await document.fonts.load(`${w} 100px Barlow`);
    await document.fonts.ready;
    buildLogoParts(svg);
    buildGrid(); buildHook(); buildRoute(); buildBelieve(); buildProof(); buildLogo(); buildFX(); buildCues();
    await Promise.all([...document.images].map((im) => (im.complete ? 0 : im.decode().catch(() => {}))));
    window.CUES = CUES.map((c) => ({ ...c, t: bt(c.beat) }));
    window.seek = seek;
    await seek(0);
    return { W, H, FMT: "portrait", cues: CUES.length };
  })();
})();
