/* ===================== boot ===================== */
(async function boot() {
  try { const th = localStorage.getItem("cv-theme"); document.documentElement.dataset.theme = th === "dark" ? "dark" : "light"; }
  catch { document.documentElement.dataset.theme = "light"; }
  go(routeFromHash(), false);
  const [db, assets, comments, downloads, user] = await Promise.all(["db", "assets", "comments", "downloads", "user"].map(use));
  Object.assign(CAP, { db, assets, comments, downloads, user });
  try { const w = await user?.can?.("data.write"); ST.canWrite = w !== false; } catch {}
  startData();
  refreshClaude();
  addEventListener("focus", () => refreshClaude());
  setInterval(() => { if (document.visibilityState === "visible") refreshClaude(); }, 60000);
  if (!db) { changed("projects"); VIEWS[ST.route.view]?.update?.("projects"); }
})();
