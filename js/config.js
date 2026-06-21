/* ============================================================
   config.js — 全局配置常量（命名空间: AZ.config）
   AIGHT-Zhen | 星海浩瀚 · 笔墨为舟
   ============================================================ */
window.AZ = window.AZ || {};

(function() {
  'use strict';

  // --- 设备性能检测 ---
  function detectPerformance() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = window.devicePixelRatio || 1;
    const cores = navigator.hardwareConcurrency || 4;
    const memory = navigator.deviceMemory || 4;
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const isLowEnd = cores <= 4 || memory <= 4;
    const isUltraLow = cores <= 2;

    let tier;
    if (isUltraLow || (isMobile && isLowEnd)) {
      tier = 'low';
    } else if (isMobile || (isTablet && isLowEnd) || (!isMobile && isLowEnd)) {
      tier = 'medium';
    } else {
      tier = 'high';
    }

    return { tier, isMobile, isTablet, isLowEnd, width, height, pixelRatio, cores, memory };
  }

  function getConfig(perf) {
    const configs = {
      low: {
        starCount: 800, mountainCount: 150, rippleCount: 30, maxRipples: 3,
        nebulaCount: 0, constellationAnchors: 0,
        pixelRatio: Math.min(perf.pixelRatio, 1.5), antialias: false,
        vortexRadius: 3.5, vortexStrength: 0.8,
        constellationUpdateInterval: 0, fpsTarget: 30,
      },
      medium: {
        starCount: 1500, mountainCount: 300, rippleCount: 55, maxRipples: 5,
        nebulaCount: 2, constellationAnchors: 60,
        pixelRatio: Math.min(perf.pixelRatio, 2), antialias: true,
        vortexRadius: 4.0, vortexStrength: 1.0,
        constellationUpdateInterval: 5, fpsTarget: 45,
      },
      high: {
        starCount: 2000, mountainCount: 500, rippleCount: 80, maxRipples: 6,
        nebulaCount: 3, constellationAnchors: 100,
        pixelRatio: Math.min(perf.pixelRatio, 2.5), antialias: true,
        vortexRadius: 4.5, vortexStrength: 1.2,
        constellationUpdateInterval: 3, fpsTarget: 60,
      },
    };
    return configs[perf.tier] || configs.medium;
  }

  // --- 色彩 ---
  const COLORS = {
    bg: '#060a14', silver: '#dce4f0', paleCyan: '#a0c8dd',
    darkGold: '#b8964a', vermillion: '#c84030', warmGold: '#d4a855',
  };

  const THREE_COLORS = {
    silver:     { r: 0.863, g: 0.894, b: 0.941 },
    paleCyan:   { r: 0.627, g: 0.784, b: 0.867 },
    darkGold:   { r: 0.722, g: 0.588, b: 0.290 },
    vermillion: { r: 0.784, g: 0.251, b: 0.188 },
    warmGold:   { r: 0.831, g: 0.659, b: 0.333 },
  };

  const STAR_COLOR_POOL = [
    { ...THREE_COLORS.silver, weight: 5 },
    { ...THREE_COLORS.paleCyan, weight: 3 },
    { ...THREE_COLORS.darkGold, weight: 1.5 },
    { ...THREE_COLORS.vermillion, weight: 0.5 },
  ];

  const MOUNTAIN_COLOR_POOL = [
    { ...THREE_COLORS.paleCyan, weight: 3 },
    { ...THREE_COLORS.darkGold, weight: 3 },
    { ...THREE_COLORS.vermillion, weight: 1 },
    { ...THREE_COLORS.silver, weight: 1.5 },
  ];

  const SPACE_BOX = { width: 16, height: 9, depth: 6 };

  const MOUNTAIN_RIDGES = [
    { baseY: 1.8, amp: 0.7, freq: 0.45, phase: 1.0, z: -2.5, spread: 0.30, isWave: false },
    { baseY: 1.3, amp: 0.55, freq: 0.40, phase: 2.5, z: -1.5, spread: 0.35, isWave: false },
    { baseY: 0.9, amp: 0.65, freq: 0.50, phase: 0.3, z: -0.5, spread: 0.25, isWave: false },
    { baseY: 0.5, amp: 0.50, freq: 0.35, phase: 1.8, z: 0.5, spread: 0.30, isWave: false },
    { baseY: 0.1, amp: 0.60, freq: 0.55, phase: 2.0, z: 1.5, spread: 0.28, isWave: false },
    { baseY: -2.5, amp: 0.40, freq: 0.30, phase: 0.0, z: 0.0, spread: 1.50, isWave: true },
  ];

  const TIMING = {
    loadingDuration: 2.8, rippleLifetime: 2.0,
    easterEggDuration: 5.0, easterEggFadeIn: 0.8, easterEggFadeOut: 0.8,
    keyBufferTimeout: 2000, constellationUpdateMs: 200,
  };

  const CAMERA = {
    fov: 60, near: 0.5, far: 50, z: 12,
    lookAt: { x: 0, y: 0, z: 0 },
    smoothFactor: 0.8, parallaxX: 0.6, parallaxY: 0.4,
  };

  const MOUSE = { smoothFactor: 3.5 };

  const EASTER_EGG_WORDS = [
    { word: '山海', message: '山 海 共 鸣' },
    { word: '星辰', message: '星 辰 唤 醒' },
  ];

  // --- 导出到命名空间 ---
  const ns = {
    detectPerformance, getConfig,
    COLORS, THREE_COLORS, STAR_COLOR_POOL, MOUNTAIN_COLOR_POOL,
    SPACE_BOX, MOUNTAIN_RIDGES, TIMING, CAMERA, MOUSE, EASTER_EGG_WORDS,
  };
  window.AZ.config = ns;
})();
