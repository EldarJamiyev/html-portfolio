/**
 * ELDAR JAMIYEV — PORTFOLIO · script.js
 * Premium enterprise portfolio — modular, performant, accessible
 * IntersectionObserver · Canvas particles · Theme · Cursor · Command palette
 */

'use strict';

/* ════════════════════════════════════════════════════════════
   CONSTANTS & STATE
   ════════════════════════════════════════════════════════════ */
const APP = {
  theme:       localStorage.getItem('ej-theme') || 'dark',
  menuOpen:    false,
  cmdOpen:     false,
  countersRan: false,
};

const CYCLE_WORDS    = 5;      // how many .cycle-word items
const CYCLE_INTERVAL = 3200;   // ms between word rotations
let   cycleTimer     = null;
let   cycleIdx       = 0;

/* ════════════════════════════════════════════════════════════
   DOM UTILITIES
   ════════════════════════════════════════════════════════════ */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ════════════════════════════════════════════════════════════
   LOADER
   ════════════════════════════════════════════════════════════ */
function initLoader() {
  const loader = $('#loader');
  const fill   = $('#loader-fill');
  const label  = $('#loader-label');
  if (!loader) return;

  const messages = ['Initializing…', 'Loading profile…', 'Building portfolio…', 'Almost ready…'];
  let pct  = 0;
  let step = 0;
  const interval = setInterval(() => {
    pct = Math.min(pct + Math.random() * 22 + 8, 100);
    fill.style.width = pct + '%';
    if (step < messages.length) label.textContent = messages[step++];
    if (pct >= 100) {
      clearInterval(interval);
      fill.style.width = '100%';
      setTimeout(() => {
        loader.classList.add('fade-out');
        setTimeout(() => {
          loader.remove();
          document.body.style.overflow = '';
        }, 700);
      }, 300);
    }
  }, 120);

  document.body.style.overflow = 'hidden';
}

/* ════════════════════════════════════════════════════════════
   THEME
   ════════════════════════════════════════════════════════════ */
function initTheme() {
  applyTheme(APP.theme);
  const btn = $('#theme-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    APP.theme = APP.theme === 'dark' ? 'light' : 'dark';
    applyTheme(APP.theme);
    localStorage.setItem('ej-theme', APP.theme);
  });
}
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = t === 'dark' ? '#060C1A' : '#F8FAFC';
}

/* ════════════════════════════════════════════════════════════
   NAVIGATION — scroll spy, stuck state, mobile menu
   ════════════════════════════════════════════════════════════ */
function initNav() {
  const nav       = $('#nav');
  const ham       = $('#hamburger');
  const mMenu     = $('#mobile-menu');
  const navLinks  = $$('.nav-link');
  const mLinks    = $$('.mobile-link');

  // Scrolled class
  const onScroll = throttle(() => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 20);

    // Reading progress
    const prog  = $('#reading-progress');
    const total = document.documentElement.scrollHeight - window.innerHeight;
    if (prog && total > 0) prog.style.width = (y / total * 100) + '%';

    // Back to top
    const btt = $('#btt-btn');
    if (btt) btt.classList.toggle('visible', y > 400);
  }, 50);
  window.addEventListener('scroll', onScroll, { passive: true });

  // Scroll spy
  const sections = $$('section[id]');
  const spyObs   = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        navLinks.forEach(l => l.classList.toggle('active', l.dataset.spy === id));
      }
    });
  }, { threshold: 0.35 });
  sections.forEach(s => spyObs.observe(s));

  // Mobile menu toggle
  if (ham) {
    ham.addEventListener('click', () => {
      APP.menuOpen = !APP.menuOpen;
      ham.classList.toggle('open', APP.menuOpen);
      ham.setAttribute('aria-expanded', APP.menuOpen);
      mMenu.classList.toggle('open', APP.menuOpen);
      mMenu.setAttribute('aria-hidden', !APP.menuOpen);
    });
  }

  // Close menu on link click
  mLinks.forEach(l => {
    l.addEventListener('click', () => {
      APP.menuOpen = false;
      ham?.classList.remove('open');
      ham?.setAttribute('aria-expanded', false);
      mMenu?.classList.remove('open');
      mMenu?.setAttribute('aria-hidden', true);
    });
  });

  // Smooth-scroll for all internal anchors
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const target = document.getElementById(a.getAttribute('href').slice(1));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72);
    window.scrollTo({ top, behavior: 'smooth' });
  });
}

