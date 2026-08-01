/**
 * Interactive Terminal Easter Egg
 * Press backtick (`) to open, Escape to close
 */
window.PF = window.PF || {};

PF.initTerminal = function initTerminal() {
  var overlay = document.getElementById('terminal-overlay');
  var input = document.getElementById('terminal-input');
  var body = document.getElementById('terminal-body');
  if (!overlay || !input || !body) return;

  var open = false;
  var history = [];
  var histIdx = -1;

  var COMMANDS = {
    help: function() { return [
      'Available commands:',
      '',
      '  help       Show this help',
      '  about      About Azwidali',
      '  skills     Technical skills by tier',
      '  projects   Featured projects',
      '  goals      Career goals',
      '  contact    Get in touch',
      '  theme      Toggle light/dark mode',
      '  metrics    Show live performance data',
      '  clear      Clear the terminal',
      '  exit       Close this terminal',
      '  secret     ?',
      '',
      'Pro tip: use Tab for autocomplete, up/down for history',
    ]; },

    about: function() { return [
      'Azwidali Manyaga',
      'Final-year IT Software Development Student',
      'South Africa',
      '',
      'Passionate about building modern, responsive,',
      'and user-focused applications. I enjoy solving',
      'real-world problems through software.',
      '',
      'Currently learning and growing in:',
      '  Full-Stack Development, UI/UX Design,',
      '  Information Security, and System Design.',
      '',
      'Goal: Build impactful digital solutions.',
    ]; },

    skills: function() { return [
      '\u250C\u2500 Frontend \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510',
      '\u2502  HTML5  CSS3  JavaScript             \u2502',
      '\u2502  Responsive Design  Flexbox  Grid    \u2502',
      '\u251C\u2500 Backend \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524',
      '\u2502  C#  OOP  File Handling  .NET        \u2502',
      '\u251C\u2500 Software Dev \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524',
      '\u2502  SDLC  Agile  UML  ERD  Analysis     \u2502',
      '\u251C\u2500 Tools \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524',
      '\u2502  Git  GitHub  VS Code  Figma  Canva  \u2502',
      '\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518',
    ]; },

    projects: function() { return [
      '01  Developer Portfolio',
      '    This site! Vanilla HTML/CSS/JS, zero frameworks',
      '    100/100 Lighthouse, responsive, accessible',
      '',
      '02  Wapanda Clothing Website',
      '    E-commerce streetwear brand website',
      '    Shopping cart, PayFast, Local Storage, SEO',
      '',
      '03  Mining Management System (Final Year)',
      '    Improving operations in SA mines',
      '    Full SDLC: requirements through deployment',
      '',
      '04  C# AI Chatbot',
      '    Sentiment detection, conversation recall',
      '    OOP principles, .NET, keyword matching',
    ]; },

    goals: function() { return [
      'Career Goals:',
      '',
      '  > Graduate with IT Software Development qual',
      '  > Become a Full-Stack Software Developer',
      '  > Build scalable web applications',
      '  > Learn modern frameworks & cloud tech',
      '  > Create solutions with real-world impact',
      '',
      'Currently learning:',
      '  SQL, React, Node.js, ASP.NET Core, REST APIs',
    ]; },

    contact: function() { return [
      '  Email:    azwidalimanyaga244@gmail.com',
      '  GitHub:   github.com/Azwidalimayaga1',
      '  LinkedIn: linkedin.com/in/azwidali',
      '',
      'Open to internships, junior roles, and collab.',
    ]; },

    theme: function() {
      var curr = document.documentElement.getAttribute('data-theme');
      var next = curr === 'dark' ? 'light' : 'dark';
      PF.applyTheme(next);
      try { localStorage.setItem('theme', next); } catch (_) {}
      return ['Theme switched to ' + next];
    },

    metrics: function() {
      var entries = performance.getEntriesByType('navigation');
      var paint = performance.getEntriesByType('paint');
      var nav = entries[0];
      var fcp = paint.find(function(e) { return e.name === 'first-contentful-paint'; });
      return [
        'Live Performance Metrics:',
        '',
        '  TTFB:           ' + (nav ? Math.round(nav.responseStart) + 'ms' : 'N/A'),
        '  FCP:            ' + (fcp ? Math.round(fcp.startTime) + 'ms' : 'N/A'),
        '  DOM Complete:   ' + (nav ? Math.round(nav.domComplete) + 'ms' : 'N/A'),
        '  Load Event:     ' + (nav ? Math.round(nav.loadEventEnd) + 'ms' : 'N/A'),
        '  Transfer Size:  ' + (nav ? (nav.transferSize / 1024).toFixed(1) + ' KB' : 'N/A'),
        '',
        'This portfolio scores 100/100 on Lighthouse.',
      ];
    },

    clear: function() { body.innerHTML = ''; return []; },

    exit: function() { toggle(); return []; },

    secret: function() { return [
      '',
      '  \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557',
      '  \u2551                                      \u2551',
      '  \u2551   You found the easter egg!          \u2551',
      '  \u2551                                      \u2551',
      '  \u2551   This portfolio is built with:      \u2551',
      '  \u2551   - Zero frameworks                  \u2551',
      '  \u2551   - Zero heavy libraries             \u2551',
      '  \u2551   - Pure vanilla HTML/CSS/JS         \u2551',
      '  \u2551   - 100/100 Lighthouse score         \u2551',
      '  \u2551                                      \u2551',
      '  \u2551   Built by Azwidali Manyaga          \u2551',
      '  \u2551   from South Africa.                 \u2551',
      '  \u2551                                      \u2551',
      '  \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D',
      '',
    ]; },
  };

  function addLine(text, cls) {
    var p = document.createElement('p');
    p.className = 'terminal__output' + (cls ? ' ' + cls : '');
    p.textContent = text;
    body.appendChild(p);
    body.scrollTop = body.scrollHeight;
  }

  function addLines(lines, cls) {
    lines.forEach(function(l) { addLine(l, cls); });
  }

  function process(cmd) {
    var trimmed = cmd.trim();
    if (!trimmed) return;

    history.unshift(trimmed);
    histIdx = -1;
    addLine('$ ' + trimmed);

    var key = trimmed.toLowerCase().split(/\s+/)[0];

    if (COMMANDS[key]) {
      var out = COMMANDS[key]();
      if (out && out.length) addLines(out);
    } else {
      addLine('command not found: ' + key, 'terminal__output--error');
      addLine('Type "help" for available commands', 'terminal__output--error');
    }
  }

  function toggle() {
    open = !open;
    overlay.setAttribute('aria-hidden', String(!open));
    overlay.classList.toggle('is-open', open);

    if (open) {
      input.focus();
      addLine('Welcome to Azwidali\'s portfolio terminal.', 'terminal__output--accent');
      addLine('Type "help" to explore commands.\n');
    }
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === '`' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      e.preventDefault();
      toggle();
    }
    if (e.key === 'Escape' && open) {
      e.preventDefault();
      toggle();
    }
  });

  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      process(input.value);
      input.value = '';
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx < history.length - 1) {
        histIdx++;
        input.value = history[histIdx];
      }
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx > 0) {
        histIdx--;
        input.value = history[histIdx];
      } else {
        histIdx = -1;
        input.value = '';
      }
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      var partial = input.value.trim().toLowerCase();
      if (partial) {
        var match = Object.keys(COMMANDS).find(function(c) { return c.startsWith(partial); });
        if (match) input.value = match;
      }
    }
  });
};
