#!/usr/bin/env python3
"""Grade the Silverstone SkySat plate to the Cobra palette.

Not a resize — Astro handles those. This is a crop, a 90-degree rotation and a
duotone ramp, documented in prototype/trackmap/assets/LICENSE-imagery.md.
Output is CC BY-SA 4.0, same as the source.

Requires Pillow (PIL) on whichever `python3` the `env` shebang resolves to.
That is a PATH-dependent choice, not necessarily the interpreter Pillow was
installed for — see the import guard below for the concrete fix if this
exits immediately with an import error.
"""
import sys

try:
    from PIL import Image, ImageEnhance
except ImportError:
    sys.exit(
        "error: Pillow is required but not installed for this interpreter "
        f"({sys.executable}).\n"
        "  - If another interpreter on this machine already has it "
        "(e.g. /usr/bin/python3 on macOS), run:\n"
        "        /usr/bin/python3 tools/grade-plate.py <master.jpg> <out.jpg>\n"
        "  - Otherwise, install it for this interpreter:\n"
        "        python3 -m pip install Pillow"
    )

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
