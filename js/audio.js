/* ============================================================
   audio.js — Web Audio API 音效（命名空间: AZ.audio）
   ============================================================ */
window.AZ = window.AZ || {};

(function() {
  'use strict';

  let audioCtx = null;

  function getCtx() {
    if (!audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch(e) {
        return null;
      }
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function playClickSound() {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 钵状音
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.25);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.5);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.start(now); osc.stop(now + 0.5);

    // 泛音
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2); gain2.connect(ctx.destination);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1320, now);
    osc2.frequency.exponentialRampToValueAtTime(660, now + 0.3);
    gain2.gain.setValueAtTime(0.025, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc2.start(now); osc2.stop(now + 0.3);
  }

  function playEasterEggSound() {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const harmonics = [523, 659, 784, 1047, 1319];

    harmonics.forEach(function(freq, i) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      const startT = now + i * 0.06;
      osc.frequency.setValueAtTime(freq, startT);
      gain.gain.setValueAtTime(0, startT);
      gain.gain.linearRampToValueAtTime(0.05, startT + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + 1.8);
      osc.start(startT); osc.stop(startT + 1.8);
    });
  }

  function playLoadCompleteSound() {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.linearRampToValueAtTime(220, now + 0.8);
    osc.frequency.linearRampToValueAtTime(165, now + 1.5);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    osc.start(now); osc.stop(now + 1.5);
  }

  window.AZ.audio = { playClickSound, playEasterEggSound, playLoadCompleteSound };
})();
