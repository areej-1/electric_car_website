# SIS Al Jada Cobras — Electric Car Website

Student electric race team site for **SABIS® Al Jada (Sharjah)** — black / red / gold **Cobra Race** branding, build story, specs, sponsors, arcade game, and CarGPT.

## Run locally

This is a static site (HTML / CSS / JS). No install required.

```bash
# from this folder
npx serve -l 3000
```

Then open **http://localhost:3000**

Or open `index.html` directly in a browser (some features work better with a local server).

## Verify

```bash
node tests/verify-site.mjs
```

Checks every HTML page for shared assets/branding, evaluates `site.js` in a sandbox (menu + CarGPT APIs + offline FAQ), and probes a live server on port 3000 when available.

## Pages

| Page | File |
|------|------|
| Home | `index.html` |
| Members | `members.html` |
| Our Work | `projects.html` |
| Race Day hub | `race-day.html` |
| News | `news.html` |
| Game (Cobra Circuit) | `game.html` |
| Electric Cars 101 | `101.html` |
| Specs (+ PDF) | `specs.html`, `specs-sheet.pdf` |
| Race checklist | `checklist.html` |
| About | `about.html` |
| Sponsor Us | `sponsors.html` |
| Sponsor package (+ PDF) | `sponsor-package.html`, `sponsor-package.pdf` |
| 404 | `404.html` |

## Feature notes

- **Collapsing sticky nav** shrinks after scroll (`is-collapsed` on `.site-nav`)
- **Resources navigation** groups Race Day, News, Electric Cars 101, and the Race Checklist
- **Build status + engineering data** use verified values and clearly labeled pending fields
- **Shared chrome** rebuilt from `cobras-lib.js` + `site.js` on every page
- **EN/AR toggle** stores `localStorage.cobras_lang`
- **CarGPT live path**: set `localStorage.CARGPT_ENDPOINT` / `CARGPT_API_KEY` or copy `cargpt.config.example.js` → `cargpt.config.js` (gitignored)
- **PWA**: `manifest.webmanifest` + `sw.js`
- **Analytics**: local visit counters only (`localStorage.cobras_analytics`)
- **Score share**: Game page button (F3/F2/F1 context)

## Local improvements (this copy)

- Mobile **hamburger menu** (screens ≤1040px; CSS + matchMedia-safe JS)
- **Skip to content** + clearer keyboard focus
- **CarGPT offline answers** when the worker API is unreachable (`window.CobrasSite.localReply`)
- **Back to top** button + print styles
- Richer **footer** with quick links
- Consistent titles, meta descriptions, theme-color, and nav chrome on every page
- Lazy-loaded images, video `preload="none"`, font preconnect
- Member image alts, social link a11y, reduced-motion-friendly game shake
- `npm test` / `node tests/verify-site.mjs` smoke suite
- This README

## CarGPT

By default the UI calls:

`https://cobras-chat.areej-dridi.workers.dev`

If that fails (offline, no key, network), **local FAQ answers** still cover team, 48V system, EVGP, specs, safety, build, game, and sponsorship.

To point at another endpoint:

```html
<script>window.CARGPT_ENDPOINT = 'https://your-worker.example';</script>
<script src="site.js"></script>
```

Optional worker example: `groq-worker.js` + `.dev.vars.example` (do not commit real API keys).

## Project branch

PR redesign branch: `agent/cobra-race-redesign`  
Repo: https://github.com/areej-1/electric_car_website

## Credits

Made by Areej · Team: SIS Al Jada Cobras
