/* ============================================================
   effects.js — JS 交互特效合集
   #1星尘光标 #3霓虹光标 #8星座连线 #11 3D倾斜 #19波纹扩散
   ============================================================ */
(function(){
'use strict';

// ============================================================
// #1 星尘拖尾光标 — Canvas 粒子轨迹
// ============================================================
(function initSparkleCursor(){
  var canvas=document.createElement('canvas');
  canvas.id='sparkleCanvas';
  document.body.appendChild(canvas);
  var ctx=canvas.getContext('2d');
  var W,H;
  var mouse={x:0,y:0,targetX:0,targetY:0};
  var particles=[];
  var MAX=40;

  function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight}
  resize();window.addEventListener('resize',resize);

  document.addEventListener('mousemove',function(e){mouse.targetX=e.clientX;mouse.targetY=e.clientY});
  document.addEventListener('touchmove',function(e){if(e.touches.length>0){mouse.targetX=e.touches[0].clientX;mouse.targetY=e.touches[0].clientY}},{passive:true});

  function spawn(){
    mouse.x+=(mouse.targetX-mouse.x)*.3;mouse.y+=(mouse.targetY-mouse.y)*.3;
    particles.push({x:mouse.x+(Math.random()-.5)*6,y:mouse.y+(Math.random()-.5)*6,
      vx:(Math.random()-.5)*1.5,vy:(Math.random()-.5)*1.5,
      life:1,decay:.015+Math.random()*.03,size:2+Math.random()*3,
      hue:190+Math.random()*30});
    if(particles.length>MAX)particles.shift();
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    for(var i=particles.length-1;i>=0;i--){
      var p=particles[i];p.x+=p.vx;p.y+=p.vy;p.life-=p.decay;
      if(p.life<=0){particles.splice(i,1);continue}
      ctx.beginPath();ctx.arc(p.x,p.y,p.size*p.life,0,Math.PI*2);
      ctx.fillStyle='hsla('+p.hue+',40%,70%,'+(p.life*.6)+')';ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  setInterval(spawn,25);
  draw();
})();

// ============================================================
// #8 星座连线 — 随机光点 + 鼠标靠近自动连线
// ============================================================
(function initConstellation(){
  var canvas=document.createElement('canvas');
  canvas.style.cssText='position:fixed;top:0;left:0;z-index:0;pointer-events:none;opacity:.5';
  document.body.appendChild(canvas);
  var ctx=canvas.getContext('2d');
  var W,H,stars=[],mx=0,my=0,COUNT=45;

  function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight}
  resize();window.addEventListener('resize',resize);
  document.addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY});

  for(var i=0;i<COUNT;i++){
    stars.push({x:Math.random()*3000,y:Math.random()*2000,r:.5+Math.random()*1.5,twinkle:Math.random()*Math.PI*2});
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    var t=performance.now()/1000;
    for(var i=0;i<stars.length;i++){
      var s=stars[i];var sx=s.x,sy=s.y;
      var alpha=.3+.15*Math.sin(t*2+s.twinkle);
      ctx.beginPath();ctx.arc(sx,sy,s.r,0,Math.PI*2);
      ctx.fillStyle='rgba(160,200,220,'+alpha+')';ctx.fill();
    }
    // 连线
    for(var j=0;j<stars.length;j++){
      var s1=stars[j];
      var d1=Math.sqrt((s1.x-mx)*(s1.x-mx)+(s1.y-my)*(s1.y-my));
      if(d1<180){
        ctx.beginPath();ctx.moveTo(s1.x,s1.y);ctx.lineTo(mx,my);
        ctx.strokeStyle='rgba(160,200,220,'+(.15*(1-d1/180))+')';ctx.lineWidth=.4;ctx.stroke();
      }
      for(var k=j+1;k<stars.length;k++){
        var s2=stars[k];
        var d2=Math.sqrt((s1.x-s2.x)*(s1.x-s2.x)+(s1.y-s2.y)*(s1.y-s2.y));
        if(d2<140){
          ctx.beginPath();ctx.moveTo(s1.x,s1.y);ctx.lineTo(s2.x,s2.y);
          ctx.strokeStyle='rgba(160,200,220,'+(.08*(1-d2/140))+')';ctx.lineWidth=.3;ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// ============================================================
// #11 3D倾斜卡片
(function initTiltCards(){
  document.querySelectorAll('.tilt-card').forEach(function(card){
    card.addEventListener('mousemove',function(e){
      var rect=card.getBoundingClientRect();
      var x=(e.clientX-rect.left)/rect.width-.5;
      var y=(e.clientY-rect.top)/rect.height-.5;
      card.style.transform='rotateY('+(x*12)+'deg) rotateX('+(-y*10)+'deg)';
    });
    card.addEventListener('mouseleave',function(){card.style.transform='rotateY(0) rotateX(0)';card.style.transition='transform .6s cubic-bezier(.22,.61,.36,1)'});
    card.addEventListener('mouseenter',function(){card.style.transition='transform .1s ease-out'});
  });
})();

// #19 波纹扩散 — 点击按钮时从点击处扩散涟漪
// ============================================================
(function initRipple(){
  document.addEventListener('click',function(e){
    var btn=e.target.closest('.btn-jump');
    if(!btn)return;
    var ring=document.createElement('div');
    ring.className='ripple-ring go';
    btn.appendChild(ring);
    ring.addEventListener('animationend',function(){ring.remove()});
  });
})();

// ============================================================
// #2 丝绸流体光标（在星尘基础上额外叠加一条流体线）
// ============================================================
(function initSilkTrail(){
  var canvas=document.createElement('canvas');
  canvas.style.cssText='position:fixed;top:0;left:0;z-index:9998;pointer-events:none;opacity:.35';
  document.body.appendChild(canvas);
  var ctx=canvas.getContext('2d');
  var W,H,trail=[],MAX_TRAIL=25;
  var mx=0,my=0;

  function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight}
  resize();window.addEventListener('resize',resize);
  document.addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY});

  function draw(){
    trail.push({x:mx,y:my,life:1});
    if(trail.length>MAX_TRAIL)trail.shift();
    for(var i=trail.length-1;i>=0;i--){trail[i].life-=.03;if(trail[i].life<=0){trail.splice(i,1);continue}}

    ctx.clearRect(0,0,W,H);
    if(trail.length<2)return requestAnimationFrame(draw);
    ctx.beginPath();ctx.moveTo(trail[0].x,trail[0].y);
    for(var j=1;j<trail.length-1;j++){
      var xc=(trail[j].x+trail[j+1].x)/2,yc=(trail[j].y+trail[j+1].y)/2;
      ctx.quadraticCurveTo(trail[j].x,trail[j].y,xc,yc);
    }
    ctx.lineTo(trail[trail.length-1].x,trail[trail.length-1].y);
    ctx.strokeStyle='rgba(140,200,220,.5)';ctx.lineWidth=2.5;ctx.lineCap='round';
    ctx.stroke();
    requestAnimationFrame(draw);
  }
  draw();
})();

// ============================================================
// #34 SVG 滤镜扭曲 — 注入到页面
// ============================================================
(function injectSVGFilters(){
  var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('style','position:absolute;width:0;height:0');
  svg.innerHTML=
    '<defs>'+
    '<filter id="liquidFilter">'+
    '<feTurbulence type="fractalNoise" baseFrequency=".015" numOctaves="2" result="noise"/>'+
    '<feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G"/>'+
    '</filter>'+
    '<filter id="liquidFilterHover">'+
    '<feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves="3" result="noise"/>'+
    '<feDisplacementMap in="SourceGraphic" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G"/>'+
    '</filter>'+
    '</defs>';
  document.body.insertBefore(svg,document.body.firstChild);
})();

// ============================================================
// #22 故障文字 — 定时触发
// ============================================================
(function initGlitchTexts(){
  setInterval(function(){
    document.querySelectorAll('.glitch-text').forEach(function(el){
      if(Math.random()<.08){el.classList.add('glitching');
        setTimeout(function(){el.classList.remove('glitching')},200+Math.random()*200)}
    });
  },3000);
})();

// ============================================================
// #30 像素消散加载
// ============================================================
(function initPixelLoader(){
  var overlay=document.createElement('div');
  overlay.style.cssText='position:fixed;inset:0;z-index:10000;background:#eaf0f4;display:flex;align-items:center;justify-content:center;transition:opacity .6s,visibility .6s';
  overlay.innerHTML='<div style="font-family:\'Noto Serif SC\',Georgia,serif;font-size:1rem;color:#4a6a80;letter-spacing:.2em;animation:pixelPulse 1.2s ease-in-out infinite">✦</div>';
  document.body.appendChild(overlay);

  var style=document.createElement('style');
  style.textContent='@keyframes pixelPulse{0%,100%{opacity:.3;transform:scale(.9)}50%{opacity:1;transform:scale(1.15)}}';
  document.head.appendChild(style);

  window.addEventListener('load',function(){
    setTimeout(function(){overlay.style.opacity='0';overlay.style.visibility='hidden';
      setTimeout(function(){overlay.remove()},700)},600);
  });
})();

// #47 火花按钮（全局函数）
window.sparkBurst = function(e){
  var btn = e.target.closest('.btn-spark'); if(!btn) return;
  for(var i=0;i<10;i++){
    var p=document.createElement('span');p.className='spark-particle';
    p.style.setProperty('--sx',(Math.random()-.5)*80+'px');
    p.style.setProperty('--sy',(Math.random()-.5)*80+'px');
    p.style.left='50%';p.style.top='50%';
    btn.appendChild(p);
    p.addEventListener('animationend',function(){p.remove()});
  }
};

console.log('%c✨ FX loaded %c| %c#1~#55',
  'color:#8ab8d0','','color:#aaa');
})();
