/* ===================== Create: the Brief Builder ===================== */
const STYLES = [
  { id: "kinetic", name: "Kinetic type", d: "Words slam on the beat and fill the frame", html: `<div class="sp sp-kinetic"><span>VOTRE</span><span>BUSINESS</span><span>MÉRITE</span><span>D'EXPLOSER</span></div>` },
  { id: "apple", name: "Apple minimal", d: "Soft depth, slow confident easing, lots of air", html: `<div class="sp sp-apple"><i class="a1"></i><span class="a2">Simply better.</span></div>` },
  { id: "glass", name: "Glassmorphism", d: "Frosted panels floating over colour fields", html: `<div class="sp sp-glass"><i class="g4"></i><i class="g1"></i><i class="g2"></i><i class="g3"></i></div>` },
  { id: "brutal", name: "Neo-brutalism", d: "Hard shadows, flat colour, snappy steps", html: `<div class="sp sp-brutal"><i class="b1"></i><i class="b2"></i><span class="b3">Bold.</span></div>` },
  { id: "swiss", name: "Swiss grid", d: "Blocks slide along a strict grid", html: `<div class="sp sp-swiss"><i class="s1"></i><i class="s2"></i><span class="s3">Grid</span></div>` },
  { id: "iso", name: "3D isometric", d: "Objects rotate in clean 3D space", html: `<div class="sp sp-iso"><div class="cube"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>` },
  { id: "glitch", name: "Glitch / Y2K", d: "RGB splits, scanlines, internet attitude", html: `<div class="sp sp-glitch"><span>VIRAL</span><span>VIRAL</span><span>VIRAL</span><i></i></div>` },
  { id: "editorial", name: "Editorial", d: "Serif headlines, rules, magazine pacing", html: `<div class="sp sp-editorial"><div class="e1"><span>The Story.</span></div><i class="e2"></i><span class="e3">VOL. 03 — QUÉBEC</span></div>` },
  { id: "saas", name: "SaaS product UI", d: "Coded interface, cursor, pop-in cards", html: `<div class="sp sp-saas"><i class="w"></i><i class="l1"></i><i class="l2"></i><i class="btn2"></i><i class="card2"></i><i class="cur"></i></div>` },
];
const ENERGY = [
  { id: "calm", name: "Calm", d: "90–100 BPM · a cut every 2 beats", bars: [0.9, 1.4, 1.1, 1.6, 1.2] },
  { id: "balanced", name: "Balanced", d: "110–120 BPM · a cut per beat", bars: [0.55, 0.7, 0.6, 0.8, 0.65, 0.75] },
  { id: "hype", name: "Hype", d: "124–128 BPM · cuts on 8th notes", bars: [0.28, 0.34, 0.3, 0.36, 0.26, 0.32, 0.3, 0.35] },
];
const MUSIC = [
  { id: "electrofunk", name: "Electro-funk", d: "French touch · 120 BPM · slap bass" },
  { id: "techno", name: "Techno", d: "Driving 4/4 · 128 BPM · dark stabs" },
  { id: "lofi", name: "Lo-fi beat", d: "Dusty swing · 84 BPM · warm keys" },
  { id: "cinematic", name: "Cinematic", d: "Booms and strings · 90 BPM" },
  { id: "corporate", name: "Corporate pop", d: "Bright plucks · 112 BPM · claps" },
  { id: "ambient", name: "Ambient", d: "Pads and bells · 70 BPM" },
];
const SOUND = [
  { id: "glassy", name: "Apple glassy", d: "Soft taps, glints, blooms" },
  { id: "punchy", name: "Punchy hype", d: "Slams, zips, sub drops" },
  { id: "robotic", name: "Robotic / tech", d: "Square blips, data chirps" },
  { id: "organic", name: "Organic", d: "Wood knocks, plucks, breath" },
  { id: "minimal", name: "Minimal", d: "Almost silent UI ticks" },
];
const FORMATS = [{ id: "9:16", w: 9, h: 16, d: "Reels · TikTok" }, { id: "4:5", w: 4, h: 5, d: "Feed portrait" }, { id: "1:1", w: 1, h: 1, d: "Feed" }, { id: "16:9", w: 16, h: 9, d: "YouTube · web" }];
const STORY = {
  "Showreel": ["Hook: the promise in four words", "How we work", "Proof: real client results", "Call to action"],
  "SaaS launch": ["Hook: the pain in one line", "Meet the product", "Three features, shown in the UI", "Social proof", "Call to action: free trial"],
  "Product promo": ["Hook", "Product reveal", "Three benefits", "The offer", "Call to action"],
  "Brand story": ["Hook", "Where it started", "What we believe", "Proof", "Logo sting"],
};
const FONTS = ["Geist", "Archivo", "Syne", "Manrope", "DM Serif Display", "From the website"];
const CV_BRAND = { colors: ["#2C5BFF", "#0B0C10", "#FFFFFF"], font: "Geist", rules: "Brand blue #2C5BFF covers more than half of the colour.\nGeist 800 for display, Geist Mono for labels.\nTone: confident, Québec French, short lines.\nEnd on the logo, no URL." };
const PIPELINE = [
  "Claude Code cloud session on alessandrosabb01/mixim-website-5 (branch claude/loving-maxwell-89ibjo)",
  "motion-studio/render.mjs: a pure-function HTML film rendered by Playwright Chromium, 4 sub-frames of motion blur, H.264 CRF 16",
  "Score and SFX synthesized in Python (numpy/scipy) on a measured beat grid, mastered to −14 LUFS",
  "Key-frame preview first; the full render only after approval in Motion Studio",
];
const freshBrief = () => ({ name: "", client: "", url: "", images: [], library: false, format: "9:16", duration: 30, styles: ["kinetic"], energy: "hype",
  music: "electrofunk", sfx: "glassy", story: "Showreel", beats: STORY.Showreel.slice(), brand: { colors: ["#2C5BFF", "#0B0C10", "#FFFFFF"], font: "Geist", rules: "" }, notes: "" });
