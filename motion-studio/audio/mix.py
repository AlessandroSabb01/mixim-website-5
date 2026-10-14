"""Synthesize UI sound design from the film's cues, place it on the measured beat grid, mix with the
score and master to -14 LUFS integrated / -1 dBTP.
Usage: python3 audio/mix.py build/music.wav beats.json build/cues.json build/mix.wav
"""
import json
import sys
import numpy as np
import soundfile as sf
import pyloudnorm as pyln
from scipy.signal import resample_poly
from dsp import *

music_path, beats_path, cues_path, out_path = sys.argv[1:5]
music, sr = sf.read(music_path, always_2d=True)
assert sr == SR
grid = json.load(open(beats_path))
beats, period = np.array(grid["beats"]), grid["period"]
cues = json.load(open(cues_path))


def beat_time(b):
    i = int(np.floor(b))
    if i < 0:
        return beats[0] + b * period
    if i >= len(beats) - 1:
        return beats[-1] + (b - len(beats) + 1) * period
    return beats[i] + (b - i) * (beats[i + 1] - beats[i])


t_ = lambda L: np.arange(n(L)) / SR

# Each generator returns (signal, anchor_seconds): the anchor is the instant that lands on the beat.
def click():
    L = 0.09
    x = filt(noise(L), "highpass", 3000) * np.exp(-t_(L) / 0.0025) * 0.9
    x += sine(2100, L) * np.exp(-t_(L) / 0.012) * 0.35 + sine(820, L) * np.exp(-t_(L) / 0.02) * 0.25
    return x, 0.0


def press():
    x, _ = click()
    return filt(x, "lowpass", 5000) * 0.8, 0.0


def release():
    L = 0.06
    return (filt(noise(L), "highpass", 4000) * np.exp(-t_(L) / 0.002) * 0.6 + sine(1500, L) * np.exp(-t_(L) / 0.008) * 0.2), 0.0


def tick():
    L = 0.05
    return (sine(3200, L) * np.exp(-t_(L) / 0.006) * 0.5 + filt(noise(L), "highpass", 6000) * np.exp(-t_(L) / 0.0015) * 0.4), 0.0


def wheel():
    L = 0.05
    return filt(noise(L), "bandpass", [1800, 5000]) * np.exp(-t_(L) / 0.004) * 0.9, 0.0


def blip(step=0):
    L = 0.14
    f = midi(77 + [0, 3, 5, 7, 10, 12, 15][step % 7])
    return sine(f, L) * np.exp(-t_(L) / 0.05) * 0.35 * adsr(L, 0.002, 0.02), 0.0


def pop():
    L = 0.16
    f = 300 + 700 * np.exp(-t_(L) / 0.025)
    return sine(f, L) * np.exp(-t_(L) / 0.05) * 0.6 * adsr(L, 0.001, 0.02), 0.004


def whoosh(len=0.7, bright=1.0):
    L = len
    p = np.linspace(0, 1, n(L))
    env = np.where(p < 0.78, (p / 0.78) ** 2.2, np.exp(-(p - 0.78) / 0.06))
    x = sweep(noise(L), "bandpass", 250, 4200 * bright, order=2) * env
    s = np.stack([x * (1 - 0.6 * p), x * (0.4 + 0.6 * p)], axis=1)  # travels left -> right
    return s * 0.9, L * 0.78


def whoosh_s():
    return whoosh(0.4, 0.8)


def swipe():
    s, a = whoosh(0.28, 1.4)
    return s * 0.7, a


def open_():
    L = 0.5
    x = sweep(noise(L), "bandpass", 600, 5000) * np.exp(-t_(L) / 0.18) * 0.35
    x += sine(midi(84), L) * np.exp(-t_(L) / 0.12) * 0.12
    return x, 0.0


def impact():
    L = 1.4
    sub = sine(42 + 60 * np.exp(-t_(L) / 0.08), L) * np.exp(-t_(L) / 0.5)
    crack = filt(noise(L), "bandpass", [800, 6000]) * np.exp(-t_(L) / 0.03) * 0.7
    return np.tanh(1.5 * (sub + crack)) * 0.8, 0.0


def clap():
    """Wooden clapperboard snap: two tight transients + knock."""
    L = 0.4
    x = np.zeros(n(L))
    for d, g in ((0.0, 1.0), (0.006, 0.6)):
        i = n(d)
        b = filt(noise(0.03), "bandpass", [1200, 7000]) * np.exp(-t_(0.03) / 0.003) * g
        x[i:i + len(b)] += b
    x += sine(620 * (1 + 0.3 * np.exp(-t_(L) / 0.01)), L) * np.exp(-t_(L) / 0.03) * 0.45
    x += filt(noise(L), "bandpass", [500, 2500]) * np.exp(-t_(L) / 0.05) * 0.25
    return x * 1.1, 0.0


