"""Création Virale v6: "Night Terrors" by Arulo (Mixkit #334, Mixkit Stock Music Free License), EDM, ~129 BPM.
Cuts the section build (4 beats) -> pre-drop silence (4 beats) -> drop (24 beats): the film's hook sits on the build,
"d'exploser." hangs in the silence and the wall of client reels lands on the drop. Ends on a hard stop at beat 32 with a reverb tail.
Usage: FILM_LEN=16 python3 audio/music7.py build/music7.wav
"""
import json, os, sys, subprocess
import numpy as np, librosa, soundfile as sf
from scipy.signal import fftconvolve
LEN = float(os.environ.get("FILM_LEN", "16")); SR = 48000; TRACK = 334
ROOT = os.path.join(os.path.dirname(__file__), "..")
src = os.path.join(ROOT, "assets", "imp-ads", "music", f"mixkit-{TRACK}.mp3")
if not os.path.exists(src):
    os.makedirs(os.path.dirname(src), exist_ok=True)
    subprocess.run(["curl", "-fsSL", "-o", src, f"https://assets.mixkit.co/music/{TRACK}/{TRACK}.mp3"], check=True)
y, sr = librosa.load(src, sr=22050, mono=True)
# tempo from the drop section (steady kick), then the exact drop = first strong low-end onset after the silent bar
seg = y[int(60 * sr):int(76 * sr)]
lo = librosa.onset.onset_strength(y=seg, sr=sr, fmax=160, n_mels=16, hop_length=128)
tempo, bf = librosa.beat.beat_track(onset_envelope=lo, sr=sr, hop_length=128, start_bpm=129, tightness=400)
bts = librosa.frames_to_time(bf, sr=sr, hop_length=128) + 60
per, t0 = np.polyfit(np.arange(len(bts)), bts, 1)
S = np.abs(librosa.stft(y, n_fft=1024, hop_length=128)); fr = librosa.fft_frequencies(sr=sr, n_fft=1024); rt = librosa.frames_to_time(np.arange(S.shape[1]), sr=sr, hop_length=128)
low = S[fr < 140].sum(0); m = (rt > 57.5) & (rt < 61.5); thr = 0.35 * low[(rt > 60) & (rt < 70)].max()
drop_raw = rt[m][np.argmax(low[m] > thr)]
drop = t0 + round((drop_raw - t0) / per) * per                  # snap to the fitted grid
OFF = drop - 8 * per
raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{OFF:.4f}", "-t", f"{LEN:.3f}", "-i", src, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
x = np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64); n = int(LEN * SR)
if len(x) < n: x = np.vstack([x, np.zeros((n - len(x), 2))])
x = x[:n]; x[:int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))[:, None]
# hard stop on beat 32, the last half beat rings out in a hall
e = int(32 * per * SR); fo = int(0.05 * SR)
tail_src = x[e - int(0.5 * per * SR):e].copy(); x[e:e + fo] *= np.linspace(1, 0, fo)[:, None]; x[e + fo:] = 0
rng = np.random.default_rng(7); L = int(1.3 * SR); tt = np.arange(L) / SR
ir = rng.standard_normal((L, 2)) * np.exp(-tt / 0.32)[:, None]; ir /= np.sqrt((ir ** 2).sum(0))
tail = np.stack([fftconvolve(tail_src[:, c], ir[:, c]) for c in range(2)], 1) * 0.22
a = e - len(tail_src); m_ = min(len(tail), n - a); x[a:a + m_] += tail[:m_] * np.linspace(0, 1, m_)[:, None].clip(0, 1) ** 0.3
x[-int(0.15 * SR):] *= np.linspace(1, 0, int(0.15 * SR))[:, None]
x /= np.abs(x).max() * 1.05
out = sys.argv[1] if len(sys.argv) > 1 else "build/music7.wav"
sf.write(out, x.astype(np.float32), SR, subtype="FLOAT")
json.dump({"track": '"Night Terrors" by Arulo, Mixkit #334', "license": "Mixkit Stock Music Free License (online ads and social allowed; no Content ID)", "offset_s": round(float(OFF), 3),
           "period": float(per), "bpm": round(60 / float(per), 3), "drop_s": round(float(8 * per), 4)}, open(out.replace(".wav", ".json"), "w"), indent=1)
# the film's grid comes from here (the silent bar would confuse a tracker run on the cut)
json.dump({"source": out, "bpm": round(60 / float(per), 3), "t0": 0.0, "period": round(float(per), 6), "beats": [round(i * float(per), 5) for i in range(int(LEN / per) + 1)]},
          open(os.path.join(ROOT, "beats7.json"), "w"), indent=1)
print(f"music7: Night Terrors from {OFF:.2f}s, {60/per:.2f} bpm, drop at {8*per:.3f}s (raw onset {drop_raw-OFF:.3f}s)")
