/**
 * Smoke tests against the shipped static Cobras site (HTML + site.js).
 * Run from project root: node tests/verify-site.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';
import http from 'node:http';
import { spawn } from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const PAGES = [
  'index.html',
  'members.html',
  'projects.html',
  'game.html',
  '101.html',
  'specs.html',
  'about.html',
  'sponsors.html',
  'news.html',
  'checklist.html',
  'sponsor-package.html',
  '404.html'
];

const failures = [];
const pass = (name) => console.log(`PASS  ${name}`);
const fail = (name, detail) => {
  failures.push(`${name}: ${detail}`);
  console.error(`FAIL  ${name} — ${detail}`);
};

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

// --- Static HTML checks (shipped entry pages) ---
for (const page of PAGES) {
  const html = read(page);
  if (!html.includes('styles.css')) fail(`${page} styles`, 'missing styles.css reference');
  else pass(`${page} styles.css`);
  if (!html.includes('site.js')) fail(`${page} site.js`, 'missing site.js reference');
  else pass(`${page} site.js`);
  if (!html.includes('cobras-lib.js') && page !== '404.html') {
    // 404 should also load lib for shared chrome
  }
  if (!html.includes('cobras-lib.js')) fail(`${page} cobras-lib`, 'missing cobras-lib.js');
  else pass(`${page} cobras-lib.js`);
  if (!/<title>[^<]*Cobras/i.test(html) && page !== 'index.html') {
    // index title still contains Cobras
  }
  if (!/Cobras/i.test(html)) fail(`${page} branding`, 'missing Cobras brand text');
  else pass(`${page} Cobras branding`);
  if (!/name="description"/.test(html)) fail(`${page} meta`, 'missing description meta');
  else pass(`${page} description meta`);
  if (!/site-nav|nav-toggle|class="site-nav"/.test(html) && !/<nav\b/.test(html)) {
    fail(`${page} nav`, 'missing nav');
  } else pass(`${page} nav present`);
  if (/function\s+openForm\s*\(|function\s+sendMessage\s*\(/.test(html)) {
    fail(`${page} inline chat`, 'conflicting inline chat handlers still present');
  } else pass(`${page} no inline chat handlers`);
  if (!/<title>[^<]+<\/title>/.test(html)) fail(`${page} title`, 'missing title tag');
  else pass(`${page} has title`);
}

// shared lib + new assets
for (const file of ['cobras-lib.js', 'manifest.webmanifest', 'sw.js', 'specs-sheet.pdf', 'sponsor-package.pdf']) {
  if (!fs.existsSync(path.join(ROOT, file))) fail('structure ' + file, 'missing ' + file);
  else pass('structure ' + file);
}
if (!read('styles.css').includes('is-collapsed')) fail('css collapse', 'nav collapse styles missing');
else pass('css nav collapse');
if (!read('cobras-lib.js').includes('shouldCollapseNav')) fail('lib collapse', 'shouldCollapseNav missing');
else pass('lib shouldCollapseNav');
if (!read('game.html').includes('share-score-btn')) fail('score share ui', 'share button missing');
else pass('score share ui');
if (!read('game.js').includes('buildScoreShareText') && !read('game.js').includes('shareScore')) fail('score share js', 'share logic missing');
else pass('score share js');
const projectVideos = [...read('projects.html').matchAll(/<video[^>]+src="([^"]+)"/g)].map(match => match[1]);
if (projectVideos.length !== new Set(projectVideos).size) fail('project videos', 'timeline stages reuse the same video source');
else pass('project timeline videos are distinct');
if (/sk-[a-zA-Z0-9]{10,}|AIza[0-9A-Za-z_-]{20,}/.test(read('site.js') + read('cobras-lib.js'))) fail('secrets', 'possible API key committed');
else pass('no obvious API secrets');

// CSS mobile menu rules
const css = read('styles.css');
if (!css.includes('.nav-toggle') || !css.includes('@media (max-width: 1040px)')) {
  fail('css mobile menu', 'hamburger / breakpoint rules missing');
} else pass('css mobile menu rules');
if (!css.includes('--hot-red') || !css.includes('--gold')) {
  fail('css brand tokens', 'missing brand CSS variables');
} else pass('css brand tokens');
if (!/body\s*\{[\s\S]*?overflow-x:\s*clip;/.test(css)) {
  fail('css sticky nav scroll container', 'body overflow must use clip so sticky nav remains attached');
} else pass('css sticky nav keeps window scroll container');

// --- Evaluate shipped site.js in a minimal browser sandbox ---
function makeDocument() {
  const nodes = new Map();
  let idSeq = 1;

  function el(tag, attrs = {}) {
    const node = {
      tagName: tag.toUpperCase(),
      id: attrs.id || '',
      className: attrs.class || '',
      attributes: { ...attrs },
      children: [],
      parent: null,
      textContent: '',
      style: {},
      hidden: false,
      dataset: {},
      classList: {
        _set: new Set((attrs.class || '').split(/\s+/).filter(Boolean)),
        add(c) { this._set.add(c); node.className = [...this._set].join(' '); },
        remove(c) { this._set.delete(c); node.className = [...this._set].join(' '); },
        toggle(c, force) {
          if (force === true) this.add(c);
          else if (force === false) this.remove(c);
          else if (this._set.has(c)) this.remove(c);
          else this.add(c);
          return this._set.has(c);
        },
        contains(c) { return this._set.has(c); }
      },
      setAttribute(k, v) {
        this.attributes[k] = String(v);
        if (k === 'id') this.id = String(v);
        if (k === 'class') this.className = String(v);
      },
      getAttribute(k) { return this.attributes[k] ?? null; },
      hasAttribute(k) { return k in this.attributes; },
      removeAttribute(k) { delete this.attributes[k]; },
      appendChild(child) {
        child.parent = this;
        this.children.push(child);
        return child;
      },
      prepend(child) {
        child.parent = this;
        this.children.unshift(child);
        return child;
      },
      insertBefore(newNode, refNode) {
        if (!refNode) return this.appendChild(newNode);
        const i = this.children.indexOf(refNode);
        if (i < 0) return this.appendChild(newNode);
        this.children.splice(i, 0, newNode);
        newNode.parent = this;
        return newNode;
      },
      replaceWith(other) {
        if (!this.parent) return;
        const i = this.parent.children.indexOf(this);
        if (i >= 0) this.parent.children[i] = other;
        other.parent = this.parent;
      },
      replaceChildren(...kids) {
        this.children = kids;
        kids.forEach(k => { k.parent = this; });
      },
      before(other) {
        if (!this.parent) return;
        const i = this.parent.children.indexOf(this);
        this.parent.children.splice(i, 0, other);
        other.parent = this.parent;
      },
      querySelector(sel) { return query(this, sel)[0] || null; },
      querySelectorAll(sel) { return query(this, sel); },
      addEventListener() {},
      focus() {},
      click() {},
      scrollTop: 0,
      scrollHeight: 0,
      _innerHTML: ''
    };
    Object.defineProperty(node, 'innerHTML', {
      get() { return node._innerHTML || ''; },
      set(html) {
        node._innerHTML = String(html || '');
        node.children = [];
        // Minimal parse for chrome rebuilds used by site.js
        if (/nav-toggle|site-menu|lang-toggle|footer-title/.test(node._innerHTML) || node.tagName === 'NAV' || node.tagName === 'FOOTER') {
          if (node._innerHTML.includes('logo')) {
            const logo = el('a', { class: 'logo' });
            logo.href = 'index.html';
            logo.textContent = 'SIS Al Jada Cobras';
            node.appendChild(logo);
          }
          if (node._innerHTML.includes('nav-toggle')) {
            const btn = el('button', { class: 'nav-toggle' });
            btn.appendChild(el('span'));
            btn.appendChild(el('span'));
            btn.appendChild(el('span'));
            node.appendChild(btn);
          }
          if (node._innerHTML.includes('site-menu') || node._innerHTML.includes('<ul')) {
            const ul = el('ul', { id: 'site-menu' });
            node.appendChild(ul);
          }
          if (node._innerHTML.includes('lang-toggle')) {
            const tools = el('div', { class: 'nav-tools' });
            const lang = el('button', { class: 'lang-toggle' });
            lang.textContent = 'AR';
            tools.appendChild(lang);
            node.appendChild(tools);
          }
          if (node._innerHTML.includes('footer-title') || node.tagName === 'FOOTER') {
            const brand = el('div');
            const title = el('p', { class: 'footer-title' });
            title.textContent = 'SIS Al Jada Cobras';
            brand.appendChild(title);
            node.appendChild(brand);
          }
        }
      }
    });
    Object.defineProperty(node, 'outerHTML', {
      get() { return `<${node.tagName.toLowerCase()}>${node.innerHTML}</${node.tagName.toLowerCase()}>`; }
    });
    if (node.id) nodes.set(node.id, node);
    return node;
  }

  function all(root) {
    const out = [];
    const walk = (n) => {
      out.push(n);
      (n.children || []).forEach(walk);
    };
    walk(root);
    return out;
  }

  function query(root, sel) {
    const list = all(root);
    if (sel.startsWith('#')) return list.filter(n => n.id === sel.slice(1));
    if (sel.startsWith('.')) {
      const c = sel.slice(1).split(/[\s.>[\]:]/)[0];
      return list.filter(n => n.classList.contains(c) || (n.className || '').split(/\s+/).includes(c));
    }
    if (sel.includes('[')) {
      // simple [data-race-date] or [href^="http"]
      const m = sel.match(/^(\w+)?\[([^\]]+)\]/);
      if (!m) return [];
      const tag = m[1];
      const attr = m[2];
      return list.filter(n => {
        if (tag && n.tagName !== tag.toUpperCase()) return false;
        if (attr.includes('^=')) {
          const [name, val] = attr.split('^=');
          const key = name.trim();
          const expect = val.replace(/"/g, '');
          return String(n.attributes[key] || n[key] || '').startsWith(expect);
        }
        return n.hasAttribute(attr) || attr in n.attributes || attr in n.dataset;
      });
    }
    if (sel.includes('.')) {
      const [tag, ...cls] = sel.split('.');
      return list.filter(n => {
        if (tag && n.tagName !== tag.toUpperCase()) return false;
        return cls.every(c => n.classList.contains(c));
      });
    }
    return list.filter(n => n.tagName === sel.toUpperCase());
  }

  const body = el('body');
  const nav = el('nav', { class: 'site-nav' });
  const logo = el('div', { class: 'logo' });
  logo.textContent = 'SIS Al Jada Cobras';
  const menu = el('ul', { id: 'site-menu' });
  nav.appendChild(logo);
  nav.appendChild(menu);
  body.appendChild(nav);

  const main = el('main');
  const launcher = el('button', { class: 'open-button' });
  launcher.textContent = 'CarGPT';
  const popup = el('div', { id: 'myForm', class: 'chat-popup' });
  const form = el('div', { class: 'form-container' });
  const messages = el('div', { id: 'chatMessages', class: 'chat-messages' });
  const input = el('textarea', { id: 'chatInput' });
  input.value = '';
  Object.defineProperty(input, 'value', { writable: true, value: '' });
  const send = el('button', { class: 'btn' });
  send.textContent = 'Send';
  const cancel = el('button', { class: 'btn cancel' });
  cancel.textContent = 'Close';
  form.appendChild(messages);
  form.appendChild(input);
  form.appendChild(send);
  form.appendChild(cancel);
  popup.appendChild(form);
  main.appendChild(launcher);
  main.appendChild(popup);
  body.appendChild(main);
  const footer = el('footer');
  footer.appendChild(Object.assign(el('p'), { textContent: 'Copyright 2026 SIS Al Jada Cobras' }));
  body.appendChild(footer);

  const document = {
    body,
    documentElement: el('html'),
    getElementById(id) { return nodes.get(id) || all(body).find(n => n.id === id) || null; },
    querySelector(sel) { return query(body, sel)[0] || null; },
    querySelectorAll(sel) { return query(body, sel); },
    createElement(tag) { return el(tag); },
    addEventListener() {}
  };

  return { document, body, nav, popup, input, messages };
}

const libJs = read('cobras-lib.js');
const siteJs = read('site.js');

const { document, body } = makeDocument();
const memoryStore = {};
const localStorageMock = {
  getItem(key) { return Object.prototype.hasOwnProperty.call(memoryStore, key) ? memoryStore[key] : null; },
  setItem(key, value) { memoryStore[key] = String(value); },
  removeItem(key) { delete memoryStore[key]; }
};
const windowObj = {
  CARGPT_ENDPOINT: 'https://example.test/chat',
  CobrasSite: undefined,
  CobrasLib: undefined,
  openForm: undefined,
  closeForm: undefined,
  sendMessage: undefined,
  addEventListener() {},
  requestAnimationFrame(cb) { cb(); },
  scrollY: 0,
  pageYOffset: 0,
  scrollTo() {},
  innerWidth: 1200,
  innerHeight: 800,
  location: { href: 'http://localhost:3000/', origin: 'http://localhost:3000', pathname: '/index.html' },
  navigator: { serviceWorker: { register: async () => ({}) }, clipboard: null, share: null },
  localStorage: localStorageMock,
  fetch: async () => { throw new Error('offline'); },
  matchMedia: (query) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {}
  })
};
windowObj.window = windowObj;
windowObj.document = document;
// bind globals site.js expects
const sandbox = {
  window: windowObj,
  document,
  console,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  URL,
  AbortController,
  localStorage: localStorageMock,
  navigator: windowObj.navigator,
  addEventListener: windowObj.addEventListener,
  scrollY: 0,
  scrollTo: windowObj.scrollTo,
  innerWidth: 1200,
  innerHeight: 800,
  location: windowObj.location,
  fetch: windowObj.fetch,
  requestAnimationFrame: windowObj.requestAnimationFrame,
  matchMedia: windowObj.matchMedia,
  IntersectionObserver: class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
};

try {
  vm.runInNewContext(libJs, sandbox, { filename: 'cobras-lib.js' });
  windowObj.CobrasLib = sandbox.CobrasLib || windowObj.CobrasLib;
  pass('cobras-lib sandbox eval');
} catch (err) {
  fail('cobras-lib sandbox eval', err.message);
}

try {
  vm.runInNewContext(siteJs, sandbox, { filename: 'site.js' });
  pass('site.js sandbox eval');
} catch (err) {
  fail('site.js sandbox eval', err.message);
}

const CobrasSite = windowObj.CobrasSite || sandbox.CobrasSite;
if (!CobrasSite || typeof CobrasSite.localReply !== 'function') {
  fail('CobrasSite.localReply', 'public localReply not exposed on window.CobrasSite');
} else {
  pass('CobrasSite.localReply exposed');
  const reply48 = CobrasSite.localReply('How does the 48V system work?');
  if (!/48V/i.test(reply48)) fail('localReply 48V', `unexpected: ${reply48}`);
  else pass('localReply 48V');
  const replySponsor = CobrasSite.localReply('How can I sponsor the team?');
  if (!/sponsor|support/i.test(replySponsor)) fail('localReply sponsor', `unexpected: ${replySponsor}`);
  else pass('localReply sponsor');
  const replyFallback = CobrasSite.localReply('zzzz-unknown-topic-qqq');
  if (!/local mode|Specs|Our Work/i.test(replyFallback)) fail('localReply fallback', `unexpected: ${replyFallback}`);
  else pass('localReply fallback');
  const replyMeet = CobrasSite.localReply('When do you meet on Wednesday?');
  if (!/Wednesday|Thursday|Electric Car Room/i.test(replyMeet)) fail('localReply schedule', `unexpected: ${replyMeet}`);
  else pass('localReply schedule');
  const replySocial = CobrasSite.localReply('What is your Instagram?');
  if (!/sisaljadacobras|Instagram|TikTok/i.test(replySocial)) fail('localReply social', `unexpected: ${replySocial}`);
  else pass('localReply social');
}

if (typeof windowObj.openForm !== 'function' || typeof windowObj.closeForm !== 'function' || typeof windowObj.sendMessage !== 'function') {
  fail('chat API', 'openForm/closeForm/sendMessage missing after site.js load');
} else pass('chat open/close/send defined');

if (!document.querySelector('.skip-link') && !body.children.some?.(c => c.classList?.contains('skip-link'))) {
  // query may miss if prepend not walked - check body.children
  const hasSkip = (body.children || []).some(c => c.classList?.contains('skip-link') || c.className === 'skip-link');
  if (!hasSkip) fail('skip-link', 'skip link not injected');
  else pass('skip-link injected');
} else pass('skip-link injected');

if (!document.querySelector('.nav-toggle') && !(body.querySelector && body.querySelector('.nav-toggle'))) {
  const nav = document.querySelector('nav');
  const hasToggle = nav && (nav.children || []).some(c => c.classList?.contains('nav-toggle'));
  if (!hasToggle) fail('nav-toggle', 'mobile toggle not present');
  else pass('nav-toggle present');
} else pass('nav-toggle present');

// --- Optional live HTTP probe if server already up ---
function httpGet(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, res => {
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location && redirects < 5) {
        const next = new URL(res.headers.location, url).href;
        res.resume();
        resolve(httpGet(next, redirects + 1));
        return;
      }
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => resolve({ status: res.statusCode, body: data, url }));
    });
    req.on('error', reject);
    req.setTimeout(2500, () => { req.destroy(new Error('timeout')); });
  });
}

async function probeLive() {
  try {
    const home = await httpGet('http://127.0.0.1:3000/');
    if (home.status !== 200) fail('live /', `status ${home.status}`);
    else if (!/SIS Al Jada Cobras/i.test(home.body)) fail('live / content', 'missing team name');
    else pass('live / HTTP 200 + team name');
    for (const page of PAGES) {
      // serve may clean URL; also try pretty path without .html
      const res = await httpGet(`http://127.0.0.1:3000/${page}`);
      if (res.status !== 200) fail(`live ${page}`, `status ${res.status}`);
      else if (!/styles\.css/.test(res.body) || !/site\.js/.test(res.body)) fail(`live ${page} assets`, 'missing css/js');
      else if (!/Cobras/i.test(res.body)) fail(`live ${page} content`, 'missing Cobras brand');
      else pass(`live ${page} 200 + assets`);
    }
  } catch (err) {
    console.log(`SKIP  live HTTP probe (${err.message}) — static/sandbox checks already ran`);
  }
}

await probeLive();

// JSON-LD on home must parse
try {
  const homeHtml = read('index.html');
  const ld = homeHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!ld) fail('json-ld present', 'missing on index.html');
  else {
    JSON.parse(ld[1]);
    pass('json-ld parses');
  }
} catch (err) {
  fail('json-ld parses', err.message);
}


// --- game.js: early-return path when canvas missing (safe on non-game pages) ---
try {
  const gameJs = read('game.js');
  const gameSandbox = {
    document: { getElementById: () => null },
    window: {},
    console,
    localStorage: { getItem: () => null, setItem() {} },
    Image: class {},
    requestAnimationFrame() {},
    addEventListener() {},
    matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} })
  };
  gameSandbox.window = gameSandbox;
  vm.runInNewContext(gameJs, gameSandbox, { filename: 'game.js' });
  pass('game.js no-canvas early return');
} catch (err) {
  fail('game.js no-canvas early return', err.message);
}

// Legacy brand name should not remain in page chrome/titles
for (const page of PAGES) {
  const html = read(page);
  if (/Electric Car Club/i.test(html)) fail(`${page} legacy brand`, 'still contains Electric Car Club');
  else pass(`${page} no legacy club brand`);
}

if (failures.length) {
  console.error(`\n${failures.length} failure(s)`);
  process.exit(1);
}
console.log('\nAll verify-site checks passed.');
