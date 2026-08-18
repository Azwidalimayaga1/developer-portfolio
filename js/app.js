/**
 * Main Application Entry Point
 * Orchestrates all modules — zero dependencies
 */
(function() {
  var throttle = PF.throttle;

  /* ---- Sticky Nav ---- */
  function initStickyNav() {
    var navWrapper = document.getElementById('nav-wrapper');
    if (!navWrapper) return;

    var onScroll = throttle(function() {
      navWrapper.classList.toggle('nav-wrapper--scrolled', window.scrollY > 50);
    }, 100);

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Scroll Progress Bar ---- */
  function initScrollProgress() {
    var bar = document.getElementById('scroll-progress');
    if (!bar) return;

    var onScroll = throttle(function() {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.transform = 'scaleX(' + (progress / 100) + ')';
    }, 16);

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Engineering Timeline Progress ---- */
  function initExperienceTimeline() {
    var timeline = document.querySelector('.engineering-timeline');
    if (!timeline || !('IntersectionObserver' in window)) return;

    var items = timeline.querySelectorAll('.timeline__item');
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var updateProgress = throttle(function() {
      var rect = timeline.getBoundingClientRect();
      var anchor = window.innerHeight * 0.62;
      var travelled = anchor - rect.top;
      var progress = Math.max(0, Math.min(1, travelled / Math.max(rect.height, 1)));
      timeline.style.setProperty('--timeline-progress', String(progress));
    }, 16);

    var itemObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        entry.target.classList.toggle('is-active', entry.isIntersecting);
      });
    }, { threshold: 0.45, rootMargin: '0px 0px -18% 0px' });

    items.forEach(function(item) { itemObserver.observe(item); });
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });

    if (reduceMotion) {
      timeline.style.setProperty('--timeline-progress', '1');
    } else {
      requestAnimationFrame(updateProgress);
    }
  }

  /* ---- Cursor Glow (removed — clean aesthetic) ---- */

  /* ---- Hamburger & Mobile Menu ---- */
  function initMobileMenu() {
    var hamburger = document.getElementById('hamburger');
    var mobileMenu = document.getElementById('mobile-menu');
    if (!hamburger || !mobileMenu) return;

    function toggleMenu() {
      var isOpen = mobileMenu.classList.contains('is-open');
      mobileMenu.classList.toggle('is-open', !isOpen);
      mobileMenu.setAttribute('aria-hidden', String(isOpen));
      hamburger.setAttribute('aria-expanded', String(!isOpen));
      document.body.style.overflow = isOpen ? '' : 'hidden';
      PF.appState.get().menuOpen = !isOpen;
    }

    hamburger.addEventListener('click', toggleMenu);

    mobileMenu.querySelectorAll('.mobile-menu__link').forEach(function(link) {
      link.addEventListener('click', function() {
        if (mobileMenu.classList.contains('is-open')) toggleMenu();
      });
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
        toggleMenu();
      }
    });
  }

  /* ---- Active Nav Highlight ---- */
  function initNavHighlight() {
    var links = document.querySelectorAll('.nav__link');

    PF.initSectionTracker(function(sectionId) {
      PF.appState.get().activeSection = sectionId;
      links.forEach(function(link) {
        var href = link.getAttribute('href');
        link.classList.toggle('nav__link--active', href === '#' + sectionId);
      });
    });
  }

  /* ---- Typing Effect ---- */
  function initTypingEffect() {
    var el = document.getElementById('typing-text');
    if (!el) return;

    var words = [
      'Full Stack Developer',
      'Software Engineer',
      'Problem Solver',
      'IT Student',
    ];

    var wordIdx = 0;
    var charIdx = 0;
    var isDeleting = false;
    var isPaused = false;

    function tick() {
      var current = words[wordIdx];

      if (isPaused) {
        isPaused = false;
        isDeleting = true;
        setTimeout(tick, 50);
        return;
      }

      if (!isDeleting) {
        el.textContent = current.substring(0, charIdx + 1);
        charIdx++;

        if (charIdx === current.length) {
          isPaused = true;
          setTimeout(tick, 2000);
          return;
        }
        setTimeout(tick, 80);
      } else {
        el.textContent = current.substring(0, charIdx - 1);
        charIdx--;

        if (charIdx === 0) {
          isDeleting = false;
          wordIdx = (wordIdx + 1) % words.length;
          setTimeout(tick, 400);
          return;
        }
        setTimeout(tick, 40);
      }
    }

    setTimeout(tick, 500);
  }

  /* ---- Back to Top ---- */
  function initBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn) return;

    var onScroll = throttle(function() {
      btn.classList.toggle('is-visible', window.scrollY > 500);
    }, 200);

    window.addEventListener('scroll', onScroll, { passive: true });

    btn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---- Contact Form ---- */
  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var fields = [
      { el: null, error: null, msg: 'Please enter your name', pattern: null },
      { el: null, error: null, msg: 'Please enter a valid email', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      { el: null, error: null, msg: 'Please enter your message', pattern: null }
    ];

    function validateField(field) {
      var val = field.el.value.trim();
      var group = field.el.closest('.form-group');
      if (!val || (field.pattern && !field.pattern.test(val))) {
        group.classList.add('is-error');
        field.error.textContent = field.msg;
        return false;
      }
      group.classList.remove('is-error');
      field.error.textContent = '';
      return true;
    }

    fields[0].el = form.querySelector('#form-name');
    fields[0].error = form.querySelector('#form-name-error');
    fields[1].el = form.querySelector('#form-email');
    fields[1].error = form.querySelector('#form-email-error');
    fields[2].el = form.querySelector('#form-message');
    fields[2].error = form.querySelector('#form-message-error');

    fields.forEach(function(f) {
      f.el.addEventListener('blur', function() { validateField(f); });
      f.el.addEventListener('input', function() {
        if (f.el.closest('.form-group').classList.contains('is-error')) validateField(f);
      });
    });

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var valid = true;
      fields.forEach(function(f) { if (!validateField(f)) valid = false; });
      if (!valid) return;

      var name = fields[0].el.value.trim();
      var email = fields[1].el.value.trim();
      var message = fields[2].el.value.trim();

      var subject = 'Portfolio message from ' + name;
      var body = 'Name: ' + name + '\n'
        + 'Email: ' + email + '\n\n'
        + message;

      window.location.href = 'mailto:azwidalimanyaga244@gmail.com'
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(body);

      form.reset();
      fields.forEach(function(f) {
        f.el.closest('.form-group').classList.remove('is-error');
        f.error.textContent = '';
      });
    });
  }

  /* ---- Download CV ---- */
  function initDownloadCV() {
    var link = document.getElementById('download-cv');
    if (!link) return;
    link.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var url = link.href;
      var a = document.createElement('a');
      a.href = url;
      a.download = 'Azwidali Manyaga CV.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }

  /* ---- Smooth Scroll ---- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function(e) {
        var id = anchor.getAttribute('href');
        if (!id || id === '#') return;
        var target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  function init() {
    performance.mark('app-boot-start');

    PF.initTheme();
    initStickyNav();
    initScrollProgress();
    initExperienceTimeline();
    initMobileMenu();
    initSmoothScroll();
    initDownloadCV();
    PF.initScrollReveal();
    PF.initCounters();
    initNavHighlight();
    initTypingEffect();
    initBackToTop();
    initContactForm();
    PF.initParticles();
    PF.initChromaticFluid();
    PF.initHero();
    PF.initTiltCards();
    PF.initMagneticButtons();
    PF.initPerformanceMonitor();
    PF.initTerminal();

    PF.appState.get().mounted = true;

    performance.mark('app-boot-end');
    performance.measure('app-boot', 'app-boot-start', 'app-boot-end');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
