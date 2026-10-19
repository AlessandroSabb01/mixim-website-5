/* ===================== Review: player, frame-exact ink, beat timeline, comments, requests, compare ===================== */
const INK = ["#FF3B5C", "#FFC400", "#2C5BFF", "#22D3A6", "#FFFFFF"];
const INK_NAMES = ["red", "yellow", "blue", "mint", "white"];
const CH_PAL = ["#4E78FF", "#8B5CF6", "#FF3D8B", "#22D3A6", "#FFC400", "#6A8CFF", "#FF7A45", "#C6FF3D", "#B49CFF", "#4E78FF", "#E6E8EE"];
let R = null;

const statusOf = (c, vid) => c.status === "resolved" ? "done" : c.status === "in_progress" ? (c.fixedIn ? "check" : "prog") : "open";
const STATUS_TXT = { open: "Open", prog: "In correction", check: "Check fix", done: "Resolved" };

VIEWS.project = {
  pendingTab: null,
  enter(route) {
    R = { pid: route.pid, wantVid: route.vid, vid: null, ver: null, tab: this.pendingTab || "comments", filter: "open",
      tool: null, color: INK[0], draft: { t: null, shapes: [] }, drawing: null, sel: null, speed: 1, muted: false, loop: false,
      compare: null, playing: false, t: 0, fi: 0, raf: 0, mounted: "", delArm: null };
    this.pendingTab = null;
    this.build();
    R.key = (e) => onKey(e);
    document.addEventListener("keydown", R.key);
  },
  leave() {
    if (!R) return;
    document.removeEventListener("keydown", R.key);
    teardownStage();
    R = null;
  },
  update(kind, pid) {
    if (!R) return;
    if (kind === "projects") { if (!R.mounted) this.build(); else renderVbar(); return; }
    if (pid !== R.pid) return;
    if (kind === "versions") {
      const vs = versionsOf(R.pid);
      if (!R.ver || !vs.find((v) => v.id === R.vid)) { pickVersion(); mountStage(); }
      else { R.ver = vs.find((v) => v.id === R.vid); }
      renderVbar();
    }
    if (kind === "comments") { renderPins(); drawInk(); }
    renderRail();
  },
  build() {
    const p = P(R.pid);
    const root = $("#view");
    if (!p) {
      root.innerHTML = `<main class="wrap review" style="grid-template-columns:minmax(0,1fr)"><div class="card empty"><b>${ST.booted || !CAP.db ? "Project not found" : "Opening the project…"}</b><span>${ST.booted || !CAP.db ? "It may have been removed. Go back to the studio to pick another." : ""}</span>${ST.booted || !CAP.db ? `<button class="btn" id="bk">Back to the studio</button>` : ""}</div></main>`;
      $("#bk") && ($("#bk").onclick = () => go({ view: "home" }));
      return;
    }
    root.innerHTML = `<main class="wrap review" id="rv">
      <section style="min-width:0">
        <div class="vbar" id="vbar"></div>
        <div class="stage" id="stage"></div>
      </section>
      <aside class="rail" aria-label="Comments and requests">
        <div class="tabs" role="tablist" id="tabs"></div>
        <div id="composer"></div>
        <div id="panel" class="list"></div>
        <div id="sendBox"></div>
      </aside></main>`;
    R.mounted = "shell";
    pickVersion();
    renderVbar();
    mountStage();
    renderRail();
  },
};

function pickVersion() {
  const vs = versionsOf(R.pid);
  const v = vs.find((x) => x.id === R.wantVid) || vs.find((x) => x.id === R.vid) || vs[vs.length - 1] || null;
  R.vid = v?.id || null; R.ver = v;
}
function setVersion(vid) {
  if (vid === R.vid && !R.compare) return;
  R.wantVid = vid; R.compare = null; R.sel = null; R.draft = { t: null, shapes: [] };
  const keepT = R.t;
  pickVersion();
  try { history.replaceState(null, "", `#p.${R.pid}.${R.vid}`); } catch {}
  renderVbar(); mountStage(keepT); renderRail();
}

/* ---------- version bar ---------- */
function renderVbar() {
  const el = $("#vbar"); if (!el) return;
  const vs = versionsOf(R.pid);
  el.innerHTML = `
    <div class="vsel" role="group" aria-label="Versions">${vs.map((v) => `<button data-v="${esc(v.id)}" aria-pressed="${!R.compare && v.id === R.vid}" title="${esc(v.title || "")}">${esc(v.label || "v" + v.n)}<small>${v.kind === "frames" ? "frames" : ago(v.createdAt)}</small></button>`).join("") || `<button disabled>No versions yet</button>`}</div>
    <button class="btn sm ${R.compare ? "dark" : ""}" id="cmpBtn" ${vs.filter((v) => v.kind !== "frames").length < 2 ? "disabled" : ""} aria-pressed="${!!R.compare}">${ICON.compare}Compare</button>
    <span class="grow"></span>
    <button class="btn sm ghost" id="rulesBtn">${ICON.book}Brief &amp; rules</button>
    <button class="btn sm" id="dlBtn" ${!R.ver || R.ver.kind === "frames" ? "disabled" : ""}>${ICON.download}Download</button>`;
  $$("[data-v]", el).forEach((b) => (b.onclick = () => setVersion(b.dataset.v)));
  $("#cmpBtn").onclick = toggleCompare;
  $("#rulesBtn").onclick = openRules;
  $("#dlBtn").onclick = download;
}

