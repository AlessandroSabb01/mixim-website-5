"""Création Virale showreel v5: real music instead of the synthesized bed.
"Midnight Funk" by Michael Ramir C. (Mixkit #1147, Mixkit Stock Music Free License): funky pop, ~118 BPM.
Picks the beat-aligned 30 s window that is energetic from the first second and lifts hardest at the film's
"Et ça explose." moment (beat 30); the film re-times itself to this track's measured grid (beats3.json).
Usage: FILM_LEN=31 python3 audio/music3m.py build/music3m.wav
"""
import json, os, sys, subprocess
import numpy as np, librosa, soundfile as sf
LEN = float(os.environ.get("FILM_LEN", "31")); SR = 48000; TRACK = 1147
ROOT = os.path.join(os.path.dirname(__file__), "..")
src = os.path.join(ROOT, "assets", "imp-ads", "music", f"mixkit-{TRACK}.mp3")
if not os.path.exists(src):
    os.makedirs(os.path.dirname(src), exist_ok=True)
    subprocess.run(["curl", "-fsSL", "-o", src, f"https://assets.mixkit.co/music/{TRACK}/{TRACK}.mp3"], check=True)
y, sr = librosa.load(src, sr=22050, mono=True)
oenv = librosa.onset.onset_strength(y=y, sr=sr, fmax=180, n_mels=16)
_, beats = librosa.beat.beat_track(onset_envelope=oenv, sr=sr, units="time")
rms = librosa.feature.rms(y=y, frame_length=4096, hop_length=1024)[0]; rt = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=1024)
E_ = lambda a, b: float(np.mean(rms[(rt >= a) & (rt < b)])) if b > a else 0.0
best = None
for j in range(len(beats)):
    if j % 4: continue                                        # start on a bar
    o = beats[j]
    if o + LEN > len(y) / sr - 0.5: break
    if j + 30 >= len(beats): break
    drop = beats[j + 30]
    sc = E_(o, o + LEN) + 0.6 * E_(o, o + 2) + 0.8 * (E_(drop, drop + 3) - E_(drop - 3, drop))
    if best is None or sc > best[0]: best = (sc, o)
OFF = best[1]
raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{OFF:.3f}", "-t", f"{LEN:.3f}", "-i", src, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
x = np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64); n = int(LEN * SR)
if len(x) < n: x = np.vstack([x, np.zeros((n - len(x), 2))])
x = x[:n]; fi, fo = int(0.02 * SR), int(0.8 * SR)
x[:fi] *= np.linspace(0, 1, fi)[:, None]; x[-fo:] *= (np.linspace(1, 0, fo) ** 2)[:, None]; x /= np.abs(x).max() * 1.05
out = sys.argv[1] if len(sys.argv) > 1 else "build/music3m.wav"
sf.write(out, x.astype(np.float32), SR, subtype="FLOAT")
json.dump({"track": '"Midnight Funk" by Michael Ramir C., Mixkit #1147', "license": "Mixkit Stock Music Free License (online ads and social allowed; no Content ID)", "offset_s": round(float(OFF), 3)},
          open(out.replace(".wav", ".json"), "w"), indent=1)
print(f"music3m: Midnight Funk from {OFF:.2f}s")
