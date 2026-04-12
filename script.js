/* ═══════════════════════════════════════════════════════════════
   ELDAR JAMIYEV — CYBER-KINETIC COMMAND CENTER
   script.js — Full production JavaScript engine
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── UTILITY ───────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max + 1));
const isMobile = () => window.innerWidth <= 600;

/* ═══════════════════════════════════════════════════════════════
   1. PARTICLE CANVAS SYSTEM
   ═══════════════════════════════════════════════════════════════ */
(function initParticles() {
  const canvas = $('#particle-canvas');
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], mouse = { x: -9999, y: -9999 };
  let animFrame;

  const CONFIG = {
    particleCount: isMobile() ? 60 : 140,
    connectionDistance: isMobile() ? 100 : 160,
    particleSpeed: 0.35,
    particleSize: { min: 1, max: 2.5 },
    colors: ['#22d3ee', '#a78bfa', '#4ade80'],
    colorWeights: [0.7, 0.2, 0.1],
    mouseRadius: 140,
    mouseRepel: 60,
    parallaxStrength: 0.015,
  };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function pickColor() {
    const r = Math.random();
    if (r < CONFIG.colorWeights[0]) return CONFIG.colors[0];
    if (r < CONFIG.colorWeights[0] + CONFIG.colorWeights[1]) return CONFIG.colors[1];
    return CONFIG.colors[2];
  }

  class Particle {
    constructor() { this.reset(true); }

    reset(init = false) {
      this.x = rand(0, W);
      this.y = init ? rand(0, H) : (Math.random() > 0.5 ? -10 : H + 10);
      this.vx = rand(-CONFIG.particleSpeed, CONFIG.particleSpeed);
      this.vy = rand(-CONFIG.particleSpeed, CONFIG.particleSpeed);
      if (Math.abs(this.vx) < 0.1) this.vx = 0.15;
      if (Math.abs(this.vy) < 0.1) this.vy = 0.15;
      this.size = rand(CONFIG.particleSize.min, CONFIG.particleSize.max);
      this.color = pickColor();
      this.alpha = rand(0.3, 0.8);
      this.alphaDelta = rand(0.002, 0.006) * (Math.random() > 0.5 ? 1 : -1);
      this.baseX = this.x;
      this.baseY = this.y;
    }

    update(mx, my) {
      // Mouse interaction
      const dx = this.x - mx;
      const dy = this.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < CONFIG.mouseRadius) {
        const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
        const angle = Math.atan2(dy, dx);
        this.x += Math.cos(angle) * force * CONFIG.mouseRepel * 0.05;
        this.y += Math.sin(angle) * force * CONFIG.mouseRepel * 0.05;
      }

      // Parallax offset based on mouse position
      const offsetX = (mx / W - 0.5) * CONFIG.parallaxStrength * 60;
      const offsetY = (my / H - 0.5) * CONFIG.parallaxStrength * 60;

      this.x += this.vx + offsetX * 0.01;
      this.y += this.vy + offsetY * 0.01;

      // Alpha pulse
      this.alpha += this.alphaDelta;
      if (this.alpha > 0.85 || this.alpha < 0.2) {
        this.alphaDelta *= -1;
      }

      // Wrap boundaries
      if (this.x < -20) this.x = W + 20;
      if (this.x > W + 20) this.x = -20;
      if (this.y < -20) this.y = H + 20;
      if (this.y > H + 20) this.y = -20;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.shadowBlur = 6;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }
  }

  function connectParticles() {
    const len = particles.length;
    for (let i = 0; i < len; i++) {
      for (let j = i + 1; j < len; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.connectionDistance) {
          const opacity = (1 - dist / CONFIG.connectionDistance) * 0.35;
          const color = particles[i].color === particles[j].color
            ? particles[i].color
            : '#22d3ee';

          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = color;
          ctx.globalAlpha = opacity;
          ctx.lineWidth = 0.6;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.update(mouse.x, mouse.y);
      p.draw();
    });
    connectParticles();
    animFrame = requestAnimationFrame(loop);
  }

  function init() {
    resize();
    particles = Array.from({ length: CONFIG.CONFIG }, () => new Particle());
    // Fix: use CONFIG.particleCount
    particles = Array.from({ length: CONFIG.particleCount }, () => new Particle());
    loop();
  }

  window.addEventListener('resize', () => {
    resize();
    // Recreate particles on resize
    particles = Array.from({ length: CONFIG.particleCount }, () => new Particle());
  });

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  init();
})();

