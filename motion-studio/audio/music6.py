"""Score: Import-Rama ads (film6). A short dark-techno bed in F minor at 120 BPM, the showreel's sound family, built
around a voice-over: sections follow the scene cuts of the film (seconds), the bed stays out of the voice's way
(mix.py sets it under the VO and ducks it while he speaks).
  v1  0-1.1 hook hits · 1.1-3.3 groove · 3.3-4.9 red build + roll · 4.9 drop on 新 · 8.4 list (lighter) · 11.3 logo hit + pad
Usage: FILM_V=1 FILM_LEN=14.5 FILM_BPM=120 python3 audio/music6.py out.wav
"""
import os
import sys
import numpy as np
from instruments import *

V = os.environ.get("FILM_V", "1")
B = BEAT
music, drums = buf(), buf()
duck = np.ones(len(music))
Fm, Db, Eb, Ab = [53, 56, 60], [49, 53, 56], [51, 55, 58], [48, 51, 56]
NB = int(LENGTH / B)
CUTS = {"1": dict(s2=1.12, s3=3.35, s4=5.03, s5=8.53, s6=11.23)}[V]
bof = lambda sec: int(round(sec / B))          # nearest beat to a time


def k(b, lv=1.0, sc=True):
    place(drums, kick_punch(lv, 0.42), b * B)
    if sc:
        i = n(b * B); d = 1 - 0.75 * np.exp(-np.arange(n(B)) / SR / 0.11); m = min(len(d), len(duck) - i)
        if m > 0:
            duck[i:i + m] = np.minimum(duck[i:i + m], d[:m])


def stab(t, ch, lv=0.15, op=2400, echo=True):
    place(music, chord_stab([p + 12 for p in ch], 0.2, lv, op), t)
    if echo:
        for j, g in enumerate((0.42, 0.2)):
            place(music, pan(chord_stab([p + 12 for p in ch], 0.18, lv * g, op * 0.7), (-0.5, 0.5)[j]), t + 0.75 * B * (j + 1))


def groove(b0, b1, bass=True, hats16=False, clap_=True, cut=900, root=29):
    for b in range(b0, b1):
        k(b, 0.95)
        place(drums, pan(hat(0.12, 0.06, 0.18), 0.2), (b + 0.5) * B)
        for s_ in ((0.25, 0.75) if hats16 else ()):
            place(drums, pan(hat(0.05, 0.012), -0.3), (b + s_) * B)
        if clap_ and b % 2 == 1:
            place(drums, clap(0.32), b * B)
        if bass:
            for s_, off in ((0.25, 0), (0.5, 0), (0.75, 12 if b % 4 == 3 else 0)):
                place(music, slap_bass(root + off, B / 4 * 0.8, 0.24, cut), (b + s_) * B)


# ---- hook: two hits on T'AS UN / RESTO? ----
for t_ in (0.13, 0.66):
    place(drums, kick_punch(1.0, 0.5), t_); stab(t_, Fm, 0.17, 2800, echo=False)
place(music, sub_drop(0.6, 0.9, 85, 34), 0.13)
for i in range(4):
    place(drums, pan(hat(0.06 + 0.02 * i, 0.015), 0.3 if i % 2 else -0.3), 0.75 + i * 0.09)

# ---- groove under the three products ----
b2, b3, b4, b5, b6 = (bof(CUTS[s]) for s in ("s2", "s3", "s4", "s5", "s6"))
groove(b2, b3, hats16=False)
for t_, ch in ((1.19, Fm), (1.97, Db), (2.87, Eb)):
    stab(t_, ch, 0.12)

# ---- red section: build (filtered bass up, 16ths, snare roll into the drop) ----
for b in range(b3, b4):
    k(b, 0.85)
    place(drums, pan(hat(0.1, 0.03), 0.2), (b + 0.5) * B)
    for s_ in (0.25, 0.75):
        place(drums, pan(hat(0.06, 0.01), -0.3), (b + s_) * B)
    for s_ in (0.25, 0.5, 0.75):
        place(music, slap_bass(29, B / 4 * 0.8, 0.2, 500 + 300 * (b - b3)), (b + s_) * B)
roll0 = CUTS["s4"] - 0.75
for i in range(12):
    place(drums, snap(0.05 + 0.03 * i), roll0 + i * 0.0625)
place(music, riser(0.8, 0.14, 500, 9000), CUTS["s4"] - 0.8)

# ---- drop on 新 / à la source / on s'occupe de tout ----
place(drums, crash(0.24), CUTS["s4"]); place(music, sub_drop(0.8, 1.2, 90, 32), CUTS["s4"])
groove(b4, b5, hats16=True, cut=1100)
for b in range(b4, b5, 2):
    stab(b * B + 0.75 * B, [Fm, Db, Ab, Eb][((b - b4) // 2) % 4], 0.11)

# ---- list / challenge: lighter, ticking; a hit on the "?" ----
for b in range(b5, b6):
    k(b, 0.7)
    place(drums, pan(hat(0.08, 0.02), 0.25), (b + 0.5) * B)
    if b % 2 == 0:
        place(drums, pan(snap(0.08), 0.4), (b + 0.75) * B)
place(music, sub_drop(0.6, 0.6, 90, 40), 10.88)
place(music, reverse_swell(0.5, 0.26), CUTS["s6"] - 0.5)

# ---- end card: the logo hit, a held chord and bells to the last frame ----
te = CUTS["s6"] + 0.08
place(drums, kick_punch(1.0, 0.5), te); place(drums, crash(0.3), te); place(music, sub_drop(0.9, 1.8, 80, 30), te)
tail = LENGTH - te
place(music, supersaw([41, 53, 56, 60, 65], tail, 1500, 5, 0.07, 0.2) * adsr(tail, 0.03, 1.2), te)
for b in range(bof(te) + 1, NB):
    if b % 2 == 0:
        k(b, 0.55, sc=False)
for j, m in enumerate([77, 80, 84, 89]):
    t = np.arange(n(1.3)) / SR
    bell = (sine(midi(m), 1.3) + 0.3 * sine(midi(m) * 2.76, 1.3) * np.exp(-t / 0.2)) * np.exp(-t / 0.45) * 0.07
    place(music, pan(bell, -0.3 + 0.2 * j), te + 1.2 + j * 0.5)

music *= duck[:, None]
music = reverb(music, 1.2, 0.3, 0.12)
drums = reverb(drums, 0.5, 0.15, 0.05, hp=900)
mix = np.tanh(1.15 * (music + drums))
fe = n(0.35)
mix[-fe:] *= (np.linspace(1, 0, fe) ** 2)[:, None]
mix /= np.abs(mix).max() * 1.12
write_wav(sys.argv[1] if len(sys.argv) > 1 else f"build/music6-v{V}.wav", mix)
print(f"music6 v{V}", mix.shape)
