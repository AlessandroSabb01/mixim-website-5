/* ===================== Viral kit: Hook lab, trend audio, AI footage, captions, style library ===================== */
const HOOKS = [
  { id: "shock", name: "Shock stat", ex: "59× more views." },
  { id: "pov", name: "POV", ex: "POV: you stopped overpaying." },
  { id: "question", name: "Question", ex: "Why pay retail?" },
  { id: "beforeafter", name: "Before / after", ex: "$4.20 → $1.10" },
  { id: "countdown", name: "Countdown", ex: "3 things nobody tells you" },
  { id: "interrupt", name: "Pattern interrupt", ex: "STOP. Look at this box." },
  { id: "claim", name: "Bold claim", ex: "The cheapest box in Québec." },
  { id: "waitfor", name: "Wait for it", ex: "Watch the price drop…" },
];
const CAPTIONS = [
  { id: "wordpop", name: "Bold word-pop", d: "Big words punch in on the beat, brand colour on the key word", html: `<div class="sp cp-pop"><span>PAY</span><span>LESS</span><span class="k">NOW.</span></div>` },
  { id: "meme", name: "Meme grammar", d: "Emoji pops, zoom punches, freeze frames, “wait for it”", html: `<div class="sp cp-meme"><i class="z"></i><span class="t">wait for it…</span><span class="e">🤯</span></div>` },
  { id: "subtitle", name: "Subtitle bar", d: "Clean sound-off captions under the action", html: `<div class="sp cp-sub"><i class="v"></i><span class="b">same box, <u>half</u> the price</span></div>` },
  { id: "none", name: "No captions", d: "The type is already the story", html: `<div class="sp cp-none"><span>Aa</span></div>` },
];
const HOOK_DEFAULT = ["shock", "pov", "interrupt", "claim", "question"];
const hookName = (id) => HOOKS.find((h) => h.id === id)?.name || id;
const captionName = (id) => CAPTIONS.find((c) => c.id === id)?.name || "Bold word-pop";

/* a style = the full recipe of a brief, minus what is specific to one video */
const RECIPE_KEYS = ["format", "duration", "styles", "energy", "music", "sfx", "trend", "captions", "hooks", "story", "beats", "brand"];
const recipeOf = (b) => JSON.parse(JSON.stringify(Object.fromEntries(RECIPE_KEYS.filter((k) => b?.[k] != null).map((k) => [k, b[k]]))));
const recipeChips = (r) => [
  ...(r.styles || []).map((id) => STYLES.find((s) => s.id === id)?.name).filter(Boolean),
  MUSIC.find((m) => m.id === r.music)?.name, r.trend?.on && "Trend-matched", SOUND.find((s) => s.id === r.sfx)?.name,
  r.captions && r.captions !== "none" && captionName(r.captions), r.hooks?.length && `${r.hooks.length} hook formulas`,
].filter(Boolean);

