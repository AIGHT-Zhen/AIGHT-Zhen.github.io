/* ============================================================
   effects.js — 星空 + 星座 + 3D倾斜 + 其他特效
   ============================================================ */
(function(){
'use strict';

/* ============================================================
   星空画布 (Hero 背景)
   ============================================================ */
window.initStarfield = function(canvasId) {
  var canvas = document.getElementById(canvasId);
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W, H;
  var stars = [];
  var STAR_COUNT = 200;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* 初始化星星 */
  for (var i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * 3000,
      y: Math.random() * 3000,
      r: 0.3 + Math.random() * 1.8,
      twinkle: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.7,
      opacity: 0.25 + Math.random() * 0.55
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    var t = performance.now() / 1000;

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var alpha = s.opacity * (0.5 + 0.5 * Math.sin(t * s.speed + s.twinkle));

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(160,200,230,' + alpha + ')';
      ctx.fill();

      /* 亮星加辉光 */
      if (s.r > 1.2 && alpha > 0.6) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(180,210,240,' + (alpha * 0.15) + ')';
        ctx.fill();
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
};

/* ============================================================
   星座连线 — 鼠标靠近自动连线
   ============================================================ */
(function initConstellation(){
  var canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;z-index:1;pointer-events:none;opacity:0.4';
  document.body.appendChild(canvas);
  var ctx = canvas.getContext('2d');
  var W, H, stars = [], mx = 0, my = 0, COUNT = 50;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  document.addEventListener('mousemove', function(e) { mx = e.clientX; my = e.clientY; });
  document.addEventListener('touchmove', function(e) {
    if (e.touches.length > 0) { mx = e.touches[0].clientX; my = e.touches[0].clientY; }
  }, { passive: true });

  for (var i = 0; i < COUNT; i++) {
    stars.push({
      x: Math.random() * 3000,
      y: Math.random() * 2000,
      r: 0.4 + Math.random() * 1.2,
      twinkle: Math.random() * Math.PI * 2
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    var t = performance.now() / 1000;

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var alpha = 0.2 + 0.15 * Math.sin(t * 1.8 + s.twinkle);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(160,200,230,' + alpha + ')';
      ctx.fill();
    }

    /* 鼠标连线 */
    for (var j = 0; j < stars.length; j++) {
      var s1 = stars[j];
      var d1 = Math.sqrt((s1.x - mx) * (s1.x - mx) + (s1.y - my) * (s1.y - my));
      if (d1 < 200) {
        ctx.beginPath();
        ctx.moveTo(s1.x, s1.y);
        ctx.lineTo(mx, my);
        ctx.strokeStyle = 'rgba(160,200,230,' + (0.12 * (1 - d1 / 200)) + ')';
        ctx.lineWidth = 0.3;
        ctx.stroke();
      }

      /* 星间连线 */
      for (var k = j + 1; k < stars.length; k++) {
        var s2 = stars[k];
        var d2 = Math.sqrt((s1.x - s2.x) * (s1.x - s2.x) + (s1.y - s2.y) * (s1.y - s2.y));
        if (d2 < 150) {
          ctx.beginPath();
          ctx.moveTo(s1.x, s1.y);
          ctx.lineTo(s2.x, s2.y);
          ctx.strokeStyle = 'rgba(160,200,230,' + (0.06 * (1 - d2 / 150)) + ')';
          ctx.lineWidth = 0.2;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ============================================================
   3D 倾斜卡片
   ============================================================ */
(function initTiltCards(){
  document.querySelectorAll('.tilt-card').forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = 'rotateY(' + (x * 8) + 'deg) rotateX(' + (-y * 6) + 'deg)';
    });
    card.addEventListener('mouseleave', function() {
      card.style.transform = 'rotateY(0) rotateX(0)';
      card.style.transition = 'transform 0.6s cubic-bezier(0.22,0.61,0.36,1)';
    });
    card.addEventListener('mouseenter', function() {
      card.style.transition = 'transform 0.1s ease-out';
    });
  });
})();

/* ============================================================
   画廊卡片入场动画 (Intersection Observer)
   ============================================================ */
(function initGalleryReveal(){
  if (!window.IntersectionObserver) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry, index) {
      if (entry.isIntersecting) {
        var card = entry.target;
        /* 错开入场 */
        var delay = parseInt(card.dataset.index || '0', 10) * 40;
        setTimeout(function() {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, delay);
        observer.unobserve(card);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.gallery-card').forEach(function(card, i) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px)';
    card.style.transition = 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)';
    card.dataset.index = i;
    observer.observe(card);
  });
})();

/* ============================================================
   像素加载动画
   ============================================================ */
(function initLoader(){
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:#080d1a;display:flex;align-items:center;justify-content:center;transition:opacity 0.5s,visibility 0.5s';
  overlay.innerHTML = '<div style="font-family:\'Noto Serif SC\',Georgia,serif;font-size:1.4rem;color:rgba(180,210,230,.8);letter-spacing:.2em;animation:loaderPulse 1.5s ease-in-out infinite">星海浩瀚</div>';
  document.body.appendChild(overlay);

  var style = document.createElement('style');
  style.textContent = '@keyframes loaderPulse{0%,100%{opacity:.4;transform:scale(.95)}50%{opacity:1;transform:scale(1.05)}}';
  document.head.appendChild(style);

  window.addEventListener('load', function() {
    setTimeout(function() {
      overlay.style.opacity = '0';
      overlay.style.visibility = 'hidden';
      setTimeout(function() { overlay.remove(); }, 600);
    }, 500);
  });
})();

/* 淡入动画样式补充 */
(function injectStyles() {
  var style = document.createElement('style');
  style.textContent = '';
  document.head.appendChild(style);
})();

console.log('%c✦ FX loaded %c| %cstarfield · constellation · tilt',
  'color:#c4946c', '', 'color:rgba(180,200,220,.5)');
})();
