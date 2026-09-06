# Handoff — SIS Al Jada Cobras website

For an agent picking this repo up cold. `README.md` lists the pages and features;
`DESIGN.md` is the visual brief. This file is the part neither of those covers:
what the site is *for*, how work gets shipped, and the traps that have already
cost real time.

---

## The prompt

Paste this to start a session:

> You're working on the SIS Al Jada Cobras website — the public site for a real
> student electric race team at SABIS Al Jada in Sharjah, UAE, building a car for
> the EVGP competition. It is live, it has a real audience (students, parents,
> school leadership, competition judges, prospective sponsors), and merging to
> `main` deploys straight to production. There is no staging.
>
> Local checkout: `/Users/mirza/projects/cobras-live`. Read `HANDOFF.md` first,
> then `README.md` and `DESIGN.md`.
>
> Work on a branch, open a PR, verify the change in a real browser before you
> merge, and squash-merge. Commit identity is already set in the repo config —
> use it, and never add a Claude co-author trailer. Never rewrite or revert
> Areej's commits; she is the other owner and commits directly through the
> GitHub web UI.
>
> Every change to a file the service worker caches needs the `CACHE` version in
> `sw.js` bumped, or returning visitors keep the old copy. Read the "Traps"
> section of `HANDOFF.md` before touching sprites, portraits, Arabic, or
> anything mobile.

---

## What this is

A static multi-page site for a student-built electric race car. Not a portfolio
piece and not a demo — it is the team's public face, used to recruit sponsors and
to show judges the build is real.

- **Team:** SIS Al Jada Cobras, SABIS® Al Jada, Sharjah
- **Target:** EVGP competition, 13 February 2027
- **Live:** https://areej-1.github.io/electric_car_website/
- **Repo:** `areej-1/electric_car_website` (`origin`). `fork` points at
  `fabricyo-dev/electric_car_website` and is not the deploy target.
- **Hosting:** GitHub Pages, built from the `main` branch. No Actions workflow —
  pushing to `main` *is* the deploy.

Branding is black / red / gold "Cobra Race". 19 team members. Content is
bilingual English / Arabic.

### Editorial rules — these are not style preferences

The site must not overstate what the team has done. Judges and sponsors read it.

- No invented performance figures, results, sponsors, or approvals. Unknowns get
  an honest "pending" treatment, and `DESIGN.md` has a neutral style for it.
- No faked product shots or mocked-up hardware the team does not have.
- Imagery must be legally sourced. Do not trace or derive artwork from
  photographs of real people.
- Nothing politically loaded.
- The team photograph and annotated copies of it stay out of the repo.

---

## How work ships

```bash
git checkout -b fix/short-name
# ... change things ...
git commit                       # repo-local identity is already correct
git push -u origin fix/short-name
gh pr create --title "..." --body "..."
# verify in a browser (see Verification), then:
gh pr list --base fix/short-name --json number --jq length   # must be 0 — see Traps
gh pr merge <n> --squash --delete-branch
```

- **Commit identity** is set in the repo's local git config. Do not add
  `Co-Authored-By: Claude`.
- **Never override Areej's commits.** If her work and yours collide, merge
  `origin/main` into your branch and reconcile forward. There is a worked example
  of this in the Traps section.
- **Merging deploys.** Prefer landing user-visible changes outside peak hours
  Gulf time when the change is risky.

---

## Architecture

Plain HTML / CSS / JS. No build step, no framework, no bundler. Open a file, it
works.

| Piece | File | What it does |
|---|---|---|
| Shared chrome | `cobras-lib.js` (932 ln) | Nav, footer, chat shell, string table |
| Page bootstrap | `site.js` (640 ln) | Builds chrome into every page, lazy-loads features |
| Arabic layer | `arabic.js` (474 ln) | Full RTL content translation |
| Styles | `styles.css` (1759 ln) | Everything; dark-first |
| Service worker | `sw.js` | Offline shell + runtime asset cache |
| Walking crew | `assets/crew/` | Opt-in pixel chibis |
| Prototypes | `prototype/trackmap/`, `prototype/kart/` | Iframed sub-apps with their own JS |

