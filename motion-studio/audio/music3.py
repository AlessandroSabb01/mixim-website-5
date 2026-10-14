"""Score v3 (hook test, 8.5 s): electro-funk / French touch at 120 BPM in F minor.

Beats: 0-3  one slam per word (kick + slap bass + stab), 3 = "d'exploser." (sub drop, crash, vocal chop)
       4-6  filtered funk riff building, 16th hats
       6-8  "Voici comment." stabs, snare roll + riser, a 1/8 breath before the drop
       8-16 drop: four-on-the-floor, slap bass riff, pumping chord stabs, vocal chops, open hats
Usage: FILM_LEN=8.5 python3 audio/music3.py out.wav
"""
import sys
import numpy as np
from instruments import *

B = BEAT
music, drums = buf(), buf()
duck = np.ones(len(music))
Fm, Db = [53, 56, 60, 63], [49, 53, 56, 60]


def k(b, lv=1.0, sc=True):
    place(drums, kick_punch(lv), b * B)
    if sc:
        i = n(b * B); d = 1 - 0.85 * np.exp(-np.arange(n(B)) / SR / 0.1); m = min(len(d), len(duck) - i)
        duck[i:i + m] = np.minimum(duck[i:i + m], d[:m])


# funk bass riff, one bar = 4 beats, in 16ths: (step, semitone offset from root, length in 16ths)
RIFF = [(0, 0, 2), (3, 0, 1), (4, 12, 1), (6, 0, 1), (8, 0, 1), (10, 3, 1), (11, 5, 1), (12, 7, 2), (14, 12, 1), (15, 10, 1)]


def bass_bar(b0, root, lv=0.34, bright=2600):
    for st, off, ln in RIFF:
        place(music, slap_bass(root + off, ln * B / 4 * 0.92, lv, bright), (b0 + st / 4) * B)


# ---- hook: a slam per word ----
for b in range(4):
    k(b, 1.0, False)
    place(drums, clap(0.5 + 0.1 * b), b * B)
    place(music, slap_bass(29 + (3 if b == 3 else 0), 0.4, 0.42, 1500 + b * 900), b * B)
    place(music, chord_stab([p + 12 for p in Fm], 0.32, 0.2, 1500 + b * 1400), b * B)
place(music, sub_drop(0.9, 1.6), 3 * B)
place(drums, crash(0.3), 3 * B)
place(music, vox(65, 0.45, "a", 0.12), 3 * B)
place(music, vox(72, 0.3, "o", 0.08), 3.5 * B)
# ---- build: filtered riff + 16th hats ----
riff = buf()
for st, off, ln in RIFF[:8]:
    place(riff, slap_bass(29 + off, ln * B / 4 * 0.9, 0.36, 2200), (4 + st / 4) * B)
seg = riff[n(4 * B):n(4 * B) + n(1.0)]
riff[n(4 * B):n(4 * B) + n(1.0)] = np.stack([sweep(seg[:, c], "lowpass", lambda q: 250 + 3500 * q ** 2, None) for c in range(2)], axis=1)
music += riff
for i in range(8):
    place(drums, pan(hat(0.06 + 0.012 * i, 0.012), -0.3 if i % 2 else 0.3), (4 + i / 4) * B)
k(4, 0.8); k(5, 0.8)
# ---- "Voici comment." ----
for b in (6, 7):
    k(b, 0.95)
    place(drums, clap(0.55), b * B)
    place(music, chord_stab([p + 12 for p in Db], 0.28, 0.2, 4200), b * B)
    place(music, vox(68 if b == 6 else 72, 0.25, "e", 0.09), (b + 0.5) * B)
for i in range(6):
    place(drums, snap(0.12 + 0.05 * i), (7 + i / 8) * B)
place(music, riser(0.9, 0.2, 400, 10000), 8 * B - 0.9 - 0.06)
# ---- drop ----
for b in range(8, 17):
    k(b, 1.0)
    if b % 2 == 1:
        place(drums, clap(0.55), b * B); place(drums, snap(0.3), b * B)
    place(drums, pan(hat(0.16, 0.07, 0.2), 0.25), (b + 0.5) * B)
    for s in (1, 3):
        place(drums, pan(hat(0.06, 0.012), -0.35), (b + s / 4) * B)
for b0, root, ch in ((8, 29, Fm), (12, 25, Db)):
    bass_bar(b0, root)
    for off in (0.5, 1.75, 2.5, 3.25, 3.75):
        place(music, chord_stab([p + 12 for p in ch], 0.22, 0.17, 3600), (b0 + off) * B)
    for j, (off, m, v) in enumerate(((1.0, ch[2] + 12, "a"), (2.75, ch[3] + 12, "o"))):
        place(music, pan(vox(m, 0.3, v, 0.08), -0.3 if j else 0.3), (b0 + off) * B)
place(music, sub_drop(0.85, 1.2), 8 * B)
place(drums, crash(0.28), 8 * B)
place(drums, crash(0.3), 16 * B)
place(music, sub_drop(0.8, 1.0), 16 * B)

music *= duck[:, None]
music = reverb(music, 1.4, 0.35, 0.14)
drums = reverb(drums, 0.7, 0.18, 0.07, hp=900)
mix = np.tanh(1.15 * (music + drums))
fe = n(0.3)
mix[-fe:] *= (np.linspace(1, 0, fe) ** 2)[:, None]
mix /= np.abs(mix).max() * 1.12
write_wav(sys.argv[1] if len(sys.argv) > 1 else "build/music3.wav", mix)
print("music3 written", mix.shape)
