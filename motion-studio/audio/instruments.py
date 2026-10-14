"""Shared synth instruments (used by music.py and music2.py)."""
import numpy as np
from dsp import *
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




def keys(m_notes, length, level=0.12, bright=0.35):
    """Glassy electric-piano chord: sine fundamentals + a soft 2nd/3rd partial, fast attack, gentle decay."""
    t = np.arange(n(length)) / SR
    out = np.zeros(n(length))
    for m in m_notes:
        f = midi(m)
        out += sine(f, length) + bright * sine(f * 2, length) * np.exp(-t / 0.08) + 0.12 * sine(f * 3, length) * np.exp(-t / 0.03)
    out /= len(m_notes)
    return out * np.exp(-t / max(0.12, length * 0.6)) * adsr(length, 0.003, 0.04) * level


def snap(level=0.4):
    """Tight finger snap: one short band-limited transient, no tail."""
    L = 0.12
    t = np.arange(n(L)) / SR
    x = filt(noise(L), "bandpass", [1600, 6500]) * np.exp(-t / 0.012)
    x += sine(1900, L) * np.exp(-t / 0.01) * 0.2
    return x * level


def bell_lead(m, length, level=0.07):
    t = np.arange(n(length)) / SR
    f = midi(m)
    x = sine(f, length) + 0.3 * sine(f * 2, length) * np.exp(-t / 0.15) + 0.08 * sine(f * 3.01, length) * np.exp(-t / 0.05)
    return x * np.exp(-t / 0.35) * adsr(length, 0.004, 0.06) * level


# ---------- electro-funk kit (music3) ----------
def kick_punch(level=1.0, length=0.4):
    """Tight club kick: fast pitch dive, short body, a hard click on top, gently saturated."""
    t = np.arange(n(length)) / SR
    f = 48 + 170 * np.exp(-t / 0.025)
    body = sine(f, length) * np.exp(-t / 0.13)
    click = filt(noise(length), "bandpass", [2500, 9000]) * np.exp(-t / 0.0025) * 0.6
    return np.tanh(2.2 * (body + click)) * level


def slap_bass(m, length, level=0.34, bright=2600):
    """Funky synth bass: saw + square through a plucky resonant lowpass, octave-up 'pop' on top."""
    t = np.arange(n(length)) / SR
    f = midi(m)
    x = saw(f, length) * 0.6 + np.sign(sine(f, length)) * 0.35 + sine(f / 2, length) * 0.5
    x = sweep(x, "lowpass", lambda p: 180 + bright * np.exp(-p * length / 0.045), None)
    x += sine(f * 2, length) * np.exp(-t / 0.03) * 0.25
    return np.tanh(1.6 * x) * adsr(length, 0.002, 0.02) * level


def chord_stab(m_notes, length, level=0.16, open_=3800):
    """Filtered house stab: detuned saws with a fast filter pluck."""
    out = np.zeros(n(length))
    for m in m_notes:
        for d in (-0.08, 0.0, 0.08):
            out += saw(midi(m) * 2 ** (d / 12), length, phase=abs(d) * 3)
    out /= 3 * len(m_notes)
    out = sweep(out, "lowpass", lambda p: 350 + open_ * np.exp(-p * length / 0.07), None)
    return out * adsr(length, 0.002, 0.03) * level


def vox(m, length, vowel="a", level=0.1):
    """Vocal-chop stab: a saw through two formant band-passes."""
    F = {"a": (800, 1150), "o": (450, 800), "e": (400, 2000)}[vowel]
    x = saw(midi(m), length)
    y = filt(x, "bandpass", [F[0] * 0.85, F[0] * 1.15]) + 0.7 * filt(x, "bandpass", [F[1] * 0.88, F[1] * 1.12])
    return y * adsr(length, 0.005, 0.05) * level * 3


def crash(level=0.25, length=1.6):
    t = np.arange(n(length)) / SR
    return filt(noise(length), "highpass", 5000) * np.exp(-t / 0.5) * level
