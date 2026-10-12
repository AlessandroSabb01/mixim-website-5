// node render.mjs [--format 9x16|1x1|16x9|all] [--contact] [--sub 4] [--fps 30] [--skip-audio] [--from s --to s] [--out name]
// 1) score (audio/music.py) -> measured beat grid (audio/beats.py -> beats.json)
// 2) film/index.html exposes window.seek(t) and window.CUES -> SFX mixed on the grid, -14 LUFS (audio/mix.py)
// 3) frames: seek + screenshot (sub-frames averaged for a 180-degree shutter) -> ffmpeg H.264 yuv420p CRF 16
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn, execFileSync } from "node:child_process";

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf("--" + k); return i < 0 ? d : args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true; };
const FORMATS = { "9x16": [1080, 1920], "1x1": [1080, 1080], "16x9": [1920, 1080] };
const fmtArg = opt("format", "9x16");
const formats = fmtArg === "all" ? Object.keys(FORMATS) : String(fmtArg).split(",");
const FPS = +opt("fps", 30), SUB = +opt("sub", 4), SHUTTER = 0.5;
const CONTACT = !!opt("contact", false);
const FILM = String(opt("film", "film"));          // film | film2
const V2 = FILM === "film2";
const SCORE = V2 ? "audio/music2.py" : "audio/music.py", LEN = V2 ? 30 : 20;
const TAG = V2 ? "-v2" : "";
const MUSIC = `build/music${V2 ? 2 : ""}.wav`, BEATS = V2 ? "beats2.json" : "beats.json", MIX = `build/mix${TAG}.wav`, CUESF = `build/cues${TAG}.json`;
process.env.FILM_LEN = String(LEN);
const BUILD = path.join(ROOT, "build"), OUT = path.join(ROOT, "out");
fs.mkdirSync(BUILD, { recursive: true }); fs.mkdirSync(OUT, { recursive: true });
const run = (cmd, a) => { const r = execFileSync(cmd, a, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); if (r.trim()) console.log(r.trim()); };

// ---------- static server (fetch() and fonts need http, not file://) ----------
const MIME = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".webp": "image/webp", ".css": "text/css" };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": MIME[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const BASE = `http://127.0.0.1:${server.address().port}`;

// ---------- audio: score + measured grid ----------
if (!opt("skip-audio", false)) {
  console.log("score…"); run("python3", [SCORE, MUSIC]);
  console.log("beat grid…"); run("python3", ["audio/beats.py", MUSIC, BEATS]);
}

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--force-color-profile=srgb", "--disable-lcd-text", "--font-render-hinting=none"] });

async function openFilm(w, h) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => console.error("page error:", e.message));
  page.on("console", (m) => { if (m.type() === "error") console.error("console:", m.text()); });
  await page.goto(`${BASE}/${FILM}/index.html?w=${w}&h=${h}`);
  const info = await page.evaluate(() => window.ready);
  const cdp = await page.context().newCDPSession(page);
  const shot = async (t) => {
    await page.evaluate((t) => window.seek(t), t);
    const { data } = await cdp.send("Page.captureScreenshot", { format: "png", optimizeForSpeed: true });
    return Buffer.from(data, "base64");
  };
  return { page, info, shot };
}

// ---------- sound: cues from the film -> mix ----------
let mixed = false;
async function ensureMix(film) {
  if (mixed || opt("skip-audio", false)) return;
  const cues = await film.page.evaluate(() => window.CUES);
  fs.writeFileSync(path.join(ROOT, CUESF), JSON.stringify(cues, null, 1));
  console.log(`mix (${cues.length} cues)…`);
  run("python3", ["audio/mix.py", MUSIC, BEATS, CUESF, MIX]);
  mixed = true;
}

