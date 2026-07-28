# Photogrammetry — video in, photoreal kart out

Two small Swift tools that turn a walkaround video of the real car into a textured 3D
mesh, entirely on this machine. Nothing is uploaded anywhere; the team's photos never
leave the laptop.

```bash
swiftc -O frames.swift -o frames
swiftc -O capture.swift -o capture

./frames walkaround.MOV ./photos 150      # video  -> 150 stills
./capture ./photos ./kart.obj reduced     # stills -> textured mesh
```

`capture` uses Apple's Object Capture (RealityKit `PhotogrammetrySession`), which
reports `isSupported = true` on this machine (Apple M4, macOS 26.5.1).

## Shooting the video

**One continuous video, roughly 90 seconds.** This replaces taking 150 photographs.

- **Shoot in 4K.** This is the one setting that matters most. Every video currently in
  this repo is between 432×832 and 720×1280 — far too small to reconstruct from. Set the
  camera to 4K before starting, not 1080p.
- **Three laps of the car**, one continuous take: knee height, chest height, then held
  above your head looking down. The top pass is the one people skip and it is the one
  that builds the upper surfaces.
- **Walk slowly.** Roughly one lap per 30 seconds. Motion blur is the enemy; slow and
  steady beats smooth and quick.
- **Overcast day or open shade.** Direct sun bakes hard shadows into the texture and they
  cannot be removed later. No flash.
- **Don't move the car** between laps, and try to keep people out of frame.
- **Park it on tarmac or grass**, not a plain smooth indoor floor — reconstruction needs
  texture in the surroundings to lock onto.
- Do the **bodied car** first. If there's time, a second video of the **bare chassis**
  gives us both states the Track Map needs.

## Detail levels

| Level | Use |
|---|---|
| `preview` | Fast check that the shoot worked. Run this first. |
| `reduced` | What the website should ship — lightest mesh and textures |
| `medium` | Good balance; fine for the Car page hero if `reduced` looks soft |
| `full` / `raw` | Far too heavy for the web. Archive only. |

Always run `preview` first. It takes a fraction of the time and tells you whether the
footage was good enough before committing to a long reconstruction.

## Known risk

Glossy white paint and chrome rims are the hardest case for photogrammetry, because
reconstruction matches features between photos and smooth reflective surfaces have few.
The hand-painted cobra livery will reconstruct well — it is full of texture. Large plain
white panels and the chrome wheels may come out noisy. If that happens the fix is to keep
the reconstructed body and swap the wheels for clean geometry, which we already have.

## Getting it onto the site

Object Capture writes OBJ + MTL + textures (or USDZ). For the web, convert to GLB:

```bash
npx --yes obj2gltf -i kart.obj -o kart.glb
```

Then load it with three.js `GLTFLoader`. Budget for the Car page is under 3 MB for mesh
plus textures; if `reduced` overshoots, decimate the mesh and resize the texture rather
than dropping to `preview`.
