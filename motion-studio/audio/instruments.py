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


