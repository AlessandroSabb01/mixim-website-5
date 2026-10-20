"""Score: Import Rama showreel. 30 s of dark techno at 128 BPM in F minor (64 beats, 1 beat = 0.469 s).

  0-6    hook: a hit on each word (SAME / BOX / BAG / CUP), ticking hats in between, a snare roll into the red
  6-10   drop on the red cut: four-on-the-floor, rolling 16th bass, dark echoing stabs
  10-14  breakdown for 新 / IT STARTS IN ASIA: rumble kick, low pad, a noise wash as the footage opens
  14-26  the route: groove back, a stab on every route node, filter sweep down into the paper
  26-42  what we believe: full groove; SAME ORDER / TRUCK / REP hits; PAY LESS. on b40 with a crash
  42-54  proof: 8th-note stabs for the four families, bass out under the 48 H count, roll + riser
  54-64  ending: two hits for PAY LESS FOR ANYTHING., then the logo: sub drop, pad and bells to the last frame
Usage: FILM_LEN=30 FILM_BPM=128 python3 audio/music4.py out.wav
"""
import sys
import numpy as np
from instruments import *

B = BEAT
music, drums = buf(), buf()
duck = np.ones(len(music))
Fm, Db, Eb = [53, 56, 60], [49, 53, 56], [51, 55, 58]


def k(b, lv=1.0, sc=True, dst=None):
    place(drums if dst is None else dst, kick_punch(lv, 0.45), b * B)
    if sc:
        i = n(b * B); d = 1 - 0.8 * np.exp(-np.arange(n(B)) / SR / 0.11); m = min(len(d), len(duck) - i)
        if m > 0:
            duck[i:i + m] = np.minimum(duck[i:i + m], d[:m])


def stab(b, ch, lv=0.18, op=2600, echo=True):
    """Dark minor stab with a dotted-8th echo, panned out."""
    place(music, chord_stab([p + 12 for p in ch], 0.2, lv, op), b * B)
    if echo:
        for j, g in enumerate((0.45, 0.22)):
            place(music, pan(chord_stab([p + 12 for p in ch], 0.18, lv * g, op * 0.7), (-0.5, 0.5)[j]), (b + 0.75 * (j + 1)) * B)


def rolling_bass(b0, b1, root=29, lv=0.3, cut=900):
    for b in range(b0, b1):
        for s, off in ((1, 0), (2, 0), (3, 12 if b % 4 == 3 else 0)):
            place(music, slap_bass(root + off, B / 4 * 0.8, lv, cut), (b + s / 4) * B)


def groove(b0, b1, lv=1.0, hats16=True, clap_=True):
    for b in range(b0, b1):
        k(b, lv)
        if clap_ and b % 2 == 1:
            place(drums, clap(0.5 * lv), b * B); place(drums, snap(0.25 * lv), b * B)
        place(drums, pan(hat(0.17 * lv, 0.09, 0.22), 0.25), (b + 0.5) * B)
        if hats16:
            for s in (1, 3):
                place(drums, pan(hat(0.07 * lv, 0.012), -0.35), (b + s / 4) * B)


def rumble(b0, b1, lv=0.5):
    """Techno rumble: a low-passed, reverbed kick tail on every beat."""
    r = buf()
    for b in range(b0, b1):
        place(r, kick_punch(lv, 0.6), b * B)
    music[:] += filt(reverb(r, 1.6, 0.6, 0.6), "lowpass", 180) * 0.9


# ---- hook ----
for b in (0, 1, 3, 5):
    k(b, 1.0, False)
    place(music, sub_drop(0.6, 0.6, 90, 40), b * B)
    stab(b, Fm, 0.2, 1800 + b * 400, echo=False)
for i in range(24):
    place(drums, pan(hat(0.035 + 0.002 * i, 0.01), 0.3 if i % 2 else -0.3), (i / 4) * B)
for i in range(8):
    place(drums, snap(0.08 + 0.05 * i), (5 + i / 8) * B)
place(music, riser(0.5, 0.16, 600, 9000), 6 * B - 0.5)
# ---- drop on red ----
groove(6, 10)
rolling_bass(6, 10)
for b in (6.5, 7.75, 8.5, 9.25):
    stab(b, Fm)
place(music, sub_drop(0.9, 1.2, 90, 32), 6 * B); place(drums, crash(0.3), 6 * B)
for i in range(4):
    place(drums, snap(0.15 + 0.06 * i), (9.5 + i / 8) * B)