def key(var=0):
    """Soft keyboard tap: tiny noise transient + a damped 'tock'; var detunes each keystroke."""
    L = 0.05
    f = 1800 + 260 * ((var * 7919) % 5)
    x = filt(noise(L), "bandpass", [2500, 9000]) * np.exp(-t_(L) / 0.0018) * 0.5
    x += sine(f, L) * np.exp(-t_(L) / 0.006) * 0.18
    return x * (0.8 + 0.08 * (var % 3)), 0.0


def select():
    L = 0.08
    return (sine(2600, L) * np.exp(-t_(L) / 0.01) * 0.3 + sine(1300, L) * np.exp(-t_(L) / 0.02) * 0.2), 0.0


def send():
    """Glassy rising swoosh that peaks on the beat."""
    L = 0.6
    p = np.linspace(0, 1, n(L))
    x = sweep(noise(L), "bandpass", 900, 9000) * (p ** 2.5) * np.exp(-np.maximum(0, p - 0.85) / 0.04) * 0.6
    x += sine(midi(84) * (1 + 0.5 * p), L) * (p ** 3) * 0.08
    return x, L * 0.85


def ding():
    """Success chime: two soft partials (C6 + G6), Apple-ish."""
    L = 1.4
    x = sine(midi(84), L) * np.exp(-t_(L) / 0.45) * 0.22 + sine(midi(91), L) * np.exp(-t_(L) / 0.35) * 0.15
    x += sine(midi(96), L) * np.exp(-t_(L) / 0.12) * 0.06
    return x * adsr(L, 0.004, 0.2), 0.0


def glass():
    s, a = whoosh(0.45, 2.2)
    return filt(s, "highpass", 900) * 0.7, a




# ---- Apple-like palette: sine-based, short, soft transients, no noise cracks ----
def tap():
    """Soft UI touch: a muted wooden tick, rounded off."""
    L = 0.07
    x = sine(1650 * (1 + 0.15 * np.exp(-t_(L) / 0.004)), L) * np.exp(-t_(L) / 0.009) * 0.45
    x += filt(noise(L), "bandpass", [2000, 6000]) * np.exp(-t_(L) / 0.0012) * 0.18
    return filt(x, "lowpass", 7000) * adsr(L, 0.0004, 0.01), 0.0


def glint(step=0):
    """Tiny glassy tone, pitched up a minor-pentatonic ladder in F."""
    L = 0.32
    f = midi(84 + [0, 3, 5, 7, 10, 12, 15][step % 7])
    x = sine(f, L) * np.exp(-t_(L) / 0.07) * 0.28 + sine(f * 2.01, L) * np.exp(-t_(L) / 0.03) * 0.08
    return x * adsr(L, 0.002, 0.05), 0.0


def bloom():
    """Light swelling into a hit: an Fm(add9) sine chord that breathes in, peaks on the beat, glows out."""
    pre, L = 0.18, 1.9
    tt = t_(L)
    env = np.where(tt < pre, (tt / pre) ** 2, np.exp(-(tt - pre) / 0.55))
    x = sum(sine(midi(m) * (1 + 0.0015 * k), L, phase=k) * g for k, (m, g) in enumerate([(65, 0.16), (72, 0.12), (79, 0.08), (84, 0.05)]))
    air = filt(noise(L), "bandpass", [3000, 9000]) * 0.03
    s = np.stack([x * 1.0 + air, x * 0.95 + air[::-1]], axis=1) * env[:, None]
    return s, pre


def air(dir=1):
    """A light line passing: filtered breath that sweeps up and travels across the stereo field."""
    L = 0.55
    p = np.linspace(0, 1, n(L))
    env = np.sin(np.pi * p) ** 2
    x = sweep(noise(L), "bandpass", 500, 3800, order=2) * env * 0.5
    x += sine(midi(91) * (0.97 + 0.06 * p), L) * env * 0.035
    g = p if dir > 0 else 1 - p
    return np.stack([x * np.cos(g * np.pi / 2), x * np.sin(g * np.pi / 2)], axis=1), L * 0.5


