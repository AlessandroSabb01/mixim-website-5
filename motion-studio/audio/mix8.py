"""Création Virale v6 mix. Sound design in the manner of the Doks.ai reference: few sounds, each one shaped.
Recorded CC0 sources (sound-effects skill library) are filtered, pitched, sent to one shared hall and tucked under a
sub-heavy track: airy whooshes that peak on the cut, soft glass taps for UI, a low sine under the big moves,
reversed swells into scene changes. Music ducks 2-3 dB around the big hits. Master -14 LUFS, true peak < -1.5 dBTP.
Usage: python3 audio/mix8.py build/music8.wav beats8.json build/cues-v6.json build/mix-v6.wav
"""
import json, os, subprocess, sys
import numpy as np, pyloudnorm as pyln
from scipy.signal import resample_poly, fftconvolve, butter, sosfiltfilt
from dsp import SR, n, place, db, limiter, write_wav

music_path, _b, cues_path, out_path = sys.argv[1:5]
ROOT = os.path.join(os.path.dirname(__file__), ".."); LIB = os.path.join(ROOT, ".agents", "skills", "sound-effects", "sfx")
MAN = {e["file"]: e for e in json.load(open(os.path.join(LIB, "manifest.json")))["bundled"]}
used = {}
def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)
_c = {}
def lib(f):
    if f not in _c:
        x = load(os.path.join(LIB, f)); _c[f] = x / (np.abs(x).max() + 1e-9)
    used[f] = MAN.get(f, {"attribution": f}); return _c[f].copy()
def filt(x, kind, f, order=2): return sosfiltfilt(butter(order, f, kind, fs=SR, output="sos"), x, axis=0)
def fade(x, a=0.004, r=0.03):
    x = x.copy(); i, o = min(len(x), n(a)), min(len(x), n(r)); x[:i] *= np.linspace(0, 1, i)[:, None]; x[-o:] *= np.linspace(1, 0, o)[:, None] ** 2; return x
def pitch(x, semis):
    r = 2 ** (semis / 12); L = max(8, int(len(x) / r)); idx = np.linspace(0, len(x) - 1, L)
    return np.stack([np.interp(idx, np.arange(len(x)), x[:, c]) for c in range(2)], 1)
def pan(x, p): a = (p + 1) * np.pi / 4; return x * np.array([np.cos(a), np.sin(a)]) * np.sqrt(2)
def peak_t(x):
    e = np.abs(x).max(1); k = n(0.03); e = np.convolve(e, np.ones(k) / k, "same"); return np.argmax(e) / SR
rng = np.random.default_rng(11)
def hall(sec=2.4, decay=0.55):
    L = n(sec); t = np.arange(L) / SR; ir = rng.standard_normal((L, 2)) * np.exp(-t / decay)[:, None]
    ir = filt(filt(ir, "lowpass", 7000), "highpass", 350); ir[: n(0.012)] *= 0.2; return ir / np.sqrt((ir ** 2).sum(0))
HALL = hall()
music = load(music_path); N = len(music)
dry, send = np.zeros((N, 2)), np.zeros((N, 2)); duck = np.zeros(N)
def put(x, t, gain, p=0.0, rev=0.25):
    x = pan(x, p) * gain; place(dry, x, t); place(send, x * rev, t)
def sine_drop(f0, f1, length, curve=0.18):
    t = np.arange(n(length)) / SR; f = f1 + (f0 - f1) * np.exp(-t / curve); ph = 2 * np.pi * np.cumsum(f) / SR
    env = np.minimum(1, t / 0.006) * np.exp(-t / (length * 0.38)); return np.stack([np.sin(ph) * env] * 2, 1)
def duck_at(t, depth, hold=0.12, rel=0.35):
    i = n(t); a = n(0.02); h = n(hold); r = n(rel); env = np.concatenate([np.linspace(0, 1, a), np.ones(h), np.linspace(1, 0, r) ** 2]) * depth
    i0 = max(0, i - a); m = min(len(env), N - i0); duck[i0:i0 + m] = np.maximum(duck[i0:i0 + m], env[:m])

