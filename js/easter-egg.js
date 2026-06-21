/* ============================================================
   easter-egg.js — 键盘彩蛋（命名空间: AZ.easterEgg）
   ============================================================ */
window.AZ = window.AZ || {};

(function() {
  'use strict';

  const EGG = window.AZ.config.EASTER_EGG_WORDS;
  const TIMING = window.AZ.config.TIMING;

  var shiftAnimId = null;

  function showFlash(text) {
    var flash = document.getElementById('easterEggFlash');
    if (!flash) return;
    flash.textContent = text;
    flash.classList.add('show');
    setTimeout(function() { flash.classList.remove('show'); }, 2000);
  }

  function showIndicator(active) {
    var indicator = document.querySelector('.color-shift-indicator');
    if (indicator) indicator.classList.toggle('active', active);
  }

  function animateColorShift(startTime, mainMaterial, rippleMats) {
    if (shiftAnimId) cancelAnimationFrame(shiftAnimId);

    function step() {
      var elapsed = performance.now() / 1000 - startTime;
      var total = TIMING.easterEggDuration;
      var fadeIn = TIMING.easterEggFadeIn;
      var fadeOut = TIMING.easterEggFadeOut;

      var value;
      if (elapsed < fadeIn) value = Math.min(1, elapsed / fadeIn);
      else if (elapsed < total - fadeOut) value = 1;
      else if (elapsed < total) value = Math.max(0, 1 - (elapsed - (total - fadeOut)) / fadeOut);
      else {
        value = 0;
        if (mainMaterial && mainMaterial.uniforms) mainMaterial.uniforms.uColorShift.value = 0;
        showIndicator(false);
        return;
      }

      if (mainMaterial && mainMaterial.uniforms) mainMaterial.uniforms.uColorShift.value = value;
      if (rippleMats) {
        for (var i = 0; i < rippleMats.length; i++) {
          var m = rippleMats[i];
          if (m && m.uniforms && m.uniforms.uColorShift !== undefined) {
            m.uniforms.uColorShift.value = value;
          }
        }
      }
      showIndicator(value > 0.1);
      shiftAnimId = requestAnimationFrame(step);
    }
    step();
  }

  function initEasterEgg(mainMaterial, onActivate) {
    var keyBuffer = '';
    var keyTimeout = null;

    document.addEventListener('keydown', function(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

      if (e.key.length === 1) {
        keyBuffer += e.key;
        if (keyBuffer.length > 12) keyBuffer = keyBuffer.slice(-12);

        clearTimeout(keyTimeout);
        keyTimeout = setTimeout(function() { keyBuffer = ''; }, TIMING.keyBufferTimeout);

        for (var i = 0; i < EGG.length; i++) {
          if (keyBuffer.indexOf(EGG[i].word) !== -1) {
            showFlash(EGG[i].message);
            var startTime = performance.now() / 1000;
            animateColorShift(startTime, mainMaterial, []);
            if (onActivate) onActivate(EGG[i].word, EGG[i].message);
            keyBuffer = '';
            break;
          }
        }
      }
    });
  }

  function logEasterEggHint() {
    console.log(
      '%c🌌 星海浩瀚 · 笔墨为舟 %c| %cAIGHT-Zhen',
      'color:#a0c8dd;font-size:1.2em;', '', 'color:#b8964a;'
    );
    console.log('%c在数字星海中，用笔墨勾勒山海的轮廓', 'color:#8899bb;font-style:italic;');
    console.log('%c💡 试试在页面上输入「山海」或「星辰」...', 'color:#556688;font-size:0.85em;');
  }

  window.AZ.easterEgg = {
    initEasterEgg: initEasterEgg,
    logEasterEggHint: logEasterEggHint,
  };
})();
