/* ============================================================
   main.js — 入口
   ============================================================ */
(function() {
  'use strict';

  function init() {
    if (window.ScrollSnap) {
      window.ScrollSnap.init('scrollContainer');
    }
    if (window.PageTransition) {
      window.PageTransition.init('transitionOverlay');
    }

    // 从子页返回时，恢复到离开时的滚动位置
    var savedScroll = sessionStorage.getItem('returnScrollTop');
    if (savedScroll !== null) {
      var container = document.getElementById('scrollContainer');
      if (container) {
        container.scrollTop = parseInt(savedScroll);
        container.style.scrollBehavior = 'auto';
        requestAnimationFrame(function() {
          container.style.scrollBehavior = 'smooth';
        });
      }
      sessionStorage.removeItem('returnScrollTop');
    }

    // bfcache 恢复时清除残留的过渡层
    window.addEventListener('pageshow', function(e) {
      if (e.persisted) {
        var overlay = document.getElementById('transitionOverlay');
        if (overlay) {
          overlay.className = 'transition-overlay';
        }
      }
    });

    console.log('[AIGHT-Zhen] ✨ 已就绪');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
