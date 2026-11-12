"""film7 (Création Virale 15 s, 3D): cut the client / team clips into JPEG sequences -> assets/broll/f7/<id>/0001.jpg, f7.json"""
import json, os, subprocess
S = {s["slug"]: s for s in json.load(open("assets/broll/selects.json"))}
T0 = {"t1": 1.0, "t2": 3.0, "t3": 2.0, "t4": 1.5, "t5": 0.8, "t6": 1.0, "09": 0.3, "01": 0.5}
HERO = ["t4", "t5", "19", "06"]; RES = ["03", "10"]
WALL = ["02", "07", "09", "11", "12", "13", "15", "16", "17", "t2", "t3"]
U = {}
def add(k, slug, dur, w, h): U[k] = {"slug": slug, "start": T0.get(slug, S[slug]["in"]), "dur": dur, "w": w, "h": h}
for i, s in enumerate(HERO): add(f"hero{i}", s, 3.2, 720, 1280)
for i, s in enumerate(RES): add(f"res{i}", s, 3.0, 720, 1280)
for i, s in enumerate(WALL): add(f"wall{i}", s, 4.6, 360, 640)
for k, u in U.items():
    d = f"assets/broll/f7/{k}"; os.makedirs(d, exist_ok=True)
    for f in os.listdir(d): os.remove(os.path.join(d, f))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(u["start"]), "-t", str(u["dur"]), "-i", f"assets/broll/{u['slug']}.mp4",
                    "-vf", f"fps=30,scale={u['w']}:{u['h']}:force_original_aspect_ratio=increase,crop={u['w']}:{u['h']}", "-q:v", "3", f"{d}/%04d.jpg"], check=True)
    u["frames"] = len(os.listdir(d))
json.dump(U, open("assets/broll/f7.json", "w"), indent=1)
print({k: u["frames"] for k, u in U.items()})
