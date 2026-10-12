"""Cut each b-roll use into a JPEG frame sequence (30 fps) so the film can show frame n at time t deterministically.
Manifest: assets/broll/uses.json  ->  assets/broll/frames/<id>/0001.jpg ..."""
import json, os, subprocess
S = {s["slug"]: s for s in json.load(open("assets/broll/selects.json"))}
def at(slug, dur, w, h, start=None): return {"slug": slug, "start": S[slug]["in"] if start is None else start, "dur": dur, "w": w, "h": h}
U = {}
for i, s in enumerate(["17", "01", "03", "16", "13", "12"]): U[f"hook{i}"] = at(s, 3.4, 360, 640)
for i, s in enumerate(["07", "11", "09", "22", "18", "20", "19", "10"]): U[f"burst{i}"] = at(s, 0.5, 720, 1280)
U["hero"] = at("02", 3.4, 540, 960)
for k, s in zip(["strat", "prod", "mont", "diff"], ["23", "14", "06", "21"]): U[f"step-{k}"] = at(s, 3.4, 540, 960)
for i, s in enumerate(sorted(S)): U[f"tile{i}"] = at(s, 2.0, 180, 320)
U["boom"] = at("05", 2.0, 720, 1280)
for k, s in zip(["sushi", "chalet", "mex"], ["24", "04", "15"]): U[f"res-{k}"] = at(s, 1.8, 540, 960)
os.makedirs("assets/broll/frames", exist_ok=True)
for k, u in U.items():
    d = f"assets/broll/frames/{k}"; os.makedirs(d, exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(u["start"]), "-t", str(u["dur"]), "-i", f"assets/broll/{u['slug']}.mp4",
                    "-vf", f"fps=30,scale={u['w']}:{u['h']}:force_original_aspect_ratio=increase,crop={u['w']}:{u['h']}", "-q:v", "3", f"{d}/%04d.jpg"], check=True)
    u["frames"] = len(os.listdir(d))
json.dump(U, open("assets/broll/uses.json", "w"), indent=1)
print(len(U), "uses", sum(u["frames"] for u in U.values()), "frames")
