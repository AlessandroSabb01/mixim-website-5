"""Score: Import-Rama ads (film6). A short dark-techno bed in F minor at 120 BPM, the showreel's sound family, built
around the voice-over. Sections follow the film's scene cuts, computed from the measured words (assets/imp-ads/words6.json,
same formulas as film6/film.js); mix.py sits the bed under the VO and ducks it while he speaks.
  hook (hits on the opening words) -> groove (stabs on the listed items) -> build (16ths + snare roll)
  -> drop (full groove, stabs) -> light (kick + ticks) -> end card (logo hit, held chord, bells)
Usage: FILM_V=1 FILM_LEN=15 FILM_BPM=120 python3 audio/music6.py out.wav
"""
import json
import os
import sys
import numpy as np
from instruments import *

V = os.environ.get("FILM_V", "1")
OFF = 0.15
WORDS = json.load(open(os.path.join(os.path.dirname(__file__), "..", "assets", "imp-ads", "words6.json")))[V]
WT = [t + OFF for _, t in WORDS]
TOK = [w.replace(" :", "") for w, _ in WORDS]


def wt(tok, nth=0):
    c = -1
    for i, x in enumerate(TOK):
        if x == tok:
            c += 1
            if c == nth:
                return WT[i]
    raise KeyError(tok)


w = lambda i: WT[i]
if V == "1":
    P = dict(hits=[w(0), w(2)], stabs=[w(3), w(4), w(5)], g0=w(3) - 0.07, b0=w(6) - 0.16, d0=w(11) - 0.12, l0=w(22) - 0.2, e=w(30) - 0.24, subs=[w(29)])
elif V == "2":
    e = wt("Prends") - 0.24
    P = dict(hits=[wt("Tu"), wt("ou"), wt("ton")], stabs=[wt("Chaises"), wt("tables,"), wt("vaisselle,"), wt("déco…")],
             g0=wt("Chaises") - 0.1, b0=wt("on") - 0.12, d0=wt("Un") - 0.12, l0=e, e=e, subs=[wt("fabriquer."), wt("salle.")])
else:
    P = dict(hits=[wt("Ton"), wt("fournisseur…"), wt("challengé?")],
             stabs=[wt(x) for x in ("trouve", "vérifie", "négocie,", "bateau,", "douanes", "livraison.", "Commerçant,", "grossiste,", "restaurateur", "manufacturier")],
             g0=wt("Ce") - 0.12, b0=wt("Import-Rama") - 1.6, d0=wt("Import-Rama") - 0.12, l0=wt("envoie-nous") - 0.12, e=wt("Premier") - 0.24,
             subs=[wt("actuel."), wt("gérer.")])

B = BEAT
music, drums = buf(), buf()
duck = np.ones(len(music))
Fm, Db, Eb, Ab = [53, 56, 60], [49, 53, 56], [51, 55, 58], [48, 51, 56]
PROG = [Fm, Db, Ab, Eb]
NB = int(LENGTH / B)
bof = lambda sec: int(round(sec / B))


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


g0, b0_, d0, l0, te = (bof(P[x]) for x in ("g0", "b0", "d0", "l0", "e"))

# ---- hook: a hit on each opening word, ticks in between ----
for i, t_ in enumerate(P["hits"]):
    place(drums, kick_punch(1.0 if i == len(P["hits"]) - 1 else 0.85, 0.5), t_ - 0.02)
    stab(t_ - 0.02, Fm, 0.15 + 0.03 * (i == len(P["hits"]) - 1), 2800, echo=False)
place(music, sub_drop(0.6, 0.9, 85, 34), P["hits"][0])
for b in range(1, g0):
    place(drums, pan(hat(0.05, 0.015), 0.3 if b % 2 else -0.3), (b + 0.5) * B)

# ---- groove under the listed items ----
groove(g0, b0_)
for j, t_ in enumerate(s for s in P["stabs"] if P["g0"] <= s < P["b0"]):
    stab(t_, PROG[j % 4], 0.12)

# ---- build: filtered bass climbs, 16ths, snare roll into the drop ----
for b in range(b0_, d0):
    k(b, 0.85)
    place(drums, pan(hat(0.1, 0.03), 0.2), (b + 0.5) * B)
    for s_ in (0.25, 0.75):
        place(drums, pan(hat(0.06, 0.01), -0.3), (b + s_) * B)
    for s_ in (0.25, 0.5, 0.75):
        place(music, slap_bass(29, B / 4 * 0.8, 0.2, 500 + 300 * (b - b0_)), (b + s_) * B)
for i in range(12):
    place(drums, snap(0.05 + 0.03 * i), P["d0"] - 0.75 + i * 0.0625)
place(music, riser(0.8, 0.14, 500, 9000), P["d0"] - 0.8)

# ---- drop ----
place(drums, crash(0.24), P["d0"]); place(music, sub_drop(0.8, 1.2, 90, 32), P["d0"])
groove(d0, l0, hats16=True, cut=1100)
for b in range(d0, l0, 2):
    stab(b * B + 0.75 * B, PROG[((b - d0) // 2) % 4], 0.11)
for t_ in (s for s in P["stabs"] if P["d0"] <= s < P["l0"]):
    place(drums, pan(snap(0.1), 0.3), t_)

# ---- light: kick and ticks under the comparison ----
for b in range(l0, te):
    k(b, 0.7)
    place(drums, pan(hat(0.08, 0.02), 0.25), (b + 0.5) * B)
    if b % 2 == 0:
        place(drums, pan(snap(0.08), 0.4), (b + 0.75) * B)
for t_ in P["subs"]:
    place(music, sub_drop(0.6, 0.6, 90, 40), t_)
place(music, reverse_swell(0.5, 0.26), P["e"] - 0.5)

# ---- end card: the logo hit, a held chord and bells to the last frame ----
te_ = P["e"] + 0.08
place(drums, kick_punch(1.0, 0.5), te_); place(drums, crash(0.3), te_); place(music, sub_drop(0.9, 1.8, 80, 30), te_)
tail = LENGTH - te_
place(music, supersaw([41, 53, 56, 60, 65], tail, 1500, 5, 0.07, 0.2) * adsr(tail, 0.03, 1.2), te_)
for b in range(bof(te_) + 1, NB):
    if b % 2 == 0:
        k(b, 0.55, sc=False)
for j, m in enumerate([77, 80, 84, 89]):
    t = np.arange(n(1.3)) / SR
    bell = (sine(midi(m), 1.3) + 0.3 * sine(midi(m) * 2.76, 1.3) * np.exp(-t / 0.2)) * np.exp(-t / 0.45) * 0.07
    place(music, pan(bell, -0.3 + 0.2 * j), te_ + 1.2 + j * 0.5)

music *= duck[:, None]
music = reverb(music, 1.2, 0.3, 0.12)
drums = reverb(drums, 0.5, 0.15, 0.05, hp=900)
mix = np.tanh(1.15 * (music + drums))
fe = n(0.35)
mix[-fe:] *= (np.linspace(1, 0, fe) ** 2)[:, None]
mix /= np.abs(mix).max() * 1.12
write_wav(sys.argv[1] if len(sys.argv) > 1 else f"build/music6-v{V}.wav", mix)
print(f"music6 v{V}: drop {P['d0']:.2f}s, end card {P['e']:.2f}s", mix.shape)
