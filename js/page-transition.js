/* ============================================================
   page-transition.js — 柔和毛玻璃过渡
   ============================================================ */
window.PageTransition = (function() {
  'use strict';

  var overlay;
  var duration = 480;

  function init(overlayId) {
    overlay = document.getElementById(overlayId);
    if (!overlay) return;

    document.addEventListener('click', function(e) {
      var btn = e.target.closest('[data-href]');
      if (!btn) return;
      e.preventDefault();
      var href = btn.getAttribute('data-href');
      if (!href) return;
      navigateTo(href);
    });
  }

  function navigateTo(url) {
    // 保存当前滚动位置
    var container = document.getElementById('scrollContainer');
    if (container) {
      sessionStorage.setItem('returnScrollTop', container.scrollTop);
    }

    overlay.style.transition = 'opacity ' + (duration*0.7) + 'ms ease';
    overlay.className = 'transition-overlay fade active';

    setTimeout(function() {
      window.location.href = url;
    }, duration);
  }

  function goBack() {
    overlay.style.transition = 'opacity ' + (duration*0.7) + 'ms ease';
    overlay.className = 'transition-overlay fade reverse active';

    setTimeout(function() {
      window.history.back();
    }, duration - 100);
  }

  return { init: init, goBack: goBack };
})();
