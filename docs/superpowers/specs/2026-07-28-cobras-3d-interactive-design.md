# SIS Al Jada Cobras — 3D interactive site rebuild

**Date:** 2026-07-28
**Branch:** `feat/cobras-3d-rebuild`
**Status:** design approved, awaiting implementation plan

---

## 1. What we are building

A full rebuild of the SIS Al Jada Cobras website on Astro, with two WebGL surfaces:

- a **Track Map** page — a real satellite plate of Silverstone Circuit, graded to the
  Cobra palette, carrying the team's five build stages as clickable turns;
- a **procedural 3D model of the team's actual kart**, which serves as the marker that
  drives the Track Map lap and is also the hero of the Car page.

All 14 existing pages are rebuilt. The work is phased (§10); each phase gets its own
spec and its own pull request.

### Audiences

All three are first-class, and they want different things:

| Audience | Wants | What the site must do |
|---|---|---|
| Sponsors | Proof the team is real and worth backing | Show real work, a clear ask, a verified contact route |
| EVGP judges | Technical credibility | Component-level detail, provenance on every number, documented process |
| School, parents, students | To see their own team | Real students, real car, the story of the build |

---

## 2. The constraint that shapes everything

The site currently presents a car that is not the team's car.

**The real kart**, evidenced by `wiring.JPG`, `adjust.MP4`, `home3.MP4` and `testing.MP4`:
a silver aluminium flat floor pan with a red edge stripe, black tubular steel frame and
roll structure, black bucket seat, **red 4-point racing harness**, bicycle-style spoked
wheels on knobby tyres, and a blue battery pack. `testing.MP4` shows it being driven by a
helmeted student on a running track. "AL JADA COBRAS" is hand-painted on the workshop wall.

**What the site ships instead:**

| File | What it actually is | Action |
|---|---|---|
| `car-rear.png` (529 KB) | Stylised black/red/gold buggy on racing slicks with gold coilovers | Delete. Replaced by the 3D kart. |
| `car.png` (77 KB) | Generic stock top-down red sedan clipart | Delete. |
| `home2.JPG` (152 KB) | Young children at a picnic table, unrelated to the team | Delete. DESIGN.md §7 forbids unrelated students. |
| 21 × `*_duck.png` (6.6 MB) | Novelty duck images standing in for member portraits | Delete. Replaced by the Cobra placeholder system. |

This is the governing rule of the rebuild: **nothing on the site may depict the product
as something it is not.** The 3D model exists to make that possible, not to decorate.

---

## 3. Design constraints

Non-negotiable, from Mirza's design preferences and `DESIGN.md`:

1. **No abstract background art.** No starfields, orbit rings, particle fields, gradient
   blobs. Every visual element depicts something real: the actual car, actual imagery,
   actual data.
2. **Never fake the product.** Interfaces and specs shown are built from real values read
   at render time, not typed into the design.
3. **Never make a false claim.** Every claim traces to an authoritative source in the repo.
4. **No politically loaded imagery.** Geography, flags, borders and place names are checked
   before they ship.

From `DESIGN.md`, additionally:

- Dark first. Red means action or active state. Gold means status or prestige, used rarely.
- One loud accent per section; never competing large red and gold areas.
- Never lime green, teal, cyan, or eco-EV gradients.
- Do not turn every section into a three-card grid.
- Pending information uses a neutral dark treatment, never a fake success colour.

### Palette

Read from `DESIGN.md` §3. No hex outside this set, except the two licensed photographic
assets (§7), which carry their own colour by design.

| Token | Value | Use |
|---|---|---|
| Ink | `#0A0A0A` | Page background, structural areas |
| Panel | `#141414` | Cards, dashboards, navigation |
| Raised panel | `#1A1A1A` | Hovered or emphasised dark surfaces |
| Cobra red | `#7C0A02` | Deep branded atmosphere, large low-intensity accents |
| Hot red | `#E6392B` | Primary actions, active nav, race-energy moments |
| Gold | `#C9A227` | Small prestige accents, labels, rules, hover details |
| Soft gold | `#E8B923` | Rare highlights only |
| Cream | `#F5F0E8` | Headlines and primary text |
| Steel | `#9AA3A8` | Supporting text, captions, metadata |

### Typography

**Orbitron** — logo, hero headlines, section titles, numbers, technical labels, race UI.
**Poppins** — navigation, paragraphs, buttons, forms, captions.
Orbitron is never used for long paragraphs, and never for Arabic body text.
No third family is introduced.

---

## 4. Track Map

A new page. It replaces the idea of a written roadmap with a lap of a circuit.

### Content model

The five turns are the five stages **already written in `projects.html`**, unchanged:

| Turn | Stage |
|---|---|
| 1 | Design + planning |
| 2 | Build + assembly |
| 3 | Wiring + controls |
| 4 | Testing + troubleshooting |
| 5 | Final adjustments |
| Flag | Race target — 13 February 2027 |