# ---- breakdown: 新 / IT STARTS IN ASIA ----
place(music, sub_drop(0.9, 1.6, 80, 30), 10 * B); place(drums, crash(0.25), 10 * B)
rumble(10, 14, 0.55)
pad = supersaw([41, 53, 56, 60], 4 * B, cutoff=700, voices=5, detune=0.06, level=0.22) * adsr(4 * B, 0.4, 0.8)
place(music, pad, 10 * B)
place(music, vox(65, 0.6, "o", 0.06), 11 * B)
place(music, filt(riser(2.0, 0.1, 300, 3000), "lowpass", 4000), 12 * B)
for i in range(8):
    place(drums, pan(hat(0.04 + 0.01 * i, 0.012), 0.3), (12 + i / 4) * B)
place(music, riser(0.9, 0.18, 500, 10000), 14 * B - 0.9)
# ---- the route ----
groove(14, 26)
rolling_bass(14, 22, 29); rolling_bass(22, 26, 25)
for b in (14, 16, 18, 20, 22):
    stab(b + 0.5, Fm if b < 22 else Db)
route = buf()
for b in range(24, 26):
    for s in range(4):
        place(route, pan(hat(0.08, 0.02), 0.2), (b + s / 4) * B)
drums += route
# ---- what we believe ----
place(drums, crash(0.2), 26 * B)
groove(26, 36)
rolling_bass(26, 30, 29); rolling_bass(30, 34, 32); rolling_bass(34, 36, 27)
for b in (26.75, 28.5, 30.5, 32.5, 34.5):
    stab(b, Fm if b < 30 else Eb if b < 34 else Db)
for b in (36, 37, 38):
    k(b, 1.0); stab(b, [Fm, Db, Eb][b - 36], 0.22, 3400, echo=False); place(music, slap_bass(29 if b < 38 else 32, 0.3, 0.38, 2000), b * B)
for i in range(8):
    place(drums, snap(0.1 + 0.05 * i), (39 + i / 8) * B)
place(music, riser(0.5, 0.18, 800, 11000), 40 * B - 0.5)
k(40, 1.0); place(drums, crash(0.35), 40 * B); place(music, sub_drop(1.0, 1.4, 95, 30), 40 * B); stab(40, Fm, 0.24, 4200)
place(music, vox(72, 0.4, "a", 0.08), 40 * B)
# ---- proof ----
groove(42, 49)
rolling_bass(42, 49, 29)
for j, b in enumerate((42, 42.5, 43, 43.5)):
    place(music, pan(chord_stab([p + 12 + (0, 3, 5, 7)[j] for p in Fm[:2]], 0.16, 0.16, 3600), (-0.4, 0.4)[j % 2]), b * B)
for b in (46, 46.5, 47, 47.5, 48):
    stab(b, Db, 0.15)
groove(49, 51, 0.7, hats16=False, clap_=False)          # the 48 H count: bass out, kick and ticks only
k(51, 1.0); place(drums, crash(0.25), 51 * B); place(music, sub_drop(0.8, 1.0), 51 * B)
groove(51, 53); rolling_bass(51, 53, 29)
for i in range(6):
    place(drums, snap(0.1 + 0.06 * i), (53 + i / 8) * B)
place(music, riser(0.7, 0.18, 600, 10000), 53.75 * B - 0.7)
# ---- ending ----
for b in (54.25, 54.6):
    k(b, 0.95, False); stab(b, Fm, 0.2, 3000, echo=False)
place(music, sub_drop(0.7, 0.8), 54.6 * B)
rumble(55, 57, 0.4)
place(music, reverse_swell(0.7, 0.3), 57.25 * B - 0.7)
k(57.25, 1.0, False); place(drums, crash(0.32), 57.25 * B); place(music, sub_drop(0.95, 2.0, 80, 30), 57.25 * B)
place(music, supersaw([41, 53, 56, 60, 65], 6.75 * B, cutoff=1500, voices=5, detune=0.07, level=0.24) * adsr(6.75 * B, 0.03, 2.0), 57.25 * B)
for j, m in enumerate([77, 80, 84, 89]):
    t = np.arange(n(1.4)) / SR
    bell = (sine(midi(m), 1.4) + 0.35 * sine(midi(m) * 2.76, 1.4) * np.exp(-t / 0.2)) * np.exp(-t / 0.5) * 0.08
    place(music, pan(bell, -0.3 + 0.2 * j), (58.5 + j * 0.5) * B)

music *= duck[:, None]
music = reverb(music, 1.3, 0.32, 0.13)
drums = reverb(drums, 0.6, 0.15, 0.06, hp=900)
mix = np.tanh(1.2 * (music + drums))
fe = n(0.5)
mix[-fe:] *= (np.linspace(1, 0, fe) ** 2)[:, None]
mix /= np.abs(mix).max() * 1.12
write_wav(sys.argv[1] if len(sys.argv) > 1 else "build/music4.wav", mix)
print("music4 written", mix.shape)
