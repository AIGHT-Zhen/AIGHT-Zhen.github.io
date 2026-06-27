/* ============================================================
   page-transition.js — 页面过渡动画
   ============================================================ */
window.PageTransition = (function() {
  'use strict';

  var overlay;
  var duration = 480;

  function init(overlayId) {
    overlay = document.getElementById(overlayId);
    if (!overlay) return;

    /* 拦截画廊卡片点击 (内部链接带过渡) */
    document.addEventListener('click', function(e) {
      var link = e.target.closest('a');
      if (!link) return;

      var href = link.getAttribute('href');
      if (!href) return;

      /* 只拦截同域内部链接 (subpages/) */
      var isInternal = href.startsWith('subpages/') || href.startsWith('./') || href.startsWith('/');
      if (!isInternal) return;

      /* 排除外链和锚点 */
      if (link.getAttribute('target') === '_blank') return;
      if (href.startsWith('#')) return;

      e.preventDefault();
      navigateTo(href);
    });
  }

  function navigateTo(url) {
    /* 保存当前滚动位置 */
    var container = document.getElementById('mainScroll');
    if (container) {
      sessionStorage.setItem('returnScrollTop', container.scrollTop);
    }

    overlay.style.transition = 'opacity ' + (duration * 0.7) + 'ms ease';
    overlay.classList.add('active');

    setTimeout(function() {
      window.location.href = url;
    }, duration);
  }

  return { init: init };
})();
