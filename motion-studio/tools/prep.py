"""Derive animation layers from the real screenshots (no redrawing: every pixel comes from a capture).

- Keyed text layers: alpha = how far a pixel departs from the clean background plate (hero-bg.png),
  colour un-premultiplied. Composited back over the plate at rest they reproduce the screenshot.
- 3x card plate: the chart bars removed by filling their box with the card's own flat colour (#141414),
  so the real bar crops can grow back on top.
Writes assets/derived/*.png and assets/derived/geometry.json
"""
import json
import numpy as np
from PIL import Image

ST = "assets/states/"
OUT = "assets/derived/"
DPR = 3
meta = json.load(open(ST + "meta.json"))
hero = np.asarray(Image.open(ST + "hero.png").convert("RGB")).astype(float)
plate = np.asarray(Image.open(ST + "hero-bg.png").convert("RGB")).astype(float)
parts = {p["id"]: [p["x"], p["y"], p["w"], p["h"]] for p in meta["hero"]["parts"]}
parts["pill"][2] = 273  # measured tight width (the DOM box is the full-width row)
parts["para"][2] = 383
parts["note"][2] = 383
geo = {"hero": {}, "dpr": DPR}


def px(r, pad=0):
    x, y, w, h = r
    return [int(np.floor((x - pad) * DPR)), int(np.floor((y - pad) * DPR)), int(np.ceil((x + w + pad) * DPR)), int(np.ceil((y + h + pad) * DPR))]


def keyed(name, r):
    x0, y0, x1, y1 = px(r, 0 if name.startswith('h1') else 2)
    c, b = hero[y0:y1, x0:x1], plate[y0:y1, x0:x1]
    lum = lambda a: a @ np.array([0.2126, 0.7152, 0.0722])
    a = np.clip((lum(c) - lum(b)) / np.maximum(255 - lum(b), 1), 0, 1)
    a = np.clip((a - 0.035) / 0.965, 0, 1)  # plate noise floor -> fully transparent
    rgb = np.where(a[..., None] > 0.004, (c - b * (1 - a[..., None])) / np.maximum(a[..., None], 1e-3), 255)
    img = np.dstack([np.clip(rgb, 0, 255), a * 255]).astype(np.uint8)
    Image.fromarray(img, "RGBA").save(OUT + f"hero-{name}.png")
    geo["hero"][name] = {"x": x0 / DPR, "y": y0 / DPR, "w": (x1 - x0) / DPR, "h": (y1 - y0) / DPR, "keyed": True}


def opaque(name, r, src="hero.png", pad=0):
    x0, y0, x1, y1 = px(r, pad)
    Image.open(ST + src).convert("RGB").crop((x0, y0, x1, y1)).save(OUT + f"hero-{name}.png")
    geo["hero"][name] = {"x": x0 / DPR, "y": y0 / DPR, "w": (x1 - x0) / DPR, "h": (y1 - y0) / DPR, "keyed": False}


import os
os.makedirs(OUT, exist_ok=True)
# split the headline into lines at the emptiest rows between them (DOM line boxes overlap)
y0, y1 = int(parts["h1-0"][1] * DPR), int((parts["h1-2"][1] + parts["h1-2"][3]) * DPR)
x0, x1 = int(18 * DPR), int(410 * DPR)
ink = (np.abs(hero[y0:y1, x0:x1] - plate[y0:y1, x0:x1]).max(axis=2) > 40).sum(axis=1)
cuts = []
for k in (1, 2):
    c = int(parts[f"h1-{k}"][1] * DPR) - y0 + 12  # search near the next line's top
    win = ink[c - 30:c + 30]
    cuts.append(y0 + c - 30 + int(np.argmin(win)))
bands = [y0, *cuts, y1]
for k in range(3):
    parts[f"h1-{k}"] = [18, bands[k] / DPR, 392, (bands[k + 1] - bands[k]) / DPR - 0.01]
for k in ["logo", "menu", "h1-0", "h1-1", "h1-2", "para", "note"]:
    keyed(k, parts[k])
for k in ["pill", "cta", "badge+100", "badge+40K", "badge+30K"]:
    opaque(k, parts[k])
opaque("photo", parts["photo"], src="hero-nobadges.png")
Image.open(ST + "hero-bg.png").convert("RGB").save(OUT + "hero-plate.png")

# ---- 3x card: plate without bars + one crop per bar (element screenshot, 390x301 css) ----
card = np.asarray(Image.open(ST + "card3-030.png").convert("RGB")).copy()
bars = [(75, 204), (222, 354), (372, 501), (519, 651), (669, 798), (816, 948), (966, 1095)]
top_y = [633, 600, 612, 564, 531, 489, 411]
bottom = 700
geo["card3"] = {"w": card.shape[1] / DPR, "h": card.shape[0] / DPR, "bars": []}
for (x0, x1), y0 in zip(bars, top_y):
    x0, x1, y0 = x0 - 3, x1 + 3, y0 - 4
    Image.fromarray(card[y0:bottom, x0:x1]).save(OUT + f"bar{len(geo['card3']['bars'])}.png")
    geo["card3"]["bars"].append({"x": x0 / DPR, "y": y0 / DPR, "w": (x1 - x0) / DPR, "h": (bottom - y0) / DPR})
card[395:bottom, 60:1110] = (20, 20, 20)
# the "3x" glyphs pop on their own layer; find them and the dark gap between "3" and "x" for the zoom-through
L = np.asarray(Image.open(ST + "card3-030.png").convert("L")).astype(int)
ys, xs = np.where(L[:220] > 200)
bx0, by0, bx1, by1 = xs.min() - 6, ys.min() - 6, xs.max() + 7, ys.max() + 7
Image.open(ST + "card3-030.png").convert("RGB").crop((bx0, by0, bx1, by1)).save(OUT + "card3-3x.png")
card[by0:by1, bx0:bx1] = (20, 20, 20)
Image.fromarray(card).save(OUT + "card3-plate.png")
colink = (L[by0:by1, bx0:bx1] > 60).sum(axis=0)
mid = len(colink) // 2
gapx = bx0 + mid - 25 + int(np.argmin(colink[mid - 25: mid + 25]))
geo["card3"]["big"] = {"x": bx0 / DPR, "y": by0 / DPR, "w": (bx1 - bx0) / DPR, "h": (by1 - by0) / DPR,
                       "gapx": gapx / DPR, "gapy": (by0 + by1) / 2 / DPR}

# ---- lightbox video rect + clicked thumbnail (viewport screenshots) ----
geo["lightbox"] = {"x": 51 / DPR, "y": 294 / DPR, "w": (1238 - 51) / DPR, "h": (2486 - 294) / DPR}
geo["thumb"] = meta["thumbBox"]
json.dump(geo, open(OUT + "geometry.json", "w"), indent=1)
print(json.dumps(geo["hero"], indent=0)[:800])
print("card3", geo["card3"]["big"], len(geo["card3"]["bars"]))
