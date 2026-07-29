# Deploying

The site is live at https://areej-1.github.io/electric_car_website/

## How it works now

GitHub Actions builds `site/` on every push to `main` and deploys `site/dist`
to GitHub Pages. `npm test` runs first — a failing check blocks the deploy.

**Switching Pages from "Deploy from a branch" to this Actions artifact takes
the public site from 14 working pages to 2.** `site/dist` today contains only
the English and Arabic homepages. The site's own nav links nine routes —
`/members`, `/projects`, `/specs`, `/sponsors`, `/race-day`, `/news`, `/101`,
`/checklist`, plus home — and none of those pages exist in `site/dist` yet.
There is also no 404 page in the Actions build, where the legacy site has a
branded one. Anyone who flips this switch needs to know that going in, not
discover it after: visitors following any nav link, bookmark, or search
result other than the two homepages will get GitHub's generic 404 until
phases 2–4 port the remaining pages onto this Astro foundation.

## How it worked before

Pages served the repository root of `main` directly, with `build_type: legacy`.
No build step; committed HTML was the site.

## Rolling back

If the Actions deploy is broken and the site must be restored immediately:

1. Repository Settings → Pages → Build and deployment
2. Set Source back to **Deploy from a branch**
3. Branch `main`, folder `/ (root)`
4. Save

The legacy HTML files are still in the repository root until phase 4 removes
them, so this restores the previous site almost exactly, with one known
exception: `members.html` renders 19 member photos from duck-image
placeholders (`coffee_duck.png`, `dolphin_duck.png`, and so on) that were
deleted from the repository for misrepresenting the team — see
`tests/honesty.test.mjs`. Those 19 images will 404 on `members.html` after a
rollback; the duck files are gone by design and do not come back with the
rollback. Every other legacy page is unaffected. Do not delete the legacy
HTML files themselves until Actions deploys have been stable for at least a
week.

**This procedure has an expiration date.** It only works because those legacy
HTML files are still sitting in the repository root. Once a later phase
deletes them, "Deploy from a branch" will point at a root that no longer
contains a working site, and this section stops being true. Whoever removes
the legacy files must update this document in the same change — at minimum,
replace this procedure with one that restores a previous known-good Actions
deployment, since switching the Pages source will no longer have legacy files
to fall back to.

## Verifying an Actions deploy

```bash
curl -sI https://areej-1.github.io/electric_car_website/ | head -1   # expect 200
curl -s  https://areej-1.github.io/electric_car_website/ | grep -o 'lang="[a-z]*"'
curl -sI https://areej-1.github.io/electric_car_website/ar/ | head -1   # expect 200
```

## Verifying a rollback

The legacy site has no Arabic route. After a rollback, `/ar/` returning 404 is
correct and expected — it is not a sign the rollback failed. Use these checks
instead of the ones above:

```bash
curl -sI https://areej-1.github.io/electric_car_website/ | head -1   # expect 200
curl -s  https://areej-1.github.io/electric_car_website/ | grep -o 'lang="[a-z]*"'
curl -sI https://areej-1.github.io/electric_car_website/ar/ | head -1   # expect 404 — legacy has no Arabic route; this is correct, not a failure
```