def thump():
    """Soft sub hit: felt, not heard. No click, no crack."""
    L = 0.9
    f = 44 + 38 * np.exp(-t_(L) / 0.05)
    x = sine(f, L) * np.exp(-t_(L) / 0.32) + sine(f * 2, L) * np.exp(-t_(L) / 0.08) * 0.25
    return np.tanh(1.2 * x) * 0.75 * adsr(L, 0.003, 0.1), 0.0


def shimmer():
    """Hairline ring: a high glassy partial cluster with slow beating."""
    L = 1.4
    x = sum(sine(midi(m) * d, L) for m, d in ((96, 1.0), (96, 1.004), (103, 1.0))) * np.exp(-t_(L) / 0.4) * 0.06
    return x * adsr(L, 0.01, 0.2), 0.0



# ---- motion-design accents (film3): punchy but clean ----
def slam():
    """Word slam: a short tonal punch + a tight air transient. Lands exactly on the anchor."""
    L = 0.35
    f = 90 + 260 * np.exp(-t_(L) / 0.012)
    x = sine(f, L) * np.exp(-t_(L) / 0.07) * 0.6
    x += filt(noise(L), "bandpass", [1500, 8000]) * np.exp(-t_(L) / 0.006) * 0.35
    return np.tanh(1.4 * x), 0.0


def zip_(dir=1):
    """Shape flying: a fast pitched sweep (up or down) with a breathy edge, peaks on the anchor."""
    L = 0.22
    p = np.linspace(0, 1, n(L))
    f = (700 + 2400 * p) if dir > 0 else (3100 - 2400 * p)
    x = sine(f, L) * 0.12 + sweep(noise(L), "bandpass", 1200, 7000) * 0.25
    env = (p / 0.8) ** 2 * (p < 0.8) + np.exp(-(p - 0.8) / 0.05) * (p >= 0.8)
    return x * env, L * 0.8


def sparkle():
    """A scatter of glints after a big hit: 7 tiny tones up the F minor pentatonic, panned wide."""
    L = 0.9
    out = np.zeros((n(L), 2))
    for j in range(7):
        g, _ = glint(j)
        place(out, pan(g * 0.7, -0.8 + j * 0.27), 0.045 * j)
    return out, 0.0


GEN = {"key": key, "select": select, "send": send, "ding": ding, "glass": glass,"click": click, "press": press, "release": release, "tick": tick, "wheel": wheel, "blip": blip, "pop": pop,
       "whoosh": whoosh, "whoosh-s": whoosh_s, "whoosh-long": lambda: whoosh(1.1), "swipe": swipe, "open": open_,
       "impact": impact, "clap": clap,
       "tap": tap, "glint": glint, "bloom": bloom, "air": air, "thump": thump, "shimmer": shimmer,
       "slam": slam, "zip": zip_, "sparkle": sparkle}

sfx = np.zeros_like(music)
log = []
for c in cues:
    g = GEN[c["type"]]
    kw = {}
    if c["type"] in ("blip", "glint"):
        kw["step"] = c.get("step", 0)
    if c["type"] == "key":
        kw["var"] = c.get("var", 0)
    if c["type"] in ("air", "zip"):
        kw["dir"] = c.get("dir", 1)
    if c["type"] == "whoosh" and "len" in c:
        kw["len"] = c["len"]
    sig, anchor = g(**kw)
    if sig.ndim == 1:
        sig = pan(sig, c.get("pan", 0))
    at = beat_time(c["beat"])
    place(sfx, sig * c.get("gain", 1), at - anchor)
    log.append((c["beat"], c["type"], round(at, 4)))

sfx = reverb(sfx, 1.6, 0.45, 0.2, hp=500)  # one shared, airy room: everything sits in the same space
mix = music * 0.85 + sfx * 0.8

# ---- master: loudness to -14 LUFS, true peak <= -1 dBTP ----
meter = pyln.Meter(SR)
target = -14.0


def true_peak_db(x):
    up = resample_poly(x, 4, 1, axis=0)
    return 20 * np.log10(np.abs(up).max() + 1e-12)


y = mix.copy()
for _ in range(4):
    y = y * db(target - meter.integrated_loudness(y))
    y = limiter(y, ceiling_db=-2.4)
lufs, tp = meter.integrated_loudness(y), true_peak_db(y)
write_wav(out_path, y)
json.dump({"lufs": round(lufs, 2), "true_peak_dbtp": round(tp, 2), "cues": log}, open(out_path.replace(".wav", ".json"), "w"), indent=1)
print(f"mix: {lufs:.2f} LUFS, true peak {tp:.2f} dBTP, {len(cues)} cues")
