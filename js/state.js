/**
 * Lightweight Reactive State using Proxy
 * Zero dependencies, zero framework overhead
 */
window.PF = window.PF || {};

(function() {
  const createState = (initial = {}) => {
    const listeners = new Map();

    const state = new Proxy({ ...initial }, {
      set(target, prop, value) {
        const prev = target[prop];
        target[prop] = value;
        if (prev !== value && listeners.has(prop)) {
          listeners.get(prop).forEach(fn => {
            try { fn(value, prev); } catch (e) { console.error('State listener error [' + prop + ']:', e); }
          });
        }
        return true;
      }
    });

    return {
      get: function() { return state; },
      subscribe: function(prop, fn) {
        if (!listeners.has(prop)) listeners.set(prop, new Set());
        listeners.get(prop).add(fn);
        return function() { listeners.get(prop).delete(fn); };
      },
      batch: function(updates) {
        Object.entries(updates).forEach(function(entry) { state[entry[0]] = entry[1]; });
      }
    };
  };

  PF.appState = createState({
    theme: 'dark',
    activeSection: null,
    terminalOpen: false,
    mounted: false,
  });
})();
