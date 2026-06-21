/* ============================================================
   particles.js — 粒子系统（命名空间: AZ.particles）
   ============================================================ */
window.AZ = window.AZ || {};

(function() {
  'use strict';

  const THREE = window.THREE;
  const cfg = window.AZ.config;
  const U = window.AZ.utils;

  // --- 公共 Shader ---
  var VERTEX_SHADER = [
    'attribute vec3 customColor;',
    'attribute float aSize;',
    'attribute float aPhase;',
    'varying vec3 vColor;',
    'varying float vAlpha;',
    'uniform float uTime;',
    'uniform float uColorShift;',
    'void main() {',
    '  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);',
    '  float dist = length(mvPosition.xyz);',
    '  gl_PointSize = aSize * (280.0 / -mvPosition.z);',
    '  gl_Position = projectionMatrix * mvPosition;',
    '  float twinkle = 0.55 + 0.45 * sin(uTime * 2.8 + aPhase);',
    '  vec3 warmGold = vec3(0.92, 0.72, 0.38);',
    '  vec3 shifted = mix(customColor, warmGold, uColorShift);',
    '  vColor = shifted * (0.6 + 0.4 * twinkle);',
    '  vAlpha = (0.5 + 0.5 * twinkle) * (1.0 - smoothstep(8.0, 15.0, dist));',
    '}'
  ].join('\n');

  var FRAGMENT_SHADER = [
    'varying vec3 vColor;',
    'varying float vAlpha;',
    'uniform sampler2D uTexture;',
    'void main() {',
    '  vec4 tex = texture2D(uTexture, gl_PointCoord);',
    '  gl_FragColor = vec4(vColor, vAlpha * tex.a);',
    '}'
  ].join('\n');

  function createShaderMaterial() {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColorShift: { value: 0 },
        uTexture: { value: U.getGlowTexture() },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }

  // --- 星辰粒子 ---
  function createStarParticles(count) {
    var positions = new Float32Array(count * 3);
    var colors = new Float32Array(count * 3);
    var sizes = new Float32Array(count);
    var phases = new Float32Array(count);
    var originalPositions = new Float32Array(count * 3);

    var bw = cfg.SPACE_BOX.width, bh = cfg.SPACE_BOX.height, bd = cfg.SPACE_BOX.depth;

    for (var i = 0; i < count; i++) {
      var i3 = i * 3;
      var x = (Math.random() - 0.5) * bw;
      var y = (Math.random() - 0.5) * bh;
      var z = (Math.random() - 0.5) * bd;

      positions[i3] = x; positions[i3+1] = y; positions[i3+2] = z;
      originalPositions[i3] = x; originalPositions[i3+1] = y; originalPositions[i3+2] = z;

      var c = U.weightedColor(cfg.STAR_COLOR_POOL);
      colors[i3] = c.r; colors[i3+1] = c.g; colors[i3+2] = c.b;

      sizes[i] = U.rand(0.02, 0.09);
      if (Math.random() < 0.12) sizes[i] = U.rand(0.09, 0.16);
      if (Math.random() < 0.04) sizes[i] = U.rand(0.16, 0.25);

      phases[i] = Math.random() * Math.PI * 2;
    }

    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

    var material = createShaderMaterial();
    var points = new THREE.Points(geometry, material);

    return { points: points, geometry: geometry, material: material,
      originalPositions: originalPositions, count: count, sizes: sizes, phases: phases };
  }

  // --- 山峦粒子 ---
  function createMountainParticles(totalCount) {
    var positions = new Float32Array(totalCount * 3);
    var colorsArr = new Float32Array(totalCount * 3);
    var sizes = new Float32Array(totalCount);
    var phases = new Float32Array(totalCount);
    var originalPositions = new Float32Array(totalCount * 3);
    var offsets = new Float32Array(totalCount);

    var ridges = cfg.MOUNTAIN_RIDGES;
    var ridgeCount = ridges.length;
    var basePerRidge = Math.floor(totalCount / ridgeCount);
    var idx = 0;
    var bw = cfg.SPACE_BOX.width;

    for (var r = 0; r < ridgeCount; r++) {
      var ridge = ridges[r];
      var isLast = r === ridgeCount - 1;
      var count = isLast ? totalCount - idx : basePerRidge;

      for (var j = 0; j < count && idx < totalCount; j++) {
        var i3 = idx * 3;
        var t = (j / Math.max(count - 1, 1)) * bw - bw / 2;
        var yOff = ridge.isWave ? (Math.random() - 0.5) * ridge.spread * 3.5 : (Math.random() - 0.5) * ridge.spread;
        var x = t + U.rand(-0.4, 0.4);
        var y = ridge.baseY + ridge.amp * Math.sin(ridge.freq * t + ridge.phase) + yOff;
        var z = ridge.z + U.rand(-0.5, 0.5) * ridge.spread;

        positions[i3] = x; positions[i3+1] = y; positions[i3+2] = z;
        originalPositions[i3] = x; originalPositions[i3+1] = y; originalPositions[i3+2] = z;
        offsets[idx] = t;

        var c = U.weightedColor(cfg.MOUNTAIN_COLOR_POOL);
        colorsArr[i3] = c.r; colorsArr[i3+1] = c.g; colorsArr[i3+2] = c.b;

        sizes[idx] = U.rand(0.018, 0.055);
        phases[idx] = Math.random() * Math.PI * 2;
        idx++;
      }
    }

    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('customColor', new THREE.BufferAttribute(colorsArr, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

    var material = createShaderMaterial();
    var points = new THREE.Points(geometry, material);

    return { points: points, geometry: geometry, material: material,
      originalPositions: originalPositions, count: idx, offsets: offsets, phases: phases };
  }

  // --- 星座连线 ---
  function createConstellations(starData, anchorCount) {
    if (anchorCount === 0) return null;

    var origPos = starData.originalPositions;
    var sizes = starData.sizes;
    var count = starData.count;
    var maxDist = 3.2;

    // 选取最亮星
    var indexed = [];
    for (var i = 0; i < count; i++) indexed.push({ index: i, size: sizes[i] });
    indexed.sort(function(a, b) { return b.size - a.size; });
    var anchors = indexed.slice(0, Math.min(anchorCount, count)).map(function(x) { return x.index; });

    // 预计算连接
    var connections = [];
    for (var ai = 0; ai < anchors.length; ai++) {
      var a = anchors[ai];
      var a3 = a * 3;
      var ax = origPos[a3], ay = origPos[a3+1], az = origPos[a3+2];
      var neighbors = [];

      for (var aj = ai + 1; aj < anchors.length; aj++) {
        var b = anchors[aj];
        var b3 = b * 3;
        var dx = ax - origPos[b3], dy = ay - origPos[b3+1], dz = az - origPos[b3+2];
        var dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (dist < maxDist) neighbors.push({ index: b, dist: dist });
      }

      neighbors.sort(function(x, y) { return x.dist - y.dist; });
      for (var k = 0; k < Math.min(3, neighbors.length); k++) {
        connections.push([a, neighbors[k].index]);
      }
    }

    // 创建线段
    var lineCount = connections.length;
    var linePositions = new Float32Array(lineCount * 6);
    for (var l = 0; l < lineCount; l++) {
      var ca = connections[l][0], cb = connections[l][1];
      var la3 = ca * 3, lb3 = cb * 3, l6 = l * 6;
      linePositions[l6] = origPos[la3];
      linePositions[l6+1] = origPos[la3+1];
      linePositions[l6+2] = origPos[la3+2];
      linePositions[l6+3] = origPos[lb3];
      linePositions[l6+4] = origPos[lb3+1];
      linePositions[l6+5] = origPos[lb3+2];
    }

    var lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    var lineMat = new THREE.LineBasicMaterial({
      color: 0x334466, transparent: true, opacity: 0.18,
      depthWrite: false, blending: THREE.AdditiveBlending,
    });
    var lines = new THREE.LineSegments(lineGeo, lineMat);

    var constUpdateFrames = cfg.TIMING.constellationUpdateMs / 16;
    return { lines: lines, geometry: lineGeo, material: lineMat,
      anchors: anchors, connections: connections, updateInterval: constUpdateFrames };
  }

  function updateConstellationLines(constData, currentPositions) {
    if (!constData) return;
    var posArr = constData.geometry.attributes.position.array;
    var connections = constData.connections;

    for (var l = 0; l < connections.length; l++) {
      var a = connections[l][0], b = connections[l][1];
      var a3 = a * 3, b3 = b * 3, l6 = l * 6;
      posArr[l6] = currentPositions[a3];
      posArr[l6+1] = currentPositions[a3+1];
      posArr[l6+2] = currentPositions[a3+2];
      posArr[l6+3] = currentPositions[b3];
      posArr[l6+4] = currentPositions[b3+1];
      posArr[l6+5] = currentPositions[b3+2];
    }
    constData.geometry.attributes.position.needsUpdate = true;
    var opacity = 0.12 + 0.06 * Math.sin(performance.now() / 1000 * 0.5);
    constData.material.opacity = opacity;
  }

  window.AZ.particles = {
    createStarParticles: createStarParticles,
    createMountainParticles: createMountainParticles,
    createConstellations: createConstellations,
    updateConstellationLines: updateConstellationLines,
  };
})();
