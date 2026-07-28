/**
 * Hardware-accelerated animations
 */
window.PF = window.PF || {};

PF.animateCounter = function animateCounter(element, target, duration) {
  duration = duration || 2000;
  if (!element || target == null) return;

  var start = performance.now();
  var targetNum = parseFloat(target);
  var isPercent = targetNum === 100;

  var easeOutQuart = function(t) { return 1 - Math.pow(1 - t, 4); };

  function tick(now) {
    var elapsed = now - start;
    var progress = Math.min(elapsed / duration, 1);
    var eased = easeOutQuart(progress);
    var current = targetNum * eased;

    var suffix = element.dataset.suffix || '';
    if (isPercent) {
      element.textContent = Math.round(current) + suffix;
    } else {
      element.textContent = Math.round(current).toLocaleString() + suffix;
    }

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
};

PF.initCounters = function initCounters() {
  var elements = document.querySelectorAll('[data-count]');
  if (!elements.length) return;

  var observer = new IntersectionObserver(
    function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var target = entry.target.dataset.count;
          PF.animateCounter(entry.target, target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  elements.forEach(function(el) { observer.observe(el); });
};

PF.initParticles = function initParticles() {
  // Particle system removed — background is now pure CSS ambient effects
};

PF.initHeroAvatar = function initHeroAvatar() {
  // Deprecated — replaced by PF.initHero() in hero.js
};

PF.initTiltCards = function initTiltCards() {
  var cards = document.querySelectorAll('.tilt-card');
  if (!cards.length) return;

  cards.forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var centerX = rect.width / 2;
      var centerY = rect.height / 2;
      var rotateX = ((y - centerY) / centerY) * -6;
      var rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale3d(1.02, 1.02, 1.02)';
    }, { passive: true });

    card.addEventListener('mouseleave', function() {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      card.style.transition = 'transform 0.4s ease';
    });

    card.addEventListener('mouseenter', function() {
      card.style.transition = 'transform 0.1s ease';
    });
  });
};

PF.initMagneticButtons = function initMagneticButtons() {
  var buttons = document.querySelectorAll('.magnetic');
  if (!buttons.length) return;

  buttons.forEach(function(btn) {
    btn.addEventListener('mousemove', function(e) {
      var rect = btn.getBoundingClientRect();
      var x = e.clientX - rect.left - rect.width / 2;
      var y = e.clientY - rect.top - rect.height / 2;

      btn.style.transform = 'translate3d(' + (x * 0.3) + 'px, ' + (y * 0.3) + 'px, 0)';
    }, { passive: true });

    btn.addEventListener('mouseleave', function() {
      btn.style.transform = 'translate3d(0, 0, 0)';
      btn.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    });

    btn.addEventListener('mouseenter', function() {
      btn.style.transition = 'transform 0.1s ease';
    });
  });
};