### Two translation systems — know which one you are in

They are unrelated and both are load-bearing.

1. **`arabic.js` — keyed by the English text itself.** A TreeWalker rewrites text
   nodes, then a second pass does `placeholder` / `aria-label` / `alt` / `title`.
   Structure is `COMMON` (site-wide) + `PAGES[page]` (per page) + `TITLES`.
   Change an English string on a page and its Arabic silently stops matching —
   there is no error, the text just stays English. Update both together.

   Content built at *runtime* is missed entirely, because the pass has already
   run. Those modules look their own strings up through
   `window.CobrasArabic.translateText(page, text)` against a pseudo-page
   dictionary. Two exist: `'crew'` and `'prototype/trackmap'`. Follow that
   pattern for any new runtime-built UI.

   `isolateLatin()` is a safety net that sets `dir="auto"` on wholly-Latin leaf
   elements so trailing punctuation does not fly to the wrong side under RTL. It
   is not a substitute for translating the string.

2. **`cobras-lib.js` `STRINGS` — keyed by id**, resolved via `data-i18n` and
   `t(lang, key)`. Used for chrome and generated UI. Roles live here as
   `role.Mechanic` etc., with the Arabic block further down the same file.

Language choice persists in `localStorage.cobras_lang`; the toggle reloads.

### The walking crew

Press a button on a member's card and their pixel chibi walks along the bottom of
the viewport, and follows you across pages (`localStorage.cobras_crew_out`).

- `assets/crew/crew-roster.js` — the 15 members who have art. **Being on this
  list is what creates the button**; a member without art simply has none. There
  are deliberately no generated stand-ins.
- `assets/crew/crew-roam.js` — one shared rAF for all chibis, transform-only
  writes, no layout reads in the loop. This discipline is deliberate: an earlier
  always-on animation cost the homepage 30 fps. Keep it.
- `assets/crew/sprites/*.png` — **every sprite is 97px tall**, feet on the bottom
  row, trimmed tight otherwise, transparent, no anti-aliasing. The shared height
  is what makes `background: contain` scale everyone identically so the crowd
  stands on one floor. `sprites/README.md` has the full contract and the
  hand-drawn-red-boundary cutting method that finally worked.
- `assets/crew/portraits/` — 512px AVIF with a PNG fallback via `onerror`, used
  on the member cards. Sources are in `portraits-detailed/`, which is gitignored
  on purpose: source art stays on disk rather than being deleted.

19 members are on the page; 15 have art. The other four (Ayah Yousif, Joud
Hassan, Taim Saadi, Yas Shahriari) show matching initials placeholders and have no
walk button. Role keys are explicit in each card’s `data-role` attribute so the
Arabic filters do not depend on image alt text.

---

## Verification

```bash
npm test          # cobras-lib.test.mjs + arabic.test.mjs + verify-site.mjs
npx serve -l 3000 # optional; verify-site.mjs adds a live HTTP probe if it's up
```

The full `npm test` suite passes after the September homepage cleanup. The July
homepage regression had dropped the CarGPT markup and changed the build-status
class; both contracts are restored. Keep those checks passing.

The homepage uses a compact, normal-flow layout in `assets/home/homepage.css`.
Its countdown uses UAE calendar days and the shared planning target in
`cobras-lib.js`; other countdowns retain their existing hours/minutes behavior.
The old scroll island in `assets/home/homepage.js` is no longer loaded.

**For anything visual, the test suite is not enough.** Drive a real browser:

- Preview server on port 4327: the repo's `.claude/launch.json` defines it as
  `cobras`, and `~/.claude/launch.json` defines the same thing as `cobras-live`.
  Start it through the Browser pane, not Bash. It has died mid-session more
  than once — health-check with
  `curl -s -o /dev/null -w "%{http_code}" http://localhost:4327/` before trusting
  a "nothing happens" result.
