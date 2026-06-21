/* ============================================================
   interactions.js — 交互系统（命名空间: AZ.interactions）
   ============================================================ */
window.AZ = window.AZ || {};

(function() {
  'use strict';

  const C = window.AZ.config;
  const U = window.AZ.utils;

  // --- 鼠标追踪 ---
  function createMouseTracker() {
    return {
      raw: { x: 0, y: 0 },
      smooth: { x: 0, y: 0 },
      world: { x: 0, y: 0 },
      isOnScreen: true,
    };
  }

  function bindMouseEvents(tracker) {
    document.addEventListener('mousemove', function(e) {
      tracker.raw.x = (e.clientX / window.innerWidth) * 2 - 1;
      tracker.raw.y = -(e.clientY / window.innerHeight) * 2 + 1;
      tracker.isOnScreen = true;
    });
    document.addEventListener('mouseleave', function() { tracker.isOnScreen = false; });
    document.addEventListener('mouseenter', function() { tracker.isOnScreen = true; });
    document.addEventListener('touchmove', function(e) {
      if (e.touches.length > 0) {
        tracker.raw.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        tracker.raw.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
        tracker.isOnScreen = true;
      }
    }, { passive: true });
    document.addEventListener('touchend', function() { tracker.isOnScreen = false; });
  }

  function updateMouseTracker(tracker, camera, dt) {
    var sf = C.MOUSE.smoothFactor;
    tracker.smooth.x += (tracker.raw.x - tracker.smooth.x) * sf * dt;
    tracker.smooth.y += (tracker.raw.y - tracker.smooth.y) * sf * dt;
    if (!tracker.isOnScreen) {
      tracker.smooth.x += (0 - tracker.smooth.x) * 1.5 * dt;
      tracker.smooth.y += (0 - tracker.smooth.y) * 1.5 * dt;
    }
    var world = U.screenToWorld(tracker.smooth.x, tracker.smooth.y, camera);
    tracker.world.x = world.x;
    tracker.world.y = world.y;
  }

  // --- 漩涡力场 ---
  function applyVortex(posArr, origArr, count, tracker, vortexRadius, vortexStrength, dt) {
    var mx = tracker.world.x, my = tracker.world.y;
    for (var i = 0; i < count; i++) {
      var i3 = i * 3;
      var ox = origArr[i3], oy = origArr[i3+1];
      var dx = ox - mx, dy = oy - my;
      var dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < vortexRadius && dist > 0.01) {
        var factor = Math.pow(1 - dist / vortexRadius, 2);
        var angle = Math.atan2(dy, dx);
        var newAngle = angle + vortexStrength * factor * 0.6 * dt;
        var newDist = dist + factor * 0.5 * dt;
        posArr[i3] = mx + Math.cos(newAngle) * newDist;
        posArr[i3+1] = my + Math.sin(newAngle) * newDist;
      }
    }
  }

  // --- 山峦流动 ---
  function applyMountainFlow(posArr, origArr, count, offsets, phases, time, tracker) {
    var mx = tracker.world.x, my = tracker.world.y;
    for (var i = 0; i < count; i++) {
      var i3 = i * 3;
      var ox = origArr[i3], oy = origArr[i3+1];
      var flowY = Math.sin(time * 0.35 + phases[i]) * 0.08;
      var mDist = Math.sqrt((ox-mx)*(ox-mx) + (oy-my)*(oy-my));
      if (mDist < 7) {
        flowY += Math.sin(time * 1.5 + phases[i]) * (1 - mDist/7) * 0.35;
      }
      posArr[i3+1] = oy + flowY;
      posArr[i3] = ox;
    }
  }

  // --- 加载动画 ---
  var loadStartTime = null, loadComplete = false;

  function startLoading() {
    loadStartTime = performance.now() / 1000;
    loadComplete = false;
  }

  function getLoadProgress(time) {
    if (!loadStartTime) return { eased: 1, raw: 1 };
    var elapsed = time - loadStartTime;
    var raw = Math.min(1, elapsed / C.TIMING.loadingDuration);
    var eased = U.easeOutCubic(raw);
    if (!loadComplete && raw >= 1) loadComplete = true;
    return { eased: eased, raw: raw };
  }

  function applyLoadSpread(posArr, origArr, count, progress) {
    if (progress.eased >= 1) return;
    for (var i = 0; i < count; i++) {
      var i3 = i * 3;
      var dx = origArr[i3], dy = origArr[i3+1], dz = origArr[i3+2];
      var dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
      var stagger = 0.15 + (dist / 12) * 0.85;
      var pEased = Math.max(0, Math.min(1, (progress.eased - stagger*0.4) / (1 - stagger*0.4)));
      var pSmooth = pEased < 0.01 ? 0 : U.easeOutCubic(pEased);
      posArr[i3] = dx * pSmooth;
      posArr[i3+1] = dy * pSmooth;
      posArr[i3+2] = dz * pSmooth;
    }
  }

  // --- 相机微动 ---
  function updateCameraSway(camera, tracker, dt) {
    var cam = C.CAMERA;
    var tx = tracker.smooth.x * cam.parallaxX;
    var ty = -tracker.smooth.y * cam.parallaxY + 0.5;
    camera.position.x += (tx - camera.position.x) * cam.smoothFactor * dt;
    camera.position.y += (ty - camera.position.y) * cam.smoothFactor * dt;
    camera.lookAt(0, 0, 0);
  }

  // --- Section 可见性 ---
  function observeSections() {
    var sections = document.querySelectorAll('.section');
    if (!sections.length) return;

    // 注入入场动画类（渐进增强）
    for (var i = 0; i < sections.length; i++) {
      sections[i].classList.add('animate-on-scroll');
    }

    // 立即给首屏 section 添加 visible
    function showVisible() {
      for (var i = 0; i < sections.length; i++) {
        var rect = sections[i].getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          sections[i].classList.add('visible');
        }
      }
    }
    showVisible();

    // 使用 IntersectionObserver
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      }, { threshold: 0.2 });
      sections.forEach(function(s) { observer.observe(s); });
    }
  }

  window.AZ.interactions = {
    createMouseTracker: createMouseTracker,
    bindMouseEvents: bindMouseEvents,
    updateMouseTracker: updateMouseTracker,
    applyVortex: applyVortex,
    applyMountainFlow: applyMountainFlow,
    startLoading: startLoading,
    getLoadProgress: getLoadProgress,
    applyLoadSpread: applyLoadSpread,
    updateCameraSway: updateCameraSway,
    observeSections: observeSections,
  };
})();