WHOOSH = ["whoosh/fs-169867-swoosh.ogg", "transition/fs-683096-woosh.ogg", "whoosh/fs-683101-quick-woosh.ogg"]
cues = json.load(open(cues_path))
for c in cues:
    t, g, p, ty = c["t"], c.get("gain", 1), c.get("pan", 0), c["type"]
    if ty == "whoosh":                                            # airy pass, its loudest point lands on the cut
        x = lib(WHOOSH[c.get("v", 0) % 3]); x = filt(filt(x, "highpass", 220), "lowpass", 7500); x = fade(x[: n(1.8)], 0.05, 0.4)
        put(x, t - peak_t(x), db(-15) * g, p, 0.35)
    elif ty == "swell":                                           # a hall tail played backwards into the moment
        d = c.get("dur", 1.0); src = lib("impact/fs-177242-cinematic-impact.ogg")[: n(0.5)]
        tail = np.stack([fftconvolve(src[:, k], HALL[:, k]) for k in range(2)], 1)[: n(d)]; tail = filt(tail / np.abs(tail).max(), "highpass", 300)[::-1]
        put(fade(tail, 0.02, 0.012), t - d, db(-17) * g, p, 0.15)
    elif ty == "sub":                                             # felt more than heard
        put(sine_drop(64, 38, 1.1), t, db(-9) * g, 0, 0.0)
        x = filt(lib("impact/fs-177242-cinematic-impact.ogg")[: n(1.6)], "lowpass", 900); put(fade(x, 0.003, 0.6), t, db(-17) * g, 0, 0.5); duck_at(t, 3.0 * g)
    elif ty == "thud":
        x = filt(lib("impact/kenney-impact-impactsoft-heavy-000.ogg"), "lowpass", 650); put(fade(x, 0.002, 0.15), t, db(-13) * g, p, 0.3)
        put(sine_drop(58, 42, 0.35, 0.08), t, db(-13) * g, 0, 0); duck_at(t, 1.8 * g, 0.06, 0.22)
    elif ty == "tick":
        x = filt(lib("tick/fs721514.ogg"), "highpass", 1500); put(fade(x, 0.001, 0.02), t, db(-25) * g, p, 0.5)
    elif ty == "click":
        put(fade(filt(lib("click/kenney-interface-click-001.ogg"), "highpass", 500), 0.001, 0.03), t, db(-15) * g, p, 0.3)
        put(fade(pitch(lib("ding/kenney-interface-glass-001.ogg"), 5), 0.001, 0.1), t + 0.03, db(-22) * g, p, 0.8)
    elif ty == "pop":                                             # soft glass tap, a little higher each time
        x = pitch(lib("pop/kenney-interface-drop-002.ogg"), c.get("pitch", 0) - 2); x = filt(x, "lowpass", 6000)
        put(fade(x, 0.001, 0.06), t, db(-19) * g, p, 0.55)
        put(fade(pitch(lib("ding/kenney-interface-glass-002.ogg"), c.get("pitch", 0)), 0.001, 0.05), t, db(-27) * g, p, 0.9)
    elif ty == "blip":
        x = pitch(lib("ding/kenney-interface-glass-001.ogg"), c.get("pitch", 0) - 3); put(fade(filt(x, "highpass", 700), 0.001, 0.12), t, db(-24) * g, p, 0.9)
    elif ty == "shimmer":
        x = pitch(lib("ding/fs-349504-triangle-open-04.ogg")[: n(2.5)], 7); put(fade(filt(x, "highpass", 2500), 0.01, 1.0), t, db(-27) * g, p, 1.2)
    elif ty == "bloom":                                           # the glow: a reversed triangle swelling into a soft bell, all hall
        x = filt(lib("ding/fs-349504-triangle-open-04.ogg")[: n(2.2)], "highpass", 900); r = fade(x[: n(0.7)][::-1], 0.2, 0.01)
        put(r, t - 0.7, db(-26) * g, p, 1.0); put(fade(x, 0.004, 1.2), t, db(-25) * g, p, 1.3)
    elif ty == "typing":
        d = c.get("dur", 1.0); x = lib("typing/fs-447909-keyboard-typing.ogg"); a = n(0.4); x = filt(x[a:a + n(d)], "highpass", 900)
        put(fade(x, 0.01, 0.05), t, db(-27) * g, p, 0.25)
    elif ty == "end":
        put(sine_drop(55, 36, 1.0), t, db(-13) * g, 0, 0)

wet = np.stack([fftconvolve(send[:, k], HALL[:, k])[:N] for k in range(2)], 1) * 0.5
sfx = (dry + wet) * db(4.5)
meter = pyln.Meter(SR)
music = music * db(-16.0 - meter.integrated_loudness(music))
k = n(0.01); dk = np.convolve(duck, np.ones(k) / k, "same")
mix = music * db(-dk)[:, None] + sfx
def true_peak_db(x): return 20 * np.log10(np.abs(resample_poly(x, 4, 1, axis=0)).max() + 1e-12)
y = mix.copy()
for _ in range(4):
    y = y * db(-14.0 - meter.integrated_loudness(y)); y = limiter(y, ceiling_db=-2.6)
write_wav(out_path, y)
write_wav(out_path.replace(".wav", "-sfx.wav"), sfx)
mus = json.load(open(music_path.replace(".wav", ".json"))) if os.path.exists(music_path.replace(".wav", ".json")) else {}
with open(out_path.replace(".wav", "-CREDITS.txt"), "w") as fh:
    fh.write(f"Music: {mus.get('track', '?')}, {mus.get('license', '?')}\nSound effects (CC0 1.0, credit optional):\n")
    for f, e in sorted(used.items()): fh.write(f"- {e.get('attribution', f)} {e.get('source_url', '')}\n")
print(f"mix8: {meter.integrated_loudness(y):.2f} LUFS, true peak {true_peak_db(y):.2f} dBTP, {len(cues)} cues, {len(used)} sources, sfx bus {meter.integrated_loudness(sfx):.1f} LUFS vs music -16, music: {mus.get('track', '?')}")
