const container = document.getElementById("candles");
const candles = [];

const cols = 5;
const rows = 5;
const total = cols * rows;

const vw = window.innerWidth;
let scaleFactor = 1;
if (vw <= 360) scaleFactor = 0.28;
else if (vw <= 480) scaleFactor = 0.32;
else if (vw <= 768) scaleFactor = 0.45;
else if (vw <= 1024) scaleFactor = 0.75;

for (let i = 0; i < total; i++) {
  const img = document.createElement("img");
  img.src = "src/candle.png";
  img.classList.add("candle");

  const col = i % cols;
  const row = Math.floor(i / cols);

  let x = (col / cols) * 100;
  let y = (row / rows) * 80;

  x += (Math.random() * 8 - 4);
  y += (Math.random() * 6 - 3);

  x = Math.max(5, Math.min(x, 95));
  y = Math.max(5, Math.min(y, 85));

  img.style.left = x + "%";
  img.style.top = y + "%";

  let size = Math.random() < 0.75
    ? 40 + Math.random() * 40
    : 90 + Math.random() * 60;

  const scaledSize = size * scaleFactor;
  img.style.width = scaledSize + "px";

  if (scaledSize < 20) {
    img.style.filter = "blur(1px)";
  }

  container.appendChild(img);
  candles.push({
    el: img,
    dir: Math.random() > 0.5 ? 1 : -1,
    speed: 0.2 + Math.random() * 0.2,
    baseOpacity: scaledSize < 20 ? 0.6 : scaledSize < 35 ? 0.75 : 1
  });
}

/* ── SMOOTH SCROLL TRACKING ── */
let currentScroll = 0;
let targetScroll = 0;

window.addEventListener("scroll", () => {
  targetScroll = window.scrollY;
});

const stopScroll = vw <= 480 ? 1000 : vw <= 768 ? 1400 : 2800;

/* ── CANDLE ANIMATION LOOP ── */
function animate() {
  currentScroll += (targetScroll - currentScroll) * 0.08;
  let effectiveScroll = Math.min(currentScroll, stopScroll);

  candles.forEach((c, i) => {
    if (!c.revealed) return;
    let moveY = effectiveScroll * c.speed;
    let rotate = 3 + effectiveScroll * 0.02;
    rotate = Math.min(rotate, 12);
    let drift = Math.sin(effectiveScroll * 0.002 + i) * 6;
    c.el.style.transform = `translate(${drift}px, ${moveY}px) rotate(${rotate * c.dir}deg)`;
  });

  requestAnimationFrame(animate);
}

animate();

/* ── ROUTE SECTION PARALLAX (S2) — SEE THE ROUTE ── */
(function () {
  const routeSection = document.querySelector('.route-section');
  const carCard      = document.querySelector('.car-card');
  if (!routeSection || !carCard) return;

  let currentY = 0;
  let targetY  = 0;

  function update() {
    const scrollY      = window.scrollY;
    const viewH        = window.innerHeight;
    const routeStart   = routeSection.getBoundingClientRect().top + scrollY;
    /* Wait until user has scrolled well past the element before it starts moving */
    const triggerPoint = routeStart + routeSection.offsetHeight - viewH;
    const raw          = scrollY - triggerPoint;

    if (raw <= 0) {
      targetY = 0;
    } else {
      const carBottom = carCard.getBoundingClientRect().bottom + scrollY;
      const panelTop  = routeSection.getBoundingClientRect().top + scrollY;
      const maxTravel = Math.max(0, carBottom - panelTop + 40);
      targetY = Math.min(raw * 0.55, maxTravel);
    }

    currentY += (targetY - currentY) * 0.06;
    const v = Math.round(currentY * 10) / 10;
    routeSection.style.transform = `translateY(${v}px)`;
    routeSection.style.zIndex    = v > 2 ? 10 : 2;

    requestAnimationFrame(update);
  }

  update();
})();

/* ── MIRROR SLIDER ── */
(function () {
  const track = document.getElementById('sliderTrack');
  const dotsContainer = document.getElementById('sliderDots');
  if (!track || !dotsContainer) return;

  const slides = track.querySelectorAll('.slide');
  const total = slides.length;
  let current = 0;
  let autoTimer = null;

  slides.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.classList.add('slider-dot');
    if (i === 0) btn.classList.add('active');
    btn.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(btn);
  });

  function goTo(idx) {
    current = (idx + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsContainer.querySelectorAll('.slider-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function next() { goTo(current + 1); }

  autoTimer = setInterval(next, 3500);

  track.addEventListener('mouseenter', () => clearInterval(autoTimer));
  track.addEventListener('mouseleave', () => { autoTimer = setInterval(next, 3500); });

  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? goTo(current + 1) : goTo(current - 1);
  });
})();

