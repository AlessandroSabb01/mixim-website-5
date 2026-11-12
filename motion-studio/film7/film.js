/* Création Virale, brand film v6: 16 s, one continuous 3D camera move through type and real client footage.
   Structure follows the track (32 beats): B0-4 hook on the build, B4-8 "d'exploser." held over the pre-drop silence,
   B8 the drop -> a curved wall of client reels (4 service words), B16 results, B20 total on brand blue,
   B24 tagline, B28 logo. Pure function of time: window.seek(t). No whole-frame shakes or flashes; only the camera path. */
(() => {
  const W = 1080, H = 1920, P = 1500;
  const C = { bg: "#050608", blue: "#2C5BFF", blueHi: "#5B82FF", lime: "#C6FF3D", white: "#F4F5F8", mute: "#9AA1B4" };
  const A = "../assets/";
  const stage = document.getElementById("stage");
  Object.assign(stage.style, { width: W + "px", height: H + "px", background: C.bg });
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, t) => a + (b - a) * t;
  const ez = {
    outExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)), inExpo: (t) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
    outCubic: (t) => 1 - Math.pow(1 - t, 3), inCubic: (t) => t * t * t, outQuint: (t) => 1 - Math.pow(1 - t, 5),
    io: (t, p = 4) => (t < 0.5 ? Math.pow(2 * t, p) / 2 : 1 - Math.pow(2 - 2 * t, p) / 2),
    outBack: (t) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2),
  };
  const hash = (i, s = 0) => { let x = Math.imul(i + 1, 374761393) ^ Math.imul(s + 7, 668265263); x = Math.imul(x ^ (x >>> 13), 1274126177); return ((x ^ (x >>> 16)) >>> 0) / 4294967296; };
  let BTS = [0], PER = 0.4644, USES = {};
  const bt = (b) => BTS[0] + b * PER, tb = (t) => (t - BTS[0]) / PER;
  const pending = [];
  const F = (size, weight = 800, track = -0.045, fam = "Geist") => ({ fontFamily: fam, fontSize: size + "px", fontWeight: weight, letterSpacing: track + "em", lineHeight: 1 });
  const mk = (parent, style = {}, tag = "div", html = "") => { const e = document.createElement(tag); Object.assign(e.style, style); if (html) e.innerHTML = html; parent.appendChild(e); return e; };

  /* ---------- world + camera ---------- */
  const world = mk(stage, { position: "absolute", left: W / 2 + "px", top: H / 2 + "px", width: "0", height: "0", transformStyle: "preserve-3d" });
  const obj = (w, h, style = {}, html = "") => mk(world, { position: "absolute", left: -w / 2 + "px", top: -h / 2 + "px", width: w + "px", height: h + "px", ...style }, "div", html);
  const put = (e, x, y, z, o = {}) => { e.style.transform = `translate3d(${x}px,${y}px,${z}px) rotateY(${o.ry || 0}deg) rotateX(${o.rx || 0}deg) rotateZ(${o.rz || 0}deg) scale(${o.s ?? 1})`; };
  const show = (e, on) => { const d = on ? "" : "none"; if (e.style.display !== d) e.style.display = d; };
  const hud = mk(stage, { position: "absolute", inset: "0", width: W + "px", height: H + "px", pointerEvents: "none" });

  const ZW = -9000, RX = 7000, RY2 = 4200, RY3 = 8400, ZT = ZW - 4200, ZL = ZT - 2600;
  const PITCH = [540, 900], CARD = [480, 853];
  const cell = (c, r) => ({ x: (c - 2) * PITCH[0], y: (r - 1) * PITCH[1], z: ZW + 70 * (c - 2) * (c - 2), ry: -(c - 2) * 7 });
  const HEROES = [[2, 1], [4, 0], [0, 1], [3, 2]];
  const HZ = 600;                                                // push-in on a hero card (scale ~1.67)
  const hc = HEROES.map(([c, r]) => cell(c, r));
  // camera keys: focus point, orbit, push. `w` = [beats before, beats after] of the move around the beat; d* = drift per beat while holding
  const K = [
    { b: -2, f: [0, 0, 0], ry: -7, rx: 2, rz: -1.5, dz: -700 },
    { b: 0, f: [0, 0, 0], ry: -5, rx: 2, rz: -1, dz: -60, w: [0.6, 0.9], ddz: 45, dry: 2.2 },
    { b: 2, f: [0, 0, -1600], ry: 6, rx: -2, rz: 1.2, dz: -40, w: [0.3, 0.7], ddz: 50, dry: -2.5 },
    { b: 4, f: [0, 0, -3200], ry: 0, rx: 0, rz: 0, dz: -330, w: [0.45, 0.8], ddz: 62, dry: 0 },
    { b: 8, f: [hc[0].x, hc[0].y, hc[0].z], ry: -9, rx: 1.5, rz: -1.5, dz: HZ - 80, w: [0.12, 1.0], ddz: 40, dry: 2.5 },
    { b: 10, f: [hc[1].x, hc[1].y, hc[1].z], ry: -3, rx: -3, rz: 2, dz: HZ - 60, w: [0.28, 0.6], ddz: 40, dry: -2 },
    { b: 12, f: [hc[2].x, hc[2].y, hc[2].z], ry: 4, rx: 0, rz: -2, dz: HZ - 60, w: [0.28, 0.6], ddz: 40, dry: 2 },
    { b: 14, f: [hc[3].x, hc[3].y, hc[3].z], ry: -12, rx: 3, rz: 1.5, dz: HZ - 60, w: [0.28, 0.6], ddz: 40, dry: 2.4 },
    { b: 16, f: [RX, 0, ZW], ry: -9, rx: 0, rz: 0, dz: -40, w: [0.3, 0.65], ddz: 45, dry: 3.2 },
    { b: 18, f: [RX, RY2, ZW], ry: 9, rx: 0, rz: 0, dz: -40, w: [0.3, 0.65], ddz: 45, dry: -3.2 },
    { b: 20, f: [RX, RY3, ZW], ry: 0, rx: 0, rz: 0, dz: -420, w: [0.3, 0.7], ddz: 85, dry: 0 },
    { b: 24, f: [RX, RY3, ZT], ry: 0, rx: 0, rz: 0, dz: -120, w: [0.22, 0.85], ddz: 36, dry: 0 },
    { b: 28, f: [RX, RY3, ZL], ry: 0, rx: 0, rz: 0, dz: -260, w: [0.25, 0.9], ddz: 42, dry: 0 },
  ];
  function camAt(b) {
    const val = (k) => { const h = Math.max(0, b - k.b); return [k.f[0], k.f[1], k.f[2], k.ry + (k.dry || 0) * h, k.rx, k.rz, k.dz + (k.ddz || 0) * h]; };
    let v = val(K[0]);
    for (let i = 1; i < K.length; i++) {
      const k = K[i], [wi, wo] = k.w, p = clamp((b - (k.b - wi)) / (wi + wo));
      if (p <= 0) break;
      // most of the travel lands on the beat: a short ease-in, a long expo settle
      const split = wi / (wi + wo), e = p < split ? 0.5 * ez.inCubic(p / split) * 0.6 : 0.3 + 0.7 * ez.outExpo((p - split) / (1 - split));
      const n = val(k); v = v.map((a, j) => lerp(a, n[j], e));
    }
    return { x: v[0], y: v[1], z: v[2], ry: v[3], rx: v[4], rz: v[5], dz: v[6] };
  }

  /* ---------- atmosphere: glows in depth, dust for parallax, grain + vignette on the lens ---------- */
  const glows = [], dust = [];
  function buildAtmos() {
    const g = (x, y, z, d, a, col = "44,91,255") => { const e = obj(d, d, { background: `radial-gradient(circle, rgba(${col},${a}) 0%, rgba(${col},${a * 0.35}) 34%, rgba(${col},0) 68%)` }); put(e, x, y, z); glows.push({ e, x, y, z }); return e; };
    S.gHook = g(0, 120, -4700, 4200, 0.75);
    g(0, 0, ZW - 1400, 7800, 0.6); g(-900, 1300, ZW - 900, 3600, 0.35, "110,70,255");
    g(RX + 300, 300, ZW - 1300, 4600, 0.6); g(RX - 300, RY2 + 200, ZW - 1300, 4600, 0.6);
    g(RX, RY3, ZT - 1500, 3800, 0.55); g(RX, RY3 + 200, ZL - 1300, 4400, 0.7);
    const zones = [[0, 0, -2600, 1500, 2200, 3800, 70], [0, 0, ZW + 500, 2200, 2200, 1300, 70], [RX, RY2, ZW + 200, 1500, 6800, 1300, 90], [RX, RY3, ZT - 600, 1300, 1900, 3600, 80]];
    let k = 0;
    for (const [cx, cy, cz, sx, sy, sz, n] of zones) for (let i = 0; i < n; i++, k++) {
      const r = hash(k, 5), s = 4 + hash(k, 4) * 9, col = r < 0.7 ? "244,245,248" : r < 0.9 ? "91,130,255" : "198,255,61";
      const e = obj(s, s, { borderRadius: "50%", background: `rgba(${col},${0.25 + hash(k, 6) * 0.5})` });
      dust.push({ e, x: cx + (hash(k, 1) - 0.5) * 2 * sx, y: cy + (hash(k, 2) - 0.5) * 2 * sy, z: cz + (hash(k, 3) - 0.5) * 2 * sz, k });
    }
    S.vig = mk(stage, { position: "absolute", inset: "0", width: W + "px", height: H + "px", background: "radial-gradient(ellipse 75% 62% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,.62) 100%)", pointerEvents: "none" });
    const cv = document.createElement("canvas"); cv.width = cv.height = 256; const cx = cv.getContext("2d"), im = cx.createImageData(256, 256);
    for (let i = 0; i < 65536; i++) { const v = 128 + (hash(i, 11) + hash(i, 12) + hash(i, 13) - 1.5) * 120; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
    cx.putImageData(im, 0, 0);
    S.grain = mk(stage, { position: "absolute", left: "-256px", top: "-256px", width: W + 512 + "px", height: H + 512 + "px", backgroundImage: `url(${cv.toDataURL()})`, mixBlendMode: "overlay", opacity: 0.1, pointerEvents: "none" });
  }
  function atmos(t, b) {
    dust.forEach((d) => put(d.e, d.x + 30 * Math.sin(t * 0.5 + d.k), d.y + 40 * Math.cos(t * 0.4 + d.k * 1.7), d.z));
    const charge = clamp((b - 4) / 4);                           // the glow swells through the silence before the drop
    put(S.gHook, 0, 120, -4700, { s: 0.75 + 0.5 * ez.inCubic(charge) }); S.gHook.style.opacity = b < 9 ? 0.55 + 0.45 * charge : 0;
    const f = Math.floor(t * 30 + 1e-6);
    S.grain.style.transform = `translate(${Math.floor(hash(f, 3) * 256)}px,${Math.floor(hash(f, 4) * 256)}px)`;
  }

  /* ---------- masked type helpers ---------- */
  const mline = (parent, text, st, color = C.white) => {
    const m = mk(parent, { display: "block", overflow: "hidden", paddingBottom: "0.14em", marginBottom: "-0.14em", paddingTop: "0.06em" });
    const i = mk(m, { display: "inline-block", whiteSpace: "pre", color, willChange: "transform", ...st }, "span", text);
    return { m, i };
  };
  const rise = (l, pin, pout = 0) => { l.i.style.transform = `translateY(${(1 - ez.outExpo(clamp(pin))) * 108 - ez.inExpo(clamp(pout)) * 108}%)`; };
  const pr = (b, b0, dur) => (b - b0) / dur;                     // progress in beats

  /* ---------- hook: three words on the z axis, the camera flies through them ---------- */
  const S = {};
  function buildHook() {
    const box = (z) => { const e = obj(W, 900, { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }); put(e, 0, 0, z); return e; };
    const a = box(0);
    S.h1 = [mline(a, "Votre", F(250)), mline(a, "business", F(250))];
    const m = box(-1600);
    S.h2 = mline(m, "mérite", F(300));
    S.h2u = mk(m, { width: "780px", height: "14px", borderRadius: "7px", background: C.lime, marginTop: "34px", transformOrigin: "0 50%" });
    const x = obj(W + 400, 500, {}); put(x, 0, 0, -3200);
    const size = 196, txt = "d’exploser";
    const meas = document.createElement("canvas").getContext("2d"); meas.font = `800 ${size}px Geist`;
    const adv = [...txt].map((ch) => meas.measureText(ch).width - 0.045 * size); const tw = adv.reduce((p, c) => p + c, 0) + 60;
    let acc = -tw / 2;
    S.h3 = [...txt, "."].map((ch, i) => {
      const w_ = i < txt.length ? adv[i] : 60;
      const e = mk(x, { position: "absolute", left: (W + 400) / 2 + "px", top: "250px", ...F(size), color: ch === "." ? C.lime : C.white, whiteSpace: "pre", willChange: "transform",
        ...(ch === "." ? {} : { backgroundImage: `linear-gradient(180deg, #FFFFFF 12%, #9DB4FF 58%, ${C.blueHi} 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }) }, "span", ch);
      const r = { e, x: acc + w_ / 2, w: w_, i }; acc += w_; return r;
    });
    S.hookBoxes = [a, m, x];
  }
  function hook(b) {
    show(S.hookBoxes[0], b < 2.6); show(S.hookBoxes[1], b > 0.9 && b < 4.7); show(S.hookBoxes[2], b > 2.6 && b < 9.2);
    rise(S.h1[0], pr(b, -0.35, 0.8)); rise(S.h1[1], pr(b, 0.86, 0.8));
    S.hookBoxes[0].style.opacity = 1 - clamp(pr(b, 2.0, 0.35));
    rise(S.h2, pr(b, 1.82, 0.8)); S.h2u.style.transform = `scaleX(${ez.outExpo(clamp(pr(b, 2.9, 0.8)))})`;
    S.hookBoxes[1].style.opacity = clamp(pr(b, 1.3, 0.6)) * (1 - clamp(pr(b, 4.0, 0.35)));
    // d'exploser.: letters arrive staggered, spread slowly through the silence, then burst past the lens on the drop
    const g = clamp((b - 4) / 4), ex = ez.outExpo(clamp(pr(b, 7.94, 1.3)));
    S.hookBoxes[2].style.opacity = clamp(pr(b, 3.3, 0.5));
    S.h3.forEach((l) => {
      const inn = ez.outExpo(clamp(pr(b, 3.72 + l.i * 0.035, 0.9)));
      const spread = 1 + 0.09 * g, n = S.h3.length, u = (l.i - (n - 1) / 2) / n;
      const ang = hash(l.i, 21) * Math.PI * 2, R = 500 + hash(l.i, 22) * 900;
      const x = l.x * spread + Math.cos(ang) * R * ex + u * 1600 * ex, y = (1 - inn) * 150 + Math.sin(ang) * R * 1.4 * ex, z = (1 - inn) * -500 + ex * (900 + hash(l.i, 23) * 1500);
      l.e.style.transform = `translate3d(${x - l.w / 2}px,${y - 100}px,${z}px) rotateZ(${(hash(l.i, 24) - 0.5) * 120 * ex}deg) rotateY(${(hash(l.i, 25) - 0.5) * 140 * ex}deg)`;
      l.e.style.opacity = inn * (1 - clamp(pr(b, 8.5, 0.6)));
    });
  }

  /* ---------- the wall: real client reels on a curved 5x3 grid ---------- */
  const frameOf = (c, id, local) => {
    const u = USES[id]; if (!u) return;
    const i = (Math.max(0, Math.floor(local * 30 + 1e-6)) % u.frames) + 1, src = `${A}broll/f7/${id}/${String(i).padStart(4, "0")}.jpg`;
    if (c.cur !== src) { c.cur = src; c.img.src = src; pending.push(c.img.decode().catch(() => {})); }
  };
  const card = (w, h) => {
    const e = obj(w, h, { borderRadius: Math.round(w * 0.085) + "px", overflow: "hidden", background: "#0b0c10", boxShadow: "0 60px 140px rgba(0,0,0,.6)" });
    const img = mk(e, { width: "100%", height: "100%", objectFit: "cover", display: "block" }, "img"); img.decoding = "sync";
    const dim = mk(e, { position: "absolute", inset: "0", background: "#05060a" });
    mk(e, { position: "absolute", inset: "0", borderRadius: "inherit", boxShadow: "inset 0 0 0 2px rgba(255,255,255,.16)" });
    return { e, img, dim, cur: "" };
  };
  const WORDS = ["Stratégie", "Tournage", "Montage", "Diffusion"];
  function buildWall() {
    S.cards = []; let wi = 0;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
      const hi = HEROES.findIndex(([hc_, hr]) => hc_ === c && hr === r);
      S.cards.push({ ...card(CARD[0], CARD[1]), c, r, hi, id: hi >= 0 ? `hero${hi}` : `wall${wi++}`, p: cell(c, r) });
    }
    S.scrim = mk(hud, { position: "absolute", left: "0", bottom: "0", width: W + "px", height: "980px", background: "linear-gradient(180deg, rgba(5,6,8,0) 0%, rgba(5,6,8,.78) 58%, rgba(5,6,8,.94) 100%)" });
    S.words = WORDS.map((w, i) => {
      const box = mk(hud, { position: "absolute", left: "72px", top: "1318px", width: W - 144 + "px" });
      const idx = mline(box, `0${i + 1} <span style="opacity:.45">/ 04</span>`, { ...F(34, 500, 0.04, '"Geist Mono"'), color: C.lime });
      idx.m.style.marginBottom = "18px";
      const l = mline(box, `${w}<span style="color:${C.lime}">.</span>`, F(188));
      return { box, idx, l };
    });
    S.bar = mk(hud, { position: "absolute", left: "72px", top: "1618px", width: W - 144 + "px", height: "8px", display: "flex", gap: "14px" });
    S.segs = WORDS.map(() => { const s = mk(S.bar, { flex: "1", height: "8px", borderRadius: "4px", background: "rgba(255,255,255,.2)", overflow: "hidden" }); return mk(s, { width: "100%", height: "100%", background: C.white, transformOrigin: "0 50%" }); });
  }
  function wall(t, b) {
    const live = b > 7.6 && b < 16.9;
    S.cards.forEach((k, n) => {
      show(k.e, live); if (!live) return;
      const e = ez.outExpo(clamp(pr(b, 7.85 + hash(n, 41) * 0.5, 1.5)));
      const act = k.hi >= 0 ? clamp(pr(b, 8 + 2 * k.hi - 0.25, 0.35)) * (1 - clamp(pr(b, 10 + 2 * k.hi - 0.2, 0.4))) : 0;
      put(k.e, k.p.x, k.p.y + (1 - e) * (k.r - 1 + (hash(n, 42) - 0.5)) * 900, k.p.z - (1 - e) * (1400 + hash(n, 43) * 2600) + act * 90, { ry: k.p.ry, rz: (1 - e) * (hash(n, 44) - 0.5) * 30, s: 1 + 0.035 * act });
      k.e.style.opacity = clamp(pr(b, 7.85 + hash(n, 41) * 0.5, 0.5));
      k.dim.style.opacity = 0.5 * (1 - act) + (k.hi < 0 ? 0.08 : 0);
      frameOf(k, k.id, k.hi >= 0 ? t - bt(8 + 2 * k.hi) + 0.5 : t - bt(8) + 1 + n * 0.37);
    });
    const on = b > 7.9 && b < 16.2;
    show(S.scrim, on); show(S.bar, on); S.scrim.style.opacity = clamp(pr(b, 7.95, 0.5)) * (1 - clamp(pr(b, 15.8, 0.3)));
    S.bar.style.opacity = clamp(pr(b, 8.1, 0.4)) * (1 - clamp(pr(b, 15.75, 0.25)));
    S.words.forEach((w, i) => {
      const b0 = 8 + 2 * i, vis = b > b0 - 0.2 && b < b0 + 2.1; show(w.box, vis); if (!vis) return;
      rise(w.l, pr(b, b0 - 0.06, 0.75), pr(b, b0 + 1.74, 0.24)); rise(w.idx, pr(b, b0 + 0.06, 0.7), pr(b, b0 + 1.7, 0.24));
      w.l.i.style.letterSpacing = `${lerp(0.02, -0.045, ez.outExpo(clamp(pr(b, b0 - 0.06, 0.9))))}em`;
    });
    S.segs.forEach((s, i) => (s.style.transform = `scaleX(${clamp((b - 8 - 2 * i) / 2)})`));
  }

  /* ---------- results: a number, a client, their footage ---------- */
  const RES = [{ n: 59, lab: "plus de vues Instagram", who: "SUSHI X · EN 2 MOIS", y: 0, side: 1, id: "res0" }, { n: 18, lab: "plus de vues Facebook", who: "AU PETIT CHALET", y: RY2, side: -1, id: "res1" }];
  function buildResults() {
    S.res = RES.map((r) => {
      const c = card(600, 1067);
      const tx = obj(940, 760, {});
      const chip = mk(tx, { display: "inline-block", padding: "16px 26px 15px", borderRadius: "999px", background: C.blue, color: C.white, ...F(27, 500, 0.06, '"Geist Mono"'), marginBottom: "26px" }, "div", r.who);
      const num = mline(tx, "", F(430));
      const lab = mline(tx, r.lab, F(66, 600, -0.03)); lab.m.style.marginTop = "6px";
      return { r, c, tx, chip, num, lab };
    });
    // total on brand blue
    S.plane = obj(5200, 6400, { background: `radial-gradient(circle at 50% 46%, #4A72FF 0%, ${C.blue} 38%, #1C3FD6 100%)` }); put(S.plane, RX, RY3, ZW - 760);
    const t = obj(W, 1000, { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }); put(t, RX, RY3 - 20, ZW);
    S.totK = mline(t, "RÉSULTATS CLIENTS", { ...F(30, 500, 0.14, '"Geist Mono"') }); S.totK.m.style.marginTop = "170px"; S.totK.m.style.marginBottom = "30px";
    S.totN = mline(t, "", { ...F(318), fontVariantNumeric: "tabular-nums" });
    S.totL = [mline(t, "de vues générées", F(88, 700, -0.035)), mline(t, "pour nos clients.", F(88, 700, -0.035), "#0B0C10")];
    S.totL[0].m.style.marginTop = "22px"; S.tot = t;
  }
  function results(t, b) {
    S.res.forEach((o, i) => {
      const b0 = 16 + 2 * i, live = b > b0 - 0.5 && b < b0 + 2.6; show(o.c.e, live); show(o.tx, live); if (!live) return;
      const r = o.r, e = ez.outExpo(clamp(pr(b, b0 - 0.2, 1.2)));
      put(o.c.e, RX + r.side * 190, r.y + 330 + (1 - e) * 500, ZW - 320, { ry: -r.side * 16, rz: r.side * 3.5, rx: 3 });
      o.c.dim.style.opacity = 0.1; frameOf(o.c, r.id, t - bt(b0) + 0.4);
      put(o.tx, RX, r.y - 470, ZW + 260);
      const v = Math.max(1, Math.round(r.n * ez.outExpo(clamp(pr(b, b0 - 0.05, 1.5)))));
      o.num.i.innerHTML = `${v}<span style="color:${C.lime}">×</span>`;
      rise(o.num, pr(b, b0 - 0.1, 0.8)); rise(o.lab, pr(b, b0 + 0.12, 0.8));
      o.chip.style.clipPath = `inset(0 ${(1 - ez.outExpo(clamp(pr(b, b0 + 0.22, 0.8)))) * 100}% 0 0 round 999px)`;
    });
    const live = b > 19.4 && b < 24.9; show(S.plane, live); show(S.tot, live); if (!live) return;
    const v = 7.5 * ez.outCubic(clamp(pr(b, 19.9, 3.2)));
    S.totN.i.innerHTML = `${v.toFixed(1).replace(".", ",")}<span style="letter-spacing:-0.02em">&thinsp;M</span><span style="color:${C.lime}">+</span>`;
    rise(S.totK, pr(b, 20.05, 0.8)); rise(S.totN, pr(b, 19.9, 0.8)); rise(S.totL[0], pr(b, 20.5, 0.8)); rise(S.totL[1], pr(b, 20.75, 0.8));
  }

  /* ---------- tagline + logo ---------- */
  function buildEnd(svg) {
    const t = obj(W, 700, { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }); put(t, RX, RY3, ZT);
    S.tag = [mline(t, "Et si votre", F(128, 700, -0.04)), mline(t, "prochaine vidéo", F(128, 700, -0.04)), mline(t, "changeait tout ?", F(128, 800, -0.04), C.blueHi)];
    S.tag[0].m.style.marginTop = "130px"; S.tagBox = t;
    const l = obj(760, 560, { display: "flex", alignItems: "center", justifyContent: "center" }); l.innerHTML = svg; put(l, RX, RY3, ZL);
    const s = l.querySelector("svg"); s.setAttribute("width", "700"); s.setAttribute("height", String(Math.round(700 * 160 / 221))); s.style.overflow = "visible";
    S.logo = l; S.logoSvg = s;
  }
  function end(b) {
    const lt = b > 23.4 && b < 29.2; show(S.tagBox, lt);
    if (lt) { S.tag.forEach((l, i) => rise(l, pr(b, 24.0 + i * 0.3, 0.9))); S.tagBox.style.opacity = 1 - clamp(pr(b, 28.15, 0.45)); }
    const ll = b > 27.6; show(S.logo, ll);
    if (ll) { const e = ez.outExpo(clamp(pr(b, 27.95, 1.6))); S.logo.style.opacity = clamp(pr(b, 27.9, 0.5)); S.logoSvg.style.transform = `scale(${lerp(0.72, 1, e)})`; S.logoSvg.style.clipPath = `inset(0 0 ${(1 - ez.outExpo(clamp(pr(b, 27.95, 1.1)))) * 100}% 0)`; }
  }

  /* ---------- sound cues (placed on the measured grid by audio/mix7.py) ---------- */
  const CUES = [];
  const cue = (beat, type, gain = 1, pan = 0, x = {}) => CUES.push({ beat, type, gain, pan, ...x });
  function buildCues() {
    cue(0, "thud", 0.9); cue(0, "whip", 0.5, -0.2); cue(1, "thud", 0.55); cue(2, "pass", 0.8, 0.2); cue(2, "thud", 0.8); cue(2.95, "click", 0.5, 0.15);
    cue(4, "pass", 0.7, -0.2); cue(4, "deep", 1.0); cue(5, "pulse", 0.45); cue(6, "pulse", 0.6); cue(7, "pulse", 0.8);
    cue(8, "riser", 0.9, 0, { dur: 3.6 }); cue(8, "rev", 0.9, 0, { dur: 1.4 });
    cue(8, "impact", 1.0); cue(8, "sub", 1.0); cue(8, "pass", 1.0);
    [10, 12, 14].forEach((b, i) => { cue(b, "whip", 0.85, [0.5, -0.5, 0.45][i]); cue(b, "thud", 0.7); });
    cue(16, "pass", 0.9, 0.4); cue(16, "thud", 0.8); cue(16, "ticks", 0.7, 0.2, { dur: 1.3 });
    cue(18, "pass", 0.9, -0.4); cue(18, "thud", 0.8); cue(18, "ticks", 0.7, -0.2, { dur: 1.3 });
    cue(20, "pass", 0.9); cue(20, "deep", 0.8); cue(20, "ticks", 0.6, 0, { dur: 3.0 }); cue(24, "riser", 0.75, 0, { dur: 2.0 });
    cue(24, "impact", 0.85); cue(24, "sub", 0.8); cue(24, "pass", 0.9); cue(24.3, "click", 0.35, -0.2); cue(24.6, "click", 0.35, 0.2);
    cue(28, "rev", 0.6, 0, { dur: 0.9 }); cue(28, "impact", 0.8); cue(28, "sub", 0.7); cue(28, "shimmer", 0.7);
    cue(32, "end", 1.0);
  }

  /* ---------- frame ---------- */
  async function seek(t) {
    pending.length = 0;
    const b = tb(t), c = camAt(b);
    world.style.transform = `translateZ(${c.dz}px) rotateZ(${c.rz}deg) rotateX(${c.rx}deg) rotateY(${c.ry}deg) translate3d(${-c.x}px,${-c.y}px,${-c.z}px)`;
    atmos(t, b); hook(b); wall(t, b); results(t, b); end(b);
    await Promise.all(pending);
  }
  window.ready = (async () => {
    const [beats, uses, svg] = await Promise.all([
      fetch("../beats7.json").then((r) => r.json()), fetch("../assets/broll/f7.json").then((r) => r.json()), fetch("../assets/brand/logo-white.svg").then((r) => r.text()),
      document.fonts.load("800 100px Geist"), document.fonts.load("700 100px Geist"), document.fonts.load("600 100px Geist"), document.fonts.load('500 30px "Geist Mono"'),
    ]);
    BTS = beats.beats; PER = beats.period; USES = uses;
    buildAtmos(); buildHook(); buildWall(); buildResults(); buildEnd(svg); buildCues();
    window.CUES = CUES.map((c) => ({ ...c, t: bt(c.beat), per: PER }));
    await seek(0);
    return { FMT: "portrait", beats: 32, length: bt(32) + 1 };
  })();
  window.seek = seek;
})();