- Headless CDP harness with `launch` / `evaluate` / `until` / `cdp`:
  `/Users/mirza/projects/cobras-phase1/tests/lib/browser.mjs`. It disables
  background throttling, which matters — see the next section.
- Check both languages and several viewports. Bugs here have been RTL-only or
  narrow-viewport-only more often than not.

---

## Traps

Every one of these has already cost time on this project.

**The service worker serves assets cache-first.** The non-navigation branch of the `fetch`
handler ends in `return cached || network` (`sw.js:60`). Change any image, font, or asset and returning visitors keep
the old one *forever* until the `CACHE` constant is bumped. It is at `v18`; it
has been bumped once per asset-changing PR. Forgetting this is the single most
common way a correct fix looks broken.

**GitHub Pages holds a ~10 minute edge cache** on top of that. After merging,
do not tell anyone to look for at least ten minutes. If you look inside that
window you can get a *mix* — some files new, some old. On a change that swaps two
images between filenames, a half-updated cache makes both names show the same
picture, which looks exactly like a bug in the change. Poll the live file until
it matches, then report.

**Verify sprite and image work by bytes, not by eye.** `md5` the local file
against `curl` of the live URL. Two files that trade places produce four
plausible-looking wrong states.

**Renaming member assets: swap the whole filename, not half of it.** The slug is
`firstname-surname`. Two members are `Salma Rashdan` and `Selma Labchaki` —
first names one letter apart. A rename pass that swapped only the *surnames*
produced `salma-labchaki` and `selma-rashdan`, neither of which any page
requests, and both member cards broke on the live site. `members.html` references
each portrait twice: the `src` and the `alt`.

**CSS logical properties flip under RTL.** `inset-inline-start: 0` became the
*right* edge on Arabic pages and marched the whole walking crew off-screen. When
JS computes a coordinate from the viewport's left edge, the CSS anchor must be
physical `left`. Logical properties are right for text-flow, wrong for
script-computed geometry.

**A hidden browser tab does not run `requestAnimationFrame`.** An animation that
looks frozen while the preview pane is hidden is probably fine. Check
`document.visibilityState` before debugging, or use the CDP harness, which
launches with backgrounding disabled.

**Squash-merge races.** If a PR is merged while you still have commits in flight,
`main` gets a stale tree. Recover by cherry-picking the stranded commits onto a
fresh branch — do **not** re-merge the old branch, whose tree may predate other
merged PRs and would revert them. Git objects survive a local branch delete;
`git rev-parse` can still find them.

**Deleting a branch that another PR is based on** silently retargets or closes
that PR. Run `gh pr list --base <branch>` before any `--delete-branch`.

**Areej works directly on `main` through the GitHub web UI**, in bursts of small
commits. Always `git fetch` before assuming you know what `main` holds, and merge
her work forward rather than replacing it.

---

## Current state

September cleanup: compact homepage, direct sponsor contact and PDF actions,
UAE calendar countdown, and consistent member placeholders. Service worker
`v18`. The latest published workshop log remains 1 July 2026; fresh updates,
measurement dates, and individual assignments still need team confirmation.

**Uncommitted in the working tree** (left alone deliberately, not mine to
decide): `prototype/kart/index.html` shows as deleted, and
`assets/crew/portrait-design-language-prompt.txt` plus
`assets/crew/portraits-detailed-preview.png` are untracked.

**Open, waiting on the team rather than on code:**

- Art for the four members without it — a 97px walking sprite plus a portrait
  each. `sprites/README.md` documents exactly what the files must be.
- A native-Arabic read of the translated strings, which have not been reviewed by
  a fluent speaker.
- Battery hotspot angle for the 360° car viewer; it ships 8 of 9 components.
  Chassis (079°) and motor (180°) dot positions are a best read and may need
  correcting.

**Known and deliberately deferred:** fonts are not self-hosted; some legacy pages
have sub-44px tap targets; there is no perf trace below the homepage hero.
