/* ===================== core: helpers, icons, capabilities, live data, routing ===================== */
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const now = () => Date.now();
const newId = (p) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const blobUrl = (id) => (id ? "/_blob/" + id : "");
const pad = (n, w = 2) => String(Math.floor(n)).padStart(w, "0");
const fmtTC = (t) => { t = Math.max(0, t || 0); const m = Math.floor(t / 60), s = t - m * 60; return `${pad(m)}:${pad(s)}.${pad(Math.round((s % 1) * 100) % 100)}`; };
const fmtShort = (t) => { t = Math.max(0, t || 0); return `${Math.floor(t / 60)}:${pad(t % 60)}`; };
const ago = (ms) => {
  if (!ms) return "";
  const d = (now() - ms) / 1000;
  if (d < 60) return "just now";
  if (d < 3600) return `${Math.floor(d / 60)} min ago`;
  if (d < 86400) return `${Math.floor(d / 3600)} h ago`;
  if (d < 86400 * 7) return `${Math.floor(d / 86400)} d ago`;
  return new Date(ms).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
};
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;

const I = (p, extra = "") => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${p}</svg>`;
const ICON = {
  play: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.6v14.8c0 .8.9 1.3 1.6.9l11.6-7.4c.6-.4.6-1.3 0-1.7L8.6 3.7C7.9 3.3 7 3.8 7 4.6z" fill="currentColor"/></svg>`,
  pause: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="4.5" width="4.2" height="15" rx="1.2" fill="currentColor"/><rect x="13.8" y="4.5" width="4.2" height="15" rx="1.2" fill="currentColor"/></svg>`,
  start: I('<path d="M6 5v14"/><path d="M18 6l-8 6 8 6z"/>'),
  fprev: I('<path d="M15 6l-6 6 6 6"/>'),
  fnext: I('<path d="M9 6l6 6-6 6"/>'),
  bprev: I('<path d="M12 6l-6 6 6 6"/><path d="M19 6l-6 6 6 6"/>'),
  bnext: I('<path d="M12 6l6 6-6 6"/><path d="M5 6l6 6-6 6"/>'),
  pen: I('<path d="M4 20l4.2-1 10.4-10.4a2.1 2.1 0 0 0-3-3L5.2 16 4 20z"/><path d="M14 6.5l3.5 3.5"/>'),
  arrow: I('<path d="M5 19L19 5"/><path d="M10 5h9v9"/>'),
  rect: I('<rect x="4" y="5.5" width="16" height="13" rx="2.5"/>'),
  undo: I('<path d="M9 7L4.5 11.5 9 16"/><path d="M5 11.5h9.5a5 5 0 0 1 0 10H12"/>'),
  trash: I('<path d="M4.5 7h15"/><path d="M9.5 7V4.8h5V7"/><path d="M6.5 7l1 12.2h9l1-12.2"/>'),
  download: I('<path d="M12 4v11"/><path d="M7.5 10.5L12 15l4.5-4.5"/><path d="M5 19.5h14"/>'),
  compare: I('<rect x="3.5" y="5" width="7" height="14" rx="1.6"/><rect x="13.5" y="5" width="7" height="14" rx="1.6"/>'),
  book: I('<path d="M5 4.5h10.5A3.5 3.5 0 0 1 19 8v11.5H8.5A3.5 3.5 0 0 1 5 16z"/><path d="M5 16a3.5 3.5 0 0 1 3.5-3.5H19"/>'),
  send: I('<path d="M20 4L9.5 14.5"/><path d="M20 4l-6.5 16-4-5.5L4 10.5z"/>'),
  check: I('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  x: I('<path d="M6 6l12 12M18 6L6 18"/>'),
  plus: I('<path d="M12 5v14M5 12h14"/>'),
  up: I('<path d="M6 14l6-6 6 6"/>'),
  down: I('<path d="M6 10l6 6 6-6"/>'),
  sparkle: I('<path d="M12 3.5l1.9 5.6 5.6 1.9-5.6 1.9-1.9 5.6-1.9-5.6-5.6-1.9 5.6-1.9z"/>'),
  film: I('<rect x="4" y="3.5" width="16" height="17" rx="2.5"/><path d="M8 3.5v17M16 3.5v17M4 8h4M4 12h4M4 16h4M16 8h4M16 12h4M16 16h4"/>'),
  wand: I('<path d="M5 19L15.5 8.5"/><path d="M14 4v3M18.5 5.5l-2 2M20 10h-3"/><path d="M13.5 10.5l-2-2"/>'),
  sun: I('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>'),
  moon: I('<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"/>'),
  vol: I('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>'),
  mute: I('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>'),
  msg: I('<path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-7l-4.5 3.5v-3.5H5A1.5 1.5 0 0 1 3.5 16V7A1.5 1.5 0 0 1 5 5.5z"/>'),
  grid: I('<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>'),
  go: I('<path d="M7 17L17 7"/><path d="M9 7h8v8"/>'),
  lock: I('<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>'),
  claude: I('<path d="M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4M6 6l2.8 2.8M15.2 15.2L18 18M6 18l2.8-2.8M15.2 8.8L18 6"/>'),
  upload: I('<path d="M12 16V5"/><path d="M7.5 9.5L12 5l4.5 4.5"/><path d="M5 19.5h14"/>'),
  loop: I('<path d="M17 4.5l2.5 2.5L17 9.5"/><path d="M4.5 12V10a3 3 0 0 1 3-3h12"/><path d="M7 19.5L4.5 17 7 14.5"/><path d="M19.5 12v2a3 3 0 0 1-3 3h-12"/>'),
};
const LOGO = `<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="3" y="12" width="26" height="16" rx="3" fill="currentColor"/><g transform="rotate(-14 4 11)"><rect x="3" y="5" width="26" height="6" rx="1.5" fill="currentColor"/><path d="M9 5l-3 6M15 5l-3 6M21 5l-3 6M27 5l-3 6" stroke="var(--bg)" stroke-width="2.2"/></g><circle cx="16" cy="20" r="3.4" fill="var(--bg)"/></svg>`;

/* ---------- capabilities ---------- */
const CAP = { db: null, assets: null, comments: null, downloads: null, user: null };
const use = async (name) => { try { return window.claude?.use ? await window.claude.use(name) : null; } catch { return null; } };

/* ---------- live state ---------- */
const ST = {
  booted: false,
  projects: [],
  versions: {}, comments: {}, requests: {},       // pid -> [ {id, ...data} ]
  subs: {},                                         // pid -> [unsubscribe]
  route: { view: "home", pid: null, vid: null },
  claude: "unknown",                                // canSendToClaude snapshot
  canWrite: true,
};
const rows = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }));
const P = (pid) => ST.projects.find((p) => p.id === pid);
const versionsOf = (pid) => ST.versions[pid] || [];
const commentsOf = (pid) => ST.comments[pid] || [];
const requestsOf = (pid) => ST.requests[pid] || [];
const latestVersion = (pid) => { const v = versionsOf(pid); return v.length ? v[v.length - 1] : null; };

function subscribeProject(pid) {
  if (ST.subs[pid] || !CAP.db) return;
  const base = `projects/${pid}`;
  const onErr = (e) => console.warn("db", e?.code, e?.message);
  ST.subs[pid] = [
    CAP.db.collection(`${base}/versions`).orderBy("n").onSnapshot((s) => { ST.versions[pid] = rows(s); changed("versions", pid); }, onErr),
    CAP.db.collection(`${base}/comments`).orderBy("t").onSnapshot((s) => { ST.comments[pid] = rows(s); changed("comments", pid); }, onErr),
    CAP.db.collection(`${base}/requests`).orderBy("createdAt", "desc").onSnapshot((s) => { ST.requests[pid] = rows(s); changed("requests", pid); }, onErr),
  ];
}
function startData() {
  if (!CAP.db) { changed("projects"); return; }
  CAP.db.collection("projects").orderBy("updatedAt", "desc").limit(20).onSnapshot((s) => {
    ST.projects = rows(s);
    ST.projects.forEach((p) => subscribeProject(p.id));
    ST.booted = true;
    changed("projects");
  }, (e) => { console.warn("db projects", e?.code); ST.booted = true; changed("projects"); });
}

/* writes: one at a time per document, only on a viewer action */
const dbw = {
  set: (path, data) => CAP.db.doc(path).set(data),
  update: (path, data) => CAP.db.doc(path).update(data),
  del: (path) => CAP.db.doc(path).delete(),
};
async function touchProject(pid) { try { await dbw.update(`projects/${pid}`, { updatedAt: now() }); } catch {} }

/* ---------- Claude bridge: a page-written comment thread that wakes the Claude session ---------- */
async function refreshClaude() {
  let s = "off";
  try { if (CAP.comments?.canSendToClaude) s = await CAP.comments.canSendToClaude(); } catch { s = "off"; }
  ST.claude = s;
  const el = $("#live");
  if (el) {
    const on = s === "available";
    el.dataset.s = !CAP.db ? "off" : on ? "on" : "queue";
    el.innerHTML = `<i></i><b>${!CAP.db ? "Preview mode" : on ? "Claude listening" : "Requests queue"}</b>`;
    el.title = !CAP.db ? "Open this page on claude.ai to sync comments and versions."
      : on ? "Requests you send wake the Claude session right away."
      : "No Claude session is listening right now. Requests are saved and picked up when you tell Claude to check the studio.";
  }
  return s;
}
/** Post `text` as a comment thread anchored at `el` and send it to Claude. Resolves the thread id, or null. */
async function notifyClaude(text, el) {
  try {
    if (!CAP.comments?.sendToClaude) return null;
    const s = await CAP.comments.canSendToClaude();
    if (s !== "available") return null;
    const anchor = await CAP.comments.anchorFor(el);
    const r = await CAP.comments.sendToClaude({ anchor, text: text.slice(0, 3900) });
    return r?.threadId || "sent";
  } catch (e) { console.warn("sendToClaude", e?.code, e?.message); return null; }
}

/* ---------- toast, sheet ---------- */
let toastT;
function toast(msg) {
  let t = $("#toast");
  if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
  t.textContent = msg; t.classList.add("on");
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 2600);
}
function sheet({ title, sub = "", body = "", foot = "", onMount, wide = false }) {
  closeSheet();
  const s = document.createElement("div");
  s.className = "scrim"; s.id = "scrim";
  s.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-t" style="${wide ? "width:min(860px,100%)" : ""}">
    <header><div><h3 id="sheet-t">${title}</h3>${sub ? `<p>${sub}</p>` : ""}</div><button class="icon-btn" data-close aria-label="Close">${ICON.x}</button></header>
    <div class="body">${body}</div>${foot ? `<footer>${foot}</footer>` : ""}</div>`;
  document.body.appendChild(s);
  s.addEventListener("click", (e) => { if (e.target === s || e.target.closest("[data-close]")) closeSheet(); });
  onMount?.(s);
  setTimeout(() => (s.querySelector("textarea, input, button.primary") || s.querySelector("button"))?.focus(), 30);
  return s;
}
function closeSheet() { $("#scrim")?.remove(); }
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && $("#scrim")) { closeSheet(); e.stopPropagation(); } }, true);