/* ════════════════════════════════════════════════════════════
   BACK TO TOP
   ════════════════════════════════════════════════════════════ */
function initBtt() {
  const btn = $('#btt-btn');
  if (!btn) return;
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ════════════════════════════════════════════════════════════
   CUSTOM CURSOR
   ════════════════════════════════════════════════════════════ */
function initCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const dot  = $('#cursor-dot');
  const ring = $('#cursor-ring');
  if (!dot || !ring) return;

  let mx = -100, my = -100;
  let rx = -100, ry = -100;
  let rafId;

  const moveDot = (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
  };

  const animateRing = () => {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    rafId = requestAnimationFrame(animateRing);
  };

  document.addEventListener('mousemove', moveDot, { passive: true });
  animateRing();

  // Hover state on interactive elements
  const hoverEls = 'a, button, [data-magnetic], .cert-filter, .cmd-item, .mobile-link, .hc-link-btn';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverEls)) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverEls)) document.body.classList.remove('cursor-hover');
  });
  document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
  document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));
}

/* ════════════════════════════════════════════════════════════
   HERO PARTICLE CANVAS
   ════════════════════════════════════════════════════════════ */
function initParticles() {
  const canvas = $('#hero-canvas');
  const hero   = $('.hero');
  if (!canvas || !hero) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  let mouseX = -1000, mouseY = -1000;

  function resize() {
    W = canvas.width  = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
  }

  function createParticles() {
    particles = [];
    const count = Math.min(Math.floor((W * H) / 16000), 75);
    for (let i = 0; i < count; i++) {
      particles.push({
        x:   Math.random() * W,
        y:   Math.random() * H,
        vx:  (Math.random() - 0.5) * 0.35,
        vy:  (Math.random() - 0.5) * 0.35,
        r:   Math.random() * 1.8 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
        hue: Math.random() > 0.55 ? 'blue' : 'cyan',
        phase: Math.random() * Math.PI * 2,
        speed: 0.003 + Math.random() * 0.004,
      });
    }
  }

  function colorFor(p, o) {
    if (p.hue === 'blue') return `rgba(59,130,246,${o})`;
    return `rgba(6,182,212,${o})`;
  }

  const MAX_DIST = 120;

  let lastTime = 0;
  let rafId;

  function tick(now) {
    rafId = requestAnimationFrame(tick);
    if (now - lastTime < 24) return; // ~40fps cap
    lastTime = now;

    ctx.clearRect(0, 0, W, H);

    particles.forEach((p, i) => {
      // Drift
      p.phase += p.speed;
      p.x += p.vx + Math.sin(p.phase) * 0.15;
      p.y += p.vy + Math.cos(p.phase * 0.7) * 0.12;

      // Subtle mouse attraction
      const dx = mouseX - p.x;
      const dy = mouseY - p.y;
      const distM = Math.sqrt(dx * dx + dy * dy);
      if (distM < 180) {
        p.x += dx * 0.0012;
        p.y += dy * 0.0012;
      }

      // Wrap
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = colorFor(p, p.opacity);
      ctx.fill();

      // Connect nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const q   = particles[j];
        const ddx = p.x - q.x;
        const ddy = p.y - q.y;
        const d   = Math.sqrt(ddx * ddx + ddy * ddy);
        if (d < MAX_DIST) {
          const alpha = (1 - d / MAX_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(59,130,246,${alpha})`;
          ctx.lineWidth   = 0.7;
          ctx.stroke();
        }
      }
    });
  }

  resize();
  createParticles();
  rafId = requestAnimationFrame(tick);

  window.addEventListener('resize', debounce(() => {
    resize();
    createParticles();
  }, 200));

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  }, { passive: true });
  hero.addEventListener('mouseleave', () => { mouseX = -1000; mouseY = -1000; });

  // Pause when not visible
  const visObs = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { if (!rafId) rafId = requestAnimationFrame(tick); }
    else { cancelAnimationFrame(rafId); rafId = null; }
  });
  visObs.observe(hero);
}

/* ════════════════════════════════════════════════════════════
   HERO ROLE CYCLING
   ════════════════════════════════════════════════════════════ */
function initRoleCycle() {
  const words = $$('.cycle-word');
  if (!words.length) return;

  function showWord(idx) {
    words.forEach((w, i) => {
      w.classList.remove('active', 'exit');
      if (i === idx) w.classList.add('active');
    });
  }

  function nextWord() {
    const prev = cycleIdx;
    words[prev]?.classList.add('exit');
    setTimeout(() => words[prev]?.classList.remove('exit'), 400);
    cycleIdx = (cycleIdx + 1) % words.length;
    showWord(cycleIdx);
  }

  showWord(0);
  cycleTimer = setInterval(nextWord, CYCLE_INTERVAL);
}

/* ════════════════════════════════════════════════════════════
   SCROLL REVEAL
   ════════════════════════════════════════════════════════════ */
function initReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    $$('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal').forEach(el => obs.observe(el));
}

/* ════════════════════════════════════════════════════════════
   COUNTERS
   ════════════════════════════════════════════════════════════ */
function initCounters() {
  const counters = $$('.counter');
  if (!counters.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el     = e.target;
      const target = parseInt(el.dataset.target, 10);
      const dur    = 1400;
      const start  = performance.now();

      const tick = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / dur, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(ease * target);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      };

      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.6 });

  counters.forEach(c => obs.observe(c));
}

/* ════════════════════════════════════════════════════════════
   SKILL BAR ANIMATIONS
   ════════════════════════════════════════════════════════════ */
function initSkillBars() {
  const fills = $$('.skill-bar-fill');
  if (!fills.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const fill = e.target;
      requestAnimationFrame(() => {
        fill.classList.add('animated');
      });
      obs.unobserve(fill);
    });
  }, { threshold: 0.4 });

  fills.forEach(f => obs.observe(f));
}

/* ════════════════════════════════════════════════════════════
   LANGUAGE RINGS
   ════════════════════════════════════════════════════════════ */
function initLangRings() {
  const rings = $$('.ring-prog');
  if (!rings.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const ring  = e.target;
      const offset = parseFloat(ring.dataset.offset);
      // Small delay for elegant entrance
      setTimeout(() => { ring.style.strokeDashoffset = offset; }, 200);
      obs.unobserve(ring);
    });
  }, { threshold: 0.5 });

  rings.forEach(r => obs.observe(r));
}

/* ════════════════════════════════════════════════════════════
   CERTIFICATION FILTER
   ════════════════════════════════════════════════════════════ */
function initCertFilter() {
  const filters = $$('.cert-filter');
  const cards   = $$('.cert-card');
  if (!filters.length) return;

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active button
      filters.forEach(f => {
        f.classList.remove('active');
        f.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      // Show/hide cards
      cards.forEach(card => {
        const cat = card.dataset.cat;
        let show;

        if (filter === 'all') {
          show = true;
        } else if (filter === 'coursera') {
          // Show all Coursera variants
          show = cat.startsWith('coursera');
        } else {
          show = cat === filter;
        }

        if (show) {
          card.classList.remove('cert-hidden');
          card.style.display = '';
        } else {
          card.classList.add('cert-hidden');
          setTimeout(() => {
            if (card.classList.contains('cert-hidden')) card.style.display = 'none';
          }, 350);
        }
      });
    });
  });
}

/* ════════════════════════════════════════════════════════════
   CONTACT FORM
   ════════════════════════════════════════════════════════════ */
function initContactForm() {
  const form    = $('#contact-form');
  const success = $('#form-success');
  const backBtn = $('#success-back-btn');
  const submit  = $('#form-submit-btn');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;

    submit.classList.add('loading');
    await sleep(1200); // Simulate sending

    form.style.display = 'none';
    success.removeAttribute('hidden');

    // Animate success SVG
    const circle = success.querySelector('.succ-circle');
    const check  = success.querySelector('.succ-check');
    requestAnimationFrame(() => {
      circle?.classList.add('animate');
      check?.classList.add('animate');
    });

    submit.classList.remove('loading');
  });

  backBtn?.addEventListener('click', () => {
    form.style.display = '';
    success.setAttribute('hidden', '');
    form.reset();
    clearFormErrors(form);
    const circle = success.querySelector('.succ-circle');
    const check  = success.querySelector('.succ-check');
    circle?.classList.remove('animate');
    check?.classList.remove('animate');
  });

  // Real-time validation
  form.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) validateField(input);
    });
  });
}

function validateForm(form) {
  const inputs  = form.querySelectorAll('.form-input');
  let allValid  = true;
  inputs.forEach(inp => { if (!validateField(inp)) allValid = false; });
  return allValid;
}

function validateField(input) {
  const errId = input.getAttribute('aria-describedby');
  const err   = errId ? document.getElementById(errId) : null;
  let msg = '';

  if (!input.value.trim() && input.required) {
    msg = 'This field is required.';
  } else if (input.type === 'email' && input.value) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) msg = 'Please enter a valid email address.';
  }

  input.classList.toggle('error', !!msg);
  if (err) err.textContent = msg;
  return !msg;
}

function clearFormErrors(form) {
  form.querySelectorAll('.form-input').forEach(i => {
    i.classList.remove('error');
    const errId = i.getAttribute('aria-describedby');
    if (errId) { const e = document.getElementById(errId); if (e) e.textContent = ''; }
  });
}

/* ════════════════════════════════════════════════════════════
   CLIPBOARD COPY
   ════════════════════════════════════════════════════════════ */
function initClipboard() {
  document.addEventListener('click', async e => {
    const btn = e.target.closest('.ci-copy');
    if (!btn) return;
    const text = btn.dataset.copy;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      btn.classList.add('copied');
      const origTitle = btn.getAttribute('aria-label');
      btn.setAttribute('aria-label', 'Copied!');
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.setAttribute('aria-label', origTitle);
      }, 2000);
    } catch (_) {}
  });
}

/* ════════════════════════════════════════════════════════════
   COMMAND PALETTE
   ════════════════════════════════════════════════════════════ */
function initCommandPalette() {
  const overlay  = $('#cmd-overlay');
  const input    = $('#cmd-input');
  const items    = $$('.cmd-item');
  const cmdBtn   = $('#cmd-btn');
  if (!overlay) return;

  function openCmd() {
    APP.cmdOpen = true;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    setTimeout(() => input?.focus(), 80);
  }
  function closeCmd() {
    APP.cmdOpen = false;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    if (input) input.value = '';
    items.forEach(i => i.style.display = '');
  }

  cmdBtn?.addEventListener('click', openCmd);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeCmd(); });

  // Search/filter items
  input?.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    items.forEach(item => {
      const lbl = (item.querySelector('.cmd-item-label')?.textContent || '').toLowerCase();
      item.style.display = (!q || lbl.includes(q)) ? '' : 'none';
    });
  });

  // Handle item click
  items.forEach(item => {
    item.addEventListener('click', () => {
      const href   = item.dataset.href;
      const action = item.dataset.action;
      if (href) {
        const target = document.getElementById(href.slice(1));
        if (target) {
          const top = target.getBoundingClientRect().top + window.scrollY - (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72);
          window.scrollTo({ top, behavior: 'smooth' });
        }
      } else if (action === 'theme') {
        APP.theme = APP.theme === 'dark' ? 'light' : 'dark';
        applyTheme(APP.theme);
        localStorage.setItem('ej-theme', APP.theme);
      }
      closeCmd();
    });
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    const mod   = isMac ? e.metaKey : e.ctrlKey;

    if (mod && e.key === 'k') { e.preventDefault(); APP.cmdOpen ? closeCmd() : openCmd(); return; }
    if (e.key === 'Escape' && APP.cmdOpen) { closeCmd(); return; }

    // Don't intercept shortcuts while typing
    if (document.activeElement.matches('input, textarea, select')) return;

    const shortcuts = {
      h: '#home', a: '#about', e: '#experience', u: '#education',
      s: '#skills', c: '#certifications', l: '#languages', k: '#contact'
    };
    if (!APP.cmdOpen && shortcuts[e.key.toLowerCase()]) {
      const target = document.getElementById(shortcuts[e.key.toLowerCase()].slice(1));
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY - (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72);
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
    if (e.key === 't' && !APP.cmdOpen) {
      APP.theme = APP.theme === 'dark' ? 'light' : 'dark';
      applyTheme(APP.theme);
      localStorage.setItem('ej-theme', APP.theme);
    }
  });
}

/* ════════════════════════════════════════════════════════════
   MAGNETIC BUTTONS
   ════════════════════════════════════════════════════════════ */
function initMagnetic() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  $$('[data-magnetic]').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width  / 2;
      const y = e.clientY - rect.top  - rect.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

/* ════════════════════════════════════════════════════════════
   FOOTER YEAR
   ════════════════════════════════════════════════════════════ */
function initFooterYear() {
  const el = $('#footer-yr');
  if (el) el.textContent = new Date().getFullYear();
}

/* ════════════════════════════════════════════════════════════
   HERO HERO-CARD TILT (desktop only)
   ════════════════════════════════════════════════════════════ */
function initCardTilt() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const card = $('.hero-card');
  if (!card) return;

  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x    = ((e.clientX - rect.left) / rect.width  - 0.5) * 14;
    const y    = ((e.clientY - rect.top)  / rect.height - 0.5) * -14;
    card.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
}

/* ════════════════════════════════════════════════════════════
   STAGGER DELAYS for grid children
   ════════════════════════════════════════════════════════════ */
function initStaggerDelays() {
  const grids = ['.certs-grid', '.lang-grid', '.skills-grid', '.edu-grid', '.about-highlights'];
  grids.forEach(sel => {
    const parent = $(sel);
    if (!parent) return;
    const children = parent.querySelectorAll(':scope > *');
    children.forEach((child, i) => {
      if (child.classList.contains('reveal')) {
        child.style.transitionDelay = `${i * 60}ms`;
      }
    });
  });
}

/* ════════════════════════════════════════════════════════════
   UTILS
   ════════════════════════════════════════════════════════════ */
function throttle(fn, limit) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last < limit) return;
    last = now;
    return fn.apply(this, args);
  };
}

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ════════════════════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initTheme();
  initNav();
  initBtt();
  initCursor();
  initParticles();
  initRoleCycle();
  initReveal();
  initCounters();
  initSkillBars();
  initLangRings();
  initCertFilter();
  initContactForm();
  initClipboard();
  initCommandPalette();
  initMagnetic();
  initFooterYear();
  initCardTilt();
  initStaggerDelays();
});

/* ════════════════════════════════════════════════════════════
   REDUCED MOTION SUPPORT
   ════════════════════════════════════════════════════════════ */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
if (prefersReduced.matches) {
  document.documentElement.style.setProperty('--dur-xs',  '0ms');
  document.documentElement.style.setProperty('--dur-sm',  '0ms');
  document.documentElement.style.setProperty('--dur-md',  '0ms');
  document.documentElement.style.setProperty('--dur-lg',  '0ms');
  document.documentElement.style.setProperty('--dur-xl',  '0ms');
}
 