/* ═══════════════════════════════════════════════════════════════
   2. CUSTOM CURSOR
   ═══════════════════════════════════════════════════════════════ */
(function initCursor() {
  const dot  = $('#cursor-dot');
  const ring = $('#cursor-ring');
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;
  let isHovered = false;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    dot.style.left  = mouseX + 'px';
    dot.style.top   = mouseY + 'px';

    ringX = lerp(ringX, mouseX, 0.14);
    ringY = lerp(ringY, mouseY, 0.14);
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Hover effects on interactive elements
  const interactives = 'a, button, .skill-card, .nav-link, .cta-primary, .cta-secondary, .cert-card, .timeline-item, .lang-badge';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactives)) {
      ring.classList.add('hovered');
      dot.style.transform = 'translate(-50%,-50%) scale(1.5)';
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(interactives)) {
      ring.classList.remove('hovered');
      dot.style.transform = 'translate(-50%,-50%) scale(1)';
    }
  });
})();

/* ═══════════════════════════════════════════════════════════════
   3. NAVIGATION — Scroll behavior & mobile
   ═══════════════════════════════════════════════════════════════ */
(function initNav() {
  const header    = $('#nav-header');
  const hamburger = $('#hamburger');
  const mobileMenu = $('#mobile-menu');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;

    // Scrolled class
    if (y > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScroll = y;
  }, { passive: true });

  // Mobile hamburger
  hamburger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
    // Animate hamburger spans
    const spans = $$('span', hamburger);
    if (open) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    }
  });

  // Close menu on mobile link click
  $$('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      const spans = $$('span', hamburger);
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });

  // Smooth scroll for all nav links
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = $(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();

/* ═══════════════════════════════════════════════════════════════
   4. HERO TYPING EFFECT
   ═══════════════════════════════════════════════════════════════ */
(function initHeroTyping() {
  const subtitleEl = $('#hero-subtitle');
  const preCodeEl  = $('#pre-code-text');
  if (!subtitleEl) return;

  const titles = [
    'System & Network Administrator',
    'IT Infrastructure Specialist',
    'Government IT Operator',
    'Caspel LLC · Ministry of Economy',
    'CCNAv7 Certified · Azure Cloud',
    'IELTS C1 · MBA in Progress',
  ];

  const glitchChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*<>/\\|{}[]';

  let titleIndex = 0;
  let charIndex  = 0;
  let deleting   = false;
  let pausing    = false;

  function getRandomChar() {
    return glitchChars[Math.floor(Math.random() * glitchChars.length)];
  }

  function typeText() {
    const current = titles[titleIndex];

    if (pausing) return;

    if (!deleting) {
      // Show a glitch char before the real one
      if (charIndex < current.length) {
        const revealed   = current.slice(0, charIndex);
        const glitchChar = Math.random() > 0.3 ? getRandomChar() : current[charIndex];
        subtitleEl.textContent = revealed + glitchChar;

        setTimeout(() => {
          subtitleEl.textContent = current.slice(0, charIndex + 1);
          charIndex++;
          setTimeout(typeText, rand(40, 80));
        }, 40);
      } else {
        // Full word shown — pause then delete
        pausing = true;
        setTimeout(() => {
          pausing  = false;
          deleting = true;
          setTimeout(typeText, 60);
        }, 2200);
      }
    } else {
      // Delete
      if (charIndex > 0) {
        subtitleEl.textContent = current.slice(0, charIndex - 1);
        charIndex--;
        setTimeout(typeText, rand(25, 50));
      } else {
        deleting   = false;
        titleIndex = (titleIndex + 1) % titles.length;
        setTimeout(typeText, 400);
      }
    }
  }

  // Start after a delay to match CSS intro animations
  setTimeout(typeText, 2600);

  // Pre-code cycling
  const preCodes = [
    'SYS_INIT::PROFILE_LOAD',
    'NET_SCAN::TOPOLOGY_MAP',
    'AUTH::CLEARANCE_CHECK',
    'BOOT::KERNEL_v4.19.0',
    'VLAN::SEGMENT_ACTIVE',
  ];
  let preIdx = 0;
  setInterval(() => {
    preIdx = (preIdx + 1) % preCodes.length;
    let i = 0;
    const target = preCodes[preIdx];
    const interval = setInterval(() => {
      preCodeEl.textContent = target.slice(0, i) + glitchChars[randInt(0, glitchChars.length - 1)];
      i++;
      if (i > target.length) {
        preCodeEl.textContent = target;
        clearInterval(interval);
      }
    }, 35);
  }, 4000);
})();

/* ═══════════════════════════════════════════════════════════════
   5. HERO TITLE GLITCH (periodic)
   ═══════════════════════════════════════════════════════════════ */
(function initTitleGlitch() {
  const title = $('.hero-title');
  if (!title) return;

  function triggerGlitch() {
    title.classList.add('glitch');
    setTimeout(() => title.classList.remove('glitch'), 500);
  }

  // Glitch every ~12 seconds
  setInterval(triggerGlitch, 12000);
  setTimeout(triggerGlitch, 5000);
})();

/* ═══════════════════════════════════════════════════════════════
   6. GLOBAL GLITCH OVERLAY (every 30 seconds)
   ═══════════════════════════════════════════════════════════════ */
(function initGlitchOverlay() {
  const overlay = $('#glitch-overlay');
  if (!overlay) return;

  function triggerGlobalGlitch() {
    overlay.classList.add('active');
    setTimeout(() => overlay.classList.remove('active'), 600);
  }

  setInterval(triggerGlobalGlitch, 30000);
  setTimeout(triggerGlobalGlitch, 18000);
})();

/* ═══════════════════════════════════════════════════════════════
   7. INTERSECTION OBSERVER — Section & element reveals
   ═══════════════════════════════════════════════════════════════ */
(function initIntersectionObserver() {

  // ─ Section reveal
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        sectionObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  $$('.section-reveal').forEach(el => sectionObserver.observe(el));

  // ─ Timeline items reveal with stagger
  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        timelineObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  $$('.reveal-timeline').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.1}s`;
    timelineObserver.observe(el);
  });

  // ─ Cert card reveals
  const certObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        entry.target.style.transitionDuration = '0.5s';
        certObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  $$('.cc-reveal').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.06}s`;
    certObserver.observe(el);
  });

  // ─ Stat bars animate when in view
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        $$('.sb-fill', entry.target).forEach(fill => {
          const width = fill.getAttribute('data-width');
          fill.style.width = width + '%';
        });
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const statSection = $('.about-stat-bars');
  if (statSection) barObserver.observe(statSection);

  // ─ Skill card bars animate when grid enters view
  const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        $$('.sc-bar', entry.target).forEach((bar, i) => {
          const fill  = $('.sc-bar-fill', bar);
          const width = bar.getAttribute('data-width');
          if (fill && width) {
            setTimeout(() => {
              fill.style.width = width + '%';
            }, i * 120 + 200);
          }
        });
        skillsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  const skillsGrid = $('#skills-grid');
  if (skillsGrid) skillsObserver.observe(skillsGrid);

  // ─ Holo stats count up
  const holoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        $$('.holo-number', entry.target).forEach(el => {
          const target = parseInt(el.getAttribute('data-target'));
          countUp(el, 0, target, 1400);
        });
        holoObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const heroSection = $('#home');
  if (heroSection) {
    // Delay slightly so stats are visible
    setTimeout(() => {
      $$('.holo-number').forEach(el => {
        const target = parseInt(el.getAttribute('data-target'));
        countUp(el, 0, target, 2000);
      });
    }, 3000);
  }
})();

