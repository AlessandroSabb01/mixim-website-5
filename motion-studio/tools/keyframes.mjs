// node tools/keyframes.mjs --film film4 --times 0.3,0.7,... --out dir [--w 720]
// Grabs exact stills of a film (window.seek(t)) for a Motion Studio key-frame review: JPEG, 9:16, review weight.
import { chromium } from "playwright";
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const ROOT = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const a = process.argv.slice(2), opt = (k, d) => { const i = a.indexOf("--" + k); return i < 0 ? d : a[i + 1]; };
const FILM = opt("film", "film4"), OUT = opt("out", "build/keyframes"), OW = +opt("w", 720);
const times = String(opt("times", "")).split(",").filter(Boolean).map(Number);
fs.mkdirSync(OUT, { recursive: true });
const MIME = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".css": "text/css" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { "content-type": MIME[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(r); });
await new Promise((res) => srv.listen(0, "127.0.0.1", res));
const br = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--force-color-profile=srgb", "--font-render-hinting=none"] });
const pg = await br.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: OW / 1080 });
pg.on("pageerror", (e) => console.error("page error:", e.message));
await pg.goto(`http://127.0.0.1:${srv.address().port}/${FILM}/index.html`);
await pg.evaluate(() => window.ready);
for (const [i, t] of times.entries()) {
  await pg.evaluate((t) => window.seek(t), t);
  const f = path.join(OUT, `${String(i + 1).padStart(2, "0")}.jpg`);
  await pg.screenshot({ path: f, type: "jpeg", quality: 84 });
}
await br.close(); srv.close();
console.log(`${times.length} key frames -> ${OUT}`);