/* ── S3 RSVP ROUTE PARALLAX — PLEASE RSVP ── */
(function () {
  const routeSection = document.querySelector('.s3-route');
  const carCard      = document.querySelector('.car-card-s3');
  if (!routeSection || !carCard) return;

  let currentY = 0;
  let targetY  = 0;

  function update() {
    const scrollY    = window.scrollY;
    const viewH      = window.innerHeight;
    const routeStart = routeSection.getBoundingClientRect().top + scrollY;
    /* Original trigger — fires when element scrolls into view */
    const triggerPoint = routeStart + routeSection.offsetHeight - viewH;
    const raw          = scrollY - triggerPoint;

    if (raw <= 0) {
      targetY = 0;
    } else {
      const carBottom = carCard.getBoundingClientRect().bottom + scrollY;
      const panelTop  = routeSection.getBoundingClientRect().top + scrollY;
      const maxTravel = Math.max(0, carBottom - panelTop + 40);
      /* Slow speed so it drifts down gradually */
      targetY = Math.min(raw * 0.35, maxTravel);
    }

    /* Lazy lerp — slow catch-up */
    currentY += (targetY - currentY) * 0.04;
    const v = Math.round(currentY * 10) / 10;
    routeSection.style.transform = `translateY(${v}px)`;
    routeSection.style.zIndex    = v > 2 ? 10 : 2;

    /* Clip bottom so car covers the section cleanly — no bleed-through */
    const carTop     = carCard.getBoundingClientRect().top;
    const rTop       = routeSection.getBoundingClientRect().top;
    const rHeight    = routeSection.offsetHeight;
    const carOverlap = (rTop + rHeight) - carTop;
    routeSection.style.clipPath = carOverlap > 0
      ? `inset(0 0 ${Math.max(0, carOverlap)}px 0)`
      : 'none';

    requestAnimationFrame(update);
  }

  update();
})();

/* ── SECTION 4 INTERACTIONS ── */
function selectOption(el) {
  document.querySelectorAll('.s4-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
}

function selectTeam(team, el) {
  document.querySelectorAll('.team-btn').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
}

function launchRoses() {
  const container = document.getElementById('roseContainer');
  container.innerHTML = '';
  const count = 40;

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const rose = document.createElement('img');
      rose.src = 'src/roses.png';
      rose.classList.add('falling-rose');

      const left  = Math.random() * 100;
      const dur   = 2.5 + Math.random() * 2.5;
      const size  = 80 + Math.random() * 80;
      const delay = Math.random() * 0.4;

      rose.style.left               = left + '%';
      rose.style.width              = size + 'px';
      rose.style.animationDuration  = dur + 's';
      rose.style.animationDelay     = delay + 's';

      container.appendChild(rose);
      rose.addEventListener('animationend', () => rose.remove());
    }, i * 60);
  }
}

/* ── S4 FOLLOW THE ACTION PARALLAX — FOLLOW THE ACTION ── */
(function () {
  const routeSection = document.querySelector('.s4-follow');
  const carCard      = document.querySelector('.car-card-s4');
  if (!routeSection || !carCard) return;

  let currentY = 0;
  let targetY  = 0;

  function update() {
    const scrollY      = window.scrollY;
    const viewH        = window.innerHeight;
    const routeStart   = routeSection.getBoundingClientRect().top + scrollY;
    /* Wait until user has scrolled well past the element before it starts moving */
    const triggerPoint = routeStart + routeSection.offsetHeight - viewH;
    const raw          = scrollY - triggerPoint;

    if (raw <= 0) {
      targetY = 0;
    } else {
      const carBottom = carCard.getBoundingClientRect().bottom + scrollY;
      const panelTop  = routeSection.getBoundingClientRect().top + scrollY;
      const maxTravel = Math.max(0, carBottom - panelTop + 40);
      targetY = Math.min(raw * 0.55, maxTravel);
    }

    currentY += (targetY - currentY) * 0.06;
    const v = Math.round(currentY * 10) / 10;
    routeSection.style.transform = `translateY(${v}px)`;
    routeSection.style.zIndex    = v > 2 ? 10 : 2;

    const carTop  = carCard.getBoundingClientRect().top;
    const rTop    = routeSection.getBoundingClientRect().top;
    const overlap = carTop - rTop;
    routeSection.style.clipPath = overlap < 60
      ? `inset(0 0 ${Math.max(0, 60 - overlap)}px 0)`
      : 'none';

    requestAnimationFrame(update);
  }

  update();
})();

