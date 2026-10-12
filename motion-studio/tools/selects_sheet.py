"""Contact sheet of each clip's chosen window: 3 frames (in / mid / out) per clip -> out/broll-selects.png"""
import json, subprocess, io
from PIL import Image, ImageDraw, ImageFont
sel = json.load(open("assets/broll/selects.json"))
TW, TH = 150, 267
cols = 4
cellw, cellh = 3 * TW + 8, TH + 40
sheet = Image.new("RGB", (cols * cellw + 20, ((len(sel) + cols - 1) // cols) * cellh + 20), (17, 17, 17))
d = ImageDraw.Draw(sheet)
try: font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)
except Exception: font = ImageFont.load_default()
for k, c in enumerate(sel):
    x0, y0 = 10 + (k % cols) * cellw, 10 + (k // cols) * cellh
    for j, t in enumerate([c["in"], (c["in"] + c["out"]) / 2, c["out"] - 0.05]):
        png = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(t), "-i", f"assets/broll/{c['slug']}.mp4", "-frames:v", "1", "-vf", f"scale={TW}:{TH}", "-f", "image2", "-c:v", "png", "-"], capture_output=True).stdout
        sheet.paste(Image.open(io.BytesIO(png)).convert("RGB"), (x0 + j * TW, y0))
    d.text((x0, y0 + TH + 4), f"#{k+1} [{c['slug']}] {c['name'][:30]}", fill=(240, 240, 240), font=font)
    d.text((x0, y0 + TH + 21), f"{c['in']:.1f}-{c['out']:.1f}s  score {c['score']}", fill=(150, 150, 150), font=font)
sheet.save("out/broll-selects.png")
print(sheet.size)
