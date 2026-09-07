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
npm test
```

Checks every HTML page for shared assets/branding, evaluates `site.js` in a sandbox (menu + CarGPT APIs + offline FAQ), and probes a live server on port 3000 when available.

### PR checks

`.github/workflows/pr-checks.yml` runs the static tests, cache-version guard, and ten Chromium browser scenarios for ready PRs targeting `main`. The browser scenarios cover English and Arabic navigation, language switching, member filtering, narrow build stages, car controls, component links, and viewer rendering at phone and desktop widths.

To limit Actions usage: one Ubuntu job, one browser worker, a five-minute job limit, no retries, no schedules, and no duplicate push/deployment runs. New commits cancel older runs for the same PR. Draft PRs use no runner; changes limited to Markdown or license files skip the workflow. Only failure screenshots are uploaded, with three-day retention. Dependencies are pinned and npm downloads are cached; only Chromium's headless shell is installed.

Run the browser checks locally:

```bash
npm ci
npx playwright install --only-shell chromium
npm run test:browser
```

The browser runner starts its own loopback server on port 4327 and tests under `/electric_car_website/`, matching the Pages URL prefix. It blocks service workers and stubs external requests so public fonts or chat outages cannot break CI; local scripts and images are real. It does not replace a visual check with real fonts or a returning-visitor cache check.

Check **committed** public-file changes against a base revision:

```bash
npm run test:cache -- origin/main
```

The guard compares the numeric `CACHE` in `sw.js` against the PR base, including added, deleted, and renamed assets outside `SHELL`. Public changes need a strictly larger version. Development files and Markdown do not need a bump. Recheck after merging newer `main` changes: another PR may have used your chosen version.

Checks report on PRs; they do not change branch protection or prevent direct edits to `main`. Areej's direct edits still deploy through the existing GitHub Pages setup. Use a PR to get these checks before deployment. If checks become required later, account for doc-only workflows being skipped.

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
- **Homepage** puts current build status directly below the hero, followed by car facts, the latest published workshop update, a UAE calendar-day countdown, and sponsor actions
- **Build status + engineering data** distinguish published figures, estimates, and pending measurement details
- **Sponsor contact** links directly to the public Instagram account and package PDF
- **Member portraits** use initials placeholders for the four members awaiting art; role filters work in both languages
- **Build timeline** has keyboard-accessible stage links, readable phone layouts, and video posters without preloading the clips
- **360° viewer** keeps controls separate from its disclosure, fits the overhead view at every angle, and uses keyboard-accessible component dialogs in English and Arabic. Its component menu jumps to all eight mapped parts; Copy link shares addresses such as `car.html#component=controller`, with a selectable URL if clipboard access is denied. Rendering stops at rest and pauses while hidden or outside the viewport; auto-rotation resumes when visible and respects changes to reduced-motion settings.
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
