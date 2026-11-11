// node tools/sections5.mjs -> film5/sections-v{1,2,3}{a,b,c}.json (scene timing + cues the score is written against)
import { chromium } from "playwright";
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const ROOT = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end(); } fs.createReadStream(p).pipe(r); });
await new Promise((res) => srv.listen(0, "127.0.0.1", res));
const br = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const pg = await br.newPage({ viewport: { width: 1080, height: 1920 } });
pg.on("pageerror", (e) => console.error("page error:", e.message));
for (const v of [1, 2, 3]) for (const k of "abc") {
  await pg.goto(`http://127.0.0.1:${srv.address().port}/film5/index.html?v=${v}&k=${k}`);
  await pg.evaluate(() => window.ready);
  const o = await pg.evaluate(() => ({ ...window.SECTIONS, cues: window.CUES.length, scenesText: window.SCENES }));
  fs.writeFileSync(path.join(ROOT, `film5/sections-v${v}${k}.json`), JSON.stringify(o, null, 1));
  console.log(`v${v}${k}: ${o.bpm} BPM, hook ends b${o.hookEnd}, end card b${o.end} (${(o.end * 60 / o.bpm).toFixed(2)} s), ${o.cues} cues`);
}
await br.close(); srv.close();