/* ---------- stage ---------- */
function teardownStage() {
  if (!R) return;
  cancelAnimationFrame(R.raf);
  (R.medias || []).forEach((m) => { try { m.pause(); } catch {} });
  R.ro?.disconnect();
  R.medias = []; R.media = null;
}
function mountStage(keepT = 0) {
  teardownStage();
  const st = $("#stage"); if (!st) return;
  const v = R.ver;
  st.classList.toggle("compare", !!R.compare);
  if (!v) {
    const reqs = requestsOf(R.pid).filter((r) => r.status !== "done");
    st.innerHTML = `<div class="stage-in" style="padding:24px"><div class="empty" style="color:var(--stage-muted)"><b style="color:#fff">${reqs.length ? "Claude is building the first preview" : "No version yet"}</b>
      <span>${reqs.length ? "The 30 key frames will appear here as soon as they are ready. You will mark them up before anything is rendered." : "Send a brief from “Create a new video”, or ask Claude to add a rendered cut."}</span></div></div>`;
    R.mounted = "empty"; return;
  }
  R.kind = v.kind === "frames" ? "frames" : "video";
  R.fps = v.fps || 30; R.bpm = v.bpm || 120;
  R.frames = (v.frames || []).slice().sort((a, b) => a.t - b.t);
  R.dur = R.kind === "frames" ? Math.max(v.duration || 0, (R.frames.at(-1)?.t || 0) + 0.5) : (v.duration || 30);
  if (R.compare) st.innerHTML = compareHTML();
  else st.innerHTML = stageHTML(v);
  st.insertAdjacentHTML("beforeend", transportHTML() + timelineHTML());
  R.mounted = R.compare ? "compare" : R.kind;
  R.canvas = $("#ink"); R.ctx = R.canvas?.getContext("2d");
  if (R.compare) {
    R.medias = [$("#vidA"), $("#vidB")]; R.media = R.medias[0];
    $("#cmpA").onchange = (e) => { R.compare.a = e.target.value; mountStage(R.t); };
    $("#cmpB").onchange = (e) => { R.compare.b = e.target.value; mountStage(R.t); };
  } else if (R.kind === "video") {
    R.media = $("#vid"); R.medias = [R.media];
  } else {
    R.media = null; R.medias = [];
    R.fi = clamp(R.frames.findIndex((f) => f.t >= keepT - 1e-3), 0, R.frames.length - 1);
    showFrame(R.fi);
  }
  R.medias.forEach((m) => {
    m.muted = R.muted; m.playbackRate = R.speed;
    m.addEventListener("loadedmetadata", () => { if (m === R.media && isFinite(m.duration)) { R.dur = m.duration; drawTimeline(); renderChapters(); renderPins(); } if (keepT) m.currentTime = Math.min(keepT, (m.duration || R.dur) - 0.01); });
    m.addEventListener("play", () => { R.playing = true; paintPlay(); loop(); });
    m.addEventListener("pause", () => { if (m === R.media) { R.playing = false; paintPlay(); syncClock(); drawInk(); } });
    m.addEventListener("ended", () => { R.playing = false; paintPlay(); });
    m.addEventListener("seeked", () => { if (m === R.media) { syncClock(); drawInk(); } });
    m.addEventListener("loadeddata", () => { if (m !== R.media && !R.playing && Math.abs(m.currentTime - R.t) > 0.04) m.currentTime = R.t; });
  });
  bindStage();
  R.t = keepT || 0;
  // sprite for the timeline filmstrip
  R.sprite = null;
  const sv = R.compare ? versionsOf(R.pid).find((x) => x.id === R.compare.a) : v;
  if (R.kind === "frames") {
    R.thumbs = R.frames.map((f) => { const im = new Image(); im.onload = () => drawTimeline(); im.src = blobUrl(f.assetId); return im; });
  } else if (sv?.spriteAssetId) {
    const im = new Image(); im.onload = () => { R.sprite = im; drawTimeline(); }; im.src = blobUrl(sv.spriteAssetId);
    R.spriteN = sv.spriteN || Math.round((sv.duration || 30) * 2); R.spriteFps = sv.spriteFps || 2;
  }
  R.ro = new ResizeObserver(() => { sizeInk(); drawTimeline(); });
  R.ro.observe($("#tl")); if ($("#screen")) R.ro.observe($("#screen"));
  sizeInk(); renderChapters(); drawTimeline(); renderPins(); syncClock(); paintTools(); paintPlay();
}
const toolBtn = (k, label) => `<button data-tool="${k}" aria-label="${label}" aria-pressed="false" title="${label}">${ICON[k]}</button>`;
function stageHTML(v) {
  return `<div class="stage-in">
    <div class="tools" id="tools" role="toolbar" aria-label="Drawing tools">
      ${toolBtn("pen", "Pen (P)")}${toolBtn("arrow", "Arrow (A)")}${toolBtn("rect", "Rectangle (R)")}<hr>
      ${INK.map((c, i) => `<button class="sw" data-color="${c}" aria-label="Ink ${INK_NAMES[i]}" aria-pressed="${c === R.color}"><i style="background:${c}"></i></button>`).join("")}<hr>
      <button data-act="undo" aria-label="Undo last mark (Ctrl+Z)" title="Undo last mark">${ICON.undo}</button>
      <button data-act="clear" aria-label="Clear the drawing" title="Clear the drawing">${ICON.trash}</button>
    </div>
    <div class="screen" id="screen">
      ${R.kind === "frames" ? `<img class="still" id="still" alt="Preview frame">` : `<video id="vid" playsinline preload="auto" poster="${blobUrl(v.posterAssetId)}" src="${blobUrl(v.assetId)}"></video>`}
      <canvas id="ink" aria-label="Drawing layer"></canvas>
      <span class="tag" id="vtag">${esc(v.label || "v" + v.n)}${R.kind === "frames" ? " · KEY FRAMES" : ""}</span>
      ${R.kind === "frames" ? "" : `<button class="bigplay" id="bigplay" aria-label="Play">${ICON.play}</button>`}
    </div>
    <div class="stage-hint"><kbd>Space</kbd> play &nbsp;<kbd>←</kbd><kbd>→</kbd> frame &nbsp;<kbd>⇧</kbd> beat<br>Pause · draw · comment</div>
  </div>`;
}
function compareHTML() {
  const vs = versionsOf(R.pid).filter((v) => v.kind !== "frames");
  const opt = (sel) => vs.map((v) => `<option value="${esc(v.id)}" ${v.id === sel ? "selected" : ""}>${esc(v.label || "v" + v.n)}</option>`).join("");
  const side = (k, id, vid) => { const v = vs.find((x) => x.id === vid); return `<div class="side"><div class="lbl">${k === "A" ? "BEFORE" : "AFTER"} <select id="cmp${k}" aria-label="Version ${k}">${opt(vid)}</select></div>
    <div class="screen"><video id="${id}" playsinline preload="auto" poster="${blobUrl(v?.posterAssetId)}" src="${blobUrl(v?.assetId)}"></video><span class="tag">${esc(v?.label || "")}</span></div></div>`; };
  return `<div class="stage-in">${side("A", "vidA", R.compare.a)}${side("B", "vidB", R.compare.b)}</div>`;
}
function transportHTML() {
  const frames = R.kind === "frames" && !R.compare;
  return `<div class="transport" role="group" aria-label="Transport">
    <button data-t="start" aria-label="Go to start" title="Start (Home)">${ICON.start}</button>
    <button data-t="bprev" aria-label="Previous beat" title="Previous beat (Shift+←)">${ICON.bprev}</button>
    <button data-t="fprev" aria-label="Previous frame" title="Previous frame (←)">${ICON.fprev}</button>
    ${frames ? "" : `<button class="play" data-t="play" aria-label="Play" title="Play / pause (Space)">${ICON.play}</button>`}
    <button data-t="fnext" aria-label="Next frame" title="Next frame (→)">${ICON.fnext}</button>
    <button data-t="bnext" aria-label="Next beat" title="Next beat (Shift+→)">${ICON.bnext}</button>
    <div class="tc" aria-live="off"><b id="tcT">00:00.00</b><span id="tcF">f 000</span><span class="hide-s" id="tcB">beat 0.0</span><span class="hide-s" id="tcD">/ ${fmtTC(R.dur)}</span></div>
    <span class="flex1" style="flex:1"></span>
    ${frames ? "" : `<button class="opt" data-t="speed" aria-label="Playback speed" title="Playback speed">${R.speed}×</button>
    <button class="opt" data-t="loop" aria-label="Loop the current chapter" aria-pressed="${R.loop}" title="Loop chapter" style="${R.loop ? "color:#fff;background:rgba(255,255,255,.12)" : ""}">${ICON.loop}</button>
    <button data-t="mute" aria-label="${R.muted ? "Unmute" : "Mute"}" title="Mute">${R.muted ? ICON.mute : ICON.vol}</button>`}
  </div>`;
}
function timelineHTML() {
  return `<div class="timeline" id="tl">
    <div class="chapters" id="chap"></div>
    <div class="tw" id="tw" style="position:relative">
      <div class="track" id="track"><canvas id="trk"></canvas></div>
      <div class="ruler"><canvas id="rul"></canvas></div>
      <div class="pins" id="pins"></div>
      <div class="head" id="head"></div>
      <div class="hover-thumb" id="hov" hidden><canvas width="184" height="328"></canvas><div></div></div>
    </div></div>`;
}

