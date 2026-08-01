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

    form.addEventListener('submit', function(e) {
      e.preventDefault();

      var name = form.querySelector('#form-name');
      var email = form.querySelector('#form-email');
      var message = form.querySelector('#form-message');

      if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
        return;
      }

      var subject = 'Portfolio message from ' + name.value.trim();
      var body = 'Name: ' + name.value.trim() + '\n'
        + 'Email: ' + email.value.trim() + '\n\n'
        + message.value.trim();

      window.location.href = 'mailto:azwidalimanyaga244@gmail.com'
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(body);

      form.reset();
    });
  }

  /* ---- Skill Card Stagger Reveal ---- */
  function initSkillCardReveal() {
    var grid = document.querySelector('.skills-categories');
    if (!grid) return;

    var cards = grid.querySelectorAll('.skill-card');
    cards.forEach(function(card, i) {
      card.style.animationDelay = (i * 45) + 'ms';
    });

    var observer = new IntersectionObserver(
      function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var cards = entry.target.querySelectorAll('.skill-card');
            cards.forEach(function(card) { card.classList.add('is-visible'); });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );

    observer.observe(grid);
  }

  /* ---- Skills category filters ---- */
  function initSkillFilters() {
    var filters = document.querySelectorAll('.skills-filter-btn');
    var cards = document.querySelectorAll('.skills-categories .skill-card');
    if (!filters.length || !cards.length) return;

    filters.forEach(function(button) {
      button.addEventListener('click', function() {
        var filter = button.dataset.filter;

        filters.forEach(function(item) {
          var active = item === button;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-pressed', String(active));
        });

        cards.forEach(function(card) {
          var category = card.closest('[data-skill-category]');
          var isMatch = filter === 'all' || (category && category.dataset.skillCategory === filter);
          card.hidden = !isMatch;
        });
      });
    });
  }

  /* ---- Current Devicon brand marks with inline SVG fallback ---- */
  function initModernSkillIcons() {
    var iconBase = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/';
    var icons = {
      'HTML5': 'html5/html5-original.svg',
      'CSS3': 'css3/css3-original.svg',
      'JavaScript': 'javascript/javascript-original.svg',
      'TypeScript': 'typescript/typescript-original.svg',
      'React': 'react/react-original.svg',
      'ASP.NET': 'dotnetcore/dotnetcore-original.svg',
      'C#': 'csharp/csharp-original.svg',
      'Python': 'python/python-original.svg',
      'SQL Server': 'microsoftsqlserver/microsoftsqlserver-plain.svg',
      'MySQL': 'mysql/mysql-original.svg',
      'Firebase': 'firebase/firebase-plain.svg',
      'Git': 'git/git-original.svg',
      'GitHub': 'github/github-original.svg',
      'VS Code': 'vscode/vscode-original.svg',
      'Visual Studio': 'visualstudio/visualstudio-original.svg',
      'Figma': 'figma/figma-original.svg'
    };

    document.querySelectorAll('.skill-card').forEach(function(card) {
      var name = card.querySelector('.skill-card__name');
      var stage = card.querySelector('.skill-card__icon');
      var fallback = stage && stage.querySelector('svg');
      var source = name && icons[name.textContent.trim()];
      if (!stage || !fallback || !source) return;

      var image = document.createElement('img');
      image.className = 'skill-card__brand-icon';
      image.alt = '';
      image.decoding = 'async';
      image.hidden = true;
      image.addEventListener('load', function() {
        fallback.remove();
        image.hidden = false;
      });
      image.addEventListener('error', function() { image.remove(); });
      stage.appendChild(image);
      image.src = iconBase + source;
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
    initSkillCardReveal();
    initSkillFilters();
    initModernSkillIcons();
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
