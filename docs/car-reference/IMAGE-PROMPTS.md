# ChatGPT image prompts — SIS Al Jada Cobras

## First, the tooling answer

**No plugins needed.** Image generation is built into ChatGPT — you don't install
anything. What actually determines quality here is different:

1. **Upload the reference photos into the chat before prompting.** This matters more
   than any prompt wording. Without references it will invent a generic go-kart.
   Use `from-instagram/bodied-side-profile.jpg` first — it is the only square-on shot
   of the whole finished car — plus `bodied-rear-quarter.jpg` and
   `chassis-best-reference.JPG`.
2. **Generate one master image, then ask for variations of that image.** Asking for
   six shots in six separate prompts gives six different cars. Consistency comes from
   iterating on one result.
3. **Use the edit / select-region tool** to fix details rather than regenerating.
   Regenerating rerolls everything, including the parts that were right.
4. **Ask for an aspect ratio explicitly.** Supported: square, 3:2 landscape,
   2:3 portrait. Say which one you want or you'll get square.

Expect it to get the **livery wrong** — hand-painted cobras in four colours is
exactly what these models approximate badly. Judge each output on silhouette,
stance and lighting; treat the artwork as something to fix by hand afterwards.

---

## The car description block

Paste this into any prompt. It is the accurate description — everything in it is
visible in the reference photos.

> A single-seat student-built electric race kart. Low, open-cockpit, white composite
> bodywork with a thin red trim strip along the lower edge and visible rivets. The
> body has cut-out wheel arches and the tyres stand proud through them. Chrome
> five-spoke mag wheels, 13 inch, rear wider than front. Black tubular steel frame
> with a roll hoop behind the seat. Black bucket seat with a bright red four-point
> racing harness. **Handlebar steering, not a steering wheel.** Hand-painted cobra
> artwork on the flanks: a large silver-grey cobra with its hood spread, an orange
> and blue cobra roundel toward the nose, and gold-and-black "Cobras" script at the
> rear.

## What to avoid — put this in every prompt

> No steering wheel. No enclosed cockpit or canopy. No F1 or Formula-style wings,
> no rear wing, no diffuser. Not a go-kart with a tube frame only — it has bodywork.
> No lens flares, no neon glow, no sparks, no smoke, no lightning. No text or logos
> other than the cobra artwork. No fictional sponsor decals.

---

## The prompts

### 1. Hero — dark studio (Car page)

> Using the uploaded reference photos, render this exact car as a photorealistic
> studio shot. Three-quarter front view from slightly below hub height. Seamless
> near-black background, deep charcoal floor with a soft reflection under the car.
> Single large soft key light from the upper front left, subtle warm rim light along
> the top edge of the bodywork, one restrained red accent light catching the rear
> quarter. The white body should read as clean composite paint, not plastic. Sharp
> focus throughout, no depth-of-field blur. 3:2 landscape.

### 2. Side profile, cut-out (specs, and the honest replacement for `car-rear.png`)

> Same car, perfectly square-on side profile, wheels straight, on a plain white
> background with no shadow, no ground plane, no background objects. Even lighting
> across the whole car. Every part of the car in frame with a small margin.
> Technical photograph, catalogue style. 3:2 landscape.

### 3. Top-down (this one is the most useful — it becomes the Track Map marker)

> Same car photographed from directly overhead, perfectly perpendicular, no
> perspective distortion, car pointing straight up in frame. Plain mid-grey
> background, soft even light, small contact shadow directly under the tyres only.
> The full car in frame including all four wheels. Square.

### 4. Detail — front wheel and arch

> Close detail of the chrome five-spoke mag wheel and the white bodywork arch it sits
> in. Show the red trim strip and the rivets along the body edge. Shallow angle, low
> viewpoint, soft daylight. Square.

### 5. Detail — cockpit

> Close detail of the open cockpit looking down and forward: black bucket seat, red
> four-point harness with metal adjusters, black tubular frame, handlebars with black
> grips. Soft overhead daylight. No driver. 2:3 portrait.

### 6. On track, cinematic (homepage)

> The same car on an empty asphalt track at dusk, low three-quarter rear view, camera
> at hub height. Warm low sun behind and to the left, long soft shadow. Track surface
> dark and slightly damp so it holds a reflection. Background is empty track and
> distant fencing, thrown well out of focus. No crowd, no banners, no sponsor boards.
> 3:2 landscape.

### 7. Turntable set — only after you have a master you like

> Regenerate this exact image at eight camera angles, rotating the car 45 degrees each
> time, keeping the lighting, background, framing and distance identical. Front,
> front-three-quarter, side, rear-three-quarter, rear, and the mirrored angles.

Consistency across eight generations is the weak point. If it holds, those eight
frames drive a drag-to-spin viewer on the site. If it drifts, keep whichever single
angle came out best and use it as a still.

---

## Where these can and cannot be used

Generated images are **synthetic depictions of the product**, which is the same
category as `car-rear.png` — the stock render currently on the site that we are
deleting precisely because it isn't the team's car.

**Fine:** concept and mood work, livery studies, backgrounds, page furniture, and
anything captioned as a concept or visualisation. Also fine as reference to build
accurate geometry from.

**Not fine:** anywhere a sponsor or an EVGP judge would reasonably read the image as
a photograph of the actual car — the homepage hero, the specs page, sponsor material,
or anything next to a technical claim. Those need real photographs of the real car.

The safest split: generated imagery for atmosphere, real photographs wherever the car
is the subject of a claim.