/* ---------- time ---------- */
const frameOf = (t) => Math.round(t * R.fps);
const beatOf = (t) => (t * R.bpm) / 60;
function curT() { if (R.kind === "frames" && !R.compare) return R.frames[R.fi]?.t || 0; return R.media ? R.media.currentTime : R.t; }
function seek(t) {
  t = clamp(t, 0, Math.max(0, R.dur - 0.5 / R.fps));
  if (R.kind === "frames" && !R.compare) {
    let best = 0; R.frames.forEach((f, i) => { if (Math.abs(f.t - t) < Math.abs(R.frames[best].t - t)) best = i; });
    showFrame(best); return;
  }
  R.t = t;
  R.medias.forEach((m) => { try { m.currentTime = t; } catch {} });
  syncClock(); drawInk();
}
function showFrame(i) {
  if (!R.frames.length) return;
  R.fi = clamp(i, 0, R.frames.length - 1);
  const f = R.frames[R.fi], im = $("#still");
  if (im) { im.src = blobUrl(f.assetId); im.onload = () => drawInk(); }
  R.t = f.t; syncClock(); drawInk();
}
function step(kind, dir) {
  if (R.kind === "frames" && !R.compare) {
    if (kind === "frame") return showFrame(R.fi + dir);
    const b = beatOf(curT()), target = dir > 0 ? Math.floor(b + 1e-6) + 1 : Math.ceil(b - 1e-6) - 1;
    const tt = (target * 60) / R.bpm;
    const i = dir > 0 ? R.frames.findIndex((f) => f.t >= tt - 1e-3) : R.frames.map((f) => f.t <= tt + 1e-3).lastIndexOf(true);
    return showFrame(i < 0 ? (dir > 0 ? R.frames.length - 1 : 0) : i);
  }
  pause();
  const t = curT();
  if (kind === "frame") seek((frameOf(t) + dir) / R.fps + 0.001);
  else { const b = beatOf(t), nb = dir > 0 ? Math.floor(b + 0.02) + 1 : Math.ceil(b - 0.02) - 1; seek((Math.max(0, nb) * 60) / R.bpm + 0.001); }
}
function play() {
  if (!R.media) return;
  R.tool = null; paintTools();
  if (curT() >= R.dur - 0.05) seek(0);
  R.medias.forEach((m) => m.play().catch(() => {}));
}
function pause() { R.medias.forEach((m) => m.pause()); }
function togglePlay() { if (!R.media) return; R.playing ? pause() : play(); }
function loop() {
  cancelAnimationFrame(R.raf);
  const tick = () => {
    if (!R || !R.playing) return;
    const t = curT();
    if (R.compare && R.medias[1] && Math.abs(R.medias[1].currentTime - t) > 0.06) R.medias[1].currentTime = t;
    if (R.loop) { const ch = chapterAt(t); if (ch && t >= ch.t1 - 0.02) { R.medias.forEach((m) => (m.currentTime = ch.t0)); } }
    syncClock();
    R.raf = requestAnimationFrame(tick);
  };
  R.raf = requestAnimationFrame(tick);
}
function syncClock() {
  if (!R || !$("#tcT")) return;
  const t = curT(); R.t = t;
  $("#tcT").textContent = fmtTC(t);
  $("#tcF").textContent = R.kind === "frames" && !R.compare ? `frame ${pad(R.fi + 1)} / ${pad(R.frames.length)}` : `f ${pad(frameOf(t), 3)}`;
  $("#tcB").textContent = `beat ${beatOf(t).toFixed(1)}`;
  const tw = $("#track"); if (tw) $("#head").style.left = `${(t / R.dur) * tw.clientWidth}px`;
  $$("#chap button").forEach((b) => b.classList.toggle("cur", t >= +b.dataset.t0 && t < +b.dataset.t1));
  renderComposerHead();
}
function paintPlay() {
  const b = $('[data-t="play"]'); if (b) { b.innerHTML = R.playing ? ICON.pause : ICON.play; b.setAttribute("aria-label", R.playing ? "Pause" : "Play"); }
  const bp = $("#bigplay"); if (bp) bp.hidden = R.playing || curT() > 0.05;
}
const chapterAt = (t) => (R.ver?.chapters || []).find((c) => t >= c.t0 && t < c.t1);

/* ---------- ink: normalized vector marks, drawn per frame ---------- */
function sizeInk() {
  const c = R?.canvas; if (!c) return;
  const r = c.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1);
  c.width = Math.round(r.width * d); c.height = Math.round(r.height * d);
  drawInk();
}
function paintShape(ctx, s, W, H, scale = 1) {
  ctx.save();
  ctx.strokeStyle = s.color; ctx.fillStyle = s.color; ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(2, H * 0.0068 * scale);
  ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = H * 0.006;
  const P_ = s.pts.map(([x, y]) => [x * W, y * H]);
  if (s.tool === "pen" && P_.length) {
    ctx.beginPath(); ctx.moveTo(P_[0][0], P_[0][1]);
    for (let i = 1; i < P_.length - 1; i++) { const mx = (P_[i][0] + P_[i + 1][0]) / 2, my = (P_[i][1] + P_[i + 1][1]) / 2; ctx.quadraticCurveTo(P_[i][0], P_[i][1], mx, my); }
    const l = P_[P_.length - 1]; ctx.lineTo(l[0], l[1]); ctx.stroke();
  } else if (s.tool === "rect" && P_.length > 1) {
    const [a, b] = P_, x = Math.min(a[0], b[0]), y = Math.min(a[1], b[1]), w = Math.abs(a[0] - b[0]), h = Math.abs(a[1] - b[1]);
    const rr = Math.min(w, h, H * 0.04) * 0.3;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, rr) : ctx.rect(x, y, w, h); ctx.stroke();
  } else if (s.tool === "arrow" && P_.length > 1) {
    const [a, b] = P_, ang = Math.atan2(b[1] - a[1], b[0] - a[0]), hl = Math.max(10, H * 0.035);
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0] - Math.cos(ang) * hl * 0.6, b[1] - Math.sin(ang) * hl * 0.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(b[0], b[1]);
    ctx.lineTo(b[0] - Math.cos(ang - 0.45) * hl, b[1] - Math.sin(ang - 0.45) * hl);
    ctx.lineTo(b[0] - Math.cos(ang + 0.45) * hl, b[1] - Math.sin(ang + 0.45) * hl); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
const sameFrame = (a, b) => a != null && b != null && Math.abs(a - b) < 0.6 / (R.fps || 30);
function drawInk() {
  if (!R?.ctx) return;
  const c = R.canvas, ctx = R.ctx, W = c.width, H = c.height, t = curT();
  ctx.clearRect(0, 0, W, H);
  const still = R.kind === "frames" || !R.playing;
  if (still) {
    commentsHere().filter((cm) => cm.shapes?.length && (sameFrame(cm.t, t) || (cm.id === R.sel && sameFrame(cm.t, t)))).forEach((cm) => {
      ctx.globalAlpha = cm.id === R.sel ? 1 : 0.8; cm.shapes.forEach((s) => paintShape(ctx, s, W, H));
    });
    ctx.globalAlpha = 1;
    if (R.draft.shapes.length && sameFrame(R.draft.t, t)) R.draft.shapes.forEach((s) => paintShape(ctx, s, W, H));
    if (R.drawing) paintShape(ctx, R.drawing, W, H);
  }
}
function paintTools() {
  const tl = $("#tools"); if (!tl) return;
  $$("[data-tool]", tl).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tool === R.tool)));
  $$("[data-color]", tl).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.color === R.color)));
  $('[data-act="undo"]', tl).disabled = !R.draft.shapes.length;
  $('[data-act="clear"]', tl).disabled = !R.draft.shapes.length;
  R.canvas?.classList.toggle("drawable", !!R.tool);
}
function setTool(k) { R.tool = R.tool === k ? null : k; if (R.tool) pause(); paintTools(); }

