"""Score v3: 30 s electro-funk / French touch at 120 BPM in F minor (1 beat = 0.5 s).

  0-3   hook: one slam per word (kick + slap bass + stab); b3 "d'exploser." = sub drop, crash, vocal chop
  4-6   filtered funk riff building, 16th hats          6-8  "Voici comment." stabs, snare roll, riser
  8-28  drop A: four-on-the-floor, slap bass riff, pumping stabs, vocal chops (Fm Db Ab Eb Fm)
  28-30 fill: 16th snare roll, riser, the music implodes with the picture
  30-42 drop B: bigger (vocal lead, bell lead, 16th shaker, louder open hats)
  42-44 7,5 M+: two hits (b42, b43 "M+"), then a short sweep into the form
  44-54 form: the groove through a low-pass, half-energy, so the UI sounds read
  54-60 finale: big hit, pad under the tagline, clapperboard hit on b57.5, bells to the end
Usage: FILM_LEN=30 python3 audio/music3.py out.wav
"""
import sys
import numpy as np
from instruments import *

B = BEAT
music, drums = buf(), buf()
duck = np.ones(len(music))
CH = {"Fm": [53, 56, 60, 63], "Db": [49, 53, 56, 60], "Ab": [56, 60, 63, 67], "Eb": [51, 55, 58, 62]}
R = {"Fm": 29, "Db": 25, "Ab": 32, "Eb": 27}
# funk bass riff, one bar = 4 beats, in 16ths: (step, semitone offset from root, length in 16ths)
RIFF = [(0, 0, 2), (3, 0, 1), (4, 12, 1), (6, 0, 1), (8, 0, 1), (10, 3, 1), (11, 5, 1), (12, 7, 2), (14, 12, 1), (15, 10, 1)]


def k(b, lv=1.0, sc=True, dst=None):
    place(drums if dst is None else dst, kick_punch(lv), b * B)
    if sc:
        i = n(b * B); d = 1 - 0.85 * np.exp(-np.arange(n(B)) / SR / 0.1); m = min(len(d), len(duck) - i)
        if m > 0:
            duck[i:i + m] = np.minimum(duck[i:i + m], d[:m])


def groove(b0, b1, prog, big=False, dm=None, mm=None, lv=1.0):
    dm = drums if dm is None else dm
    mm = music if mm is None else mm
    for b in range(b0, b1):
        k(b, lv, dst=dm)
        if b % 2 == 1:
            place(dm, clap(0.55 * lv), b * B); place(dm, snap(0.3 * lv), b * B)
        place(dm, pan(hat((0.2 if big else 0.16) * lv, 0.08 if big else 0.07, 0.2), 0.25), (b + 0.5) * B)
        for s in ((1, 2, 3) if big else (1, 3)):
            place(dm, pan(hat(0.06 * lv, 0.012), -0.35 if s != 2 else 0.4), (b + s / 4) * B)
    for start, name in prog:
        end = min(start + 4, b1)
        ch, root = CH[name], R[name]
        for st, off, ln in RIFF:
            if start + st / 4 < end:
                place(mm, slap_bass(root + off, ln * B / 4 * 0.92, 0.34 * lv, 2800 if big else 2600), (start + st / 4) * B)
        for off in (0.5, 1.75, 2.5, 3.25, 3.75):
            if start + off < end:
                place(mm, chord_stab([p + 12 for p in ch], 0.22, 0.17 * lv, 4200 if big else 3600), (start + off) * B)
        for j, (off, m, v) in enumerate(((1.0, ch[2] + 12, "a"), (2.75, ch[3] + 12, "o"))):
            if start + off < end:
                place(mm, pan(vox(m, 0.3, v, 0.08 * lv), -0.3 if j else 0.3), (start + off) * B)
        if big:  # lead: vocal + bell, a call that climbs each bar
            for off, m in ((0, ch[2] + 12), (1.5, ch[3] + 12), (2, ch[2] + 12), (3, ch[0] + 24)):
                if start + off < end:
                    place(mm, pan(vox(m, 0.4, "a", 0.07), 0.15), (start + off) * B)
                    place(mm, pan(bell_lead(m + 12, 0.4, 0.06), -0.15), (start + off) * B)


