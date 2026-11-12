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
    // word onsets measured on the ElevenLabs takes (large-v3 alignment, assets/imp-ads/words6.json)
    "1": { len: 15.0, voEnd: 13.0, words: [["Dans", 0.0], ["le", 0.18], ["resto,", 0.28], ["Contenants,", 0.72], ["ustensiles,", 1.66], ["sacs :", 2.54], ["tu", 3.08], ["les", 3.4], ["rachètes", 3.54], ["chaque", 3.92], ["mois.", 4.14], ["Import-Rama", 4.78], ["les", 5.46], ["fait", 5.66], ["fabriquer", 5.82], ["à", 6.32], ["la", 6.5], ["source,", 6.58], ["et", 6.94], ["s'occupe", 7.2], ["de", 7.7], ["tout.", 7.78], ["Envoie", 8.32], ["ta", 8.8], ["liste :", 8.88], ["on", 9.26], ["challenge", 9.48], ["ton", 9.84], ["prix", 10.2], ["actuel.", 10.38], ["Prenez", 11.14], ["rendez-vous", 11.62], ["gratuitement.", 12.04]],
      phrases: [[0, 3], [3, 6], [6, 11], [11, 15], [15, 18], [18, 22], [22, 25], [25, 30], [30, 33]] },
    "2": { len: 13.2, voEnd: 10.9, counts: [7, 3, 3, 3, 4, 3, 2, 3, 2], words: [["Tu", 0.0], ["ouvres,", 0.14], ["ou", 0.6], ["tu", 0.86], ["rénoves", 1.14], ["ton", 1.58], ["resto?", 1.66], ["Chaises", 2.32], ["de", 2.82], ["terrasse,", 2.84], ["tables,", 3.44], ["vaisselle,", 3.98], ["déco…", 4.6], ["on", 5.1], ["peut", 5.48], ["aussi", 5.64], ["te", 5.88], ["les", 6.02], ["faire", 6.12], ["fabriquer.", 6.26], ["Un", 6.88], ["seul", 7.2], ["contact,", 7.48], ["de", 8.08], ["l'usine", 8.3], ["jusqu'à", 8.8], ["ta", 9.24], ["salle.", 9.32], ["Prends", 9.78], ["rendez-vous.", 10.2]] },
    "3": { len: 30.8, voEnd: 28.9, counts: [2, 5, 4, 4, 5, 5, 4, 3, 3, 3, 4, 2, 5, 5, 2, 3, 4, 6, 5, 3], words: [["Ton", 0.0], ["fournisseur…", 0.12], ["ça", 0.96], ["fait", 1.4], ["combien", 1.56], ["de", 1.88], ["temps", 2.08], ["que", 2.28], ["personne", 2.46], ["l'a", 2.84], ["challengé?", 3.08], ["Ce", 3.88], ["que", 4.32], ["tu", 4.42], ["achètes", 4.52], ["est", 4.92], ["souvent", 5.12], ["fabriqué", 5.4], ["en", 5.94], ["Asie,", 6.08], ["puis", 6.48], ["passe", 6.84], ["par", 7.16], ["plusieurs", 7.36], ["intermédiaires", 7.76], ["avant", 8.58], ["d'arriver", 8.76], ["chez", 9.14], ["toi.", 9.3], ["Import-Rama", 10.1], ["va", 10.54], ["direct", 10.92], ["à", 11.3], ["la", 11.6], ["source :", 11.68], ["on", 12.16], ["trouve", 12.46], ["l'usine,", 12.72], ["on", 13.26], ["vérifie", 13.5], ["la", 13.92], ["qualité,", 14.08], ["on", 14.66], ["négocie,", 14.96], ["puis", 15.62], ["on", 15.94], ["gère", 16.08], ["le", 16.38], ["bateau,", 16.52], ["les", 17.0], ["douanes", 17.18], ["et", 17.54], ["la", 17.8], ["livraison.", 17.94], ["Commerçant,", 19.24], ["grossiste,", 19.68], ["restaurateur", 20.3], ["ou", 20.98], ["manufacturier :", 21.14], ["envoie-nous", 22.08], ["ce", 22.8], ["que", 22.92], ["t'achètes,", 22.98], ["on", 23.52], ["compare", 23.74], ["avec", 24.1], ["ton", 24.34], ["prix", 24.52], ["actuel.", 24.7], ["Toi,", 25.36], ["t'as", 25.8], ["rien", 26.1], ["à", 26.34], ["gérer.", 26.56], ["Premier", 27.1], ["rendez-vous", 27.54], ["gratuitement.", 27.98]] },
  };
  // automatic caption phrasing: break after . ? … : always, after a comma once 3+ words, and at 5 words
  for (const k of Object.keys(SCRIPTS)) {
    const sc = SCRIPTS[k]; if (sc.phrases) continue;
    if (sc.counts) { let i = 0; sc.phrases = sc.counts.map((c) => [i, (i += c)]); continue; }
    sc.phrases = []; let a = 0;
    sc.words.forEach(([wd], i) => {
      const n = i - a + 1, end = /[.?…:]$/.test(wd) || (/,$/.test(wd) && n >= 3) || n >= 5;
      if (end || i === sc.words.length - 1) { sc.phrases.push([a, i + 1]); a = i + 1; }
    });
  }
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
  const T1 = VID !== "1" ? null : { s2: w(3) - 0.07, s3: w(6) - 0.16, s4: w(11) - 0.12, s5: w(22) - 0.2, s6: w(30) - 0.24, end: SC.len };
  // footage plan for k=b: [shot, film start, film end, in-point, speed]
  const SHOTS1 = VID !== "1" ? null : [["s1", 0, T1.s2, 0.5, 1], ["s2", T1.s2, T1.s3, 0.35, 1], ["s3", T1.s3, T1.s4, 0.55, 1],
    ["s4", T1.s4, w(18) - 0.1, 0.0, 1], ["s5", w(18) - 0.1, w(20) + 0.18, 0.6, 1], ["s6", w(20) + 0.18, T1.s5, 0.9, 1],
    ["s2", T1.s5, T1.s6, 0.2, 0.5, "blur"]];

  function buildFootage() {
    if (!FOOT) return;
    const root = layer(1);
    S.foot = footage(root);
    S.footShade = el(root, { width: W + "px", height: H + "px" });
  }
  function footPaint(t) {
    if (!FOOT) return;
    const sh = VX.shots.find(([, a, b]) => t >= a && t < b) || VX.shots[VX.shots.length - 1];
    const [name, a, , inp, sp, mode] = sh;
    shotFrame(S.foot, name, inp + (t - a) * sp);
    // a slow push on every shot, a punch on every cut
    const k = t - a, punch = 0.06 * Math.exp(-k / 0.18);
    const listBg = mode === "blur";
    S.foot.img.style.transform = `scale(${(listBg ? 1.18 : 1.04) + 0.025 * k + punch})`;
    S.foot.img.style.filter = listBg ? "blur(22px) brightness(0.55) saturate(0.8)" : "contrast(1.08) saturate(1.05)";
    // readability: dark at the top where the headline sits, and at the bottom for the captions
    S.footShade.style.background = "linear-gradient(180deg, rgba(10,10,10,.82) 0%, rgba(10,10,10,.35) 38%, rgba(10,10,10,.1) 55%, rgba(10,10,10,.55) 78%, rgba(10,10,10,.85) 100%)";
    disp(S.foot.box.parentNode, t < VX.end + 0.3);
  }

  /* ----- S1 hook: T'AS UN RESTO? ----- */
  function buildHook() {
    const root = layer(10, { background: FOOT ? "transparent" : C.black });
    if (!FOOT) { const wm = logoSVG(root, "glyphOnly", 900, "#1A1817"); T(wm.d, { x: W - 760, y: H - 820 }); S.hwm = wm; }
    const z1 = 190, z2 = fit("RESTO?", W - 2 * M, 800, 470);
    const y = FOOT ? 300 : 620;
    S.h = { root, l1: line(root, "DANS LE", z1, C.white, M, y), l2: line(root, `RESTO${dot(C.red, ",")}`, z2, C.white, M, y + z1 * 0.9) };
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
    // the CTA, one line per spoken word; the last line carries the red period
    const LN = VX.endLines, z = Math.min(...LN.map((x) => fit(x + ".", W - 2 * M, 800, 230))), y = LN.length > 2 ? 860 : 960;
    S.e.ls = LN.map((x, i) => line(root, i === LN.length - 1 ? `${x}${dot()}` : x, z, C.ink, M, y + i * z * 0.9));
    const yb = y + LN.length * z * 0.9;
    S.e.btn = el(root, { left: M + "px", top: yb + 110 + "px", height: "160px", padding: "0 64px", background: C.red, display: "flex", alignItems: "center", gap: "28px", ...fBC(70, 800, 1, 0.04), color: C.white, transformOrigin: "0 50%" });
    S.e.btn.innerHTML = `<span style="position:relative">${VX.button}</span><span style="position:relative;font-size:72px">→</span>`;
    S.e.url = el(root, { left: M + "px", top: yb + 330 + "px", font: `500 46px/1 ${BR}`, color: C.mid });
    S.e.url.textContent = "importrama.com";
  }
  function end(t) {
    const E = S.e, t0 = VX.end, NW = WT.length;
    // the red "?" panel blows up to full frame, then the paper rises over it
    const rk = ez.inOutExpo(pr(t, t0 - 0.18, 0.22));
    const fr = VX.endFrom ? VX.endFrom() : { x: 0, y: H, w: W, h: 0 };
    const x0 = lerp(fr.x, 0, rk), y0 = lerp(fr.y, 0, rk), ww = lerp(fr.w, W, rk), hh = lerp(fr.h, H, rk);
    E.red.style.clipPath = `inset(${y0}px ${W - x0 - ww}px ${H - y0 - hh}px ${x0}px)`;
    disp(E.red, t >= t0 - 0.18 && t < t0 + 0.6);
    const pk = ez.inOutExpo(pr(t, t0 + 0.08, 0.26));
    disp(E.root, t >= t0 + 0.08);
    E.root.style.clipPath = `inset(${(1 - pk) * 100}% 0 0 0)`;
    if (t < t0 + 0.08) return;
    lockupPaint(E.lock, t0 + 0.2, t);
    T(E.lock.g, { x: E.lx, y: E.ly, s: 1 + 0.025 * pr(t, t0, 3) });
    E.lock.g.style.transformOrigin = "50% 50%";
    const LN = E.ls.length;
    E.ls.forEach((l, i) => rise(l, pr(t, Math.max(t0 + 0.24 + 0.1 * i, w(NW - LN + i) - 0.06), RISE), 0, i === LN - 1 ? 0.4 : 0.3));
    const bt0 = w(NW - 1) + 0.55, bp = clamp(spring(t - bt0, 1.8, 6), 0, 1.2);
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
    const on = t < VX.end - 0.05;
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
    KICKS.push(...VX.kicks, [VX.end + 0.1, 0.04]);
  }
  function fx(t) {
    let f = 0;
    for (const [a, g] of [...VX.flashes, [VX.end + 0.08, 0.25]]) { const d = t - a; if (d >= 0) f = Math.max(f, g * Math.exp(-d / 0.09)); }
    T(S.flash, { op: f });
    let s = 1, x = 0, y = 0, r = 0;
    for (const [a, g] of KICKS) { const d = t - a; if (d >= 0) s += g * Math.exp(-d / 0.12); }
    for (const [a, g] of VX.shakes) { const d = t - a; if (d >= 0 && d < 0.5) { const e = g * Math.exp(-d / 0.11); x += e * sn(d * 30, a * 10); y += e * sn(d * 30, a * 10 + 9); r += e * 0.02 * sn(d * 20, a * 10 + 3); } }
    // a slow handheld drift under everything
    x += 4 * sn(t * 0.7, 21); y += 4 * sn(t * 0.6, 22);
    cam.style.transform = `translate(${x}px,${y}px) rotate(${r}deg) scale(${s})`;
    const fr = Math.floor(t * 30 + 1e-6);
    T(S.grain, { x: -Math.floor(hash(fr, 3) * 256), y: -Math.floor(hash(fr, 4) * 256), op: FOOT ? 0.12 : 0.09 });
  }

  /* ---------- sound design (seconds → beats on the measured grid) ---------- */
  function cues1() {
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
  }
  function cuesEnd() {
    const e = VX.end, NW = WT.length;
    cue(e - 0.25, "air", 0.55, 0, { dir: -1 }); cue(e + 0.08, "thump", 0.8); cue(e + 0.2, "bloom", 0.55);
    cue(e + 0.34, "glint", 0.3, 0, { step: 2 }); cue(e + 0.5, "glint", 0.3, 0, { step: 4 });
    const LN = VX.endLines.length;
    VX.endLines.forEach((_, i) => cue(Math.max(e + 0.24 + 0.1 * i, w(NW - LN + i) - 0.06), "slam", 0.45 + 0.05 * i));
    const bt0 = w(NW - 1) + 0.55; cue(bt0, "pop", 0.55); cue(bt0, "shimmer", 0.35);
    for (let j = 0; j < 4; j++) cue(bt0 + 0.7 + j * 0.5, "tap", 0.18);
  }

  /* =========================================================================================
     shared helpers for videos 2 and 3
     ========================================================================================= */
  const bare = (s) => s.replace(/ :$/, "");
  const ix = (tok, n = 0) => { let c = -1; for (let i = 0; i < WT.length; i++) if (bare(WT[i].w) === tok && ++c === n) return i; throw new Error("no word " + tok); };
  const wt = (tok, n = 0) => w(ix(tok, n));
  const WM = (root) => { if (!FOOT) { const wm = logoSVG(root, "glyphOnly", 900, "#1A1817"); T(wm.d, { x: W - 760, y: H - 820 }); } };
  const wipeUp = (root, t, t0, d = 0.24) => { const k = ez.inOutExpo(pr(t, t0, d)); root.style.clipPath = `inset(${(1 - k) * 100}% 0 0 0)`; };
  const riseAll = (ls, at, t, lastStretch = 0.45) => ls.forEach((l, i) => rise(l, pr(t, at[i] - 0.08, RISE), 0, i === ls.length - 1 ? lastStretch : 0.3));
  function stackSwap(ls, at, t, ink = INK) {      // a list where the spoken item is lit and the others are greyed
    const cur = at.filter((x) => t >= x - 0.05).length - 1;
    ls.forEach((l, i) => {
      rise(l, pr(t, at[i] - 0.08, RISE));
      l.ink.style.color = i === cur ? ink : FOOT || ink === C.white ? "rgba(255,255,255,.36)" : C.grey;
      const sp = l.ink.querySelector("span"); if (sp) sp.style.color = i === cur ? (ink === C.white && !FOOT ? C.black : C.red) : "transparent";
    });
    return cur;
  }
  function marquee(root, y, bg, text) {
    const band = el(root, { left: 0, top: y + "px", width: W + "px", height: "150px", background: bg, overflow: "hidden" });
    const inner = el(band, { left: 0, top: 0, height: "150px", display: "flex", alignItems: "center", whiteSpace: "nowrap", ...fBC(92, 800, 1, 0.02), color: C.white });
    inner.textContent = text.repeat(4);
    return { band, inner, tw: measure(text, 92) };
  }
  function marqueePaint(m, t, t0) {
    const k = ez.outExpo(pr(t, t0 + 0.1, 0.4));
    m.band.style.clipPath = `inset(0 ${(1 - k) * 100}% 0 0)`;
    m.inner.style.transform = `translateX(${-(((t - t0) * 340) % m.tw)}px)`;
  }
  const SVGNS = "http://www.w3.org/2000/svg";
  const sv = (parent, tag, attrs) => { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };
  function cellFoot(root, x, y, w_, h_) {    // a framed footage window (motion-design version)
    const f = footage(root, { width: w_ + "px", height: h_ + "px" });
    T(f.box, { x, y });
    return f;
  }

  /* =========================================================================================
     VIDEO 2 — accessoires et mobilier
     ========================================================================================= */
  function V2() {
    const c = { s2: wt("Chaises") - 0.1, s3: wt("on") - 0.12, s4: wt("Un") - 0.12, end: wt("Prends") - 0.24 };
    const tv = wt("vaisselle,") - 0.06, tj = wt("jusqu'à") - 0.1;
    const shots = [["v2s1", 0, c.s2, 0.3, 1], ["v2s2", c.s2, tv, 0.3, 1], ["v2s3", tv, c.s3, 1.7, 1], ["v2s4", c.s3, c.s4, 0.4, 1],
      ["v2s5", c.s4, tj, 0.5, 1], ["v2s6", tj, c.end + 0.3, 0.2, 1]];
    const ITEMS = [["CHAISES", "Chaises"], ["TABLES", "tables,"], ["VAISSELLE", "vaisselle,"], ["DÉCO", "déco…"]];
    const X = {};

    function buildPlan(r, y0) {
      const pw = W - 2 * M, ph = H - 130 - y0;
      const svg = sv(r.root, "svg", { width: pw, height: ph, viewBox: `0 0 ${pw} ${ph}` });
      svg.setAttribute("class", "a"); svg.style.transform = `translate(${M}px,${y0}px)`;
      const roomH = ph * 0.66, terY = roomH + 34;
      r.room = sv(svg, "rect", { x: 6, y: 6, width: pw - 12, height: roomH, fill: "none", stroke: C.ink, "stroke-width": 8 });
      r.per = 2 * (pw - 12 + roomH);
      r.room.setAttribute("stroke-dasharray", r.per);
      r.ter = sv(svg, "rect", { x: 6, y: terY, width: pw - 12, height: ph - terY - 6, fill: "none", stroke: C.ink, "stroke-width": 4, "stroke-dasharray": "18 14" });
      r.terL = sv(svg, "text", { x: 22, y: terY + 40, fill: C.mid, "font-family": "Barlow Condensed", "font-weight": 700, "font-size": 30, "letter-spacing": "3" });
      r.terL.textContent = "TERRASSE";
      r.doorGap = sv(svg, "rect", { x: pw / 2 - 70, y: roomH - 4, width: 140, height: 16, fill: C.paper });
      const items = []; const add = (cat, t0, make) => { const g = sv(svg, "g", {}); make(g); items.push({ g, cat, t0 }); return g; };
      const tabs = [], ter = [];
      for (let j = 0; j < 2; j++) for (let i = 0; i < 3; i++) tabs.push([pw * (0.18 + 0.32 * i), roomH * (0.3 + 0.42 * j)]);
      for (let i = 0; i < 4; i++) ter.push([pw * (0.14 + 0.24 * i), terY + (ph - terY) * 0.55]);
      const at = ITEMS.map(([, tk]) => wt(tk));
      let k = 0;
      tabs.forEach(([x, y]) => [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dx, dy]) => {
        const g = add(0, at[0] + 0.02 * k++, (g) => sv(g, "rect", { x: -20, y: -20, width: 40, height: 40, rx: 9, fill: "currentColor" }));
        g.dataset.x = x + dx * 96; g.dataset.y = y + dy * 96;
      }));
      ter.forEach(([x, y]) => [-1, 1].forEach((dx) => { const g = add(0, at[0] + 0.02 * k++, (g) => sv(g, "rect", { x: -17, y: -17, width: 34, height: 34, rx: 8, fill: "currentColor" })); g.dataset.x = x + dx * 62; g.dataset.y = y; }));
      k = 0;
      tabs.forEach(([x, y]) => { const g = add(1, at[1] + 0.05 * k++, (g) => sv(g, "circle", { r: 64, fill: "currentColor" })); g.dataset.x = x; g.dataset.y = y; });
      ter.forEach(([x, y]) => { const g = add(1, at[1] + 0.05 * k++, (g) => sv(g, "rect", { x: -34, y: -34, width: 68, height: 68, fill: "currentColor" })); g.dataset.x = x; g.dataset.y = y; });
      k = 0;
      tabs.forEach(([x, y]) => [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dx, dy]) => { const g = add(2, at[2] + 0.018 * k++, (g) => sv(g, "circle", { r: 14, fill: C.paper, stroke: "currentColor", "stroke-width": 5 })); g.dataset.x = x + dx * 34; g.dataset.y = y + dy * 34; }));
      ter.forEach(([x, y]) => [-1, 1].forEach((dx) => { const g = add(2, at[2] + 0.018 * k++, (g) => sv(g, "circle", { r: 11, fill: C.paper, stroke: "currentColor", "stroke-width": 4 })); g.dataset.x = x + dx * 15; g.dataset.y = y; }));
      k = 0;
      [[50, 50], [pw - 50, 50], [50, roomH - 40], [pw - 50, roomH - 40], [pw * 0.5, roomH * 0.5]].forEach(([x, y]) => {
        const g = add(3, at[3] + 0.06 * k++, (g) => { [[0, 0, 26], [-18, 14, 18], [18, 14, 18], [0, -20, 16]].forEach(([a, b, rr]) => sv(g, "circle", { cx: a, cy: b, r: rr, fill: "currentColor" })); });
        g.dataset.x = x; g.dataset.y = y;
      });
      tabs.forEach(([x, y]) => { const g = add(3, at[3] + 0.06 * k++, (g) => { sv(g, "circle", { r: 26, fill: "none", stroke: "currentColor", "stroke-width": 4 }); sv(g, "circle", { r: 9, fill: "currentColor" }); }); g.dataset.x = x; g.dataset.y = y; });
      r.items = items; r.svg = svg;
    }
    function planPaint(r, t, cur) {
      const k = ez.inOutExpo(pr(t, c.s2, 0.5));
      r.room.setAttribute("stroke-dashoffset", r.per * (1 - k));
      r.ter.style.opacity = r.terL.style.opacity = ez.outCubic(pr(t, c.s2 + 0.3, 0.3));
      r.items.forEach((it) => {
        const s = Math.max(0, Math.min(1.25, spring(t - it.t0, 2.6, 7)));
        it.g.setAttribute("transform", `translate(${it.g.dataset.x} ${it.g.dataset.y}) scale(${s.toFixed(4)})`);
        it.g.style.color = it.cat === cur ? C.red : C.ink;
        it.g.style.visibility = t >= it.t0 ? "visible" : "hidden";
      });
    }
    function buildRoute(r) {
      const xL = M + 24, xR = W - M - 24, y = r.ry;
      r.xL = xL; r.xR = xR;
      r.track = el(r.root, { left: xL + "px", top: y - 4 + "px", width: xR - xL + "px", height: "8px", background: "rgba(255,255,255,.18)", transformOrigin: "0 50%" });
      r.fill = el(r.root, { left: xL + "px", top: y - 4 + "px", width: xR - xL + "px", height: "8px", background: C.red, transformOrigin: "0 50%" });
      const node = (x, label, al) => {
        const d = el(r.root, { left: x - 22 + "px", top: y - 22 + "px", width: "44px", height: "44px", borderRadius: "50%", background: C.red, transformOrigin: "50% 50%" });
        const l = el(r.root, { top: y + 46 + "px", ...fBC(56, 700, 1, 0.04), color: C.white, whiteSpace: "nowrap" });
        l.textContent = label; const lw = measure(label, 56, 700, 0.04);
        l.style.left = (al === "l" ? x - 22 : x + 22 - lw) + "px";
        return { d, l };
      };
      r.nL = node(xL, "USINE", "l"); r.nR = node(xR, "TA SALLE", "r");
      r.way = ["BATEAU", "DOUANES"].map((lab, i) => {
        const x = lerp(xL, xR, (i + 1) / 3);
        const d = el(r.root, { left: x - 9 + "px", top: y - 9 + "px", width: "18px", height: "18px", background: C.white, transform: "rotate(45deg)" });
        const l = el(r.root, { top: y - 86 + "px", ...fBC(40, 700, 1, 0.08), color: "rgba(255,255,255,.5)", whiteSpace: "nowrap" });
        l.textContent = lab; l.style.left = x - measure(lab, 40, 700, 0.08) / 2 + "px";
        return { d, l, f: (i + 1) / 3 };
      });
      r.chair = el(r.root, { width: "120px", height: "140px" });
      r.chair.innerHTML = `<svg viewBox="0 0 100 120" width="120" height="140" style="display:block;overflow:visible"><path d="M24 6 V114 M24 64 H82 V114 M24 14 H44" fill="none" stroke="${C.white}" stroke-width="11" stroke-linecap="square"/></svg>`;
      r.t0 = wt("de", 1); r.t1 = wt("salle.");
    }
    function routePaint(r, t) {
      const draw = ez.outExpo(pr(t, c.s4 + 0.1, 0.5));
      r.track.style.transform = `scaleX(${draw})`;
      const q = clamp((t - r.t0) / (r.t1 - r.t0)), e = q * q * (3 - 2 * q);
      r.fill.style.transform = `scaleX(${e})`; vis(r.fill, t >= r.t0);
      const pop = (d, t0) => { const s = clamp(spring(t - t0, 2.4, 7), 0, 1.3); d.style.transform = `scale(${s})`; vis(d, t >= t0); };
      pop(r.nL.d, c.s4 + 0.2); pop(r.nR.d, c.s4 + 0.35);
      T(r.nL.l, { op: ez.outCubic(pr(t, c.s4 + 0.3, 0.3)) }); T(r.nR.l, { op: ez.outCubic(pr(t, c.s4 + 0.45, 0.3)) });
      r.way.forEach((wp) => { const lit = e >= wp.f; wp.l.style.color = lit ? C.white : "rgba(255,255,255,.45)"; wp.d.style.background = lit ? C.red : C.white; vis(wp.d, draw > wp.f); vis(wp.l, draw > wp.f); });
      const cx = lerp(r.xL, r.xR, e), bob = Math.abs(Math.sin(q * Math.PI * 5)) * -14 * (q > 0 && q < 1 ? 1 : 0);
      T(r.chair, { x: cx - 50, y: r.ry - 170 + bob, r: (q > 0 && q < 1 ? -6 : 0), op: t >= r.t0 - 0.2 ? ez.outCubic(pr(t, r.t0 - 0.2, 0.2)) : 0 });
    }

    function build() {
      let r = (X.h = { root: layer(10, { background: FOOT ? "transparent" : C.black }) }); WM(r.root);
      const zA = fit("OU TU RÉNOVES", W - 2 * M, 800, 230), zB = fit("TON RESTO?", W - 2 * M, 800, 330), y = FOOT ? 260 : 460;
      r.ls = [line(r.root, "TU OUVRES", zA, C.white, M, y), line(r.root, "OU TU RÉNOVES", zA, C.white, M, y + zA * 0.9), line(r.root, `TON RESTO${dot(C.red, "?")}`, zB, C.white, M, y + zA * 1.8)];
      r.at = [wt("Tu"), wt("ou"), wt("ton")];

      r = X.p = { root: layer(11, { background: FOOT ? "transparent" : C.paper }) };
      const zi = fit("VAISSELLE.", W - 2 * M, 800, 200), yi = FOOT ? 200 : 140;
      r.ls = ITEMS.map(([wd], i) => line(r.root, `${wd}${dot()}`, zi, INK, M, yi + i * zi * 0.9));
      r.at = ITEMS.map(([, tk]) => wt(tk));
      if (!FOOT) buildPlan(r, yi + 4 * zi * 0.9 + 50);

      r = X.f = { root: layer(12, { background: FOOT ? "transparent" : C.red }) };
      const zf = fit("FABRIQUER.", W - 2 * M, 800, 330), zs = fit("ON PEUT AUSSI", W - 2 * M, 700, 170), yf = FOOT ? 240 : 360;
      r.ls = [line(r.root, "ON PEUT AUSSI", zs, C.white, M, yf, 700), line(r.root, "TE LES FAIRE", zs, C.white, M, yf + zs * 0.95, 700), line(r.root, `FABRIQUER${dot(FOOT ? C.red : C.black)}`, zf, C.white, M, yf + zs * 1.95)];
      r.at = [wt("on"), wt("te"), wt("fabriquer.")];
      r.band = marquee(r.root, FOOT ? 1290 : 1420, FOOT ? C.red : C.black, "CHAISES · TABLES · BANQUETTES · VAISSELLE · LUMINAIRES · DÉCO · ");

      r = X.r = { root: layer(13, { background: FOOT ? "transparent" : C.black }) }; WM(r.root);
      const zc = fit("CONTACT,", W - 2 * M, 800, 280), yc = FOOT ? 220 : 240;
      r.ls = [line(r.root, "UN SEUL", zc, C.white, M, yc), line(r.root, `CONTACT${dot(C.red, ",")}`, zc, C.white, M, yc + zc * 0.9)];
      r.at = [wt("Un"), wt("contact,")];
      r.ry = yc + zc * 1.8 + 230;
      const zd = fit("JUSQU'À TA SALLE.", W - 2 * M, 800, 170);
      r.ls2 = [line(r.root, "DE L'USINE", zd, C.white, M, r.ry + 200), line(r.root, `JUSQU'À TA SALLE${dot()}`, zd, C.white, M, r.ry + 200 + zd * 0.9)];
      r.at2 = [wt("l'usine"), wt("jusqu'à")];
      buildRoute(r);
    }
    function paint(t) {
      let r = X.h, on = t < c.s2; disp(r.root, on);
      if (on) riseAll(r.ls, r.at, t);
      r = X.p; on = inR(t, c.s2, c.s3 + 0.25); disp(r.root, on);
      if (on) { const cur = stackSwap(r.ls, r.at, t); if (r.items) planPaint(r, t, cur); }
      r = X.f; on = inR(t, c.s3, c.s4); disp(r.root, on);
      if (on) { wipeUp(r.root, t, c.s3); riseAll(r.ls, r.at, t); marqueePaint(r.band, t, c.s3); }
      r = X.r; on = inR(t, c.s4, c.end + 0.3); disp(r.root, on);
      if (on) { riseAll(r.ls, r.at, t); r.ls2.forEach((l, i) => rise(l, pr(t, r.at2[i] - 0.08, RISE), 0, i ? 0.4 : 0.3)); routePaint(r, t); }
    }
    function cues() {
      X.h.at.forEach((a, i) => cue(a - 0.04, "slam", 0.5 + 0.1 * i)); cue(X.h.at[0] - 0.02, "thump", 0.7); cue(X.h.at[2], "sparkle", 0.18);
      cue(c.s2 - 0.12, "zip", 0.3, 0.3, { dir: 1 });
      X.p.at.forEach((a, i) => { cue(a - 0.04, "slam", 0.5, [-0.25, 0.25, -0.15, 0.15][i]); for (let j = 0; j < 4; j++) cue(a + 0.04 + j * 0.08, "tap", 0.12, j % 2 ? 0.3 : -0.3); });
      cue(c.s3 - 0.2, "air", 0.45, 0, { dir: 1 }); cue(c.s3, "thump", 0.5);
      X.f.at.forEach((a, i) => cue(a - 0.05, "slam", 0.45 + 0.12 * i)); cue(X.f.at[2] - 0.03, "thump", 0.6);
      cue(c.s4 - 0.25, "air", 0.5, 0, { dir: -1 }); cue(c.s4, "thump", 0.8);
      X.r.at.forEach((a, i) => cue(a - 0.05, "slam", 0.5 + 0.1 * i));
      cue(X.r.t0 - 0.05, "whoosh", 0.4, -0.4); [0.37, 0.63].forEach((f, i) => cue(lerp(X.r.t0, X.r.t1, f), "glint", 0.3, -0.2 + 0.4 * f, { step: i * 2 }));
      cue(X.r.t1, "tap", 0.5, 0.4); cue(X.r.t1 + 0.05, "glint", 0.35, 0.4, { step: 4 });
      X.r.at2.forEach((a) => cue(a - 0.05, "slam", 0.45));
    }
    return {
      end: c.end, shots, endLines: ["PRENDS", "RENDEZ-VOUS"], button: "SANS ENGAGEMENT", build, paint, cues,
      kicks: [[wt("Tu"), 0.03], [wt("ou"), 0.03], [wt("ton"), 0.05], ...ITEMS.map(([, tk]) => [wt(tk), 0.025]), [wt("fabriquer."), 0.05], [wt("Un"), 0.03], [wt("contact,"), 0.04], [wt("salle."), 0.04]],
      flashes: [[wt("ton"), 0.18], [c.s2, 0.22], [c.s4, 0.3]],
      shakes: [[wt("ton"), 14], [wt("fabriquer."), 12], [wt("salle."), 10]],
      music: { hits: [wt("Tu"), wt("ou"), wt("ton")], stabs: ITEMS.map(([, tk]) => wt(tk)), s2: c.s2, s3: c.s3, s4: c.s4, s5: c.end, s6: c.end, drop: null },
    };
  }

  /* =========================================================================================
     VIDEO 3 — importation clé en main (long version, ~31 s)
     ========================================================================================= */
  function V3() {
    const c = { s1: wt("Ce") - 0.12, s2: wt("Import-Rama") - 0.12, s3: wt("on") - 0.12, s4: wt("Commerçant,") - 0.12, s5: wt("envoie-nous") - 0.12, s6: wt("Toi,") - 0.12, end: wt("Premier") - 0.24 };
    const STEPS = [["01", "ON TROUVE L'USINE", "trouve"], ["02", "ON VÉRIFIE LA QUALITÉ", "vérifie"], ["03", "ON NÉGOCIE", "négocie,"], ["04", "LE BATEAU", "bateau,"], ["05", "LES DOUANES", "douanes"], ["06", "LA LIVRAISON", "livraison."]];
    const AUD = [["COMMERÇANT", "Commerçant,", "v3s10"], ["GROSSISTE", "grossiste,", "v3s11"], ["RESTAURATEUR", "restaurateur", "v2s6"], ["MANUFACTURIER", "manufacturier", "v3s12"]];
    const st = STEPS.map(([, , tk]) => wt(tk) - 0.06), au = AUD.map(([, tk]) => wt(tk) - 0.06);
    const shots = [["v3s1", 0, c.s1, 0.2, 0.9], ["s4", c.s1, wt("puis") - 0.08, 0.0, 0.9], ["v3s8", wt("puis") - 0.08, c.s2, 0.15, 1],
      ["v3s2", c.s2, c.s3, 0.3, 1], ["v3s2", c.s3, st[1], 2.4, 1], ["v3s9", st[1], st[2], 0.3, 1], ["v3s3", st[2], st[3], 0.5, 1],
      ["s5", st[3], st[4], 0.4, 1], ["v3s5", st[4], st[5], 0.5, 1], ["v3s6", st[5], c.s4, 0.3, 1],
      ["v3s10", c.s4, au[1], 0.4, 1], ["v3s11", au[1], au[2], 0.4, 1], ["v2s6", au[2], au[3], 1.4, 1], ["v3s12", au[3], c.s5, 0.4, 1],
      ["v3s11", c.s5, c.s6, 1.0, 0.6, "blur"], ["v3s7", c.s6, c.end + 0.3, 0.6, 1]];
    const X = {};
    const ROWS3 = [["LUMINAIRES DEL", "800"], ["CARTONS D'EXPÉDITION", "12 000"], ["VIS INOX 8 MM", "50 000"], ["ARTICLES DE CUISINE", "3 000"]];

    function build() {
      /* S1 hook */
      let r = (X.h = { root: layer(10, { background: FOOT ? "transparent" : C.black }) }); WM(r.root);
      const zT = 150, zF = fit("FOURNISSEUR…", W - 2 * M, 800, 250), zQ = fit("L'A CHALLENGÉ?", W - 2 * M, 800, 240), y = FOOT ? 190 : 230;
      const yQ1 = y + zT * 0.9 + zF * 0.9 + 110, yQ2 = yQ1 + 2 * 112 + 60;
      r.ls = [line(r.root, "TON", zT, C.white, M, y), line(r.root, `FOURNISSEUR${dot(C.red, "…")}`, zF, C.white, M, y + zT * 0.9),
        line(r.root, "ÇA FAIT COMBIEN", 118, C.white, M, yQ1, 700), line(r.root, "DE TEMPS", 118, C.white, M, yQ1 + 112, 700),
        line(r.root, "QUE PERSONNE", zQ, C.white, M, yQ2), line(r.root, `L'A CHALLENGÉ${dot(C.red, "?")}`, zQ, C.white, M, yQ2 + zQ * 0.9)];
      r.at = [wt("Ton"), wt("fournisseur…"), wt("ça"), wt("de"), wt("personne"), wt("challengé?")];
      r.strike = el(r.root, { left: M - 10 + "px", top: y + zT * 0.9 + zF * 0.42 + "px", width: measure("FOURNISSEUR", zF) + 20 + "px", height: "24px", background: C.red, transformOrigin: "0 50%" });

      /* S2 the middlemen chain */
      r = X.m = { root: layer(11, { background: FOOT ? "transparent" : C.paper }) };
      const zm = fit("CE QUE TU ACHÈTES", W - 2 * M, 800, 160), ym = FOOT ? 190 : 150;
      r.ls = [line(r.root, "CE QUE TU ACHÈTES", zm, INK, M, ym), line(r.root, "EST FABRIQUÉ", zm, INK, M, ym + zm * 0.9), line(r.root, `EN ASIE${dot()}`, zm, INK, M, ym + zm * 1.8)];
      r.at = [wt("Ce"), wt("est"), wt("en")];
      const NODES = [["USINE · ASIE", "Asie,", ""], ["INTERMÉDIAIRE", "plusieurs", "+ $"], ["INTERMÉDIAIRE", "intermédiaires", "+ $"], ["INTERMÉDIAIRE", "avant", "+ $"], ["TOI", "toi.", "$$$$"]];
      const y0 = ym + zm * 2.7 + 100, gap = FOOT ? 150 : 175;
      r.rail = el(r.root, { left: M + 15 + "px", top: y0 + 18 + "px", width: "6px", height: gap * (NODES.length - 1) + "px", background: FOOT ? C.white : C.ink, transformOrigin: "50% 0" });
      r.nodes = NODES.map(([lab, tk, tag], i) => {
        const d = el(r.root, { left: M + "px", top: y0 + i * gap + "px", width: W - 2 * M + "px", height: "40px", display: "flex", alignItems: "center", gap: "34px" });
        const dt = el(d, { width: "36px", height: "36px", borderRadius: "50%", background: i === 0 || i === 4 ? C.red : FOOT ? C.white : C.ink, position: "relative", flex: "none" }, "i", "");
        const tx = el(d, { ...fBC(i === 4 ? 92 : 70, 700, 1), color: INK, position: "relative", flex: "1" }, "span", ""); tx.textContent = lab;
        const tg = el(d, { ...fBC(i === 4 ? 84 : 66, 800, 1), color: i === 4 ? C.white : C.red, background: i === 4 ? C.red : "transparent", padding: i === 4 ? "14px 22px 8px" : "0", position: "relative" }, "span", ""); tg.textContent = tag;
        return { d, dt, tg, t0: wt(tk) - 0.05 };
      });

      /* S3 Import-Rama, direct to the source */
      r = X.d = { root: layer(12, { background: FOOT ? "transparent" : C.black }) }; WM(r.root);
      const lw = 860; r.lock = lockup(r.root, lw, C.white); r.lx = (W - lw) / 2; r.ly = FOOT ? 230 : 330;
      const zd = fit("À LA SOURCE.", W - 2 * M, 800, 260), yd = r.ly + 330;
      r.ls = [line(r.root, "VA DIRECT", zd, C.white, M, yd), line(r.root, `À LA SOURCE${dot()}`, zd, C.white, M, yd + zd * 0.9)];
      r.at = [wt("va"), wt("à")];
      r.ly2 = yd + zd * 1.8 + 170; const xL = M + 24, xR = W - M - 24; r.xL = xL; r.xR = xR;
      r.line = el(r.root, { left: xL + "px", top: r.ly2 - 5 + "px", width: xR - xL + "px", height: "10px", background: C.red, transformOrigin: "0 50%" });
      r.ends = [[xL, "USINE", "l"], [xR, "TOI", "r"]].map(([x, lab, al]) => {
        const d = el(r.root, { left: x - 24 + "px", top: r.ly2 - 24 + "px", width: "48px", height: "48px", borderRadius: "50%", background: C.red, transformOrigin: "50% 50%" });
        const l = el(r.root, { top: r.ly2 + 50 + "px", ...fBC(64, 700, 1, 0.04), color: C.white }); l.textContent = lab;
        l.style.left = (al === "l" ? x - 24 : x + 24 - measure(lab, 64, 700, 0.04)) + "px";
        return { d, l };
      });
      r.ghosts = [0.25, 0.5, 0.75].map((f) => { const g = el(r.root, { left: lerp(xL, xR, f) - 30 + "px", top: r.ly2 - 30 + "px", width: "60px", height: "60px", ...fBC(70, 800, 0.86), color: "rgba(255,255,255,.55)", textAlign: "center" }); g.textContent = "×"; return g; });

      /* S4 the six steps */
      r = X.s = { root: layer(13, { background: FOOT ? "transparent" : C.paper }) };
      const rh = FOOT ? 150 : 250, ys = FOOT ? 170 : 190, zn = FOOT ? 84 : 120, lx = FOOT ? 120 : 170, zl = fit("ON VÉRIFIE LA QUALITÉ", W - 2 * M - lx - 90, 800, FOOT ? 76 : 100);
      r.rows = STEPS.map(([n, lab], i) => {
        const y_ = ys + i * rh;
        const bgc = FOOT ? el(r.root, { left: M - 20 + "px", top: y_ - 12 + "px", width: W - 2 * M + 40 + "px", height: rh - 16 + "px", background: "rgba(10,10,10,.62)" }) : null;
        const num = line(r.root, n, zn, C.red, M, y_);
        const lab_ = line(r.root, lab, zl, INK, M + lx, y_ + (zn - zl) * 0.5, 800);
        const ck = el(r.root, { left: W - M - 70 + "px", top: y_ + (zn - 80) * 0.5 + "px", width: "80px", height: "80px", ...fBC(80, 800, 1), color: C.red, textAlign: "center", transformOrigin: "50% 50%" }); ck.textContent = "✓";
        const rule = FOOT ? null : el(r.root, { left: M + "px", top: y_ + rh - 40 + "px", width: W - 2 * M + "px", height: "3px", background: C.ink, transformOrigin: "0 50%" });
        return { bgc, num, lab: lab_, ck, rule, t0: st[i] };
      });

      /* S5 who it's for */
      r = X.a = { root: layer(14, { background: FOOT ? "transparent" : C.red }) };
      const za = fit("MANUFACTURIER.", W - 2 * M, 800, 200), ya = FOOT ? 200 : 150;
      r.ls = AUD.map(([lab], i) => line(r.root, `${lab}${dot(FOOT ? C.red : C.black)}`, za, C.white, M, ya + i * za * 0.9));
      r.at = au.map((x) => x + 0.06);
      if (!FOOT) { const cy = ya + 4 * za * 0.9 + 60; r.cell = cellFoot(r.root, M, cy, W - 2 * M, H - 140 - cy); }

      /* S6 send us your list, we compare */
      r = X.c = { root: layer(15, { background: FOOT ? "transparent" : C.paper }) };
      const yc = FOOT ? 200 : 160;
      const zA = fit("CE QUE T'ACHÈTES,", W - 2 * M, 800, 210), zB = fit("TON PRIX ACTUEL.", W - 2 * M, 800, 210);
      r.a = [line(r.root, "ENVOIE-NOUS", zA, INK, M, yc), line(r.root, `CE QUE T'ACHÈTES${dot(C.red, ",")}`, zA, INK, M, yc + zA * 0.9)];
      r.b = [line(r.root, "ON COMPARE AVEC", zB, INK, M, yc), line(r.root, `TON PRIX ACTUEL${dot()}`, zB, INK, M, yc + zB * 0.9)];
      r.ta = [wt("envoie-nous"), wt("ce")]; r.tb = [wt("on", 4), wt("ton")];
      const cy = yc + Math.max(zA, zB) * 1.8 + 70, rhh = 112, cw = W - 2 * M;
      r.card = el(r.root, { left: M + "px", top: cy + "px", width: cw + "px", height: rhh * ROWS3.length + 36 + "px", background: C.white, borderTop: `10px solid ${C.ink}`, boxShadow: FOOT ? "0 30px 80px rgba(0,0,0,.45)" : "none" });
      r.rows = ROWS3.map(([a, b], i) => {
        const rr = el(r.card, { left: "36px", top: 18 + i * rhh + "px", width: cw - 72 + "px", height: rhh + "px", borderBottom: i < ROWS3.length - 1 ? `2px solid ${C.paper}` : "none", display: "flex", alignItems: "center", justifyContent: "space-between" });
        const l_ = el(rr, { ...fBC(58, 700, 1), color: C.ink, position: "relative" }, "span", ""); l_.textContent = a;
        const q = el(rr, { ...fBC(58, 800, 1), color: C.red, position: "relative" }, "span", ""); q.textContent = "× " + b;
        return rr;
      });
      const by = cy + rhh * ROWS3.length + 36 + 60, bw = (cw - 28) / 2, bh = 280;
      r.left = el(r.root, { left: M + "px", top: by + "px", width: bw + "px", height: bh + "px", background: FOOT ? C.white : C.ink, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 40px", boxSizing: "border-box" });
      const lt = el(r.left, { ...fBC(76, 800, 0.95), color: FOOT ? C.ink : C.white, position: "relative" }, "div", ""); lt.innerHTML = "TON PRIX<br>ACTUEL";
      r.right = el(r.root, { left: M + bw + 28 + "px", top: by + "px", width: bw + "px", height: bh + "px", background: C.red, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", transformOrigin: "50% 50%" });
      const q = el(r.right, { ...fBC(190, 800, 0.9), color: C.white, position: "relative" }, "div", ""); q.textContent = "?";
      const ql = el(r.right, { ...fBC(40, 700, 1, 0.08), color: C.white, position: "relative" }, "div", ""); ql.textContent = "NOTRE PRIX";
      r.vs = el(r.root, { left: M + bw + 14 - 56 + "px", top: by + bh / 2 - 56 + "px", width: "112px", height: "112px", borderRadius: "50%", background: FOOT ? C.white : C.paper, display: "flex", alignItems: "center", justifyContent: "center", ...fBC(52, 800, 1), color: C.ink, transformOrigin: "50% 50%" });
      r.vs.textContent = "VS";

      /* S7 toi, t'as rien à gérer */
      r = X.z = { root: layer(16, { background: FOOT ? "transparent" : C.red }) };
      const zz = fit("T'AS RIEN", W - 2 * M, 800, 340), yz = FOOT ? 260 : 430;
      r.ls = [line(r.root, `TOI${dot(FOOT ? C.red : C.black, ",")}`, 200, C.white, M, yz), line(r.root, "T'AS RIEN", zz, C.white, M, yz + 200 * 0.9), line(r.root, `À GÉRER${dot(FOOT ? C.red : C.black)}`, zz, C.white, M, yz + 180 + zz * 0.9)];
      r.at = [wt("Toi,"), wt("t'as"), wt("gérer.")];
    }

    function paint(t) {
      let r = X.h, on = t < c.s1; disp(r.root, on);
      if (on) { riseAll(r.ls, r.at, t); const k = ez.inOutExpo(pr(t, r.at[5] + 0.12, 0.3)); r.strike.style.transform = `scaleX(${k})`; vis(r.strike, k > 0); }
      r = X.m; on = inR(t, c.s1, c.s2); disp(r.root, on);
      if (on) {
        riseAll(r.ls, r.at, t, 0.3);
        r.rail.style.transform = `scaleY(${clamp((t - r.nodes[0].t0) / (r.nodes[4].t0 - r.nodes[0].t0))})`; vis(r.rail, t >= r.nodes[0].t0);
        r.nodes.forEach((n, i) => {
          const e = ez.outExpo(pr(t, n.t0, 0.3)); T(n.d, { x: (1 - e) * 60, op: e });
          const s = clamp(spring(t - n.t0 - 0.1, 2.4, 7), 0, 1.3); n.tg.style.transform = `scale(${s})`; n.tg.style.opacity = t >= n.t0 + 0.1 ? 1 : 0;
        });
      }
      r = X.d; on = inR(t, c.s2, c.s3 + 0.25); disp(r.root, on);
      if (on) {
        lockupPaint(r.lock, wt("Import-Rama"), t); T(r.lock.g, { x: r.lx, y: r.ly, s: 1 + 0.03 * pr(t, c.s2, 2) }); r.lock.g.style.transformOrigin = "50% 50%";
        riseAll(r.ls, r.at, t);
        const td = wt("direct") - 0.05, k = ez.outExpo(pr(t, td, 0.5));
        r.line.style.transform = `scaleX(${k})`; vis(r.line, t >= td);
        r.ends.forEach((e_, i) => { const s = clamp(spring(t - td - 0.08 * i, 2.4, 7), 0, 1.3); e_.d.style.transform = `scale(${s})`; vis(e_.d, t >= td); T(e_.l, { op: ez.outCubic(pr(t, td + 0.15, 0.3)) }); });
        const fall = pr(t, wt("source") - 0.1, 0.45);
        r.ghosts.forEach((g, i) => { const f = ez.inCubic(clamp(fall * 1.2 - i * 0.1)); T(g, { y: f * 260, r: f * (i - 1) * 40, op: t >= td + 0.15 ? 1 - f : 0 }); });
      }
      r = X.s; on = inR(t, c.s3, c.s4); disp(r.root, on);
      if (on) {
        wipeUp(r.root, t, c.s3);
        r.rows.forEach((row) => {
          const p = pr(t, row.t0 - 0.06, RISE); rise(row.num, p); rise(row.lab, pr(t, row.t0 - 0.02, RISE));
          if (row.bgc) { const e = ez.outExpo(pr(t, row.t0 - 0.1, 0.3)); row.bgc.style.clipPath = `inset(0 ${(1 - e) * 100}% 0 0)`; vis(row.bgc, t >= row.t0 - 0.1); }
          if (row.rule) { row.rule.style.transform = `scaleX(${ez.outExpo(pr(t, row.t0, 0.5))})`; vis(row.rule, t >= row.t0); }
          const s = clamp(spring(t - row.t0 - 0.22, 2.4, 7), 0, 1.3); row.ck.style.transform = `scale(${s})`; vis(row.ck, t >= row.t0 + 0.22);
        });
      }
      r = X.a; on = inR(t, c.s4, c.s5); disp(r.root, on);
      if (on) {
        wipeUp(r.root, t, c.s4);
        const cur = stackSwap(r.ls, r.at, t, C.white);
        if (r.cell) { const sh = AUD[Math.max(0, cur)][2], a0 = au[Math.max(0, cur)]; shotFrame(r.cell, sh, 0.4 + (t - a0)); const k = 0.06 * Math.exp(-Math.max(0, t - a0) / 0.18); r.cell.img.style.transform = `scale(${1.05 + k + 0.02 * (t - a0)})`; }
      }
      r = X.c; on = inR(t, c.s5, c.s6 + 0.25); disp(r.root, on);
      if (on) {
        wipeUp(r.root, t, c.s5);
        const xa = pr(t, r.tb[0] - 0.2, 0.16);
        r.a.forEach((l, i) => rise(l, pr(t, r.ta[i] - 0.06, RISE), xa, i ? 0.4 : 0.3)); r.b.forEach((l, i) => rise(l, pr(t, r.tb[i] - 0.06, RISE), 0, i ? 0.4 : 0.3));
        const ce = ez.outExpo(pr(t, r.ta[0], 0.4)); T(r.card, { y: (1 - ce) * 80, op: ce });
        r.rows.forEach((rr, i) => { const e = ez.outExpo(pr(t, r.ta[1] + i * 0.12, 0.25)); rr.style.clipPath = `inset(0 ${(1 - e) * 100}% 0 0)`; });
        const tp = wt("prix"), tq = wt("actuel.");
        const le = ez.outExpo(pr(t, tp - 0.05, 0.35)), re = ez.outExpo(pr(t, tq - 0.04, 0.35));
        T(r.left, { y: (1 - le) * 120, op: le }); T(r.right, { y: (1 - re) * 120, op: re, s: 1 + 0.06 * Math.exp(-Math.max(0, t - tq) / 0.12) });
        const v = clamp(spring(t - tq - 0.05, 2.4, 7), 0, 1.3); T(r.vs, { s: Math.max(0.001, v), op: t >= tq ? 1 : 0, r: (1 - clamp(v)) * -30 });
      }
      r = X.z; on = inR(t, c.s6, c.end + 0.3); disp(r.root, on);
      if (on) { wipeUp(r.root, t, c.s6); riseAll(r.ls, r.at, t); }
    }
    function cues() {
      X.h.at.forEach((a, i) => cue(a - 0.04, "slam", [0.6, 0.65, 0.4, 0.4, 0.5, 0.7][i])); cue(X.h.at[0] - 0.02, "thump", 0.7);
      cue(X.h.at[5] + 0.12, "zip", 0.4, 0, { dir: 1 }); cue(X.h.at[5] + 0.14, "thump", 0.6);
      cue(c.s1 - 0.12, "air", 0.45, 0, { dir: 1 }); cue(c.s1, "thump", 0.5);
      X.m.at.forEach((a) => cue(a - 0.04, "slam", 0.45));
      X.m.nodes.forEach((n, i) => { cue(n.t0, "tap", 0.4, -0.2); cue(n.t0 + 0.1, i === 4 ? "impact" : "glint", i === 4 ? 0.45 : 0.3, 0.2, { step: i }); });
      cue(c.s2 - 0.25, "air", 0.5, 0, { dir: -1 }); cue(wt("Import-Rama") - 0.02, "thump", 0.85); cue(wt("Import-Rama"), "bloom", 0.5);
      X.d.at.forEach((a, i) => cue(a - 0.05, "slam", 0.5 + 0.1 * i)); cue(wt("direct") - 0.05, "whoosh", 0.4, -0.3);
      cue(wt("source") - 0.05, "zip", 0.3, 0, { dir: -1 });
      cue(c.s3 - 0.2, "air", 0.45, 0, { dir: 1 });
      X.s.rows.forEach((row, i) => { cue(row.t0 - 0.05, "slam", 0.45 + 0.03 * i, [-0.2, 0.2][i % 2]); cue(row.t0 + 0.22, "tap", 0.35, 0.3); cue(row.t0 + 0.24, "glint", 0.25, 0.3, { step: i }); });
      cue(c.s4 - 0.2, "air", 0.45, 0, { dir: 1 }); cue(c.s4, "thump", 0.55);
      X.a.at.forEach((a, i) => { cue(a - 0.05, "slam", 0.5 + 0.05 * i, [-0.25, 0.25, -0.15, 0.15][i]); cue(a - 0.1, "zip", 0.2, 0, { dir: i % 2 ? -1 : 1 }); });
      cue(c.s5 - 0.12, "air", 0.45, 0, { dir: 1 }); X.c.ta.forEach((a) => cue(a - 0.05, "slam", 0.5)); ROWS3.forEach((_, i) => cue(X.c.ta[1] + i * 0.12, "key", 0.4, 0.2, { var: i }));
      cue(X.c.tb[0] - 0.2, "zip", 0.3, 0, { dir: -1 }); X.c.tb.forEach((a) => cue(a - 0.05, "slam", 0.55));
      cue(wt("prix") - 0.05, "thump", 0.5); cue(wt("actuel.") - 0.02, "impact", 0.6); cue(wt("actuel."), "sparkle", 0.25);
      cue(c.s6 - 0.2, "air", 0.5, 0, { dir: 1 }); X.z.at.forEach((a, i) => cue(a - 0.05, "slam", 0.55 + 0.1 * i)); cue(X.z.at[2] - 0.03, "thump", 0.7);
    }
    return {
      end: c.end, shots, endLines: ["PREMIER", "RENDEZ-VOUS", "GRATUIT"], button: "C'EST GRATUIT", build, paint, cues,
      kicks: [[wt("Ton"), 0.03], [wt("fournisseur…"), 0.05], [wt("personne"), 0.025], [wt("challengé?"), 0.05], [wt("Ce"), 0.02], [wt("en"), 0.03],
        [wt("toi."), 0.04], [wt("Import-Rama"), 0.04], [wt("va"), 0.02], [wt("à"), 0.035], ...st.map((x) => [x + 0.06, 0.022]),
        ...au.map((x) => [x + 0.06, 0.03]), [wt("envoie-nous"), 0.02], [wt("on", 4), 0.02], [wt("ton"), 0.03], [wt("actuel."), 0.05], [wt("Toi,"), 0.03], [wt("t'as"), 0.03], [wt("gérer."), 0.05]],
      flashes: [[wt("challengé?"), 0.2], [c.s1, 0.2], [c.s2, 0.3], [c.s4, 0.22], [wt("actuel."), 0.22], [c.s6, 0.25]],
      shakes: [[wt("challengé?"), 14], [wt("toi."), 10], [wt("actuel."), 14], [wt("gérer."), 14]],
      music: { hits: [wt("Ton"), wt("fournisseur…"), wt("challengé?")], stabs: [...STEPS.map(([, , tk]) => wt(tk)), ...au], s2: c.s1, s3: c.s1, s4: c.s2, s5: c.s5, s6: c.end, drop: wt("actuel.") },
    };
  }

  /* ---------- per-video registry ---------- */
  let VX = null;
  const VIDEOS = {
    "1": () => ({
      end: T1.s6, shots: SHOTS1, endLines: ["PRENEZ", "RENDEZ-VOUS", "GRATUITEMENT"], button: "C'EST GRATUIT",
      build() { buildHook(); buildProducts(); buildMonthly(); buildSource(); buildList(); },
      paint(t) { hook(t); products(t); monthly(t); source(t); list(t); },
      cues: cues1,
      endFrom: () => ({ x: M + S.l.bw + 28, y: S.l.by, w: S.l.bw, h: S.l.bh }),
      kicks: [[w(0), 0.03], [w(2), 0.05], [w(3), 0.025], [w(4), 0.025], [w(5), 0.03], [w(9), 0.025], [w(10), 0.05], [w(11), 0.04],
        [w(14), 0.02], [w(17), 0.035], [w(19), 0.02], [w(21), 0.035], [w(22), 0.02], [w(24), 0.03], [w(26), 0.02], [w(27), 0.03], [w(29), 0.05]],
      flashes: [[w(2), 0.18], [T1.s2, 0.22], [T1.s4, 0.3], [w(29), 0.22]],
      shakes: [[w(2), 14], [w(10), 12], [w(29), 14]],
    }),
    "2": () => V2(),
    "3": () => V3(),
  };

  /* ---------- frame ---------- */
  async function seek(t) {
    pending.length = 0;
    footPaint(t); VX.paint(t); end(t); captions(t); fx(t);
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
    VX = VIDEOS[VID]();
    buildFootage(); VX.build(); buildEnd(); buildCaptions(); buildFX(); VX.cues(); cuesEnd();
    await Promise.all([...document.images].map((im) => (im.complete ? 0 : im.decode().catch(() => {}))));
    window.CUES = CUES.map((c) => ({ ...c }));
    window.VO = { file: `assets/imp-ads/vo${VID}.mp3`, offset: OFF };
    window.seek = seek;
    await seek(0);
    return { W, H, FMT: "portrait", cues: CUES.length };
  })();
})();
