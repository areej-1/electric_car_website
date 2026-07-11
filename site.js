(() => {
  try {
  const Lib = window.CobrasLib;
  if (!Lib) {
    console.warn('CobrasLib missing — load cobras-lib.js before site.js');
    return;
  }

  const storage = {
    get(key) {
      try { return localStorage.getItem(key); } catch { return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch { /* private mode */ }
    },
    getJSON(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch { return fallback; }
    },
    setJSON(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
    }
  };

  let lang = Lib.normalizeLang(storage.get('cobras_lang') || document.documentElement.lang || 'en');
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

  const pageName = Lib.currentPageName(location.pathname);
  const chatConfig = Lib.resolveChatConfig({
    storage: {
      CARGPT_ENDPOINT: storage.get('CARGPT_ENDPOINT') || undefined,
      CARGPT_API_KEY: storage.get('CARGPT_API_KEY') || undefined
    },
    CARGPT_ENDPOINT: window.CARGPT_ENDPOINT,
    CARGPT_API_KEY: window.CARGPT_API_KEY
  });

  /* ---------- Privacy-friendly analytics (local only) ---------- */
  const analytics = Lib.trackPageView(storage.getJSON('cobras_analytics', { total: 0, byPage: {}, byDay: {} }), pageName, Date.now());
  storage.setJSON('cobras_analytics', analytics);

  /* ---------- Skip link ---------- */
  const firstMain = document.querySelector('main');
  if (firstMain && !firstMain.id) firstMain.id = 'main';
  let skip = document.querySelector('.skip-link');
  if (!skip) {
    skip = document.createElement('a');
    skip.className = 'skip-link';
    skip.href = '#main';
    document.body.prepend(skip);
  }
  skip.textContent = Lib.t(lang, 'skip');

  /* ---------- Shared nav chrome ---------- */
  function buildNavHtml() {
    const items = Lib.NAV_ITEMS.map(item => {
      const current = Lib.isCurrentNav(item, pageName);
      return `<li><a href="${item.href}"${current ? ' aria-current="page"' : ''} data-i18n="${item.key}">${Lib.t(lang, item.key)}</a></li>`;
    }).join('');
    return `
    <a class="logo" href="index.html">SIS Al Jada Cobras</a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-menu" data-i18n-aria="nav.menu" aria-label="${Lib.t(lang, 'nav.menu')}">
      <span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
    </button>
    <ul id="site-menu">${items}</ul>
    <div class="nav-tools">
      <button type="button" class="lang-toggle" data-i18n="lang.toggle" aria-label="${Lib.t(lang, 'lang.label')}">${Lib.t(lang, 'lang.toggle')}</button>
    </div>`;
  }

  let nav = document.querySelector('nav');
  if (!nav) {
    nav = document.createElement('nav');
    nav.className = 'site-nav';
    nav.setAttribute('aria-label', 'Main');
    document.body.insertBefore(nav, document.body.firstChild?.nextSibling || null);
    if (skip && skip.nextSibling) document.body.insertBefore(nav, skip.nextSibling);
    else document.body.prepend(nav);
  }
  nav.classList.add('site-nav');
  nav.setAttribute('aria-label', 'Main');
  nav.innerHTML = buildNavHtml();

  const toggle = nav.querySelector('.nav-toggle');
  const menu = nav.querySelector('#site-menu');
  const langBtn = nav.querySelector('.lang-toggle');

  const setMenuOpen = (open) => {
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
    if (toggle) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', Lib.t(lang, open ? 'nav.menuClose' : 'nav.menu'));
    }
  };

  toggle?.addEventListener('click', () => setMenuOpen(!nav.classList.contains('is-open')));
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenuOpen(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) setMenuOpen(false);
  });

  const mobileNavQuery = window.matchMedia('(max-width: 1040px)');
  const syncMenuForViewport = () => { if (!mobileNavQuery.matches) setMenuOpen(false); };
  syncMenuForViewport();
  mobileNavQuery.addEventListener?.('change', syncMenuForViewport);

  /* ---------- Collapsing sticky top bar ---------- */
  const applyNavCollapse = () => {
    const collapsed = Lib.shouldCollapseNav(window.scrollY || window.pageYOffset || 0, Lib.NAV_COLLAPSE_THRESHOLD);
    nav.classList.toggle('is-collapsed', collapsed);
    document.documentElement.classList.toggle('nav-collapsed', collapsed);
  };
  applyNavCollapse();
  addEventListener('scroll', applyNavCollapse, { passive: true });

  /* ---------- Language toggle ---------- */
  function applyI18n() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(node => {
      const key = node.getAttribute('data-i18n');
      if (key) node.textContent = Lib.t(lang, key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(node => {
      const key = node.getAttribute('data-i18n-placeholder');
      if (key) node.setAttribute('placeholder', Lib.t(lang, key));
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(node => {
      const key = node.getAttribute('data-i18n-aria');
      if (key) node.setAttribute('aria-label', Lib.t(lang, key));
    });
    if (langBtn) langBtn.textContent = Lib.t(lang, 'lang.toggle');
    if (skip) skip.textContent = Lib.t(lang, 'skip');
    if (window.CobrasArabic) window.CobrasArabic.apply(document, pageName, lang);
  }

  langBtn?.addEventListener('click', () => {
    storage.set('cobras_lang', lang === 'en' ? 'ar' : 'en');
    location.reload();
  });

  applyI18n();

  /* ---------- Shared footer ---------- */
  function ensureFooter() {
    let footer = document.querySelector('footer');
    if (!footer) {
      footer = document.createElement('footer');
      document.body.appendChild(footer);
    }
    footer.innerHTML = `
      <div>
        <p class="footer-title" data-i18n="footer.brand">${Lib.t(lang, 'footer.brand')}</p>
        <p data-i18n="footer.tag">${Lib.t(lang, 'footer.tag')}</p>
      </div>
      <div class="footer-links">
        <a href="index.html" data-i18n="nav.home">${Lib.t(lang, 'nav.home')}</a>
        <a href="news.html" data-i18n="nav.news">${Lib.t(lang, 'nav.news')}</a>
        <a href="checklist.html" data-i18n="nav.checklist">${Lib.t(lang, 'nav.checklist')}</a>
        <a href="specs.html" data-i18n="nav.specs">${Lib.t(lang, 'nav.specs')}</a>
        <a href="specs-sheet.pdf" download>${Lib.t(lang, 'footer.specsPdf')}</a>
        <a href="sponsor-package.html" data-i18n="nav.package">${Lib.t(lang, 'nav.package')}</a>
        <a href="sponsor-package.pdf" download>${Lib.t(lang, 'footer.packagePdf')}</a>
        <a href="sponsors.html" data-i18n="nav.sponsors">${Lib.t(lang, 'nav.sponsors')}</a>
        <a href="game.html" data-i18n="nav.game">${Lib.t(lang, 'nav.game')}</a>
      </div>
      <div class="footer-meta">
        <p>${Lib.t(lang, 'footer.rights')} · ${Lib.t(lang, 'footer.made')}</p>
        <p class="analytics-note">${Lib.t(lang, 'analytics.notice')} · ${Lib.t(lang, 'footer.visits')}: ${analytics.total}</p>
        <div class="socials">
          <a href="https://tiktok.com/@sisaljadacobras" target="_blank" rel="noopener noreferrer"><img src="tiktok.png" alt="TikTok" width="28" height="28"></a>
          <a href="https://instagram.com/sisaljadacobras" target="_blank" rel="noopener noreferrer"><img src="instagram.png" alt="Instagram" width="28" height="28"></a>
        </div>
      </div>`;
  }
  ensureFooter();

  /* ---------- Media performance ---------- */
  document.querySelectorAll('img:not([loading])').forEach(img => {
    if (!img.closest('nav')) img.loading = 'lazy';
    if (!img.hasAttribute('decoding')) img.decoding = 'async';
  });
  document.querySelectorAll('video').forEach(video => {
    if (!video.hasAttribute('preload')) video.preload = 'none';
    video.setAttribute('playsinline', '');
  });

  /* ---------- Back to top ---------- */
  let backTop = document.querySelector('.back-to-top');
  if (!backTop) {
    backTop = document.createElement('a');
    backTop.href = '#';
    backTop.className = 'back-to-top';
    document.body.appendChild(backTop);
  }
  backTop.setAttribute('aria-label', Lib.t(lang, 'backTop'));
  backTop.textContent = '↑';
  const syncBackTop = () => backTop.classList.toggle('is-visible', scrollY > 480);
  addEventListener('scroll', syncBackTop, { passive: true });
  syncBackTop();
  backTop.addEventListener('click', event => {
    event.preventDefault();
    scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- CarGPT ---------- */
  const popup = document.getElementById('myForm');
  const launcher = document.querySelector('.open-button');
  const input = document.getElementById('chatInput');
  const messages = document.getElementById('chatMessages');

  if (popup && launcher && input && messages && nav) {
    input.setAttribute('aria-label', Lib.t(lang, 'chat.aria'));
    launcher.removeAttribute('onclick');
    launcher.type = 'button';
    launcher.setAttribute('aria-controls', 'myForm');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.innerHTML = `<span class="chat-status" aria-hidden="true"></span> <span data-i18n="chat.open">${Lib.t(lang, 'chat.open')}</span>`;
    const navTools = nav.querySelector('.nav-tools');
    (navTools || nav).appendChild(launcher);

    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-label', Lib.t(lang, 'chat.dialog'));
    popup.setAttribute('aria-modal', 'true');

    const intro = messages.querySelector('.bot-msg');
    if (intro && !/local FAQ|offline|محلي/i.test(intro.textContent)) {
      intro.textContent = `${intro.textContent.trim()} ${Lib.t(lang, 'chat.offlineNote')}`;
    }

    let prompts = popup.querySelector('.chat-prompts');
    if (!prompts) {
      prompts = document.createElement('div');
      prompts.className = 'chat-prompts';
      ['chat.prompt48', 'chat.promptEVGP', 'chat.promptSponsor'].forEach(key => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = Lib.t(lang, key);
        prompts.appendChild(button);
      });
      const textarea = popup.querySelector('textarea');
      if (textarea && textarea.parentNode) {
        if (typeof textarea.before === 'function') textarea.before(prompts);
        else textarea.parentNode.insertBefore(prompts, textarea);
      } else {
        popup.querySelector('.form-container')?.appendChild(prompts);
      }
    }

    input.setAttribute('data-i18n-placeholder', 'chat.placeholder');
    input.placeholder = Lib.t(lang, 'chat.placeholder');

    const addMessage = (text, className) => {
      const message = document.createElement('div');
      message.className = className;
      message.textContent = text;
      messages.appendChild(message);
      messages.scrollTop = messages.scrollHeight;
      return message;
    };

    window.openForm = () => {
      popup.classList.add('is-open');
      launcher.setAttribute('aria-expanded', 'true');
      requestAnimationFrame(() => input.focus());
    };
    window.closeForm = () => {
      popup.classList.remove('is-open');
      launcher.setAttribute('aria-expanded', 'false');
      launcher.focus();
    };
    launcher.addEventListener('click', () => {
      popup.classList.contains('is-open') ? window.closeForm() : window.openForm();
    });

    const statusDot = launcher.querySelector('.chat-status');

    window.sendMessage = async () => {
      const userText = input.value.trim();
      if (!userText || input.disabled) return;
      addMessage(userText, 'user-msg');
      input.value = '';
      input.disabled = true;
      popup.setAttribute('aria-busy', 'true');
      const thinking = addMessage('CarGPT is thinking…', 'bot-msg is-thinking');

      const showLocal = (extra) => {
        thinking.classList.remove('is-thinking');
        thinking.classList.add('is-local');
        const faq = Lib.localFaqReply(userText, lang);
        thinking.textContent = extra ? `${extra}\n\n${faq}` : faq;
        statusDot?.classList.add('is-offline');
        statusDot?.classList.remove('is-online');
      };

      try {
        const headers = { 'Content-Type': 'application/json' };
        if (chatConfig.apiKey) headers.Authorization = `Bearer ${chatConfig.apiKey}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const response = await fetch(chatConfig.endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({ message: userText }),
          signal: controller.signal
        });
        clearTimeout(timeout);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          // Never surface raw "Failed to fetch" / server noise as the only answer.
          const hint = data.error
            ? `Live CarGPT unavailable (${data.error}). Using local answers.`
            : `Live CarGPT unavailable (HTTP ${response.status}). Using local answers.`;
          showLocal(hint);
          return;
        }
        thinking.classList.remove('is-thinking');
        if (data.reply) {
          thinking.textContent = data.reply;
          statusDot?.classList.add('is-online');
          statusDot?.classList.remove('is-offline');
        } else {
          showLocal('Live CarGPT returned an empty reply. Using local answers.');
        }
      } catch (err) {
        const name = err && err.name;
        const hint = name === 'AbortError'
          ? 'Live CarGPT timed out. Using local answers.'
          : 'Live CarGPT offline (network/CORS/worker). Using local answers.';
        showLocal(hint);
      } finally {
        popup.removeAttribute('aria-busy');
        input.disabled = false;
        input.focus();
        messages.scrollTop = messages.scrollHeight;
      }
    };

    popup.querySelector('.btn:not(.cancel)')?.addEventListener('click', window.sendMessage);
    popup.querySelector('.cancel')?.addEventListener('click', window.closeForm);
    popup.querySelectorAll('.chat-prompts button').forEach(button => {
      button.type = 'button';
      button.addEventListener('click', () => {
        input.value = button.textContent.trim();
        input.focus();
      });
    });
    document.querySelector('.sponsor-chat-trigger')?.addEventListener('click', () => {
      window.openForm();
      input.value = 'How can I sponsor the team?';
    });
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        window.sendMessage();
      }
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && popup.classList.contains('is-open')) window.closeForm();
    });
  }

  /* ---------- Countdown (home + checklist) ---------- */
  try {
    document.querySelectorAll('[data-race-date]').forEach((countdown) => {
      const raw = countdown.getAttribute('data-race-date') || countdown.dataset?.raceDate || Lib.RACE_ISO;
      const target = new Date(raw).getTime();
      if (!Number.isFinite(target)) return;
      const tick = () => {
        const parts = Lib.countdownParts(Date.now(), target);
        ['days', 'hours', 'minutes', 'seconds'].forEach((key) => {
          const node = countdown.querySelector(`[data-countdown="${key}"]`);
          if (node) node.textContent = String(parts[key]).padStart(key === 'days' ? 3 : 2, '0');
        });
      };
      tick();
      setInterval(tick, 1000);
    });
  } catch (err) {
    console.warn('Countdown init skipped', err);
  }

  /* ---------- Checklist page ---------- */
  const checklistRoot = document.querySelector('[data-checklist]');
  if (checklistRoot) {
    const KEY = 'cobras_checklist_v1';
    const defaults = JSON.parse(checklistRoot.getAttribute('data-checklist') || '[]');
    let state = storage.getJSON(KEY, null);
    if (!state || !Array.isArray(state.items) || state.items.length !== defaults.length) {
      state = { items: defaults.map(item => ({ id: item.id, done: false })) };
    }
    const render = () => {
      const merged = defaults.map((item, index) => ({
        ...item,
        done: Boolean(state.items[index] && state.items[index].done)
      }));
      const progress = Lib.checklistProgress(merged);
      const bar = checklistRoot.querySelector('[data-checklist-progress]');
      const label = checklistRoot.querySelector('[data-checklist-label]');
      if (bar) bar.style.width = `${progress.percent}%`;
      if (label) label.textContent = `${progress.done} / ${progress.total} (${progress.percent}%)`;
      checklistRoot.querySelectorAll('[data-check-id]').forEach(input => {
        const id = input.getAttribute('data-check-id');
        const found = merged.find(item => item.id === id);
        if (found) input.checked = found.done;
      });
      storage.setJSON(KEY, { items: merged.map(item => ({ id: item.id, done: item.done })) });
    };
    checklistRoot.querySelectorAll('[data-check-id]').forEach(input => {
      input.addEventListener('change', () => {
        const id = input.getAttribute('data-check-id');
        const index = defaults.findIndex(item => item.id === id);
        if (index >= 0) {
          state.items[index] = { id, done: input.checked };
          render();
        }
      });
    });
    checklistRoot.querySelector('[data-checklist-reset]')?.addEventListener('click', () => {
      state = { items: defaults.map(item => ({ id: item.id, done: false })) };
      render();
    });
    render();
  }

  /* ---------- Members filters polish ---------- */
  const memberGrid = document.querySelector('.members-grid');
  if (memberGrid) {
    const cards = [...memberGrid.querySelectorAll('section')];
    const roles = [...new Set(cards.map(card => card.querySelector('p')?.textContent.trim()).filter(Boolean))];
    document.querySelector('.member-filters')?.remove();
    document.querySelector('.members-empty')?.remove();
    document.querySelector('.member-filter-meta')?.remove();

    const wrap = document.createElement('div');
    wrap.className = 'member-filter-shell';
    const meta = document.createElement('p');
    meta.className = 'member-filter-meta';
    const filters = document.createElement('div');
    filters.className = 'member-filters';
    filters.setAttribute('role', 'toolbar');
    filters.setAttribute('aria-label', Lib.t(lang, 'filter.aria'));

    const empty = document.createElement('p');
    empty.className = 'members-empty';
    empty.hidden = true;
    empty.setAttribute('aria-live', 'polite');
    empty.setAttribute('data-i18n', 'filter.empty');
    empty.textContent = Lib.t(lang, 'filter.empty');

    const paint = (role) => {
      filters.querySelectorAll('button').forEach(btn => {
        const active = btn.dataset.role === role;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      let visible = 0;
      cards.forEach(card => {
        const cardRole = card.querySelector('p')?.textContent.trim();
        const show = role === 'All' || cardRole === role;
        card.hidden = !show;
        if (show) visible += 1;
      });
      empty.hidden = visible > 0;
      meta.textContent = lang === 'ar'
        ? (role === 'All' ? `عرض جميع الأعضاء: ${cards.length} · الأدوار: ${roles.length}` : `المعروض: ${visible} · الدور: ${role}`)
        : (role === 'All' ? `Showing all ${cards.length} builders · ${roles.length} roles` : `Showing ${visible} · role: ${role}`);
    };

    ['All', ...roles].forEach(role => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.role = role;
      button.textContent = role === 'All' ? Lib.t(lang, 'filter.all') : role;
      if (role === 'All') button.setAttribute('data-i18n', 'filter.all');
      button.addEventListener('click', () => paint(role));
      filters.appendChild(button);
    });

    wrap.appendChild(meta);
    wrap.appendChild(filters);
    if (typeof memberGrid.before === 'function') memberGrid.before(wrap);
    else memberGrid.parentNode?.insertBefore(wrap, memberGrid);
    if (typeof memberGrid.after === 'function') memberGrid.after(empty);
    else memberGrid.parentNode?.insertBefore(empty, memberGrid.nextSibling);
    cards.forEach(card => {
      const name = card.querySelector('h2')?.textContent.trim();
      const role = card.querySelector('p')?.textContent.trim();
      if (role) card.dataset.role = role;
      const img = card.querySelector('img');
      if (img && name) {
        const generic = !img.alt || /^(ducky|description|image)$/i.test(img.alt.trim());
        if (generic) img.alt = role ? `${name}, ${role}` : name;
      }
    });
    paint('All');
  }

  /* ---------- Timeline visibility ---------- */
  const timeline = document.querySelector('.build-timeline');
  const timelineProgress = document.querySelector('.timeline-progress span');
  if (timeline && timelineProgress) {
    const steps = [...timeline.querySelectorAll('.timeline-step')];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('is-visible', entry.isIntersecting));
    }, { threshold: 0.18 });
    steps.forEach(step => observer.observe(step));
    const updateTimeline = () => {
      const rect = timeline.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - innerHeight)));
      timelineProgress.style.transform = `scaleY(${progress})`;
    };
    addEventListener('scroll', updateTimeline, { passive: true });
    updateTimeline();
  }

  /* ---------- Public API ---------- */
  window.CobrasSite = {
    version: '2.0.0',
    chatEndpoint: chatConfig.endpoint,
    hasChatKey: chatConfig.hasKey,
    lang,
    localReply: (text) => Lib.localFaqReply(text, lang),
    lib: Lib,
    shouldCollapseNav: Lib.shouldCollapseNav,
    buildScoreShareText: Lib.buildScoreShareText,
    checklistProgress: Lib.checklistProgress,
    countdownParts: Lib.countdownParts,
    t: (key) => Lib.t(lang, key),
    setLang(next) {
      storage.set('cobras_lang', Lib.normalizeLang(next));
      location.reload();
    },
    getAnalytics() {
      return storage.getJSON('cobras_analytics', { total: 0, byPage: {}, byDay: {} });
    }
  };

  /* ---------- PWA service worker ---------- */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline path still ok */ });
  }
  } catch (err) {
    console.error('Cobras site.js failed', err);
  }
})();