/* ── CANDLE FADE-IN ── */
function initCandles() {
  candles.forEach((c, i) => {
    c.revealed = false;
    setTimeout(() => {
      c.revealed = true;
      c.el.style.transition = 'opacity 0.6s ease';
      c.el.style.opacity = String(c.baseOpacity);
    }, i * 60);
  });
}

/* ── TEXT BLUR SCROLL REVEAL ── */
function initTextReveal() {
  const textSelectors = [
    '.arabic', '.translation', '.blessing', '.names', '.desc',
    '.invite', '.couple', '.and', '.divider',
    '.event-content h3', '.event-content p', '.event-content a',
    '.route-title', '.route-sub',
    '.s3-meet', '.s3-title', '.s3-para',
    '.s4-label', '.s4-heading', '.s4-option',
    '.s4-team-label', '.team-btn', '.celebrate-btn',
    '.s4-insta-card p', '.s4-follow-title', '.s4-follow-sub',
    '.s5-until', '.s5-cd-num', '.s5-cd-label', '.s5-cd-sep',
    '.s5-para', '.s5-copy'
  ];

  const allEls = [];
  textSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.classList.add('text-reveal');
      allEls.push(el);
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const siblings = [...el.parentElement.querySelectorAll('.text-reveal')];
        const idx = siblings.indexOf(el);
        el.style.transitionDelay = (idx * 0.12) + 's';
        el.classList.add('visible');
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.15 });

  allEls.forEach(el => observer.observe(el));

  const titleEls = document.querySelectorAll('.wedding-title h1, .wedding-title .weds');
  titleEls.forEach((el, i) => {
    el.classList.add('text-reveal');
    setTimeout(() => {
      el.style.transitionDelay = '0s';
      el.classList.add('visible');
    }, 400 + i * 200);
  });
}

