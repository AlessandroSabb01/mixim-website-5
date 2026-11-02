"""Scores for the three Création Virale text films (20 s each), written against the film's own timeline
(film5/sections-v{V}{K}.json): sparse hook, drop where the hook ends, accents on every slam / count,
the logo hit on the end card. Same family (F minor, clean and minimal), a different engine per film:
  v1 Qui on est      122 BPM  warm house: soft kick, offbeat hats, Rhodes-like keys, rolling bass, vocal chops
  v2 Ce qu'on fait   128 BPM  tech-house machine: punchy kick, 16th hats, rolling slap bass, dark echo stabs, ticks
  v3 Pourquoi nous   134 BPM  electro hype: hard kick, layered clap, supersaw offbeat stabs, sub drops on the counts
Usage: FILM_V=1 FILM_K=a FILM_BPM=122 FILM_LEN=20 python3 audio/music5.py out.wav
"""
import json
import os
import sys
import numpy as np
from instruments import *

V, K = os.environ.get("FILM_V", "1"), os.environ.get("FILM_K", "a")
S = json.load(open(os.path.join(os.path.dirname(__file__), "..", "film5", f"sections-v{V}{K}.json")))
B = BEAT
HOOK, END = S["hookEnd"], S["end"]
NB = int(LENGTH / B) + 1
music, drums = buf(), buf()
duck = np.ones(len(music))
Fm, Db, Ab, Eb = [53, 56, 60, 63], [49, 53, 56, 60], [56, 60, 63, 67], [51, 55, 58, 62]
PROG = [Fm, Db, Ab, Eb]
chord_at = lambda b: PROG[int(b // 4) % 4]
hits = [sc["b0"] for sc in S["scenes"] if sc["kind"] in ("slam", "count", "scroll")]


def side(b, depth=0.75, rel=0.12):
    i = n(b * B); d = 1 - depth * np.exp(-np.arange(n(B)) / SR / rel); m = min(len(d), len(duck) - i)
    if m > 0:
        duck[i:i + m] = np.minimum(duck[i:i + m], d[:m])


def kick_at(b, lv=1.0, punch=False, sc=True):
    place(drums, (kick_punch(lv, 0.4) if punch else kick(lv, 0.42)), b * B)
    if sc:
        side(b)


def pre_drop(b, length=1.0):
    place(music, riser(length * B * 2, 0.16, 500, 9000), b * B - length * B * 2)
    for i in range(8):
        place(drums, snap(0.06 + 0.04 * i), (b - 1 + i / 8) * B)


# ---------------- v1: warm house ----------------
if V == "1":
    for b in range(0, int(HOOK)):                             # hook: kick on the one, a filtered keys bed
        if b % 2 == 0: kick_at(b, 0.75)
        place(drums, pan(hat(0.05, 0.02), 0.25), (b + 0.5) * B)
    place(music, filt(keys([m + 12 for m in Fm], HOOK * B, 0.09, 0.2), "lowpass", 1400), 0)
    pre_drop(HOOK)
    for b in range(int(HOOK), int(END)):                      # groove
        kick_at(b, 0.95)
        if b % 2 == 1: place(drums, clap(0.42), b * B)
        place(drums, pan(hat(0.13, 0.08, 0.2), 0.2), (b + 0.5) * B)
        for s_ in (0.25, 0.75): place(drums, pan(hat(0.04, 0.012), -0.3), (b + s_) * B)
        ch = chord_at(b - HOOK)
        if b % 4 in (0, 2): place(music, keys([m + 12 for m in ch], 0.9 * B, 0.075, 0.35), (b + (0 if b % 4 == 0 else 0.5)) * B)
        if b % 4 == 3: place(music, keys([m + 12 for m in ch], 0.4 * B, 0.06, 0.45), (b + 0.75) * B)
        for s_ in (0.5, 0.75): place(music, bass_note(ch[0] - 24 + (12 if s_ == 0.75 and b % 2 else 0), 0.22 * B, 0.26), (b + s_) * B)
    for hb in hits:
        if hb >= HOOK - 0.01: place(music, vox(65 if int(hb) % 2 else 68, 0.35, "o", 0.05), hb * B)
    place(drums, crash(0.18), HOOK * B)

# ---------------- v2: tech-house machine ----------------
elif V == "2":
    for b in range(0, int(HOOK)):
        kick_at(b, 0.7, punch=True)
        for s_ in range(4): place(drums, pan(hat(0.035 + 0.01 * s_, 0.01), 0.3 if s_ % 2 else -0.3), (b + s_ / 4) * B)
    pre_drop(HOOK)
    for b in range(int(HOOK), int(END)):
        kick_at(b, 1.0, punch=True)
        if b % 2 == 1: place(drums, clap(0.45), b * B); place(drums, snap(0.2), b * B)
        place(drums, pan(hat(0.16, 0.09, 0.22), 0.25), (b + 0.5) * B)
        for s_ in (1, 3): place(drums, pan(hat(0.06, 0.012), -0.35), (b + s_ / 4) * B)
        if b % 4 == 2: place(drums, pan(snap(0.12), 0.5), (b + 0.75) * B)       # machine tick
        ch = chord_at(b - HOOK)
        for s_, off in ((0.25, 0), (0.5, 0), (0.75, 12 if b % 4 == 3 else 0)):
            place(music, slap_bass(ch[0] - 24 + off, B / 4 * 0.8, 0.28, 1000), (b + s_) * B)
        if b % 2 == 0:
            st = chord_stab([m + 12 for m in ch[:3]], 0.18, 0.13, 2400)
            place(music, st, (b + 0.75) * B)
            for j, g in enumerate((0.4, 0.2)): place(music, pan(st * g, (-0.5, 0.5)[j]), (b + 0.75 + 0.75 * (j + 1)) * B)
    for hb in hits:
        place(music, chord_stab([m + 12 for m in chord_at(max(0, hb - HOOK))[:3]], 0.25, 0.18, 3600), hb * B)
    place(music, sub_drop(0.8, 1.0, 90, 32), HOOK * B); place(drums, crash(0.2), HOOK * B)

# ---------------- v3: electro hype ----------------
else:
    for b in range(0, int(HOOK)):
        if b in (0, 1, 3) or b == int(HOOK) - 2: kick_at(b, 0.9, punch=True)
    for hb in [sc["b0"] for sc in S["scenes"] if sc["b0"] < HOOK]:
        place(music, sub_drop(0.55, 0.5, 90, 40), hb * B)
    pre_drop(HOOK, 1.5)
    for b in range(int(HOOK), int(END)):
        kick_at(b, 1.0, punch=True)
        if b % 2 == 1: place(drums, clap(0.5), b * B); place(drums, snap(0.28), b * B)
        place(drums, pan(hat(0.15, 0.06, 0.2), 0.2), (b + 0.5) * B)
        for s_ in (1, 3): place(drums, pan(hat(0.07, 0.012), -0.3), (b + s_ / 4) * B)
        ch = chord_at(b - HOOK)
        place(music, supersaw([m + 12 for m in ch[:3]], 0.32 * B, 3200, 5, 0.1, 0.07) * adsr(0.32 * B, 0.004, 0.06), (b + 0.5) * B)
        place(music, bass_note(ch[0] - 24, 0.45 * B, 0.3), b * B)
    for hb in hits:
        if hb >= HOOK - 0.01:
            place(music, sub_drop(0.85, 0.8, 95, 34), hb * B); place(drums, crash(0.14, 0.9), hb * B)
    for j, m in enumerate([77, 80, 84, 89, 92, 89, 84, 80]):          # sparkle arp on the 59x reveal
        place(music, pan(bell_lead(m, 0.25, 0.05), -0.4 + 0.1 * j), (HOOK + j * 0.25) * B)
    place(drums, crash(0.25), HOOK * B)

# ---------------- end card: the logo hit, then a held chord to the last frame ----------------
place(music, reverse_swell(0.5, 0.24), END * B - 0.5)
kick_at(END, 1.0, punch=True, sc=False); place(drums, crash(0.28), END * B); place(music, sub_drop(0.9, 1.8, 80, 30), END * B)
tail = LENGTH - END * B
place(music, supersaw([41, 53, 56, 60, 65], tail, 1500, 5, 0.07, 0.2) * adsr(tail, 0.03, 1.2), END * B)
for j, m in enumerate([77, 80, 84]):
    t = np.arange(n(1.2)) / SR
    place(music, pan((sine(midi(m), 1.2) + 0.3 * sine(midi(m) * 2.76, 1.2) * np.exp(-t / 0.2)) * np.exp(-t / 0.45) * 0.07, -0.3 + 0.3 * j), (END + 1 + j * 0.5) * B)

music *= duck[:, None]
music = reverb(music, 1.2, 0.3, 0.12)
drums = reverb(drums, 0.5, 0.15, 0.05, hp=900)
mix = np.tanh(1.15 * (music + drums))
fe = n(0.35)
mix[-fe:] *= (np.linspace(1, 0, fe) ** 2)[:, None]
mix /= np.abs(mix).max() * 1.12
write_wav(sys.argv[1] if len(sys.argv) > 1 else f"build/music5-v{V}.wav", mix)
print(f"music5 v{V}{K}: {len(hits)} accents, drop b{HOOK}, logo b{END}", mix.shape)
