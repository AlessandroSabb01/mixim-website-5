"""Import-Rama ads v3 mix (shaped sound design, from the Création Virale v6 mixer).
Voice leads; SFX sit ~7 dB under it (3 dB hotter than v2), music ducks while he speaks and around the hits.
Création Virale v6 notes: Sound design in the manner of the Doks.ai reference: few sounds, each one shaped.
Recorded CC0 sources (sound-effects skill library) are filtered, pitched, sent to one shared hall and tucked under a
sub-heavy track: airy whooshes that peak on the cut, soft glass taps for UI, a low sine under the big moves,
reversed swells into scene changes. Music ducks 2-3 dB around the big hits. Master -14 LUFS, true peak < -1.5 dBTP.
Usage: VO_FILE=... VO_OFF=0.15 python3 audio/mix9.py music.wav beats.json cues.json mix.wav
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
IMP = "impact/fs-177242-cinematic-impact.ogg"
def whoosh(t, g, p, v, lv=-15, hp=220, rev=0.35):
    x = lib(WHOOSH[v % 3]); x = filt(filt(x, "highpass", hp), "lowpass", 7500); x = fade(x[: n(1.8)], 0.05, 0.4)
    put(x, t - peak_t(x), db(lv) * g, p, rev)
def hit(t, g, p, big):
    put(sine_drop(64 if big else 58, 38 if big else 42, 1.0 if big else 0.4, 0.18 if big else 0.08), t, db(-10 if big else -13) * g, 0, 0)
    x = filt(lib(IMP if big else "impact/kenney-impact-impactsoft-heavy-000.ogg")[: n(1.4)], "lowpass", 1400 if big else 700)
    put(fade(x, 0.002, 0.5 if big else 0.15), t, db(-15 if big else -12) * g, p, 0.45 if big else 0.3)
    duck_at(t, (3.0 if big else 1.8) * g, 0.1, 0.3)
cues = json.load(open(cues_path)); k = 0
for c in cues:
    t, g, p, ty = c["t"], c.get("gain", 1), c.get("pan", 0), c["type"]; k += 1
    if ty in ("whoosh", "send"): whoosh(t, g, p, k, -13)
    elif ty == "zip": whoosh(t, g, p, 2, -16, 600, 0.25)
    elif ty == "air":                                             # reversed hall swell + a soft pass into the cut
        d = 0.6; src = lib(IMP)[: n(0.5)]
        tail = np.stack([fftconvolve(src[:, q], HALL[:, q]) for q in range(2)], 1)[: n(d)]; tail = filt(tail / np.abs(tail).max(), "highpass", 300)[::-1]
        put(fade(tail, 0.02, 0.012), t - d + 0.2, db(-19) * g, p, 0.15); whoosh(t + 0.2, g, c.get("dir", 1) * 0.3, k, -17)
    elif ty in ("thump", "impact", "clap"): hit(t, g, p, ty != "thump" or g >= 0.7)
    elif ty == "slam": hit(t, g, p, False); put(fade(pitch(lib("ding/kenney-interface-glass-002.ogg"), -5), 0.001, 0.06), t, db(-24) * g, p, 0.6)
    elif ty in ("pop", "select"):
        x = pitch(lib("pop/kenney-interface-drop-002.ogg"), (k % 5) - 2); put(fade(filt(x, "lowpass", 6000), 0.001, 0.06), t, db(-16) * g, p, 0.55)
        put(fade(pitch(lib("ding/kenney-interface-glass-002.ogg"), k % 5), 0.001, 0.05), t, db(-24) * g, p, 0.9)
    elif ty in ("tap", "key"): put(fade(filt(lib("tick/fs721514.ogg"), "highpass", 1500), 0.001, 0.02), t, db(-22) * g, p, 0.5)
    elif ty == "glint":
        x = pitch(lib("ding/kenney-interface-glass-001.ogg"), c.get("step", 0) * 2 - 1); put(fade(filt(x, "highpass", 700), 0.001, 0.12), t, db(-21) * g, p, 0.9)
    elif ty in ("sparkle", "shimmer"):
        x = pitch(lib("ding/fs-349504-triangle-open-04.ogg")[: n(2.5)], 7); put(fade(filt(x, "highpass", 2500), 0.01, 1.0), t, db(-24) * g, p, 1.2)
    elif ty == "bloom":
        x = filt(lib("ding/fs-349504-triangle-open-04.ogg")[: n(2.2)], "highpass", 900); r = fade(x[: n(0.7)][::-1], 0.2, 0.01)
        put(r, t - 0.7, db(-23) * g, p, 1.0); put(fade(x, 0.004, 1.2), t, db(-22) * g, p, 1.3)
    elif ty == "typing":
        d = c.get("dur", 1.0); x = lib("typing/fs-447909-keyboard-typing.ogg"); a0 = n(0.4); x = filt(x[a0:a0 + n(d)], "highpass", 900)
        put(fade(x, 0.01, 0.05), t, db(-24) * g, p, 0.25)
    else: put(fade(filt(lib("click/kenney-interface-click-001.ogg"), "highpass", 500), 0.001, 0.03), t, db(-17) * g, p, 0.3)

wet = np.stack([fftconvolve(send[:, q], HALL[:, q])[:N] for q in range(2)], 1) * 0.5
sfx = dry + wet
meter = pyln.Meter(SR)
vtrack = np.zeros_like(music)
if os.environ.get("VO_FILE"): place(vtrack, load(os.environ["VO_FILE"]), float(os.environ.get("VO_OFF", "0")))
lv = meter.integrated_loudness(vtrack) if os.environ.get("VO_FILE") else -16.0
music = music * db(lv - 9 - meter.integrated_loudness(music))
sfx = sfx * db(lv - 7 - meter.integrated_loudness(sfx))
e = np.abs(vtrack).max(axis=1); kk = n(0.12); e = np.convolve(e, np.ones(kk) / kk, mode="same")
speak = np.clip(e / (e.max() * 0.08 + 1e-9), 0, 1); gg = np.zeros_like(speak); cur = 0.0
for i in range(0, len(speak), 64):
    tgt = speak[i]; a = 64 / (n(0.04) if tgt > cur else n(0.3)); cur += (tgt - cur) * min(1, a); gg[i:i + 64] = cur
kd = n(0.01); dk = np.convolve(duck, np.ones(kd) / kd, "same")
mix = music * db(-7 * gg - dk)[:, None] + sfx * db(-2 * gg)[:, None] + vtrack
def true_peak_db(x): return 20 * np.log10(np.abs(resample_poly(x, 4, 1, axis=0)).max() + 1e-12)
y = mix.copy()
for _ in range(4):
    y = y * db(-14.0 - meter.integrated_loudness(y)); y = limiter(y, ceiling_db=-2.0)
write_wav(out_path, y)
mus = json.load(open(music_path.replace(".wav", ".json"))) if os.path.exists(music_path.replace(".wav", ".json")) else {}
with open(out_path.replace(".wav", "-CREDITS.txt"), "w") as fh:
    fh.write(f"Music: {mus.get('track', '?')}, {mus.get('license', '?')}\nSound effects (CC0 1.0, credit optional):\n")
    for f, e in sorted(used.items()): fh.write(f"- {e.get('attribution', f)} {e.get('source_url', '')}\n")
print(f"mix9: {meter.integrated_loudness(y):.2f} LUFS, true peak {true_peak_db(y):.2f} dBTP, {len(cues)} cues, {len(used)} sources")