let CB = null;
const saveDraft = () => { try { localStorage.setItem("cv-brief", JSON.stringify(CB)); } catch {} };
const loadDraft = () => { try { const j = JSON.parse(localStorage.getItem("cv-brief") || "null"); if (j && j.beats) return { ...freshBrief(), ...j }; } catch {} return freshBrief(); };

const waveBars = (seed) => { let s = seed * 9301 + 49297; return Array.from({ length: 28 }, (_, i) => { s = (s * 9301 + 49297) % 233280; return 0.25 + (s / 233280) * 0.75 * (0.6 + 0.4 * Math.sin(i * 0.6 + seed)); }); };

VIEWS.create = {
  enter() { CB = loadDraft(); this.render(); },
  leave() { SYNTH.stop(); },
  update() {},
  render() {
    const root = $("#view");
    const tileSel = (arr, id) => arr.includes(id);
    root.innerHTML = `<main class="wrap create">
      <div class="builder">
        <header class="create-h"><span class="eyebrow">New video · brief builder</span><h1 style="margin-top:14px">Build the brief.<br><em>Claude builds the film.</em></h1>
          <p>Pick the ingredients below. Claude turns them into a coded motion film and sends you 30 key frames to mark up. Nothing is rendered until you approve.</p></header>

        <section class="bsec"><header><h2><span class="n">01</span>Project</h2><small>Who is it for</small></header>
          <div class="two"><div class="field"><label for="bName">Video name</label><input id="bName" maxlength="80" placeholder="e.g. Spring launch reel" value="${esc(CB.name)}"></div>
          <div class="field"><label for="bClient">Client or brand</label><input id="bClient" maxlength="80" placeholder="e.g. Sushi X" value="${esc(CB.client)}"></div></div></section>

        <section class="bsec"><header><h2><span class="n">02</span>Source material</h2><small>A website, your images, or both</small></header>
          <div class="field"><label for="bUrl">Website to build from</label><input id="bUrl" inputmode="url" maxlength="300" placeholder="https://" value="${esc(CB.url)}"></div>
          <div class="field"><label>Images and clips</label><div class="uploads" id="ups">${CB.images.map((im, i) => `<div class="up" style="background-image:url('${blobUrl(im.id)}')" title="${esc(im.name)}"><button data-rm="${i}" aria-label="Remove ${esc(im.name)}">×</button></div>`).join("")}
            <label class="drop" for="bFiles" title="Add images or clips">${ICON.upload}<input id="bFiles" type="file" accept="image/*,video/mp4,video/quicktime" multiple class="sr"></label></div></div>
          <label style="display:flex;gap:10px;align-items:center;font-size:14px"><input type="checkbox" id="bLib" ${CB.library ? "checked" : ""} style="width:18px;height:18px;accent-color:var(--accent)"> Use the Création Virale client footage library (24 cleared clips)</label></section>

        <section class="bsec"><header><h2><span class="n">03</span>Format &amp; length</h2><small>${CB.duration} s = ${CB.duration * 2} beats at 120 BPM</small></header>
          <div class="fmt" role="group" aria-label="Aspect ratio">${FORMATS.map((f) => `<button data-fmt="${f.id}" aria-pressed="${CB.format === f.id}"><i style="aspect-ratio:${f.w}/${f.h};${f.w > f.h ? "width:72px;height:auto" : ""}"></i><b>${f.id}</b><small>${f.d}</small></button>`).join("")}</div>
          <div class="seg" role="group" aria-label="Duration">${[15, 30, 45, 60].map((d) => `<button data-dur="${d}" aria-pressed="${CB.duration === d}">${d} s</button>`).join("")}</div></section>

        <section class="bsec"><header><h2><span class="n">04</span>Visual style</h2><small>Pick one, or two to blend (the first leads)</small></header>
          <div class="tiles">${STYLES.map((s) => `<button class="tile" data-style="${s.id}" aria-pressed="${tileSel(CB.styles, s.id)}">${s.html}<span class="tag">${CB.styles.indexOf(s.id) + 1 || ""}</span><span class="lab"><b>${s.name}</b><span>${s.d}</span></span></button>`).join("")}</div></section>

        <section class="bsec"><header><h2><span class="n">05</span>Energy</h2><small>Sets tempo, cut rate and easing</small></header>
          <div class="energy" role="group" aria-label="Energy">${ENERGY.map((e) => `<button data-energy="${e.id}" aria-pressed="${CB.energy === e.id}"><div class="bars">${e.bars.map((d, i) => `<i style="--d:${d}s;animation-delay:${-i * 0.13}s"></i>`).join("")}</div><b>${e.name}</b><small>${e.d}</small></button>`).join("")}</div></section>

        <section class="bsec"><header><h2><span class="n">06</span>Music</h2><small>Press play to hear a two-bar sketch</small></header>
          <div class="tiles">${MUSIC.map((m, k) => `<div class="tile" role="button" tabindex="0" data-music="${m.id}" aria-pressed="${CB.music === m.id}"><div class="wave">${waveBars(k + 1).map((h, i) => `<i style="height:${Math.round(h * 100)}%;animation-delay:${-i * 0.05}s"></i>`).join("")}</div><span class="tag">✓</span><span class="lab"><b>${m.name}</b><span>${m.d}</span></span><button class="ply" data-play-m="${m.id}" aria-label="Play ${m.name} sketch">${ICON.play}</button></div>`).join("")}</div></section>

        <section class="bsec"><header><h2><span class="n">07</span>Sound design</h2><small>The UI sounds that back every move</small></header>
          <div class="tiles">${SOUND.map((m, k) => `<div class="tile" role="button" tabindex="0" data-sfx="${m.id}" aria-pressed="${CB.sfx === m.id}"><div class="wave sfx">${waveBars(k + 11).map((h, i) => `<i style="height:${Math.round(h * (i % 7 === 0 ? 100 : 40))}%;animation-delay:${-i * 0.05}s"></i>`).join("")}</div><span class="tag">✓</span><span class="lab"><b>${m.name}</b><span>${m.d}</span></span><button class="ply" data-play-s="${m.id}" aria-label="Play ${m.name} palette">${ICON.play}</button></div>`).join("")}</div></section>

        <section class="bsec"><header><h2><span class="n">08</span>Story beats</h2><small>The order the film tells it</small></header>
          <div class="presets">${Object.keys(STORY).map((k) => `<button class="btn sm ${CB.story === k ? "dark" : ""}" data-story="${esc(k)}">${esc(k)}</button>`).join("")}</div>
          <div class="beats-list" id="beats">${CB.beats.map((b, i) => `<div class="beat-row"><span class="ix">${pad(i + 1)}</span><label class="sr" for="beat${i}">Beat ${i + 1}</label><input id="beat${i}" data-beat="${i}" maxlength="120" value="${esc(b)}"><span class="mv"><button data-mv="${i}:-1" aria-label="Move up" ${i ? "" : "disabled"}>${ICON.up}</button><button data-mv="${i}:1" aria-label="Move down" ${i < CB.beats.length - 1 ? "" : "disabled"}>${ICON.down}</button><button data-rmb="${i}" aria-label="Remove beat">${ICON.x}</button></span></div>`).join("")}</div>
          <button class="btn sm" id="addBeat" style="justify-self:start" ${CB.beats.length >= 8 ? "disabled" : ""}>${ICON.plus}Add a beat</button></section>

        <section class="bsec"><header><h2><span class="n">09</span>Brand</h2><button class="btn sm ghost" id="cvBrand">Use Création Virale brand</button></header>
          <div class="field"><label>Colours (the first one leads)</label><div class="colors" id="cols">${CB.brand.colors.map((c, i) => `<div class="c" style="background:${esc(c)}"><input type="color" value="${esc(c)}" data-col="${i}" aria-label="Brand colour ${i + 1}"><button data-rmc="${i}" aria-label="Remove colour">×</button></div>`).join("")}${CB.brand.colors.length < 6 ? `<button class="add" id="addCol" aria-label="Add a colour">+</button>` : ""}</div></div>
          <div class="two"><div class="field"><label for="bFont">Display typeface</label><select id="bFont">${FONTS.map((f) => `<option ${CB.brand.font === f ? "selected" : ""}>${f}</option>`).join("")}</select></div>
          <div class="field"><label for="bNotes">Must include (optional)</label><input id="bNotes" maxlength="200" placeholder="e.g. the 59× Sushi X result" value="${esc(CB.notes)}"></div></div>
          <div class="field"><label for="bRules">Brand rules</label><textarea id="bRules" maxlength="2000" placeholder="Tone, words to avoid, logo use, colour ratios…">${esc(CB.brand.rules)}</textarea></div></section>
      </div>
      <aside class="summary"><div class="card">
        <div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px"><h3>The brief</h3><span class="eyebrow">Live</span></div>
        <div class="meter" id="meter"></div>
        <div class="brief-out" id="briefOut"></div>
        <button class="btn primary" id="genBtn" style="height:48px">${ICON.wand}Generate 30 key frames</button>
        <small style="color:var(--muted);font-size:12.5px;line-height:1.45">Claude reads this brief, builds the film in code and posts 30 key frames here as version “preview”. You comment on them like any video, then approve the final render.</small>
        <button class="btn sm ghost" id="resetBrief" style="justify-self:start">Start over</button>
      </div></aside></main>`;
    this.bind();
    this.paint();
  },
  bind() {
    const root = $("#view");
    const on = (sel, ev, fn) => $$(sel, root).forEach((el) => el.addEventListener(ev, fn));
    const txt = (id, fn) => $(id).addEventListener("input", (e) => { fn(e.target.value); saveDraft(); this.paint(); });
    txt("#bName", (v) => (CB.name = v)); txt("#bClient", (v) => (CB.client = v)); txt("#bUrl", (v) => (CB.url = v.trim()));
    txt("#bNotes", (v) => (CB.notes = v)); txt("#bRules", (v) => (CB.brand.rules = v));
    $("#bFont").onchange = (e) => { CB.brand.font = e.target.value; saveDraft(); this.paint(); };
    $("#bLib").onchange = (e) => { CB.library = e.target.checked; saveDraft(); this.paint(); };
    on("[data-fmt]", "click", (e) => { CB.format = e.currentTarget.dataset.fmt; this.reRender(); });
    on("[data-dur]", "click", (e) => { CB.duration = +e.currentTarget.dataset.dur; this.reRender(); });
    on("[data-style]", "click", (e) => {
      const id = e.currentTarget.dataset.style, i = CB.styles.indexOf(id);
      if (i >= 0) CB.styles.splice(i, 1); else { CB.styles.push(id); if (CB.styles.length > 2) CB.styles.shift(); }
      this.reRender();
    });
    on("[data-energy]", "click", (e) => { CB.energy = e.currentTarget.dataset.energy; this.reRender(); });
    const pick = (attr, key) => on(`[data-${attr}]`, "click", (e) => { if (e.target.closest(".ply")) return; CB[key] = e.currentTarget.dataset[attr]; this.reRender(); });
    pick("music", "music"); pick("sfx", "sfx");
    on("[data-music],[data-sfx]", "keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.currentTarget.click(); } });
    const player = (attr, kind) => on(`[data-${attr}]`, "click", (e) => {
      e.stopPropagation();
      const b = e.currentTarget, id = b.dataset[attr === "play-m" ? "playM" : "playS"], tile = b.closest(".tile");
      if (b.classList.contains("on")) { SYNTH.stop(); return; }
      $$(".ply.on").forEach((x) => { x.classList.remove("on"); x.innerHTML = ICON.play; x.closest(".tile")?.classList.remove("playing"); });
      try {
        SYNTH[kind](id, () => { b.classList.remove("on"); b.innerHTML = ICON.play; tile.classList.remove("playing"); });
        b.classList.add("on"); b.innerHTML = ICON.pause; tile.classList.add("playing");
      } catch { toast("Audio is not available in this view"); }
    });
    player("play-m", "music"); player("play-s", "sfx");
    on("[data-story]", "click", (e) => { CB.story = e.currentTarget.dataset.story; CB.beats = STORY[CB.story].slice(); this.reRender(); });
    on("[data-beat]", "input", (e) => { CB.beats[+e.target.dataset.beat] = e.target.value; CB.story = "Custom"; saveDraft(); this.paint(); });
    on("[data-mv]", "click", (e) => { const [i, d] = e.currentTarget.dataset.mv.split(":").map(Number); const b = CB.beats; [b[i], b[i + d]] = [b[i + d], b[i]]; this.reRender(); });
    on("[data-rmb]", "click", (e) => { CB.beats.splice(+e.currentTarget.dataset.rmb, 1); this.reRender(); });
    $("#addBeat").onclick = () => { CB.beats.push(""); this.reRender(); setTimeout(() => $(`#beat${CB.beats.length - 1}`)?.focus(), 20); };
    on("[data-col]", "input", (e) => { const i = +e.target.dataset.col; CB.brand.colors[i] = e.target.value; e.target.parentElement.style.background = e.target.value; saveDraft(); this.paint(); });
    on("[data-rmc]", "click", (e) => { CB.brand.colors.splice(+e.currentTarget.dataset.rmc, 1); this.reRender(); });
    $("#addCol") && ($("#addCol").onclick = () => { CB.brand.colors.push("#8B5CF6"); this.reRender(); });
    $("#cvBrand").onclick = () => { CB.brand = JSON.parse(JSON.stringify(CV_BRAND)); if (!CB.client) CB.client = "Création Virale"; this.reRender(); toast("Création Virale brand loaded"); };
    on("[data-rm]", "click", (e) => { CB.images.splice(+e.currentTarget.dataset.rm, 1); this.reRender(); });
    $("#bFiles").onchange = (e) => this.upload([...e.target.files]);
    $("#genBtn").onclick = (e) => this.generate(e.currentTarget);
    $("#resetBrief").onclick = () => { CB = freshBrief(); this.reRender(); toast("Brief cleared"); };
  },
  reRender() { saveDraft(); const y = scrollY; SYNTH.stop(); this.render(); scrollTo(0, y); },
  async upload(files) {
    if (!CAP.assets) return toast("Uploads work when this page is open on claude.ai");
    for (const f of files.slice(0, 12)) {
      if (f.size > 20 * 1024 * 1024) { toast(`${f.name} is over 20 MB`); continue; }
      try { toast(`Uploading ${f.name}…`); const a = await CAP.assets.upload(f); CB.images.push({ id: a.id, name: f.name, type: f.type }); }
      catch (e) { toast(e?.code === "not_granted" ? "Only editors can upload here" : `Could not upload ${f.name}`); }
    }
    this.reRender();
  },
  summary() {
    const st = CB.styles.map((id, i) => `${STYLES.find((s) => s.id === id)?.name}${CB.styles.length > 1 ? (i ? " (accent)" : " (lead)") : ""}`).join(" + ") || "—";
    const en = ENERGY.find((e) => e.id === CB.energy), mu = MUSIC.find((m) => m.id === CB.music), sd = SOUND.find((s) => s.id === CB.sfx);
    const src = [CB.url && CB.url, CB.images.length && plural(CB.images.length, "uploaded file"), CB.library && "Création Virale footage library"].filter(Boolean).join(" · ") || "—";
    return [
      ["PROJECT", `${CB.name || "Untitled"}${CB.client ? ` · ${CB.client}` : ""}`],
      ["SOURCE", src],
      ["FORMAT", `${CB.format} · ${CB.duration} s (${CB.duration * 2} beats at 120 BPM)`],
      ["STYLE", st],
      ["ENERGY", `${en.name} · ${en.d}`],
      ["MUSIC", `${mu.name} · ${mu.d}`],
      ["SOUND", `${sd.name} · ${sd.d}`],
      ["STORY", CB.beats.filter((b) => b.trim()).map((b, i) => `\n  ${pad(i + 1)} ${b}`).join("")],
      ["BRAND", `${CB.brand.colors.join(" ")} · ${CB.brand.font}${CB.brand.rules ? `\n  ${CB.brand.rules.replace(/\n/g, "\n  ")}` : ""}`],
      ...(CB.notes ? [["INCLUDE", CB.notes]] : []),
      ["DELIVERY", "30 key frames for review → corrections → final render"],
    ];
  },
  paint() {
    const out = $("#briefOut"); if (!out) return;
    const s = this.summary();
    out.innerHTML = s.map(([k, v]) => `<b>${k.padEnd(9, " ")}</b>${esc(v)}`).join("\n");
    const checks = [!!CB.name.trim(), !!(CB.url || CB.images.length || CB.library), CB.styles.length > 0, !!CB.music, !!CB.sfx, CB.beats.filter((b) => b.trim()).length >= 2, CB.brand.colors.length > 0];
    const pc = Math.round((checks.filter(Boolean).length / checks.length) * 100);
    const missing = [!checks[0] && "a name", !checks[1] && "a source", !checks[5] && "two story beats"].filter(Boolean);
    $("#meter").innerHTML = `<div class="t"><i style="width:${pc}%"></i></div><small><span>${pc === 100 ? "Ready to send" : `Add ${missing.join(", ") || "the rest"}`}</span><span class="num">${pc}%</span></small>`;
    $("#genBtn").disabled = !(checks[0] && checks[1] && checks[5]);
  },
  async generate(btn) {
    if (!CAP.db) return toast("Open this page on claude.ai to send the brief");
    btn.disabled = true;
    const slug = (CB.name || "video").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32) || "video";
    const pid = `${slug}-${Math.random().toString(36).slice(2, 6)}`, rid = newId("r");
    const summary = this.summary().map(([k, v]) => `${k}: ${v}`).join("\n");
    const text = `Motion Studio · NEW VIDEO BRIEF ${rid}\n${summary}\n\nBuild the film, then post 30 key frames as a “frames” version for review. Do not render the video until it is approved.\nData: projects/${pid}/requests/${rid}`;
    const thread = await notifyClaude(text, btn);
    try {
      await dbw.set(`projects/${pid}`, { name: CB.name.trim(), client: CB.client.trim() || null, format: CB.format, duration: CB.duration, status: "briefing",
        brief: { ...JSON.parse(JSON.stringify(CB)), summary }, rules: [CB.brand.rules, "Never render the full video before the key frames are approved."].filter(Boolean).join("\n"),
        pipeline: PIPELINE, createdAt: now(), updatedAt: now() });
      await dbw.set(`projects/${pid}/requests/${rid}`, { type: "brief", status: "sent", versionLabel: "brief", createdAt: now(), notified: !!thread, threadId: thread && thread !== "sent" ? thread : null, text });
    } catch (e) { btn.disabled = false; return toast(e?.code === "invalid_argument" ? "You can view this studio but not create projects" : "Could not save the brief. Try again."); }
    try { localStorage.removeItem("cv-brief"); } catch {}
    VIEWS.project.pendingTab = "requests";
    go({ view: "project", pid });
    if (thread) toast("Brief sent to Claude"); else fallbackSheet(text, "Brief");
  },
};
