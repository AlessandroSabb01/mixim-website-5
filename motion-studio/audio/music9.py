"""Music bed for the narrated Création Virale films (film9): the score of the matching text film (film5 v2 render,
downloaded from Frame.io to assets/cv9/ref-*.mp4), trimmed to the film length with a short fade, plus a
plain 0.5 s grid file for the contact sheets.
Usage: FILM_V=1 FILM_LEN=19.4 python3 audio/music9.py build/music9-v1.wav
"""
import json, os, subprocess, sys
V, L, out = os.environ.get("FILM_V", "1"), float(os.environ.get("FILM_LEN", "20")), sys.argv[1]
ROOT = os.path.join(os.path.dirname(__file__), "..")
ref = {"1": "ref-pourquoi", "2": "ref-quionest", "3": "ref-cequonfait"}[V]
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(ROOT, "assets/cv9", ref + ".mp4"), "-vn", "-ac", "2", "-ar", "48000",
                "-af", f"apad,atrim=0:{L},afade=t=out:st={L - 1.2}:d=1.2", out], check=True)
json.dump({"track": f"Création Virale text film score ({ref})", "license": "own production"}, open(out.replace(".wav", ".json"), "w"))
json.dump({"t0": 0, "period": 0.5, "beats": [round(i * 0.5, 3) for i in range(int(L * 2) + 1)]}, open(os.path.join(ROOT, f"beats9-v{V}.json"), "w"))
