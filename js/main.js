/* ============================================================
   main.js — 入口
   ============================================================ */
(function() {
  'use strict';

  function init() {
    /* ── 星空画布 ── */
    if (window.initStarfield) {
      window.initStarfield('starfield');
    }

    /* ── 滚动管理 ── */
    if (window.ScrollSnap) {
      window.ScrollSnap.init('mainScroll');
    }

    /* ── 页面过渡 ── */
    if (window.PageTransition) {
      window.PageTransition.init('transitionOverlay');
    }

    /* ── 从子页返回时恢复滚动位置 ── */
    var savedScroll = sessionStorage.getItem('returnScrollTop');
    if (savedScroll !== null) {
      var container = document.getElementById('mainScroll');
      if (container) {
        container.scrollTop = parseInt(savedScroll, 10);
        container.style.scrollBehavior = 'auto';
        requestAnimationFrame(function() {
          container.style.scrollBehavior = '';
        });
      }
      sessionStorage.removeItem('returnScrollTop');
    }

    /* ── bfcache 恢复时清除过渡层 ── */
    window.addEventListener('pageshow', function(e) {
      if (e.persisted) {
        var overlay = document.getElementById('transitionOverlay');
        if (overlay) {
          overlay.className = 'transition-overlay';
        }
      }
    });

    /* ── CTA 箭头点击滚动 ── */
    var cta = document.querySelector('.hero-cta');
    if (cta) {
      cta.addEventListener('click', function() {
        var gallery = document.getElementById('gallery');
        if (gallery) {
          gallery.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    console.log('%c✦ AIGHT-Zhen %c星海浩瀚 · 笔墨为舟',
      'color:#c4946c;font-size:1.1em;',
      'color:rgba(180,200,220,.6)');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
