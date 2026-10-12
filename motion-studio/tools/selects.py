"""Score every b-roll clip (motion x colour) and pick its best 1.5 s window -> assets/broll/selects.json"""
import json, subprocess, numpy as np
W, H, FPS, WIN = 54, 96, 10, 15
names = dict(l.rstrip("\n").split("\t") for l in open("assets/broll/index.tsv"))
out = []
for slug, name in sorted(names.items()):
    f = f"assets/broll/{slug}.mp4"
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-vf", f"fps={FPS},scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
    v = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3).astype(float)
    n = len(v)
    motion = np.r_[0, np.abs(np.diff(v.mean(3), axis=0)).mean((1, 2))]
    cut = motion > np.percentile(motion, 97) * 1.0  # hard cuts read as flashes: penalise
    colour = v.std(3).mean((1, 2))
    light = v.mean((1, 2, 3))
    s = np.clip(motion, 0, 25) * (colour / 30) * np.clip(light / 70, 0.3, 1.2) - cut * 8
    best, bi = -1e9, 0
    for i in range(int(0.8 * FPS), n - WIN):  # skip the opening hook card
        sc = s[i:i + WIN].mean()
        if sc > best: best, bi = sc, i
    out.append({"slug": slug, "name": name, "dur": round(n / FPS, 1), "in": round(bi / FPS, 2), "out": round((bi + WIN) / FPS, 2), "score": round(float(best), 2)})
out.sort(key=lambda x: -x["score"])
json.dump(out, open("assets/broll/selects.json", "w"), indent=1)
for x in out: print(x)
