"""Measure the beat grid of the music stem and write beats.json.

librosa's tracker gives raw beat times; we fit a straight grid t_k = t0 + k*period through them
(least squares), so every beat index 0..N-1 has a measured time even where the arrangement is
sparse (the hook and the break). Usage: python3 audio/beats.py build/music.wav beats.json
"""
import json
import sys
import numpy as np
import librosa

src, dst = sys.argv[1], sys.argv[2]
y, sr = librosa.load(src, sr=44100, mono=True)
hop = 128
onset = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
tempo, frames = librosa.beat.beat_track(onset_envelope=onset, sr=sr, hop_length=hop, start_bpm=120, tightness=400)
raw = librosa.frames_to_time(frames, sr=sr, hop_length=hop)
tempo = float(np.atleast_1d(tempo)[0])
period0 = 60 / tempo
k = np.round((raw - raw[0]) / period0)
period, t0 = np.polyfit(k, raw, 1)
# shift so index 0 is the first beat at or after t=0 within half a period
t0 = t0 - np.floor(t0 / period + 0.25) * period
duration = len(y) / sr
count = int(np.floor((duration - t0) / period)) + 1
grid = [round(t0 + i * period, 5) for i in range(count)]
resid = raw - (t0 + np.round((raw - t0) / period) * period)
json.dump({"source": src, "tracker_bpm": round(tempo, 3), "bpm": round(60 / period, 3), "t0": round(t0, 5),
           "period": round(period, 6), "raw": [round(x, 4) for x in raw], "beats": grid,
           "max_residual_ms": round(float(np.abs(resid).max() * 1000), 2)}, open(dst, "w"), indent=1)
print(f"tracker {tempo:.2f} bpm, fitted {60/period:.3f} bpm, t0={t0*1000:.1f} ms, {len(raw)} raw beats, "
      f"{count} grid beats, max residual {np.abs(resid).max()*1000:.1f} ms")
