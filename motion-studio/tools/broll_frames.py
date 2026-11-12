"""Cut each b-roll use into a JPEG frame sequence (30 fps) so the film can show frame n at time t deterministically.
Manifest: assets/broll/uses.json  ->  assets/broll/frames/<id>/0001.jpg ..."""
import json, os, subprocess
S = {s["slug"]: s for s in json.load(open("assets/broll/selects.json"))}
def at(slug, dur, w, h, start=None): return {"slug": slug, "start": S[slug]["in"] if start is None else start, "dur": dur, "w": w, "h": h}
U = {}
T0 = {"t1": 1.0, "t2": 3.0, "t3": 2.0, "t5": 0.8, "t6": 1.0, "09": 0.3, "01": 0.5}   # team / short clips: start early so 3.4 s fits
def at2(slug, dur, w, h): return at(slug, dur, w, h, T0.get(slug))
# hook: six different client mandates (Mexicanos, Sushi X, Au Petit Chalet, Steak Avenue, Poulet Royal, Nacho Pub)
for i, s in enumerate(["06", "03", "10", "11", "16", "17"]): U[f"hook{i}"] = at2(s, 3.4, 540, 960)
for i, s in enumerate(["08", "02", "19", "13", "15", "05", "18", "12"]): U[f"burst{i}"] = at2(s, 0.5, 720, 1280)
U["hero"] = at2("t2", 3.4, 540, 960)
# process: the team in action (no single person), montage on a client edit
for k, s in zip(["strat", "prod", "mont", "diff"], ["t3", "t6", "07", "t1"]): U[f"step-{k}"] = at2(s, 3.4, 540, 960)
for i, s in enumerate(sorted(S)): U[f"tile{i}"] = at2(s, 2.0, 180, 320)
U["boom"] = at2("06", 2.0, 720, 1280)
# results: the real clients the numbers belong to
for k, s in zip(["sushi", "chalet", "mex"], ["03", "10", "05"]): U[f"res-{k}"] = at2(s, 1.8, 540, 960)
os.makedirs("assets/broll/frames", exist_ok=True)
for k, u in U.items():
    d = f"assets/broll/frames/{k}"; os.makedirs(d, exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(u["start"]), "-t", str(u["dur"]), "-i", f"assets/broll/{u['slug']}.mp4",
                    "-vf", f"fps=30,scale={u['w']}:{u['h']}:force_original_aspect_ratio=increase,crop={u['w']}:{u['h']}", "-q:v", "3", f"{d}/%04d.jpg"], check=True)
    u["frames"] = len(os.listdir(d))
json.dump(U, open("assets/broll/uses.json", "w"), indent=1)
print(len(U), "uses", sum(u["frames"] for u in U.values()), "frames")
