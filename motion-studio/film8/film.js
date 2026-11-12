/* Création Virale, brand film v6. Reference: the Doks.ai product-launch film (dark stage, one brand-colour aurora, glass UI
   in soft 3D, macro push-ins, a glossy 3D mark, small confident type, calm tempo). Here the "product" is the agency:
   brief -> launch -> plan -> reels -> results -> tagline -> logo. Timed in steps of the track (0.376 s); bass enters at step 6.
   Pure function of time: window.seek(t). */
(() => {
  const W = 1080, H = 1920;
  const C = { bg: "#04060C", blue: "#2C5BFF", hi: "#5B82FF", pale: "#C9D8FF", lime: "#C6FF3D", white: "#F4F6FB", text: "#DDE3F3", mute: "#8E97AE" };
  const A = "../assets/";
  const stage = document.getElementById("stage");
  Object.assign(stage.style, { width: W + "px", height: H + "px", background: C.bg });
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, t) => a + (b - a) * t;
  const ez = { outExpo: (t) => (t >= 1 ? 1 : t <= 0 ? 0 : 1 - Math.pow(2, -10 * t)), inCubic: (t) => t * t * t, outCubic: (t) => 1 - Math.pow(1 - t, 3),
    io: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2), outBack: (t) => 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2), outQuint: (t) => 1 - Math.pow(1 - t, 5) };
  const hash = (i, s = 0) => { let x = Math.imul(i + 1, 374761393) ^ Math.imul(s + 7, 668265263); x = Math.imul(x ^ (x >>> 13), 1274126177); return ((x ^ (x >>> 16)) >>> 0) / 4294967296; };
  let PER = 0.3764, USES = {}, SPIN = 0;
  const bt = (s) => s * PER;
  const pending = [], S = {};
  const F = (size, weight = 600, track = -0.02, fam = "Geist") => ({ fontFamily: fam, fontSize: size + "px", fontWeight: weight, letterSpacing: track + "em", lineHeight: 1.1 });
  const mk = (parent, style = {}, tag = "div", html = "") => { const e = document.createElement(tag); Object.assign(e.style, style); if (html) e.innerHTML = html; parent.appendChild(e); return e; };
  const abs = (parent, x, y, w, h, style = {}, html = "") => mk(parent, { position: "absolute", left: x + "px", top: y + "px", ...(w != null ? { width: w + "px" } : {}), ...(h != null ? { height: h + "px" } : {}), ...style }, "div", html);
  const show = (e, on) => { const d = on ? "" : "none"; if (e.style.display !== d) e.style.display = d; };
  const p = (s, a, d) => clamp((s - a) / d);                       // progress in steps
  const E = (s, a, d = 1.6) => ez.outExpo(p(s, a, d));
  const GLASS = { background: "linear-gradient(180deg, rgba(24,29,46,.94) 0%, rgba(9,11,19,.94) 100%)", border: "1.5px solid rgba(255,255,255,.14)", boxSizing: "border-box",
    boxShadow: "0 0 0 1px rgba(44,91,255,.22), 0 50px 130px rgba(0,0,0,.6), 0 0 150px rgba(44,91,255,.3), inset 0 1.5px 0 rgba(255,255,255,.2)" };
  const GTEXT = { backgroundImage: "linear-gradient(180deg, #FFFFFF 20%, #B4C6FF 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" };
  const SPARK = (size, col = C.pale) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display:block"><path fill="${col}" d="M12 0C12.9 7.6 16.4 11.1 24 12 16.4 12.9 12.9 16.4 12 24 11.1 16.4 7.6 12.9 0 12 7.6 11.1 11.1 7.6 12 0Z"/></svg>`;
  const scene = () => mk(stage, { position: "absolute", left: "0", top: "0", width: W + "px", height: H + "px", transformStyle: "preserve-3d", transformOrigin: "50% 50%" });
  // scene envelope: zooms in from slightly small, pushes through the lens on the way out
  function env(e, s, a, z, drift = 0.05, origin) {
    const on = s > a - 0.55 && s < z + 0.12; show(e, on); if (!on) return 0;
    const pi = p(s, a - 0.5, 1.5), po = p(s, z - 0.5, 0.6), ei = ez.outExpo(pi), eo = ez.inCubic(po);
    const k = lerp(0.84, 1, ei) * (1 + drift * clamp((s - a) / (z - a))) * (1 + 0.5 * eo);
    e.style.opacity = clamp(pi * 3.2) * (1 - eo); if (origin) e.style.transformOrigin = origin;
    return k;
  }
  const frameOf = (c, id, local) => {
    const u = USES[id]; if (!u) return;
    const i = (Math.max(0, Math.floor(local * 30 + 1e-6)) % u.frames) + 1, src = `${A}broll/f7/${id}/${String(i).padStart(4, "0")}.jpg`;
    if (c.cur !== src) { c.cur = src; c.img.src = src; pending.push(c.img.decode().catch(() => {})); }
  };
  const media = (parent, x, y, w, h, r) => {
    const e = abs(parent, x, y, w, h, { borderRadius: r + "px", overflow: "hidden", background: "#0a0c14", boxShadow: "0 0 0 1.5px rgba(255,255,255,.16), 0 40px 110px rgba(0,0,0,.6), 0 0 120px rgba(44,91,255,.28)" });
    const img = mk(e, { width: "100%", height: "100%", objectFit: "cover", display: "block" }, "img"); img.decoding = "sync";
    const dim = mk(e, { position: "absolute", inset: "0", background: "#04060c", opacity: 0 });
    return { e, img, dim, cur: "" };
  };

  /* ---------- stage dressing: aurora ring, soft centre glow, floating sparks, grain ---------- */
  function buildBg() {
    S.glow = abs(stage, W / 2 - 900, H / 2 - 900, 1800, 1800, { background: "radial-gradient(circle, rgba(44,91,255,.42) 0%, rgba(44,91,255,.14) 36%, rgba(44,91,255,0) 66%)" });
    S.aur = abs(stage, 0, 0, 2400, 2400, { borderRadius: "50%", filter: "blur(46px)", willChange: "transform",
      background: "radial-gradient(circle closest-side, rgba(44,91,255,0) 55%, rgba(44,91,255,.55) 60.5%, rgba(120,160,255,1) 64%, rgba(190,215,255,.95) 65.2%, rgba(64,110,255,.8) 67.5%, rgba(44,91,255,.3) 72%, rgba(44,91,255,0) 78%)" });
    S.sparks = Array.from({ length: 9 }, (_, i) => ({ e: abs(stage, 0, 0, null, null, { opacity: 0.5 }, SPARK(14 + hash(i, 1) * 22, i % 4 === 3 ? C.lime : C.pale)), i }));
  }
  function buildTop() {
    S.vig = abs(stage, 0, 0, W, H, { background: "radial-gradient(ellipse 78% 64% at 50% 50%, rgba(0,0,0,0) 52%, rgba(0,0,0,.6) 100%)", pointerEvents: "none" });
    const cv = document.createElement("canvas"); cv.width = cv.height = 256; const cx = cv.getContext("2d"), im = cx.createImageData(256, 256);
    for (let i = 0; i < 65536; i++) { const v = 128 + (hash(i, 11) + hash(i, 12) + hash(i, 13) - 1.5) * 120; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
    cx.putImageData(im, 0, 0);
    S.grain = abs(stage, -256, -256, W + 512, H + 512, { backgroundImage: `url(${cv.toDataURL()})`, mixBlendMode: "overlay", opacity: 0.09, pointerEvents: "none" });
  }
  function bg(t, s) {
    // aurora: over the title, gone in the UI scenes, back from the lower-left for the logo
    const a0 = 1 - p(s, 5.2, 1.4), a1 = E(s, 45.6, 2.5);
    const cx = a1 > 0 ? 1320 - 60 * a1 : 540 + 30 * Math.sin(t * 0.5), cy = a1 > 0 ? 250 + 80 * (1 - a1) : 1560 - 90 * E(s, -1, 6), r = a1 > 0 ? 1480 : 1180;
    S.aur.style.transform = `translate(${cx - 1200}px,${cy - 1200}px) scale(${(r / 780 / 1.0) * (a1 > 0 ? lerp(1.25, 1, a1) : lerp(1.18, 1, E(s, -1, 5)))}) rotate(${t * 4}deg)`;
    S.aur.style.opacity = Math.max(a0 * clamp(p(s, -1, 1.2) + 0.55), a1) * 0.95;
    S.glow.style.opacity = clamp(p(s, 5.5, 1.5)) * (1 - 0.75 * p(s, 37.6, 1)) * (0.75 + 0.1 * Math.sin(t * 1.3));
    S.glow.style.transform = `translate(${40 * Math.sin(t * 0.4)}px,${-60 + 50 * Math.cos(t * 0.33)}px) scale(${1 + 0.08 * Math.sin(t * 0.7)})`;
    S.sparks.forEach(({ e, i }) => { const x = hash(i, 2) * W + 40 * Math.sin(t * 0.5 + i), y = ((hash(i, 3) * H - t * (18 + hash(i, 4) * 30)) % H + H) % H;
      e.style.transform = `translate(${x}px,${y}px) rotate(${t * 20 + i * 40}deg) scale(${0.6 + 0.4 * Math.sin(t * 1.7 + i * 2)})`; e.style.opacity = 0.18 + 0.3 * (0.5 + 0.5 * Math.sin(t * 1.1 + i)); });
    const f = Math.floor(t * 30 + 1e-6); S.grain.style.transform = `translate(${Math.floor(hash(f, 3) * 256)}px,${Math.floor(hash(f, 4) * 256)}px)`;
  }
  const mline = (parent, html, st) => { const m = mk(parent, { display: "block", overflow: "hidden", paddingBottom: "0.16em", marginBottom: "-0.16em" }); const i = mk(m, { display: "inline-block", whiteSpace: "pre", willChange: "transform", ...st }, "span", html); return { m, i }; };
  const rise = (l, pin) => { l.i.style.transform = `translateY(${(1 - ez.outExpo(clamp(pin))) * 112}%)`; };

  /* ---------- 0 · title ---------- */
  function buildTitle(svg) {
    const sc = scene(); S.t = { sc };
    const lg = abs(sc, W / 2 - 110, 470, 220, 160, {}, svg); const sv = lg.querySelector("svg"); sv.setAttribute("width", "220"); sv.setAttribute("height", "160"); S.t.lg = lg;
    const box = abs(sc, 0, 680, W, 520, { textAlign: "center" });
    S.t.lines = ["Votre business", "mérite", "d’exploser<span style=\"-webkit-text-fill-color:" + C.lime + "\">.</span>"].map((x) => mline(box, x, { ...F(142, 700, -0.045), lineHeight: 1.04, ...GTEXT }));
    const tilt = abs(sc, W / 2 - 400, 1300, 800, 1100, { transformOrigin: "50% 0%", transformStyle: "preserve-3d" });
    S.t.tilt = tilt; S.t.med = media(tilt, 0, 0, 800, 1100, 60);
    mk(S.t.med.e, { position: "absolute", inset: "0", background: "linear-gradient(180deg, rgba(4,6,12,0) 30%, rgba(4,6,12,.85) 100%)" });
  }
  function title(t, s) {
    const T = S.t, k = env(T.sc, s, 0, 6, 0.06); if (!k) return;
    T.sc.style.transform = `scale(${k})`;
    T.lg.style.opacity = E(s, -0.6, 1.5); T.lg.style.transform = `translateY(${(1 - E(s, -0.6, 2)) * 30}px)`;
    T.lines.forEach((l, i) => rise(l, p(s, -0.5 + i * 0.65, 2.2)));
    const e = E(s, 2.4, 3.4);
    T.tilt.style.transform = `translateY(${(1 - e) * 720}px) rotateX(${lerp(64, 44, e)}deg)`; T.tilt.style.opacity = clamp(p(s, 2.4, 0.8));
    frameOf(T.med, "hero2", t + 0.6);
  }

  /* ---------- 1 · the brief: prompt pill, a stack of services, a macro push to the button, click ---------- */
  const BX = 846, BY = 588;                                         // button centre
  function buildBrief() {
    const sc = scene(); const B = (S.b = { sc });
    const pill = abs(sc, 90, 520, 900, 136, { ...GLASS, borderRadius: "68px" }); B.pill = pill;
    abs(pill, 44, 46, null, null, {}, SPARK(42));
    B.txt = abs(pill, 108, 40, 520, 56, { ...F(42, 500, -0.01), color: C.text, whiteSpace: "pre", lineHeight: "56px" });
    B.caret = mk(B.txt, { display: "inline-block", width: "3px", height: "46px", background: C.hi, verticalAlign: "-8px", marginLeft: "4px" }, "span");
    B.btn = abs(pill, 632, 20, 248, 96, { borderRadius: "48px", border: "2.5px solid rgba(255,255,255,.75)", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", ...F(40, 600, -0.01), color: C.white });
    B.btn.innerHTML = `${SPARK(30, "#fff")}<span>Lancer</span>`;
    B.fill = abs(pill, 632, 20, 248, 96, { borderRadius: "48px", background: `linear-gradient(90deg, ${C.hi}, ${C.blue})`, boxShadow: "0 0 60px rgba(91,130,255,.9), inset 0 2px 0 rgba(255,255,255,.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", ...F(40, 600, -0.01), color: "#fff" });
    B.fill.innerHTML = `${SPARK(30, "#fff")}<span>Lancer</span>`;
    B.rip = [0, 1].map(() => abs(sc, 90 + 632, 520 + 20, 248, 96, { borderRadius: "48px", border: "2px solid rgba(160,190,255,.8)", boxSizing: "border-box" }));
    const row = (y, w, label, st, h = 132) => { const e = abs(sc, (W - w) / 2, y, w, h, { borderRadius: "34px", boxSizing: "border-box", transformOrigin: "50% 100%", ...st });
      abs(e, 34, 34, 64, 64, { borderRadius: "50%", border: "3px solid currentColor", boxSizing: "border-box", opacity: 0.85 }); abs(e, 55, 55, 22, 22, { borderRadius: "50%", background: "currentColor" });
      abs(e, 124, 36, null, null, { ...F(46, 600, -0.02), whiteSpace: "pre", lineHeight: "60px" }, label); return e; };
    B.rows = [
      row(840, 700, "Stratégie", { background: "linear-gradient(90deg, #E9EFFF, #B9CBFF)", color: "#0B1230", boxShadow: "0 0 90px rgba(150,180,255,.5)" }),
      row(960, 800, "Tournage", { background: `linear-gradient(90deg, ${C.hi}, ${C.blue})`, color: "#fff", boxShadow: "0 0 110px rgba(44,91,255,.8), inset 0 2px 0 rgba(255,255,255,.35)" }),
      row(1084, 900, "Montage", { ...GLASS, color: C.white }, 470),
    ];
    B.lines = ["Sous-titres dynamiques", "Musique et rythme", "Formats verticaux"].map((x, i) => abs(B.rows[2], 44, 150 + i * 96, 800, 70, { ...F(40, 500, -0.01), color: C.text, display: "flex", alignItems: "center", gap: "22px" },
      `<span style="display:inline-flex;width:46px;height:46px;border-radius:14px;background:rgba(91,130,255,.22);align-items:center;justify-content:center;color:${C.pale};font-size:28px">✓</span>${x}`));
    B.m1 = abs(sc, 40, 1420, 330, 330, {}, `<img src="${A}broll/gen/mark.png" style="width:100%;height:100%;display:block">`);
    B.m2 = abs(sc, 880, 1330, 150, 150, {}, `<img src="${A}broll/gen/mark.png" style="width:100%;height:100%;display:block">`);
    B.cur = abs(sc, 0, 0, 60, 60, { borderRadius: "50%", border: "4px solid rgba(255,255,255,.92)", boxSizing: "border-box", boxShadow: "0 0 24px rgba(160,190,255,.8)" });
  }
  const BRIEF = "Faire exploser mes vues";
  function brief(t, s) {
    const B = S.b, k0 = env(B.sc, s, 6, 14, 0.03); if (!k0) return;
    const z = ez.io(p(s, 9.7, 1.7)), k = k0 * lerp(1, 2.55, z);         // macro push on the button
    B.sc.style.transformOrigin = `${BX}px ${BY}px`;
    B.sc.style.transform = `translate(${(W / 2 - BX) * z}px,${(H * 0.46 - BY) * z}px) scale(${k})`;
    const e0 = E(s, 5.7, 1.8); B.pill.style.transform = `translateY(${(1 - e0) * -60}px)`; B.pill.style.opacity = clamp(p(s, 5.7, 0.6));
    const n = Math.floor(BRIEF.length * clamp(p(s, 6.4, 2.6))); if (B.n !== n) { B.n = n; B.txt.firstChild && B.txt.firstChild.nodeType === 3 ? (B.txt.firstChild.nodeValue = BRIEF.slice(0, n)) : B.txt.insertBefore(document.createTextNode(BRIEF.slice(0, n)), B.caret); }
    B.caret.style.opacity = Math.floor(t * 2.6) % 2 ? 0.2 : 1;
    B.rows.forEach((r, i) => { const e = ez.outBack(p(s, 6.35 + i * 0.75, 1.5)), o = clamp(p(s, 6.35 + i * 0.75, 0.5));
      r.style.transform = `translateY(${(1 - e) * 240}px) rotateX(${lerp(58, [14, 8, 0][i], clamp(e))}deg) scale(${lerp(0.9, 1, clamp(e))})`; r.style.opacity = o; });
    B.lines.forEach((l, i) => { const e = E(s, 8.7 + i * 0.3, 1.2); l.style.opacity = e; l.style.transform = `translateX(${(1 - e) * 30}px)`; });
    [B.m1, B.m2].forEach((m, i) => { const e = ez.outBack(p(s, 7.6 + i * 0.6, 1.8)); m.style.opacity = clamp(p(s, 7.6 + i * 0.6, 0.5)); m.style.transform = `translateY(${(1 - e) * 160 + 14 * Math.sin(t * 1.6 + i * 2)}px) rotate(${[-16, 14][i] + 4 * Math.sin(t * 1.1 + i)}deg) scale(${lerp(0.5, 1, clamp(e))})`; });
    // cursor: arrives on the button, presses on step 12
    const c = ez.io(p(s, 10.3, 1.5)), press = p(s, 11.85, 0.3) * (1 - p(s, 12.15, 0.5));
    B.cur.style.opacity = clamp(p(s, 10.2, 0.5)); B.cur.style.transform = `translate(${lerp(BX + 150, BX + 44, c) - 30}px,${lerp(BY + 330, BY + 26, c) - 30}px) scale(${1 - 0.3 * press})`;
    const on = E(s, 12, 0.9); B.fill.style.opacity = on; B.btn.style.opacity = 1 - on; B.fill.style.transform = B.btn.style.transform = `scale(${1 - 0.06 * press + 0.04 * on * (1 - p(s, 12.2, 1))})`;
    B.rip.forEach((r, i) => { const q = p(s, 12 + i * 0.35, 1.6); r.style.opacity = q > 0 ? 0.8 * (1 - q) : 0; r.style.transform = `scale(${1 + 0.42 * ez.outCubic(q)}, ${1 + 0.9 * ez.outCubic(q)})`; });
  }

  /* ---------- 2 · the plan: a glowing bar becomes a question, the answer writes itself ---------- */
  const PLAN = [["Voici le plan :", ""], ["1.", "<b>Stratégie</b> — on cible vos clients"], ["2.", "<b>Tournage</b> — on filme chez vous"], ["3.", "<b>Montage</b> — rythmé, sous-titré"], ["4.", "<b>Diffusion</b> — au bon moment"]];
  function buildPlan() {
    const sc = scene(); const P_ = (S.p = { sc });
    P_.col = abs(sc, 0, 0, W, H, { transformOrigin: "50% 45%" });
    const ring = (y) => abs(P_.col, 86, y, 70, 70, { borderRadius: "50%", border: "2.5px solid rgba(180,200,255,.6)", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" });
    P_.r1 = ring(655); P_.r1.innerHTML = SPARK(30); P_.r2 = ring(858); P_.r2.innerHTML = `<span style="font:600 24px 'Geist Mono';color:${C.pale}">CV</span>`;
    P_.bar = abs(P_.col, 190, 620, 640, 140, { borderRadius: "26px", background: "linear-gradient(90deg, #E4ECFF 0%, #9DB6FF 55%, #5B82FF 100%)", boxShadow: "0 0 110px rgba(110,150,255,.95), 0 0 30px rgba(200,220,255,.8), inset 0 2px 0 rgba(255,255,255,.8)", transformOrigin: "0 50%" });
    P_.q = abs(P_.col, 190, 620, 800, 140, { ...GLASS, borderRadius: "26px", display: "flex", alignItems: "center", padding: "0 40px", ...F(42, 500, -0.015), color: C.white, whiteSpace: "pre" }, "Comment faire exploser mes vues ?");
    P_.a = abs(P_.col, 190, 824, 800, 140, { ...GLASS, borderRadius: "26px", overflow: "hidden" });
    P_.dots = [0, 1, 2].map((i) => abs(P_.a, 44 + i * 30, 60, 16, 16, { borderRadius: "50%", background: C.pale }));
    P_.ls = PLAN.map(([n, x], i) => abs(P_.a, 42, 40 + i * 104 + (i ? 14 : 0), 720, 70, { ...F(i ? 39 : 40, i ? 400 : 600, -0.012), color: i ? C.text : C.white, whiteSpace: "pre", lineHeight: "70px" },
      i ? `<span style="font-family:'Geist Mono';font-weight:500;color:${C.hi};margin-right:20px">${n}</span>${x.replace("<b>", `<b style="color:#fff;font-weight:600">`)}` : n));
  }
  function plan(t, s) {
    const P_ = S.p, k = env(P_.sc, s, 14, 22, 0.05); if (!k) return;
    P_.sc.style.transform = `scale(${k})`; P_.col.style.transform = `translateY(${200 - 170 * ez.io(p(s, 16.4, 5))}px) translateX(-22px) scale(1.14)`;
    const eb = ez.outBack(p(s, 13.8, 1.6)), m = ez.io(p(s, 15.5, 1.1));
    P_.bar.style.transform = `translateY(${8 * Math.sin(t * 2)}px) scale(${lerp(0.4, 1, clamp(eb)) * lerp(1, 1.25, m)}, ${lerp(0.4, 1, clamp(eb))})`; P_.bar.style.opacity = clamp(p(s, 13.8, 0.4)) * (1 - m);
    P_.q.style.opacity = m; P_.r1.style.opacity = E(s, 14.3, 1); P_.r1.style.transform = `scale(${lerp(0.5, 1, E(s, 14.3, 1.2))}) rotate(${t * 30}deg)`;
    const ea = E(s, 16.4, 1.2), grow = ez.io(p(s, 17.3, 3.4));
    P_.a.style.opacity = ea; P_.a.style.transform = `translateY(${(1 - ea) * 40}px)`; P_.a.style.height = lerp(140, 600, grow) + "px"; P_.r2.style.opacity = ea;
    P_.dots.forEach((d, i) => { d.style.opacity = (1 - p(s, 17.3, 0.4)) * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 9 - i * 1.1))); d.style.transform = `translateY(${-6 * Math.max(0, Math.sin(t * 9 - i * 1.1))}px)`; });
    P_.ls.forEach((l, i) => { const e = E(s, 17.5 + i * 0.85, 1.3); l.style.opacity = e; l.style.transform = `translateY(${(1 - e) * 26}px)`; });
  }

  /* ---------- 3 · the reels: phones on a ring, real client footage ---------- */
  const PH = ["hero1", "hero3", "res0", "hero0"], LAB = ["Reels Instagram", "TikTok"];
  function buildReels() {
    const sc = scene(); const R = (S.r = { sc });
    R.ring = abs(sc, W / 2, 1010, 0, 0, { transformStyle: "preserve-3d" });
    R.ph = PH.map((id) => ({ ...media(R.ring, -240, -427, 480, 854, 58), id }));
    R.chip = LAB.map((x) => abs(sc, 0, 372, W, 90, { display: "flex", justifyContent: "center" }, `<div style="display:inline-flex;align-items:center;gap:16px;height:90px;padding:0 38px;border-radius:45px;background:rgba(14,17,28,.9);border:1.5px solid rgba(255,255,255,.2);box-shadow:0 0 70px rgba(44,91,255,.5);font:600 42px Geist;letter-spacing:-.015em;color:#fff">${SPARK(30)}<span>${x}</span></div>`));
    R.cap = abs(sc, 0, 1560, W, 70, { textAlign: "center", ...F(44, 500, -0.015), color: C.text }, `Des vidéos pensées pour <span style="color:#fff;font-weight:700">vos clients</span>.`);
  }
  function reels(t, s) {
    const R = S.r, k = env(R.sc, s, 22, 30, 0.05); if (!k) return;
    R.sc.style.transform = `scale(${k})`;
    const rot = ez.io(p(s, 25.5, 1.5)) + 0.06 * p(s, 22, 3.5) + 0.06 * p(s, 27, 3), ein = E(s, 21.6, 2.2);
    R.ring.style.transform = `rotateX(${lerp(22, 5, ein)}deg) translateZ(${lerp(-500, 0, ein)}px)`;
    R.ph.forEach((ph, i) => { const th = ((i - 1 - rot) * 35 * Math.PI) / 180, RAD = 1050, c = Math.cos(th);
      ph.e.style.transform = `translate3d(${RAD * Math.sin(th)}px,${14 * Math.sin(t * 1.5 + i)}px,${RAD * c - RAD}px) rotateY(${(th * 180) / Math.PI}deg)`;
      ph.dim.style.opacity = clamp((1 - c) * 9, 0, 0.62); frameOf(ph, ph.id, t - bt(22) + 0.5 + i * 0.2); });
    R.chip.forEach((c, i) => { const a = i === 0 ? E(s, 22.3, 1.2) * (1 - p(s, 25.3, 0.5)) : E(s, 26.1, 1.2); c.style.opacity = a; c.style.transform = `translateY(${(1 - a) * 24}px)`; });
    const ec = E(s, 23.2, 1.4); R.cap.style.opacity = ec; R.cap.style.transform = `translateY(${(1 - ec) * 26}px)`;
  }

  /* ---------- 4 · results: a glass panel of client tiles, tilt + macro, the numbers lift off the glass ---------- */
  const TILES = [["res0", "Sushi X", "59×"], ["res1", "Au Petit Chalet", "18×"], ["hero3", "Mexicanos", "14×"], ["wall8", "Nacho Pub"], ["wall6", "Poulet Royal"], ["wall3", "Steak Avenue"]];
  function buildResults() {
    const sc = scene(); const G = (S.g = { sc });
    G.head = abs(sc, 0, 300, W, 90, { display: "flex", justifyContent: "center", alignItems: "center", gap: "20px", ...F(66, 600, -0.03), color: C.white }, `${SPARK(46)}<span></span>`); G.hs = G.head.querySelector("span");
    G.pan = abs(sc, 80, 450, 920, 1150, { ...GLASS, borderRadius: "50px", transformStyle: "preserve-3d", transformOrigin: "50% 34%" });
    G.sub = abs(G.pan, 0, 48, 920, 60, { textAlign: "center", ...F(40, 500, -0.01), color: C.text }, "Nos clients, en chiffres");
    G.t = TILES.map(([id, name, n], i) => { const x = 48 + (i % 3) * 284, y = 150 + Math.floor(i / 3) * 478;
      const m = media(G.pan, x, y, 256, 440, 30); m.e.style.boxShadow = "0 0 0 1.5px rgba(255,255,255,.18)";
      mk(m.e, { position: "absolute", left: "0", right: "0", bottom: "0", height: "150px", background: "linear-gradient(180deg, rgba(4,6,12,0), rgba(4,6,12,.9))" });
      mk(m.e, { position: "absolute", left: "18px", bottom: "16px", ...F(25, 600, -0.01), color: "#fff", whiteSpace: "pre" }, "div", name);
      const chip = n ? abs(G.pan, x + 128 - 92, y + 150, 184, 104, { borderRadius: "52px", background: "rgba(8,10,18,.82)", border: `2.5px solid ${C.lime}`, boxSizing: "border-box", boxShadow: "0 24px 60px rgba(0,0,0,.6), 0 0 50px rgba(198,255,61,.35)", display: "flex", alignItems: "center", justifyContent: "center", ...F(60, 800, -0.04), color: "#fff" }, n.replace("×", `<span style="color:${C.lime}">×</span>`)) : null;
      return { ...m, id, chip, i }; });
  }
  const HEAD = "Des résultats réels";
  function results(t, s) {
    const G = S.g, k = env(G.sc, s, 30, 38, 0.02); if (!k) return;
    const z = ez.io(p(s, 33.5, 1.9)), d = p(s, 34, 4);
    G.sc.style.transform = `scale(${k})`;
    const n = Math.floor(HEAD.length * clamp(p(s, 30.2, 1.8))); if (G.n !== n) { G.n = n; G.hs.textContent = HEAD.slice(0, n); }
    G.head.style.opacity = E(s, 29.9, 1) * (1 - z);
    const ep = E(s, 29.8, 2);
    G.pan.style.transform = `translateY(${(1 - ep) * 160 + 60 * z}px) rotateX(${lerp(16, 0, ep) + 34 * z}deg) rotateZ(${-(8 - 3 * d) * z}deg) scale(${1 + 0.36 * z + 0.05 * d * z})`; G.pan.style.opacity = clamp(p(s, 29.8, 0.6));
    G.t.forEach((m) => { const e = ez.outBack(p(s, 30.5 + m.i * 0.28, 1.4)); m.e.style.opacity = clamp(p(s, 30.5 + m.i * 0.28, 0.5)); m.e.style.transform = `scale(${lerp(0.7, 1, clamp(e))})`;
      frameOf(m, m.id, t - bt(30) + 0.4 + m.i * 0.3);
      if (m.chip) { const c = ez.outBack(p(s, 34.6 + m.i * 0.7, 1.3)); m.chip.style.opacity = clamp(p(s, 34.6 + m.i * 0.7, 0.4)); m.chip.style.transform = `translateZ(${lerp(10, 130, clamp(c))}px) scale(${lerp(0.4, 1, clamp(c))})`; } });
  }

  /* ---------- 5 · the mark spins down into the sentence ---------- */
  function buildLine() {
    const sc = scene(); const L = (S.l = { sc });
    L.l1 = abs(sc, 0, 860, W, 80, { textAlign: "center", ...F(64, 500, -0.025), color: C.text, whiteSpace: "pre" });
    L.w = ["Et si votre", " prochaine", " vidéo"].map((x) => mk(L.l1, { display: "inline-block" }, "span", x));
    L.l2 = abs(sc, 0, 962, W, 90, { display: "flex", justifyContent: "center", alignItems: "center", gap: "22px", ...F(70, 700, -0.03), color: C.white, whiteSpace: "pre" }, `<span style="display:inline-block;width:104px;height:104px"></span><span>changeait tout ?</span>`);
    L.slot = L.l2.firstChild; L.t2 = L.l2.lastChild;
    L.mark = abs(sc, 0, 0, 640, 640, { transformOrigin: "0 0" }); L.img = mk(L.mark, { width: "100%", height: "100%", display: "block" }, "img"); L.img.decoding = "sync"; L.cur = "";
  }
  function line(t, s) {
    const L = S.l, k = env(L.sc, s, 38, 46, 0.04); if (!k) return;
    L.sc.style.transform = `scale(${k})`;
    if (!L.sx) { const r = L.slot.getBoundingClientRect(), q = L.sc.getBoundingClientRect(), f = W / q.width; L.sx = (r.left - q.left) * f; L.sy = (r.top - q.top) * f; }
    const sh = ez.io(p(s, 39.3, 1.9)), sz = lerp(640, 104, sh), x = lerp(W / 2 - 320, L.sx, sh), y = lerp(H * 0.46 - 320, L.sy, sh);
    const src = SPIN ? `${A}broll/gen/spin/${String((Math.floor(clamp((t - bt(37.6)) / (PER * 5.4)) * (SPIN - 1) * 1) % SPIN) + 1).padStart(4, "0")}.png` : `${A}broll/gen/mark.png`;
    if (L.cur !== src) { L.cur = src; L.img.src = src; pending.push(L.img.decode().catch(() => {})); }
    const pop = ez.outBack(p(s, 37.7, 1.5));
    L.mark.style.transform = `translate(${x}px,${y + 10 * Math.sin(t * 2) * (1 - sh)}px) scale(${(sz / 640) * lerp(0.3, 1, clamp(pop))})` + (SPIN ? "" : ` `);
    if (!SPIN) L.img.style.transform = `rotateY(${(1 - ez.outCubic(p(s, 37.7, 4))) * 720}deg)`;
    L.mark.style.opacity = clamp(p(s, 37.7, 0.4));
    L.w.forEach((w, i) => { const e = E(s, 41.0 + i * 0.55, 1.2); w.style.opacity = e; w.style.transform = `translateY(${(1 - e) * 22}px)`; });
    const e2 = E(s, 42.8, 1.4); L.t2.style.opacity = e2; L.t2.style.transform = `translateX(${(1 - e2) * -30}px)`;
  }

  /* ---------- 6 · logo ---------- */
  function buildLogo(svg) {
    const sc = scene(); const O = (S.o = { sc });
    O.lg = abs(sc, W / 2 - 330, 600, 660, 480, { transformOrigin: "50% 50%" }, svg); const sv = O.lg.querySelector("svg"); sv.setAttribute("viewBox", "0 0 221 160"); sv.setAttribute("width", "660"); sv.setAttribute("height", String(Math.round((660 * 160) / 221)));
    O.cta = abs(sc, 0, 1180, W, 70, { display: "flex", justifyContent: "center", alignItems: "center", gap: "16px", ...F(44, 500, -0.015), color: C.pale }, `${SPARK(30)}<span>Parlons de votre projet</span>`);
  }
  function logo(t, s) {
    const O = S.o, k = env(O.sc, s, 46, 60, 0.07); if (!k) return;
    O.sc.style.transform = `scale(${k})`;
    const e = E(s, 45.8, 2.4); O.lg.style.opacity = clamp(p(s, 45.8, 0.9)); O.lg.style.transform = `scale(${lerp(0.86, 1, e)})`;
    const c = E(s, 48, 1.6); O.cta.style.opacity = c; O.cta.style.transform = `translateY(${(1 - c) * 24}px)`;
  }

  /* ---------- sound cues (audio/mix8.py) ---------- */
  const CUES = [];
  const cue = (step, type, gain = 1, pan = 0, x = {}) => CUES.push({ step, type, gain, pan, ...x });
  function buildCues() {
    cue(0, "swell", 0.8, 0, { dur: 1.6 }); [0, 0.65, 1.3].forEach((b, i) => cue(b + 0.2, "tick", 0.5, [-0.2, 0, 0.2][i])); cue(2.6, "whoosh", 0.55, 0, { v: 2 });
    cue(6, "sub", 1.0); cue(6, "whoosh", 0.8, 0, { v: 0 }); cue(6.4, "typing", 0.6, -0.15, { dur: 2.6 * 0.3764 });
    [6.35, 7.1, 7.85].forEach((b, i) => cue(b + 0.25, "pop", 0.7, [-0.25, 0, 0.25][i], { pitch: i * 2 }));
    cue(10.4, "whoosh", 0.75, 0.2, { v: 1 }); cue(12, "click", 1.0, 0.1); cue(12, "thud", 0.8); cue(12.05, "shimmer", 0.7);
    cue(14, "whoosh", 0.8, -0.2, { v: 0 }); cue(14, "bloom", 0.9); cue(15.9, "tick", 0.6); cue(16.6, "pop", 0.5, 0.1, { pitch: 3 });
    [0, 1, 2, 3, 4].forEach((i) => cue(17.5 + i * 0.85 + 0.1, "blip", 0.5, -0.1, { pitch: i }));
    cue(22, "whoosh", 0.9, 0, { v: 1 }); cue(22, "thud", 0.9); cue(25.9, "whoosh", 0.7, 0.4, { v: 2 }); cue(26.2, "tick", 0.5);
    cue(30, "whoosh", 0.85, -0.2, { v: 0 }); cue(30, "thud", 0.8); [0, 1, 2, 3, 4, 5].forEach((i) => cue(30.6 + i * 0.28, "tick", 0.35, -0.3 + i * 0.12));
    cue(34, "whoosh", 0.9, 0, { v: 1 }); cue(34.3, "sub", 0.7); [0, 1, 2].forEach((i) => cue(34.75 + i * 0.7, "pop", 0.8, -0.3 + i * 0.3, { pitch: 4 + i * 2 }));
    cue(38, "swell", 0.7, 0, { dur: 0.9 }); cue(38, "thud", 0.7); cue(39.6, "whoosh", 0.6, 0, { v: 2 }); [0, 1, 2].forEach((i) => cue(40.4 + i * 0.7, "tick", 0.45)); cue(42.7, "blip", 0.6, 0, { pitch: 5 });
    cue(46, "swell", 0.9, 0, { dur: 1.2 }); cue(46, "sub", 0.9); cue(46, "bloom", 1.0); cue(48.1, "blip", 0.5, 0, { pitch: 7 }); cue(54, "end", 1);
  }

  async function seek(t) {
    pending.length = 0; const s = t / PER;
    bg(t, s); title(t, s); brief(t, s); plan(t, s); reels(t, s); results(t, s); line(t, s); logo(t, s);
    await Promise.all(pending);
  }
  window.ready = (async () => {
    const [beats, uses, svg, spin] = await Promise.all([
      fetch("../beats8.json").then((r) => r.json()), fetch("../assets/broll/f7.json").then((r) => r.json()), fetch("../assets/brand/logo-white.svg").then((r) => r.text()),
      fetch("../assets/broll/gen/spin.json").then((r) => (r.ok ? r.json() : { frames: 0 })).catch(() => ({ frames: 0 })),
      ...["400", "500", "600", "700", "800"].map((w) => document.fonts.load(`${w} 60px Geist`)), document.fonts.load('500 30px "Geist Mono"'),
    ]);
    PER = beats.period; USES = uses; SPIN = spin.frames || 0;
    buildBg(); buildTitle(svg); buildBrief(); buildPlan(); buildReels(); buildResults(); buildLine(); buildLogo(svg); buildTop(); buildCues();
    window.CUES = CUES.map((c) => ({ ...c, t: bt(c.step), per: PER }));
    await seek(0);
    return { FMT: "portrait" };
  })();
  window.seek = seek;
})();