/* ── BACKGROUND MUSIC ── */
(function () {
  const music = document.getElementById('bgMusic');
  const btn   = document.getElementById('musicBtn');
  const icon  = document.getElementById('musicIcon');
  if (!music || !btn) return;

  let playing = false;
  music.volume = 0;

  function setPlaying(state) {
    playing = state;
    if (playing) {
      icon.textContent = '♪';
      btn.classList.remove('paused');
      btn.classList.add('playing');
    } else {
      icon.textContent = '▐▐';
      btn.classList.remove('playing');
      btn.classList.add('paused');
    }
  }

  function spinBtn() {
    btn.classList.add('switching');
    btn.addEventListener('animationend', () => btn.classList.remove('switching'), { once: true });
  }

  window.toggleMusic = function () {
    spinBtn();
    if (playing) {
      music.pause();
      setPlaying(false);
    } else {
      music.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  function fadeVolume() {
    music.volume = 0;
    let vol = 0;
    const fadeIn = setInterval(() => {
      vol = Math.min(vol + 0.05, 0.75);
      music.volume = vol;
      if (vol >= 0.75) clearInterval(fadeIn);
    }, 100);
  }

  /* Called by stamp click — inside a real user gesture so autoplay is allowed */
  window._startMusic = function () {
    music.play().then(() => {
      fadeVolume();
      setPlaying(true);
    }).catch(() => setPlaying(false));
  };

  setPlaying(false);
})();

/* ── LOADER — stamp click opens envelope ── */
(function () {
  const loader = document.getElementById('loader');
  if (!loader) return;

  /* Inject critical overrides via a <style> tag so they beat any existing CSS */
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    /* Envelope halves must NOT block pointer events */
    #loader .loader-top,
    #loader .loader-bottom,
    #loader .loader-bg,
    #loader .loader-bg-bottom {
      pointer-events: none !important;
    }

    /* Stamp must float above everything and be clickable */
    #loader .loader-stamp {
      z-index: 100002 !important;
      cursor: pointer !important;
      pointer-events: all !important;
    }

    #loader .stamp-img {
      cursor: pointer !important;
      pointer-events: all !important;
      transition: transform 0.15s ease, filter 0.2s ease;
    }

    #loader .loader-stamp:hover .stamp-img {
      filter: drop-shadow(0 0 28px rgba(212,185,106,0.9)) drop-shadow(0 4px 24px rgba(0,0,0,0.4)) !important;
      transform: scale(1.1);
    }

    #loader .loader-stamp:active .stamp-img {
      transform: scale(0.9);
    }

    @keyframes hintFloat {
      0%, 100% { opacity: 0.55; transform: translateY(0px);  }
      50%       { opacity: 1;   transform: translateY(5px); }
    }

    .loader-hint {
      display: block;
      margin: 14px 0 0;
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(28px, 2vw, 16px);
      letter-spacing: 4px;
      color: rgba(212,185,106,0.9);
      text-align: center;
      animation: hintFloat 1.8s ease-in-out infinite;
      pointer-events: none;
      user-select: none;
      text-transform: uppercase;
    }
  `;
  document.head.appendChild(styleEl);

  /* Lock scroll */
  document.body.style.overflow = 'hidden';

  /* Add hint text below stamp */
  const stampEl = loader.querySelector('.loader-stamp');
  if (stampEl) {
    const hint = document.createElement('span');
    hint.className = 'loader-hint';
    hint.textContent = 'Click to open';
    stampEl.appendChild(hint);
  }

  let opened = false;

  function openEnvelope() {
    if (opened) return;
    opened = true;

    loader.classList.add('open');
    document.dispatchEvent(new Event('loaderOpened'));
    initCandles();
    initTextReveal();

    /* Start music — this runs inside a real click/touch so autoplay is permitted */
    if (window._startMusic) window._startMusic();

    setTimeout(() => {
      loader.classList.add('gone');
      document.body.style.overflow = '';
    }, 1100);
  }

  /* Attach to stamp wrapper AND stamp image — belt & braces */
  const targets = [
    loader.querySelector('.loader-stamp'),
    loader.querySelector('.stamp-img')
  ].filter(Boolean);

  targets.forEach(el => {
    el.addEventListener('click', openEnvelope);
    el.addEventListener('touchend', (e) => {
      e.preventDefault();
      openEnvelope();
    }, { passive: false });
  });
})();

/* ── COUNTDOWN TIMER ── */
(function () {
const weddingDate = new Date('2026-05-03T10:30:00+05:30');

  function update() {
    const now  = new Date();
    const diff = weddingDate - now;

    const pad = n => String(Math.max(0, n)).padStart(2, '0');

    if (diff <= 0) {
      ['cdDays','cdHours','cdMins','cdSecs'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '00';
      });
      return;
    }

    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000)  / 60000);
    const secs  = Math.floor((diff % 60000)    / 1000);

    document.getElementById('cdDays').textContent  = pad(days);
    document.getElementById('cdHours').textContent = pad(hours);
    document.getElementById('cdMins').textContent  = pad(mins);
    document.getElementById('cdSecs').textContent  = pad(secs);
  }

  update();
  setInterval(update, 1000);
})();

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

window.addEventListener('load', () => {
  window.scrollTo(0, 0);
});
/* ── HIDE SCROLL INDICATOR ON SCROLL ── */
(function () {
  const indicator = document.querySelector('.scroll-indicator');
  if (!indicator) return;
  window.addEventListener('scroll', function hideOnScroll() {
    if (window.scrollY > 80) {
      indicator.classList.add('hidden');
      window.removeEventListener('scroll', hideOnScroll);
    }
  });
})();

function selectTeam(team, el) {
  const isMobile = window.innerWidth <= 768;
  const allBtns = document.querySelectorAll('.team-btn');
  const teamDiv = document.querySelector('.s4-team');

  // Clear all previous state
  allBtns.forEach(b => {
    b.classList.remove('selected', 'mobile-hidden');
    // Remove any existing emoji spans
    const old = b.querySelector('.team-emoji');
    if (old) old.remove();
  });
  teamDiv.classList.remove('groom-selected', 'bride-selected');

  // Apply selected
  el.classList.add('selected');

  if (isMobile) {
    // Create emoji span and inject into the selected button
    const emoji = document.createElement('span');
    emoji.className = 'team-emoji';
    emoji.textContent = team === 'groom' ? '🤵' : '👰';
    el.appendChild(emoji);

    // Small delay so the span is in DOM before animating
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        emoji.classList.add('team-emoji-visible');
      });
    });

    // Hide the button visuals
    el.classList.add('mobile-hidden');
    teamDiv.classList.add(team === 'groom' ? 'groom-selected' : 'bride-selected');
  }
}