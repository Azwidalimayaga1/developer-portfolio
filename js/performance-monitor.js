/**
 * Live Performance Monitor
 */
window.PF = window.PF || {};

PF.initPerformanceMonitor = function initPerformanceMonitor() {
  var el = document.getElementById('perf-monitor');
  if (!el) return;

  var metrics = { lcp: '...', fid: '...', cls: '...', fcp: '...', ttfb: '...' };

  function render() {
    el.innerHTML = Object.entries(metrics)
      .map(function(entry) { return '<span class="perf-metric" title="' + entry[0].toUpperCase() + '">' + entry[0].toUpperCase() + ': ' + entry[1] + '</span>'; })
      .join('');
  }

  render();

  try {
    var lcpObs = new PerformanceObserver(function(list) {
      var entries = list.getEntries();
      var last = entries[entries.length - 1];
      metrics.lcp = Math.round(last.startTime) + 'ms';
      render();
    });
    lcpObs.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (_) { metrics.lcp = 'N/A'; render(); }

  try {
    var fidObs = new PerformanceObserver(function(list) {
      var entry = list.getEntries()[0];
      metrics.fid = Math.round(entry.processingStart - entry.startTime) + 'ms';
      render();
    });
    fidObs.observe({ type: 'first-input', buffered: true });
  } catch (_) { metrics.fid = 'N/A'; render(); }

  var clsValue = 0;
  try {
    var clsObs = new PerformanceObserver(function(list) {
      list.getEntries().forEach(function(entry) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          metrics.cls = clsValue.toFixed(3);
          render();
        }
      });
    });
    clsObs.observe({ type: 'layout-shift', buffered: true });
  } catch (_) { metrics.cls = 'N/A'; render(); }

  window.addEventListener('load', function() {
    try {
      var paint = performance.getEntriesByType('paint');
      var fcp = paint.find(function(e) { return e.name === 'first-contentful-paint'; });
      if (fcp) metrics.fcp = Math.round(fcp.startTime) + 'ms';

      var nav = performance.getEntriesByType('navigation')[0];
      if (nav) metrics.ttfb = Math.round(nav.responseStart) + 'ms';
    } catch (_) {}
    render();
  }, { once: true });
};
