/* Création Virale — 20 s showreel. Pure function of time: window.seek(t) paints frame t.
   No transitions, timers or rAF; seeded noise only. Every UI pixel is a crop of a real capture. */
(() => {
  const P = new URLSearchParams(location.search);
  const W = +(P.get("w") || 1080), H = +(P.get("h") || 1920);
  const FMT = H > W * 1.2 ? "portrait" : W > H * 1.2 ? "landscape" : "square";
  const ACC = "#2C5BFF", CARD = "#141414", MUTED = "#8F8F8F", WHITE = "#FFFFFF";
  const DPR = 3, DUR = 20;
  const A = "../assets/";
  const by = (o) => o[FMT];

  /* ---------- math ---------- */
  function mulberry32(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const hash = (i, seed = 1) => mulberry32((Math.imul(i | 0, 2654435761) ^ Math.imul(seed, 40503)) >>> 0)();
  const vnoise = (x, seed) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash(i, seed) * (1 - u) + hash(i + 1, seed) * u; };
  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const lerp = (a, b, t) => a + (b - a) * t;
  const ez = {
    outExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    inExpo: (t) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
    inOutExpo: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2),
    outCubic: (t) => 1 - Math.pow(1 - t, 3),
    inCubic: (t) => t * t * t,
    inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    outQuint: (t) => 1 - Math.pow(1 - t, 5),
  };
  // damped spring 0 -> 1 (overshoots), dt in seconds since start
  const spring = (dt, f = 2.6, d = 7.5) => (dt <= 0 ? 0 : 1 - Math.exp(-d * dt) * Math.cos(2 * Math.PI * f * dt));

  /* ---------- beat grid (measured, beats.json) ---------- */
  let BTS = [], PER = 0.5;
  const bt = (b) => { const n = BTS.length; if (b <= 0) return BTS[0] + b * PER; if (b >= n - 1) return BTS[n - 1] + (b - n + 1) * PER; const i = Math.floor(b); return BTS[i] + (b - i) * (BTS[i + 1] - BTS[i]); };
  const tb = (t) => (t - BTS[0]) / PER;
  const pr = (t, b, sec) => clamp((t - bt(b)) / sec);      // progress of a `sec`-long move starting on beat b
  const pb = (t, b0, b1) => clamp((t - bt(b0)) / (bt(b1) - bt(b0)));
  const on = (t, b0, b1) => t >= bt(b0) && t < bt(b1);

  /* ---------- sound cues (exported to the mixer, beats are measured-grid indices) ---------- */
  const CUES = [];
  const cue = (beat, type, gain = 1, pan = 0, extra = {}) => CUES.push({ beat, type, gain, pan, ...extra });

  /* ---------- DOM helpers ---------- */
  const stage = document.getElementById("stage");
  Object.assign(stage.style, { width: W + "px", height: H + "px" });
  const el = (parent, css = {}, cls = "a", tag = "div") => { const e = document.createElement(tag); e.className = cls; Object.assign(e.style, css); parent.appendChild(e); return e; };
  const vis = (e, v) => { e.style.visibility = v ? "visible" : "hidden"; };
  const disp = (e, v) => { e.style.display = v ? "" : "none"; };   // scene roots: hides children whatever their visibility
  function T(e, o = {}) {
    const { x = 0, y = 0, s = 1, sx = 1, sy = 1, r = 0, rx = 0, ry = 0, sk = 0, op = 1 } = o;
    e.style.transform = `translate3d(${x}px,${y}px,0) rotate(${r}deg) rotateX(${rx}deg) rotateY(${ry}deg) skewX(${sk}deg) scale(${s * sx},${s * sy})`;
    e.style.opacity = op;
    vis(e, op > 0.001);
  }
  const URLS = new Set();
  // crop of a 3x screenshot, given in CSS px of the site (430 px wide viewport), drawn at scale S
  function crop(parent, src, natW, cx, cy, cw, ch, S, css = {}) {
    URLS.add(src);
    return el(parent, { width: cw * S + "px", height: ch * S + "px", backgroundImage: `url("${src}")`, backgroundRepeat: "no-repeat",
      backgroundSize: `${(natW / DPR) * S}px auto`, backgroundPosition: `${-cx * S}px ${-cy * S}px`, ...css });
  }
  function pic(parent, src, w, h, css = {}) {
    URLS.add(src);
    return el(parent, { width: w + "px", height: h + "px", backgroundImage: `url("${src}")`, backgroundSize: "100% 100%", ...css });
  }
  // measure text with the real font (after fonts load)
  const mctx = document.createElement("canvas").getContext("2d");
  function measure(text, size, weight = 700, family = "Geist", track = 0) {
    mctx.font = `${weight} ${size}px ${family}`;
    mctx.letterSpacing = `${track * size}px`;
    return mctx.measureText(text).width;
  }
  /* Kinetic text block: lines of words, each word in its own mask so it can rise into place.
     opts: size | fit {w, max}, weight, family, track, lh, align, color(word,i) */
  function textBlock(parent, lines, o) {
    const family = o.family || "Geist", weight = o.weight || 700, track = o.track ?? -0.035, lh = o.lh || 1.0;
    let size = o.size;
    if (!size) {
      const widest = Math.max(...lines.map((l) => measure(l.join(" "), 100, weight, family, track)));
      size = Math.min(o.fit.max, (o.fit.w / widest) * 100);
    }
    const root = el(parent, { width: (o.width || W) + "px" });
    const words = [];
    let i = 0, y = 0;
    lines.forEach((line, li) => {
      const row = el(root, { position: "absolute", left: 0, top: y + "px", width: "100%", display: "flex", gap: `0 ${0.24 * size}px`,
        justifyContent: o.align === "center" ? "center" : o.align === "right" ? "flex-end" : "flex-start",
        font: `${weight} ${size}px/${lh} ${family}`, letterSpacing: `${track}em`, color: WHITE }, "");
      line.forEach((w) => {
        const pad = 0.22 * size;
        const m = el(row, { padding: `${pad}px 0.06em ${pad}px 0.02em`, margin: `${-pad}px -0.06em ${-pad}px -0.02em` }, "mask", "span");
        const ink = el(m, { color: o.color ? o.color(w, i) : WHITE }, "ink", "span");
        ink.textContent = w;
        words.push({ m, ink, line: li, i: i++, text: w });
      });
      y += size * lh;
    });
    return { root, words, size, height: y };
  }
  // word i rises into its mask: progress p (0 hidden below, 1 in place); exit q (0 in place, 1 gone above)
  function riseWord(w, p, q = 0, stretch = 0.25) {
    const e = ez.outExpo(p), x = ez.inExpo(q);
    const y = (1 - e) * 112 - x * 112;
    w.ink.style.transform = `translateY(${y}%) scaleY(${1 + (1 - e) * stretch})`;
    w.ink.style.transformOrigin = "50% 100%";
    vis(w.m, p > 0 && q < 1);
  }

  /* ---------- layout per format ---------- */
  const L = {
    hookLines: by({ portrait: [["Personne"], ["ne"], ["regarde"], ["vos"], ["vidéos."]],
                    square: [["Personne", "ne"], ["regarde"], ["vos", "vidéos."]],
                    landscape: [["Personne", "ne"], ["regarde", "vos"], ["vidéos."]] }),
    margin: by({ portrait: 64, square: 60, landscape: 120 }),
    SP: by({ portrait: 1.81, square: 1.6, landscape: 1.6 }),                 // product window scale (css px -> stage px)
    feedCols: by({ portrait: 3, square: 4, landscape: 6 }),
    cursor: by({ portrait: 1.9, square: 1.35, landscape: 1.55 }),
  };
  // feature layout: phone rect (page 430x932 at scale S), push rect, caption origin
  const FL = (() => {
    if (FMT === "portrait") {
      const S = 1.37, w = 430 * S, h = 932 * S;
      return { S, phone: { x: (W - w) / 2, y: 572, w, h }, push: { x: 0, y: 560, w: W, h: H - 560 }, cap: { x: 72, y: 128, w: 936, max: 106, label: 30, sub: 40 } };
    }
    if (FMT === "square") {
      const S = 0.84, w = 430 * S, h = 932 * S;
      return { S, phone: { x: (W - w) / 2, y: 278, w, h }, push: { x: 0, y: 270, w: W, h: H - 270 }, cap: { x: 60, y: 44, w: 960, max: 62, label: 22, sub: 26 } };
    }
    const S = 1.02, w = 430 * S, h = 932 * S;
    return { S, phone: { x: 1300, y: (H - h) / 2, w, h }, push: { x: 940, y: 0, w: W - 940, h: H }, cap: { x: 130, y: 0, w: 740, max: 112, label: 30, sub: 40, vcenter: true } };
  })();

  /* ---------- scene graph ---------- */
  const cam = el(stage, { width: W + "px", height: H + "px", transformOrigin: "50% 50%" });
  const layer = (z) => el(cam, { width: W + "px", height: H + "px", zIndex: z });

  let G, BEATS;
  const S = {}; // all built elements

  function buildFeed() {
    const root = layer(1);
    const cols = L.feedCols, gap = 26 * (W / 1080 > 1.5 ? 1.2 : 1);
    const span = Math.max(W, H) * 1.35;
    const colW = (span - gap * (cols + 1)) / cols * (FMT === "portrait" ? 0.85 : 0.62);
    const tileH = colW * 16 / 9, step = tileH + gap;
    const rows = Math.ceil((Math.max(W, H) * 1.6) / step) + 2;
    const thumbs = ["1-revelation-de-la-salle-aux-maries-v2", "2-10-choses-a-faire", "3-the-planner-vs-the-design", "burger-1-1", "deeping-sauce", "dramatique", "erreurs-qui-abiment-ta-voiture-v3", "facon-parfaite-de-commencer-le-we"];
    const grid = el(root, { width: W + "px", height: H + "px", transformOrigin: "50% 50%" });
    const tiles = [];
    const totalW = cols * colW + (cols - 1) * gap;
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
      const k = Math.floor(hash(c * 31 + r * 7, 5) * thumbs.length);
      const e = pic(grid, `${A}thumbs/${thumbs[k]}.jpg`, colW, tileH, { borderRadius: colW * 0.07 + "px" });
      tiles.push({ e, c, r, x: (W - totalW) / 2 + c * (colW + gap) });
    }
    S.feed = { root, grid, tiles, step, rows, colW, tileH };
  }
  function feedAt(t, offsets, filter, tilt) {
    const F = S.feed;
    F.grid.style.filter = filter;
    F.grid.style.transform = `rotate(${tilt}deg) scale(1.18)`;
    const loop = F.rows * F.step;
    for (const tl of F.tiles) {
      let y = (tl.r * F.step - offsets[tl.c]) % loop;
      if (y < 0) y += loop;
      T(tl.e, { x: tl.x, y: y - F.step * 1.5 - (H * 0.3) });
    }
  }

  function buildHook() {
    const root = layer(2);
    const m = L.margin;
    const tb_ = textBlock(root, L.hookLines, { fit: { w: W - 2 * m, max: by({ portrait: 250, square: 200, landscape: 270 }) }, weight: 800, track: -0.045, lh: 0.9,
      color: (w) => (w === "vidéos." ? ACC : WHITE) });
    T(tb_.root, { x: m, y: (H - tb_.height) / 2 - tb_.size * 0.04 });
    S.hook = { root, text: tb_, baseY: (H - tb_.height) / 2 - tb_.size * 0.04 };
  }

  function buildProduct() {
    const root = layer(3);
    const SP = L.SP, g = G.hero;
    const persp = el(root, { width: W + "px", height: H + "px", perspective: 2400 + "px", perspectiveOrigin: "50% 45%" });
    const win = el(persp, { width: 430 * SP + "px", height: 932 * SP + "px", transformOrigin: "50% 50%" });
    const clip = el(win, { width: "100%", height: "100%", overflow: "hidden", borderRadius: 30 * SP + "px", boxShadow: "0 60px 140px rgba(0,0,0,.55)", background: "#06070c" });
    pic(clip, `${A}derived/hero-plate.png`, 430 * SP, 932 * SP);
    const piece = (name, css = {}) => {
      const r = g[name];
      const holder = el(clip, { width: r.w * SP + "px", height: r.h * SP + "px", ...css });
      const img = pic(holder, `${A}derived/hero-${name}.png`, r.w * SP, r.h * SP, css.borderRadius ? { borderRadius: css.borderRadius } : {});
      return { holder, img, r };
    };
    const P_ = {};
    for (const n of ["logo", "menu", "pill", "h1-0", "h1-1", "h1-2", "para", "cta", "note", "photo", "badge+100", "badge+40K", "badge+30K"]) {
      const rad = n === "photo" ? { borderRadius: 18 * SP + "px", overflow: "hidden" } : n.startsWith("badge") || n === "cta" || n === "pill" ? { borderRadius: 999 + "px" } : {};
      P_[n] = piece(n, rad);
    }
    S.product = { root, persp, win, clip, P: P_ };
  }

  function buildFeatures() {
    const root = layer(4);
    const S_ = FL.S;
    const box = el(root, { overflow: "hidden", boxShadow: "0 50px 120px rgba(0,0,0,.5)", background: "#050505" });
    const content = el(box, { width: 430 * S_ + "px", height: 1652 * S_ + "px" });
    // F1: savoir-faire viewport + real lightbox after the tap
    const f1 = el(content, {});
    crop(f1, `${A}states/thumb-before.png`, 1290, 0, 0, 430, 932, S_);
    const after = el(f1, { width: 430 * S_ + "px", height: 932 * S_ + "px" });
    const lb = G.lightbox, src = `${A}states/thumb-after-4.png`;
    const band = (x, y, w, h) => { const c = crop(after, src, 1290, x, y, w, h, S_); T(c, { x: x * S_, y: y * S_ }); };
    band(0, 0, 430, lb.y); band(0, lb.y + lb.h, 430, 932 - lb.y - lb.h); band(0, lb.y, lb.x, lb.h); band(lb.x + lb.w, lb.y, 430 - lb.x - lb.w, lb.h);
    const video = crop(f1, src, 1290, lb.x, lb.y, lb.w, lb.h, S_, { borderRadius: 14 * S_ + "px" });
    const ripple = el(f1, { width: 80 * S_ + "px", height: 80 * S_ + "px", borderRadius: "50%", border: `${2.2 * S_}px solid rgba(255,255,255,.9)`, boxSizing: "border-box" });
    // F2/F3: the "Bénéfice" section strip, scrolled for real
    const f23 = el(content, {});
    crop(f23, `${A}shots/mobile-s04.png`, 1290, 0, 0, 430, 1652, S_);
    const c1 = el(f23, {}); T(c1, { x: 20 * S_, y: 751.72 * S_ });
    const c1frames = [];
    for (let i = 0; i < 37; i++) c1frames.push(pic(c1, `${A}states/card1-${String(i).padStart(3, "0")}.png`, 390 * S_, 209 * S_));
    const c3 = el(f23, {}); T(c3, { x: 20 * S_, y: 1299.72 * S_ });
    pic(c3, `${A}derived/card3-plate.png`, 390 * S_, 301 * S_);
    const bars = G.card3.bars.map((b, i) => { const e = pic(c3, `${A}derived/bar${i}.png`, b.w * S_, b.h * S_); e.style.transformOrigin = "50% 100%"; return { e, b }; });
    const big = G.card3.big;
    const three = pic(c3, `${A}derived/card3-3x.png`, big.w * S_, big.h * S_);
    three.style.transformOrigin = "20% 80%";
    S.feat = { root, box, content, f1, after, video, ripple, f23, c1frames, bars, three, S: S_ };

    // format tiles for F2 (real cover, three real ratios)
    const tl = layer(5);
    const cover = `${A}thumbs/burger-1-1.jpg`; URLS.add(cover);
    const th = by({ portrait: 380, square: 270, landscape: 300 });
    const defs = [["9:16", th * 9 / 16, th], ["1:1", th * 0.82, th * 0.82], ["16:9", th * 0.82 * 16 / 9 * 0.82, th * 0.82 * 0.82]];
    const tiles = defs.map(([lab, w, h]) => {
      const t = el(tl, {});
      const im = el(t, { width: w + "px", height: h + "px", backgroundImage: `url("${cover}")`, backgroundSize: "cover", backgroundPosition: "50% 45%", borderRadius: Math.min(w, h) * 0.08 + "px", boxShadow: "0 30px 60px rgba(0,0,0,.45)" });
      const tag = el(t, { font: `500 ${th * 0.075}px "Geist Mono"`, color: WHITE, letterSpacing: "0.02em", whiteSpace: "nowrap" }, "a");
      tag.textContent = lab;
      T(tag, { x: 0, y: h + th * 0.05 });
      return { t, im, w, h, lab };
    });
    S.tiles = { root: tl, tiles, th };

    // captions
    const cl = layer(6);
    const caps = [
      { label: "01 / 03", lines: by({ portrait: [["Stoppez"], ["le", "scroll."]], square: [["Stoppez", "le", "scroll."]], landscape: [["Stoppez"], ["le", "scroll."]] }), sub: "Dans les premières secondes." },
      { label: "02 / 03", lines: by({ portrait: [["Du", "contenu", "adapté"], ["à", "chaque", "plateforme."]], square: [["Du", "contenu", "adapté"], ["à", "chaque", "plateforme."]], landscape: [["Du", "contenu"], ["adapté", "à", "chaque"], ["plateforme."]] }), sub: "Formats, durées, ratios." },
      { label: "03 / 03", lines: by({ portrait: [["L'engagement", "a"], ["plus", "que", "triplé."]], square: [["L'engagement", "a"], ["plus", "que", "triplé."]], landscape: [["L'engagement"], ["a", "plus", "que"], ["triplé."]] }), sub: "Interactions · Partages · Enregistrements" },
    ].map((c) => {
      const C = FL.cap;
      const root = el(cl, {});
      const lab = textBlock(root, [[c.label]], { size: C.label, weight: 500, family: '"Geist Mono"', track: 0.04, color: () => MUTED, width: C.w });
      const title = textBlock(root, c.lines, { fit: { w: C.w, max: C.max }, weight: 700, track: -0.035, lh: 1.02, width: C.w });
      const sub = textBlock(root, [c.sub.split(" ")], { size: C.sub, weight: 400, track: -0.01, color: () => MUTED, width: C.w });
      const gap1 = C.label * 1.1, gap2 = C.sub * 0.9;
      T(lab.root, { y: 0 }); T(title.root, { y: C.label + gap1 }); T(sub.root, { y: C.label + gap1 + title.height + gap2 });
      const h = C.label + gap1 + title.height + gap2 + C.sub * 1.1;
      T(root, { x: C.x, y: C.vcenter ? (H - h) / 2 : C.y });
      return { root, lab, title, sub };
    });
    S.caps = caps;
  }

  function buildNumber() {
    const root = layer(7);
    const m = L.margin;
    const size = Math.min(by({ portrait: 330, square: 300, landscape: 360 }), ((W - 2 * m) / measure("7,5 M+", 100, 700, "Geist", -0.04)) * 100);
    const line = el(root, { font: `700 ${size}px/1 Geist`, letterSpacing: "-0.04em", color: WHITE, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" });
    const digits = el(line, {}, "ink", "span");
    const gap = el(line, {}, "ink", "span"); gap.textContent = " ";
    const mplus = el(line, { color: ACC }, "ink", "span"); mplus.textContent = "M+";
    const label = el(root, { font: `500 ${size * 0.13}px/1.2 "Geist Mono"`, color: WHITE, letterSpacing: "0.01em", whiteSpace: "nowrap" });
    const y0 = H * by({ portrait: 0.4, square: 0.34, landscape: 0.3 });
    S.num = { root, line, digits, mplus, label, size, x: m, y: y0, labelText: "Vues générées pour nos clients" };
  }

  function buildLogo(svgText) {
    const root = layer(11);
    root.style.background = ACC;
    const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
    const paths = [...doc.querySelectorAll("path")].map((p) => p.outerHTML);
    const ns = "http://www.w3.org/2000/svg";
    const mk = (vb, inner, w) => { const h = (w * vb[3]) / vb[2]; const d = el(root, { width: w + "px", height: h + "px" }); d.innerHTML = `<svg xmlns="${ns}" viewBox="${vb.join(" ")}" width="${w}" height="${h}" style="overflow:hidden;display:block">${inner}</svg>`; return { d, h }; };
    const Lw = by({ portrait: 760, square: 470, landscape: 640 });
    // board: paths 0,1,4 + arm (2,3) + explosion (5-10)
    const board = mk([0, 0, 221, 98], `${paths[0]}${paths[1]}${paths[4]}<g id="arm">${paths[2]}${paths[3]}</g><g id="boom">${paths.slice(5).join("")}</g>`, Lw);
    const wordm = mk([0, 98, 221, 42], paths[4], Lw);
    const subm = mk([0, 140, 221, 20], paths[4], Lw);
    const arm = board.d.querySelector("#arm"), boom = board.d.querySelector("#boom");
    // tagline
    const lines = [["Et", "si", "votre"], ["prochaine", "vidéo"], ["changeait", "tout ?"]];
    const tw = by({ portrait: W - 140, square: W - 160, landscape: 860 });
    const tag = textBlock(root, lines, { fit: { w: tw, max: by({ portrait: 104, square: 72, landscape: 100 }) }, weight: 700, track: -0.035, lh: 1.04, width: tw,
      align: FMT === "landscape" ? "left" : "center" });
    const url = textBlock(root, [["creationvirale.com"]], { size: by({ portrait: 34, square: 26, landscape: 30 }), weight: 500, family: '"Geist Mono"', track: 0.02, width: tw,
      align: FMT === "landscape" ? "left" : "center" });
    let bx, byy, tx, ty, ux, uy;
    const total = board.h + wordm.h + subm.h;
    if (FMT === "landscape") {
      bx = 150; byy = (H - total) / 2; tx = 900; ty = (H - tag.height) / 2 - 40; ux = tx; uy = ty + tag.height + 50;
    } else {
      const gapT = by({ portrait: 110, square: 46 });
      const stack = total + gapT + tag.height;
      bx = (W - Lw) / 2; byy = (H - stack) / 2 - by({ portrait: 60, square: 30 }); tx = (W - tw) / 2; ty = byy + total + gapT; ux = tx; uy = H - by({ portrait: 170, square: 70 });
    }
    S.logo = { root, board, wordm, subm, arm, boom, tag, url, Lw, bx, by: byy, tx, ty, ux, uy };
  }

  function buildCursor() {
    const root = layer(8);
    const k = L.cursor;
    const c = el(root, { width: 24 * k + "px", height: 36 * k + "px", transformOrigin: "0 0" });
    c.innerHTML = `<svg viewBox="-1 -1 24 36" width="${24 * k}" height="${36 * k}"><path d="M1 1 L1 27 L7.4 21.2 L11.6 31 L15.8 29.2 L11.7 19.6 L20 19.6 Z" fill="#fff" stroke="#000" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
    c.style.filter = "drop-shadow(0 6px 10px rgba(0,0,0,.45))";
    const ring = el(root, { width: 44 * k + "px", height: 44 * k + "px", borderRadius: "50%", background: "rgba(255,255,255,.28)", border: `${1.5 * k}px solid rgba(255,255,255,.7)`, boxSizing: "border-box" });
    S.cursor = { c, ring, k };
  }

  function buildSlab() {
    const root = layer(10);
    const s = el(root, { width: W * 1.8 + "px", height: H * 1.7 + "px", background: ACC, transformOrigin: "50% 50%" });
    const s2 = el(root, { width: W + "px", height: H * 1.1 + "px", background: ACC });
    S.slab = { s, s2 };
  }

  function buildGrain() {
    const g = el(stage, { width: W + 256 + "px", height: H + 256 + "px", zIndex: 20, mixBlendMode: "overlay", opacity: 0.16, pointerEvents: "none" });
    const cv = document.createElement("canvas"); cv.width = cv.height = 256;
    const cx = cv.getContext("2d"), im = cx.createImageData(256, 256), rnd = mulberry32(7);
    for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (rnd() + rnd() + rnd() - 1.5) * 120; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    cx.putImageData(im, 0, 0);
    g.style.backgroundImage = `url(${cv.toDataURL()})`;
    S.grain = g;
  }

  /* ---------- cues (sound design, on the measured beat grid) ---------- */
  function buildCues() {
    cue(5.5, "whoosh", 0.55, 0, { len: 0.75 }); cue(6, "impact", 0.65);
    cue(6, "pop", 0.45, -0.4); cue(6.5, "swipe", 0.35, -0.5); cue(7, "tick", 0.5, -0.2); cue(7.5, "tick", 0.5, 0); cue(8, "tick", 0.5, 0.2);
    cue(8.5, "swipe", 0.3, 0); cue(9, "pop", 0.6, -0.3); cue(9.5, "whoosh-s", 0.45, 0); cue(10, "pop", 0.5, -0.4); cue(10.5, "pop", 0.5, 0.5); cue(11, "pop", 0.5, -0.5);
    cue(12, "whoosh", 0.85, 0.3, { len: 0.6 });
    cue(14, "click", 1.0, -0.4); cue(14, "open", 0.55, 0); cue(15, "whoosh-s", 0.35, 0);
    cue(18, "whoosh", 0.85, 0, { len: 0.8 });
    cue(19, "press", 0.8, 0.2); cue(20, "release", 0.7, 0.2); cue(20.25, "whoosh-s", 0.35, 0);
    cue(21, "pop", 0.6, -0.5); cue(21.5, "pop", 0.6, 0); cue(22, "pop", 0.6, 0.5); cue(23.5, "whoosh-s", 0.5, 0);
    cue(24.5, "wheel", 0.6, 0); cue(25, "wheel", 0.6, 0); cue(25.5, "wheel", 0.6, 0); cue(25.5, "pop", 0.5, -0.4);
    for (let i = 0; i < 7; i++) cue(25.75 + i * 0.25, "blip", 0.4, -0.6 + i * 0.2, { step: i });
    cue(27.5, "whoosh-s", 0.35, 0); cue(30, "whoosh", 1.0, 0, { len: 0.8 });
    cue(32, "impact", 0.9); cue(34, "whoosh", 0.8, 0, { len: 0.5 });
    cue(35, "clap", 1.0); cue(35, "impact", 0.7); cue(38, "tick", 0.3);
  }

  /* ============================== per-frame ============================== */
  let FRAME = 0;
  function seek(t) {
    FRAME = Math.floor(t * 30 + 1e-6);
    camera(t);
    hook(t);
    product(t);
    features(t);
    slab(t);
    number(t);
    logo(t);
    grain(t);
  }

  function camera(t) {
    let s = 1, x = 0, y = 0, r = 0;
    const punches = [[0, 0.035], [1, 0.03], [2, 0.03], [3, 0.03], [4, 0.045], [6, 0.02], [32, 0.06], [35, 0.04]];
    for (const [b, a] of punches) { const dt = t - bt(b); if (dt >= 0) s += a * Math.exp(-dt / 0.13); }
    const shakes = [[4, 10], [32, 22], [35, 16]];
    for (const [b, a] of shakes) {
      const dt = t - bt(b);
      if (dt >= 0 && dt < 0.6) { const e = a * Math.exp(-dt / 0.14); x += e * (vnoise(dt * 30, b) - 0.5) * 2; y += e * (vnoise(dt * 30, b + 50) - 0.5) * 2; r += e * 0.02 * (vnoise(dt * 22, b + 9) - 0.5); }
    }
    cam.style.transform = `translate(${x}px,${y}px) rotate(${r}deg) scale(${s})`;
  }

  // the hook -> product "scroll": one shared progress so the text and the UI move as one page
  const scrollP = (t) => ez.inOutExpo(pb(t, 5.3, 6.15));

  function hook(t) {
    const live = t < bt(6.3);
    disp(S.hook.root, live);
    const feedLive = live || on(t, 29.98, 34.2);
    disp(S.feed.root, feedLive);
    if (feedLive) {
      if (live) {
        // feed snaps up one tile per beat, like a thumb flicking past
        const offs = [];
        for (let c = 0; c < L.feedCols; c++) {
          const tc = t - c * 0.035;
          const k = Math.floor(tb(tc)), f = ez.outExpo(clamp((tc - bt(k)) / 0.32));
          offs.push((Math.max(k, -1) + f) * S.feed.step * 0.62 + c * 37);
        }
        const sp = scrollP(t);
        feedAt(t, offs.map((o) => o + sp * H * 1.2), "grayscale(1) brightness(.30) contrast(1.1)", -7);
      } else {
        const dt = t - bt(30);
        const offs = [];
        for (let c = 0; c < L.feedCols; c++) offs.push(dt * (900 + 90 * (c % 3)) + 600 * ez.outExpo(clamp(dt / 0.6)) + c * 53);
        feedAt(t, offs, "brightness(.40) saturate(1.15)", -7);
        // number leaves at the end of its beat
        S.feed.root.style.transform = `translateY(${-H * 0.7 * ez.inExpo(pb(t, 33.55, 34))}px)`;
      }
      if (live) S.feed.root.style.transform = "none";
    }
    if (!live) return;
    const sp = scrollP(t);
    T(S.hook.root, { y: -sp * H * 1.2 });
    S.hook.text.words.forEach((w, i) => riseWord(w, clamp((t - (bt(i) - 0.035)) / 0.3)));
  }

  function product(t) {
    const live = on(t, 5.2, 12.6);
    disp(S.product.root, live);
    if (!live) return;
    const SP = L.SP, P_ = S.product.P, win = S.product.win;
    const sp = scrollP(t);
    // camera on the window: zoom + focus (css y of the page that sits at frame centre)
    // camera keyframes [beat, focus y (css), zoom]: rides each piece as it lands, then pulls back
    const KF = by({
      portrait: [[6, 212, 1.4], [7, 222, 1.36], [7.6, 150, 1.3], [8.6, 400, 1.42], [9.6, 640, 1.3], [10.6, 466, 1.0], [12, 466, 0.98]],
      square: [[6, 212, 1.5], [7, 222, 1.45], [7.6, 150, 1.38], [8.6, 400, 1.3], [9.6, 660, 1.12], [10.6, 690, 0.95], [12, 690, 0.94]],
      landscape: [[6, 212, 2.2], [7, 222, 2.1], [7.6, 160, 1.85], [8.6, 420, 1.65], [9.6, 660, 1.45], [10.6, 640, 1.18], [12, 640, 1.15]],
    });
    let z = KF[0][2], fy = KF[0][1];
    for (let i = 0; i < KF.length - 1; i++) {
      const [b0, y0, z0] = KF[i], [b1, y1, z1] = KF[i + 1];
      if (t >= bt(b0)) { const e = ez.inOutCubic(pb(t, b0, b1)); fy = lerp(y0, y1, e); z = z0 * Math.pow(z1 / z0, e); }
    }
    const k = SP * z;
    const winH = 932 * SP;
    // window centre in stage space
    let cy = H / 2 + (466 - fy) * k;
    cy += (1 - sp) * H * 1.2;                           // arrives with the scroll
    const whipOut = ez.inExpo(pb(t, 11.55, 12.0));
    let cx = W / 2 - whipOut * W * 1.35;
    const tilt = 1 - ez.outCubic(pb(t, 6, 10));
    const drift = Math.sin(t * 1.3) * 1.2;
    win.style.transform = `translate(${cx - (430 * SP) / 2}px,${cy - winH / 2}px) rotateX(${tilt * 14}deg) rotateY(${tilt * -18 + drift - whipOut * 25}deg) scale(${z})`;

    // assembly: each real piece lands on its beat
    const place = (n, o) => { const p = P_[n], r = p.r; T(p.holder, { x: r.x * SP + (o.x || 0), y: r.y * SP + (o.y || 0), s: o.s ?? 1, r: o.r || 0, op: o.op ?? 1 }); };
    const appear = (n, b) => t >= bt(b) - 0.04;
    // header
    { const dt = t - bt(7.5); const e = spring(dt + 0.02, 2.4, 8);
      place("logo", { y: (1 - e) * -40 * SP, s: 0.6 + 0.4 * e, op: appear("logo", 7.5) ? 1 : 0 });
      place("menu", { s: spring(dt + 0.02, 3, 8), op: appear("menu", 7.5) ? 1 : 0 }); }
    { const p = ez.outExpo(pr(t, 7.5, 0.4)); place("pill", { x: (1 - p) * -160 * SP, op: appear("pill", 7.5) ? 1 : 0 });
      P_.pill.holder.style.clipPath = `inset(0 ${(1 - p) * 100}% 0 0 round 999px)`; }
    ["h1-0", "h1-1", "h1-2"].forEach((n, i) => {
      const b = 6 + i * 0.5, p = ez.outExpo(pr(t, b - 0.04, 0.42));
      place(n, { y: (1 - p) * 34 * SP, op: appear(n, b) ? 1 : 0 });
      P_[n].holder.style.clipPath = `inset(0 0 ${(1 - p) * 100}% 0)`;
      P_[n].holder.style.transformOrigin = "0 100%";
    });
    { const p = ez.outCubic(pr(t, 8.5 - 0.04, 0.5)); place("para", { y: (1 - p) * 14 * SP, op: appear("para", 8.5) ? 1 : 0 }); P_.para.holder.style.clipPath = `inset(0 0 ${(1 - p) * 100}% 0)`; }
    { const dt = t - bt(9) + 0.03; const e = spring(dt, 2.6, 7); P_.cta.holder.style.transformOrigin = "50% 50%";
      place("cta", { y: (1 - ez.outExpo(clamp(dt / 0.4))) * 40 * SP, s: 0.35 + 0.65 * e, op: appear("cta", 9) ? 1 : 0 }); }
    { const p = ez.outCubic(pr(t, 9.25 - 0.04, 0.4)); place("note", { op: appear("note", 9.25) ? 1 : 0 }); P_.note.holder.style.clipPath = `inset(0 ${(1 - p) * 100}% 0 0)`; }
    { const p = ez.inOutExpo(pr(t, 9.5 - 0.06, 0.5)); place("photo", { op: appear("photo", 9.5) ? 1 : 0 });
      P_.photo.holder.style.clipPath = `inset(${(1 - p) * 50}% 0 ${(1 - p) * 50}% 0 round ${18 * SP}px)`;
      P_.photo.img.style.transform = `scale(${1 + (1 - ez.outCubic(pr(t, 9.5, 1.2))) * 0.18})`; P_.photo.img.style.transformOrigin = "50% 50%"; }
    [["badge+100", 10, -8], ["badge+40K", 10.5, 7], ["badge+30K", 11, -6]].forEach(([n, b, rot]) => {
      const dt = t - bt(b) + 0.03; const e = spring(dt, 2.8, 7.5);
      P_[n].holder.style.transformOrigin = "50% 50%";
      const bob = Math.sin((t - bt(b)) * 2 * Math.PI * 0.55) * 2.2 * SP * clamp(dt / 0.6);
      place(n, { y: bob, s: e, r: (1 - e) * rot, op: appear(n, b) ? 1 : 0 });
    });
  }

  /* feature box mapping: page point (fx,fy) sits at stage (sx,sy); k = stage px per page px */
  const FS = {};
  function mapState(box, k, fx, fy, sx, sy, radius, shiftX = 0) {
    Object.assign(FS, { box, k, fx, fy, sx: sx + shiftX, sy, shiftX });
    const B = S.feat.box, C = S.feat.content;
    B.style.left = box.x + shiftX + "px"; B.style.top = box.y + "px"; B.style.width = box.w + "px"; B.style.height = box.h + "px";
    B.style.borderRadius = radius + "px";
    C.style.transform = `translate(${sx - box.x - fx * k}px,${sy - box.y - fy * k}px) scale(${k / FL.S})`;
  }
  const toStage = (px, py) => [FS.sx + (px - FS.fx) * k_(), FS.sy + (py - FS.fy) * k_()];
  const k_ = () => FS.k;
  const lerpRect = (a, b, e) => ({ x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e), w: lerp(a.w, b.w, e), h: lerp(a.h, b.h, e) });
  // base (phone) <-> push (focus on a page rect) interpolation
  function frame(scrollY, e, focus, target, kp, shiftX = 0, full = 0, pushOverride = null) {
    const ph = FL.phone, Sb = FL.S;
    const bsx = ph.x + focus[0] * Sb, bsy = ph.y + (focus[1] - scrollY) * Sb;
    const pushBox = lerpRect(pushOverride || FL.push, { x: 0, y: 0, w: W, h: H }, full);
    const box = lerpRect(ph, pushBox, e);
    const k = Sb * Math.pow(kp / Sb, e);
    mapState(box, k, focus[0], focus[1], lerp(bsx, target[0], e), lerp(bsy, target[1], e), lerp(26 * Sb, 0, e), shiftX);
  }

  function cursorAt(t, x, y, { op = 1, press = 0, ring = 0 } = {}) {
    const C = S.cursor;
    T(C.c, { x, y, s: 1 - 0.16 * press, op });
    const rs = 0.5 + 0.5 * ring;
    T(C.ring, { x: x - (22 * C.k) * rs, y: y - (22 * C.k) * rs, s: rs, op: ring * op });
  }
  const bez = (a, c, b, u) => [(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]];

  function features(t) {
    const live = on(t, 11.78, 30.02);
    disp(S.feat.root, live); disp(S.tiles.root, on(t, 20.8, 24.3));
    if (!live) S.caps.forEach((c) => disp(c.root, false));
    disp(S.cursor.c.parentElement, live);
    if (!live) { vis(S.cursor.c, false); vis(S.cursor.ring, false); return; }
    const F = S.feat, Sf = FL.S, g = G;
    let cursor = null;
    const capAnim = (ci, b0, b1) => {
      const c = S.caps[ci];
      const active = t >= bt(b0) - 0.1 && t < bt(b1) + 0.3;
      disp(c.root, active);
      if (!active) return;
      const all = [...c.lab.words, ...c.title.words, ...c.sub.words];
      all.forEach((w, i) => {
        const inB = b0 + (i < c.lab.words.length ? 0 : i < c.lab.words.length + c.title.words.length ? 0.25 + (i - c.lab.words.length) * 0.25 : 2.5 + (i - c.lab.words.length - c.title.words.length) * 0.08);
        riseWord(w, clamp((t - bt(inB) + 0.03) / 0.35), clamp((t - bt(b1) + 0.02 * (all.length - i)) / 0.28), 0.18);
      });
    };
    const inF1 = t < bt(18), inF2 = on(t, 18, 24), inF3 = t >= bt(24);
    disp(F.f1, inF1); disp(F.f23, !inF1);
    capAnim(0, 12, 17.55); capAnim(1, 18, 23.45); capAnim(2, 24, 29.0);

    if (inF1) {
      const whipIn = 1 - ez.outExpo(pr(t, 11.8, 0.55));
      const push = ez.inOutExpo(pb(t, 15, 16.1));
      const lb = g.lightbox, th = g.thumb;
      const drift = ez.inOutCubic(pb(t, 16.1, 18)) * 0.06;
      frame(0, push, [lb.x + lb.w / 2, lb.y + lb.h / 2], [FL.push.x + FL.push.w / 2, FL.push.y + FL.push.h / 2],
        Math.min((FL.push.w * 0.94) / lb.w, (FL.push.h * 0.96) / lb.h) * (1 + drift), whipIn * W * 1.3);
      // tap -> real lightbox (circle reveal from the tap point + FLIP of the video from its thumbnail)
      const tap = [th.x + th.width / 2, th.y + th.height / 2];
      const o = ez.outExpo(pr(t, 14, 0.6));
      F.after.style.clipPath = `circle(${o * 1150 * Sf}px at ${tap[0] * Sf}px ${tap[1] * Sf}px)`;
      disp(F.after, t >= bt(14));
      const f = ez.outExpo(pr(t, 14, 0.55));
      const sx = lerp(th.width / lb.w, 1, f), sy = lerp(th.height / lb.h, 1, f);
      T(F.video, { x: lerp(th.x, lb.x, f) * Sf, y: lerp(th.y, lb.y, f) * Sf, sx, sy, op: t >= bt(14) ? 1 : 0 });
      const rp = clamp((t - bt(14)) / 0.45);
      T(F.ripple, { x: (tap[0] - 40 * (0.3 + rp)) * Sf, y: (tap[1] - 40 * (0.3 + rp)) * Sf, s: 0.3 + rp, op: t >= bt(14) ? 1 - rp : 0 });
      // cursor: glide in, tap on beat 14, leave
      if (on(t, 12.8, 15.6)) {
        const u = ez.inOutCubic(pb(t, 13, 13.85));
        const start = [400, 980], ctrl = [330, 560];
        let p = bez(start, ctrl, tap, u);
        const leave = ez.inExpo(pb(t, 14.9, 15.5));
        p = [p[0] + leave * 260, p[1] + leave * 520];
        const press = t >= bt(14) - 0.02 && t < bt(14) + 0.12 ? 1 : 0;
        cursor = { p: toStage(p[0], p[1]), press, op: t >= bt(12.8) ? 1 : 0 };
      }
    } else {
      // F2 + F3 share one real page: the "Bénéfice" section, scrolled for real
      const c1y = 751.72, c3y = 1299.72;
      let scroll = 0;
      if (t < bt(24.4)) scroll = 389 * ez.inOutCubic(pb(t, 19, 20));
      else scroll = 389 + 110.33 * [24.5, 25, 25.5].reduce((a, b) => a + ez.outExpo(pr(t, b - 0.02, 0.3)), 0);
      // card1 real icon loop
      const fi = Math.floor(Math.max(0, t - bt(18)) / 0.135) % 37;
      F.c1frames.forEach((e, i) => vis(e, i === fi));
      let e = 0, focus = [215, c1y + 104.5], target, kp, full = 0, pushO = null;
      if (inF2) {
        e = ez.inOutExpo(pb(t, 20.25, 21)) * (1 - ez.inOutExpo(pb(t, 23.5, 24.3)));
        target = by({ portrait: [W / 2, 860], square: [W / 2, 480], landscape: [940 + (W - 940) / 2, 400] });
        kp = by({ portrait: 2.4, square: 2.0, landscape: 2.2 });
        const hc = 209 * kp + 70;
        pushO = { x: FL.push.x, y: target[1] - hc / 2, w: FL.push.w, h: hc };
      } else {
        focus = [215, c3y + 150];
        e = ez.inOutExpo(pb(t, 27.4, 28.2));
        target = by({ portrait: [W / 2, 1180], square: [W / 2, 660], landscape: [940 + (W - 940) / 2, H / 2] });
        kp = by({ portrait: 2.45, square: 1.75, landscape: 2.25 });
        // zoom-through: into the dark gap between the real "3" and "x"
        const zt = ez.inExpo(pb(t, 29.15, 30.0));
        full = ez.inOutCubic(pb(t, 28.9, 29.6));
        if (t > bt(28.9)) {
          const big = g.card3.big;
          const gx = 20 + big.gapx, gy = c3y + big.gapy;
          const base = focus;
          focus = [lerp(base[0], gx, ez.inOutCubic(pb(t, 28.9, 29.5))), lerp(base[1], gy, ez.inOutCubic(pb(t, 28.9, 29.5)))];
          target = [lerp(target[0], W / 2, full), lerp(target[1], H / 2, full)];
          kp = kp * Math.pow(70, zt);
        }
      }
      frame(scroll, e, focus, target, kp, 0, full, pushO);
      // slab reveal handled globally; tiles (F2)
      tilesAt(t);
      // F3 overlays: "3x" pop + bars grow when the card scrolls in (as on the site)
      { const dt = t - bt(25.5) + 0.03; const s3 = t < bt(24) ? 1 : spring(dt, 2.4, 7);
        T(F.three, { x: g.card3.big.x * Sf, y: g.card3.big.y * Sf, s: s3, op: s3 > 0.01 ? 1 : 0 }); }
      F.bars.forEach(({ e: be, b }, i) => {
        const dt = t - bt(25.75 + i * 0.25) + 0.03;
        const sy = t < bt(24) ? 1 : Math.max(0, spring(dt, 2.2, 8));
        T(be, { x: b.x * Sf, y: b.y * Sf, sy: Math.max(sy, 0.0001), op: sy > 0.005 ? 1 : 0 });
      });
      // cursor: F2 drag (press, drag the page up 389 px, release), F3 wheel
      if (on(t, 18.3, 20.9)) {
        const grab = [300, 760];                                           // page point grabbed
        const enter = ez.outExpo(pb(t, 18.4, 19));
        const p = [grab[0] + (1 - enter) * 160, grab[1] + (1 - enter) * 300];
        const held = t >= bt(19) - 0.02 && t < bt(20);
        const leave = ez.inExpo(pb(t, 20.2, 20.8));
        const sp_ = toStage(p[0] + leave * 120, p[1] + leave * 260);
        cursor = { p: sp_, press: held ? 1 : 0, ring: held ? 1 : 0, op: 1 };
      }
      if (on(t, 24.0, 27.6)) {
        const enter = ez.outExpo(pb(t, 24.05, 24.45));
        const vy = 560 + scroll;                                           // fixed in the viewport while the page scrolls
        const leave = ez.inExpo(pb(t, 26.9, 27.5));
        cursor = { p: toStage(330 + (1 - enter) * 140 + leave * 140, vy + (1 - enter) * 200 + leave * 300), press: 0, op: 1 };
      }
    }
    if (cursor) cursorAt(t, cursor.p[0], cursor.p[1], { press: cursor.press, ring: cursor.ring || 0, op: cursor.op });
    else { vis(S.cursor.c, false); vis(S.cursor.ring, false); }
  }

  function tilesAt(t) {
    const TL = S.tiles;
    const live = on(t, 20.8, 24.3);
    if (!live) return;
    // launch point: the real "Publier" button on card 1
    const from = toStage(20 + 283.45 + 32, 751.72 + 86 + 14);
    const gap = TL.th * 0.09;
    const total = TL.tiles.reduce((a, x) => a + x.w, 0) + gap * 2;
    const baseY = by({ portrait: 1640, square: 1010, landscape: 1000 });
    const x0 = by({ portrait: (W - total) / 2, square: (W - total) / 2, landscape: 940 + (W - 940 - total) / 2 });
    let x = x0;
    TL.tiles.forEach((tl, i) => {
      const b = 21 + i * 0.5;
      const dt = t - bt(b) + 0.04;
      const e = spring(dt, 2.2, 7.5), m = ez.outExpo(clamp(dt / 0.45));
      const tx = x, ty = baseY - tl.h - TL.th * 0.12;
      x += tl.w + gap;
      const out = ez.inExpo(clamp((t - bt(23.45 + i * 0.12)) / 0.35));
      const px = lerp(from[0] - tl.w / 2, tx, m), py = lerp(from[1] - tl.h / 2, ty, m) + out * H * 0.7;
      T(tl.t, { x: px, y: py, s: 0.15 + 0.85 * e, r: (1 - e) * (i - 1) * 14 + out * (i - 1) * 20, op: dt > 0 ? 1 : 0 });
      tl.t.style.transformOrigin = `${tl.w / 2}px ${tl.h / 2}px`;
    });
  }

  function slab(t) {
    // F1 -> F2: a diagonal accent slab sweeps the frame; content swaps underneath at beat 18
    const p = pb(t, 17.45, 18.55);
    const live = p > 0 && p < 1;
    vis(S.slab.s, live);
    if (!live) return;
    const e = ez.inOutExpo(p);
    const y = lerp(H * 1.1, -H * 1.75, e);
    T(S.slab.s, { x: -W * 0.4, y, r: -9 });
  }

  function number(t) {
    const live = on(t, 29.98, 34.25);
    disp(S.num.root, live);
    const N = S.num;
    const sl = pb(t, 33.6, 34.02);
    T(S.slab.s2, { y: lerp(H * 1.02, -H * 0.05, ez.inOutExpo(sl)) });
    vis(S.slab.s2, sl > 0 && t < bt(34.1));
    if (!live) return;
    const enter = ez.outExpo(pr(t, 30, 0.45));
    const exit = ez.inExpo(pb(t, 33.55, 34));
    T(N.root, { x: 0, y: -exit * H * 0.55 });
    // count 0,0 -> 7,5 landing on beat 32
    const c = ez.outCubic(pb(t, 30, 32));
    const v = Math.round(c * 75) / 10;
    N.digits.textContent = v.toFixed(1).replace(".", ",");
    const s = lerp(1.7, 1, enter);
    T(N.line, { x: N.x, y: N.y, s, op: 1 });
    N.line.style.transformOrigin = "0% 50%";
    const m = ez.outExpo(clamp((t - bt(32) + 0.05) / 0.3));
    N.mplus.style.display = "inline-block";
    N.mplus.style.transform = `translateX(${(1 - m) * N.size * 1.4}px) scaleX(${1 + (1 - m) * 0.5})`;
    N.mplus.style.visibility = t >= bt(32) - 0.05 ? "visible" : "hidden";
    // label types on, mono, after the hit
    const nch = Math.floor(Math.max(0, t - bt(32.5)) / 0.028);
    N.label.textContent = N.labelText.slice(0, nch) + (nch > 0 && nch < N.labelText.length ? "▍" : "");
    T(N.label, { x: N.x + N.size * 0.03, y: N.y + N.size * 1.12 });
  }

  function logo(t) {
    const live = t >= bt(34) - 0.01;
    disp(S.logo.root, live);
    if (!live) return;
    const Lg = S.logo, Lw = Lg.Lw;
    // board lands
    const dt = t - bt(34) + 0.02;
    const e = spring(dt, 2.2, 7);
    T(Lg.board.d, { x: Lg.bx + (Lw * (1 - (0.55 + 0.45 * e))) / 2, y: Lg.by + (1 - ez.outExpo(clamp(dt / 0.5))) * H * 0.25, s: 0.55 + 0.45 * e, r: (1 - e) * -6 });
    // clapper arm: open wide, snap shut on beat 35, spring back to the logo's resting angle
    const tc = t - bt(35);
    let ang;
    if (tc < -0.07) ang = lerp(-12, -19, ez.outCubic(clamp((t - bt(34.55)) / (bt(35) - 0.07 - bt(34.55)))));
    else if (tc < 0) ang = lerp(-19, 24, ez.inExpo(clamp((tc + 0.07) / 0.07)));
    else if (tc < 0.08) ang = 24;
    else ang = 24 * (1 - spring(tc - 0.08, 2.0, 6.5));
    Lg.arm.setAttribute("transform", `rotate(${ang} 71 41)`);
    const bs = tc < 0 ? 0 : spring(tc, 2.6, 6);
    Lg.boom.setAttribute("transform", `translate(110 65) scale(${Math.max(0.0001, bs)}) translate(-110 -65)`);
    // wordmark + descriptor rise out of their masks
    const wm = ez.outExpo(pr(t, 35.15, 0.5)), sm = ez.outExpo(pr(t, 35.55, 0.5));
    Lg.wordm.d.style.overflow = "hidden"; Lg.subm.d.style.overflow = "hidden";
    T(Lg.wordm.d, { x: Lg.bx, y: Lg.by + Lg.board.h, op: t >= bt(35.15) ? 1 : 0 });
    T(Lg.subm.d, { x: Lg.bx, y: Lg.by + Lg.board.h + Lg.wordm.h, op: t >= bt(35.55) ? 1 : 0 });
    Lg.wordm.d.firstChild.style.transform = `translateY(${(1 - wm) * 105}%)`;
    Lg.subm.d.firstChild.style.transform = `translateY(${(1 - sm) * 105}%)`;
    // tagline, word by word on 16ths
    T(Lg.tag.root, { x: Lg.tx, y: Lg.ty });
    Lg.tag.words.forEach((w, i) => riseWord(w, clamp((t - bt(36 + i * 0.25) + 0.03) / 0.35), 0, 0.2));
    T(Lg.url.root, { x: Lg.ux, y: Lg.uy });
    Lg.url.words.forEach((w) => riseWord(w, clamp((t - bt(38) + 0.03) / 0.4), 0, 0.1));
  }

  function grain(t) {
    const f = FRAME;
    T(S.grain, { x: -Math.floor(hash(f, 3) * 256), y: -Math.floor(hash(f, 4) * 256), op: 0.16 });
  }

  /* ---------- boot ---------- */
  window.DURATION = DUR;
  window.FORMAT = FMT;
  window.ready = (async () => {
    const [beats, geo, svg] = await Promise.all([
      fetch("../beats.json").then((r) => r.json()),
      fetch("../assets/derived/geometry.json").then((r) => r.json()),
      fetch("../assets/brand/logo-white.svg").then((r) => r.text()),
    ]);
    BEATS = beats; BTS = beats.beats; PER = beats.period; G = geo;
    await document.fonts.load('700 100px Geist'); await document.fonts.load('800 100px Geist'); await document.fonts.load('400 100px Geist');
    await document.fonts.load('500 100px "Geist Mono"');
    await document.fonts.ready;
    buildFeed(); buildHook(); buildProduct(); buildFeatures(); buildNumber(); buildCursor(); buildSlab(); buildLogo(svg); buildGrain(); buildCues();
    await Promise.all([...URLS].map((u) => { const im = new Image(); im.src = u; return im.decode().catch(() => { throw new Error("image failed: " + u); }); }));
    window.CUES = CUES.map((c) => ({ ...c, t: bt(c.beat) }));
    window.BEAT_TIMES = BTS;
    window.seek = seek;
    seek(0);
    return { W, H, FMT, cues: CUES.length };
  })();
})();
