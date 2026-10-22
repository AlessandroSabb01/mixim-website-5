/* ===================== Home: two doors, projects, requests in flight ===================== */
const REQ_LABEL = { corrections: "Corrections", render: "Final render", brief: "New video brief", changes: "Preview changes", hooks: "Hook lab", footage: "AI footage" };
const REQ_STEPS = ["Sent", "Working", "Preview", "Approved", "Rendered"];
const reqStep = (s) => ({ sent: 0, working: 1, preview_ready: 2, approved: 3, rendering: 3, done: 4, failed: 1 }[s] ?? 0);
const reqStatusPill = (s) => ({
  sent: `<span class="pill open"><i></i>Sent</span>`, working: `<span class="pill prog"><i></i>Working</span>`,
  preview_ready: `<span class="pill check"><i></i>Preview ready</span>`, approved: `<span class="pill prog"><i></i>Rendering</span>`,
  rendering: `<span class="pill prog"><i></i>Rendering</span>`, done: `<span class="pill done"><i></i>Delivered</span>`, failed: `<span class="pill"><i></i>Needs attention</span>`,
}[s] || `<span class="pill">${esc(s)}</span>`);

VIEWS.home = {
  enter() { this.render(); },
  update() { this.render(); },
  render() {
    const root = $("#view");
    const projects = ST.projects;
    const flying = projects.flatMap((p) => requestsOf(p.id).filter((r) => r.status !== "done").map((r) => ({ ...r, p })))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 6);
    const totalOpen = projects.reduce((n, p) => n + commentsOf(p.id).filter((c) => c.status === "open").length, 0);

    const projectCards = projects.map((p) => {
      const vs = versionsOf(p.id), lv = vs[vs.length - 1];
      const posters = vs.slice(-3).map((v) => v.posterAssetId).filter(Boolean);
      while (posters.length && posters.length < 3) posters.unshift(posters[0]);
      const cs = commentsOf(p.id);
      const open = cs.filter((c) => c.status === "open").length, prog = cs.filter((c) => c.status === "in_progress").length;
      return `<button class="pcard" data-pid="${esc(p.id)}">
        <div class="art dotted">${posters.length ? posters.map((id) => `<img src="${blobUrl(id)}" alt="" loading="lazy">`).join("") : `<div class="empty"><b>${esc(p.status === "briefing" ? "Brief sent" : "No version yet")}</b><span>${p.status === "briefing" ? "Claude is building the 30-frame preview." : "Versions appear here."}</span></div>`}</div>
        <div class="meta">
          <div class="row"><span class="eyebrow">${esc(p.client || "Création Virale")} · ${esc(p.format || "9:16")}</span>${lv ? `<span class="eyebrow">${ago(p.updatedAt)}</span>` : ""}</div>
          <h3>${esc(p.name)}</h3>
          <div class="row"><div class="vchips">${vs.map((v) => `<span class="${v === lv ? "cur" : ""}">${esc(v.label || "v" + v.n)}</span>`).join("") || `<span>brief</span>`}</div>
          <div class="stats"><span><b class="num">${open}</b> open</span><span><b class="num">${prog}</b> in correction</span></div></div>
        </div></button>`;
    }).join("");

    root.innerHTML = `<main class="wrap home">
      <section class="hero">
        <div>
          <span class="eyebrow">Motion design · review room</span>
          <h1 style="margin-top:18px">Every frame,<em>reviewed.</em></h1>
          <p>Start a new motion video from a brief, or open a past cut and mark it up frame by frame. Your comments, drawings and approvals go straight to Claude, and every version stays here.</p>
        </div>
        <div class="flow" aria-label="How a video moves through the studio">
          <div><span class="n">01</span><b>Brief</b><span>Style, hooks, trend audio, AI shots</span></div>
          <div><span class="n">02</span><b>5 hooks + 30 key frames</b><span>Pick the opening, mark up the frames</span></div>
          <div><span class="n">03</span><b>Final render</b><span>Review it, correct, version up</span></div>
        </div>
      </section>
      <section class="doors">
        <button class="door blue" id="doorCreate">
          <div class="door-art" aria-hidden="true"><i></i><i></i><i></i></div>
          <div><div class="eyebrow">New</div><h2>Create a new video</h2><p>Build the brief from tiles: style, hooks, trend-matched music, captions, AI footage and brand. Claude answers with 5 hooks and 30 key frames.</p></div>
          <span class="go">${ICON.go}</span>
        </button>
        <button class="door" id="doorReview">
          <div class="door-tl" aria-hidden="true"><div class="t"><i style="left:18%;background:var(--accent)"></i><i style="left:46%;background:var(--amber)"></i><i style="left:80%;background:var(--green)"></i></div><div class="t" style="width:70%"></div></div>
          <div><div class="eyebrow">${projects.length ? `${plural(projects.length, "project")} · ${plural(totalOpen, "open comment")}` : "Review"}</div><h2>Review a past video</h2><p>Scrub on the beat grid, pause, draw on the frame and comment. Compare versions side by side.</p></div>
          <span class="go">${ICON.go}</span>
        </button>
      </section>
      <section id="projects">
        <div class="sec-h"><h2>Projects</h2><span class="eyebrow">${plural(projects.length, "project")}</span></div>
        ${projects.length ? `<div class="projects">${projectCards}</div>` :
          `<div class="card empty"><b>${CAP.db ? (ST.booted ? "No projects yet" : "Loading the studio…") : "Open on claude.ai to load your projects"}</b><span>${CAP.db ? "Create a new video, or ask Claude to add a past one." : "Projects, versions and comments live in this artifact's database."}</span></div>`}
      </section>
      <section id="library"><div class="sec-h"><h2>Style library</h2><span class="eyebrow">${plural(ST.styles.length, "recipe")}</span></div>
        ${ST.styles.length ? `<div class="styles">${ST.styles.map(styleCard).join("")}</div>` : `<div class="card empty"><b>No saved styles yet</b><span>Press “Save style” on any video or brief. The full recipe (look, motion, music, sound, captions and hooks) becomes a tile in the Brief Builder.</span></div>`}
      </section>
      ${flying.length ? `<section><div class="sec-h"><h2>With Claude</h2><span class="eyebrow">${plural(flying.length, "request")} in flight</span></div>
        <div class="inflight">${flying.map((r) => `<button class="req-row" data-pid="${esc(r.p.id)}" data-tab="requests">
          <span class="ic">${r.type === "hooks" ? ICON.hook : r.type === "brief" ? ICON.wand : r.type === "render" ? ICON.film : ICON.send}</span>
          <span><b>${esc(REQ_LABEL[r.type] || "Request")} · ${esc(r.p.name)}</b><small>${esc(r.versionLabel || "")}${r.commentIds?.length ? ` · ${plural(r.commentIds.length, "comment")}` : ""} · ${ago(r.createdAt)}</small></span>
          ${reqStatusPill(r.status)}</button>`).join("")}</div></section>` : ""}
    </main>`;
    $("#doorCreate").onclick = () => go({ view: "create" });
    bindStyleCards($("#library"));
    $("#doorReview").onclick = () => { if (projects.length === 1) go({ view: "project", pid: projects[0].id }); else $("#projects").scrollIntoView({ behavior: "smooth" }); };
    $$("[data-pid]", root).forEach((b) => (b.onclick = () => { VIEWS.project.pendingTab = b.dataset.tab || null; go({ view: "project", pid: b.dataset.pid }); }));
  },
};