/* ---------- style library ---------- */
function styleCard(s) {
  const r = s.recipe || {}, cols = r.brand?.colors || [];
  return `<article class="scard">
    <div class="sart">${s.posterAssetId ? `<img src="${blobUrl(s.posterAssetId)}" alt="" loading="lazy">` : `<div class="ph" style="background:${esc(cols[0] || "var(--accent)")}"></div>`}
      <div class="swatch">${cols.slice(0, 4).map((c) => `<i style="background:${esc(c)}"></i>`).join("")}</div></div>
    <div class="smeta"><span class="eyebrow">${esc(s.fromName || "Saved style")}</span><h3>${esc(s.name)}</h3>
      <div class="chips">${recipeChips(r).slice(0, 5).map((c) => `<span>${esc(c)}</span>`).join("")}</div>
      <div class="row"><button class="btn sm primary" data-use-style="${esc(s.id)}">${ICON.wand}Use this style</button>
        <button class="btn sm ghost icon-only" data-del-style="${esc(s.id)}" aria-label="Delete ${esc(s.name)}">${ICON.x}</button></div></div>
  </article>`;
}
function bindStyleCards(root) {
  $$("[data-use-style]", root).forEach((b) => (b.onclick = () => useStyle(b.dataset.useStyle)));
  $$("[data-del-style]", root).forEach((b) => (b.onclick = async () => {
    if (b.dataset.arm !== "1") { b.dataset.arm = "1"; b.classList.add("danger"); b.innerHTML = "Delete?"; setTimeout(() => { if (b.isConnected) { b.dataset.arm = ""; b.classList.remove("danger"); b.innerHTML = ICON.x; } }, 3000); return; }
    try { await dbw.del(`styles/${b.dataset.delStyle}`); toast("Style deleted"); } catch { toast("Could not delete the style"); }
  }));
}
function useStyle(sid) {
  const s = ST.styles.find((x) => x.id === sid); if (!s) return;
  let draft = null; try { draft = JSON.parse(localStorage.getItem("cv-brief") || "null"); } catch {}
  const next = { ...freshBrief(), ...(draft || {}), ...JSON.parse(JSON.stringify(s.recipe || {})), styleId: s.id, styleName: s.name };
  try { localStorage.setItem("cv-brief", JSON.stringify(next)); } catch {}
  if (ST.route.view === "create") VIEWS.create.enter(); else go({ view: "create" });
  toast(`“${s.name}” loaded into the brief`);
}
function saveStyleSheet({ recipe, posterAssetId = null, fromName = "", fromPid = null, fromVid = null, suggest = "" }) {
  if (!CAP.db) return toast("Open this page on claude.ai to save styles");
  sheet({
    title: "Save to the style library", sub: "The full recipe: look, motion, music, sound design, captions and hook formulas. It becomes a tile in the Brief Builder.",
    body: `<div class="field"><label for="stName">Style name</label><input id="stName" maxlength="60" value="${esc(suggest)}" placeholder="e.g. Red Swiss techno"></div>
      <div class="field"><label>What gets saved</label><div class="chips">${recipeChips(recipe).map((c) => `<span>${esc(c)}</span>`).join("") || "<span>Defaults</span>"}${(recipe.brand?.colors || []).map((c) => `<span class="cdot"><i style="background:${esc(c)}"></i>${esc(c)}</span>`).join("")}</div></div>`,
    foot: `<button class="btn" data-close>Cancel</button><button class="btn primary" id="stSave">${ICON.bookmark}Save style</button>`,
    onMount: (s) => {
      const inp = $("#stName", s); setTimeout(() => inp.focus(), 30);
      $("#stSave", s).onclick = async (e) => {
        const name = inp.value.trim(); if (!name) return inp.focus();
        e.currentTarget.disabled = true;
        try {
          await dbw.set(`styles/${newId("s")}`, { name, recipe, posterAssetId, fromName, fromPid, fromVid, createdAt: now() });
          closeSheet(); toast(`“${name}” saved to the style library`);
        } catch { e.currentTarget.disabled = false; toast("Could not save the style"); }
      };
    },
  });
}