for (const f of formats) {
  const [w, h] = FORMATS[f];
  const film = await openFilm(w, h);
  console.log(`${f}: ${w}x${h} ${film.info.FMT}`);
  await ensureMix(film);
  const beats = JSON.parse(fs.readFileSync(path.join(ROOT, BEATS))).beats;

  if (CONTACT) {
    // one frame per beat, sampled 0.4 beat after the hit (once the move has landed)
    const dir = path.join(BUILD, `contact${TAG}-${f}`); fs.mkdirSync(dir, { recursive: true });
    const per = beats[1] - beats[0];
    const scenes = V2 ? (b) => (b < 6 ? "Hook" : b < 8 ? "Voici comment" : b < 12 ? "Burst" : b < 18 ? "Agence" : b < 30 ? "Process" : b < 33 ? "Explosion" : b < 42 ? "Résultats" : b < 44 ? "7,5 M+" : b < 54 ? "Formulaire" : "Logo") : (b) => (b < 6 ? "Hook" : b < 12 ? "Produit" : b < 18 ? "01 Scroll" : b < 24 ? "02 Plateformes" : b < 30 ? "03 Engagement" : b < 34 ? "Chiffre" : "Logo");
    const cells = [];
    const strip = opt("strip", null);   // --strip from,to,step : dense filmstrip to judge motion
    const times = strip ? (() => { const [a, z, st] = String(strip).split(",").map(Number); const r = []; for (let x = a; x < z - 1e-9; x += st) r.push(x); return r; })() : beats.map((b) => b + 0.4 * per);
    for (let b = 0; b < times.length; b++) {
      const t = times[b];
      fs.writeFileSync(path.join(dir, `b${String(b).padStart(2, "0")}.png`), await film.shot(t));
      cells.push({ b, t, s: strip ? "" : scenes(b) });
    }
    const cols = f === "16x9" ? 5 : V2 ? 10 : 8, cw = f === "16x9" ? 384 : f === "1x1" ? 260 : 216;
    const ch = Math.round((cw * h) / w);
    const sheet = await browser.newPage({ viewport: { width: cols * (cw + 12) + 12, height: 400 }, deviceScaleFactor: 1 });
    const html = `<html><head><style>@font-face{font-family:M;src:url(${BASE}/assets/fonts/GeistMono-latin.woff2)}
      body{margin:0;background:#111;color:#bbb;font:12px M;padding:12px}
      .g{display:grid;grid-template-columns:repeat(${cols},${cw}px);gap:12px}
      .c img{width:${cw}px;height:${ch}px;display:block;border-radius:4px} .c div{padding:4px 0 0} b{color:#fff;font-weight:400}</style></head>
      <body><div class=g>${cells.map((c) => `<div class=c><img src="${BASE}/build/contact${TAG}-${f}/b${String(c.b).padStart(2, "0")}.png"><div><b>b${c.b}</b> ${c.t.toFixed(2)}s · ${c.s}</div></div>`).join("")}</div></body></html>`;
    await sheet.setContent(html, { waitUntil: "networkidle" });
    await sheet.evaluate(() => document.fonts.ready);
    const sheetName = strip ? `strip${TAG}-${f}.png` : `contact${TAG}-${f}.png`;
    await sheet.screenshot({ path: path.join(strip ? BUILD : OUT, sheetName), fullPage: true });
    await sheet.close();
    console.log(`  -> ${strip ? "build" : "out"}/${sheetName}`);
    await film.page.close();
    continue;
  }

  // ---------- video ----------
  const from = +opt("from", 0), to = +opt("to", LEN);
  const n0 = Math.round(from * FPS), n1 = Math.round(to * FPS);
  const name = opt("out", `creation-virale${TAG}-${f}`);
  const outFile = path.join(OUT, `${name}.mp4`);
  const vf = SUB > 1 ? [`tmix=frames=${SUB}`, `select='eq(mod(n\\,${SUB})\\,${SUB - 1})'`, `setpts=N/(${FPS}*TB)`] : [`setpts=N/(${FPS}*TB)`];
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error",
    "-f", "image2pipe", "-c:v", "png", "-framerate", String(FPS * SUB), "-i", "-",
    ...(fs.existsSync(path.join(ROOT, MIX)) ? ["-ss", String(from), "-t", String(to - from), "-i", path.join(ROOT, MIX)] : []),
    "-vf", [...vf, "format=yuv420p"].join(","), "-r", String(FPS),
    "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", "-profile:v", "high", "-movflags", "+faststart",
    "-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-shortest", outFile], { stdio: ["pipe", "inherit", "inherit"] });
  const t0 = Date.now();
  for (let n = n0; n < n1; n++) {
    for (let s = 0; s < SUB; s++) {
      const t = n / FPS + (SUB > 1 ? ((s + 0.5) / SUB - 0.5) * (SHUTTER / FPS) : 0);
      const buf = await film.shot(t);
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    }
    if ((n - n0) % 60 === 0) process.stdout.write(`  ${f} frame ${n}/${n1} (${((Date.now() - t0) / 1000).toFixed(0)}s)\n`);
  }
  ff.stdin.end();
  await new Promise((r, j) => ff.on("close", (c) => (c === 0 ? r() : j(new Error("ffmpeg exit " + c)))));
  console.log(`  -> ${path.relative(ROOT, outFile)} in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  await film.page.close();
}
await browser.close();
server.close();