function bindStage() {
  const st = $("#stage");
  $$("[data-t]", st).forEach((b) => (b.onclick = () => {
    const k = b.dataset.t;
    if (k === "play") togglePlay();
    else if (k === "start") { pause(); seek(0); }
    else if (k === "fprev") step("frame", -1); else if (k === "fnext") step("frame", 1);
    else if (k === "bprev") step("beat", -1); else if (k === "bnext") step("beat", 1);
    else if (k === "speed") { R.speed = R.speed === 1 ? 0.5 : R.speed === 0.5 ? 0.25 : 1; R.medias.forEach((m) => (m.playbackRate = R.speed)); b.textContent = R.speed + "×"; }
    else if (k === "mute") { R.muted = !R.muted; R.medias.forEach((m) => (m.muted = R.muted)); b.innerHTML = R.muted ? ICON.mute : ICON.vol; b.setAttribute("aria-label", R.muted ? "Unmute" : "Mute"); }
    else if (k === "loop") { R.loop = !R.loop; b.setAttribute("aria-pressed", String(R.loop)); b.style.cssText = R.loop ? "color:#fff;background:rgba(255,255,255,.12)" : ""; toast(R.loop ? "Looping the current chapter" : "Loop off"); }
  }));
  $("#bigplay") && ($("#bigplay").onclick = play);
  $("#vid") && ($("#vid").onclick = () => { if (!R.tool) togglePlay(); });
  const tools = $("#tools");
  if (tools) {
    $$("[data-tool]", tools).forEach((b) => (b.onclick = () => setTool(b.dataset.tool)));
    $$("[data-color]", tools).forEach((b) => (b.onclick = () => { R.color = b.dataset.color; if (!R.tool) R.tool = "pen"; pause(); paintTools(); }));
    $('[data-act="undo"]', tools).onclick = undoMark;
    $('[data-act="clear"]', tools).onclick = () => { R.draft = { t: null, shapes: [] }; paintTools(); drawInk(); renderComposer(); };
  }
  // drawing
  const c = R.canvas;
  if (c) {
    const norm = (e) => { const r = c.getBoundingClientRect(); return [clamp((e.clientX - r.left) / r.width, 0, 1), clamp((e.clientY - r.top) / r.height, 0, 1)]; };
    c.addEventListener("pointerdown", (e) => {
      if (!R.tool) return;
      e.preventDefault(); pause();
      const t = curT();
      if (R.draft.shapes.length && !sameFrame(R.draft.t, t)) { toast(`New drawing at ${fmtTC(t)}: the marks at ${fmtTC(R.draft.t)} were cleared`); R.draft = { t: null, shapes: [] }; }
      R.draft.t = t;
      R.drawing = { tool: R.tool, color: R.color, pts: [norm(e)] };
      c.setPointerCapture(e.pointerId);
    });
    c.addEventListener("pointermove", (e) => {
      if (!R.drawing) return;
      const p = norm(e), pts = R.drawing.pts;
      if (R.drawing.tool === "pen") { const l = pts[pts.length - 1]; if (Math.hypot(p[0] - l[0], (p[1] - l[1]) * 1.78) > 0.004) pts.push(p); }
      else pts[1] = p;
      drawInk();
    });
    const end = () => {
      if (!R.drawing) return;
      const s = R.drawing; R.drawing = null;
      const ok = s.tool === "pen" ? s.pts.length > 1 : s.pts.length > 1 && Math.hypot(s.pts[1][0] - s.pts[0][0], s.pts[1][1] - s.pts[0][1]) > 0.012;
      if (ok) { s.pts = s.pts.map(([x, y]) => [+x.toFixed(4), +y.toFixed(4)]); R.draft.shapes.push(s); }
      paintTools(); drawInk(); renderComposer();
      if (ok && R.draft.shapes.length === 1) setTimeout(() => $("#cmText")?.focus(), 30);
    };
    c.addEventListener("pointerup", end); c.addEventListener("pointercancel", end);
  }
  // timeline scrubbing + hover preview
  const tw = $("#tw");
  const tAt = (e) => { const r = $("#track").getBoundingClientRect(); return clamp((e.clientX - r.left) / r.width, 0, 1) * R.dur; };
  let scrub = false;
  tw.addEventListener("pointerdown", (e) => { if (e.target.closest(".pin")) return; scrub = true; pause(); tw.setPointerCapture(e.pointerId); seek(tAt(e)); });
  tw.addEventListener("pointermove", (e) => { if (scrub) seek(tAt(e)); hover(e, tAt(e)); });
  tw.addEventListener("pointerup", () => (scrub = false));
  tw.addEventListener("pointerleave", () => { $("#hov").hidden = true; });
}
function undoMark() { R.draft.shapes.pop(); if (!R.draft.shapes.length) R.draft.t = null; paintTools(); drawInk(); renderComposer(); }
function hover(e, t) {
  const hv = $("#hov"); if (!hv || e.pointerType === "touch") return;
  const r = $("#track").getBoundingClientRect();
  hv.hidden = false; hv.style.left = `${clamp(e.clientX - r.left, 50, r.width - 50)}px`;
  hv.lastChild.textContent = fmtTC(t);
  const cv = hv.firstChild, ctx = cv.getContext("2d");
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, cv.width, cv.height);
  if (R.kind === "frames" && !R.compare) {
    let best = 0; R.frames.forEach((f, i) => { if (Math.abs(f.t - t) < Math.abs(R.frames[best].t - t)) best = i; });
    const im = R.thumbs?.[best]; if (im?.complete && im.naturalWidth) ctx.drawImage(im, 0, 0, cv.width, cv.height);
  } else if (R.sprite) {
    const i = clamp(Math.floor(t * R.spriteFps), 0, R.spriteN - 1), cw = R.sprite.width / R.spriteN;
    ctx.drawImage(R.sprite, i * cw, 0, cw, R.sprite.height, 0, 0, cv.width, cv.height);
  }
}

