/**
 * Hero Avatar — Premium tech frame with spring physics
 * SVG frame + corner skill panels + cursor glow + trail particles
 */
window.PF = window.PF || {};

(function() {
  'use strict';

  var SPRING_STIFFNESS = 0.08;
  var SPRING_DAMPING = 0.72;
  var TILT_MAX = 10;
  var GLOW_LERP = 0.06;
  var PANEL_PARALLAX = 18;
  var TRAIL_COUNT = 6;
  var TRAIL_RADII = [250, 268, 286, 250, 268, 286];
  var TRAIL_SPEEDS = [0.1, -0.075, 0.12, -0.09, 0.065, -0.105];
  var TRAIL_OFFSETS = [0, 1.05, 2.1, 3.14, 4.2, 5.24];

  var state = {
    mouseX: 0.5, mouseY: 0.5,
    tiltX: 0, tiltY: 0,
    tiltVX: 0, tiltVY: 0,
    glowX: 0.5, glowY: 0.5,
    scrollY: 0,
    scrollProgress: 0,
    prefersReducedMotion: false,
    revealed: false
  };

  var els = {};

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function springStep(cur, tgt, vel, k, d) {
    var f = (tgt - cur) * k;
    var nv = (vel + f) * d;
    return { v: cur + nv, vel: nv };
  }

  function onMouseMove(e) {
    if (!els.avatar) return;
    var rect = els.avatar.getBoundingClientRect();
    state.mouseX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    state.mouseY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
  }

  function onScroll() {
    state.scrollY = window.pageYOffset || document.documentElement.scrollTop;
  }

  function setupReveal() {
    if (!els.avatar) return;
    if (state.prefersReducedMotion) {
      els.avatar.classList.add('is-revealed');
      state.revealed = true;
      return;
    }
    var rect = els.avatar.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setTimeout(function() {
        els.avatar.classList.add('is-revealed');
        state.revealed = true;
      }, 400);
      return;
    }
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          setTimeout(function() {
            entry.target.classList.add('is-revealed');
            state.revealed = true;
          }, 200);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    observer.observe(els.avatar);
  }

  function updateTilt() {
    if (!els.avatar || state.prefersReducedMotion) return;
    var tgtX = (state.mouseY - 0.5) * TILT_MAX;
    var tgtY = (state.mouseX - 0.5) * TILT_MAX;
    var sx = springStep(state.tiltX, tgtX, state.tiltVX, SPRING_STIFFNESS, SPRING_DAMPING);
    var sy = springStep(state.tiltY, tgtY, state.tiltVY, SPRING_STIFFNESS, SPRING_DAMPING);
    state.tiltX = sx.v; state.tiltVX = sx.vel;
    state.tiltY = sy.v; state.tiltVY = sy.vel;
    els.avatar.style.transform = 'perspective(800px) rotateX(' + (-state.tiltX) + 'deg) rotateY(' + state.tiltY + 'deg)';
  }

  function updateGlow() {
    if (!els.glowCursor || state.prefersReducedMotion) return;
    state.glowX += (state.mouseX - state.glowX) * GLOW_LERP;
    state.glowY += (state.mouseY - state.glowY) * GLOW_LERP;
    var px = state.glowX * 100;
    var py = state.glowY * 100;
    els.glowCursor.style.background = 'radial-gradient(circle 180px at ' + px + '% ' + py + '%, rgba(139, 92, 246, 0.14) 0%, transparent 70%)';
  }

  function updateImageParallax() {
    if (!els.image || !els.avatar || state.prefersReducedMotion) return;
    var rect = els.avatar.getBoundingClientRect();
    if (rect.top > window.innerHeight || rect.bottom < 0) return;
    var cy = rect.top + rect.height / 2;
    var progress = Math.max(-1, Math.min(1, (window.innerHeight / 2 - cy) / (window.innerHeight / 2)));
    var imgY = progress * 25;
    var imgRot = progress * 4;
    state.scrollProgress += (imgY - state.scrollProgress) * 0.1;
    var tx = state.tiltY * 0.12;
    els.image.style.transform = 'translate3d(' + tx + 'px, ' + state.scrollProgress + 'px, 0) rotateX(' + imgRot + 'deg)';
  }

  function updateTrailParticles() {
    if (!els.trailEls || state.prefersReducedMotion) return;
    var time = Date.now() * 0.001;
    for (var i = 0; i < els.trailEls.length; i++) {
      var el = els.trailEls[i];
      var angle = time * TRAIL_SPEEDS[i] + TRAIL_OFFSETS[i];
      var r = TRAIL_RADII[i];
      var x = Math.cos(angle) * r + 375;
      var y = Math.sin(angle) * r + 375;
      el.setAttribute('cx', x);
      el.setAttribute('cy', y);
      var mouseDist = Math.sqrt(Math.pow(state.mouseX * 750 - x, 2) + Math.pow(state.mouseY * 750 - y, 2));
      var opacity = mouseDist < 150 ? 0.6 + 0.3 * (1 - mouseDist / 150) : 0.3 + 0.15 * Math.sin(time * 2 + i);
      var radius = mouseDist < 150 ? 2 + (1 - mouseDist / 150) * 1.5 : 1.5 + 0.5 * Math.sin(time + i);
      el.setAttribute('r', radius);
      el.setAttribute('opacity', opacity);
    }
  }

  function updatePanels() {
    if (!els.panels || state.prefersReducedMotion) return;
    for (var i = 0; i < els.panels.length; i++) {
      var p = els.panels[i];
      var px = (state.mouseX - 0.5) * PANEL_PARALLAX * p.parallaxX;
      var py = (state.mouseY - 0.5) * PANEL_PARALLAX * p.parallaxY;
      p.el.style.transform = 'translate3d(' + px + 'px, ' + py + 'px, 0)';
    }
  }

  function tick() {
    updateTilt();
    updateGlow();
    updateImageParallax();
    updateTrailParticles();
    updatePanels();
    requestAnimationFrame(tick);
  }

  PF.initHero = function initHero() {
    state.prefersReducedMotion = prefersReducedMotion();

    els.avatar = document.querySelector('.hero__avatar');
    els.image = document.querySelector('.hero__image');
    els.glowCursor = document.querySelector('.hero__glow--cursor');
    els.trailEls = document.querySelectorAll('.hero__trail');
    els.panelEls = document.querySelectorAll('.hero__skill-panel');

    if (!els.avatar) return;

    document.addEventListener('mousemove', PF.throttle(onMouseMove, 16), { passive: true });
    window.addEventListener('scroll', PF.throttle(onScroll, 16), { passive: true });
    window.addEventListener('resize', PF.throttle(onScroll, 100), { passive: true });

    if (els.panelEls && els.panelEls.length) {
      els.panels = [];
      var parallaxMap = [
        { parallaxX: -1, parallaxY: -1 },
        { parallaxX: 1, parallaxY: -1 },
        { parallaxX: -1, parallaxY: 1 },
        { parallaxX: 1, parallaxY: 1 }
      ];
      for (var i = 0; i < els.panelEls.length; i++) {
        els.panels.push({
          el: els.panelEls[i],
          parallaxX: parallaxMap[i % 4].parallaxX,
          parallaxY: parallaxMap[i % 4].parallaxY
        });
      }
    }

    setupReveal();
    onScroll();
    requestAnimationFrame(tick);
  };

})();
