/* Création Virale — showreel v2 (30 s, 9:16). Everything is coded from the site's design tokens;
   b-roll comes from the agency's own videos as frame sequences. window.seek(t) paints frame t
   (returns a promise that resolves once any newly needed b-roll frame is decoded). */
(() => {
  const P = new URLSearchParams(location.search);
  const W = +(P.get("w") || 1080), H = +(P.get("h") || 1920);
  const A = "../assets/";
  // ---- site design tokens (read from creationvirale.com computed styles, assets/site-styles.json) ----
  const C = { bg: "#050505", card: "#141414", line: "#262626", muted: "#8F8F8F", white: "#FFFFFF", acc: "#2C5BFF", accSoft: "rgba(44,91,255,.12)" };
  const K = 2.3;                       // site CSS px -> frame px (430-wide phone layout fills the 1080 frame)
  const px = (v) => v * K;

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
    inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    outQuint: (t) => 1 - Math.pow(1 - t, 5),
  };
  const spring = (dt, f = 2.6, d = 7.5) => (dt <= 0 ? 0 : 1 - Math.exp(-d * dt) * Math.cos(2 * Math.PI * f * dt));

  /* ---------- measured beat grid ---------- */
  let BTS = [], PER = 0.5;
  const bt = (b) => { const n = BTS.length; if (b <= 0) return BTS[0] + b * PER; if (b >= n - 1) return BTS[n - 1] + (b - n + 1) * PER; const i = Math.floor(b); return BTS[i] + (b - i) * (BTS[i + 1] - BTS[i]); };
  const tb = (t) => (t - BTS[0]) / PER;
  const pr = (t, b, sec) => clamp((t - bt(b)) / sec);
  const pb = (t, b0, b1) => clamp((t - bt(b0)) / (bt(b1) - bt(b0)));
  const on = (t, b0, b1) => t >= bt(b0) && t < bt(b1);
  const CUES = [];
  const cue = (beat, type, gain = 1, pan = 0, extra = {}) => CUES.push({ beat, type, gain, pan, ...extra });

  /* ---------- DOM ---------- */
  const stage = document.getElementById("stage");
  Object.assign(stage.style, { width: W + "px", height: H + "px" });
  const el = (parent, css = {}, tag = "div", cls = "a") => { const e = document.createElement(tag); e.className = cls; Object.assign(e.style, css); parent.appendChild(e); return e; };
  const txt = (parent, s, css = {}) => { const e = el(parent, { whiteSpace: "pre", ...css }); e.textContent = s; return e; };
  const vis = (e, v) => { e.style.visibility = v ? "visible" : "hidden"; };
  const disp = (e, v) => { e.style.display = v ? "" : "none"; };
  function T(e, o = {}) {
    const { x = 0, y = 0, s = 1, sx = 1, sy = 1, r = 0, rx = 0, ry = 0, op = 1 } = o;
    e.style.transform = `translate3d(${x}px,${y}px,0) rotate(${r}deg) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s * sx},${s * sy})`;
    e.style.opacity = op;
    vis(e, op > 0.001);
  }
  const font = (size, weight = 700, family = "Geist", lh = 1.0, track = 0) => ({ font: `${weight} ${size}px/${lh} ${family}`, letterSpacing: `${track}em` });
  const mctx = document.createElement("canvas").getContext("2d");
  const measure = (s, size, weight = 700, family = "Geist", track = 0) => { mctx.font = `${weight} ${size}px ${family}`; mctx.letterSpacing = `${track * size}px`; return mctx.measureText(s).width; };

  // kinetic words (each in its own mask)
  function words(parent, lines, o) {
    const fam = o.family || "Geist", wt = o.weight || 700, tr = o.track ?? -0.035, lh = o.lh || 1.0;
    let size = o.size;
    if (!size) size = Math.min(o.max, (o.w / Math.max(...lines.map((l) => measure(l.join(" "), 100, wt, fam, tr)))) * 100);
    const root = el(parent, { width: (o.w || W) + "px" });
    const out = []; let y = 0, i = 0;
    lines.forEach((line, li) => {
      const row = el(root, { position: "absolute", left: 0, top: y + "px", width: "100%", display: "flex", gap: `0 ${0.24 * size}px`,
        justifyContent: o.align === "center" ? "center" : "flex-start", ...font(size, wt, fam, lh, tr), color: C.white }, "div", "");
      line.forEach((w) => {
        const pad = 0.22 * size;
        const m = el(row, { padding: `${pad}px 0.06em ${pad}px 0.02em`, margin: `${-pad}px -0.06em ${-pad}px -0.02em` }, "span", "mask");
        const ink = el(m, { color: o.color ? o.color(w, i) : C.white }, "span", "ink");
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

  /* ---------- b-roll: frame sequences, deterministic ---------- */
  let USES = {};
  const pending = [];
  function clip(parent, w, h, css = {}) {
    const box = el(parent, { width: w + "px", height: h + "px", overflow: "hidden", background: "#000", ...css });
    const img = el(box, { width: "100%", height: "100%", objectFit: "cover", display: "block" }, "img", "");
    img.decoding = "sync";
    return { box, img, cur: "" };
  }
  function frameOf(c, id, local) {
    const u = USES[id];
    const i = Math.max(0, Math.min(u.frames - 1, Math.floor(local * 30 + 1e-6))) + 1;
    const src = `${A}broll/frames/${id}/${String(i).padStart(4, "0")}.jpg`;
    if (c.cur !== src) { c.cur = src; c.img.src = src; pending.push(c.img.decode().catch(() => {})); }
  }

  /* ---------- coded site components ---------- */
  const LOGO_SVG = { text: "" };
  function logoMark(parent, w) {
    const d = el(parent, { width: w + "px", height: (w * 160) / 221 + "px" });
    d.innerHTML = LOGO_SVG.text.replace("<svg ", `<svg viewBox="0 0 221 160" width="${w}" height="${(w * 160) / 221}" `);
    return d;
  }
  const icon = {
    sparkle: (c) => `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M12 2l2.2 6.6L21 11l-6.8 2.4L12 20l-2.2-6.6L3 11l6.8-2.4z" fill="${c}"/><path d="M19 2l.8 2.2L22 5l-2.2.8L19 8l-.8-2.2L16 5l2.2-.8z" fill="${c}"/></svg>`,
    play: (c) => `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M7 4.5v15l12-7.5z" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/></svg>`,
    heart: (c) => `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M12 20s-7-4.3-9.2-8.6C1.2 8.1 3.1 4.5 6.6 4.5c2.1 0 3.4 1.2 4.1 2.4l1.3 1.9 1.3-1.9c.7-1.2 2-2.4 4.1-2.4 3.5 0 5.4 3.6 3.8 6.9C19 15.7 12 20 12 20z" fill="none" stroke="${c}" stroke-width="2"/></svg>`,
    eye: (c) => `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" fill="none" stroke="${c}" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="none" stroke="${c}" stroke-width="2"/></svg>`,
    arrow: (c) => `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M7 17L17 7M9 7h8v8" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    menu: (c) => `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M5 8h14M5 12h14M5 16h14" stroke="${c}" stroke-width="2" stroke-linecap="round"/></svg>`,
    chevron: (c) => `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M6 9l6 6 6-6" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    check: (c) => `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  };
  const ico = (parent, kind, size, color, css = {}) => { const d = el(parent, { width: size + "px", height: size + "px", ...css }); d.innerHTML = icon[kind](color); return d; };
  // pill (site: rounded-full, accent at 12% or card colour, 1px line)
  function pill(parent, label, { iconKind = null, size = 14, accent = false, h = 34 } = {}) {
    const p = el(parent, { height: px(h) + "px", padding: `0 ${px(14)}px`, borderRadius: "999px", display: "flex", alignItems: "center", gap: px(8) + "px",
      background: accent ? C.accSoft : C.card, border: `${px(1)}px solid ${C.line}`, boxSizing: "border-box", ...font(px(size), 500, "Geist", 1, 0), color: C.white, whiteSpace: "nowrap" });
    if (iconKind) ico(p, iconKind, px(size + 2), C.acc, { position: "relative" });
    const s = el(p, { position: "relative" }, "span", ""); s.textContent = label;
    return p;
  }
  function card(parent, w, h, css = {}) {
    return el(parent, { width: w + "px", height: h + "px", background: C.card, border: `${px(1)}px solid ${C.line}`, borderRadius: px(20) + "px", boxSizing: "border-box", overflow: "hidden", ...css });
  }
  function button(parent, label, { w = null, dark = false } = {}) {
    const b = el(parent, { height: px(50.5) + "px", padding: `0 ${px(28)}px`, borderRadius: "999px", display: "flex", alignItems: "center", justifyContent: "center", gap: px(8) + "px",
      background: dark ? "#9a9a9a" : C.white, color: C.bg, ...font(px(15), 500, "Geist", 1, 0), whiteSpace: "nowrap", boxSizing: "border-box", ...(w ? { width: w + "px" } : {}) });
    const s = el(b, { position: "relative" }, "span", ""); s.textContent = label;
    ico(b, "arrow", px(16), C.bg, { position: "relative" });
    return b;
  }

  /* ---------- layers ---------- */
  const cam = el(stage, { width: W + "px", height: H + "px", transformOrigin: "50% 50%" });
  const layer = (z) => el(cam, { width: W + "px", height: H + "px", zIndex: z });
  const S = {};

  /* ===== S1 hook (b0-6) ===== */
  function buildHook() {
    const root = layer(2);
    const feed = el(root, { width: W + "px", height: H + "px", transformOrigin: "50% 50%" });
    const cols = 3, gap = 22, cw = 330, ch = cw * 16 / 9;
    const tiles = [];
    for (let c = 0; c < cols; c++) for (let r = 0; r < 4; r++) {
      const id = `hook${(c * 2 + r) % 6}`;
      const k = clip(feed, cw, ch, { borderRadius: "22px" });
      tiles.push({ k, id, c, r, x: (W - (cols * cw + (cols - 1) * gap)) / 2 + c * (cw + gap) });
    }
    feed.style.filter = "grayscale(1) brightness(.32) contrast(1.1)";
    const scrim = el(root, { width: W + "px", height: H + "px", background: "linear-gradient(180deg, rgba(5,5,5,.0) 0%, rgba(5,5,5,.55) 45%, rgba(5,5,5,.55) 70%, rgba(5,5,5,0) 100%)" });
    const m = 64;
    const lines = [["Votre"], ["business"], ["mérite"], ["d'exploser."]];
    const tb_ = words(root, lines, { w: W - 2 * m - 40, max: 200, weight: 800, track: -0.045, lh: 0.92, color: (w) => (w === "d'exploser." ? C.acc : C.white) });
    T(tb_.root, { x: m, y: (H - tb_.height) / 2 - 40 });
    // d'exploser. letters for the burst-assemble
    const last = tb_.words[3];
    last.ink.textContent = "";
    const letters = [...("d'exploser.")].map((ch) => { const s = el(last.ink, { display: "inline-block", position: "relative" }, "span", ""); s.textContent = ch; return s; });
    // "Voici comment."
    const vc = words(root, [["Voici"], ["comment."]], { size: 150, weight: 700, track: -0.04, lh: 0.95 });
    T(vc.root, { x: m, y: H * 0.42 });
    S.hook = { root, feed, tiles, cw, ch, gap, text: tb_, letters, vc, scrim };
  }
  function hook(t) {
    const live = t < bt(8.02);
    disp(S.hook.root, live);
    if (!live) return;
    const Hk = S.hook;
    const step = Hk.ch + Hk.gap;
    // feed: plays, and flicks up one notch per beat (b0-5); slows into "Voici comment."
    const flick = (tc) => { const k = Math.floor(tb(tc)); return (Math.max(k, -1) + ez.outExpo(clamp((tc - bt(k)) / 0.32))) * 0.42; };
    Hk.tiles.forEach((tl) => {
      const tc = t - tl.c * 0.04;
      const o = (flick(Math.min(tc, bt(6))) * step + tl.c * 140) % (4 * step);
      let y = tl.r * step - o; if (y < -step) y += 4 * step;
      T(tl.k.box, { x: tl.x, y: y - 120 });
      frameOf(tl.k, tl.id, Math.max(0, t) + tl.c * 0.37);
    });
    const outP = ez.inExpo(pb(t, 5.35, 6.0));
    T(Hk.feed, { s: 1 + outP * 0.06, op: 1 - outP * 0.85 });
    // words: b0 Votre, b1 business, b2 mérite, b3 d'exploser. (letters burst in from scatter)
    const W_ = Hk.text.words;
    for (let i = 0; i < 3; i++) rise(W_[i], clamp((t - bt(i) + 0.035) / 0.3), ez.outCubic(pb(t, 5.4, 6.0)));
    vis(W_[3].m, t >= bt(3) - 0.06 && t < bt(6));
    Hk.letters.forEach((s, j) => {
      const dt = t - bt(3) + 0.05;
      const e = spring(dt, 2.2, 7.5);
      const ang = hash(j, 31) * Math.PI * 2, dist = 260 + hash(j, 32) * 360;
      const x = Math.cos(ang) * dist * (1 - e), y = Math.sin(ang) * dist * (1 - e), r = (hash(j, 33) - 0.5) * 140 * (1 - e);
      const out = ez.inExpo(pb(t, 5.4, 6.0));
      s.style.transform = `translate(${x}px,${y - out * 300}px) rotate(${r}deg) scale(${0.4 + 0.6 * clamp(e, 0, 1.2)})`;
      s.style.opacity = clamp(dt / 0.06) * (1 - out);
    });
    T(Hk.text.root, { x: 64, y: (H - Hk.text.height) / 2 - 40 - ez.inExpo(pb(t, 5.4, 6.0)) * 220 });
    // Voici comment.
    Hk.vc.words.forEach((w, i) => rise(w, clamp((t - bt(6 + i) + 0.035) / 0.3), ez.inExpo(pb(t, 7.72, 8.0))));
    Hk.scrim.style.opacity = 1;
  }

  /* ===== S3 burst (b8-12): eight cuts on 8ths ===== */
  function buildBurst() {
    const root = layer(3);
    const k = clip(root, W, H);
    S.burst = { root, k };
  }
  function burst(t) {
    const live = on(t, 8 - 0.02, 12);
    disp(S.burst.root, live);
    if (!live) return;
    const i = clamp(Math.floor((tb(t) - 8) * 2), 0, 7);
    const b0 = 8 + i * 0.5, local = t - bt(b0);
    frameOf(S.burst.k, `burst${i}`, Math.max(0, local));
    const punch = 1 + 0.1 * Math.exp(-Math.max(0, local) / 0.09);
    const rot = (i % 2 ? 1 : -1) * 1.6 * Math.exp(-Math.max(0, local) / 0.12);
    T(S.burst.k.box, { s: punch, r: rot });
    S.burst.k.box.style.transformOrigin = "50% 50%";
  }

  /* ===== S4 hero (b11.5-18): coded site hero ===== */
  function buildHero() {
    const root = layer(4);
    const page = el(root, { width: W + "px", height: H + "px", background: `radial-gradient(120% 60% at 50% 0%, #0c1022 0%, ${C.bg} 60%)` });
    const X = px(20);
    const header = el(page, {});
    const logo = logoMark(header, px(50)); T(logo, { x: X, y: px(14) + 70 });
    const menu = el(header, { width: px(40) + "px", height: px(40) + "px", borderRadius: "999px", background: C.card, border: `${px(1)}px solid ${C.line}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" });
    ico(menu, "menu", px(18), C.white, { position: "relative" });
    T(menu, { x: W - X - px(40), y: px(12) + 70 });
    const pl = pill(page, "Agence de production vidéo à Québec", { iconKind: "sparkle", accent: true, size: 13, h: 34 });
    const h1 = el(page, { width: W - 2 * X + "px", ...font(px(38.4), 700, "Geist", 0.98, -0.035), color: C.white });
    h1.innerHTML = `<div class="l">Création de contenu</div><div class="l">vidéo <span style="color:${C.muted}">pour les</span></div><div class="l" style="color:${C.muted}">entreprises à Québec.</div>`;
    const h1lines = [...h1.querySelectorAll(".l")].map((l) => { l.style.overflow = "hidden"; l.style.paddingBottom = "0.12em"; l.style.marginBottom = "-0.12em"; const inner = document.createElement("div"); inner.innerHTML = l.innerHTML; l.innerHTML = ""; l.appendChild(inner); return inner; });
    const cta = button(page, "Démarrer mon projet");
    const photoW = W - 2 * X, photoH = px(293);
    const photo = clip(page, photoW, photoH, { borderRadius: px(18) + "px" });
    const badge = (label, kind) => { const b = el(page, { height: px(38) + "px", padding: `0 ${px(14)}px`, borderRadius: "999px", background: "rgba(10,10,10,.82)", border: `${px(1)}px solid ${C.line}`, boxSizing: "border-box", display: "flex", alignItems: "center", gap: px(8) + "px", ...font(px(14), 500, "Geist", 1, 0), color: C.white }); ico(b, kind, px(16), C.acc, { position: "relative" }); const s = el(b, { position: "relative" }, "span", ""); s.textContent = label; b.style.transformOrigin = "50% 50%"; return b; };
    const badges = [badge("+100", "play"), badge("+40K", "heart"), badge("+30K", "eye")];
    // layout (site rhythm, compressed: paragraph and note dropped)
    const L_ = { pill: [X, 330], h1: [X, 330 + px(34) + px(22)], cta: [X, 0], photo: [X, 0] };
    L_.cta[1] = L_.h1[1] + px(38.4) * 0.98 * 3 + px(28);
    L_.photo[1] = L_.cta[1] + px(50.5) + px(36);
    T(pl, { x: L_.pill[0], y: L_.pill[1] }); T(h1, { x: L_.h1[0], y: L_.h1[1] }); T(cta, { x: L_.cta[0], y: L_.cta[1] }); T(photo.box, { x: L_.photo[0], y: L_.photo[1] });
    const bpos = [[L_.photo[0] + px(14), L_.photo[1] + px(14)], [L_.photo[0] + photoW - px(100), L_.photo[1] + px(120)], [L_.photo[0] + px(-6), L_.photo[1] + photoH - px(58)]];
    S.hero = { root, page, logo, menu, pl, h1lines, cta, photo, badges, bpos, L: L_, photoW, photoH };
  }
  function hero(t) {
    const live = on(t, 11.6, 18.6);
    disp(S.hero.root, live);
    if (!live) return;
    const Hr = S.hero, L_ = Hr.L;
    // match cut: the last burst clip shrinks into the hero photo frame
    const m = ez.inOutExpo(pb(t, 11.6, 12.25));
    const fx = lerp(0, L_.photo[0], m), fy = lerp(0, L_.photo[1], m), fw = lerp(W, Hr.photoW, m), fh = lerp(H, Hr.photoH, m);
    Hr.photo.box.style.width = fw + "px"; Hr.photo.box.style.height = fh + "px";
    Hr.photo.box.style.borderRadius = lerp(0, px(18), m) + "px";
    T(Hr.photo.box, { x: fx, y: fy });
    frameOf(Hr.photo, t < bt(12) ? "burst7" : "hero", t < bt(12) ? 0.49 : t - bt(12));
    Hr.page.style.background = m < 1 ? `rgba(5,5,5,${m})` : `radial-gradient(120% 60% at 50% 0%, #0c1022 0%, ${C.bg} 60%)`;
    // pieces land on beats
    const pop = (e, b, from = {}) => { const dt = t - bt(b) + 0.03; const s = spring(dt, 2.6, 7.5); T(e, { ...from.base, s: from.s0 !== undefined ? lerp(from.s0, 1, s) : 1, y: (from.base?.y || 0) + (1 - ez.outExpo(clamp(dt / 0.4))) * (from.dy || 0), op: dt > 0 ? 1 : 0 }); };
    pop(Hr.logo, 12, { base: { x: px(20), y: px(14) + 70 }, dy: -40 });
    pop(Hr.menu, 12, { base: { x: W - px(20) - px(40), y: px(12) + 70 }, s0: 0.3 });
    { const p = ez.outExpo(pr(t, 12.5 - 0.03, 0.4)); T(Hr.pl, { x: L_.pill[0] + (1 - p) * -120, y: L_.pill[1], op: t >= bt(12.5) - 0.03 ? 1 : 0 }); Hr.pl.style.clipPath = `inset(0 ${(1 - p) * 100}% 0 0 round 999px)`; }
    Hr.h1lines.forEach((l, i) => { const p = ez.outExpo(pr(t, 13 + i * 0.5 - 0.03, 0.45)); l.style.transform = `translateY(${(1 - p) * 110}%)`; });
    { Hr.cta.style.transformOrigin = "0% 50%"; pop(Hr.cta, 14.5, { base: { x: L_.cta[0], y: L_.cta[1] }, s0: 0.4, dy: 30 }); }
    Hr.badges.forEach((b, i) => { const [x, y] = Hr.bpos[i]; const bb = 15 + i * 0.5; const dt = t - bt(bb) + 0.03; const e = spring(dt, 2.8, 7.5);
      T(b, { x, y: y + Math.sin((t - bt(bb)) * Math.PI * 1.1) * 4 * clamp(dt / 0.6), s: e, r: (1 - e) * (i % 2 ? 8 : -8), op: dt > 0 ? 1 : 0 }); });
    // exit: the page scrolls up into the process section
    const sc = ez.inOutExpo(pb(t, 17.55, 18.3));
    const drift = ez.inOutCubic(pb(t, 12.5, 17.5));
    T(Hr.page, { y: -sc * H * 1.05 - drift * 40, s: 1 });
  }

  /* ===== S5 process (b18-30): four coded step cards, a client clip in each ===== */
  const STEPS = [
    ["01", "Stratégie", "On analyse votre entreprise, votre clientèle\net vos objectifs.", "step-strat"],
    ["02", "Production", "Photo et vidéo pro, avec coaching\ndevant la caméra.", "step-prod"],
    ["03", "Montage", "Montage dynamique, sous-titres, musique\net formats verticaux.", "step-mont"],
    ["04", "Diffusion", "On publie sur les bonnes plateformes,\nau bon moment.", "step-diff"],
  ];
  function buildProcess() {
    const root = layer(5);
    root.style.background = C.bg;
    const X = px(20);
    const kicker = pill(root, "Notre approche", { size: 13, h: 34 });
    T(kicker, { x: X, y: 250 });
    const head = words(root, [["Une", "stratégie", "derrière"], ["chaque", "contenu."]], { size: px(30), weight: 700, track: -0.035, lh: 1.0, w: W - 2 * X });
    T(head.root, { x: X, y: 250 + px(34) + px(18) });
    const cw = W - 2 * X, chh = 1080;
    const cards = STEPS.map(([num, title, desc, id]) => {
      const c = card(root, cw, chh);
      const n = txt(c, num, { ...font(px(12), 500, "Geist Mono", 1, 0.04), color: C.acc }); T(n, { x: px(24), y: px(24) });
      const ti = txt(c, title, { ...font(px(24), 600, "Geist", 1, -0.025), color: C.white }); T(ti, { x: px(24), y: px(24) + px(22) });
      const de = txt(c, desc, { ...font(px(13), 400, "Geist", 1.45, 0), color: C.muted }); T(de, { x: px(24), y: px(24) + px(22) + px(36) });
      const vw = cw - 2 * px(24), vh = chh - (px(24) + px(22) + px(36) + px(46)) - px(24);
      const k = clip(c, vw, vh, { borderRadius: px(14) + "px" }); T(k.box, { x: px(24), y: chh - px(24) - vh });
      c.style.transformOrigin = "50% 50%";
      return { c, k, id };
    });
    const dots = el(root, { display: "flex", gap: "14px" });
    const dl = STEPS.map(() => el(dots, { width: "14px", height: "14px", borderRadius: "999px", background: C.line, position: "relative" }, "div", ""));
    S.proc = { root, kicker, head, cards, cw, chh, cy: 250 + px(34) + px(18) + px(30) * 2 + 60, X, dots, dl };
    T(dots, { x: (W - (4 * 14 + 3 * 14)) / 2, y: S.proc.cy + chh + 40 });
  }
  function process(t) {
    const live = on(t, 17.6, 30.6);
    disp(S.proc.root, live);
    if (!live) return;
    const Pr = S.proc;
    const enter = ez.inOutExpo(pb(t, 17.55, 18.3));
    T(Pr.root, { y: (1 - enter) * H * 1.05 });
    rise({ m: Pr.kicker, ink: Pr.kicker }, 1); vis(Pr.kicker, true); Pr.kicker.style.transform = `translate3d(${Pr.X}px,250px,0)`;
    Pr.head.words.forEach((w, i) => rise(w, clamp((t - bt(18.25 + i * 0.25) + 0.03) / 0.35)));
    // carousel: card i active on [18+3i, 21+3i), whip to the next on the beat
    Pr.cards.forEach((cd, i) => {
      const b0 = 18 + i * 3;
      const inP = i === 0 ? ez.outExpo(pr(t, 18.5 - 0.03, 0.5)) : ez.inOutExpo(pb(t, b0 - 0.35, b0 + 0.15));
      const outP = i === 3 ? 0 : ez.inOutExpo(pb(t, b0 + 3 - 0.35, b0 + 3 + 0.15));
      const x = Pr.X + (i === 0 ? 0 : (1 - inP) * W * 1.05) - outP * W * 1.05;
      const y = Pr.cy + (i === 0 ? (1 - inP) * 260 : 0);
      T(cd.c, { x, y, ry: (i === 0 ? 0 : (1 - inP) * -18) + outP * 18, s: 1 - 0.06 * (outP + (i === 0 ? 0 : 1 - inP)), op: (i === 0 ? inP > 0 : t > bt(b0 - 0.4)) && outP < 1 ? 1 : 0 });
      if (t > bt(b0 - 0.4) && t < bt(b0 + 3.2)) frameOf(cd.k, cd.id, Math.max(0, t - bt(b0 - 0.4)));
      Pr.dl[i].style.background = tb(t) >= b0 - 0.1 ? C.acc : C.line;
      Pr.dl[i].style.width = (tb(t) >= b0 - 0.1 && tb(t) < b0 + 2.9 ? 34 : 14) + "px";
    });
    // exit at drop 2: active card zooms into its own clip (match into the explosion)
    const z = ez.inExpo(pb(t, 29.4, 30.0));
    Pr.root.style.transformOrigin = "50% 60%";
    if (z > 0) T(Pr.root, { s: 1 + z * 2.6, op: 1 });
  }

  /* ===== S6 explosion (b30-33): one clip -> 4 -> 16 -> 64, "Et ça explose." ===== */
  function buildBoom() {
    const root = layer(6);
    root.style.background = C.bg;
    const big = clip(root, W, H);
    const tiles = [];
    for (let i = 0; i < 64; i++) tiles.push(clip(root, 10, 10, { borderRadius: "6px" }));
    const tw = words(root, [["Et", "ça"], ["explose."]], { size: 210, weight: 800, track: -0.045, lh: 0.92, color: (w) => (w === "explose." ? C.white : C.white) });
    T(tw.root, { x: 64, y: H * 0.36 });
    tw.root.style.filter = "drop-shadow(0 12px 40px rgba(0,0,0,.6))";
    S.boom = { root, big, tiles, tw };
  }
  function boom(t) {
    const live = on(t, 29.98, 33.4);
    disp(S.boom.root, live);
    if (!live) return;
    const Bm = S.boom;
    const lvl = tb(t) < 31 ? 0 : tb(t) < 32 ? 1 : tb(t) < 32.5 ? 2 : 3;     // 1, 4, 16, 64
    const n = [1, 2, 4, 8][lvl];
    vis(Bm.big.box, lvl === 0);
    if (lvl === 0) { frameOf(Bm.big, "boom", t - bt(30)); const s = 1.25 - 0.25 * ez.outExpo(pr(t, 30, 0.5)); T(Bm.big.box, { s }); Bm.big.box.style.transformOrigin = "50% 50%"; }
    const lb = [30, 31, 32, 32.5][lvl];
    const settle = ez.outExpo(pr(t, lb - 0.02, 0.35));
    const out = ez.inExpo(pb(t, 32.85, 33.35));
    const gap = 8, tw = (W - gap * (n + 1)) / n, th = (H - gap * (n + 1)) / n;
    Bm.tiles.forEach((k, i) => {
      if (lvl === 0 || i >= n * n) { vis(k.box, false); return; }
      const r = Math.floor(i / n), c = i % n;
      const x = gap + c * (tw + gap), y = gap + r * (th + gap);
      // split from the centre outwards, then everything flies out radially
      const cx = x + tw / 2 - W / 2, cy = y + th / 2 - H / 2;
      const s0 = lerp(1.6, 1, settle);
      k.box.style.width = tw + "px"; k.box.style.height = th + "px";
      T(k.box, { x: W / 2 + cx * s0 - tw / 2 + cx * out * 2.2, y: H / 2 + cy * s0 - th / 2 + cy * out * 2.2, r: out * (hash(i, 9) - 0.5) * 60, s: 1 + out * 0.4, op: 1 });
      frameOf(k, `tile${i % 24}`, Math.max(0, t - bt(31)) + (i % 5) * 0.2);
    });
    Bm.root.style.background = C.bg;
    Bm.tw.words.forEach((w, i) => rise(w, clamp((t - bt(31 + i * 0.5) + 0.03) / 0.3), out));
  }

  /* ===== S7 results (b33-44): three growth cards + 7,5 M+ ===== */
  const RES = [
    { id: "res-sushi", client: "Sushi X", mult: "59×", label: "plus de vues Instagram\nen deux mois", from: 8873, to: 520337, plat: "Instagram", bars: [4.5, 3.3, 1.9, 156, 40.5, 21] },
    { id: "res-chalet", client: "Au Petit Chalet", mult: "18×", label: "plus de vues Facebook", from: 11906, to: 216266, plat: "Facebook", bars: [8.1, 7.8, 7.2, 40, 21.4, 21.2] },
    { id: "res-mex", client: "Mexicanos", mult: "14×", label: "plus de vues TikTok\nen un mois", from: 18218, to: 261432, plat: "TikTok", bars: [3.1, 2.9, 2.4, 297, 30.4, 27.5] },
  ];
  const fmt = (v) => Math.round(v).toLocaleString("fr-CA").replace(/ | /g, " ");
  function buildResults() {
    const root = layer(7);
    root.style.background = C.bg;
    const bg = clip(root, W, H); bg.box.style.filter = "blur(26px) brightness(.38) saturate(1.2)"; bg.box.style.transform = "scale(1.15)";
    const X = px(20), cw = W - 2 * X, chh = 1020;
    const cards = RES.map((r) => {
      const c = card(root, cw, chh, { background: "rgba(20,20,20,.94)" });
      const p = pill(c, `Résultat client  ·  ${r.client}`, { size: 14, h: 36 }); T(p, { x: px(24), y: px(24) });
      const m = txt(c, r.mult, { ...font(px(64), 700, "Geist", 1, -0.05), color: C.white }); T(m, { x: px(24), y: px(24) + px(36) + px(26) });
      const lab = txt(c, r.label, { ...font(px(15), 400, "Geist", 1.35, 0), color: C.muted }); T(lab, { x: px(24) + measure(r.mult, px(64), 700, "Geist", -0.05) + px(16), y: px(24) + px(36) + px(26) + px(16) });
      // before / after bars (real view counts from the site's result cards, in thousands)
      const chartY = px(24) + px(36) + px(26) + px(64) + px(34), chartH = 300, bw = (cw - 2 * px(24) - 5 * 18) / 6;
      const maxv = Math.max(...r.bars);
      const bars = r.bars.map((v, i) => {
        const b = el(c, { width: bw + "px", height: Math.max(16, (v / maxv) * chartH) + "px", borderRadius: "10px 10px 4px 4px",
          background: i < 3 ? "#2a2a2a" : `linear-gradient(180deg, ${C.acc}, #1b3aa8)`, transformOrigin: "50% 100%" });
        return { b, x: px(24) + i * (bw + 18), y: chartY + chartH - Math.max(16, (v / maxv) * chartH) };
      });
      const tagA = txt(c, "Avant", { ...font(px(11), 500, "Geist Mono", 1, 0.04), color: C.muted }); T(tagA, { x: px(24), y: chartY + chartH + 18 });
      const tagB = txt(c, "Après", { ...font(px(11), 500, "Geist Mono", 1, 0.04), color: C.acc }); T(tagB, { x: px(24) + 3 * (bw + 18), y: chartY + chartH + 18 });
      const views = txt(c, "", { ...font(px(22), 600, "Geist", 1, -0.03), color: C.white, fontVariantNumeric: "tabular-nums" }); T(views, { x: px(24), y: chartH + chartY + 80 });
      const plat = txt(c, `vues · ${r.plat}`, { ...font(px(13), 400, "Geist", 1, 0), color: C.muted }); T(plat, { x: px(24), y: chartH + chartY + 80 + px(30) });
      c.style.transformOrigin = "50% 50%";
      return { c, bars, views, m, r };
    });
    const big = el(root, { ...font(330, 700, "Geist", 1, -0.04), color: C.white, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" });
    const d = el(big, {}, "span", "ink"); const sp = el(big, {}, "span", "ink"); sp.textContent = " "; const mp = el(big, { color: C.acc }, "span", "ink"); mp.textContent = "M+";
    const lab = txt(root, "", { ...font(44, 500, "Geist Mono", 1.2, 0.01), color: C.white });
    S.res = { root, bg, cards, X, cy: (H - chh) / 2 - 40, chh, big, d, mp, lab };
  }
  function results(t) {
    const live = on(t, 32.9, 44.6);
    disp(S.res.root, live);
    if (!live) return;
    const R_ = S.res;
    const ci = clamp(Math.floor((tb(t) - 33) / 3), 0, 2);
    const inBig = t >= bt(42);
    vis(R_.bg.box, !inBig);
    if (!inBig) frameOf(R_.bg, RES[ci].id, Math.max(0, t - bt(33 + ci * 3)));
    R_.cards.forEach((cd, i) => {
      const b0 = 33 + i * 3;
      const inP = ez.inOutExpo(pb(t, b0 - 0.3, b0 + 0.2)), outP = ez.inOutExpo(pb(t, b0 + 3 - 0.3, b0 + 3 + 0.2));
      const y = R_.cy + (1 - inP) * H * 0.9 - outP * H * 0.9;
      T(cd.c, { x: R_.X, y, s: 1 - 0.08 * outP, r: (1 - inP) * 3 - outP * 3, op: inP > 0 && outP < 1 ? 1 : 0 });
      const mE = spring(t - bt(b0 + 0.25) + 0.03, 2.4, 7);
      cd.m.style.transformOrigin = "0% 80%"; T(cd.m, { x: px(24), y: px(24) + px(36) + px(26), s: 0.6 + 0.4 * mE });
      cd.bars.forEach((bb, j) => { const e = spring(t - bt(b0 + (j < 3 ? 0.5 : 1.25) + (j % 3) * 0.125) + 0.03, 2.2, 8); T(bb.b, { x: bb.x, y: bb.y, sy: Math.max(0.0001, e), op: e > 0.01 ? 1 : 0 }); });
      const c = ez.outCubic(pb(t, b0 + 1.0, b0 + 2.25));
      cd.views.textContent = `${fmt(cd.r.from)}  →  ${fmt(lerp(cd.r.from, cd.r.to, c))}`;
    });
    // 7,5 M+ (b42-44)
    vis(R_.big, inBig); vis(R_.lab, inBig);
    if (inBig) {
      const c = ez.outCubic(pb(t, 42, 43));
      R_.d.textContent = (Math.round(c * 75) / 10).toFixed(1).replace(".", ",");
      const e = ez.outExpo(pr(t, 42, 0.4)), ex = ez.inExpo(pb(t, 43.6, 44.1));
      T(R_.big, { x: 60, y: H * 0.36 - ex * 400, s: lerp(1.5, 1, e) * (1 - ex * 0.3), op: 1 - ex });
      R_.big.style.transformOrigin = "0% 50%";
      R_.mp.style.display = "inline-block";
      const m = ez.outExpo(clamp((t - bt(43) + 0.05) / 0.3));
      R_.mp.style.transform = `translateX(${(1 - m) * 400}px) scaleX(${1 + (1 - m) * 0.5})`; vis(R_.mp, t >= bt(43) - 0.05);
      const s = "Vues générées pour nos clients", nch = Math.floor(Math.max(0, t - bt(43.25)) / 0.022);
      R_.lab.textContent = s.slice(0, nch);
      T(R_.lab, { x: 70, y: H * 0.36 + 360 - ex * 400, op: 1 - ex });
    }
  }

  /* ===== S8 contact form (b44-54) ===== */
  const NAME = "Jean Tremblay", MAIL = "jean@entreprise.com", MSG = "On veut des Reels qui cartonnent.";
  const TYPE = { name: [45.25, 1 / 8], mail: [47.25, 1 / 8], msg: [50.75, 1 / 16] };  // start beat, beats per character
  function buildForm() {
    const root = layer(8);
    root.style.background = C.bg;
    const X = px(20);
    const kick = pill(root, "Nous joindre", { size: 13, h: 34 }); T(kick, { x: X, y: 230 });
    const h2 = words(root, [["Parlez-nous", "de", "vos", "idées."]], { size: px(24), weight: 600, track: -0.025, w: W - 2 * X });
    T(h2.root, { x: X, y: 230 + px(34) + px(18) });
    const fw = W - 2 * X, pad = px(24), iw = fw - 2 * pad;
    const form = card(root, fw, 10, { overflow: "visible" });
    const fields = [];
    let y = pad;
    const field = (label, ph, h = 46, kind = "input") => {
      const lab = txt(form, label, { ...font(px(13), 400, "Geist", 1, 0), color: C.muted }); T(lab, { x: pad, y });
      y += px(13) + px(8);
      const box = el(form, { width: iw + "px", height: px(h) + "px", background: C.card, border: `${px(1)}px solid ${C.line}`, borderRadius: px(12) + "px", boxSizing: "border-box" });
      T(box, { x: pad, y });
      const val = txt(box, "", { ...font(px(14), 400, "Geist", 1.4, 0), color: C.white, whiteSpace: kind === "area" ? "pre-wrap" : "pre", width: iw - 2 * px(16) + "px" });
      T(val, { x: px(16), y: px(13) });
      const phd = txt(box, ph, { ...font(px(14), 400, "Geist", 1.4, 0), color: "#5c5c5c" }); T(phd, { x: px(16), y: px(13) });
      const caret = el(box, { width: px(1.5) + "px", height: px(18) + "px", background: C.white });
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
    const btn = button(form, "Envoyer ma demande", { w: iw, dark: true }); T(btn, { x: pad, y }); btn.style.transformOrigin = "50% 50%";
    const by = y; y += px(50.5) + pad;
    form.style.height = y + "px";
    // dropdown (coded in the site's dark style)
    const dd = card(form, iw, px(4 * 40 + 12), { borderRadius: px(12) + "px", background: "#101010", boxShadow: "0 30px 80px rgba(0,0,0,.6)", zIndex: 5 });
    const opts = ["Vidéos Reels", "Vidéos publicitaires", "Vidéos corporatives", "Photos"].map((o, i) => {
      const r = el(dd, { width: iw - px(12) + "px", height: px(38) + "px", borderRadius: px(8) + "px" }); T(r, { x: px(6), y: px(6) + i * px(40) });
      const s = txt(r, o, { ...font(px(14), 400, "Geist", 1, 0), color: C.white }); T(s, { x: px(12), y: px(12) });
      return r;
    });
    T(dd, { x: pad, y: fSel.y0 + px(46) + px(6) });
    // success state
    const ok = el(form, { width: px(50.5) + "px", height: px(50.5) + "px", borderRadius: "999px", background: C.acc, display: "flex", alignItems: "center", justifyContent: "center" });
    ico(ok, "check", px(26), C.white, { position: "relative" });
    T(ok, { x: pad + (iw - px(50.5)) / 2, y: by }); ok.style.transformOrigin = "50% 50%";
    const msg = txt(form, "Message envoyé ✓ — On vous revient rapidement.", { ...font(px(14), 500, "Geist", 1, 0), color: C.white });
    T(msg, { x: pad + (iw - measure("Message envoyé ✓ — On vous revient rapidement.", px(14), 500)) / 2, y: by + px(64) });
    S.form = { root, kick, h2, form, fw, fields, fName, fMail, fSel, fMsg, btn, by, dd, opts, ok, msg, X, iw, pad, fy: 230 + px(34) + px(18) + px(24) + px(26) };
  }
  const typed = (t, s, [b0, per]) => s.slice(0, clamp(Math.floor((tb(t) - b0) / per) + 1, 0, s.length) * (tb(t) >= b0 ? 1 : 0));
  function contact(t) {
    const live = on(t, 43.6, 54.6);
    disp(S.form.root, live);
    if (!live) return { live: false };
    const F = S.form;
    const enter = ez.inOutExpo(pb(t, 43.6, 44.3));
    T(F.root, { y: (1 - enter) * H });
    vis(F.kick, true); F.kick.style.transform = `translate3d(${F.X}px,230px,0)`;
    F.h2.words.forEach((w, i) => rise(w, clamp((t - bt(44.25 + i * 0.25) + 0.03) / 0.35)));
    T(F.form, { x: F.X, y: F.fy + (1 - ez.outExpo(pr(t, 44.2, 0.6))) * 120 });
    // values
    const nm = typed(t, NAME, TYPE.name), ml = typed(t, MAIL, TYPE.mail), ms = typed(t, MSG, TYPE.msg);
    const sel = tb(t) >= 50.25;
    const set = (f, v, focused) => { f.val.textContent = v; vis(f.phd, !v); f.box.style.borderColor = focused ? C.acc : C.line; f.box.style.boxShadow = focused ? `0 0 0 ${px(3)}px rgba(44,91,255,.18)` : "none";
      const w = measure(v.split("\n").pop(), px(14), 400); T(f.caret, { x: px(16) + w + 2, y: px(14), op: focused && Math.floor((t * 2.5) % 2) === 0 ? 1 : focused ? 0.999 : 0 }); };
    const focus = tb(t) < 45 ? null : tb(t) < 47 ? "name" : tb(t) < 49.5 ? "mail" : tb(t) < 50.5 ? "sel" : tb(t) < 53 ? "msg" : null;
    set(F.fName, nm, focus === "name"); set(F.fMail, ml, focus === "mail");
    F.fSel.phd.textContent = sel ? "Vidéos Reels" : "Faites un choix"; F.fSel.box.style.borderColor = focus === "sel" ? C.acc : C.line; vis(F.fSel.caret, false);
    set(F.fMsg, ms, focus === "msg");
    // dropdown open b49.5 -> closes on the pick at b50.25
    const ddo = on(t, 49.55, 50.3);
    const ddp = ez.outExpo(pr(t, 49.55, 0.25));
    T(F.dd, { x: F.pad, y: F.fSel.y0 + px(46) + px(6) - (1 - ddp) * 20, op: ddo ? ddp : 0 });
    F.opts.forEach((o, i) => { o.style.background = i === 0 && tb(t) >= 49.95 ? "rgba(44,91,255,.22)" : "transparent"; });
    // button: disabled grey until the form is valid, press on b53, morphs to a check on b53.5
    const valid = ms.length === MSG.length;
    F.btn.style.background = valid ? C.white : "#9a9a9a";
    const press = on(t, 53 - 0.02, 53.12) ? 0.95 : 1;
    const morph = ez.inOutExpo(pb(t, 53.15, 53.6));
    F.btn.style.width = lerp(F.iw, px(50.5), morph) + "px";
    T(F.btn, { x: F.pad + (F.iw - lerp(F.iw, px(50.5), morph)) / 2, y: F.by, s: press, op: morph < 0.98 ? 1 : 0 });
    F.btn.querySelectorAll("span, div").forEach((c) => (c.style.opacity = 1 - clamp(morph * 3)));
    const okE = spring(t - bt(53.6) + 0.03, 2.4, 7);
    T(F.ok, { x: F.pad + (F.iw - px(50.5)) / 2, y: F.by, s: okE, op: t >= bt(53.6) - 0.03 ? 1 : 0 });
    const mm = ez.outExpo(pr(t, 53.75, 0.4));
    T(F.msg, { x: F.pad + (F.iw - measure("Message envoyé ✓ — On vous revient rapidement.", px(14), 500)) / 2, y: F.by + px(64) + (1 - mm) * 16, op: mm });
    // camera follows the active field
    const fy = { name: F.fName.y0, mail: F.fMail.y0, sel: F.fSel.y0, msg: F.fMsg.y0 }[focus] ?? F.by;
    return { live: true, focus, fyStage: F.fy + fy, F };
  }

  /* ===== cursor ===== */
  function buildCursor() {
    const root = layer(12);
    const k = 1.9;
    const c = el(root, { width: 24 * k + "px", height: 36 * k + "px" });
    c.innerHTML = `<svg viewBox="-1 -1 24 36" width="${24 * k}" height="${36 * k}"><path d="M1 1 L1 27 L7.4 21.2 L11.6 31 L15.8 29.2 L11.7 19.6 L20 19.6 Z" fill="#fff" stroke="#000" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
    c.style.filter = "drop-shadow(0 6px 10px rgba(0,0,0,.45))";
    const ring = el(root, { width: "90px", height: "90px", borderRadius: "50%", border: "3px solid rgba(255,255,255,.85)", boxSizing: "border-box" });
    S.cur = { root, c, ring };
  }
  function cursor(t, fs) {
    const Cu = S.cur;
    if (tb(t) >= 58.3) {                                       // last moment: the cursor clicks the logo
      disp(Cu.root, true);
      const L_ = S.logo, cx = W / 2 + 40, cy = L_.by + L_.total * 0.45;
      const e = ez.inOutCubic(pb(t, 58.3, 58.9));
      const x = lerp(W * 0.92, cx, e), y = lerp(H * 1.02, cy, e);
      const d = t - bt(59), press = d > -0.03 && d < 0.1 ? 1 : 0, ringP = d >= 0 && d < 0.4 ? d / 0.4 : -1;
      T(Cu.c, { x, y, s: 1 - 0.16 * press });
      T(Cu.ring, { x: x - 45 * (0.4 + ringP), y: y - 45 * (0.4 + ringP), s: 0.4 + ringP, op: ringP >= 0 ? 1 - ringP : 0 });
      return;
    }
    if (!fs.live || tb(t) < 44.6 || tb(t) > 54) { disp(Cu.root, false); return; }
    disp(Cu.root, true);
    const F = fs.F, fx = F.X, fy = F.fy + (1 - ez.outExpo(pr(t, 44.2, 0.6))) * 120;
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
    for (let i = 0; i < keys.length - 1; i++) { const [b0, a] = keys[i], [b1, b] = keys[i + 1]; if (tb(t) >= b0) { const e = ez.inOutCubic(pb(t, b0, b1)); p = [lerp(a[0], b[0], e), lerp(a[1], b[1], e)]; } }
    const clicks = [45, 47, 49.5, 50.25, 50.5, 53];
    let press = 0, ringP = -1;
    for (const b of clicks) { const d = t - bt(b); if (d > -0.03 && d < 0.1) press = 1; if (d >= 0 && d < 0.4) ringP = d / 0.4; }
    T(Cu.c, { x: p[0], y: p[1], s: 1 - 0.16 * press });
    T(Cu.ring, { x: p[0] - 45 * (0.4 + ringP), y: p[1] - 45 * (0.4 + ringP), s: 0.4 + ringP, op: ringP >= 0 ? 1 - ringP : 0 });
  }

  /* ===== S9 lockup (b54-60) ===== */
  function buildLogo(svgText) {
    const root = layer(10);
    const disc = el(root, { width: "200px", height: "200px", borderRadius: "50%", background: C.acc });
    const fill = el(root, { width: W + "px", height: H + "px", background: `radial-gradient(120% 60% at 50% 0%, #0c1022 0%, ${C.bg} 60%)` });
    const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
    const paths = [...doc.querySelectorAll("path")].map((p) => p.outerHTML);
    const mk = (vb, inner, w) => { const h = (w * vb[3]) / vb[2]; const d = el(root, { width: w + "px", height: h + "px", overflow: "hidden" }); d.innerHTML = `<svg viewBox="${vb.join(" ")}" width="${w}" height="${h}" style="display:block">${inner}</svg>`; return { d, h }; };
    const Lw = 720;
    const board = mk([0, 0, 221, 98], `${paths[0]}${paths[1]}${paths[4]}<g id="arm">${paths[2]}${paths[3]}</g><g id="boom">${paths.slice(5).join("")}</g>`, Lw);
    const wordm = mk([0, 98, 221, 42], paths[4], Lw);
    const subm = mk([0, 140, 221, 20], paths[4], Lw);
    const tag = words(root, [["Et", "si", "votre"], ["prochaine", "vidéo"], ["changeait", "tout ?"]], { size: 100, weight: 700, track: -0.035, lh: 1.04, w: W - 140, align: "center", color: (w, i) => (i >= 5 ? C.acc : C.white) });
    const url = words(root, [["creationvirale.com"]], { size: 40, weight: 500, family: '"Geist Mono"', track: 0.02, w: W - 140, align: "center" });
    disp(url.root, false);                                     // no URL in the ending
    const total = board.h + wordm.h + subm.h;
    const by = (H - total) / 2;
    S.logo = { root, disc, fill, board, wordm, subm, arm: board.d.querySelector("#arm"), boom: board.d.querySelector("#boom"), tag, url, Lw, bx: (W - Lw) / 2, by, ty: (H - tag.height) / 2, total };
  }
  function lockup(t, fs) {
    const live = t >= bt(53.55);
    disp(S.logo.root, live);
    if (!live) return;
    const Lg = S.logo;
    // the success check grows into the blue field
    const okX = fs.F ? fs.F.X + fs.F.pad + fs.F.iw / 2 : W / 2, okY = fs.F ? fs.F.fy + fs.F.by + px(25) : H / 2;
    const g = ez.inOutExpo(pb(t, 53.85, 54.35));
    const r = lerp(px(25), Math.hypot(W, H), g);
    T(Lg.disc, { x: okX - r, y: okY - r, op: g > 0 && g < 1 ? 1 : 0 }); { const c = Math.round(lerp(1, 0, clamp(g * 1.4))); const k = clamp(g * 1.4); Lg.disc.style.background = `rgb(${Math.round(lerp(44, 5, k))},${Math.round(lerp(91, 5, k))},${Math.round(lerp(255, 5, k))})`; } Lg.disc.style.width = Lg.disc.style.height = 2 * r + "px";
    vis(Lg.fill, g >= 1);
    // 1) tagline alone, centred (b54.5-57)
    const tq = ez.inExpo(pb(t, 56.6, 57.0));
    T(Lg.tag.root, { x: 70, y: Lg.ty - tq * 60 });
    Lg.tag.words.forEach((w, i) => rise(w, clamp((t - bt(54.5 + i * 0.25) + 0.03) / 0.35), tq, 0.2));
    // 2) logo alone, centred: board lands b57, clapper snaps on b57.5
    const LB = 57, CL = 57.5;
    const dt = t - bt(LB) + 0.02, e = spring(dt, 2.2, 7);
    const click = t - bt(59), press = click >= 0 ? 1 - 0.05 * Math.exp(-click / 0.09) * Math.min(1, click / 0.03 + 0.2) : 1;
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

  /* ---------- camera + grain ---------- */
  function camera(t, fs) {
    let s = 1, x = 0, y = 0, r = 0;
    for (const [b, a] of [[0, 0.035], [1, 0.03], [2, 0.03], [3, 0.07], [8, 0.05], [30, 0.07], [31, 0.03], [32, 0.03], [32.5, 0.03], [43, 0.05], [57.5, 0.045], [59, 0.012]]) { const d = t - bt(b); if (d >= 0) s += a * Math.exp(-d / 0.13); }
    for (const [b, a] of [[3, 16], [8, 12], [30, 24], [43, 14], [57.5, 16]]) { const d = t - bt(b); if (d >= 0 && d < 0.6) { const e = a * Math.exp(-d / 0.14); x += e * (vnoise(d * 30, b) - 0.5) * 2; y += e * (vnoise(d * 30, b + 50) - 0.5) * 2; r += e * 0.02 * (vnoise(d * 22, b + 9) - 0.5); } }
    // gentle follow of the active form field (keeps typing legible on a phone)
    if (fs.live && fs.focus) { const target = H * 0.5 - fs.fyStage; const f = clamp(tb(t) - 45, 0, 1) * clamp(54 - tb(t), 0, 1); y += clamp(target, -600, 200) * 1.12 * f; s *= 1 + 0.12 * f; }
    cam.style.transform = `translate(${x}px,${y}px) rotate(${r}deg) scale(${s})`;
  }
  function buildGrain() {
    const g = el(stage, { width: W + 256 + "px", height: H + 256 + "px", zIndex: 20, mixBlendMode: "overlay", opacity: 0.14, pointerEvents: "none" });
    const cv = document.createElement("canvas"); cv.width = cv.height = 256;
    const cx = cv.getContext("2d"), im = cx.createImageData(256, 256), rnd = mulberry32(7);
    for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (rnd() + rnd() + rnd() - 1.5) * 120; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    cx.putImageData(im, 0, 0);
    g.style.backgroundImage = `url(${cv.toDataURL()})`;
    S.grain = g;
  }


  /* ---------- light FX: minimal glows / sweeps / rings that the sound design answers ---------- */
  // bloom: soft accent light that swells into a hit; sweep: a thin light line passing through the frame;
  // ring: one hairline circle expanding. Never on UI chrome: light lives in the space between scenes.
  const FX = {
    bloom: [[3, 0.5, 0.5, 0.7], [8, 0.5, 0.5, 0.8], [30, 0.5, 0.5, 1], [43, 0.5, 0.48, 0.85], [53.6, 0.5, 0.6, 0.6], [57.5, 0.5, 0.5, 0.75]],
    sweep: [[11.85, -1], [17.85, 1], [20.85, -1], [23.85, 1], [26.85, -1], [32.85, 1], [42.6, -1], [54.3, 1]],
    ring: [[30, 0.5, 0.5], [54, 0.5, 0.5]],
  };
  function buildFX() {
    const root = el(stage, { width: W + "px", height: H + "px", zIndex: 15, pointerEvents: "none", mixBlendMode: "screen", overflow: "hidden" });
    const D = W * 1.5, L = Math.hypot(W, H) * 1.3;
    S.blooms = FX.bloom.map(([, x, y]) => el(root, { left: x * W - D / 2 + "px", top: y * H - D / 2 + "px", width: D + "px", height: D + "px", borderRadius: "50%",
      background: "radial-gradient(circle, rgba(150,175,255,.55) 0%, rgba(44,91,255,.28) 28%, rgba(44,91,255,.08) 48%, rgba(44,91,255,0) 66%)" }));
    S.sweeps = FX.sweep.map(() => {
      const g = el(root, { left: W / 2 - L / 2 + "px", top: H / 2 - 110 + "px", width: L + "px", height: "220px",
        background: "linear-gradient(180deg, rgba(44,91,255,0), rgba(44,91,255,.16) 50%, rgba(44,91,255,0))" });
      el(g, { left: 0, top: "108px", width: L + "px", height: "4px", borderRadius: "2px",
        background: "linear-gradient(90deg, rgba(255,255,255,0) 8%, rgba(190,205,255,.9) 42%, #fff 50%, rgba(190,205,255,.9) 58%, rgba(255,255,255,0) 92%)" });
      return g;
    });
    S.rings = FX.ring.map(([, x, y]) => el(root, { left: x * W - 100 + "px", top: y * H - 100 + "px", width: "200px", height: "200px", borderRadius: "50%",
      border: "2px solid rgba(200,212,255,.7)", boxSizing: "border-box" }));
  }
  function fx(t) {
    FX.bloom.forEach(([b, , , pk], i) => {
      const d = t - bt(b), e = S.blooms[i];
      if (d < -0.18 || d > 1.8) return vis(e, false);
      const op = d < 0 ? pk * 0.35 * (1 + d / 0.18) : pk * Math.exp(-d / 0.5);
      T(e, { s: 0.55 + 0.65 * ez.outExpo(clamp((d + 0.18) / 1.4)), op });
    });
    FX.sweep.forEach(([b, dir], i) => {
      const d = (t - bt(b)) / 0.55, e = S.sweeps[i];          // crosses frame centre on the beat
      if (d < -0.5 || d > 0.5) return vis(e, false);
      const k = ez.inOutCubic(d + 0.5) - 0.5, r = -22 * dir, n = H * 1.25 * k;
      const a = (r * Math.PI) / 180;
      T(e, { x: -Math.sin(a) * n * dir, y: Math.cos(a) * n * dir, r, op: Math.sin(Math.PI * (d + 0.5)) });
    });
    FX.ring.forEach(([b], i) => {
      const d = t - bt(b), e = S.rings[i];
      if (d < 0 || d > 1.1) return vis(e, false);
      T(e, { s: 0.4 + 8 * ez.outExpo(d / 1.1), op: 0.8 * (1 - d / 1.1) });
    });
  }

  /* ---------- sound design cues ---------- */
  function buildCues() {
    // Apple-like palette: thump (soft sub hit), bloom (tonal light swell), air (light passing), glint (tiny tonal tap),
    // tap (UI touch), shimmer (glassy ring), key/select/send/ding for the form.
    for (const [b] of FX.bloom) cue(b, "bloom", 0.55);
    for (const [b, dir] of FX.sweep) cue(b, "air", 0.5, 0, { dir });
    for (const [b] of FX.ring) cue(b, "shimmer", 0.5);
    for (const b of [3, 8, 30, 43]) cue(b, "thump", b === 30 ? 1 : 0.8);
    cue(6, "glint", 0.35, -0.2, { step: 0 }); cue(7, "glint", 0.35, 0.2, { step: 2 });
    for (let i = 1; i < 8; i++) cue(8 + i * 0.5, "tap", 0.3, i % 2 ? 0.35 : -0.35);
    for (let i = 0; i < 3; i++) cue(13 + i * 0.5, "glint", 0.4, -0.3 + i * 0.3, { step: i });
    cue(14.5, "tap", 0.5); for (let i = 0; i < 3; i++) cue(15 + i * 0.5, "glint", 0.4, [-0.5, 0.5, -0.4][i], { step: 3 + i });
    cue(18.5, "tap", 0.4);
    for (const b of [31, 32, 32.5]) cue(b, "glint", 0.45, 0, { step: b === 31 ? 0 : b === 32 ? 2 : 4 });
    for (let i = 0; i < 3; i++) { const b0 = 33 + i * 3; cue(b0 + 0.25, "tap", 0.5); for (let j = 0; j < 6; j++) cue(b0 + (j < 3 ? 0.5 : 1.25) + (j % 3) * 0.125, "glint", 0.26, -0.5 + j * 0.2, { step: j + (j < 3 ? 0 : 1) }); }
    for (const b of [45, 47, 49.5, 50.5]) cue(b, "tap", 0.65, 0.2);
    cue(50.25, "select", 0.7);
    const keyCues = (s, [b0, per]) => [...s].forEach((ch, i) => { if (ch !== " ") cue(b0 + i * per, "key", 0.45, 0.15, { var: i }); });
    keyCues(NAME, TYPE.name); keyCues(MAIL, TYPE.mail); keyCues(MSG, TYPE.msg);
    cue(53, "tap", 0.85, 0.2); cue(53.6, "send", 0.55); cue(53.6, "ding", 0.85);
    cue(57, "glint", 0.35, 0, { step: 4 }); cue(57.5, "clap", 0.6); cue(57.5, "thump", 0.75); cue(59, "tap", 1.0, 0.1);
  }

  /* ---------- frame ---------- */
  async function seek(t) {
    pending.length = 0;
    hook(t); burst(t); hero(t); process(t); boom(t); results(t);
    const fs = contact(t);
    cursor(t, fs); lockup(t, fs); camera(t, fs); fx(t);
    const f = Math.floor(t * 30 + 1e-6);
    T(S.grain, { x: -Math.floor(hash(f, 3) * 256), y: -Math.floor(hash(f, 4) * 256), op: 0.14 });
    await Promise.all(pending);
  }

  window.DURATION = 30;
  window.ready = (async () => {
    const [beats, uses, svg] = await Promise.all([
      fetch("../beats2.json").then((r) => r.json()),
      fetch("../assets/broll/uses.json").then((r) => r.json()),
      fetch("../assets/brand/logo-white.svg").then((r) => r.text()),
    ]);
    BTS = beats.beats; PER = beats.period; USES = uses; LOGO_SVG.text = svg;
    for (const w of ["400", "500", "600", "700", "800"]) await document.fonts.load(`${w} 100px Geist`);
    await document.fonts.load('500 100px "Geist Mono"');
    await document.fonts.ready;
    buildHook(); buildBurst(); buildHero(); buildProcess(); buildBoom(); buildResults(); buildForm(); buildCursor(); buildLogo(svg); buildGrain(); buildFX(); buildCues();
    window.CUES = CUES.map((c) => ({ ...c, t: bt(c.beat) }));
    window.seek = seek;
    await seek(0);
    return { W, H, FMT: "portrait", cues: CUES.length };
  })();
})();
