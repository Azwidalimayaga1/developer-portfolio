/**
 * IntersectionObserver-based scroll reveal & section tracking
 */
window.PF = window.PF || {};

PF.initScrollReveal = function initScrollReveal() {
  var elements = document.querySelectorAll('.reveal-up');
  if (!elements.length) return;

  var observer = new IntersectionObserver(
    function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -60px 0px', threshold: 0.1 }
  );

  elements.forEach(function(el) { observer.observe(el); });
};

PF.initSectionTracker = function initSectionTracker(callback) {
  var sections = document.querySelectorAll('section[id]');
  if (!sections.length) return;

  var observer = new IntersectionObserver(
    function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          callback(entry.target.id);
        }
      });
    },
    { threshold: 0.2, rootMargin: '-20% 0px -70% 0px' }
  );

  sections.forEach(function(s) { observer.observe(s); });
};
