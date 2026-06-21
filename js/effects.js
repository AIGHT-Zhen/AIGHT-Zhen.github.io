/* ============================================================
   effects.js — 视觉特效（命名空间: AZ.effects）
   ============================================================ */
window.AZ = window.AZ || {};

(function() {
  'use strict';

  const THREE = window.THREE;
  const U = window.AZ.utils;
  const TIMING = window.AZ.config.TIMING;

  // --- 星云 ---
  function createNebulae(scene, count) {
    var nebulae = [];

    for (var i = 0; i < count; i++) {
      var size = U.rand(6, 14);
      var nebulaGeo = new THREE.PlaneGeometry(size, size * U.rand(0.5, 0.8));

      var nebulaColor = new THREE.Color();
      if (i % 2 === 0) nebulaColor.setHSL(0.58, 0.35, 0.3);
      else nebulaColor.setHSL(0.12, 0.4, 0.25);

      var nebulaMat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: nebulaColor },
          uOpacity: { value: 0.06 + U.rand(0.02, 0.08) },
        },
        vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: [
          'varying vec2 vUv; uniform float uTime; uniform vec3 uColor; uniform float uOpacity;',
          'void main() {',
          '  float dist = length(vUv - 0.5) * 2.0;',
          '  float alpha = smoothstep(1.0, 0.0, dist) * uOpacity;',
          '  alpha *= 0.6 + 0.4 * sin(uTime*0.3 + vUv.x*4.0) * cos(uTime*0.25 + vUv.y*3.0);',
          '  gl_FragColor = vec4(uColor, alpha);',
          '}'
        ].join('\n'),
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      });

      var nebula = new THREE.Mesh(nebulaGeo, nebulaMat);
      nebula.position.set(U.rand(-7, 7), U.rand(-4, 4), U.rand(-3, -1.5));
      nebula.rotation.z = U.rand(0, Math.PI * 2);
      nebula.userData = {
        rotSpeed: U.rand(-0.08, 0.08),
        driftX: U.rand(-0.15, 0.15),
        driftY: U.rand(-0.1, 0.1),
        baseX: nebula.position.x,
        baseY: nebula.position.y,
      };

      scene.add(nebula);
      nebulae.push(nebula);
    }
    return nebulae;
  }

  function updateNebulae(nebulae, time, mouseWorld) {
    for (var i = 0; i < nebulae.length; i++) {
      var n = nebulae[i];
      n.material.uniforms.uTime.value = time;
      n.position.x = n.userData.baseX + mouseWorld.x * 0.3;
      n.position.y = n.userData.baseY + mouseWorld.y * 0.2;
      n.rotation.z += n.userData.rotSpeed * 0.01;
    }
  }

  // --- 3D 涟漪 ---
  function createRippleParticles(origin3D, count) {
    var positions = new Float32Array(count * 3);
    var sizes = new Float32Array(count);

    var ringColor = new THREE.Color().lerpColors(
      new THREE.Color(0xa0c8dd), new THREE.Color(0xdce4f0), Math.random()
    );

    for (var i = 0; i < count; i++) {
      var angle = (i / count) * Math.PI * 2;
      positions[i*3] = origin3D.x + Math.cos(angle) * 0.03;
      positions[i*3+1] = origin3D.y + Math.sin(angle) * 0.03;
      positions[i*3+2] = origin3D.z;
      sizes[i] = 0.012 + Math.random() * 0.028;
    }

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    var mat = new THREE.PointsMaterial({
      size: 0.08, map: U.getGlowTexture(), color: ringColor,
      transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending,
    });

    var points = new THREE.Points(geo, mat);
    return {
      points: points, geometry: geo, material: mat,
      origin: { x: origin3D.x, y: origin3D.y, z: origin3D.z },
      birthTime: performance.now() / 1000, lifetime: TIMING.rippleLifetime,
      count: count, alive: true,
    };
  }

  function updateRippleParticles(rippleSystems, time, rippleGroup) {
    for (var s = rippleSystems.length - 1; s >= 0; s--) {
      var sys = rippleSystems[s];
      var age = time - sys.birthTime;

      if (age > sys.lifetime) {
        rippleGroup.remove(sys.points);
        sys.geometry.dispose();
        sys.material.dispose();
        sys.alive = false;
        rippleSystems.splice(s, 1);
        continue;
      }

      var progress = age / sys.lifetime;
      var expandR = progress * 5.5;
      sys.material.opacity = (1 - progress) * 0.7;
      sys.material.size = 0.08 * (1 - progress * 0.5);

      var rPosArr = sys.geometry.attributes.position.array;
      for (var j = 0; j < sys.count; j++) {
        var j3 = j * 3;
        var baseAngle = (j / sys.count) * Math.PI * 2;
        var spiralAngle = baseAngle + progress * 3.5;
        var r = expandR * (0.5 + 0.5 * (j / sys.count));
        rPosArr[j3] = sys.origin.x + Math.cos(spiralAngle) * r;
        rPosArr[j3+1] = sys.origin.y + Math.sin(spiralAngle) * r;
        rPosArr[j3+2] = sys.origin.z + (Math.random() - 0.5) * progress * 0.4;
      }
      sys.geometry.attributes.position.needsUpdate = true;
    }
  }

  // --- CSS 涟漪 ---
  function spawnCSSRipple(x, y) {
    var container = document.getElementById('rippleContainer');
    if (!container) return;

    var ring = document.createElement('div');
    ring.className = 'ripple-ring';
    ring.style.left = x + 'px';
    ring.style.top = y + 'px';
    container.appendChild(ring);
    ring.addEventListener('animationend', function() { ring.remove(); });

    var dot = document.createElement('div');
    dot.className = 'ripple-dot';
    dot.style.left = x + 'px';
    dot.style.top = y + 'px';
    container.appendChild(dot);
    dot.addEventListener('animationend', function() { dot.remove(); });
  }

  // --- 动态墨迹 Canvas ---
  var inkCanvas = null, inkCtx = null, inkAnimId = null, inkTime = 0;

  function drawInkSpots() {
    if (!inkCtx) return;
    var w = inkCanvas.width, h = inkCanvas.height;
    var spots = [
      { x: w*0.15, y: h*0.25, r: 120 },
      { x: w*0.78, y: h*0.65, r: 100 },
      { x: w*0.55, y: h*0.35, r: 80 },
      { x: w*0.3, y: h*0.72, r: 90 },
      { x: w*0.85, y: h*0.2, r: 70 },
    ];
    for (var i = 0; i < spots.length; i++) {
      var s = spots[i];
      var grad = inkCtx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r);
      grad.addColorStop(0, 'rgba(15,18,30,0.5)');
      grad.addColorStop(0.4, 'rgba(12,15,25,0.25)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      inkCtx.fillStyle = grad;
      inkCtx.fillRect(s.x-s.r, s.y-s.r, s.r*2, s.r*2);
    }
  }

  function animateInk() {
    if (!inkCtx || !inkCanvas) return;
    inkAnimId = requestAnimationFrame(animateInk);
    inkTime += 0.005;
    var w = inkCanvas.width, h = inkCanvas.height;
    inkCtx.clearRect(0, 0, w, h);
    drawInkSpots();

    inkCtx.globalAlpha = 0.15;
    for (var i = 0; i < 3; i++) {
      var x = w * (0.2 + 0.6 * Math.sin(inkTime*0.7 + i*2.1));
      var y = h * (0.3 + 0.4 * Math.cos(inkTime*0.5 + i*1.7));
      var r = 60 + 40 * Math.sin(inkTime + i);
      var grad = inkCtx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, 'rgba(18,22,36,0.35)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      inkCtx.fillStyle = grad;
      inkCtx.fillRect(x-r, y-r, r*2, r*2);
    }
    inkCtx.globalAlpha = 1;
  }

  function initInkCanvas() {
    inkCanvas = document.createElement('canvas');
    inkCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none;opacity:0.25;';
    document.body.appendChild(inkCanvas);

    function resize() {
      inkCanvas.width = window.innerWidth;
      inkCanvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    inkCtx = inkCanvas.getContext('2d');
    drawInkSpots();
    animateInk();
  }

  window.AZ.effects = {
    createNebulae: createNebulae,
    updateNebulae: updateNebulae,
    createRippleParticles: createRippleParticles,
    updateRippleParticles: updateRippleParticles,
    spawnCSSRipple: spawnCSSRipple,
    initInkCanvas: initInkCanvas,
  };
})();
