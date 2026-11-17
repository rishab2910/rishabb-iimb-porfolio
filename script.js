/**
 * BEHIND THE CURTAIN — RISHAB BULCHANDANI PORTFOLIO
 * Minimal, accessible Vanilla JavaScript
 * Responsibilities:
 *  1. Physical Stage Light Switch (Dark / Light Theme Toggle + Audio Click Feedback)
 *  2. Mobile Navigation Drawer (Open / Close / Focus Management)
 *  3. LocalStorage persistence for lighting state
 */

(function () {
  'use strict';

  // DOM Elements
  const htmlElement = document.documentElement;
  const stageLightSwitch = document.getElementById('stage-light-switch');
  const switchStatusText = document.getElementById('switch-status-text');
  const switchLed = document.getElementById('switch-led');
  const footerThemeStatus = document.getElementById('footer-theme-status');
  const mobileNavToggle = document.getElementById('mobile-nav-toggle');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
  const mobileNavClose = document.getElementById('mobile-nav-close');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  // Storage Key
  const STORAGE_KEY = 'rishab_portfolio_theme';

  /**
   * Synthesize a subtle mechanical switch click sound using Web Audio API
   * No external audio files or dependencies required.
   */
  function playSwitchSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      // Sharp snap impulse
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (e) {
      // Audio context might be restricted before user gesture; silently ignore
    }
  }

  /**
   * Apply Theme (Dark or Light)
   * @param {string} theme - 'dark' | 'light'
   */
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

    // Save preference
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (err) {
      // localStorage may fail in private browsing mode; handle safely
    }
  }

  /**
   * Toggle between Dark and Light
   */
  function toggleTheme() {
    const currentTheme = htmlElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    playSwitchSound();
    applyTheme(nextTheme);
  }

  /**
   * Initialize Theme from LocalStorage or Default (Dark)
   */
  function initTheme() {
    let savedTheme = 'dark'; // Default: Dramatic Stage Lights Off
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        savedTheme = stored;
      }
    } catch (err) {}

    applyTheme(savedTheme);
  }

  /**
   * Stage Light Switch Event Handlers
   */
  if (stageLightSwitch) {
    stageLightSwitch.addEventListener('click', toggleTheme);

    // Keyboard support: Enter and Space keys
    stageLightSwitch.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggleTheme();
      }
    });
  }

  /**
   * Mobile Navigation Handlers
   */
  function openMobileNav() {
    if (!mobileNavDrawer) return;
    mobileNavDrawer.classList.add('active');
    mobileNavDrawer.setAttribute('aria-hidden', 'false');
    if (mobileNavToggle) {
      mobileNavToggle.setAttribute('aria-expanded', 'true');
    }
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  }

  function closeMobileNav() {
    if (!mobileNavDrawer) return;
    mobileNavDrawer.classList.remove('active');
    mobileNavDrawer.setAttribute('aria-hidden', 'true');
    if (mobileNavToggle) {
      mobileNavToggle.setAttribute('aria-expanded', 'false');
    }
    document.body.style.overflow = '';
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

  // Close drawer when any mobile navigation link is clicked
  drawerLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      closeMobileNav();
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileNavDrawer && mobileNavDrawer.classList.contains('active')) {
      closeMobileNav();
    }
  });

  // Run on DOM load
  initTheme();
})();
