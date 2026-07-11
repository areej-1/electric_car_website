(() => {
  const CHAT_ENDPOINT = window.CARGPT_ENDPOINT || 'https://cobras-chat.areej-dridi.workers.dev';

  const popup = document.getElementById('myForm');
  const launcher = document.querySelector('.open-button');
  const input = document.getElementById('chatInput');
  const messages = document.getElementById('chatMessages');
  const nav = document.querySelector('nav');

  if (!popup || !launcher || !input || !messages || !nav) return;

  launcher.removeAttribute('onclick');
  launcher.type = 'button';
  launcher.setAttribute('aria-controls', 'myForm');
  launcher.setAttribute('aria-expanded', 'false');
  launcher.innerHTML = '<span class="chat-status" aria-hidden="true"></span> CarGPT';
  nav.appendChild(launcher);

  popup.setAttribute('role', 'dialog');
  popup.setAttribute('aria-label', 'CarGPT assistant');

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

  window.sendMessage = async () => {
    const userText = input.value.trim();
    if (!userText || input.disabled) return;

    addMessage(userText, 'user-msg');
    input.value = '';
    input.disabled = true;
    const thinking = addMessage('CarGPT is thinking…', 'bot-msg is-thinking');

    try {
      const response = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
      thinking.classList.remove('is-thinking');
      thinking.textContent = data.reply || 'I could not generate an answer this time.';
    } catch (error) {
      thinking.classList.remove('is-thinking');
      thinking.textContent = 'CarGPT is offline right now. Please try again shortly.';
    } finally {
      input.disabled = false;
      input.focus();
      messages.scrollTop = messages.scrollHeight;
    }
  };

  popup.querySelector('.btn:not(.cancel)')?.removeAttribute('onclick');
  popup.querySelector('.btn:not(.cancel)')?.addEventListener('click', window.sendMessage);
  popup.querySelector('.cancel')?.removeAttribute('onclick');
  popup.querySelector('.cancel')?.addEventListener('click', window.closeForm);

  document.querySelectorAll('.chat-prompts button').forEach(button => {
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

  document.querySelectorAll('.splide').forEach(carousel => {
    let wheelLocked = false;
    carousel.setAttribute('tabindex', '0');
    carousel.setAttribute('aria-description', 'Use arrows, swipe, or scroll to change slides');
    carousel.addEventListener('wheel', event => {
      if (wheelLocked || Math.abs(event.deltaY) + Math.abs(event.deltaX) < 8) return;
      event.preventDefault();
      const direction = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      carousel.querySelector(direction > 0 ? '.splide__arrow--next' : '.splide__arrow--prev')?.click();
      wheelLocked = true;
      setTimeout(() => wheelLocked = false, 480);
    }, { passive: false });
  });

  const countdown = document.querySelector('[data-race-date]');
  if (countdown) {
    const target = new Date(countdown.dataset.raceDate).getTime();
    const tick = () => {
      const remaining = Math.max(0, target - Date.now());
      const values = {
        days: Math.floor(remaining / 86400000),
        hours: Math.floor(remaining / 3600000) % 24,
        minutes: Math.floor(remaining / 60000) % 60,
        seconds: Math.floor(remaining / 1000) % 60
      };
      Object.entries(values).forEach(([key, value]) => {
        const node = countdown.querySelector(`[data-countdown="${key}"]`);
        if (node) node.textContent = String(value).padStart(key === 'days' ? 3 : 2, '0');
      });
    };
    tick();
    setInterval(tick, 1000);
  }

  const timeline = document.querySelector('.build-timeline');
  const timelineProgress = document.querySelector('.timeline-progress span');
  if (timeline && timelineProgress) {
    const steps = [...timeline.querySelectorAll('.timeline-step')];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('is-visible', entry.isIntersecting));
    }, { threshold: .18 });
    steps.forEach(step => observer.observe(step));
    const updateTimeline = () => {
      const rect = timeline.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - innerHeight)));
      timelineProgress.style.transform = `scaleY(${progress})`;
    };
    addEventListener('scroll', updateTimeline, { passive: true });
    updateTimeline();
  }

  const memberGrid = document.querySelector('.members-grid');
  if (memberGrid) {
    const cards = [...memberGrid.querySelectorAll('section')];
    const roles = [...new Set(cards.map(card => card.querySelector('p')?.textContent.trim()).filter(Boolean))];
    const filters = document.createElement('div');
    filters.className = 'member-filters';
    ['All', ...roles].forEach(role => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = role;
      button.className = role === 'All' ? 'is-active' : '';
      button.addEventListener('click', () => {
        filters.querySelectorAll('button').forEach(item => item.classList.toggle('is-active', item === button));
        cards.forEach(card => card.hidden = role !== 'All' && card.querySelector('p')?.textContent.trim() !== role);
      });
      filters.appendChild(button);
    });
    memberGrid.before(filters);
    cards.forEach(card => {
      const role = card.querySelector('p')?.textContent.trim();
      if (role) card.dataset.role = role;
    });
  }
})();
