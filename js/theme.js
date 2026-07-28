/**
 * Theme management — shared apply/init for app + terminal
 */
window.PF = window.PF || {};

(function() {
  var THEME_COLORS = { dark: '#090714', light: '#faf8ff' };

  function getPreferredTheme() {
    var stored = null;
    try { stored = localStorage.getItem('theme'); } catch (_) {}
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  PF.applyTheme = function applyTheme(theme) {
    var html = document.documentElement;
    html.setAttribute('data-theme', theme);
    html.style.colorScheme = theme;

    var colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
    if (colorSchemeMeta) colorSchemeMeta.setAttribute('content', theme);

    var themeMeta = document.querySelector('meta[name="theme-color"][data-theme-color]');
    if (!themeMeta) {
      themeMeta = document.createElement('meta');
      themeMeta.name = 'theme-color';
      themeMeta.setAttribute('data-theme-color', '');
      document.head.appendChild(themeMeta);
    }
    themeMeta.content = THEME_COLORS[theme] || THEME_COLORS.dark;

    if (PF.appState) PF.appState.get().theme = theme;
  };

  PF.initTheme = function initTheme() {
    var toggle = document.getElementById('theme-toggle');
    var html = document.documentElement;

    PF.applyTheme(getPreferredTheme());

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
      try {
        if (!localStorage.getItem('theme')) {
          PF.applyTheme(e.matches ? 'dark' : 'light');
        }
      } catch (_) {}
    });

    if (toggle) {
      toggle.addEventListener('click', function() {
        var curr = html.getAttribute('data-theme');
        var next = curr === 'dark' ? 'light' : 'dark';
        PF.applyTheme(next);
        try { localStorage.setItem('theme', next); } catch (_) {}
      });
    }
  };
})();
