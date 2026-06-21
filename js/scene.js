/* ============================================================
   scene.js — Three.js 场景初始化（命名空间: AZ.scene）
   ============================================================ */
window.AZ = window.AZ || {};

(function() {
  'use strict';

  const THREE = window.THREE;
  const CAMERA = window.AZ.config.CAMERA;

  function createScene(canvas, cfg) {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      CAMERA.fov, window.innerWidth / window.innerHeight, CAMERA.near, CAMERA.far
    );
    camera.position.set(0, 0.5, CAMERA.z);
    camera.lookAt(CAMERA.lookAt.x, CAMERA.lookAt.y, CAMERA.lookAt.z);

    const renderer = new THREE.WebGLRenderer({
      canvas, alpha: true, antialias: cfg.antialias,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(cfg.pixelRatio);
    renderer.setClearColor(0x000000, 0);

    window.addEventListener('resize', function() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return { scene, camera, renderer };
  }

  window.AZ.scene = { createScene };
})();
