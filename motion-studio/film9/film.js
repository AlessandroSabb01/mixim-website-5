/* Création Virale — three narrated motion-design films (9:16), built on the text films (film5) and cut to the
   ElevenLabs voice-over: v1 Pourquoi nous, v2 Qui on est, v3 Ce qu'on fait. Flat colour cards + full-bleed b-roll
   (client shoots and our crew at work) under the type. window.seek(t) paints frame t (pure function of t). */
(() => {
  const P = new URLSearchParams(location.search);
  const W = +(P.get("w") || 1080), H = +(P.get("h") || 1920);
  const VID = clamp0(+(P.get("v") || 1), 1, 3);
  function clamp0(x, a, b) { return Math.max(a, Math.min(b, x || a)); }

  /* ---------- palette: brand blue leads, paper and ink support, lime is the caret/accent ---------- */
  const BG = {
    blue: { bg: "#2C5BFF", ink: "#FFFFFF", acc: "#C6FF3D", mute: "rgba(255,255,255,.55)", guide: "rgba(255,255,255,.22)" },
    paper: { bg: "#EEF0F5", ink: "#0B0C10", acc: "#2C5BFF", mute: "rgba(11,12,16,.5)", guide: "rgba(11,12,16,.16)" },
    ink: { bg: "#0B0C10", ink: "#FFFFFF", acc: "#6A8CFF", mute: "rgba(255,255,255,.5)", guide: "rgba(255,255,255,.16)" },
    foot: { bg: "#0B0C10", ink: "#FFFFFF", acc: "#C6FF3D", mute: "rgba(255,255,255,.7)", guide: "rgba(255,255,255,.28)", foot: true },
  };

  /* ---------- math ---------- */
  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const lerp = (a, b, t) => a + (b - a) * t;
  const ez = {
    outExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    inExpo: (t) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
    inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    outCubic: (t) => 1 - Math.pow(1 - t, 3),
    inOutExpo: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2),
  };
  const spring = (dt, f = 2.2, d = 8) => (dt <= 0 ? 0 : 1 - Math.exp(-d * dt) * Math.cos(2 * Math.PI * f * dt));

  /* ---------- beat grid ---------- */
  // time is in seconds: one "beat" = 1 s, so every card starts on its spoken word
  const VO_LEN = { 1: 18.21, 2: 19.49, 3: 20.77 }[VID], LEN = VO_LEN + 1.2;
  let BTS = [0], PER = 1;
  const bt = (b) => BTS[0] + b * PER;
  const tb = (t) => (t - BTS[0]) / PER;

  /* ---------- DOM ---------- */
  const stage = document.getElementById("stage");
  Object.assign(stage.style, { width: W + "px", height: H + "px" });
  const el = (parent, css = {}, tag = "div", cls = "a") => { const e = document.createElement(tag); if (cls) e.className = cls; Object.assign(e.style, css); parent.appendChild(e); return e; };
  const show = (e, v) => { e.style.display = v ? "" : "none"; };
  function T(e, o = {}) {
    const { x = 0, y = 0, s = 1, sx = 1, sy = 1, r = 0, op = 1 } = o;
    e.style.transform = `translate(${x}px,${y}px) rotate(${r}deg) scale(${s * sx},${s * sy})`;
    e.style.opacity = op;
  }
  const TYPE_CPS = 48, DEL_CPS = 80;
  const FF = "Geist, sans-serif", MONO = '"Geist Mono", monospace';

  /* ---------- copy, cued on the voice-over (t = seconds, measured with whisper large-v3) ----------
     line: rows separated by "|", **bold**; the final . ? ! , takes the accent colour.
     bg "foot" puts a b-roll clip (clip, off = in-point) full-bleed under white type. */
  // cuts: [clip, start] — the type holds while the footage hypercuts underneath (BTS -> result, team feedback)
  const SCRIPT = {
    1: [   // Pourquoi nous
      { t: 0, bg: "foot", cuts: [["w_room", 0], ["w_gratin", 0.75]], kind: "count", value: 3, suf: "", sub: "likes.", label: "SEPTEMBRE" },
      { t: 1.62, bg: "foot", cuts: [["w_girl", 1.62]], line: "C'est ça qu'il avait|en **septembre.**", fx: "type" },
      { t: 3.52, bg: "foot", cuts: [["c_edit1", 3.52], ["c_photo", 4.3]], line: "Deux mois avec|Création **Virale.**", fx: "rise" },
      { t: 5.2, bg: "blue", kind: "phone", clip: "p_re1", line: "Des vidéos|chaque **semaine.**" },
      { t: 6.76, bg: "foot", cuts: [["w_girl2", 6.76]], line: "Du monde|qui **commente.**", fx: "rise" },
      { t: 7.98, bg: "blue", kind: "phone", clip: "p_li1", line: "« Je t'ai vu|sur **Insta.** »" },
      { t: 10.38, bg: "ink", line: "Pas de la **magie.**", fx: "strike", strikeAt: 10.9 },
      { t: 11.7, bg: "foot", cuts: [["c_photo", 11.7], ["c_edit1", 12.3]], line: "Une **méthode,**", size: 190, fx: "slam" },
      { t: 12.9, bg: "foot", cuts: [["g_shrimp", 12.9], ["w_surf", 13.45]], line: "puis une|**équipe.**", fx: "rise" },
      { t: 14.02, bg: "foot", cuts: [["w_lava2", 14.02], ["w_gratin", 14.45], ["g_sauce", 14.86]], line: "C'est ton|**tour.**", size: 210, fx: "slam" },
    ],
    2: [   // Qui on est
      { t: 0, bg: "ink", line: "**STOP.**", size: 330, fx: "slam" },
      { t: 0.42, bg: "foot", cuts: [["w_room", 0.42], ["w_mussels", 1.15], ["w_girl", 1.9]], line: "**3** excuses|que t'as déjà dites", fx: "type" },
      { t: 3.36, bg: "foot", cuts: [["w_mussels", 3.36]], line: "« J'ai pas|le **temps.** »", fx: "type" },
      { t: 4.62, bg: "foot", cuts: [["c_photo", 4.62]], line: "On filme|pour **toi.**", fx: "rise" },
      { t: 5.76, bg: "foot", cuts: [["w_plates", 5.76]], line: "« Je sais pas|quoi **poster.** »", fx: "type" },
      { t: 7.14, bg: "foot", cuts: [["c_edit1", 7.14]], line: "On a|les **idées.**", fx: "rise" },
      { t: 8.28, bg: "ink", line: "« Ça donne|**rien.** »", fx: "type" },
      { t: 10.12, bg: "blue", kind: "phone", clip: "p_re2", line: "On te prouve|le **contraire.**" },
      { t: 12.96, bg: "blue", kind: "phone", clip: "p_bo1", line: "Création **Virale.**" },
      { t: 14.04, bg: "foot", cuts: [["c_photo", 14.04], ["w_surf", 14.8], ["w_girl2", 15.5]], line: "Ton équipe de contenu|à **Québec.**", fx: "rise" },
    ],
    3: [   // Ce qu'on fait
      { t: 0, bg: "ink", line: "Pose ton|**cell.**", size: 230, fx: "slam" },
      { t: 1.28, bg: "paper", line: "**Sérieux.**", size: 220, fx: "slam" },
      { t: 1.74, bg: "foot", cuts: [["w_girl", 1.74]], line: "3 fois que tu|recommences ce **reel.**", fx: "type" },
      { t: 4.26, bg: "foot", cuts: [["w_room", 4.26], ["w_gratin", 4.9]], line: "T'as déjà ta|business à **gérer.**", fx: "rise" },
      { t: 6.14, bg: "foot", cuts: [["w_mussels", 6.14], ["w_girl2", 7.16], ["w_plates", 7.92], ["c_edit1", 9.12]], kind: "wheel", lead: "Tes", items: ["clients", "équipe", "factures", "réseaux sociaux"], at: [6.4, 7.16, 7.92, 9.12] },
      { t: 10.12, bg: "foot", cuts: [["c_photo", 10.12], ["c_edit1", 11.0]], line: "Création Virale|s'en **occupe.**", fx: "rise" },
      { t: 11.98, bg: "foot", cuts: [["c_edit1", 11.98]], line: "Les **idées,**", size: 190, fx: "slam" },
      { t: 12.62, bg: "foot", cuts: [["c_photo", 12.62]], line: "le **tournage,**", size: 190, fx: "slam" },
      { t: 13.34, bg: "foot", cuts: [["c_edit3", 13.34]], line: "le **montage,**", size: 190, fx: "slam" },
      { t: 14.12, bg: "blue", kind: "phone", clip: "p_li2", line: "la **publication.**" },
      { t: 14.98, bg: "foot", cuts: [["w_surf", 14.98], ["g_shrimp", 15.6], ["w_lava2", 16.2], ["w_gratin", 16.8]], line: "Une équipe de Québec|qui connaît ton **monde.**", fx: "rise" },
    ],
  };
  const END_T = { 1: 15.28, 2: 16.34, 3: 17.58 }[VID];   // "Remplis le formulaire ci-dessous…"

  /* ---------- timeline ---------- */
  const SC = SCRIPT[VID].map((s, i, a) => ({ ...s, i, b0: s.t, b1: i + 1 < a.length ? a[i + 1].t : END_T, d: (i + 1 < a.length ? a[i + 1].t : END_T) - s.t,
    text0: [s.top, s.line, s.lead, s.items && s.items.join(" / "), s.value != null && `${s.value} ${s.sub}`].filter(Boolean).join(" ") }));
  const END = { b0: END_T };

  /* ---------- text: rows of word masks, measured once so type-on grows from a fixed left edge ---------- */
  function parse(md) {
    return md.split("|").map((row) => {
      const words = [];
      let bold = false;
      row.split(/(\*\*)/).forEach((part) => {
        if (part === "**") { bold = !bold; return; }
        part.split(" ").forEach((w, k) => {
          if (!w) return;
          const m = w.match(/^(.*?)([.?!,]?)$/);
          if (m[1]) words.push({ t: m[1], bold, glue: k === 0 && words.length && !part.startsWith(" ") && words.at(-1).punct });
          if (m[2]) words.push({ t: m[2], bold, punct: true });
        });
      });
      return words;
    });
  }
  function textBlock(parent, md, { size = 150, weight = 400, boldW = 700, pal, maxW = W - 150, lh = 1.04 }) {
    const root = el(parent, { width: W + "px", font: `${weight} ${size}px/${lh} ${FF}`, letterSpacing: "-0.035em", color: pal.ink });
    const rows = parse(md).map((ws) => {
      const wrap = el(root, { textAlign: "left" }, "div", "row");
      const words = ws.map((w, k) => {
        const mask = el(wrap, {}, "span", "mask");
        const ink = el(mask, { fontWeight: w.bold ? boldW : weight, color: w.punct ? pal.acc : "inherit" }, "span", "ink");
        ink.textContent = w.t;
        const sp = k < ws.length - 1 && !ws[k + 1].punct;
        if (sp) mask.style.marginRight = "0.24em";
        return { ...w, mask, ink, sp };
      });
      return { wrap, words, n: ws.reduce((a, w) => a + w.t.length + (w.sp ? 1 : 0), 0) };
    });
    // fit, then pin each row at its final centred left edge
    const mw = (r) => { r.wrap.style.display = "inline-block"; const w = r.wrap.getBoundingClientRect().width; r.wrap.style.display = ""; return w; };
    let wmax = Math.max(...rows.map(mw));
    if (wmax > maxW) { const k = maxW / wmax; size *= k; root.style.fontSize = size + "px"; }
    rows.forEach((r) => { r.w = mw(r); r.wrap.style.marginLeft = (W - r.w) / 2 + "px"; r.wrap.style.width = r.w + 1 + "px"; });
    const h = root.offsetHeight;
    const caret = el(root, { width: Math.max(4, size * 0.06) + "px", height: size * 0.82 + "px", background: pal.acc, display: "inline-block", verticalAlign: "-0.06em", marginLeft: size * 0.04 + "px" }, "span", "");
    caret.style.position = "relative";
    return { root, rows, size, h, caret, total: rows.reduce((a, r) => a + r.n, 0) };
  }
  // type-on: n visible characters, caret after the last one
  function typeTo(tbk, n, caretOn) {
    let left = n, placed = false;
    tbk.rows.forEach((r) => {
      r.words.forEach((w) => {
        const k = clamp(left, 0, w.t.length);
        w.ink.textContent = w.t.slice(0, k);
        w.mask.style.display = k > 0 ? "" : "none";
        left -= w.t.length;
        if (w.sp) left -= 1;
        if (!placed && k > 0 && (left <= 0 || w === r.words.at(-1) && r === tbk.rows.at(-1))) { w.mask.after(tbk.caret); placed = true; }
      });
    });
    if (!placed) { const r0 = tbk.rows[0].wrap; r0.prepend(tbk.caret); }
    tbk.caret.style.visibility = caretOn ? "visible" : "hidden";
  }
  function resetType(tbk) { tbk.rows.forEach((r) => r.words.forEach((w) => { w.ink.textContent = w.t; w.mask.style.display = ""; })); tbk.caret.style.visibility = "hidden"; }

  /* ---------- design-tool guides: a baseline rule, two edge rules, crosshair squares ---------- */
  function guides(parent, pal, x0, x1, y0, y1) {
    const g = el(parent, {});
    const line = (css) => el(g, { background: pal.guide, ...css });
    const hz = [line({ left: "0px", top: y0 + "px", width: W + "px", height: "2px", transformOrigin: "50% 50%" }), line({ left: "0px", top: y1 + "px", width: W + "px", height: "2px", transformOrigin: "50% 50%" })];
    const vt = [line({ left: x0 + "px", top: "0px", width: "2px", height: H + "px", transformOrigin: "50% 50%" }), line({ left: x1 + "px", top: "0px", width: "2px", height: H + "px", transformOrigin: "50% 50%" })];
    const sq = [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].map(([x, y]) => el(g, { left: x - 7 + "px", top: y - 7 + "px", width: "16px", height: "16px", border: `2px solid ${pal.guide}`, boxSizing: "border-box", background: pal.bg }));
    return { g, hz, vt, sq };
  }
  function paintGuides(G, p) {
    const e = ez.outExpo(p);
    G.hz.forEach((l) => (l.style.transform = `scaleX(${e})`));
    G.vt.forEach((l) => (l.style.transform = `scaleY(${e})`));
    G.sq.forEach((s, k) => (s.style.opacity = clamp((p - 0.25 - k * 0.06) * 4)));
  }

  /* ---------- build each card ---------- */
  const bgL = el(stage, { width: W + "px", height: H + "px" });
  // b-roll: native-rate JPG sequences, full bleed, darkened so the white type always reads
  const footL = el(stage, { width: W + "px", height: H + "px", overflow: "hidden" });
  const footImg = el(footL, { width: W + "px", height: H + "px", objectFit: "cover", transformOrigin: "50% 50%" }, "img", "a");
  footImg.decoding = "sync";
  const footShade = el(footL, { width: W + "px", height: H + "px", background: "linear-gradient(180deg, rgba(8,9,12,.32) 0%, rgba(8,9,12,.16) 35%, rgba(8,9,12,.2) 65%, rgba(8,9,12,.42) 100%)" });
  let MAN = {}, pend = null, pend2 = null;
  const cardsL = el(stage, { width: W + "px", height: H + "px" });
  const wipe = el(stage, { width: W + "px", height: H + "px", transformOrigin: "50% 100%" });
  const edge = el(wipe, { width: W + "px", height: "14px", background: "#C6FF3D" });      // the wipe's leading edge
  const flash = el(stage, { width: W + "px", height: H + "px" });                            // slam flash

  function build(s) {
    const pal = BG[s.bg], root = el(cardsL, { width: W + "px", height: H + "px" });
    s.pal = pal; s.root = root;
    const cy = H / 2;
    if (!s.kind) {
      s.tb = textBlock(root, s.line, { size: s.size || 150, pal });
      if (pal.foot) s.tb.root.style.textShadow = "0 4px 24px rgba(0,0,0,.6), 0 1px 3px rgba(0,0,0,.5)";
      s.ty = cy - s.tb.h / 2;
      const r0 = s.tb.rows.reduce((a, r) => (r.w > a.w ? r : a));
      s.G = guides(root, pal, (W - r0.w) / 2 - 18, (W + r0.w) / 2 + 18, s.ty - 6, s.ty + s.tb.h + 6);
      if (s.fx === "scroll") s.ghosts = [-2, -1, 1, 2].map((k) => { const g = textBlock(root, s.line, { size: s.size, pal }); g.root.style.opacity = 0.16; return { g, k }; });
      if (s.fx === "strike") s.strike = el(root, { height: Math.max(8, s.tb.size * 0.08) + "px", background: pal.acc, transformOrigin: "0 50%" });
    } else if (s.kind === "stack") {
      s.top = textBlock(root, s.top, { size: 92, weight: 500, pal });
      s.tb = textBlock(root, s.line, { size: s.size || 150, pal });
      s.sub = s.sub && textBlock(root, s.sub, { size: 92, weight: 500, pal });
      const hTot = s.top.h + 24 + s.tb.h + (s.sub ? 24 + s.sub.h : 0);
      s.yTop = cy - hTot / 2; s.ty = s.yTop + s.top.h + 24; s.ySub = s.ty + s.tb.h + 24;
      const r0 = s.tb.rows[0];
      s.G = guides(root, pal, (W - r0.w) / 2 - 22, (W + r0.w) / 2 + 22, s.ty - 4, s.ty + s.tb.h + 4);
      if (s.box) {   // the selection box from the reference: accent frame + 8 handles around the key word
        const bx = (W - r0.w) / 2 - 34, by = s.ty - 18, bw = r0.w + 68, bh = s.tb.h + 36;
        s.boxE = el(root, { left: bx + "px", top: by + "px", width: bw + "px", height: bh + "px", border: `4px solid ${pal.acc}`, boxSizing: "border-box", transformOrigin: "50% 50%" });
        s.handles = [[0, 0], [0.5, 0], [1, 0], [0, 0.5], [1, 0.5], [0, 1], [0.5, 1], [1, 1]].map(([u, v]) => el(s.boxE, { left: u * bw - 13 + "px", top: v * bh - 13 + "px", width: "22px", height: "22px", background: pal.bg, border: `4px solid ${pal.acc}`, boxSizing: "border-box" }));
      }
    } else if (s.kind === "swap") {
      s.tbs = s.items.map((it) => textBlock(root, it, { size: s.size || 170, pal }));
      s.ty = cy - s.tbs[0].h / 2;
      const lt = s.label; s.label = el(root, { font: `500 26px/1 ${MONO}`, letterSpacing: "0.16em", color: pal.mute, whiteSpace: "pre" }); s.label.textContent = lt;
      s.count = el(root, { font: `500 26px/1 ${MONO}`, letterSpacing: "0.16em", color: pal.mute, whiteSpace: "pre" });
      const wmax = Math.max(...s.tbs.map((t) => t.rows[0].w));
      s.lx = (W - wmax) / 2; s.rx = (W + wmax) / 2;
      s.G = guides(root, pal, s.lx - 22, s.rx + 22, s.ty - 4, s.ty + s.tbs[0].h + 4);
    } else if (s.kind === "wheel") {
      const size = 96;
      s.leadE = el(root, { font: `600 ${size}px/1 ${FF}`, letterSpacing: "-0.03em", color: pal.ink, whiteSpace: "pre" }); s.leadE.textContent = s.lead;
      s.dot = el(root, { width: "18px", height: "18px", borderRadius: "50%", background: pal.acc });
      s.list = el(root, {});
      s.itemsE = s.items.map((it) => { const e = el(s.list, { font: `500 ${size}px/1 ${FF}`, letterSpacing: "-0.03em", color: pal.ink, whiteSpace: "pre" }); e.textContent = it; return e; });
      s.itemsE.forEach((e) => (e.style.fontWeight = 700));
      let lw = s.leadE.offsetWidth, iw = Math.max(...s.itemsE.map((e) => e.offsetWidth)), tot = lw + 60 + iw + 16;
      if (tot > W - 120) {   // shrink the wheel so the longest line fits in bold
        const k = (W - 120) / tot; s.leadE.style.fontSize = size * k + "px"; s.itemsE.forEach((e) => (e.style.fontSize = size * k + "px"));
        lw = s.leadE.offsetWidth; iw = Math.max(...s.itemsE.map((e) => e.offsetWidth)); tot = lw + 60 + iw + 16;
      }
      s.size = parseFloat(s.leadE.style.fontSize) || size; s.gap = 50; s.lx = (W - tot) / 2; s.lw = lw;
    } else if (s.kind === "phone") {   // a finished client reel, posted: inside a phone under the line
      s.tb = textBlock(root, s.line, { size: 120, pal });
      const pw = 621, ph = 1104, bz = 16;   // iPhone: 9:16 screen, thin titanium bezel, dynamic island, side buttons
      s.phone = el(root, { width: pw + 2 * bz + "px", height: ph + 2 * bz + "px", borderRadius: "92px", background: "linear-gradient(135deg,#3a3d44,#15161a 40%,#2a2c31)", boxShadow: "0 50px 110px rgba(0,0,0,.4), inset 0 0 0 3px #4a4d55", transformOrigin: "50% 50%" });
      [[-6, 250, 120], [-6, 400, 120], [pw + 2 * bz, 330, 170]].forEach(([x, y, h]) => el(s.phone, { left: x + "px", top: y + "px", width: "6px", height: h + "px", borderRadius: "3px", background: "#2c2e33" }));
      const scr = el(s.phone, { left: bz + "px", top: bz + "px", width: pw + "px", height: ph + "px", borderRadius: "78px", overflow: "hidden", background: "#000" });
      s.pimg = el(scr, { width: pw + "px", height: ph + "px", objectFit: "cover" }, "img", "a"); s.pimg.decoding = "sync";
      el(scr, { left: pw / 2 - 95 + "px", top: "26px", width: "190px", height: "54px", borderRadius: "28px", background: "#000" });
      el(scr, { left: pw / 2 - 110 + "px", top: ph - 26 + "px", width: "220px", height: "8px", borderRadius: "4px", background: "rgba(255,255,255,.75)" });
      s.px = (W - pw - 2 * bz) / 2; s.py = 520; s.ty = 200;
    } else if (s.kind === "count") {
      s.label && (s.labE = el(root, { font: `500 30px/1 ${MONO}`, letterSpacing: "0.18em", color: pal.mute, whiteSpace: "pre" }), s.labE.textContent = s.label);
      s.num = el(root, { font: `800 380px/1 ${FF}`, letterSpacing: "-0.06em", color: pal.ink, whiteSpace: "pre", fontVariantNumeric: "tabular-nums", transformOrigin: "50% 60%" });
      s.subE = el(root, { font: `500 84px/1 ${FF}`, letterSpacing: "-0.03em", color: pal.ink, whiteSpace: "pre" }); s.subE.textContent = s.sub;
      s.num.innerHTML = `${fmtNum(s.value, s.dec)}<span style="color:${pal.acc}">${s.suf}</span>`;
      s.numW = s.num.offsetWidth;
      if (s.numW > W - 130) { s.numSize = 380 * (W - 130) / s.numW; s.num.style.fontSize = s.numSize + "px"; s.numW = s.num.offsetWidth; } else s.numSize = 380;
      s.subW = s.subE.offsetWidth;
    }
    show(root, false);
  }
  const fmtNum = (v, dec = 0) => v.toFixed(dec).replace(".", ",");

  // end card: the logo on brand blue, the DM line as a pill
  const endL = el(stage, { width: W + "px", height: H + "px" });
  const logo = el(endL, { width: "640px", transformOrigin: "50% 50%" });
  const pill = el(endL, { padding: "26px 44px", borderRadius: "999px", background: "#FFFFFF", color: "#0B0C10", font: `500 50px/1 ${FF}`, letterSpacing: "-0.02em", whiteSpace: "pre", transformOrigin: "50% 50%" });
  pill.innerHTML = `Remplis le <b style="font-weight:800;color:#2C5BFF">formulaire</b> <span style="color:#2C5BFF">↓</span>`;

  /* ---------- paint ---------- */
  function paintText(s, tbk, t, mode, x0, y0) {
    const d = t - bt(s.b0);
    T(tbk.root, { y: y0 });
    if (mode === "type") {
      const n = Math.floor(Math.max(0, d) * TYPE_CPS);
      typeTo(tbk, n, n < tbk.total || Math.floor(t * 2.6) % 2 === 0);
    } else {
      resetType(tbk);
      let k = 0;
      tbk.rows.forEach((r) => r.words.forEach((w) => {
        const p = mode === "rise" ? ez.outExpo(clamp((d - 0.045 * k) / 0.32)) : 1;
        w.ink.style.transform = mode === "rise" ? `translateY(${(1 - p) * 105}%)` : "";
        k++;
      }));
      if (mode === "slam") {
        const e = ez.outExpo(clamp(d / 0.24)), j = d > 0 ? 18 * Math.exp(-d / 0.07) : 0;
        tbk.root.style.transformOrigin = `50% ${tbk.h / 2}px`;
        T(tbk.root, { x: j * Math.sin(d * 90), y: y0 + j * Math.cos(d * 70), s: lerp(1.7, 1, e) });
      }
    }
  }
  function paintCard(s, t) {
    const d = t - bt(s.b0), b = tb(t);
    const gp = clamp(d / 0.5);
    if (s.G) paintGuides(s.G, gp);
    if (!s.kind) {
      const mode = s.fx === "strike" ? "rise" : s.fx === "scroll" ? "none" : s.fx;
      paintText(s, s.tb, t, mode, 0, s.ty);
      if (s.fx === "scroll") {    // a feed flick: copies stream up and the real one lands in the middle
        const e = ez.outExpo(clamp(d / 0.6)), off = (1 - e) * H * 0.9;
        T(s.tb.root, { y: s.ty + off });
        s.ghosts.forEach(({ g, k }) => T(g.root, { y: s.ty + off + k * s.tb.h * 1.25, op: 0.18 * (1 - clamp((d - 0.55) / 0.3)) }));
      }
      if (s.fx === "strike") {   // "du contenu." gets crossed out on the beat
        const r = s.tb.rows[0], sw = r.w + 30, p = ez.outExpo(clamp((t - s.strikeAt) / 0.3));
        Object.assign(s.strike.style, { width: sw + "px" });
        T(s.strike, { x: (W - sw) / 2, y: s.ty + s.tb.h * 0.5, sx: Math.max(0.001, p), op: p > 0 ? 1 : 0 });
      }
    } else if (s.kind === "stack") {
      paintText(s, s.top, t, "rise", 0, s.yTop);
      const ts = s.b0 + 0.3;
      const sub = { ...s, b0: ts };
      if (b >= ts - 0.01) { show(s.tb.root, true); paintText(sub, s.tb, t, s.box ? "slam" : "type", 0, s.ty); } else show(s.tb.root, false);
      if (s.sub) { const s2 = { ...s, b0: s.b0 + 1.75 }; show(s.sub.root, b >= s.b0 + 1.74); paintText(s2, s.sub, t, "rise", 0, s.ySub); }
      if (s.boxE) { const p = ez.outExpo(clamp((t - bt(s.b0 + 1.1)) / 0.35)); T(s.boxE, { s: lerp(1.15, 1, p), op: p }); }
      if (s.G) paintGuides(s.G, clamp((t - bt(ts)) / 0.5));
    } else if (s.kind === "swap") {   // type, hold, backspace, type the next: the reference's role swap
      const n = s.items.length, seg = s.d / n;
      const i = clamp(Math.floor((b - s.b0) / seg), 0, n - 1), sb = s.b0 + i * seg;
      s.tbs.forEach((tbk, k) => show(tbk.root, k === i));
      const tbk = s.tbs[i];
      tbk.rows[0].wrap.style.marginLeft = s.lx + "px";
      T(tbk.root, { y: s.ty });
      const din = t - bt(sb), dout = bt(sb + seg) - t;
      const nIn = Math.floor(Math.max(0, din) * TYPE_CPS), nOut = i < n - 1 ? Math.floor(Math.max(0, dout) * DEL_CPS) : 1e9;
      const nv = Math.min(nIn, nOut, tbk.total);
      typeTo(tbk, nv, nv < tbk.total || Math.floor(t * 2.6) % 2 === 0);
      T(s.label, { x: s.lx, y: s.ty - 70, op: clamp(din / 0.3) });
      s.count.textContent = `${String(i + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}`;
      T(s.count, { x: s.rx - s.count.offsetWidth, y: s.ty - 70, op: clamp((t - bt(s.b0)) / 0.3) });
    } else if (s.kind === "wheel") {   // fixed lead word + a rolling column; the active line is bold, the last one takes the accent
      const n = s.items.length;
      let i = 0; s.at.forEach((a, k) => { if (t >= a - 0.05) i = k; });
      const e = ez.outExpo(clamp((t - s.at[i] + 0.05) / 0.26));
      const sp = s.size * 1.32, cy = H / 2;
      const scroll = (i - 1 + (i > 0 ? e : 1)) * sp;
      const lx = s.lx;
      T(s.leadE, { x: lx, y: cy - s.size * 0.52, op: clamp((t - bt(s.b0)) / 0.25) });
      T(s.dot, { x: lx + s.lw + 22, y: cy - 9, s: spring(t - bt(s.b0 + 0.25)) });
      const listX = lx + s.lw + 22 + 18 + s.gap - 20;
      s.itemsE.forEach((it, k) => {
        const yk = cy - s.size * 0.52 + k * sp - Math.max(0, scroll);
        const dist = Math.abs(k * sp - Math.max(0, scroll)) / sp;
        const act = dist < 0.5;
        it.style.fontWeight = act ? 700 : 400;
        it.style.color = act && k === n - 1 ? s.pal.acc : s.pal.ink;
        T(it, { x: listX + dist * 8, y: yk, op: (t >= bt(s.b0 + 0.2) ? 1 : 0) * clamp(1 - dist * 0.42, 0.06, 1) });
      });
    } else if (s.kind === "phone") {
      paintText(s, s.tb, t, "rise", 0, s.ty);
      const e = spring(t - s.b0 - 0.08, 1.6, 7);
      T(s.phone, { x: s.px, y: s.py + (1 - clamp(e, 0, 1.2)) * 500, s: 0.92 + 0.08 * clamp(e, 0, 1.1), r: (1 - clamp(e, 0, 1)) * 6 });
      const m = MAN[s.clip] || 1, src = `../assets/cv9/frames/${s.clip}/${String(Math.min(m, Math.floor(Math.max(0, t - s.b0) * 24) + 1)).padStart(4, "0")}.jpg`;
      if (s.pimg.dataset.src !== src) { s.pimg.dataset.src = src; s.pimg.src = src; pend2 = s.pimg.decode().catch(() => {}); }
    } else if (s.kind === "count") {
      const c = ez.outExpo(clamp((t - bt(s.b0)) / 0.6));
      const v = s.value * c;
      s.num.innerHTML = `${fmtNum(s.dec ? Math.round(v * 10) / 10 : Math.round(v), s.dec)}<span style="color:${s.pal.acc}">${s.suf}</span>`;
      const pop = 1 + 0.08 * Math.exp(-Math.max(0, t - bt(s.b0) - 0.6) / 0.12) * (c > 0.995 ? 1 : 0);
      const ny = H / 2 - 260 + (380 - s.numSize) * 0.5;
      T(s.num, { x: (W - s.numW) / 2, y: ny, s: lerp(1.25, 1, ez.outExpo(clamp(d / 0.35))) * pop });
      if (s.labE) T(s.labE, { x: (W - s.labE.offsetWidth) / 2, y: ny - 70, op: clamp(d / 0.3) });
      const sp_ = ez.outExpo(clamp((t - bt(s.b0 + 0.5)) / 0.45));
      T(s.subE, { x: (W - s.subW) / 2, y: ny + s.numSize * 1.05 + (1 - sp_) * 40, op: sp_ });
    }
  }

  function seek(t) {
    const b = tb(t);
    const k = SC.findIndex((s) => b >= s.b0 && b < s.b1);
    const s = k >= 0 ? SC[k] : null;
    const inEnd = b >= END.b0;
    const pal = s ? s.pal : BG.blue;
    bgL.style.background = inEnd ? BG.blue.bg : pal.bg;
    SC.forEach((c) => show(c.root, c === s));
    const onFoot = s && s.pal.foot && !inEnd;
    show(footL, onFoot);
    if (onFoot) {
      let cl = s.cuts[0]; s.cuts.forEach((c) => { if (t >= c[1]) cl = c; });
      const m = MAN[cl[0]] || 1, loc = Math.max(0, t - cl[1]) + (cl[0].startsWith("g_") ? 0 : 0.3);
      const src = `../assets/cv9/frames/${cl[0]}/${String(Math.min(m, Math.floor(loc * 24) + 1)).padStart(4, "0")}.jpg`;
      if (footImg.dataset.src !== src) { footImg.dataset.src = src; footImg.src = src; pend = footImg.decode().catch(() => {}); }
      const pr_ = clamp((t - cl[1]) / 1.5);
      T(footImg, { s: 1.04 + 0.05 * pr_ });
    }
    // camera: a kick punch on every beat, a harder one on the bar
    const ph = (b - Math.floor(b)) * PER, bar = Math.floor(b) % 4 === 0;
    const kick = 0 * ph * bar;   // no whole-frame bumps: only elements move
    cardsL.style.transformOrigin = "50% 50%";
    T(cardsL, { s: 1 + 0.014 * kick });
    if (s) {
      paintCard(s, t);
      // every card settles in and lifts out: the cut never feels static
      const din = t - bt(s.b0), dout = bt(s.b1) - t;
      const ei = ez.outExpo(clamp(din / 0.28)), eo = ez.inExpo(clamp(1 - dout / 0.22));
      s.root.style.transformOrigin = "50% 50%";
      const push = 1 + 0.045 * clamp(din / (bt(s.b1) - bt(s.b0)));            // a slow push-in: no card ever holds still
      T(s.root, { y: (1 - ei) * 46 - eo * 70, s: lerp(1.05, 1, ei) * (1 - 0.05 * eo) * push, op: 1 - eo * 0.9 });
    }
    // wipe into the next colour: alternating up / sideways, expo in-out, lime leading edge
    const nx = inEnd ? null : SC[k + 1] || { pal: BG.blue, i: SC.length, b0: END.b0 };
    let wp = 0;
    if (nx && s && nx.pal !== s.pal) { const w0 = bt(nx.b0) - 0.2; wp = clamp((t - w0) / 0.2); }
    show(wipe, wp > 0 && wp < 1);
    if (wp > 0 && wp < 1) {
      const e = ez.inOutExpo(wp), up = nx.i % 2;
      wipe.style.background = nx.pal.bg;
      wipe.style.transformOrigin = "0 0";
      if (up) { T(wipe, { y: H * (1 - e) }); Object.assign(edge.style, { width: W + "px", height: "14px", transform: "translate(0,-14px)" }); }
      else { T(wipe, { x: -W * (1 - e) }); Object.assign(edge.style, { width: "14px", height: H + "px", transform: `translate(${W}px,0)` }); }
    }
    // slam flash: one hit of the accent on each slammed card
    const fl = s && s.fx === "slam" ? Math.exp(-Math.max(0, t - bt(s.b0)) / 0.05) * (t >= bt(s.b0) ? 1 : 0) : 0;
    show(flash, fl > 0.02); if (fl > 0.02) { flash.style.background = s.pal.acc; flash.style.opacity = (s.pal.foot ? 0.18 : 0.4) * fl; }
    // end card
    show(endL, inEnd);
    if (inEnd) {
      const d = t - bt(END.b0);
      const e = spring(d, 1.7, 7.5);
      const lw = 640, lh = lw * (160 / 221);
      const bp = Math.exp(-((b - END.b0) % 1) * PER / 0.09) * (b - END.b0 > 1 ? 1 : 0);
      T(logo, { x: (W - lw) / 2, y: H / 2 - lh / 2 - 190, s: (0.35 + 0.65 * clamp(e, 0, 1.2)) * (1 + 0.03 * bp), r: (1 - clamp(e, 0, 1)) * -8, op: clamp(d / 0.1) });
      const pp = spring(d - 0.55, 2, 8);
      T(pill, { x: (W - pill.offsetWidth) / 2, y: H / 2 + 170, s: Math.max(0.001, clamp(pp, 0, 1.15)) * (1 + 0.045 * bp), op: d > 0.55 ? 1 : 0 });
      pill.style.boxShadow = `0 0 0 ${Math.round(16 * bp)}px rgba(198,255,61,${0.5 * bp})`;
      const fe = 0 * d;
      show(flash, fe > 0.02); if (fe > 0.02) { flash.style.background = "#FFFFFF"; flash.style.opacity = 0.6 * fe; }
    }
  }

  /* ---------- sound design: every visual event has its own cue; each film has its own palette ---------- */
  const PAL = {
    1: { key: "key", del: "tick", wipeU: "air", wipeS: "air", slam: ["bloom", "thump"], rise: "tap", scroll: "whoosh-s", strike: "swipe", wheel: "glint", count: "blip", land: "thump", box: "glass", logo: ["bloom", "shimmer"], pill: "ding" },
    2: { key: "click", del: "tick", wipeU: "zip", wipeS: "swipe", slam: ["slam", "thump"], rise: "tick", scroll: "whoosh-s", strike: "zip", wheel: "wheel", count: "blip", land: "slam", box: "select", logo: ["impact", "sparkle"], pill: "pop" },
    3: { key: "key", del: "tick", wipeU: "whoosh-s", wipeS: "zip", slam: ["impact", "slam"], rise: "tap", scroll: "whoosh-s", strike: "swipe", wheel: "blip", count: "blip", land: "impact", box: "glint", logo: ["impact", "sparkle"], pill: "ding" },
  }[VID];
  const tb2 = (sec) => sec / PER;
  function buildCues() {
    const cues = [], cue = (beat, type, gain = 1, extra = {}) => cues.push({ beat: +beat.toFixed(4), type, gain, pan: extra.pan || 0, ...extra });
    const keys = (b0, n, cps, gain = 0.32) => cue(b0, "typing", gain * 2.2, { dur: n / cps });
    SC.forEach((s, i) => {
      const nx = SC[i + 1];
      if (i > 0 && SC[i - 1].pal !== s.pal) cue(s.b0, s.i % 2 ? PAL.wipeU : PAL.wipeS, 0.55, { dir: s.i % 2 ? 1 : -1 });
      else if (i > 0 && s.pal.foot) cue(s.b0, "whoosh", 0.45);
      if (s.cuts) s.cuts.slice(1).forEach((c, k) => cue(c[1], k % 2 ? "tap" : "zip", 0.35));
      if (!s.kind) {
        if (s.fx === "type") keys(s.b0, Math.min(s.tb.total, 40), TYPE_CPS);
        if (s.fx === "rise") s.tb.rows.flatMap((r) => r.words).forEach((w, k) => cue(s.b0 + tb2(0.045 * k), PAL.rise, 0.45, { pan: (k % 2 ? 0.2 : -0.2) }));
        if (s.fx === "slam") PAL.slam.forEach((ty, k) => cue(s.b0, ty, k ? 0.7 : 0.85));
        if (s.fx === "scroll") { cue(s.b0, PAL.scroll, 0.7); cue(s.b0 + tb2(0.45), PAL.land, 0.6); }
        if (s.fx === "strike") { s.tb.rows.flatMap((r) => r.words).forEach((w, k) => cue(s.b0 + tb2(0.045 * k), PAL.rise, 0.4)); cue(s.strikeAt, PAL.strike, 0.8); }
      } else if (s.kind === "phone") {
        cue(s.b0, "whoosh", 0.6); cue(s.b0 + 0.25, "pop", 0.6); cue(s.b0, PAL.rise, 0.4);
      } else if (s.kind === "stack") {
        cue(s.b0, PAL.rise, 0.45);
        if (s.box) { PAL.slam.forEach((ty, k) => cue(s.b0 + 0.75, ty, k ? 0.6 : 0.8)); cue(s.b0 + 1.1, PAL.box, 0.7); }
        else keys(s.b0 + 0.3, Math.min(s.tb.total, 40), TYPE_CPS);
        if (s.sub) cue(s.b0 + 1.75, PAL.rise, 0.45);
      } else if (s.kind === "swap") {
        const n = s.items.length, seg = s.d / n;
        s.tbs.forEach((tbk, k) => {
          const sb = s.b0 + k * seg;
          keys(sb, tbk.total, TYPE_CPS, 0.36);
          if (k < n - 1) { const nd = tbk.total; for (let j = 0; j < nd; j += 2) cue(sb + seg - tb2((nd - j) / DEL_CPS), PAL.del, 0.22); }
        });
      } else if (s.kind === "wheel") {
        cue(s.b0, PAL.rise, 0.5);
        s.at.forEach((a, k) => cue(a, k ? PAL.wheel : PAL.rise, 0.55, { step: k, pan: 0.15 }));
        cue(s.at.at(-1), PAL.box, 0.5);
      } else if (s.kind === "count") {
        const dur = 0.6;
        for (let k = 0; k < 9; k++) cue(s.b0 + tb2(dur * (1 - Math.pow(1 - k / 9, 2.2)) * 0.9), PAL.count, 0.32, { step: k });
        cue(s.b0 + tb2(dur), PAL.land, 0.85);
        cue(s.b0 + 1, PAL.rise, 0.4);
      }
    });
    PAL.logo.forEach((ty, k) => cue(END.b0, ty, k ? 0.6 : 0.9));
    cue(END.b0 + tb2(0.55), PAL.pill, 0.7);
    const MAPT = { tick: "tap", swipe: "whoosh", "whoosh-s": "whoosh", blip: "glint", glass: "pop", ding: "pop", wheel: "tap", click: "tap" };
    return cues.map((c) => ({ ...c, t: +c.beat.toFixed(3), type: MAPT[c.type] || c.type })).sort((a, b) => a.t - b.t);
  }

  window.ready = (async () => {
    const svg = await fetch("../assets/brand/logo-white.svg").then((r) => r.text());
    // the score is synthesized on this exact grid; a measured grid (if rendered) only confirms it
    MAN = await fetch("../assets/cv9/frames/manifest.json").then((r) => r.json());
    window.VO = { file: `assets/cv-vo/raw${VID}.mp3`, offset: 0 };
    await Promise.all(["400 100px Geist", "500 100px Geist", "600 100px Geist", "700 100px Geist", "800 100px Geist", '500 20px "Geist Mono"'].map((f) => document.fonts.load(f)));
    logo.innerHTML = svg.replace("<svg ", '<svg width="640" height="463" viewBox="0 0 221 160" ');
    SC.forEach(build);
    window.CUES = buildCues();
    window.SCENES = SC.map((c) => ({ t0: c.b0, t1: c.b1, kind: c.kind || c.fx, text: c.text0.replace(/\*\*/g, "").replace(/\|/g, " ") }));
    window.DURATION = LEN;
    window.seek = (t) => { pend = pend2 = null; seek(t); return Promise.all([pend, pend2]); };
    seek(0);
    return { duration: LEN, scenes: SC.length, endBeat: END.b0 };
  })();
})();