/* ---------- timeline drawing ---------- */
function renderChapters() {
  const el = $("#chap"); if (!el) return;
  const chs = R.ver?.chapters || [];
  el.innerHTML = chs.map((c, i) => `<button data-t0="${c.t0}" data-t1="${c.t1}" style="left:${(c.t0 / R.dur) * 100}%;width:calc(${((c.t1 - c.t0) / R.dur) * 100}% - 3px);--c:${c.color || CH_PAL[i % CH_PAL.length]}" title="${esc(c.name)} · ${fmtTC(c.t0)}">${esc(c.name)}</button>`).join("");
  $$("button", el).forEach((b) => (b.onclick = () => { pause(); seek(+b.dataset.t0 + 0.001); }));
}
function drawTimeline() {
  if (!R) return;
  const trk = $("#trk"), rul = $("#rul"); if (!trk || !rul) return;
  const d = Math.min(2, devicePixelRatio || 1);
  const W = trk.clientWidth * d, H = trk.clientHeight * d;
  trk.width = W; trk.height = H;
  const ctx = trk.getContext("2d");
  ctx.fillStyle = "#0B0C10"; ctx.fillRect(0, 0, W, H);
  const cell = (img, sx, sw, sh, x0, x1) => {               // cover-crop one source cell into [x0, x1]
    const w = x1 - x0; if (w <= 0) return;
    const ar = w / H, sar = sw / sh;
    let cw = sw, ch = sh, ox = 0, oy = 0;
    if (sar > ar) { cw = sh * ar; ox = (sw - cw) / 2; } else { ch = sw / ar; oy = (sh - ch) / 2; }
    ctx.drawImage(img, sx + ox, oy, cw, ch, x0, 0, w, H);
  };
  if (R.kind === "frames" && !R.compare) {
    R.frames.forEach((f, i) => {
      const im = R.thumbs?.[i]; if (!im?.complete || !im.naturalWidth) return;
      const x0 = (f.t / R.dur) * W, x1 = ((R.frames[i + 1]?.t ?? R.dur) / R.dur) * W;
      cell(im, 0, im.naturalWidth, im.naturalHeight, x0 + 1, x1 - 1);
    });
  } else if (R.sprite) {
    const n = R.spriteN, cw = R.sprite.width / n;
    for (let i = 0; i < n; i++) cell(R.sprite, i * cw, cw, R.sprite.height, (i / R.spriteFps / R.dur) * W, (((i + 1) / R.spriteFps) / R.dur) * W - d);
  }
  ctx.fillStyle = "rgba(0,0,0,.18)"; ctx.fillRect(0, 0, W, H);
  // ruler: a tick per beat, taller per bar, a time label per bar when there is room
  const RW = rul.clientWidth * d, RH = rul.clientHeight * d;
  rul.width = RW; rul.height = RH;
  const rc = rul.getContext("2d");
  rc.clearRect(0, 0, RW, RH);
  const spb = 60 / R.bpm, nb = Math.floor(R.dur / spb + 1e-6), pxPerBar = (4 * spb / R.dur) * RW;
  rc.font = `${10 * d}px "Geist Mono", ui-monospace, monospace`; rc.textBaseline = "top";
  for (let b = 0; b <= nb; b++) {
    const x = Math.round((b * spb / R.dur) * RW) + 0.5, bar = b % 4 === 0;
    rc.fillStyle = bar ? "rgba(255,255,255,.55)" : "rgba(255,255,255,.2)";
    rc.fillRect(x, 0, d, bar ? 7 * d : 4 * d);
    if (bar && pxPerBar > 34 * d && x < RW - 30 * d) { rc.fillStyle = "rgba(255,255,255,.5)"; rc.fillText(fmtShort(b * spb), x + 3 * d, 6 * d); }
  }
  syncClock();
}
function renderPins() {
  const el = $("#pins"); if (!el || !R) return;
  const cms = commentsHere();
  el.innerHTML = cms.map((c) => `<button class="pin ${statusOf(c)} ${c.id === R.sel ? "sel" : ""}" data-c="${esc(c.id)}" style="left:${(c.t / R.dur) * 100}%" aria-label="Comment at ${fmtTC(c.t)}: ${esc((c.text || "").slice(0, 60))}" title="${fmtTC(c.t)} · ${esc((c.text || "").slice(0, 80))}"></button>`).join("")
    + (R.draft.shapes.length && R.draft.t != null ? `<span class="pin draft" style="left:${(R.draft.t / R.dur) * 100}%" aria-hidden="true"></span>` : "");
  $$(".pin[data-c]", el).forEach((b) => (b.onclick = (e) => { e.stopPropagation(); selectComment(b.dataset.c); }));
}

