/* ============================================================
   utils.js — 工具函数（命名空间: AZ.utils）
   AIGHT-Zhen | 星海浩瀚 · 笔墨为舟
   ============================================================ */
window.AZ = window.AZ || {};

(function() {
  'use strict';

  if (!window.THREE) {
    console.warn('[AZ] Three.js 未加载，utils.js 降级');
    window.AZ.utils = { getGlowTexture: function() { return null; } };
    return;
  }
  const THREE = window.THREE;

  // --- 数学 ---
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInOutCubic(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2; }
  function smoothstep(edge0, edge1, x) {
    const t = clamp((x-edge0)/(edge1-edge0), 0, 1);
    return t*t*(3-2*t);
  }
  function rand(min, max) { return min + Math.random()*(max-min); }
  function randInt(min, max) { return Math.floor(rand(min, max+1)); }

  // --- 加权随机颜色 ---
  function weightedColor(pool) {
    const total = pool.reduce((s, c) => s + c.weight, 0);
    let r = Math.random() * total;
    for (const entry of pool) {
      r -= entry.weight;
      if (r <= 0) return new THREE.Color(entry.r, entry.g, entry.b);
    }
    return new THREE.Color(pool[0].r, pool[0].g, pool[0].b);
  }

  // --- 发光纹理 ---
  let _glowTexture = null;
  function getGlowTexture() {
    if (_glowTexture) return _glowTexture;
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    const half = size / 2;
    const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.06, 'rgba(255,255,255,0.92)');
    grad.addColorStop(0.15, 'rgba(255,255,255,0.6)');
    grad.addColorStop(0.4, 'rgba(255,255,255,0.15)');
    grad.addColorStop(0.7, 'rgba(255,255,255,0.02)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    _glowTexture = new THREE.CanvasTexture(canvas);
    _glowTexture.needsUpdate = true;
    return _glowTexture;
  }

  // --- 屏幕→世界坐标 ---
  function screenToWorld(screenX, screenY, camera) {
    const hFov = camera.fov * Math.PI / 180;
    const worldH = Math.tan(hFov/2) * camera.position.z * 2;
    const worldW = worldH * camera.aspect;
    return { x: screenX * worldW/2, y: screenY * worldH/2 };
  }

  // --- 性能监控 ---
  class PerfMonitor {
    constructor() {
      this.fps = 0; this.frames = 0;
      this.lastTime = performance.now(); this.el = null;
    }
    update(timestamp) {
      this.frames++;
      if (timestamp - this.lastTime >= 1000) {
        this.fps = Math.round(this.frames / ((timestamp-this.lastTime)/1000));
        this.frames = 0; this.lastTime = timestamp;
        if (this.el) this.el.textContent = 'FPS: ' + this.fps;
      }
    }
    mount() {
      this.el = document.createElement('div');
      this.el.className = 'perf-monitor';
      document.body.appendChild(this.el);
    }
    unmount() { if (this.el) { this.el.remove(); this.el = null; } }
  }

  window.AZ.utils = {
    lerp, clamp, easeOutCubic, easeInOutCubic, smoothstep,
    rand, randInt, weightedColor, getGlowTexture, screenToWorld, PerfMonitor,
  };
})();
