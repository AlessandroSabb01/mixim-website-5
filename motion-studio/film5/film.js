/* Création Virale — three 30 s text films (9:16): Qui on est / Ce qu'on fait / Pourquoi nous.
   Style from the reference: flat colour cards cut on the beat, one sans with regular/bold contrast,
   type-on with a caret, in-place word swaps, a word wheel, thin design-tool guides, tiny mono labels.
   ?v=1|2|3 picks the film, ?k=a|b|c the hook (pattern interrupt / shock stat / question).
   window.seek(t) paints frame t (pure function of t). The soundtrack is the supplied MP3 (112.4 BPM). */
(() => {
  const P = new URLSearchParams(location.search);
  const W = +(P.get("w") || 1080), H = +(P.get("h") || 1920);
  const VID = clamp0(+(P.get("v") || 1), 1, 3), HK = /^[abc]$/.test(P.get("k") || "") ? P.get("k") : "a";
  function clamp0(x, a, b) { return Math.max(a, Math.min(b, x || a)); }

  /* ---------- palette: brand blue leads, paper and ink support, lime is the caret/accent ---------- */
  const BG = {
    blue: { bg: "#2C5BFF", ink: "#FFFFFF", acc: "#C6FF3D", mute: "rgba(255,255,255,.55)", guide: "rgba(255,255,255,.22)" },
    paper: { bg: "#EEF0F5", ink: "#0B0C10", acc: "#2C5BFF", mute: "rgba(11,12,16,.5)", guide: "rgba(11,12,16,.16)" },
    ink: { bg: "#0B0C10", ink: "#FFFFFF", acc: "#6A8CFF", mute: "rgba(255,255,255,.5)", guide: "rgba(255,255,255,.16)" },
  };

  /* ---------- math ---------- */
  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const lerp = (a, b, t) => a + (b - a) * t;
  const ez = {
    outExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    inExpo: (t) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
    inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    outCubic: (t) => 1 - Math.pow(1 - t, 3),
  };
  const spring = (dt, f = 2.2, d = 8) => (dt <= 0 ? 0 : 1 - Math.exp(-d * dt) * Math.cos(2 * Math.PI * f * dt));

  /* ---------- beat grid ---------- */
  let BTS = [], PER = 0.5336;
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
  const FF = "Geist, sans-serif", MONO = '"Geist Mono", monospace';

  /* ---------- copy ----------
     line: rows separated by "|", **bold**; the final . ? ! , takes the accent colour.
     fx: type (caret types it on), rise (word masks), slam (scale in + shake), scroll (feed scroll), swap (type, delete, retype) */
  const HOOKS = {
    1: {
      a: [{ d: 1.5, bg: "ink", line: "**STOP.**", size: 330, fx: "slam" }, { d: 2.5, bg: "paper", line: "Ton prochain|client", size: 150, fx: "type" },
        { d: 1.5, bg: "blue", line: "**scrolle.**", size: 230, fx: "scroll" }, { d: 2, bg: "blue", line: "En ce moment.", fx: "rise" }],
      b: [{ d: 2.5, bg: "ink", line: "**3**|secondes.", size: 210, fx: "slam" }, { d: 2.5, bg: "paper", line: "C'est tout ce|que t'as", fx: "type" },
        { d: 2.5, bg: "blue", line: "pour arrêter|le **scroll.**", fx: "rise" }],
      c: [{ d: 2.5, bg: "ink", line: "Pourquoi|**personne**", fx: "type" }, { d: 2, bg: "paper", line: "ne voit", fx: "rise" },
        { d: 3, bg: "blue", line: "tes **vidéos ?**", size: 160, fx: "slam" }],
    },
    2: {
      a: [{ d: 3.5, bg: "ink", line: "Arrête|de **poster**", fx: "type" }, { d: 4, bg: "blue", line: "pour **rien.**", size: 190, fx: "slam" }],
      b: [{ d: 3, bg: "ink", kind: "count", value: 7.5, dec: 1, suf: " M+", sub: "de vues." }, { d: 2, bg: "paper", line: "Pour des|entreprises", fx: "rise" },
        { d: 2.5, bg: "blue", line: "comme la|**tienne.**", fx: "slam" }],
      c: [{ d: 2, bg: "paper", line: "Tu postes.", fx: "type" }, { d: 2.5, bg: "ink", line: "Personne|réagit.", fx: "type" },
        { d: 3, bg: "blue", line: "**Pourquoi ?**", size: 200, fx: "slam" }],
    },
    3: {
      a: [{ d: 2.5, bg: "ink", line: "Les **likes**,", size: 170, fx: "slam" }, { d: 2.5, bg: "paper", line: "ça paie pas", fx: "type" },
        { d: 2.5, bg: "blue", line: "le **loyer.**", size: 200, fx: "slam" }],
      b: [{ d: 4, bg: "ink", kind: "count", value: 59, suf: "×", sub: "plus de vues." }, { d: 3.5, bg: "blue", line: "En deux|**mois.**", fx: "rise" }],
      c: [{ d: 3.5, bg: "ink", line: "Et si ta|prochaine vidéo", fx: "type" }, { d: 4, bg: "blue", line: "**changeait|tout ?**", size: 170, fx: "slam" }],
    },
  };
  const BODY = {
    1: [
      { d: 3, bg: "paper", kind: "stack", top: "On est", line: "Création **Virale.**" },
      { d: 3, bg: "blue", line: "Une agence|**québécoise.**", fx: "rise" },
      { d: 2, bg: "ink", line: "On ne fait pas", fx: "type" },
      { d: 2, bg: "ink", line: "du **contenu.**", fx: "strike" },
      { d: 2, bg: "paper", line: "On fait du contenu", fx: "type" },
      { d: 3, bg: "blue", line: "**qu'on|regarde.**", size: 190, fx: "slam" },
      { d: 6, bg: "blue", kind: "swap", label: "RÔLE", items: ["**Stratèges.**", "**Créateurs.**", "**Raconteurs.**"] },
      { d: 7, bg: "ink", kind: "wheel", lead: "Pour", items: ["les restos", "les boutiques", "les cliniques", "les gyms", "les salons", "les entreprises d'ici"] },
      { d: 2, bg: "paper", line: "qui méritent", fx: "rise" },
      { d: 5, bg: "blue", line: "d'être|**vues.**", size: 220, fx: "slam" },
    ],
    2: [
      { d: 2, bg: "paper", line: "On s'occupe", fx: "type" },
      { d: 2.5, bg: "blue", line: "de **tout.**", size: 220, fx: "slam" },
      { d: 5, bg: "ink", kind: "stack", top: "Du concept", line: "à la **publication.**" },
      { d: 9, bg: "blue", kind: "wheel", lead: "On fait", items: ["Stratégie", "Tournage", "Coaching caméra", "Montage", "Sous-titres", "Diffusion"] },
      { d: 6, bg: "ink", kind: "wheel", lead: "Sur", items: ["Instagram", "TikTok", "Facebook", "YouTube"] },
      { d: 1.5, bg: "paper", line: "**Toi,**", size: 230, fx: "slam" },
      { d: 3, bg: "paper", line: "tu gères ton|**entreprise.**", fx: "rise" },
      { d: 1.5, bg: "blue", line: "**Nous,**", size: 230, fx: "slam" },
      { d: 4.5, bg: "blue", line: "on la rend|**visible.**", fx: "rise" },
    ],
    3: [
      { d: 5, bg: "blue", kind: "count", label: "SUSHI X", value: 59, suf: "×", sub: "sur Instagram." },
      { d: 5, bg: "ink", kind: "count", label: "AU PETIT CHALET", value: 18, suf: "×", sub: "sur Facebook." },
      { d: 5, bg: "blue", kind: "count", label: "MEXICANOS", value: 14, suf: "×", sub: "sur TikTok." },
      { d: 6, bg: "paper", kind: "swap", label: "RÉSULTATS", items: ["Pas de **chance.**", "Une **méthode.**"] },
      { d: 5, bg: "ink", kind: "count", label: "NOS CLIENTS", value: 7.5, dec: 1, suf: " M+", sub: "vues générées." },
      { d: 3, bg: "paper", line: "La prochaine ?", fx: "type" },
      { d: 6, bg: "blue", line: "**La tienne.**", size: 210, fx: "slam" },
    ],
  };
  const CLOSE = [{ d: 4, bg: "paper", kind: "stack", top: "Écris-nous", line: "**VIRAL**", size: 250, box: true, sub: "en DM." }];
  const TOPIC = { 1: "QUI ON EST", 2: "CE QU'ON FAIT", 3: "POURQUOI NOUS" }[VID];

  /* ---------- timeline: the first card is on screen at t = 0 ---------- */
  const SC = [];
  let cur = -0.53;
  [...HOOKS[VID][HK], ...BODY[VID], ...CLOSE].forEach((s, i) => { SC.push({ ...s, i, b0: cur, b1: cur + s.d, text0: [s.top, s.line, s.lead, s.items && s.items.join(" / "), s.value != null && `${s.label ? s.label + " " : ""}${String(s.value).replace(".", ",")}${s.suf} ${s.sub}`, s.box && s.sub].filter(Boolean).join(" ") }); cur += s.d; });
  const END = { b0: cur };

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
  const cardsL = el(stage, { width: W + "px", height: H + "px" });
  const wipe = el(stage, { width: W + "px", height: H + "px", transformOrigin: "50% 100%" });
  const hud = el(stage, { width: W + "px", height: H + "px" });
  const lab = (txt, css) => { const e = el(hud, { font: `500 23px/1 ${MONO}`, letterSpacing: "0.14em", whiteSpace: "pre", ...css }); e.textContent = txt; return e; };
  const HUD = [lab("CRÉATION VIRALE", { left: "60px", top: "86px" }), lab(`0${VID} / 03`, { right: "60px", top: "86px", left: "auto" }),
    lab(TOPIC, { left: "60px", top: H - 112 + "px" }), lab("QUÉBEC · 2026", { right: "60px", top: H - 112 + "px", left: "auto" })];

  function build(s) {
    const pal = BG[s.bg], root = el(cardsL, { width: W + "px", height: H + "px" });
    s.pal = pal; s.root = root;
    const cy = H / 2;
    if (!s.kind) {
      s.tb = textBlock(root, s.line, { size: s.size || 150, pal });
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
  pill.innerHTML = `Écris-nous <b style="font-weight:800;color:#2C5BFF">VIRAL</b> en DM`;

  /* ---------- paint ---------- */
  function paintText(s, tbk, t, mode, x0, y0) {
    const d = t - bt(s.b0);
    T(tbk.root, { y: y0 });
    if (mode === "type") {
      const n = Math.floor(Math.max(0, d) * 36);
      typeTo(tbk, n, n < tbk.total || Math.floor(t * 2.6) % 2 === 0);
    } else {
      resetType(tbk);
      let k = 0;
      tbk.rows.forEach((r) => r.words.forEach((w) => {
        const p = mode === "rise" ? ez.outExpo(clamp((d - 0.07 * k) / 0.45)) : 1;
        w.ink.style.transform = mode === "rise" ? `translateY(${(1 - p) * 105}%)` : "";
        k++;
      }));
      if (mode === "slam") {
        const e = ez.outExpo(clamp(d / 0.32)), j = d > 0 ? 14 * Math.exp(-d / 0.09) : 0;
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
        const r = s.tb.rows[0], sw = r.w + 30, p = ez.outExpo(clamp((t - bt(s.b0 + 1)) / 0.3));
        Object.assign(s.strike.style, { width: sw + "px" });
        T(s.strike, { x: (W - sw) / 2, y: s.ty + s.tb.h * 0.5, sx: Math.max(0.001, p), op: p > 0 ? 1 : 0 });
      }
    } else if (s.kind === "stack") {
      paintText(s, s.top, t, "rise", 0, s.yTop);
      const ts = s.b0 + 0.75;
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
      const nIn = Math.floor(Math.max(0, din) * 34), nOut = i < n - 1 ? Math.floor(Math.max(0, dout) * 55) : 1e9;
      const nv = Math.min(nIn, nOut, tbk.total);
      typeTo(tbk, nv, nv < tbk.total || Math.floor(t * 2.6) % 2 === 0);
      T(s.label, { x: s.lx, y: s.ty - 70, op: clamp(din / 0.3) });
      s.count.textContent = `${String(i + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}`;
      T(s.count, { x: s.rx - s.count.offsetWidth, y: s.ty - 70, op: clamp((t - bt(s.b0)) / 0.3) });
    } else if (s.kind === "wheel") {   // fixed lead word + a rolling column; the active line is bold, the last one takes the accent
      const n = s.items.length, step = (s.d - 0.6) / n;
      const raw = (b - s.b0 - 0.35) / step, i = clamp(Math.floor(raw), 0, n - 1);
      const e = ez.outExpo(clamp(((raw - i) * step * PER) / 0.38));
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
    } else if (s.kind === "count") {
      const c = ez.outExpo(clamp((t - bt(s.b0)) / (1.1 * PER * 2)));
      const v = s.value * c;
      s.num.innerHTML = `${fmtNum(s.dec ? Math.round(v * 10) / 10 : Math.round(v), s.dec)}<span style="color:${s.pal.acc}">${s.suf}</span>`;
      const pop = 1 + 0.08 * Math.exp(-Math.max(0, t - bt(s.b0) - 1.1 * PER * 2) / 0.12) * (c > 0.995 ? 1 : 0);
      const ny = H / 2 - 260 + (380 - s.numSize) * 0.5;
      T(s.num, { x: (W - s.numW) / 2, y: ny, s: lerp(1.25, 1, ez.outExpo(clamp(d / 0.35))) * pop });
      if (s.labE) T(s.labE, { x: (W - s.labE.offsetWidth) / 2, y: ny - 70, op: clamp(d / 0.3) });
      const sp_ = ez.outExpo(clamp((t - bt(s.b0 + 1)) / 0.45));
      T(s.subE, { x: (W - s.subW) / 2, y: ny + s.numSize * 1.05 + (1 - sp_) * 40, op: sp_ });
    }
  }

  function seek(t) {
    const b = tb(t);
    const k = SC.findIndex((s) => b >= s.b0 && b < s.b1);
    const s = k >= 0 ? SC[k] : null;
    const inEnd = b >= END.b0;
    // background + wipe into the next card's colour (alternating up / sideways)
    const pal = s ? s.pal : BG.blue;
    bgL.style.background = pal.bg;
    SC.forEach((c) => show(c.root, c === s));
    if (s) paintCard(s, t);
    const nx = inEnd ? null : SC[k + 1] || { pal: BG.blue, i: SC.length, b0: END.b0 };
    let wp = 0;
    if (nx && s && nx.pal !== s.pal) { const w0 = bt(nx.b0) - 0.2; wp = clamp((t - w0) / 0.2); }
    show(wipe, wp > 0 && wp < 1);
    if (wp > 0 && wp < 1) { wipe.style.background = nx.pal.bg; wipe.style.transformOrigin = nx.i % 2 ? "50% 100%" : "0 50%"; wipe.style.transform = nx.i % 2 ? `scaleY(${ez.inOutCubic(wp)})` : `scaleX(${ez.inOutCubic(wp)})`; }
    // hud
    show(hud, !inEnd);
    HUD.forEach((h) => (h.style.color = pal.mute));
    // end card
    show(endL, inEnd);
    if (inEnd) {
      bgL.style.background = BG.blue.bg;
      const d = t - bt(END.b0);
      const e = spring(d, 1.6, 7);
      const lw = 640, lh = lw * (160 / 221);
      const bp = Math.exp(-((b - END.b0) % 2) * PER / 0.14) * (b - END.b0 > 1.5 ? 1 : 0);      // a kick on every other beat
      T(logo, { x: (W - lw) / 2, y: H / 2 - lh / 2 - 190, s: (0.4 + 0.6 * clamp(e, 0, 1.2)) * (1 + 0.035 * bp), op: clamp(d / 0.15) });
      const pp = spring(d - 0.9, 1.8, 7);
      T(pill, { x: (W - pill.offsetWidth) / 2, y: H / 2 + 170, s: Math.max(0.001, clamp(pp, 0, 1.15)) * (1 + 0.05 * bp), op: d > 0.9 ? 1 : 0 });
      pill.style.boxShadow = `0 0 0 ${Math.round(14 * bp)}px rgba(198,255,61,${0.55 * bp})`;
    }
  }

  window.ready = (async () => {
    const [beats, svg] = await Promise.all([fetch("../beats-cvtext.json").then((r) => r.json()), fetch("../assets/brand/logo-white.svg").then((r) => r.text())]);
    BTS = beats.beats; PER = beats.period;
    await Promise.all(["400 100px Geist", "500 100px Geist", "600 100px Geist", "700 100px Geist", "800 100px Geist", '500 20px "Geist Mono"'].map((f) => document.fonts.load(f)));
    logo.innerHTML = svg.replace("<svg ", '<svg width="640" height="463" viewBox="0 0 221 160" ');
    HUD.forEach((h, k) => { if (k % 2) h.style.left = W - 60 - h.getBoundingClientRect().width + "px"; });
    SC.forEach(build);
    window.CUES = [];
    window.SCENES = SC.map((c) => ({ t0: bt(c.b0), t1: bt(c.b1), kind: c.kind || c.fx, text: c.text0.replace(/\*\*/g, "").replace(/\|/g, " "), hook: c.i < HOOKS[VID][HK].length }));
    window.SCENES.push({ t0: bt(END.b0), t1: 30, kind: "end", text: "Logo + Écris-nous VIRAL en DM" });
    window.seek = seek;
    seek(0);
    return { duration: 30, scenes: SC.length, endBeat: END.b0 };
  })();
})();