/* ---------- comments ---------- */
function commentsHere() {
  if (!R?.vid) return [];
  return commentsOf(R.pid).filter((c) => c.versionId === R.vid || c.fixedIn === R.vid);
}
function selectComment(id) {
  const c = commentsOf(R.pid).find((x) => x.id === id); if (!c) return;
  R.sel = id; pause();
  if (R.compare) { R.compare = null; renderVbar(); mountStage(c.t); }
  seek(c.t + 0.001);
  renderPins(); renderList();
  $(`.cm[data-c="${CSS.escape(id)}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function renderRail() {
  if (!R || !$("#tabs")) return;
  const cms = commentsHere(), reqs = requestsOf(R.pid);
  const openN = cms.filter((c) => statusOf(c) === "open").length, liveReq = reqs.filter((r) => r.status !== "done").length;
  $("#tabs").innerHTML = [["comments", "Comments", openN], ["requests", "Requests", liveReq], ["notes", "Version", null]]
    .map(([k, l, n]) => `<button role="tab" aria-selected="${R.tab === k}" data-tab="${k}">${l}${n ? `<small class="num">${n}</small>` : ""}</button>`).join("");
  $$("#tabs [data-tab]").forEach((b) => (b.onclick = () => { R.tab = b.dataset.tab; renderRail(); }));
  renderComposer(); renderList(); renderSend();
}
function renderComposerHead() {
  const h = $("#cmAt"); if (!h || !R) return;
  const t = R.draft.shapes.length ? R.draft.t : curT();
  h.innerHTML = `Comment at <b>${fmtTC(t)}</b><span class="dot"></span>f ${pad(frameOf(t), 3)}<span class="dot"></span>beat ${beatOf(t).toFixed(1)}${chapterAt(t) ? `<span class="dot"></span>${esc(chapterAt(t).name)}` : ""}`;
}
function renderComposer() {
  const el = $("#composer"); if (!el) return;
  if (R.tab !== "comments" || !R.ver) { el.innerHTML = ""; return; }
  if (R.compare) { el.innerHTML = `<div class="composer locked"><div class="lock">${ICON.lock}<span>Comparing ${esc(versionsOf(R.pid).find((v) => v.id === R.compare.a)?.label)} and ${esc(versionsOf(R.pid).find((v) => v.id === R.compare.b)?.label)}. Leave compare to comment on one version.</span></div></div>`; return; }
  const prev = $("#cmText")?.value || "";
  const marks = R.draft.shapes.length;
  el.innerHTML = `<div class="composer">
    <div class="at" id="cmAt"></div>
    <label class="sr" for="cmText">Your comment</label>
    <textarea id="cmText" maxlength="1500" placeholder="${marks ? "What should change in the marked area?" : "Pause on the frame, draw if it helps, and describe the change…"}"></textarea>
    <div class="row"><small>${marks ? `${ICON.pen.replace("<svg", '<svg style="width:13px;height:13px;vertical-align:-2px"')} ${plural(marks, "mark")} · <button class="btn sm ghost" id="cmDiscard" style="height:24px;padding:0 8px">Discard</button>` : "Enter to add · Shift+Enter for a new line"}</small>
    <button class="btn sm primary" id="cmAdd">${ICON.plus}Add comment</button></div></div>`;
  const ta = $("#cmText"); ta.value = prev;
  renderComposerHead();
  ta.addEventListener("focus", () => pause());
  ta.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); addComment(); } e.stopPropagation(); });
  $("#cmAdd").onclick = addComment;
  $("#cmDiscard") && ($("#cmDiscard").onclick = () => { R.draft = { t: null, shapes: [] }; paintTools(); drawInk(); renderPins(); renderComposer(); });
  renderPins();
}
async function addComment() {
  const ta = $("#cmText"); let text = (ta?.value || "").trim();
  const shapes = R.draft.shapes.slice();
  if (!text && !shapes.length) { ta?.focus(); toast("Write what should change, or draw on the frame"); return; }
  if (!CAP.db) { toast("Open this page on claude.ai to save comments"); return; }
  if (!text) text = "(see drawing)";
  pause();
  const t = shapes.length ? R.draft.t : curT();
  const id = newId("c"), ch = chapterAt(t);
  const doc = { versionId: R.vid, versionLabel: R.ver.label || "v" + R.ver.n, t: +t.toFixed(3), frame: frameOf(t), beat: +beatOf(t).toFixed(2),
    chapter: ch?.name || null, text, shapes, status: "open", createdAt: now(), snapId: null, frameIndex: R.kind === "frames" ? R.fi : null };
  const snapPromise = makeSnapshot(shapes);
  try {
    await dbw.set(`projects/${R.pid}/comments/${id}`, doc);
  } catch (e) { toast(e?.code === "invalid_argument" ? "You can view this project but not comment on it" : "Could not save the comment. Try again."); return; }
  ta.value = ""; R.draft = { t: null, shapes: [] }; R.sel = id; R.filter = "open";
  paintTools(); renderComposer(); drawInk();
  toast(`Comment added at ${fmtTC(t)}`);
  touchProject(R.pid);
  const blob = await snapPromise;
  if (blob && CAP.assets) {
    try { const a = await CAP.assets.upload(blob); await dbw.update(`projects/${R.pid}/comments/${id}`, { snapId: a.id }); } catch (e) { console.warn("snapshot upload", e?.code); }
  }
}
/** A low-res JPEG of the exact frame with the drawing on top (270×480): enough for Claude to see what and where. */
async function makeSnapshot(shapes) {
  try {
    const src = R.kind === "frames" ? $("#still") : R.media; if (!src) return null;
    const W = 270, H = 480, cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d");
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
    ctx.drawImage(src, 0, 0, W, H);
    shapes.forEach((s) => paintShape(ctx, s, W, H, 1.3));
    return await new Promise((res) => cv.toBlob((b) => res(b), "image/jpeg", 0.62));
  } catch (e) { console.warn("snapshot", e?.message); return null; }
}

function renderList() {
  const el = $("#panel"); if (!el) return;
  if (R.tab === "requests") return renderRequests(el);
  if (R.tab === "notes") return renderNotes(el);
  el.className = "list";
  const cms = commentsHere();
  const counts = { open: 0, prog: 0, check: 0, done: 0 };
  cms.forEach((c) => counts[statusOf(c)]++);
  const F = [["open", "Open", counts.open], ["prog", "In correction", counts.prog + counts.check], ["done", "Resolved", counts.done], ["all", "All", cms.length]];
  const shown = cms.filter((c) => R.filter === "all" || statusOf(c) === R.filter || (R.filter === "prog" && statusOf(c) === "check"));
  el.innerHTML = `<div class="filters" role="group" aria-label="Filter comments">${F.map(([k, l, n]) => `<button data-f="${k}" aria-pressed="${R.filter === k}">${l} <span class="num">${n}</span></button>`).join("")}</div>
    ${shown.length ? shown.map(commentCard).join("") : `<div class="empty"><b>${R.filter === "open" ? "No open comments" : "Nothing here"}</b><span>${R.filter === "open" ? "Pause on a frame, draw on it and write what should change." : "Comments move here as Claude works on them."}</span></div>`}`;
  $$("[data-f]", el).forEach((b) => (b.onclick = () => { R.filter = b.dataset.f; renderList(); }));
  $$(".cm", el).forEach((card) => {
    card.addEventListener("click", (e) => { if (!e.target.closest("button[data-a]")) selectComment(card.dataset.c); });
    $$("button[data-a]", card).forEach((b) => (b.onclick = (e) => { e.stopPropagation(); commentAction(card.dataset.c, b.dataset.a, b); }));
  });
}
function commentCard(c) {
  const s = statusOf(c), carried = c.versionId !== R.vid;
  const fixedLbl = c.fixedIn ? versionsOf(R.pid).find((v) => v.id === c.fixedIn)?.label : null;
  const th = c.snapId ? `background-image:url('${blobUrl(c.snapId)}')` : (R.ver?.posterAssetId ? `background-image:url('${blobUrl(R.ver.posterAssetId)}');opacity:.55` : "");
  let acts = "";
  if (s === "open") acts = `<button data-a="resolve">Resolve</button><button class="del" data-a="del">${R.delArm === c.id ? "Confirm delete" : "Delete"}</button>`;
  if (s === "check") acts = `<button class="ok" data-a="confirm">${ICON.check.replace("<svg", '<svg style="width:14px;height:14px;vertical-align:-2px"')} Confirm fixed</button><button data-a="reopen">Reopen</button>${fixedLbl && fixedLbl !== (R.ver?.label) ? `<button data-a="open-fixed">Open ${esc(fixedLbl)}</button>` : ""}`;
  if (s === "done") acts = `<button data-a="reopen">Reopen</button>`;
  return `<article class="cm ${c.id === R.sel ? "sel" : ""}" data-c="${esc(c.id)}" tabindex="0" aria-label="Comment at ${fmtTC(c.t)}">
    <div class="th" style="${th}"><span>${esc(c.versionLabel || "")}</span></div>
    <div class="bd">
      <div class="top"><button class="tcode" data-a="seek">${fmtTC(c.t)} · f${pad(c.frame ?? 0, 3)}</button><span class="pill ${s}"><i></i>${s === "check" && fixedLbl ? `Check in ${esc(fixedLbl)}` : STATUS_TXT[s]}</span></div>
      <p class="txt">${esc(c.text)}</p>
      ${carried ? `<small style="color:var(--muted);font-size:12px">From ${esc(c.versionLabel)}${c.chapter ? ` · ${esc(c.chapter)}` : ""}</small>` : c.chapter ? `<small style="color:var(--muted);font-size:12px">${esc(c.chapter)}${c.shapes?.length ? ` · ${plural(c.shapes.length, "mark")}` : ""}</small>` : ""}
      ${c.claudeNote ? `<div class="note">${ICON.sparkle}<span><b>Claude:</b> ${esc(c.claudeNote)}</span></div>` : ""}
      ${acts ? `<div class="acts">${acts}</div>` : ""}
    </div></article>`;
}
async function commentAction(id, a, btn) {
  const path = `projects/${R.pid}/comments/${id}`;
  try {
    if (a === "seek") return selectComment(id);
    if (a === "del") {
      if (R.delArm !== id) { R.delArm = id; renderList(); setTimeout(() => { if (R?.delArm === id) { R.delArm = null; renderList(); } }, 3500); return; }
      R.delArm = null; await dbw.del(path); toast("Comment deleted"); return;
    }
    if (a === "resolve" || a === "confirm") { await dbw.update(path, { status: "resolved", resolvedAt: now() }); toast(a === "confirm" ? "Marked as fixed" : "Resolved"); }
    if (a === "reopen") { await dbw.update(path, { status: "open", fixedIn: null, requestId: null }); toast("Reopened"); }
    if (a === "open-fixed") { const c = commentsOf(R.pid).find((x) => x.id === id); setVersion(c.fixedIn); setTimeout(() => selectComment(id), 60); }
  } catch { toast("That change did not save. Try again."); }
}

/* ---------- send corrections ---------- */
function renderSend() {
  const el = $("#sendBox"); if (!el) return;
  if (R.tab !== "comments" || !R.ver || R.compare) { el.innerHTML = ""; return; }
  const open = commentsOf(R.pid).filter((c) => c.versionId === R.vid && c.status === "open");
  el.innerHTML = `<div class="send"><div class="row"><div><b>${open.length ? `${plural(open.length, "open comment")} on ${esc(R.ver.label)}` : "No open comments"}</b>
    <small>${open.length ? "Claude previews the touched frames before any render." : "Add comments, then send them as one correction pass."}</small></div>
    <button class="btn primary" id="sendBtn" ${open.length ? "" : "disabled"}>${ICON.send}Send corrections</button></div></div>`;
  $("#sendBtn").onclick = () => openSendSheet(open);
}
function correctionText(rid, ids, note) {
  const p = P(R.pid), cms = commentsOf(R.pid).filter((c) => ids.includes(c.id));
  const lines = cms.map((c, i) => `${i + 1}) ${fmtTC(c.t)} · f${c.frame} · beat ${c.beat}${c.chapter ? ` · ${c.chapter}` : ""}${c.shapes?.length ? ` · ${plural(c.shapes.length, "mark")}` : ""}\n   “${c.text}”`);
  return `Motion Studio · correction request ${rid}\nProject: ${p.name} · ${R.ver.label} (${R.ver.kind === "frames" ? "key frames" : "video"})\n${plural(cms.length, "comment")}:\n${lines.join("\n")}${note ? `\nNote: ${note}` : ""}\n\nShow preview frames of the touched moments first; render only after approval.\nData: projects/${R.pid}/requests/${rid}`;
}
function openSendSheet(open) {
  sheet({
    title: "Send corrections to Claude",
    sub: `One pass for ${esc(P(R.pid).name)} · ${esc(R.ver.label)}. Claude answers with preview frames of the moments you touched; nothing is rendered until you approve.`,
    body: `${open.map((c) => `<label class="chk"><input type="checkbox" checked value="${esc(c.id)}"><span class="th" style="${c.snapId ? `background-image:url('${blobUrl(c.snapId)}')` : ""}"></span><span><b>${fmtTC(c.t)}</b><p>${esc(c.text)}</p></span></label>`).join("")}
      <div class="field"><label for="sendNote">Note for the whole pass (optional)</label><textarea id="sendNote" maxlength="800" placeholder="e.g. Keep the timing, only fix the visuals."></textarea></div>`,
    foot: `<button class="btn" data-close>Cancel</button><button class="btn primary" id="doSend">${ICON.send}Send to Claude</button>`,
    onMount: (s) => {
      $("#doSend", s).onclick = async (e) => {
        const ids = $$("input[type=checkbox]:checked", s).map((i) => i.value);
        if (!ids.length) { toast("Pick at least one comment"); return; }
        const note = $("#sendNote", s).value.trim();
        e.currentTarget.disabled = true;
        const rid = newId("r"), text = correctionText(rid, ids, note);
        const anchor = $("#sendBox") || $("#stage");
        const thread = await notifyClaude(text, anchor);                 // first, while the click is still fresh
        try {
          await dbw.set(`projects/${R.pid}/requests/${rid}`, { type: "corrections", versionId: R.vid, versionLabel: R.ver.label, commentIds: ids, note,
            status: "sent", createdAt: now(), threadId: thread && thread !== "sent" ? thread : null, notified: !!thread, text });
          for (const id of ids) await dbw.update(`projects/${R.pid}/comments/${id}`, { status: "in_progress", requestId: rid });
          touchProject(R.pid);
        } catch { toast("Saving the request failed. Try again."); e.currentTarget.disabled = false; return; }
        closeSheet();
        R.tab = "requests"; renderRail();
        if (thread) toast("Sent to Claude"); else fallbackSheet(text, "Correction request");
      };
    },
  });
}

/* ---------- requests ---------- */
function renderRequests(el) {
  el.className = "list";
  const reqs = requestsOf(R.pid);
  el.innerHTML = `<div id="reqAnchor"></div>` + (reqs.length ? reqs.map(requestCard).join("") : `<div class="empty"><b>No requests yet</b><span>Send corrections from the Comments tab. Each pass shows up here with its preview frames.</span></div>`);
  $$("[data-rq]", el).forEach((b) => (b.onclick = () => requestAction(b.dataset.rq, b.dataset.a, b)));
  $$(".pv button", el).forEach((b) => (b.onclick = () => openPreview(b.dataset.rq, +b.dataset.i)));
}
function requestCard(r) {
  const k = reqStep(r.status), n = r.commentIds?.length || 0;
  const rv = r.resultVersion && versionsOf(R.pid).find((v) => v.id === r.resultVersion);
  return `<article class="req">
    <div class="top"><div><h4>${esc(REQ_LABEL[r.type] || "Request")}${r.versionLabel ? ` · ${esc(r.versionLabel)}` : ""}${rv ? ` → ${esc(rv.label)}` : ""}</h4><small>${ago(r.createdAt)}${n ? ` · ${plural(n, "comment")}` : ""}${r.notified === false ? " · waiting for Claude" : ""}</small></div>${reqStatusPill(r.status)}</div>
    <div class="steps" aria-label="Progress">${REQ_STEPS.map((s, i) => `<div class="${i < k || (i === k && r.status === "done") ? "on" : i === k ? "on now" : ""}"><i></i><span>${s}</span></div>`).join("")}</div>
    ${r.claudeNote ? `<div class="claude-note">${ICON.sparkle}<span>${esc(r.claudeNote)}</span></div>` : ""}
    ${r.previewFrames?.length ? `<div class="pv">${r.previewFrames.map((f, i) => `<button data-rq="${esc(r.id)}" data-i="${i}" style="background-image:url('${blobUrl(f.assetId)}')" aria-label="Preview frame at ${fmtTC(f.t)}"><span>${fmtTC(f.t)}</span></button>`).join("")}</div>` : ""}
    ${r.status === "preview_ready" ? `<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary sm" data-rq="${esc(r.id)}" data-a="approve">${ICON.check}Approve &amp; render</button><button class="btn sm" data-rq="${esc(r.id)}" data-a="changes">Ask for changes</button></div>` : ""}
    ${rv ? `<button class="btn sm" data-rq="${esc(r.id)}" data-a="open">${ICON.film}Open ${esc(rv.label)}</button>` : ""}
    ${r.notified === false && r.status === "sent" ? `<button class="btn sm ghost" data-rq="${esc(r.id)}" data-a="resend">${ICON.send}Send to Claude again</button>` : ""}
  </article>`;
}
async function requestAction(rid, a, btn) {
  const r = requestsOf(R.pid).find((x) => x.id === rid); if (!r) return;
  const path = `projects/${R.pid}/requests/${rid}`, p = P(R.pid);
  if (a === "open") return setVersion(r.resultVersion);
  if (a === "approve") {
    btn.disabled = true;
    const text = `Motion Studio · APPROVED ${rid}\nProject: ${p.name} · ${r.versionLabel || ""}\nThe preview frames look right: go ahead with the final render.\nData: ${path}`;
    const thread = await notifyClaude(text, btn);
    try { await dbw.update(path, { status: "approved", approvedAt: now() }); } catch { toast("Could not save the approval"); btn.disabled = false; return; }
    if (thread) toast("Approved: Claude is rendering"); else fallbackSheet(text, "Approval");
  }
  if (a === "resend") {
    const thread = await notifyClaude(r.text || `Motion Studio · request ${rid}\nData: ${path}`, btn);
    if (thread) { await dbw.update(path, { notified: true }); toast("Sent to Claude"); } else fallbackSheet(r.text || path, "Request");
  }
  if (a === "changes") {
    sheet({
      title: "Ask for changes", sub: "Describe what is still off in the preview frames. Claude sends a new preview before rendering.",
      body: `<div class="field"><label for="chg">What should change</label><textarea id="chg" maxlength="1500" placeholder="e.g. Frame 2: the circle still overlaps the multiplier."></textarea></div>`,
      foot: `<button class="btn" data-close>Cancel</button><button class="btn primary" id="chgGo">${ICON.send}Send</button>`,
      onMount: (s) => ($("#chgGo", s).onclick = async (e) => {
        const txt = $("#chg", s).value.trim(); if (!txt) return $("#chg", s).focus();
        e.currentTarget.disabled = true;
        const text = `Motion Studio · CHANGES on preview ${rid}\nProject: ${p.name} · ${r.versionLabel || ""}\n“${txt}”\nSend a new preview before rendering.\nData: ${path}`;
        const thread = await notifyClaude(text, $("#panel"));
        try { await dbw.update(path, { status: "sent", changes: [...(r.changes || []), { text: txt, at: now() }] }); } catch {}
        closeSheet(); if (thread) toast("Sent to Claude"); else fallbackSheet(text, "Change request");
      }),
    });
  }
}
function openPreview(rid, i) {
  const r = requestsOf(R.pid).find((x) => x.id === rid); if (!r) return;
  const f = r.previewFrames[i], before = f.commentId && commentsOf(R.pid).find((c) => c.id === f.commentId);
  sheet({
    wide: true, title: `Preview · ${fmtTC(f.t)}`, sub: esc(f.label || (before ? `“${before.text}”` : "")),
    body: `<div style="display:grid;grid-template-columns:repeat(${before?.snapId ? 2 : 1},minmax(0,1fr));gap:14px;justify-items:center">
      ${before?.snapId ? `<figure style="margin:0;display:grid;gap:8px;justify-items:center"><img src="${blobUrl(before.snapId)}" alt="Before, with your drawing" style="height:min(58vh,560px);aspect-ratio:9/16;object-fit:cover;border-radius:14px;max-width:100%"><figcaption class="eyebrow">Before · your note</figcaption></figure>` : ""}
      <figure style="margin:0;display:grid;gap:8px;justify-items:center"><img src="${blobUrl(f.assetId)}" alt="After" style="height:min(58vh,560px);aspect-ratio:9/16;object-fit:cover;border-radius:14px;max-width:100%"><figcaption class="eyebrow">After · preview</figcaption></figure></div>`,
    foot: `${i > 0 ? `<button class="btn" id="pvPrev">${ICON.fprev}Previous</button>` : ""}${i < r.previewFrames.length - 1 ? `<button class="btn" id="pvNext">Next${ICON.fnext}</button>` : ""}<button class="btn dark" data-close>Done</button>`,
    onMount: (s) => { $("#pvPrev", s) && ($("#pvPrev", s).onclick = () => openPreview(rid, i - 1)); $("#pvNext", s) && ($("#pvNext", s).onclick = () => openPreview(rid, i + 1)); },
  });
}

/* ---------- version notes ---------- */
function renderNotes(el) {
  el.className = "notes";
  const v = R.ver;
  if (!v) { el.innerHTML = `<div class="empty"><b>No version yet</b></div>`; return; }
  const spec = [[v.kind === "frames" ? `${R.frames.length}` : `${v.width || 1080}×${v.height || 1920}`, v.kind === "frames" ? "Key frames" : "Master"], [fmtTC(R.dur), "Duration"],
    [`${R.fps} fps`, "Frame rate"], [`${R.bpm} BPM`, "Tempo"], [v.lufs != null ? `${v.lufs} LUFS` : "—", "Loudness"], [v.sizeMB ? `${v.sizeMB} MB` : "—", "Review copy"]];
  el.innerHTML = `<div class="blk"><div class="eyebrow">${esc(v.label)} · ${v.createdAt ? new Date(v.createdAt).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" }) : ""}</div>
      <h3 style="font:700 18px/1.25 var(--f-display);letter-spacing:-.02em">${esc(v.title || "")}</h3>
      ${v.notes?.length ? `<ul>${v.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>` : ""}</div>
    <div class="blk"><div class="eyebrow">Specs</div><div class="specs">${spec.map(([b, s]) => `<div><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join("")}</div>
      ${v.master ? `<small style="color:var(--muted);font-size:12.5px">Master file: <span class="mono">${esc(v.master)}</span></small>` : ""}</div>
    ${(v.chapters || []).length ? `<div class="blk"><div class="eyebrow">Chapters</div><div class="chlist">${v.chapters.map((c, i) => `<button data-t0="${c.t0}"><i style="--c:${c.color || CH_PAL[i % CH_PAL.length]}"></i><span>${esc(c.name)}</span><small>${fmtTC(c.t0)}</small></button>`).join("")}</div></div>` : ""}`;
  $$(".chlist button", el).forEach((b) => (b.onclick = () => { pause(); seek(+b.dataset.t0 + 0.001); }));
}

/* ---------- compare, rules, download ---------- */
function toggleCompare() {
  const vs = versionsOf(R.pid).filter((v) => v.kind !== "frames");
  if (R.compare) { R.compare = null; }
  else {
    const i = vs.findIndex((v) => v.id === R.vid);
    const b = vs[i >= 0 ? i : vs.length - 1], a = vs[Math.max(0, (i >= 0 ? i : vs.length - 1) - 1)];
    R.compare = { a: a.id, b: b.id }; R.tool = null;
  }
  renderVbar(); mountStage(curT()); renderRail();
}
function openRules() {
  const p = P(R.pid);
  sheet({
    title: "Brief & rules", sub: "Claude rereads this before every correction pass and every render.",
    body: `<div class="field"><label for="rulesTa">Rules for this project</label><textarea id="rulesTa" style="min-height:220px" maxlength="6000">${esc(p.rules || "")}</textarea></div>
      ${p.pipeline?.length ? `<div class="field"><label>Pipeline (fixed for every regeneration)</label><ul style="margin:0;padding-left:18px;display:grid;gap:6px;color:var(--ink-2);font-size:14px">${p.pipeline.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
      ${p.brief?.summary ? `<div class="field"><label>Original brief</label><div class="copybox">${esc(p.brief.summary)}</div></div>` : ""}`,
    foot: `<button class="btn" data-close>Cancel</button><button class="btn primary" id="rulesSave">Save rules</button>`,
    onMount: (s) => ($("#rulesSave", s).onclick = async () => {
      if (!CAP.db) return toast("Open this page on claude.ai to save");
      try { await dbw.update(`projects/${R.pid}`, { rules: $("#rulesTa", s).value, updatedAt: now() }); closeSheet(); toast("Rules saved"); } catch { toast("Could not save the rules"); }
    }),
  });
}
async function download() {
  const v = R.ver; if (!v?.assetId) return;
  if (!CAP.downloads) return toast("Downloads work when this page is open on claude.ai");
  const b = $("#dlBtn"); b.disabled = true; const old = b.innerHTML; b.innerHTML = `${ICON.download}Preparing…`;
  try {
    const res = await fetch(blobUrl(v.assetId)); const blob = await res.blob();
    await CAP.downloads.save({ filename: v.downloadName || `${(P(R.pid).name || "video").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${v.label}.mp4`, data: blob });
  } catch (e) { if (e?.code !== "declined" && e?.code !== "cancelled") toast("The download did not start. Try again."); }
  b.disabled = false; b.innerHTML = old;
}

/* ---------- keyboard ---------- */
function onKey(e) {
  if (!R || $("#scrim")) return;
  const tag = (e.target.tagName || "").toLowerCase();
  if (tag === "textarea" || tag === "input" || tag === "select") return;
  const k = e.key;
  if (k === " " || k === "k") { e.preventDefault(); togglePlay(); }
  else if (k === "ArrowLeft") { e.preventDefault(); step(e.shiftKey ? "beat" : "frame", -1); }
  else if (k === "ArrowRight") { e.preventDefault(); step(e.shiftKey ? "beat" : "frame", 1); }
  else if (k === "Home") { e.preventDefault(); pause(); seek(0); }
  else if ((k === "z" || k === "Z") && (e.metaKey || e.ctrlKey)) { e.preventDefault(); undoMark(); }
  else if (!R.compare && (k === "p" || k === "a" || k === "r")) setTool({ p: "pen", a: "arrow", r: "rect" }[k]);
  else if (k === "c") { e.preventDefault(); R.tab = "comments"; renderRail(); pause(); $("#cmText")?.focus(); }
  else if (k === "Escape") { if (R.tool) { R.tool = null; paintTools(); } }
}
