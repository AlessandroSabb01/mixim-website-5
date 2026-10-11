"""Original 20 s score, 120 BPM, F minor. Fully synthesized, seeded, deterministic.

Arrangement in beats (1 beat = 0.5 s):
  0-6   hook: kick + sub stab on each word, tension pulse, reverse swell into the drop
  6-30  groove: four-on-the-floor, clap 2&4, hats, sidechained bass, chord stabs, pluck arp
  28-30 fill + riser
  30-34 break: filtered, ticking, riser into the number hit at 32
  34-40 logo: final hit, pad + bell, decays to silence
Usage: python3 audio/music.py out.wav
"""
import sys
import numpy as np
from dsp import *

B = BEAT
mix = buf()
drums = buf()
music = buf()

# ---------- instruments ----------

def kick(level=1.0, length=0.45):
    t = np.arange(n(length)) / SR
    f = 46 + 110 * np.exp(-t / 0.035)
    body = sine(f, length) * np.exp(-t / 0.16)
    click = filt(noise(length), "highpass", 2500) * np.exp(-t / 0.004) * 0.35
    return np.tanh(1.6 * (body + click)) * level


def clap(level=0.5):
    L = 0.35
    x = np.zeros(n(L))
    for k, d in enumerate([0, 0.011, 0.022]):
        burst = filt(noise(0.02), "bandpass", [900, 2600]) * np.exp(-np.arange(n(0.02)) / SR / 0.004)
        x[n(d):n(d) + len(burst)] += burst
    tail = filt(noise(L), "bandpass", [900, 3000]) * np.exp(-np.arange(n(L)) / SR / 0.07)
    x[n(0.022):] += tail[: len(x) - n(0.022)] * 0.6
    return x * level


def hat(level=0.18, decay=0.035, length=0.12):
    t = np.arange(n(length)) / SR
    return filt(noise(length), "highpass", 7500) * np.exp(-t / decay) * level


def supersaw(m_notes, length, cutoff=2400, voices=5, detune=0.12, level=0.12):
    out = np.zeros(n(length))
    for m in m_notes:
        for v in range(voices):
            cents = (v - (voices - 1) / 2) * detune * 100 / ((voices - 1) / 2)
            out += saw(midi(m) * 2 ** (cents / 1200), length, phase=v * 0.137)
    out /= voices * len(m_notes)
    return filt(out, "lowpass", cutoff, 2) * level


def pluck(m, length=0.22, level=0.16, cutoff0=5000):
    t = np.arange(n(length)) / SR
    x = saw(midi(m), length) * 0.6 + np.sign(sine(midi(m), length)) * 0.4
    x = sweep(x, "lowpass", lambda p: 300 + cutoff0 * np.exp(-p * 6), None)
    return x * np.exp(-t / 0.07) * level


def bass_note(m, length, level=0.32):
    x = saw(midi(m), length) * 0.7 + sine(midi(m), length) * 0.6
    x = filt(x, "lowpass", 420, 4)
    return x * adsr(length, 0.003, 0.03) * level


def sub_drop(level=0.8, length=1.4, f0=80, f1=32):
    t = np.arange(n(length)) / SR
    f = f1 + (f0 - f1) * np.exp(-t / 0.25)
    return np.tanh(1.3 * sine(f, length) * np.exp(-t / 0.55)) * level


def riser(length, level=0.22, f0=400, f1=9000):
    x = sweep(noise(length), "bandpass", f0, f1, order=2)
    e = np.linspace(0, 1, n(length)) ** 2.2
    return x * e * level


def reverse_swell(length=1.0, level=0.3):
    x = filt(noise(length), "bandpass", [1500, 9000]) * np.exp(-np.arange(n(length)) / SR / 0.35)
    return x[::-1] * level


# ---------- chords (F minor) ----------
Fm, Db, Ab, Eb = [53, 56, 60, 63], [49, 53, 56, 60], [56, 60, 63, 67], [51, 55, 58, 62]
roots = {"Fm": 29, "Db": 25, "Ab": 32, "Eb": 27}
prog = [(6, "Fm", Fm), (10, "Db", Db), (14, "Ab", Ab), (18, "Eb", Eb), (22, "Fm", Fm), (26, "Db", Db)]

# ---------- hook (0-6): one hit per word ----------
for b in range(5):
    place(drums, kick(1.0), b * B)
    place(music, bass_note(29 + (0 if b < 4 else 3), 0.42, 0.5), b * B)
    place(music, supersaw([p + 12 for p in Fm[:3]], 0.18, cutoff=1400 + b * 500, level=0.22), b * B, 1.0)
