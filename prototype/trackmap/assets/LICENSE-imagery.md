# Track Map imagery — licence and attribution

## Source

**Silverstone Circuit, July 2, 2018 SkySat**
https://commons.wikimedia.org/wiki/File:Silverstone_Circuit,_July_2,_2018_SkySat.jpg

- Author: **Planet Labs, Inc.**
- Captured: 2 July 2018, SkySat satellite, nadir
- Master: 4000 × 2249 px, 2.4 MB JPEG
- Licence: **CC BY-SA 4.0** — https://creativecommons.org/licenses/by-sa/4.0/
- Attribution required: yes

## Derivatives in this folder

`track-wide.webp` (2060 × 1220) and `track-wide-1x.webp` (1030 × 610) are adapted
from the master above. The adaptation is: crop to the circuit, rotate 90° clockwise,
desaturate, apply a tone curve, and map to a duotone ramp between `#0A0A0A` and
`#D6CEC4` to match the Cobra Race palette.

**These derivatives are themselves licensed CC BY-SA 4.0.** Share-alike is not
optional — anyone redistributing them, modified or not, must do so under the same
licence and must credit Planet Labs, Inc.

This obligation attaches to these image files only. It does not extend to the
site's code, design, typography, or any other content in this repository.

## What the site must state

The Track Map page carries a persistent credit naming Planet Labs, Inc., the
licence, and a link to it. The caption also states that the circuit is
**illustrative and not the team's race venue** — the team's venue is not confirmed,
and the site does not imply one.

## Rejected sources, recorded so they are not revisited

| Source | Why not |
|---|---|
| Google Maps / Earth, Apple Maps, Esri World Imagery | Cannot be redistributed at any licence tier available to us |
| Copernicus Sentinel-2 | Open, but 10 m/px — the whole 5.9 km circuit lands in roughly 600 px |
| Environment Agency Vertical Aerial Photography (OGL) | Better licence, 10–50 cm, but coverage is project-based and Silverstone coverage is unverified. Worth revisiting if a wider plate is ever needed. |

## Reproducing the derivatives

The master is not committed to this repository. To regenerate:

```bash
curl -L -o master.jpg 'https://upload.wikimedia.org/wikipedia/commons/d/da/Silverstone_Circuit%2C_July_2%2C_2018_SkySat.jpg'
```

Then apply the crop, rotation and grade described above with Pillow. The exact
parameters are: crop `(1180, 60, 3080, 2249)`, `ROTATE_270`, colour `0.06`,
contrast `1.18`, tone curve `x**1.55 * 0.82 + 0.02`, second crop `(100, 200, 2160, 1420)`.