/* ═══════════════════════════════════════════════════════════════
   8. COUNT-UP ANIMATION
   ═══════════════════════════════════════════════════════════════ */
function countUp(el, from, to, duration) {
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed  = currentTime - startTime;
    const progress = clamp(elapsed / duration, 0, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(from + (to - from) * eased);
    el.textContent = value + (to > 10 ? '+' : '');

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = to + (to > 10 ? '+' : '');
    }
  }

  requestAnimationFrame(update);
}

/* ═══════════════════════════════════════════════════════════════
   9. 3D SKILL CARD MOUSE TRACKING
   ═══════════════════════════════════════════════════════════════ */
(function initSkillCards3D() {
  const cards = $$('.skill-card');
  if (!cards.length || isMobile()) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = e.clientX - cx;
      const dy     = e.clientY - cy;
      const maxRot = 18;
      const rotX   = clamp((-dy / (rect.height / 2)) * maxRot, -maxRot, maxRot);
      const rotY   = clamp(( dx / (rect.width  / 2)) * maxRot, -maxRot, maxRot);

      card.style.transform    = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.04,1.04,1.04)`;
      card.style.zIndex       = '10';
      card.style.transition   = 'transform 0.05s ease, box-shadow 0.3s ease';

      // Move glow based on mouse
      const glow = $('.sc-glow', card);
      if (glow) {
        const pctX = ((e.clientX - rect.left) / rect.width)  * 100;
        const pctY = ((e.clientY - rect.top)  / rect.height) * 100;
        glow.style.background = `radial-gradient(circle at ${pctX}% ${pctY}%, rgba(34,211,238,0.12), transparent 60%)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
      card.style.zIndex     = '';
      card.style.transition = 'transform 0.5s ease, box-shadow 0.3s ease';
    });

    // Sound on hover (subtle click via Web Audio API)
    card.addEventListener('mouseenter', () => {
      playHoverSound();
    });
  });
})();

