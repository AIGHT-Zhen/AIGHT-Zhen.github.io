/* ============================================================
   main.js — 主入口：编排所有模块，驱动动画循环
   AIGHT-Zhen | 星海浩瀚 · 笔墨为舟
   ============================================================ */
window.AZ = window.AZ || {};

(function() {
  'use strict';

  // 检查依赖
  if (!window.THREE) { console.error('[AZ] Three.js 未加载 — 3D粒子系统无法启动，页面仍可浏览'); return; }
  if (!window.AZ.config) { console.error('[AZ] 核心模块加载失败，请检查网络连接'); return; }

  var C = window.AZ.config;
  var P = window.AZ.particles;
  var E = window.AZ.effects;
  var I = window.AZ.interactions;
  var A = {}; // audio removed
  var S = window.AZ.scene;
  var Egg = window.AZ.easterEgg;
  var THREE = window.THREE;

  function init() {
    // --- 性能检测 ---
    var perf = C.detectPerformance();
    var cfg = C.getConfig(perf);
    console.log('[AIGHT-Zhen] 性能等级: ' + perf.tier.toUpperCase() +
      ' | 粒子: ' + (cfg.starCount + cfg.mountainCount) + ' | FPS目标: ' + cfg.fpsTarget);

    // --- 获取 Canvas ---
    var canvas = document.getElementById('particle-canvas');
    if (!canvas) { console.error('未找到 #particle-canvas'); return; }

    // --- Three.js 场景 ---
    var sc = S.createScene(canvas, cfg);
    var scene = sc.scene, camera = sc.camera, renderer = sc.renderer;

    // --- 粒子系统 ---
    var stars = P.createStarParticles(cfg.starCount);
    scene.add(stars.points);

    var mountains = P.createMountainParticles(cfg.mountainCount);
    scene.add(mountains.points);

    // --- 星座连线 ---
    var constData = null;
    if (cfg.constellationAnchors > 0) {
      constData = P.createConstellations(stars, cfg.constellationAnchors);
      if (constData) scene.add(constData.lines);
    }

    // --- 星云 ---
    var nebulae = E.createNebulae(scene, cfg.nebulaCount);

    // --- 涟漪系统 ---
    var rippleGroup = new THREE.Group();
    scene.add(rippleGroup);
    var rippleSystems = [];

    // --- 鼠标追踪 ---
    var mouse = I.createMouseTracker();
    I.bindMouseEvents(mouse);

    // --- 加载动画 ---
    I.startLoading();
    var loadSoundPlayed = false;

    // --- Section 可见性 ---
    I.observeSections();

    // --- 动态墨迹 ---
    E.initInkCanvas();

    // --- 彩蛋 ---
    Egg.initEasterEgg(stars.material, function(word, message) {
      console.log('%c✨ 彩蛋触发: ' + message, 'color:#d4a855;font-size:1.1em;');
    });

    // --- 点击事件 ---
    document.addEventListener('click', function(e) {
      E.spawnCSSRipple(e.clientX, e.clientY);

      if (rippleSystems.length < cfg.maxRipples) {
        var worldPos = { x: mouse.world.x, y: mouse.world.y, z: 0 };
        var ripple = E.createRippleParticles(worldPos, cfg.rippleCount);
        rippleGroup.add(ripple.points);
        rippleSystems.push(ripple);
      }
    });

    // --- 动画循环 ---
    var frameCount = 0;
    var constUpdateFrames = constData ? constData.updateInterval : 0;

    function animate(timestamp) {
      requestAnimationFrame(animate);

      var time = timestamp / 1000;
      var dt = Math.min(0.1, time - (animate.lastTime || time));
      animate.lastTime = time;

      // 更新鼠标
      I.updateMouseTracker(mouse, camera, dt);

      // 获取位置数组
      var starPosArr = stars.geometry.attributes.position.array;
      var mtnPosArr = mountains.geometry.attributes.position.array;

      // 加载扩散
      var loadProgress = I.getLoadProgress(time);
      I.applyLoadSpread(starPosArr, stars.originalPositions, stars.count, loadProgress);
      I.applyLoadSpread(mtnPosArr, mountains.originalPositions, mountains.count, loadProgress);

      if (loadProgress.raw >= 1 && !loadSoundPlayed) {
        loadSoundPlayed = true;
      }

      // 鼠标漩涡
      if (loadProgress.eased > 0.6) {
        I.applyVortex(starPosArr, stars.originalPositions, stars.count,
          mouse, cfg.vortexRadius, cfg.vortexStrength, dt);
      }

      // 山峦流动
      I.applyMountainFlow(mtnPosArr, mountains.originalPositions, mountains.count,
        mountains.offsets, mountains.phases, time, mouse);

      if (loadProgress.eased > 0.8) {
        I.applyVortex(mtnPosArr, mountains.originalPositions, mountains.count,
          mouse, cfg.vortexRadius * 0.7, cfg.vortexStrength * 0.5, dt);
      }

      // 更新 BufferGeometry
      stars.geometry.attributes.position.needsUpdate = true;
      mountains.geometry.attributes.position.needsUpdate = true;

      // 星座连线
      frameCount++;
      if (constData && constUpdateFrames > 0 && frameCount % constUpdateFrames === 0) {
        P.updateConstellationLines(constData, starPosArr);
      }

      // Shader uniforms
      stars.material.uniforms.uTime.value = time;
      mountains.material.uniforms.uTime.value = time;

      // 星云
      E.updateNebulae(nebulae, time, mouse);

      // 涟漪
      E.updateRippleParticles(rippleSystems, time, rippleGroup);

      // 相机
      I.updateCameraSway(camera, mouse, dt);

      // 渲染
      renderer.render(scene, camera);
    }

    animate.lastTime = performance.now() / 1000;
    requestAnimationFrame(animate);

    // 控制台提示
    Egg.logEasterEggHint();
  }

  // --- 启动 ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