# ---- hook: a slam per word ----
Fm, Db = CH["Fm"], CH["Db"]
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
# ---- drop A ----
groove(8, 28, [(8, "Fm"), (12, "Db"), (16, "Ab"), (20, "Eb"), (24, "Fm")])
place(music, sub_drop(0.85, 1.2), 8 * B); place(drums, crash(0.28), 8 * B)
place(drums, crash(0.2), 18 * B); place(music, sub_drop(0.5, 0.8), 18 * B)       # iris wipe into the process
# ---- fill: the picture implodes ----
groove(28, 29, [(28, "Db")])
for i in range(8):
    place(drums, snap(0.1 + 0.04 * i), (29 + i / 8) * B)
    place(drums, clap(0.08 + 0.03 * i), (29 + i / 8) * B)
place(music, riser(1.2, 0.24, 300, 12000), 30 * B - 1.2 - 0.04)
place(music, reverse_swell(0.8, 0.35), 30 * B - 0.8 - 0.04)
# ---- drop B ----
groove(30, 42, [(30, "Fm"), (34, "Db"), (38, "Ab")], big=True)
place(music, sub_drop(1.0, 1.8, 90, 30), 30 * B); place(drums, crash(0.34), 30 * B)
for b in (33, 36, 39):
    place(drums, crash(0.14), b * B)
# ---- 7,5 M+ ----
for b in (42, 43):
    k(b, 1.0)
    place(drums, clap(0.6), b * B); place(drums, crash(0.3), b * B)
    place(music, chord_stab([p + 12 for p in CH["Eb"]], 0.4, 0.22, 5000), b * B)
    place(music, slap_bass(27 + (12 if b == 43 else 0), 0.4, 0.4, 2400), b * B)
    place(music, sub_drop(0.8, 1.0), b * B)
place(music, vox(74, 0.5, "a", 0.11), 43 * B)
for i in range(4):
    place(drums, pan(hat(0.08, 0.02), 0.3 - 0.2 * i), (42.5 + i / 4) * B)
place(music, riser(0.5, 0.16, 800, 9000), 44 * B - 0.5)
# ---- form: the same groove through a low-pass ----
fd, fm = buf(), buf()
groove(44, 54, [(44, "Ab"), (48, "Eb"), (52, "Fm")], dm=fd, mm=fm, lv=0.7)
drums += filt(fd, "lowpass", 2600)
music += filt(fm, "lowpass", 1100)
place(music, riser(1.0, 0.16, 500, 9000), 54 * B - 1.0)
# ---- finale ----
k(54, 1.0, False)
place(drums, crash(0.32), 54 * B)
place(music, sub_drop(0.85, 2.2, 70, 30), 54 * B)
place(music, chord_stab([p + 12 for p in Fm], 0.6, 0.22, 4000), 54 * B)
place(music, supersaw([41, 53, 56, 60, 67], 3.5 * B, cutoff=1500, voices=5, detune=0.07, level=0.24) * adsr(3.5 * B, 0.05, 0.6), 54 * B)
for i, m in enumerate((65, 68, 72)):
    place(music, pan(vox(m, 0.5, "o", 0.06), -0.3 + 0.3 * i), (54.5 + i) * B)
k(57.5, 1.0, False)
place(drums, clap(0.7), 57.5 * B); place(drums, crash(0.36), 57.5 * B)
place(music, sub_drop(0.9, 1.6, 80, 30), 57.5 * B)
place(music, chord_stab([p + 12 for p in Fm], 0.5, 0.24, 5000), 57.5 * B)
place(music, supersaw([41, 53, 56, 60, 67], 2.5 * B, cutoff=1900, voices=5, detune=0.07, level=0.26) * adsr(2.5 * B, 0.02, 0.9), 57.5 * B)
for j, m in enumerate([77, 80, 84, 89]):
    t = np.arange(n(1.4)) / SR
    bell = (sine(midi(m), 1.4) + 0.35 * sine(midi(m) * 2.76, 1.4) * np.exp(-t / 0.2)) * np.exp(-t / 0.5) * 0.08
    place(music, pan(bell, -0.3 + 0.2 * j), (57.75 + j * 0.25) * B)

music *= duck[:, None]
music = reverb(music, 1.4, 0.35, 0.14)
drums = reverb(drums, 0.7, 0.18, 0.07, hp=900)
mix = np.tanh(1.15 * (music + drums))
fe = n(0.5)
mix[-fe:] *= (np.linspace(1, 0, fe) ** 2)[:, None]
mix /= np.abs(mix).max() * 1.12
write_wav(sys.argv[1] if len(sys.argv) > 1 else "build/music3.wav", mix)
print("music3 written", mix.shape)