/* ═══════════════════════════════════════════════════════════════
   10. WEB AUDIO — Hover sound
   ═══════════════════════════════════════════════════════════════ */
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {}
  }
  return audioCtx;
}

function playHoverSound() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const osc   = ctx.createOscillator();
    const gain  = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type            = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  } catch (e) {}
}

function playClickSound() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type            = 'square';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {}
}

/* ═══════════════════════════════════════════════════════════════
   11. CTA BUTTON — Ripple effect
   ═══════════════════════════════════════════════════════════════ */
(function initCtaRipple() {
  const cta = $('#cta-primary');
  if (!cta) return;

  cta.addEventListener('click', e => {
    const ripple = document.createElement('span');
    const rect   = cta.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height) * 2.5;
    const x      = e.clientX - rect.left - size / 2;
    const y      = e.clientY - rect.top  - size / 2;

    Object.assign(ripple.style, {
      position:    'absolute',
      width:       size + 'px',
      height:      size + 'px',
      left:        x + 'px',
      top:         y + 'px',
      background:  'rgba(255,255,255,0.2)',
      borderRadius:'50%',
      transform:   'scale(0)',
      animation:   'rippleExpand 0.7s ease-out forwards',
      zIndex:      '5',
      pointerEvents: 'none',
    });

    // Inject keyframes if not done
    if (!document.getElementById('ripple-style')) {
      const style = document.createElement('style');
      style.id = 'ripple-style';
      style.textContent = `
        @keyframes rippleExpand {
          to { transform: scale(1); opacity: 0; }
        }
        @keyframes screenRipple {
          0%   { opacity: 0; }
          10%  { opacity: 0.15; }
          100% { opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    $('.cta-ripple', cta).appendChild(ripple);
    setTimeout(() => ripple.remove(), 800);

    // Full-screen ripple
    triggerScreenRipple(e.clientX, e.clientY);
    playClickSound();
  });
})();

function triggerScreenRipple(x, y) {
  const el = document.createElement('div');
  Object.assign(el.style, {
    position: 'fixed',
    left:  x + 'px',
    top:   y + 'px',
    width: '4px',
    height:'4px',
    borderRadius:'50%',
    background: 'radial-gradient(circle, rgba(34,211,238,0.15), transparent 70%)',
    transform: 'translate(-50%,-50%) scale(1)',
    animation: 'screenRippleExpand 1s ease-out forwards',
    zIndex: '8000',
    pointerEvents:'none',
  });

  if (!document.getElementById('screen-ripple-style')) {
    const style = document.createElement('style');
    style.id = 'screen-ripple-style';
    style.textContent = `
      @keyframes screenRippleExpand {
        to { transform: translate(-50%,-50%) scale(500); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1100);
}

/* ═══════════════════════════════════════════════════════════════
   12. CONTACT FORM — Submission simulation
   ═══════════════════════════════════════════════════════════════ */
(function initContactForm() {
  const btn     = $('#submit-btn');
  const formWrap = $('#form-wrap');
  const success  = $('#transmission-success');
  if (!btn) return;

  btn.addEventListener('click', () => {
    // Validate simple check
    const inputs = $$('.ff-input', formWrap);
    let valid = true;
    inputs.forEach(input => {
      if (!input.value.trim()) {
        input.style.borderColor = 'rgba(251,146,60,0.6)';
        input.style.boxShadow   = '0 0 12px rgba(251,146,60,0.15)';
        valid = false;
        setTimeout(() => {
          input.style.borderColor = '';
          input.style.boxShadow   = '';
        }, 2000);
      }
    });

    if (!valid) return;

    playClickSound();
    // Particle burst from button
    createButtonParticles(btn);

    // Animate button out
    btn.style.animation = 'buttonDisintegrate 0.5s ease forwards';
    if (!document.getElementById('btn-disintegrate-style')) {
      const s = document.createElement('style');
      s.id = 'btn-disintegrate-style';
      s.textContent = `
        @keyframes buttonDisintegrate {
          0%   { transform: scale(1); opacity: 1; }
          50%  { transform: scale(1.1); opacity: 0.5; }
          100% { transform: scale(0); opacity: 0; }
        }
      `;
      document.head.appendChild(s);
    }

    setTimeout(() => {
      formWrap.style.display = 'none';
      success.classList.add('visible');

      // Reset after 6 seconds
      setTimeout(() => {
        success.classList.remove('visible');
        setTimeout(() => {
          formWrap.style.display = 'flex';
          btn.style.animation    = '';
          inputs.forEach(i => i.value = '');
        }, 400);
      }, 6000);
    }, 600);
  });
})();

function createButtonParticles(btn) {
  const rect = btn.getBoundingClientRect();
  const colors = ['#22d3ee', '#a78bfa', '#4ade80', '#fff'];
  const count  = 24;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    const angle = (i / count) * Math.PI * 2;
    const speed = rand(80, 180);
    const size  = rand(3, 7);
    const color = colors[i % colors.length];

    Object.assign(p.style, {
      position:    'fixed',
      left:        (rect.left + rect.width  / 2) + 'px',
      top:         (rect.top  + rect.height / 2) + 'px',
      width:       size + 'px',
      height:      size + 'px',
      borderRadius:'50%',
      background:  color,
      boxShadow:   `0 0 6px ${color}`,
      transform:   'translate(-50%,-50%)',
      pointerEvents: 'none',
      zIndex:      '9000',
      transition:  'none',
    });

    document.body.appendChild(p);

    const tx = Math.cos(angle) * speed;
    const ty = Math.sin(angle) * speed;

    requestAnimationFrame(() => {
      p.style.transition = `transform ${rand(0.4,0.8)}s cubic-bezier(0.2,0,0.8,1), opacity ${rand(0.4,0.8)}s ease`;
      p.style.transform  = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`;
      p.style.opacity    = '0';
    });

    setTimeout(() => p.remove(), 900);
  }
}

/* ═══════════════════════════════════════════════════════════════
   13. NETWORK SVG ANIMATION — scroll sync
   ═══════════════════════════════════════════════════════════════ */
(function initNetworkSvgScroll() {
  const svg = $('#network-svg');
  if (!svg) return;

  window.addEventListener('scroll', () => {
    const scrollPct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    const rotation  = scrollPct * 360;
    const orbiter   = svg.querySelector('circle[r="4"]');
    // Adjust animation speed based on scroll
    if (orbiter) {
      orbiter.querySelector('animateMotion').setAttribute('dur', `${4 - scrollPct * 2}s`);
    }
  }, { passive: true });
})();

/* ═══════════════════════════════════════════════════════════════
   14. REVEAL TEXT DATA-STREAM effect
   ═══════════════════════════════════════════════════════════════ */
(function initRevealText() {
  const blocks = $$('[data-reveal]');
  if (!blocks.length) return;

  const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);

      const el = entry.target;
      const originalHTML = el.innerHTML;
      const text = el.innerText;
      let frame = 0;
      const totalFrames = 20;

      const interval = setInterval(() => {
        frame++;
        if (frame >= totalFrames) {
          el.innerHTML = originalHTML;
          clearInterval(interval);
          return;
        }
        const progress = frame / totalFrames;
        const revealTo = Math.floor(progress * text.length);

        let scrambled = '';
        for (let i = 0; i < text.length; i++) {
          if (i < revealTo) {
            scrambled += text[i];
          } else if (text[i] === ' ' || text[i] === '\n') {
            scrambled += text[i];
          } else {
            scrambled += glyphs[Math.floor(Math.random() * glyphs.length)];
          }
        }

        // Don't destroy the spans — just do a simple opacity fade instead
        el.style.opacity = progress.toString();
      }, 60);

      el.style.opacity = '0';
    });
  }, { threshold: 0.2 });

  blocks.forEach(el => observer.observe(el));
})();

/* ═══════════════════════════════════════════════════════════════
   15. TIMELINE BEAM DRAW ANIMATION
   ═══════════════════════════════════════════════════════════════ */
(function initTimelineBeam() {
  const beam = $('.timeline-beam');
  if (!beam) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        beam.style.animation = 'beamDraw 1.5s ease forwards';
        if (!document.getElementById('beam-draw-style')) {
          const s = document.createElement('style');
          s.id = 'beam-draw-style';
          s.textContent = `
            @keyframes beamDraw {
              from { clip-path: inset(0 0 100% 0); }
              to   { clip-path: inset(0 0 0% 0); }
            }
          `;
          document.head.appendChild(s);
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });

  const expSection = $('#experience');
  if (expSection) observer.observe(expSection);
})();

/* ═══════════════════════════════════════════════════════════════
   16. DATE COUNT-UP IN TIMELINE ITEMS
   ═══════════════════════════════════════════════════════════════ */
(function initTimelineDateCounts() {
  const dates = $$('.tic-date');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);

      const valueEl = $('.date-value', entry.target);
      if (!valueEl) return;

      const finalText = valueEl.textContent;
      const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ·–';
      let iter = 0;
      const maxIter = 14;

      const interval = setInterval(() => {
        iter++;
        if (iter >= maxIter) {
          valueEl.textContent = finalText;
          clearInterval(interval);
          return;
        }
        const progress = iter / maxIter;
        let result = '';
        for (let i = 0; i < finalText.length; i++) {
          if (i < Math.floor(progress * finalText.length)) {
            result += finalText[i];
          } else if (finalText[i] === ' ') {
            result += ' ';
          } else {
            result += glyphs[Math.floor(Math.random() * glyphs.length)];
          }
        }
        valueEl.textContent = result;
      }, 50);
    });
  }, { threshold: 0.4 });

  dates.forEach(el => observer.observe(el));
})();

/* ═══════════════════════════════════════════════════════════════
   17. MOBILE DETECTION & OPTIMIZE
   ═══════════════════════════════════════════════════════════════ */
(function initMobileOptimize() {
  if (isMobile()) {
    document.body.classList.add('mobile-mode');
  }
})();

/* ═══════════════════════════════════════════════════════════════
   18. PARALLAX — Hero background grid on scroll
   ═══════════════════════════════════════════════════════════════ */
(function initParallax() {
  const grid = $('.hero-bg-grid');
  const holoStats = $('.hero-holo-stats');
  if (!grid) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        grid.style.transform = `translateY(${y * 0.4}px)`;
        if (holoStats) {
          holoStats.style.transform = `translateY(calc(-50% + ${y * 0.2}px))`;
          holoStats.style.opacity   = Math.max(0, 1 - y / 400).toString();
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ═══════════════════════════════════════════════════════════════
   19. CIRCUIT BORDER TRACING on nav
   ═══════════════════════════════════════════════════════════════ */
(function initNavCircuit() {
  const lines = $$('.circuit-line');
  // Already done in CSS, just ensure they pulse with JS sync
  // Nothing needed beyond CSS for this effect
})();

/* ═══════════════════════════════════════════════════════════════
   20. ABOUT FRAME BORDER TRACING
   ═══════════════════════════════════════════════════════════════ */
(function initAboutFrameTrace() {
  const frame = $('.about-text-frame');
  if (!frame || isMobile()) return;

  frame.addEventListener('mousemove', e => {
    const rect = frame.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width)  * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;

    frame.style.boxShadow = `
      inset 0 0 30px rgba(34,211,238,0.03),
      0 0 ${20 + x * 0.3}px rgba(34,211,238,${0.05 + y * 0.001})
    `;
  });

  frame.addEventListener('mouseleave', () => {
    frame.style.boxShadow = '';
  });
})();

/* ═══════════════════════════════════════════════════════════════
   21. HOLOGRAPHIC STAT INTERACTION
   ═══════════════════════════════════════════════════════════════ */
(function initHoloStats() {
  const stats = $$('.holo-stat');
  stats.forEach(stat => {
    stat.addEventListener('mouseenter', () => {
      playHoverSound();
    });
    stat.addEventListener('click', () => {
      stat.style.animation = 'none';
      stat.style.transform = 'scale(1.1)';
      stat.style.boxShadow = '0 0 30px rgba(34,211,238,0.4)';
      setTimeout(() => {
        stat.style.transform = '';
        stat.style.boxShadow = '';
        stat.style.animation = '';
      }, 400);
      playClickSound();
    });
  });
})();

/* ═══════════════════════════════════════════════════════════════
   22. TERMINAL / FORM FIELD INTERACTION
   ═══════════════════════════════════════════════════════════════ */
(function initFormFields() {
  const inputs = $$('.ff-input');
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      playHoverSound();
      const label = input.closest('.form-field')?.querySelector('.ff-label');
      if (label) {
        label.style.color = 'var(--accent-cyan)';
        label.style.textShadow = '0 0 8px rgba(34,211,238,0.4)';
      }
    });
    input.addEventListener('blur', () => {
      const label = input.closest('.form-field')?.querySelector('.ff-label');
      if (label) {
        label.style.color = '';
        label.style.textShadow = '';
      }
    });
  });
})();

/* ═══════════════════════════════════════════════════════════════
   23. CERT CARDS — Hover glow cycle
   ═══════════════════════════════════════════════════════════════ */
(function initCertCards() {
  const cards = $$('.cert-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      playHoverSound();
    });
  });
})();

/* ═══════════════════════════════════════════════════════════════
   24. KEYBOARD NAVIGATION — highlight active section in nav
   ═══════════════════════════════════════════════════════════════ */
(function initActiveSection() {
  const sections = $$('section[id]');
  const navLinks  = $$('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.remove('nav-link-active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('nav-link-active');
          }
        });
      }
    });
  }, { threshold: 0.4, rootMargin: `-${72}px 0px 0px 0px` });

  sections.forEach(s => observer.observe(s));

  // Add active style
  if (!document.getElementById('nav-active-style')) {
    const s = document.createElement('style');
    s.id = 'nav-active-style';
    s.textContent = `
      .nav-link-active {
        color: var(--accent-cyan) !important;
      }
      .nav-link-active::before {
        width: 80% !important;
      }
    `;
    document.head.appendChild(s);
  }
})();

/* ═══════════════════════════════════════════════════════════════
   25. CONTACT INFO HOVER SCAN LINES
   ═══════════════════════════════════════════════════════════════ */
(function initContactScan() {
  const items = $$('.contact-item');
  items.forEach(item => {
    item.addEventListener('mouseenter', () => {
      playHoverSound();
      item.style.background = 'rgba(34,211,238,0.03)';
    });
    item.addEventListener('mouseleave', () => {
      item.style.background = '';
    });
  });
})();

/* ═══════════════════════════════════════════════════════════════
   26. GLOBAL ERROR SAFETY — catch any uncaught promise errors
   ═══════════════════════════════════════════════════════════════ */
window.addEventListener('unhandledrejection', e => {
  console.warn('[Portfolio] Unhandled promise rejection:', e.reason);
  e.preventDefault();
});

/* ═══════════════════════════════════════════════════════════════
   27. PAGE LOAD INTRO SEQUENCE
   ═══════════════════════════════════════════════════════════════ */
(function initLoadSequence() {
  // Add a brief loading state overlay
  const loader = document.createElement('div');
  Object.assign(loader.style, {
    position:   'fixed',
    inset:      '0',
    background: 'var(--bg-primary, #020617)',
    zIndex:     '99999',
    display:    'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap:        '1.5rem',
    transition: 'opacity 0.6s ease',
    fontFamily: "'Orbitron', sans-serif",
  });

  loader.innerHTML = `
    <div style="
      font-size: 0.65rem;
      letter-spacing: 0.3em;
      color: #22d3ee;
      font-family: 'Share Tech Mono', monospace;
      animation: loaderFlicker 1s ease-in-out infinite;
    " id="loader-text">INITIALIZING SYSTEMS...</div>
    <div style="
      width: 200px;
      height: 2px;
      background: rgba(34,211,238,0.15);
      border-radius: 1px;
      overflow: hidden;
    ">
      <div id="loader-bar" style="
        height: 100%;
        width: 0;
        background: linear-gradient(90deg, #22d3ee, #a78bfa);
        border-radius: 1px;
        box-shadow: 0 0 8px #22d3ee;
        transition: width 0.05s linear;
      "></div>
    </div>
    <div id="loader-code" style="
      font-family: 'Share Tech Mono', monospace;
      font-size: 0.55rem;
      color: rgba(34,211,238,0.3);
      letter-spacing: 0.1em;
    ">EJ_PORTFOLIO_v1.0.0</div>
  `;

  if (!document.getElementById('loader-flicker-style')) {
    const s = document.createElement('style');
    s.id = 'loader-flicker-style';
    s.textContent = `
      @keyframes loaderFlicker {
        0%, 90%, 100% { opacity: 1; }
        92% { opacity: 0.3; }
        96% { opacity: 0.7; }
      }
    `;
    document.head.appendChild(s);
  }

  document.body.appendChild(loader);

  // Progress bar animation
  const bar  = loader.querySelector('#loader-bar');
  const text = loader.querySelector('#loader-text');
  const code = loader.querySelector('#loader-code');

  const loadMessages = [
    'LOADING KERNEL...',
    'MAPPING NETWORK...',
    'DECRYPTING PROFILE...',
    'ESTABLISHING UPLINK...',
    'SYSTEM ONLINE.',
  ];

  let progress = 0;
  let msgIdx = 0;

  const loadInterval = setInterval(() => {
    progress += rand(4, 12);
    if (progress > 100) progress = 100;
    bar.style.width = progress + '%';

    const newMsgIdx = Math.floor((progress / 100) * loadMessages.length);
    if (newMsgIdx !== msgIdx && newMsgIdx < loadMessages.length) {
      msgIdx = newMsgIdx;
      text.textContent = loadMessages[msgIdx];
    }

    code.textContent = 'EJ_PORTFOLIO_v1.0.0 :: ' + Math.floor(progress) + '%';

    if (progress >= 100) {
      clearInterval(loadInterval);
      text.textContent = 'SYSTEM ONLINE.';
      text.style.color = '#4ade80';
      text.style.textShadow = '0 0 12px rgba(74,222,128,0.6)';

      setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 700);
      }, 500);
    }
  }, 40);
})();

/* ═══════════════════════════════════════════════════════════════
   END OF SCRIPT
   ═══════════════════════════════════════════════════════════════ */