async function copyText(text, el) {
  try { await navigator.clipboard.writeText(text); toast("Copied"); }
  catch { if (el) { const r = document.createRange(); r.selectNodeContents(el); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); toast("Selected: press Ctrl/Cmd+C"); } }
}
function fallbackSheet(text, what) {
  sheet({
    title: `${what} saved`,
    sub: "No Claude session is listening right now, so it is waiting in the studio. Open your Claude Code session and paste this (or just say “check Motion Studio”).",
    body: `<div class="copybox" id="cpbox">${esc(text)}</div>`,
    foot: `<button class="btn" data-close>Close</button><button class="btn primary" id="cpbtn">Copy message</button>`,
    onMount: (s) => $("#cpbtn", s).addEventListener("click", () => copyText(text, $("#cpbox", s))),
  });
}

/* ---------- routing (bare #token deep links: #home, #create, #p.<pid>.<vid>) ---------- */
const VIEWS = {};
let viewKey = "";
function go(route, push = true) {
  ST.route = { view: "home", pid: null, vid: null, ...route };
  const key = `${ST.route.view}|${ST.route.pid}|${ST.route.vid}`;
  if (push) { try { history.replaceState(null, "", "#" + (ST.route.view === "project" ? `p.${ST.route.pid}${ST.route.vid ? "." + ST.route.vid : ""}` : ST.route.view)); } catch {} }
  if (key !== viewKey) {
    VIEWS[viewKey.split("|")[0]]?.leave?.();
    viewKey = key;
    window.scrollTo(0, 0);
    renderBar();
    VIEWS[ST.route.view]?.enter(ST.route);
  }
}
function routeFromHash() {
  const h = (location.hash || "").slice(1);
  if (h === "create") return { view: "create" };
  if (h.startsWith("p.")) { const [, pid, vid] = h.split("."); return { view: "project", pid, vid: vid || null }; }
  return { view: "home" };
}
function changed(kind, pid) {
  VIEWS[ST.route.view]?.update?.(kind, pid);
  if (kind === "projects") renderBar();
}

