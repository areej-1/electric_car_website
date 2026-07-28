# Car reference — for building the 3D model

Everything here exists so the 3D kart is a faithful reconstruction of the team's
actual car and not an invention. Rule: nothing goes into the model that cannot be
traced to an image in this folder or in the repo.

## The car has two states

This matters more than anything else here, and the site should use it.

**Bare chassis** — brushed aluminium floor pan with a red edge trim, exposed black
tubular frame, black bucket seat, red 4-point harness, handlebar steering, chrome
5-spoke mag wheels on stub axles, blue controller component, steering tie-rods
running forward along the pan. This is how the car looks during build and testing.

**Bodied** — the same chassis with white composite bodywork fitted over it, wrapping
the nose and both flanks, with a red trim strip along the lower edge, visible rivets,
and hand-painted cobra livery: a large orange-and-blue cobra roundel on the nose, a
silver cobra with its hood spread on the flank, a green-headed cobra, a blue cobra
head emblem, and the gold-and-black **Cobras** script. This is the race and show car.

The build stages on the Track Map run from bare to bodied, so the model can gain its
bodywork as the lap progresses.

## What is already here

| Source | Shows |
|---|---|
| `../../wiring.JPG` | Best single reference. Bare chassis, high 3/4, pan + frame + seat + harness + handlebar + rear wheel + tie-rods |
| `from-video/testing-*.jpg` | Bare chassis, left side, driver seated, wheels clear |
| `from-video/adjust-*.jpg` | Cockpit, harness, seat, battery area |
| `from-video/home3-*.jpg` | White body panel with the red-outlined number roundel |
| `from-video/build-*.jpg` | Frame and bracket detail during assembly |
| `../../design.JPG` | Project room, car partly visible |

Frames were extracted from the repo's own `.MP4` files with `AVAssetImageGenerator`
(there is no ffmpeg on the build machine). The extractor is disposable; frames are
committed because the videos are large and the frames are what the model is built from.

## Shooting for photogrammetry (Apple Object Capture)

`PhotogrammetrySession.isSupported` returns **true** on this machine (Apple M4,
macOS 26.5.1), so a real textured 3D mesh can be reconstructed locally from photographs
— no cloud service, no subscription. This is the only route to a photorealistic model;
hand-written geometry cannot get there.

**How to shoot it:**

- **80–150 photos.** More is better up to a point. Apple's sweet spot is around 100.
- **Three passes at three heights** — knee height, chest height, and looking down from
  above. Complete a full circle at each height.
- **Move about 10° between shots**, so consecutive photos overlap by roughly 70%.
- **Overcast daylight or open shade.** Direct sun bakes hard shadows into the texture and
  they cannot be removed afterwards. Do not use flash.
- **Move yourself, not the car.** The car must not shift between shots.
- **Textured ground helps** — tarmac or grass, not a plain smooth floor.
- **Everything in focus**, no motion blur. Tap to focus on the car each time.
- Shoot the bodied car and, if possible, a second set of the bare chassis.

**Known risk, stated up front:** glossy white paint and chrome wheels are the hardest
case for photogrammetry, because reconstruction needs surface texture to match points
between photos. The hand-painted cobra livery helps a great deal — those panels will
reconstruct well. Large plain white areas and the chrome rims may come out noisy and
need cleanup, and the wheels may be better replaced with clean geometry afterwards.

## What is still missing

The bodied car is currently evidenced by **one** photograph, taken from the front
left. To model it properly, these angles are needed — phone photos are fine, daylight,
car on a flat surface, camera at roughly hub height unless noted:

1. **Direct side profile, left and right.** Stand well back and zoom in rather than
   standing close — this is what sets wheelbase and body length, and getting it from
   a close-up introduces perspective error.
2. **Head-on front.** Square to the nose.
3. **Straight rear.** Square to the tail.
4. **Rear three-quarter, both sides.**
5. **Top-down.** Stand on a chair or shoot over a rail if possible.
6. **Wheels close up**, front and rear separately — the rims are 5-spoke and the front
   and rear differ in width and diameter.
7. **The livery flat-on**, each painted panel square to the camera, so the artwork can
   be reproduced rather than approximated.

Drop them straight into `docs/car-reference/` with any filenames.

## Licensing

These are the team's own photographs of the team's own car. No third-party imagery is
in this folder, and none should be added — the Track Map's satellite plate is licensed
separately and documented in `prototype/trackmap/assets/LICENSE-imagery.md`.
