"""Import-Rama ads, version 2 mix: real recorded sounds instead of synthesized ones.
Every film cue gets one sound from the CC0 library of the sound-effects skill (.agents/skills/sound-effects/sfx),
takes rotated per category so repeats don't sound robotic. Priority voice > SFX > music: the Mixkit bed sits ~9 dB
under the voice and ducks 7 dB more while he speaks; SFX sit ~10 dB under the voice. Master -14 LUFS, true peak < -1.5 dBTP.
Usage: VO_FILE=... VO_OFF=0.15 python3 audio/mix6.py build/music6m-v1.wav beats.json build/cues.json build/mix.wav
"""
import json
import os
import subprocess
import sys
import numpy as np
import pyloudnorm as pyln
from scipy.signal import resample_poly
from dsp import SR, n, place, db, limiter, write_wav

music_path, _beats, cues_path, out_path = sys.argv[1:5]
ROOT = os.path.join(os.path.dirname(__file__), "..")
LIB = os.path.join(ROOT, ".agents", "skills", "sound-effects", "sfx")
MAN = json.load(open(os.path.join(LIB, "manifest.json")))


def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)


music = load(music_path)
cues = json.load(open(cues_path))

# film cue type -> (library category, level dB, max length s)
MAP = {"slam": ("pop", -13, 0.35), "pop": ("pop", -11, 0.35), "thump": ("impact", -9, 1.2), "impact": ("impact", -7, 1.2),
       "zip": ("whoosh", -15, 0.7), "air": ("transition", -13, 1.4), "whoosh": ("whoosh", -12, 1.3), "tap": ("tick", -17, 0.2),
       "key": ("click", -15, 0.2), "glint": ("ui-blip", -18, 0.6), "sparkle": ("ding", -19, 1.2), "shimmer": ("ding", -17, 1.5),
       "bloom": ("ding", -14, 1.6)}
pool = {}
kit = {e["category"]: e for e in MAN["default_kit"] if e.get("bundled")}
for cat in set(c for c, _, _ in MAP.values()):
    files = [e for e in MAN["bundled"] if e["category"] == cat]
    if cat in kit:
        files = [kit[cat]] + [e for e in files if e["file"] != kit[cat]["file"]]
    pool[cat] = files
cache, used, turn, last = {}, {}, {}, {}
sfx = np.zeros_like(music)
for c in cues:
    cat, lv, mx = MAP.get(c["type"], ("pop", -14, 0.35))
    t = c["t"]
    if t - last.get(cat, -9) < 0.07:          # never stack two of the same sound inside 70 ms
        continue
    last[cat] = t
    cand = [e for e in pool[cat] if e.get("duration_s", 0.3) <= mx + 0.3] or pool[cat]
    k = turn.get(cat, 0); turn[cat] = k + 1
    e = cand[0] if k % 3 == 0 else cand[(k // 3 + k) % len(cand)]     # the kit take most often, alternates in between
    f = os.path.join(LIB, e["file"])
    if f not in cache:
        s = load(f); L = min(len(s), n(mx));
        s = s[:L].copy(); fo = min(L, n(0.04)); s[-fo:] *= np.linspace(1, 0, fo)[:, None]
        cache[f] = s / (np.abs(s).max() + 1e-9)
    s = cache[f]
    p = c.get("pan", 0); a = (p + 1) * np.pi / 4
    s = s * np.array([np.cos(a), np.sin(a)]) * np.sqrt(2)
    lead = 0.03 if cat in ("whoosh", "transition") else 0.0      # air moves start a hair early
    place(sfx, s * db(lv) * c.get("gain", 1) / 0.6, t - lead)
    used[e["file"]] = e

meter = pyln.Meter(SR)
vtrack = np.zeros_like(music)
if os.environ.get("VO_FILE"):
    place(vtrack, load(os.environ["VO_FILE"]), float(os.environ.get("VO_OFF", "0")))
lv = meter.integrated_loudness(vtrack)
music = music * db(lv - 9 - meter.integrated_loudness(music))
sfx = sfx * db(lv - 10 - meter.integrated_loudness(sfx))
e = np.abs(vtrack).max(axis=1); kk = n(0.12); e = np.convolve(e, np.ones(kk) / kk, mode="same")
speak = np.clip(e / (e.max() * 0.08 + 1e-9), 0, 1)
g = np.zeros_like(speak); cur = 0.0
for i in range(0, len(speak), 64):
    tgt = speak[i]; a = 64 / (n(0.04) if tgt > cur else n(0.3)); cur += (tgt - cur) * min(1, a); g[i:i + 64] = cur
mix = music * db(-7 * g)[:, None] + sfx * db(-3 * g)[:, None] + vtrack


def true_peak_db(x):
    return 20 * np.log10(np.abs(resample_poly(x, 4, 1, axis=0)).max() + 1e-12)


y = mix.copy()
for _ in range(4):
    y = y * db(-14.0 - meter.integrated_loudness(y))
    y = limiter(y, ceiling_db=-2.0)
lufs, tp = meter.integrated_loudness(y), true_peak_db(y)
write_wav(out_path, y)
mj = music_path.replace(".wav", ".json")
mus = json.load(open(mj)) if os.path.exists(mj) else {}
with open(out_path.replace(".wav", "-CREDITS.txt"), "w") as fh:
    fh.write(f"Music: {mus.get('track', '?')}, {mus.get('license', '?')}\nSound effects (CC0 1.0, credit optional):\n")
    for f, e in sorted(used.items()):
        fh.write(f"- {e.get('attribution', e.get('credit', f))} {e.get('source_url', '')}\n")
print(f"mix6: {lufs:.2f} LUFS, true peak {tp:.2f} dBTP, {len(cues)} cues, {len(used)} distinct CC0 sounds, music: {mus.get('track', '?')}")