/* ---------- studio bar ---------- */
function renderBar() {
  const r = ST.route, p = r.pid && P(r.pid);
  const crumbs = r.view === "home" ? "" :
    `<span class="sep">/</span>${r.view === "create" ? `<span class="here">New video</span>` : `<span class="here">${esc(p?.name || "Project")}</span>`}`;
  $("#bar").innerHTML = `<div class="bar-in">
    <button class="brand" id="toHome" aria-label="Motion Studio home">${LOGO}<div><b>CRÉATION VIRALE</b><span>Motion Studio</span></div></button>
    <nav class="crumbs" aria-label="Breadcrumb">${r.view === "home" ? "" : `<button id="crHome" class="hide-s">Studio</button>`}${crumbs}</nav>
    <div class="bar-right">
      <span class="live" id="live" data-s="off"><i></i><b>Connecting</b></span>
      <button class="icon-btn" id="themeBtn" aria-label="Switch light or dark theme">${ICON.sun}</button>
    </div></div>`;
  $("#toHome").onclick = () => go({ view: "home" });
  $("#crHome") && ($("#crHome").onclick = () => go({ view: "home" }));
  $("#themeBtn").onclick = toggleTheme;
  paintThemeBtn();
  refreshClaude();
}
function toggleTheme() {
  const cur = document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const next = cur === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem("cv-theme", next); } catch {}
  paintThemeBtn();
  VIEWS[ST.route.view]?.theme?.();
}
function paintThemeBtn() {
  const dark = (document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")) === "dark";
  const b = $("#themeBtn"); if (b) b.innerHTML = dark ? ICON.sun : ICON.moon;
}
