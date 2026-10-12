"""Score v2: 30 s, 120 BPM, F minor. Same palette as music.py, two drops, a hushed form section.

Beats (1 beat = 0.5 s):
  0-4   hook: a hit per word, the 4th ("d'exploser.") lands with a sub drop
  4-6   tension pulse          6-8  "Voici comment." + riser, a breath of silence before 8
  8-30  drop 1: groove        28-30 fill
  30-44 drop 2: bigger (lead octave, open hats)
  44-54 form: filtered, half-time, intimate
  54-60 final hit, clapper on 55, pad + bells on the tagline
Usage: FILM_LEN=30 python3 audio/music2.py out.wav
"""
import sys
import numpy as np
from instruments import *

B = BEAT
music, drums = buf(), buf()
Fm, Db, Ab, Eb = [53, 56, 60, 63], [49, 53, 56, 60], [56, 60, 63, 67], [51, 55, 58, 62]
R = {"Fm": 29, "Db": 25, "Ab": 32, "Eb": 27}
CH = {"Fm": Fm, "Db": Db, "Ab": Ab, "Eb": Eb}
duck = np.ones(len(music))


def kick_at(b, lv=0.95, sidechain=True):
    place(drums, kick(lv), b * B)
    if sidechain:
        i = n(b * B)
        d = 1 - 0.75 * np.exp(-np.arange(n(B)) / SR / 0.09)
        m = min(len(d), len(duck) - i)
        duck[i:i + m] = np.minimum(duck[i:i + m], d[:m])


def groove(b0, b1, prog, big=False, lead=False):
    for b in range(b0, b1):
        kick_at(b)
        if b % 2 == 1:
            place(drums, clap(0.55), b * B)
        place(drums, pan(hat(0.17 if big else 0.14, 0.08 if big else 0.06, 0.25), 0.25), (b + 0.5) * B)
        for s in (1, 3):
            place(drums, pan(hat(0.07, 0.015), -0.3), (b + s / 4) * B)
    for start, name in prog:
        end = min(start + 4, b1)
        ch = CH[name]
        for k in range(int((end - start) * 2)):
            place(music, bass_note(R[name] + (12 if k == 7 else 0), B / 2 * 0.9, 0.34), (start + k / 2) * B)
        for off in (0.5, 1.5, 2.5, 3.25):
            if start + off < end:
                place(music, supersaw(ch, 0.16, cutoff=3600 if big else 3200, level=0.17 if big else 0.15), (start + off) * B)
        arp = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[3] + 12, ch[2] + 24, ch[1] + 12]
        for k in range(int((end - start) * 4)):
            place(music, pan(pluck(arp[k % 6], 0.2, 0.11), -0.4 if k % 2 else 0.4), (start + k / 4) * B)
        if lead:
            for k, m in enumerate([ch[2] + 24, ch[3] + 24, ch[2] + 24, ch[0] + 24]):
                if start + k < end:
                    place(music, pan(supersaw([m], 0.45, cutoff=5000, voices=3, level=0.07), 0.1), (start + k) * B)


# hook: one hit per word, the last one is the statement
for b in range(4):
    kick_at(b, 1.0, False)
    place(music, bass_note(29 + (3 if b == 3 else 0), 0.42, 0.5), b * B)
    place(music, supersaw([p + 12 for p in Fm[:3]], 0.2, cutoff=1400 + b * 700, level=0.22), b * B)
place(music, sub_drop(0.8, 1.6), 3 * B)
for i in range(16):
    place(music, pluck(72, 0.09, 0.045, 1400 + i * 150), (4 + i / 8) * B)  # 32nd ticks: tension
# "Voici comment."
for b in (6, 7):
    place(music, pan(supersaw([65, 68, 72], 0.12, cutoff=2200, level=0.14), 0), b * B)
place(music, riser(1.0, 0.16, 300, 7000), 8 * B - 1.0)
place(music, reverse_swell(0.9, 0.42), 8 * B - 0.9 - 0.06)  # ends a hair before the drop: a breath
# drop 1
groove(8, 30, [(8, "Fm"), (12, "Db"), (16, "Ab"), (20, "Eb"), (24, "Fm"), (28, "Db")])
place(music, sub_drop(0.85, 1.4), 8 * B)
for k in range(8):
    place(drums, clap(0.16 + 0.05 * k), (28 + k / 4) * B)
place(music, riser(1.0, 0.2, 400, 11000), 30 * B - 1.0)
# drop 2, bigger
groove(30, 44, [(30, "Fm"), (34, "Db"), (38, "Ab"), (42, "Eb")], big=True, lead=True)
place(music, sub_drop(1.0, 1.8, 90, 30), 30 * B)
# form: filtered, half-time
form = buf()
for b in range(44, 54):
    if b % 2 == 0:
        place(drums, kick(0.55), b * B)
    place(drums, pan(hat(0.05, 0.012), 0.4), (b + 0.5) * B)
for k in range(40):
    ch = Ab if k < 20 else Eb
    place(form, pan(pluck(ch[k % 4] + 12, 0.22, 0.09, 2200), -0.3 if k % 2 else 0.3), (44 + k / 4) * B)
place(form, supersaw(Ab, 5 * B, cutoff=900, level=0.12) * adsr(5 * B, 0.3, 0.3), 44 * B)
place(form, supersaw(Eb, 5 * B, cutoff=900, level=0.12) * adsr(5 * B, 0.3, 0.3), 49 * B)
music += filt(form, "lowpass", 2400)
place(music, riser(1.0, 0.16, 500, 9000), 54 * B - 1.0)
# finale
kick_at(54, 1.0, False)
place(music, sub_drop(0.85, 2.2, 70, 30), 54 * B)
place(music, supersaw([41, 53, 56, 60, 67], 6 * B, cutoff=1900, voices=7, level=0.34) * adsr(6 * B, 0.02, 1.6), 54 * B)
for k, m in enumerate([77, 80, 84, 89]):
    t = np.arange(n(1.6)) / SR
    bell = (sine(midi(m), 1.6) + 0.35 * sine(midi(m) * 2.76, 1.6) * np.exp(-t / 0.2)) * np.exp(-t / 0.5) * 0.09
    place(music, pan(bell, -0.3 + 0.2 * k), (54.5 + k * 0.5) * B)

music *= duck[:, None]
music = reverb(music, 2.2, 0.55, 0.28)
drums = reverb(drums, 1.0, 0.25, 0.12, hp=600)
mix = music + drums
fe = n(0.8)
mix[-fe:] *= (np.linspace(1, 0, fe) ** 2)[:, None]
mix /= np.abs(mix).max() * 1.12
write_wav(sys.argv[1] if len(sys.argv) > 1 else "build/music2.wav", mix)
print("music2 written", mix.shape)
