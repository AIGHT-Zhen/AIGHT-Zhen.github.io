/* ============================================================
   scroll-snap.js — 自由滚动 + 视差控制
   ============================================================ */
window.ScrollSnap = (function() {
  'use strict';

  var container;
  var parallaxBgs = [];
  var currentScreen = 0;

  function init(containerId) {
    container = document.getElementById(containerId);
    if (!container) { console.warn('ScrollSnap: 容器未找到'); return; }

    parallaxBgs = container.querySelectorAll('.parallax-bg');

    container.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function onScroll() {
    var scrollTop = container.scrollTop;
    var vh = container.clientHeight;

    // 当前屏索引（用于外部查询，不影响滚动行为）
    var screens = container.querySelectorAll('.screen');
    for (var i = 0; i < screens.length; i++) {
      var s = screens[i];
      var top = s.offsetTop;
      var h = s.offsetHeight;
      if (scrollTop >= top - h * 0.4 && scrollTop < top + h * 0.6) {
        currentScreen = i;
        break;
      }
    }

    // 视差偏移
    for (var j = 0; j < parallaxBgs.length; j++) {
      var bg = parallaxBgs[j];
      var screenEl = bg.closest('.screen');
      if (!screenEl) continue;

      var screenTop = screenEl.offsetTop;
      var screenHeight = screenEl.offsetHeight;
      var progress = (scrollTop - screenTop) / screenHeight;
      var offsetY = progress * vh * 0.25;
      bg.style.transform = 'translateY(' + offsetY + 'px)';
    }

    document.body.setAttribute('data-screen', currentScreen);
  }

  return {
    init: init,
    getCurrentScreen: function() { return currentScreen; },
  };
})();
