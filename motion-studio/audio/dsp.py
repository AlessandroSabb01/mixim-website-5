"""Small deterministic DSP toolkit shared by music.py and mix.py (48 kHz, float64, stereo = (n, 2))."""
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
BPM = 120
BEAT = 60 / BPM
LENGTH = 20.0
rng = np.random.default_rng(20261011)  # seeded: identical output every run


def n(sec):
    return int(round(sec * SR))


def buf(sec=LENGTH):
    return np.zeros((n(sec), 2))


def env_exp(length, decay):
    t = np.arange(n(length)) / SR
    return np.exp(-t / decay)


def adsr(length, a=0.005, r=0.05):
    m = n(length)
    e = np.ones(m)
    ai, ri = max(1, n(a)), max(1, n(r))
    e[:ai] = np.linspace(0, 1, ai)
    e[-ri:] *= np.linspace(1, 0, ri)
    return e


def noise(length):
    return rng.standard_normal(n(length))


def filt(x, kind, f, order=2):
    f = np.asarray(f, dtype=float) / (SR / 2)
    sos = butter(order, f if f.ndim else float(f), btype=kind, output="sos")
    return sosfilt(sos, x, axis=0)


def sweep(x, kind, f0, f1, order=2, block=256):
    """Time-varying Butterworth filter, cutoff glides exponentially f0 -> f1 (or a callable of 0..1)."""
    out = np.zeros_like(x)
    zi = None
    m = len(x)
    for s in range(0, m, block):
        p = s / max(1, m - 1)
        fc = f0(p) if callable(f0) else f0 * (f1 / f0) ** p
        if kind == "bandpass":
            fc = np.array([fc / 1.5, min(fc * 1.5, SR / 2 - 100)])
        w = np.asarray(fc, dtype=float) / (SR / 2)
        sos = butter(order, w if w.ndim else float(w), btype=kind, output="sos")
        if zi is None:
            zi = np.zeros((sos.shape[0], 2))
        out[s:s + block], zi = sosfilt(sos, x[s:s + block], zi=zi)
    return out


def saw(freq, length, phase=0.0):
    t = np.arange(n(length)) / SR
    ph = (np.cumsum(np.full(len(t), freq) if np.isscalar(freq) else freq) / SR + phase) % 1.0
    # polyBLEP-free but band-limited enough after the lowpass filters we use
    return 2 * ph - 1


def sine(freq, length, phase=0.0):
    f = np.full(n(length), freq) if np.isscalar(freq) else freq
    return np.sin(2 * np.pi * (np.cumsum(f) / SR) + phase)


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def pan(mono, p=0.0):
    """Equal-power pan, p in [-1, 1]."""
    a = (p + 1) * np.pi / 4
    return np.stack([mono * np.cos(a), mono * np.sin(a)], axis=1)


def place(dst, src, t, gain=1.0):
    i = n(t)
    if i >= len(dst):
        return
    if i < 0:
        src, i = src[-i:], 0
    m = min(len(src), len(dst) - i)
    if src.ndim == 1:
        src = pan(src)
    dst[i:i + m] += src[:m] * gain


def reverb(x, seconds=1.8, decay=0.45, wet=0.25, hp=250):
    """Convolution with a seeded, stereo-decorrelated exponential noise tail."""
    m = n(seconds)
    t = np.arange(m) / SR
    tail = np.exp(-t / decay)
    ir = np.stack([rng.standard_normal(m) * tail, rng.standard_normal(m) * tail], axis=1)
    ir = filt(ir, "lowpass", 6000)
    ir /= np.sqrt((ir ** 2).sum(axis=0))
    src = filt(x, "highpass", hp)
    w = np.stack([fftconvolve(src[:, c], ir[:, c])[: len(x)] for c in range(2)], axis=1)
    return x * (1 - wet * 0.3) + w * wet


def db(x):
    return 10 ** (x / 20)


def limiter(x, ceiling_db=-1.0, look=0.004, release=0.06):
    """Look-ahead peak limiter (sample-peak; we oversample-check true peak afterwards)."""
    c = db(ceiling_db)
    peak = np.abs(x).max(axis=1)
    need = np.minimum(1.0, c / np.maximum(peak, 1e-9))
    L = n(look)
    # min over look-ahead window
    from scipy.ndimage import minimum_filter1d
    g = minimum_filter1d(need, size=2 * L + 1, mode="nearest")
    # smooth release (one-pole on the way up only)
    out = np.empty_like(g)
    a = np.exp(-1 / (release * SR))
    cur = 1.0
    for i in range(len(g)):  # ~1M samples, fine
        cur = g[i] if g[i] < cur else a * cur + (1 - a) * g[i]
        out[i] = cur
    return x * out[:, None]


def write_wav(path, x):
    import soundfile as sf
    sf.write(path, x.astype(np.float32), SR, subtype="FLOAT")
