# CarGPT / Groq API key (keep it private)

**Do not paste your Groq API key into chat, GitHub, or email to an assistant.**

Anyone with the key can use your quota and bill your account.

## Set the key only on your PC

### Option A — Browser (fastest for local testing)

1. Open the site: http://localhost:3000  
2. Press `F12` → **Console**  
3. Run (use your real values):

```js
localStorage.setItem('CARGPT_ENDPOINT', 'https://cobras-chat.areej-dridi.workers.dev')
// Only if your worker expects a browser-side key (prefer server-side secrets):
// localStorage.setItem('CARGPT_API_KEY', 'gsk_...')
location.reload()
```

### Option B — Local config file (not committed)

1. Copy `cargpt.config.example.js` → `cargpt.config.js`  
2. Put endpoint (and key only if required) in that file  
3. Load it **before** `site.js` on pages that need CarGPT:

```html
<script src="cargpt.config.js"></script>
<script src="cobras-lib.js"></script>
<script src="site.js"></script>
```

`cargpt.config.js` is listed in `.gitignore` so it will not be pushed.

### Recommended production setup

Keep the Groq key **only on the Cloudflare Worker** (or server), never in the website source.  
The browser should call your worker URL only; the worker holds `GROQ_API_KEY`.

See `groq-worker.js` and `.dev.vars.example` for the worker pattern.

## Clear a key from this browser

```js
localStorage.removeItem('CARGPT_API_KEY')
localStorage.removeItem('CARGPT_ENDPOINT')
```
