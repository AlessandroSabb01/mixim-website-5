"""Import-Rama ads, version 2: real music instead of the synthesized bed.
Picks the section of a Mixkit track (Mixkit Stock Music Free License, online ads allowed) that is energetic and whose
beats fall closest to the film's big moments (scene cuts, the drop, the end-card hit), then trims it to the film length.
  v1 "Tech House vibes" (Mixkit #130) · v2 "Hazy After Hours" (#132) · v3 "Techno Fights" (#171)
Usage: FILM_V=1 FILM_LEN=15 python3 audio/music6m.py out.wav
"""
import json
import os
import sys
import subprocess
import numpy as np
import librosa

V = os.environ.get("FILM_V", "1")
LEN = float(os.environ.get("FILM_LEN", "15"))
SR = 48000
ROOT = os.path.join(os.path.dirname(__file__), "..")
TRACK = {"1": 130, "2": 132, "3": 171}[V]
NAMES = {130: '"Tech House vibes" by Alejandro Magaña (A. M.), Mixkit #130', 132: '"Hazy After Hours" by Alejandro Magaña (A. M.), Mixkit #132', 171: '"Techno Fights" by Alejandro Magaña (A. M.), Mixkit #171'}
src = os.path.join(ROOT, "assets", "imp-ads", "music", f"mixkit-{TRACK}.mp3")
if not os.path.exists(src):
    os.makedirs(os.path.dirname(src), exist_ok=True)
    subprocess.run(["curl", "-fsSL", "-o", src, f"https://assets.mixkit.co/music/{TRACK}/{TRACK}.mp3"], check=True)

# ---- the film's big moments (same formulas as film6/film.js) ----
OFF = 0.15
WORDS = json.load(open(os.path.join(ROOT, "assets", "imp-ads", "words6.json")))[V]
WT = [t + OFF for _, t in WORDS]; TOK = [w.replace(" :", "") for w, _ in WORDS]
def wt(tok, nth=0):
    c = -1
    for i, x in enumerate(TOK):
        if x == tok:
            c += 1
            if c == nth: return WT[i]
    raise KeyError(tok)
w = lambda i: WT[i]
if V == "1":
    HITS = [w(3) - 0.07, w(6) - 0.16, w(11) - 0.12, w(22) - 0.2, w(30) - 0.24]
elif V == "2":
    HITS = [wt("Chaises") - 0.1, wt("on") - 0.12, wt("Un") - 0.12, wt("Prends") - 0.24]
else:
    HITS = [wt("Ce") - 0.12, wt("Import-Rama") - 0.12, wt("on") - 0.12, wt("Commerçant,") - 0.12, wt("envoie-nous") - 0.12, wt("Toi,") - 0.12, wt("Premier") - 0.24]
END = HITS[-1] + 0.08                          # the logo hit weighs double

# ---- beats from the kick (low end), so the grid sits on the downbeat, not the off-beat ----
y, sr = librosa.load(src, sr=22050, mono=True)
low = librosa.effects.preemphasis(y, coef=-0.97)
oenv = librosa.onset.onset_strength(y=librosa.effects.preemphasis(y, coef=-0.97), sr=sr, fmax=180, n_mels=16)
_, beats = librosa.beat.beat_track(onset_envelope=oenv, sr=sr, units="time")
rms = librosa.feature.rms(y=y, frame_length=4096, hop_length=1024)[0]; rt = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=1024)
per = float(np.median(np.diff(beats)))
dur = len(y) / sr

def err(off):
    e = []
    for h in HITS + [END]:
        bt = beats[np.argmin(np.abs(beats - (off + h)))]
        e.append(abs(bt - (off + h)))
    e[-1] *= 2
    return float(np.mean(e))

def energy(off):
    m = (rt >= off) & (rt < off + LEN)
    head = (rt >= off) & (rt < off + 2.0)
    return float(np.mean(rms[m])), float(np.mean(rms[head]))

best = None
rmax = rms.max()
for off in np.arange(4.0, dur - LEN - 1.0, 0.02):
    e = err(off); en, hd = energy(off)
    score = en / rmax + 0.5 * hd / rmax - 2.5 * e / per
    if best is None or score > best[0]:
        best = (score, off, e, en / rmax)
_, OFFS, E, EN = best

# ---- cut, fade, write ----
raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{OFFS:.3f}", "-t", f"{LEN:.3f}", "-i", src, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
x = np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)
n = int(LEN * SR)
if len(x) < n: x = np.vstack([x, np.zeros((n - len(x), 2))])
x = x[:n]
fi, fo = int(0.03 * SR), int(0.6 * SR)
x[:fi] *= np.linspace(0, 1, fi)[:, None]
x[-fo:] *= (np.linspace(1, 0, fo) ** 2)[:, None]
x /= np.abs(x).max() * 1.05
import soundfile as sf
out = sys.argv[1] if len(sys.argv) > 1 else f"build/music6-v{V}.wav"
sf.write(out, x.astype(np.float32), SR, subtype="FLOAT")
json.dump({"track": NAMES[TRACK], "license": "Mixkit Stock Music Free License (online ads allowed; no Content ID)", "offset_s": round(float(OFFS), 3),
           "mean_hit_error_ms": round(float(E) * 1000, 1), "energy": round(float(EN), 3)}, open(out.replace(".wav", ".json"), "w"), indent=1)
print(f"music6m v{V}: {NAMES[TRACK]} from {OFFS:.2f}s, hits off the beat by {E*1000:.0f} ms on average, energy {EN:.2f}")