# tension pulse: muted 16ths on C
for i in range(20):
    place(music, pluck(72, 0.09, 0.05, 1500 + i * 120), i * B / 4, 0.8)
place(music, reverse_swell(1.0, 0.45), 6 * B - 1.0)
place(music, riser(1.0, 0.12, 300, 6000), 5 * B - 0.5)

# ---------- groove (6-30) ----------
duck = np.ones(len(mix))  # sidechain envelope from the kick
for b in range(6, 30):
    t = b * B
    place(drums, kick(0.95), t)
    i = n(t)
    d = 1 - 0.75 * np.exp(-np.arange(n(B)) / SR / 0.09)
    duck[i:i + len(d)] = np.minimum(duck[i:i + len(d)], d[: len(duck) - i])
    if b % 2 == 1:
        place(drums, clap(0.55), t)
    place(drums, pan(hat(0.16, 0.06, 0.2), 0.25), t + B / 2)  # offbeat open hat
    for s in (1, 3):
        place(drums, pan(hat(0.07, 0.015), -0.3), t + s * B / 4)
for start, name, chord in prog:
    # bass: pumping 8ths, octave jump on the last of each bar
    for k in range(8):
        m = roots[name] + (12 if k == 7 else 0)
        place(music, bass_note(m, B / 2 * 0.9, 0.34), start * B + k * B / 2)
    # chord stabs on the "and" of 1 and 3, plus a long one on the first downbeat
    for off in (0.5, 1.5, 2.5, 3.25):
        place(music, pan(supersaw(chord, 0.16, cutoff=3200, level=0.16), 0), (start + off) * B)
    # pluck arp, 16ths, ascending chord tones
    arp = [chord[0] + 12, chord[1] + 12, chord[2] + 12, chord[3] + 12, chord[2] + 24, chord[1] + 12]
    for k in range(16):
        p = -0.4 if k % 2 else 0.4
        place(music, pan(pluck(arp[k % len(arp)], 0.2, 0.11), p), (start + k / 4) * B)
# fill 28-30: snare-ish clap 16ths rising
for k in range(8):
    place(drums, clap(0.18 + 0.05 * k), (28 + k / 4) * B)
place(music, riser(1.0, 0.18), 30 * B - 1.0)

# ---------- break (30-34) ----------
for k in range(16):  # ticking clock under the counter
    place(drums, pan(hat(0.09, 0.01), 0.5 if k % 2 else -0.5), (30 + k / 4) * B)
place(music, supersaw(Eb, 2.0, cutoff=900, level=0.2) * adsr(2.0, 0.3, 0.2), 30 * B)
place(music, riser(1.0, 0.2, 500, 12000), 32 * B - 1.0)
for b in (30, 31):
    place(drums, kick(0.7), b * B)
# number lands on 32
place(drums, kick(1.0), 32 * B)
place(music, sub_drop(0.9), 32 * B)
place(music, supersaw([p + 12 for p in Fm], 1.0, cutoff=4000, level=0.22) * env_exp(1.0, 0.35), 32 * B)
for b in (33,):
    place(drums, kick(0.9), b * B)
    place(drums, clap(0.5), b * B)

# ---------- logo (34-40) ----------
place(drums, kick(1.0), 34 * B)
place(music, sub_drop(0.8, 2.0, 70, 30), 34 * B)
pad = supersaw([41, 53, 56, 60, 67], 6 * B, cutoff=1800, voices=7, level=0.34) * adsr(6 * B, 0.02, 1.5)
place(music, pad, 34 * B)
for k, m in enumerate([77, 80, 84, 89]):  # bell arpeggio on the tagline words
    t = np.arange(n(1.6)) / SR
    bell = (sine(midi(m), 1.6) + 0.35 * sine(midi(m) * 2.76, 1.6) * np.exp(-t / 0.2)) * np.exp(-t / 0.5) * 0.09
    place(music, pan(bell, -0.3 + 0.2 * k), (36 + k * 0.5) * B)

# ---------- glue ----------
music *= duck[:, None]
music = reverb(music, 2.2, 0.55, 0.28)
drums = reverb(drums, 1.0, 0.25, 0.12, hp=600)
mix = music + drums
fade = np.ones(len(mix))
fe = n(0.8)
fade[-fe:] = np.linspace(1, 0, fe) ** 2
mix *= fade[:, None]
mix /= np.abs(mix).max() * 1.12
write_wav(sys.argv[1] if len(sys.argv) > 1 else "build/music.wav", mix)
print("music written", mix.shape)