/* ---------- Hook lab: 5 openings, you pick one ---------- */
function hookLabHTML(r) {
  const H = r.hookOptions || [];
  if (!H.length) return r.type === "hooks" || r.hooks?.length ? `<div class="hooklab wait"><div class="hl-h">${ICON.hook}<b>Hook lab</b><small>${r.status === "sent" || r.status === "working" ? "Claude is building 5 openings…" : ""}</small></div></div>` : "";
  const picked = r.hookPick;
  return `<div class="hooklab"><div class="hl-h">${ICON.hook}<b>Hook lab</b><small>${picked ? `You picked “${esc(H.find((h) => h.id === picked)?.name || picked)}”` : "Pick the first 2 seconds"}</small></div>
    <div class="hooks">${H.map((h, i) => `<article class="hk ${picked === h.id ? "on" : ""} ${picked && picked !== h.id ? "off" : ""}">
      <button class="flip" data-hook-view="${esc(r.id)}" data-i="${i}" aria-label="Play hook ${i + 1}: ${esc(h.name)}">${(h.frames || []).map((f, k) => `<img src="${blobUrl(f.assetId || f)}" alt="" ${k ? "" : `class="on"`}>`).join("")}
        <span class="n">${pad(i + 1)}</span>${h.rec ? `<span class="rec">${ICON.sparkle}Claude's pick</span>` : ""}</button>
      <div class="hk-m"><b>${esc(h.name)}</b><small>${[h.formula && hookName(h.formula) !== h.name && hookName(h.formula), h.score && `${h.score}/10`].filter(Boolean).map(esc).join(" · ")}</small>${h.line ? `<q>${esc(h.line)}</q>` : ""}</div>
      ${picked ? (picked === h.id ? `<span class="pill done"><i></i>Picked</span>` : "") : `<button class="btn sm ${h.rec ? "primary" : ""}" data-hook-pick="${esc(r.id)}" data-h="${esc(h.id)}">${ICON.check}Pick</button>`}
    </article>`).join("")}</div></div>`;
}
let flipTimer = 0;
function startFlips() {
  clearInterval(flipTimer);
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  flipTimer = setInterval(() => {
    const els = $$(".flip"); if (!els.length) return clearInterval(flipTimer);
    els.forEach((f) => { const im = $$("img", f); if (im.length < 2) return; const i = im.findIndex((x) => x.classList.contains("on")); im[i]?.classList.remove("on"); im[(i + 1) % im.length].classList.add("on"); });
  }, 520);
}
function openHook(pid, rid, i) {
  const r = requestsOf(pid).find((x) => x.id === rid); const h = r?.hookOptions?.[i]; if (!h) return;
  sheet({
    wide: true, title: `Hook ${pad(i + 1)} · ${esc(h.name)}`, sub: esc([hookName(h.formula), h.line && `“${h.line}”`, h.note].filter(Boolean).join(" · ")),
    body: `<div class="hk-frames">${(h.frames || []).map((f, k) => `<figure><img src="${blobUrl(f.assetId || f)}" alt="Hook ${i + 1}, frame ${k + 1}"><figcaption class="eyebrow">${f.t != null ? fmtTC(f.t) : `frame ${k + 1}`}</figcaption></figure>`).join("")}</div>`,
    foot: `${i > 0 ? `<button class="btn" id="hkPrev">${ICON.fprev}Previous</button>` : ""}${i < r.hookOptions.length - 1 ? `<button class="btn" id="hkNext">Next${ICON.fnext}</button>` : ""}${r.hookPick ? "" : `<button class="btn primary" id="hkPick">${ICON.check}Pick this hook</button>`}<button class="btn dark" data-close>Done</button>`,
    onMount: (s) => {
      $("#hkPrev", s) && ($("#hkPrev", s).onclick = () => openHook(pid, rid, i - 1));
      $("#hkNext", s) && ($("#hkNext", s).onclick = () => openHook(pid, rid, i + 1));
      $("#hkPick", s) && ($("#hkPick", s).onclick = () => { closeSheet(); pickHook(pid, rid, h.id); });
    },
  });
}
function pickHook(pid, rid, hid) {
  const r = requestsOf(pid).find((x) => x.id === rid), h = r?.hookOptions?.find((x) => x.id === hid), p = P(pid); if (!h) return;
  sheet({
    title: `Pick “${esc(h.name)}”`, sub: "This opening goes into the film. Add a note if you want a twist on it.",
    body: `<div class="field"><label for="hkNote">Note (optional)</label><textarea id="hkNote" maxlength="800" placeholder="e.g. Use this hook but with the 48 H number from hook 3."></textarea></div>`,
    foot: `<button class="btn" data-close>Cancel</button><button class="btn primary" id="hkGo">${ICON.send}Send pick to Claude</button>`,
    onMount: (s) => ($("#hkGo", s).onclick = async (e) => {
      e.currentTarget.disabled = true;
      const note = $("#hkNote", s).value.trim(), path = `projects/${pid}/requests/${rid}`;
      const text = `Motion Studio · HOOK PICKED ${rid}\nProject: ${p?.name || pid}\nHook: ${h.id} · ${h.name}${h.formula && hookName(h.formula) !== h.name ? ` (${hookName(h.formula)})` : ""}${h.line ? ` · “${h.line}”` : ""}${note ? `\nNote: “${note}”` : ""}\nBuild this opening into the film${r.type === "hooks" ? " and post preview frames" : ""}.\nData: ${path}`;
      const thread = await notifyClaude(text, $("#panel") || e.currentTarget);
      try { await dbw.update(path, { hookPick: h.id, hookNote: note || null, hookPickedAt: now(), ...(r.type === "hooks" ? { status: "working" } : {}) }); touchProject(pid); }
      catch { e.currentTarget.disabled = false; return toast("Could not save the pick"); }
      closeSheet(); if (thread) toast("Hook sent to Claude"); else fallbackSheet(text, "Hook pick");
    }),
  });
}
function openHookLabSheet(pid, ver) {
  if (!CAP.db) return toast("Open this page on claude.ai to use the Hook lab");
  const p = P(pid), sel = new Set(p?.brief?.hooks?.length ? p.brief.hooks : HOOK_DEFAULT);
  sheet({
    title: "Hook lab", sub: `Claude builds 5 new openings for ${esc(ver?.label || "this video")} and posts them as key frames. You pick the winner; nothing renders before that.`,
    body: `<div class="field"><label>Hook formulas to try</label><div class="hookf" id="hkF">${HOOKS.map((h) => `<button data-hf="${h.id}" aria-pressed="${sel.has(h.id)}"><b>${h.name}</b><small>${esc(h.ex)}</small></button>`).join("")}</div></div>
      <div class="field"><label for="hkBrief">Angle (optional)</label><input id="hkBrief" maxlength="200" placeholder="e.g. Lead with the price, talk to restaurant owners"></div>`,
    foot: `<button class="btn" data-close>Cancel</button><button class="btn primary" id="hkSend">${ICON.hook}Generate 5 hooks</button>`,
    onMount: (s) => {
      $$("[data-hf]", s).forEach((b) => (b.onclick = () => { const id = b.dataset.hf; sel.has(id) ? sel.delete(id) : sel.add(id); b.setAttribute("aria-pressed", sel.has(id)); $("#hkSend", s).disabled = !sel.size; }));
      $("#hkSend", s).onclick = async (e) => {
        e.currentTarget.disabled = true;
        const rid = newId("r"), hooks = [...sel], angle = $("#hkBrief", s).value.trim(), path = `projects/${pid}/requests/${rid}`;
        const text = `Motion Studio · HOOK LAB ${rid}\nProject: ${p?.name || pid} · ${ver?.label || ""}\nFormulas: ${hooks.map(hookName).join(", ")}${angle ? `\nAngle: “${angle}”` : ""}\nBuild 5 alternative openings (first 2 s) as key frames, 3–4 frames each, and post them as hookOptions. Mark your favourite. No render until a hook is picked.\nData: ${path}`;
        const thread = await notifyClaude(text, e.currentTarget);
        try { await dbw.set(path, { type: "hooks", status: "sent", versionId: ver?.id || null, versionLabel: ver?.label || null, hooks, angle: angle || null, createdAt: now(), notified: !!thread, threadId: thread && thread !== "sent" ? thread : null, text }); touchProject(pid); }
        catch { e.currentTarget.disabled = false; return toast("Could not save the request"); }
        closeSheet(); if (R) { R.tab = "requests"; renderRail(); }
        if (thread) toast("Hook lab sent to Claude"); else fallbackSheet(text, "Hook lab");
      };
    },
  });
}

