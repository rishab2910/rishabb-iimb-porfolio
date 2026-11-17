/**
 * BEHIND THE CURTAIN — RISHAB BULCHANDANI PORTFOLIO
 * Theatrical Front-End Engine
 * Features:
 *  1. Authentic Stage Curtain Reveal (Auto-cue + Interactive Parting & Replay)
 *  2. Synthesized Web Audio Impulses (Curtain Swoosh, Switch Snap, Clapboard Clack, Mic Chime)
 *  3. Physical Backstage Light Switch (Dark / Light Theme + Persistence)
 *  4. Live Backstage Running Order HUD (Scroll Progress & Cue Tracker)
 *  5. Dynamic Ambient Spotlight Cursor Follower
 *  6. Scroll-Triggered Theatrical Stage Entrances
 *  7. Interactive Director's Clapboard & Vintage Microphone
 *  8. Accessible Mobile Navigation Drawer
 */

(function () {
  'use strict';

  // DOM Elements
  const htmlElement = document.documentElement;
  const bodyElement = document.body;
  const curtainOverlay = document.getElementById('stage-curtain-overlay');
  const partCurtainsBtn = document.getElementById('part-curtains-btn');
  const replayCurtainsBtn = document.getElementById('replay-curtains-btn');
  const drawerCurtainBtn = document.getElementById('drawer-curtain-btn');

  // Light Switch Elements
  const stageLightSwitch = document.getElementById('stage-light-switch');
  const switchStatusText = document.getElementById('switch-status-text');
  const switchLed = document.getElementById('switch-led');
  const footerThemeStatus = document.getElementById('footer-theme-status');

  // Running Order HUD
  const hudCueText = document.getElementById('hud-cue-text');
  const hudScrollBar = document.getElementById('hud-scroll-bar');
  const scrollScenes = document.querySelectorAll('.scroll-scene');
  const revealItems = document.querySelectorAll('.reveal-item');

  // Interactive Props
  const directorClapboard = document.getElementById('director-clapboard');
  const interactiveMic = document.getElementById('interactive-mic');

  // Mobile Navigation
  const mobileNavToggle = document.getElementById('mobile-nav-toggle');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
  const mobileNavClose = document.getElementById('mobile-nav-close');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  // Storage Keys
  const THEME_STORAGE_KEY = 'rishab_portfolio_theme';
  const CURTAIN_STORAGE_KEY = 'rishab_curtain_opened';

  // Audio Context Single Instance
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  /* --------------------------------------------------------------------------
     1. THEATRICAL AUDIO SYNTHESIS (Zero External Files)
     -------------------------------------------------------------------------- */
  function playSound(type) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      if (type === 'curtain') {
        // Dramatic resonant low sweep for parting heavy velvet
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.8);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.85);
      } else if (type === 'switch') {
        // Heavy industrial snap switch
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(360, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.04);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.04);
      } else if (type === 'clap') {
        // Wooden slate clap sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.05);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.06);
      } else if (type === 'mic') {
        // Warm 440Hz stage chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.35);
      }
    } catch (e) {
      // Audio context may be blocked by browser policy; silently fail
    }
  }

  /* --------------------------------------------------------------------------
     2. THEATRICAL CURTAIN REVEAL CONTROLLER
     -------------------------------------------------------------------------- */
  let curtainsOpen = false;

  function openCurtains(playAudio = true) {
    if (curtainsOpen) return;
    curtainsOpen = true;

    if (playAudio) {
      playSound('curtain');
    }

    if (curtainOverlay) {
      curtainOverlay.classList.add('curtains-parted');
    }
    bodyElement.classList.remove('curtains-closed');

    // Trigger initial hero reveal
    setTimeout(function () {
      revealVisibleItems();
    }, 400);
  }

  function closeCurtains() {
    curtainsOpen = false;
    playSound('curtain');

    if (curtainOverlay) {
      curtainOverlay.classList.remove('curtains-parted');
    }
    bodyElement.classList.add('curtains-closed');
  }

  // Auto-reveal: if user previously saw curtains in this session, keep open;
  // otherwise invite them with the interactive card or auto-cue after 1.5s
  if (partCurtainsBtn) {
    partCurtainsBtn.addEventListener('click', function () {
      openCurtains(true);
    });
  }

  if (replayCurtainsBtn) {
    replayCurtainsBtn.addEventListener('click', function () {
      closeCurtains();
    });
  }

  if (drawerCurtainBtn) {
    drawerCurtainBtn.addEventListener('click', function () {
      closeMobileNav();
      closeCurtains();
    });
  }

  // Keyboard shortcut to open curtains
  document.addEventListener('keydown', function (e) {
    if (!curtainsOpen && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      openCurtains(true);
    }
  });

  // Automatically prompt parting after 1.8 seconds if still closed
  setTimeout(function () {
    if (!curtainsOpen && curtainOverlay && !curtainOverlay.classList.contains('curtains-parted')) {
      openCurtains(true);
    }
  }, 1800);

  /* --------------------------------------------------------------------------
     3. PHYSICAL STAGE LIGHT SWITCH (THEME TOGGLE)
     -------------------------------------------------------------------------- */
  function applyTheme(theme) {
    const isLight = theme === 'light';
    htmlElement.setAttribute('data-theme', theme);

    if (stageLightSwitch) {
      stageLightSwitch.setAttribute('aria-checked', isLight ? 'true' : 'false');
      stageLightSwitch.setAttribute(
        'aria-label',
        isLight ? 'Turn stage lights off (Switch to dark theme)' : 'Turn stage lights on (Switch to light theme)'
      );
    }

    if (switchStatusText) {
      switchStatusText.textContent = isLight ? 'LIGHTS: ON' : 'LIGHTS: OFF';
    }

    if (footerThemeStatus) {
      footerThemeStatus.textContent = isLight ? 'LIGHTS ON (LIGHT THEME)' : 'LIGHTS OFF (DARK THEME)';
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (err) {}
  }

  function toggleTheme() {
    const currentTheme = htmlElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    playSound('switch');
    applyTheme(nextTheme);
  }

  function initTheme() {
    let savedTheme = 'dark'; // Default: Dramatic Stage Lights OFF
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        savedTheme = stored;
      }
    } catch (err) {}
    applyTheme(savedTheme);
  }

  if (stageLightSwitch) {
    stageLightSwitch.addEventListener('click', toggleTheme);
    stageLightSwitch.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggleTheme();
      }
    });
  }

  /* --------------------------------------------------------------------------
     4. DYNAMIC SPOTLIGHT TRACKING (Cursor & Ambient Shift)
     -------------------------------------------------------------------------- */
  window.addEventListener('mousemove', function (e) {
    const xPercent = (e.clientX / window.innerWidth) * 100;
    const yPercent = (e.clientY / window.innerHeight) * 100;
    document.documentElement.style.setProperty('--mouse-x', xPercent.toFixed(1) + '%');
    document.documentElement.style.setProperty('--mouse-y', yPercent.toFixed(1) + '%');
  }, { passive: true });

  /* --------------------------------------------------------------------------
     5. SCROLL ENGINE: RUNNING ORDER HUD & SCROLL REVEALS
     -------------------------------------------------------------------------- */
  function updateScrollProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

    if (hudScrollBar) {
      hudScrollBar.style.width = Math.min(100, Math.max(0, progress)) + '%';
    }
  }

  // Scroll spy for current active cue
  function updateActiveScene() {
    const viewportMiddle = window.innerHeight * 0.4;
    let activeCue = 'ACT I • THE OVERTURE';

    scrollScenes.forEach(function (scene) {
      const rect = scene.getBoundingClientRect();
      if (rect.top <= viewportMiddle && rect.bottom >= viewportMiddle) {
        const cue = scene.getAttribute('data-cue');
        if (cue) activeCue = cue;
      }
    });

    if (hudCueText && hudCueText.textContent !== activeCue) {
      hudCueText.textContent = activeCue;
    }
  }

  // Reveal elements as they scroll into view
  function revealVisibleItems() {
    const triggerBottom = window.innerHeight * 0.88;
    revealItems.forEach(function (item) {
      const itemTop = item.getBoundingClientRect().top;
      if (itemTop < triggerBottom) {
        item.classList.add('revealed');
      }
    });
  }

  window.addEventListener('scroll', function () {
    updateScrollProgress();
    updateActiveScene();
    revealVisibleItems();
  }, { passive: true });

  /* --------------------------------------------------------------------------
     6. INTERACTIVE PROPS: CLAPBOARD & VINTAGE MIC
     -------------------------------------------------------------------------- */
  if (directorClapboard) {
    function snapClapper() {
      playSound('clap');
      directorClapboard.classList.add('clapped');
      setTimeout(function () {
        directorClapboard.classList.remove('clapped');
      }, 350);
    }

    directorClapboard.addEventListener('click', snapClapper);
    directorClapboard.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        snapClapper();
      }
    });
  }

  if (interactiveMic) {
    function pingMic() {
      playSound('mic');
      interactiveMic.classList.add('mic-active');
      setTimeout(function () {
        interactiveMic.classList.remove('mic-active');
      }, 800);
    }

    interactiveMic.addEventListener('click', pingMic);
    interactiveMic.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        pingMic();
      }
    });
  }

  /* --------------------------------------------------------------------------
     7. MOBILE NAVIGATION DRAWER
     -------------------------------------------------------------------------- */
  function openMobileNav() {
    if (!mobileNavDrawer) return;
    mobileNavDrawer.classList.add('active');
    mobileNavDrawer.setAttribute('aria-hidden', 'false');
    if (mobileNavToggle) {
      mobileNavToggle.setAttribute('aria-expanded', 'true');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    if (!mobileNavDrawer) return;
    mobileNavDrawer.classList.remove('active');
    mobileNavDrawer.setAttribute('aria-hidden', 'true');
    if (mobileNavToggle) {
      mobileNavToggle.setAttribute('aria-expanded', 'false');
    }
    if (!curtainsOpen) {
      document.body.style.overflow = '';
    }
  }

  if (mobileNavToggle) {
    mobileNavToggle.addEventListener('click', function () {
      const isExpanded = mobileNavToggle.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  }

  if (mobileNavClose) {
    mobileNavClose.addEventListener('click', closeMobileNav);
  }

  drawerLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      closeMobileNav();
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileNavDrawer && mobileNavDrawer.classList.contains('active')) {
      closeMobileNav();
    }
  });

  /* --------------------------------------------------------------------------
     8. INITIALIZATION
     -------------------------------------------------------------------------- */
  initTheme();
  updateScrollProgress();
  revealVisibleItems();
})();