Each turn carries: stage name, status badge (`recorded` / `in progress` / `pending`), what
changed, evidence (the real photos and video already in the repo), and the next action.

### Behaviour

- The map is **draggable and zoomable** throughout. It is a place, not a menu.
- Clicking a turn **pans and zooms the camera to that corner** while the stage detail opens
  alongside. The map never disappears.
- The **3D kart is the lap marker** and drives corner to corner between stages, following a
  traced racing-line path.
- Turn connectors follow an SVG path traced along the actual track ribbon — **not straight
  chords across the infield.**
- The chequered-flag marker anchors to the pit straight, not the paddock.
- Keyboard: arrow keys move between turns, `Home` / `End` jump to first and last, `Esc`
  closes an open turn. Every turn marker is a real focusable button.
- `prefers-reduced-motion` replaces camera flights with instant cuts and stops the kart
  animating.

### Imagery and licence

Source: [`Silverstone Circuit, July 2, 2018 SkySat.jpg`](https://commons.wikimedia.org/wiki/File:Silverstone_Circuit,_July_2,_2018_SkySat.jpg)
— 4000 × 2249, 2.4 MB, true nadir satellite capture, taken 2 July 2018.

- **Author:** Planet Labs, Inc.
- **Licence:** CC BY-SA 4.0, attribution required.

**Obligations we take on:**

1. Visible credit to Planet Labs, Inc. with the licence named and linked, persistent on the
   Track Map page.
2. **Share-alike.** Our cropped, rotated and colour-graded derivative is itself a derivative
   work and must be released under CC BY-SA 4.0. This binds the derived image files only —
   not the site's code, design, or other content. The licence text ships alongside the
   graded assets in the repo.
3. The caption states plainly that the circuit is **illustrative and not the team's race
   venue.** No venue is confirmed anywhere on the site, and the rebuild does not invent one.

Rejected alternatives, recorded so they are not revisited: Google, Apple and Esri imagery
cannot ship at any licence tier. Copernicus Sentinel-2 is open but 10 m/px, which renders
the whole 5.9 km circuit in roughly 600 px — far short of what the page needs.

---

## 5. The kart module

**Procedural three.js geometry authored in code. No binary model, no modelling tool.**

This is not a fallback. The real car is tube frame, flat plate, cylinders and a seat, which
maps directly onto `TubeGeometry` along curves, `ExtrudeGeometry`, and `CylinderGeometry`.
The result is a few KB of readable, diffable, reviewable source instead of a multi-megabyte
opaque binary, and there is no Blender on the build machine (§8).

Components, authored from the real photographs and video:

- Flat aluminium floor pan with red edge stripe — extruded plate
- Tubular steel frame and roll structure — tubes along traced curves
- Black bucket seat
- Red 4-point harness — the single saturated accent on the model
- Four spoked wheels on knobby tyres
- Battery pack

The module exposes one interface consumed by both pages:

- `mount(container, options)` — creates the scene
- `setCameraTarget(component | 'overview')` — frames a component or the whole car
- `setPosition(t)` — places the kart at normalised distance `t` along the track path
- `setExploded(boolean)` — separates components for inspection
- `dispose()` — tears down and frees GPU resources

Hotspots on the Car page open component detail. Every value shown comes from the specs data
source (§6) — none are typed into the model.

The model is captioned as a model. It is a faithful reconstruction, not a photograph, and
the page says so.

---

## 6. Honesty system

Specs, statuses and dates live in structured data, not in markup. Pages read from it at
build time, so marketing cannot drift from the truth.

Every value carries a provenance state, rendered distinguishably and **never by colour
alone** — each state has its own label and icon:

| State | Meaning | Treatment |
|---|---|---|
| `recorded` | Measured, with a date | Full contrast, date shown |
| `estimated` | Calculated or approximate | Marked estimate, method noted |
| `pending` | Not yet known | Neutral dark treatment, "pending team confirmation" |

Permanently pending until officially verified: race venue, official timing, driver
selection, results, funding figures. The 13 February 2027 date is the stated *target* and is
labelled as such.

---

## 7. Architecture

**Astro**, static output, deployed to GitHub Pages via GitHub Actions.

| Concern | Approach |
|---|---|
| Pages | Astro pages and layouts; shared chrome resolved at **build time** |
| EN / AR | Astro i18n routing, replacing the 32 KB `arabic.js` runtime translation blob |
| 3D | Two islands — Track Map and Car — with `client:visible`; three.js tree-shaken and never in the main bundle |
| Images | Pillow build script emitting responsive WebP at 2000 px and 1000 px |
| PWA | `manifest.webmanifest` and a service worker retained, emitted by the build |
| Tests | `tests/verify-site.mjs` rewritten to assert against built output in `dist/` |

**Why Astro and not vanilla.** `cobras-lib.js` (62 KB) and `site.js` (26 KB) currently
rebuild the shared chrome on **every page load at runtime**. For a site whose entire purpose
is being credible to sponsors and judges who will search for the team, moving that to build
time is a direct SEO and LCP win. At full-rebuild scope every page is being rewritten
anyway, so the migration cost is largely already being paid.

### Deployment change

Current: GitHub Pages, `build_type: legacy`, serving `main` at root, live at
`https://areej-1.github.io/electric_car_website/`. Merges to `main` publish immediately.

After: a GitHub Actions workflow builds and deploys; Pages switches from `legacy` to
`workflow`. **This is a one-time change to a live public site and must land in its own PR,
verified on a preview build before `main` is switched over.**

---

## 8. Toolchain

Verified on the build machine, 2026-07-28:

| Tool | Status |
|---|---|
| Node | 26.4.0 |
| npm | 11.17.0 |
| Pillow | 11.3.0 — the image pipeline |
| `sips` | present |
| Blender | **absent** — hence procedural geometry |
| ffmpeg | **absent** — video poster frames extracted via `qlmanage` |
| ImageMagick, cwebp, avifenc | **absent** — Pillow covers these |

---

## 9. Performance

Current site: **44 MB** — 11 videos at 11 MB, 39 images at 13 MB, of which 6.6 MB is
21 duck PNGs. `vacation_duck.png` alone is 2.2 MB; `dubai-pixel-skyline.png` is 1.8 MB.

Measured on the graded Silverstone plate as proof the pipeline works:

| Output | Size |
|---|---|
| Desktop WebP, 1900 px | 308 KB |
| Mobile WebP, 1000 px | 115 KB |

Budgets:

- Initial page weight, mobile, excluding 3D: **under 500 KB**
- three.js island, tree-shaken and gzipped: **under 200 KB**, loaded only on the two pages
  that use it
- Sustained 60 fps on the Track Map on real hardware

Engineering rules, carried from prior work:

- **Never trigger a re-render on an animation frame.** Continuous motion is driven by a
  single RAF loop writing directly to the DOM and to three.js objects. Component state and
  DOM reconstruction are reserved for discrete changes — opening a turn, switching language.
- **Dirty-check every per-frame style write.** An unchanged assignment still forces restyle.
- **Time-based easing** (`1 - Math.exp(-dt * k)`), never a fixed per-frame lerp.
- **Verify on the real GPU.** Headless Chromium falls back to SwiftShader and reports frame
  times roughly 8× real. Any performance claim is measured with `headless: false`.

---

## 10. Phasing

Each phase is its own spec, its own plan, and its own pull request off `main`.

| Phase | Contents | Depends on |
|---|---|---|
| 1 | Astro scaffold, design system, tokens, typography, shared shell, nav, footer, EN/AR routing, image pipeline, Actions workflow | — |
| 2 | Kart module — procedural geometry, camera API, explode, hotspots, reduced-motion path | 1 |
| 3 | Home, Track Map, Car/Specs, Our Work, Members | 1, 2 |
| 4 | Race Day, News, Electric Cars 101, Checklist, About, Sponsors, Sponsor package, Game, 404 | 1 |

The Pages `legacy` → `workflow` switch lands in phase 1, separately verified.

---

## 11. Accessibility

- Cream on ink for primary reading; Steel stays at its current value and is not further
  reduced.
- Visible keyboard focus on every interactive element, including turn markers and hotspots.
- Status is never communicated by colour alone (§6).
- Meaningful images carry useful alt text; decorative cobra marks are hidden from screen
  readers.
- `prefers-reduced-motion` is honoured on the Track Map camera, the kart animation, and all
  transitions.
- The Track Map is operable by keyboard and touch, not only by drag.

---

## 12. Out of scope

- The arcade game's internals — it is rebuilt into the new shell, its mechanics unchanged.
- CarGPT's behaviour — retained as a small navigation option, not made louder.
- Real student portrait photography — the Cobra placeholder system covers the gap until
  approved photos exist.
- Any change to the race venue, driver selection, timing or results content — these stay
  pending.

---

## 13. Risks

| Risk | Mitigation |
|---|---|
| Pages `legacy` → `workflow` switch breaks the live site | Own PR, preview build verified first, documented rollback to legacy |
| CC BY-SA share-alike misunderstood later | Obligation recorded in §4 and in a licence file beside the graded assets |
| Procedural kart reads as cartoonish | Proportions traced from real photographs; captioned as a model; reviewed before phase 3 |
| Astro build breaks and a student cannot update the site | Actions workflow kept minimal; `npm run dev` and `npm run build` documented in the README |
| three.js budget overrun | Tree-shaking verified against the 200 KB budget in phase 2, before pages depend on it |
