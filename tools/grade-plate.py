#!/usr/bin/env python3
"""Grade the Silverstone SkySat plate to the Cobra palette.

Not a resize — Astro handles those. This is a crop, a 90-degree rotation and a
duotone ramp, documented in prototype/trackmap/assets/LICENSE-imagery.md.
Output is CC BY-SA 4.0, same as the source.
"""
import sys
from PIL import Image, ImageEnhance

CROP = (1180, 60, 3080, 2249)
BOX = (100, 200, 2160, 1420)
INK, TOP = (10, 10, 10), (214, 206, 196)

def grade(src_path, out_path):
    im = Image.open(src_path).convert("RGB").crop(CROP)
    im = ImageEnhance.Contrast(ImageEnhance.Color(im).enhance(0.06)).enhance(1.18)
    lum = im.convert("L")
    lut = [[], [], []]
    for v in range(256):
        t = (v / 255.0) ** 1.55 * 0.82 + 0.02
        for c in range(3):
            lut[c].append(int(INK[c] + (TOP[c] - INK[c]) * t))
    duo = Image.merge("RGB", (lum.point(lut[0]), lum.point(lut[1]), lum.point(lut[2])))
    duo.transpose(Image.ROTATE_270).crop(BOX).save(out_path, quality=88)
    print(f"wrote {out_path}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit("usage: grade-plate.py <master.jpg> <out.jpg>")
    grade(sys.argv[1], sys.argv[2])
