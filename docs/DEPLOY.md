# Deploying

The site is live at https://areej-1.github.io/electric_car_website/

## How it works now

GitHub Actions builds `site/` on every push to `main` and deploys `site/dist`
to GitHub Pages. `npm test` runs first — a failing check blocks the deploy.

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
them, so this restores the previous site exactly. Do not delete those files
until Actions deploys have been stable for at least a week.

## Verifying a deploy

```bash
curl -sI https://areej-1.github.io/electric_car_website/ | head -1   # expect 200
curl -s  https://areej-1.github.io/electric_car_website/ | grep -o 'lang="[a-z]*"'
curl -sI https://areej-1.github.io/electric_car_website/ar/ | head -1
```