/* ---------- AI footage: every shot is quoted, nothing generates without a click ---------- */
const SHOT_STATUS = { requested: ["open", "Waiting for a quote"], quoted: ["check", "Quoted"], approved: ["prog", "Generating"], done: ["done", "Ready"], skipped: ["", "Skipped"] };
function shotsHTML(r) {
  const S = r.shots || []; if (!S.length) return "";
  const quoted = S.filter((x) => x.status === "quoted"), sum = quoted.reduce((n, x) => n + (+x.credits || 0), 0);
  return `<div class="shots"><div class="hl-h">${ICON.camera}<b>AI footage</b><small>${plural(S.length, "shot")}${quoted.length ? ` · ${sum} credits to approve` : ""}</small></div>
    ${S.map((x, i) => { const [cls, lab] = SHOT_STATUS[x.status] || SHOT_STATUS.requested; return `<div class="shot">
      <div class="th">${x.assetId ? (x.kind === "video" ? `<video src="${blobUrl(x.assetId)}" muted loop playsinline preload="metadata" aria-label="Shot ${i + 1}"></video>` : `<img src="${blobUrl(x.assetId)}" alt="Shot ${i + 1}">`) : `<span>${pad(i + 1)}</span>`}</div>
      <div class="sm"><b>${esc(x.prompt)}</b><small>${x.kind === "image" ? "Still → animated" : "Video clip"}${x.model ? ` · ${esc(x.model)}` : ""}${x.credits != null ? ` · <span class="num">${esc(String(x.credits))}</span> credits` : ""}</small>${x.note ? `<small class="cn">${esc(x.note)}</small>` : ""}</div>
      <div class="sa">${cls ? `<span class="pill ${cls}"><i></i>${lab}</span>` : `<span class="pill">${lab}</span>`}
        ${x.status === "quoted" ? `<button class="btn sm primary" data-shot="${esc(r.id)}" data-i="${i}" data-a="approve">Approve</button><button class="btn sm ghost" data-shot="${esc(r.id)}" data-i="${i}" data-a="skip">Skip</button>` : ""}</div>
    </div>`; }).join("")}
    ${quoted.length > 1 ? `<button class="btn sm primary" data-shot="${esc(r.id)}" data-a="all">${ICON.check}Approve all ${quoted.length} · ${sum} credits</button>` : ""}</div>`;
}
async function shotAction(pid, rid, a, i, btn) {
  const r = requestsOf(pid).find((x) => x.id === rid); if (!r) return;
  const path = `projects/${pid}/requests/${rid}`, p = P(pid);
  const shots = JSON.parse(JSON.stringify(r.shots || []));
  const idx = a === "all" ? shots.map((x, k) => (x.status === "quoted" ? k : -1)).filter((k) => k >= 0) : [i];
  const st = a === "skip" ? "skipped" : "approved";
  idx.forEach((k) => (shots[k].status = st));
  btn.disabled = true;
  try { await dbw.update(path, { shots }); } catch { btn.disabled = false; return toast("Could not save"); }
  if (st === "skipped") return toast("Shot skipped");
  const credits = idx.reduce((n, k) => n + (+shots[k].credits || 0), 0);
  const text = `Motion Studio · FOOTAGE APPROVED ${rid}\nProject: ${p?.name || pid}\nGenerate ${plural(idx.length, "shot")} (${credits} credits):\n${idx.map((k) => `  ${pad(k + 1)} ${shots[k].prompt}${shots[k].model ? ` · ${shots[k].model}` : ""}`).join("\n")}\nUpload each result as an asset, set shots[n].assetId and status "done".\nData: ${path}`;
  const thread = await notifyClaude(text, $("#panel") || btn);
  if (thread) toast(`${plural(idx.length, "shot")} approved`); else fallbackSheet(text, "Footage approval");
}
function bindViral(root, pid) {
  $$("[data-hook-pick]", root).forEach((b) => (b.onclick = () => pickHook(pid, b.dataset.hookPick, b.dataset.h)));
  $$("[data-hook-view]", root).forEach((b) => (b.onclick = () => openHook(pid, b.dataset.hookView, +b.dataset.i)));
  $$("[data-shot]", root).forEach((b) => (b.onclick = () => shotAction(pid, b.dataset.shot, b.dataset.a, +b.dataset.i, b)));
  $$(".shot video", root).forEach((v) => { v.onmouseenter = () => v.play().catch(() => {}); v.onmouseleave = () => v.pause(); });
  startFlips();
}
