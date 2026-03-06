/* ===== PROJETO ALGORITMO SOLDA — Enhanced JavaScript ===== */
(function () {
  'use strict';

  // ===== LOADING SCREEN =====
  const loadingScreen = document.getElementById('loadingScreen');

  function hideLoading() {
    if (!loadingScreen) return;
    loadingScreen.classList.add('hidden');
    document.body.style.overflow = '';
    initAll();
  }

  document.body.style.overflow = 'hidden';
  window.addEventListener('load', () => setTimeout(hideLoading, 2200));
  setTimeout(hideLoading, 4000);

  // ===== CURSOR GLOW =====
  const cursorGlow = document.getElementById('cursorGlow');
  let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  if (cursorGlow && window.matchMedia('(hover: hover)').matches) {
    (function animateCursor() {
      glowX += (mouseX - glowX) * 0.08;
      glowY += (mouseY - glowY) * 0.08;
      cursorGlow.style.transform = `translate(${glowX - 250}px, ${glowY - 250}px)`;
      requestAnimationFrame(animateCursor);
    })();
  }

  // ===== WELDING SPARKS CANVAS =====
  function initSparkCanvas() {
    const canvas = document.getElementById('sparkCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let sparks = [];
    let animId;

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function createSpark(x, y) {
      const count = 6 + Math.random() * 8;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 2.5;
        sparks.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          life: 1,
          decay: 0.015 + Math.random() * 0.025,
          size: 1 + Math.random() * 2,
          color: Math.random() > 0.6 ? '#ffe566' : (Math.random() > 0.5 ? '#00c8ff' : '#ff7b00'),
          trail: []
        });
      }
    }

    // Auto-generate sparks at arc point
    let autoTimer = 0;
    function autoSpark() {
      autoTimer++;
      if (autoTimer % 90 === 0) {
        const x = canvas.width * (0.3 + Math.random() * 0.4);
        const y = canvas.height * (0.2 + Math.random() * 0.5);
        createSpark(x, y);
      }
    }

    // Mouse interaction
    let lastSparkTime = 0;
    canvas.addEventListener('mousemove', e => {
      const now = Date.now();
      if (now - lastSparkTime < 80) return;
      lastSparkTime = now;
      const rect = canvas.getBoundingClientRect();
      createSpark(e.clientX - rect.left, e.clientY - rect.top);
    });

    function drawSparks() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      autoSpark();

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.trail.push({ x: s.x, y: s.y });
        if (s.trail.length > 5) s.trail.shift();

        // Draw trail
        for (let t = 0; t < s.trail.length - 1; t++) {
          const ta = (t / s.trail.length) * s.life * 0.4;
          ctx.beginPath();
          ctx.moveTo(s.trail[t].x, s.trail[t].y);
          ctx.lineTo(s.trail[t + 1].x, s.trail[t + 1].y);
          ctx.strokeStyle = s.color.replace(')', `, ${ta})`).replace('rgb(', 'rgba(').replace('#', '');
          // simpler alpha approach
          ctx.globalAlpha = ta;
          ctx.lineWidth = s.size * 0.5;
          ctx.stroke();
        }

        // Draw spark dot
        ctx.globalAlpha = s.life;
        const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 2);
        grd.addColorStop(0, s.color);
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Physics
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.06; // gravity
        s.vx *= 0.98;
        s.life -= s.decay;

        if (s.life <= 0 || s.y > canvas.height || s.x < 0 || s.x > canvas.width) {
          sparks.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(drawSparks);
    }

    // Only run when hero is visible
    const heroSection = document.getElementById('project-hero');
    if (heroSection) {
      const obs = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) { drawSparks(); }
        else { cancelAnimationFrame(animId); }
      }, { threshold: 0 });
      obs.observe(heroSection);
    } else {
      drawSparks();
    }
  }

  // ===== ARC DIAGRAM SVG ANIMATION =====
  function initArcDiagram() {
    const container = document.querySelector('.arc-diagram');
    if (!container) return;

    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', '0 0 360 360');
    container.appendChild(svg);

    // Central node
    const centerGroup = document.createElementNS(ns, 'g');
    const centerCircle = document.createElementNS(ns, 'circle');
    centerCircle.setAttribute('cx', '180');
    centerCircle.setAttribute('cy', '180');
    centerCircle.setAttribute('r', '32');
    centerCircle.setAttribute('fill', 'none');
    centerCircle.setAttribute('stroke', '#00c8ff');
    centerCircle.setAttribute('stroke-width', '1.5');
    centerCircle.setAttribute('opacity', '0.6');
    centerGroup.appendChild(centerCircle);

    const centerText = document.createElementNS(ns, 'text');
    centerText.setAttribute('x', '180');
    centerText.setAttribute('y', '175');
    centerText.setAttribute('text-anchor', 'middle');
    centerText.setAttribute('fill', '#00c8ff');
    centerText.setAttribute('font-size', '10');
    centerText.setAttribute('font-family', 'Share Tech Mono, monospace');
    centerText.textContent = 'WELD';
    centerGroup.appendChild(centerText);

    const centerText2 = document.createElementNS(ns, 'text');
    centerText2.setAttribute('x', '180');
    centerText2.setAttribute('y', '190');
    centerText2.setAttribute('text-anchor', 'middle');
    centerText2.setAttribute('fill', '#00c8ff');
    centerText2.setAttribute('font-size', '10');
    centerText2.setAttribute('font-family', 'Share Tech Mono, monospace');
    centerText2.textContent = 'SYS';
    centerGroup.appendChild(centerText2);
    svg.appendChild(centerGroup);

    // Satellite nodes
    const nodes = [
      { label: 'VISION',  angle: -90,  r: 100, icon: '👁' },
      { label: 'DETECT',  angle: -10,  r: 100, icon: '🔍' },
      { label: 'CLASSIFY',angle: 70,   r: 100, icon: '🏷' },
      { label: 'ROS',     angle: 150,  r: 100, icon: '🤖' },
      { label: 'SELECT',  angle: 220,  r: 100, icon: '⚙' },
    ];

    nodes.forEach((n, idx) => {
      const rad = (n.angle * Math.PI) / 180;
      const nx = 180 + n.r * Math.cos(rad);
      const ny = 180 + n.r * Math.sin(rad);

      // Line from center to node
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', '180');
      line.setAttribute('y1', '180');
      line.setAttribute('x2', nx);
      line.setAttribute('y2', ny);
      line.setAttribute('stroke', '#00c8ff');
      line.setAttribute('stroke-width', '1');
      line.setAttribute('opacity', '0.2');
      line.setAttribute('stroke-dasharray', '4 4');
      svg.appendChild(line);

      // Animate the dash offset for data-flow effect
      const dashAnim = document.createElementNS(ns, 'animateTransform');
      // use animate for stroke-dashoffset
      const animEl = document.createElementNS(ns, 'animate');
      animEl.setAttribute('attributeName', 'stroke-dashoffset');
      animEl.setAttribute('from', '0');
      animEl.setAttribute('to', '-40');
      animEl.setAttribute('dur', `${1.5 + idx * 0.3}s`);
      animEl.setAttribute('repeatCount', 'indefinite');
      line.appendChild(animEl);

      // Node circle
      const circle = document.createElementNS(ns, 'circle');
      circle.setAttribute('cx', nx);
      circle.setAttribute('cy', ny);
      circle.setAttribute('r', '22');
      circle.setAttribute('fill', 'rgba(0,200,255,0.06)');
      circle.setAttribute('stroke', '#00c8ff');
      circle.setAttribute('stroke-width', '1');
      circle.setAttribute('opacity', '0.7');
      svg.appendChild(circle);

      // Pulse animation
      const pulseAnim = document.createElementNS(ns, 'animate');
      pulseAnim.setAttribute('attributeName', 'r');
      pulseAnim.setAttribute('values', '20;24;20');
      pulseAnim.setAttribute('dur', `${2 + idx * 0.4}s`);
      pulseAnim.setAttribute('repeatCount', 'indefinite');
      circle.appendChild(pulseAnim);

      // Label
      const text = document.createElementNS(ns, 'text');
      text.setAttribute('x', nx);
      text.setAttribute('y', ny + 4);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#00ffe7');
      text.setAttribute('font-size', '7.5');
      text.setAttribute('font-family', 'Share Tech Mono, monospace');
      text.setAttribute('letter-spacing', '1');
      text.textContent = n.label;
      svg.appendChild(text);
    });

    // Outer orbit ring
    const orbit = document.createElementNS(ns, 'circle');
    orbit.setAttribute('cx', '180');
    orbit.setAttribute('cy', '180');
    orbit.setAttribute('r', '140');
    orbit.setAttribute('fill', 'none');
    orbit.setAttribute('stroke', '#00c8ff');
    orbit.setAttribute('stroke-width', '0.5');
    orbit.setAttribute('stroke-dasharray', '3 8');
    orbit.setAttribute('opacity', '0.1');
    svg.appendChild(orbit);

    // Rotating indicator dot
    const dotG = document.createElementNS(ns, 'g');
    const indicatorDot = document.createElementNS(ns, 'circle');
    indicatorDot.setAttribute('r', '4');
    indicatorDot.setAttribute('fill', '#00c8ff');
    indicatorDot.setAttribute('opacity', '0.8');
    dotG.appendChild(indicatorDot);
    svg.appendChild(dotG);

    let dotAngle = 0;
    function animateDot() {
      dotAngle += 0.01;
      const dx = 180 + 140 * Math.cos(dotAngle);
      const dy = 180 + 140 * Math.sin(dotAngle);
      indicatorDot.setAttribute('cx', dx);
      indicatorDot.setAttribute('cy', dy);
      requestAnimationFrame(animateDot);
    }
    animateDot();
  }

  // ===== SCROLL REVEAL =====
  function initScrollReveal() {
    const els = document.querySelectorAll('.animate-on-scroll');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const delay = parseInt(e.target.getAttribute('data-delay') || '0', 10);
          setTimeout(() => e.target.classList.add('visible'), delay);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => obs.observe(el));
  }

  // ===== NAVBAR =====
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const links = document.querySelectorAll('.nav-link');

    if (navbar) {
      window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.pageYOffset > 50);
      }, { passive: true });
    }

    if (navToggle && navLinks) {
      navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
      });
      links.forEach(l => l.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
      }));
    }
  }

  // ===== SMOOTH SCROLL =====
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10) || 72;
          window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - navH, behavior: 'smooth' });
        }
      });
    });
  }

  // ===== TILT EFFECT =====
  function initTilt() {
    if (window.matchMedia('(hover: none)').matches) return;
    document.querySelectorAll('.project-section, .stat-box, .arch-node, .process-card').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        const tx = (y - 0.5) * 4;
        const ty = (x - 0.5) * -4;
        el.style.transform = `perspective(600px) rotateX(${tx}deg) rotateY(${ty}deg) translateY(-3px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  // ===== MAGNETIC BUTTONS =====
  function initMagnetic() {
    if (window.matchMedia('(hover: none)').matches) return;
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  // ===== PROCESS SELECTOR =====
  function initProcessSelector() {
    const cards = document.querySelectorAll('.process-card');
    const detail = document.getElementById('processDetail');
    const processInfo = {
      smaw: { title: 'SMAW — Shielded Metal Arc Welding', desc: 'Eletrodo revestido. Ideal para soldagem de campo, manutenção e reparos. Alta versatilidade, baixo custo de equipamento.', params: 'Corrente: 60–250A | Tensão: 20–35V | Velocidade: lenta', icon: '🔥' },
      gtaw: { title: 'GTAW — Gas Tungsten Arc Welding (TIG)', desc: 'Alta precisão e acabamento superior. Usado em aços inoxidáveis, alumínio e titânio. Controle fino dos parâmetros.', params: 'Corrente: 5–300A | Gás: Argônio/Hélio | Velocidade: muito lenta', icon: '✨' },
      gmaw: { title: 'GMAW — Gas Metal Arc Welding (MIG/MAG)', desc: 'Alta produtividade. Amplamente usado em fabricação industrial e estruturas metálicas. Processo semi-automático.', params: 'Corrente: 60–500A | Tensão: 15–40V | Velocidade: rápida', icon: '⚡' },
      fcaw: { title: 'FCAW — Flux-Cored Arc Welding', desc: 'Arame tubular com fluxo interno. Excelente para soldagem externa e em posições difíceis. Alta taxa de deposição.', params: 'Corrente: 100–500A | Tensão: 22–45V | Velocidade: alta', icon: '🔧' },
    };

    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const key = card.getAttribute('data-process');
        if (detail && processInfo[key]) {
          const info = processInfo[key];
          detail.innerHTML = `
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.75rem">
              <span style="font-size:2rem">${info.icon}</span>
              <strong style="font-family:var(--font-display);font-size:1rem;letter-spacing:0.05em;text-transform:uppercase;color:var(--arc-cyan)">${info.title}</strong>
            </div>
            <p style="font-size:0.88rem;color:var(--text-secondary);line-height:1.6;margin-bottom:0.75rem">${info.desc}</p>
            <div style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-muted);padding:0.6rem 0.9rem;background:var(--bg-void);border-radius:var(--radius-sm);border:1px solid rgba(0,200,255,0.1)">${info.params}</div>
          `;
          detail.style.opacity = '0';
          requestAnimationFrame(() => {
            detail.style.transition = 'opacity 0.3s';
            detail.style.opacity = '1';
          });
        }
      });
    });

    // Auto-select first
    if (cards[0]) cards[0].click();
  }

  // ===== CODE COPY BUTTONS =====
  function initCodeCopy() {
    document.querySelectorAll('.code-copy').forEach(btn => {
      btn.addEventListener('click', () => {
        const pre = btn.closest('.code-block').querySelector('pre code');
        if (!pre) return;
        navigator.clipboard.writeText(pre.innerText).then(() => {
          const orig = btn.textContent;
          btn.textContent = '✓ COPIADO';
          btn.style.color = 'var(--arc-cyan)';
          setTimeout(() => { btn.textContent = orig; btn.style.color = ''; }, 2000);
        });
      });
    });
  }

  // ===== TYPED COUNTER FOR STATS =====
  function initStatCounters() {
    const statValues = document.querySelectorAll('.stat-box-value[data-target]');
    const observed = new Set();
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !observed.has(e.target)) {
          observed.add(e.target);
          animateValue(e.target);
        }
      });
    }, { threshold: 0.5 });
    statValues.forEach(el => obs.observe(el));
  }

  function animateValue(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1600;
    const start = performance.now();
    (function update(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.floor(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(update);
      else el.textContent = target + suffix;
    })(start);
  }

  // ===== SECTION PROGRESS INDICATOR =====
  function initSectionProgress() {
    const indicator = document.getElementById('sectionProgress');
    if (!indicator) return;
    window.addEventListener('scroll', () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct = Math.round((window.scrollY / total) * 100);
      indicator.style.width = pct + '%';
    }, { passive: true });
  }

  // ===== ARCHITECTURE SECTION HIGHLIGHT =====
  function initArchHighlight() {
    const nodes = document.querySelectorAll('.arch-node');
    nodes.forEach(node => {
      node.addEventListener('mouseenter', () => {
        nodes.forEach(n => n.style.opacity = n === node ? '1' : '0.4');
      });
      node.addEventListener('mouseleave', () => {
        nodes.forEach(n => n.style.opacity = '');
      });
    });
  }

  // ===== ROS TOPICS LIVE SIMULATION =====
  function initROSTopicsSimulator() {
    const container = document.getElementById('rosTopicsSimulator');
    if (!container) return;
    const topics = [
      '/welding/joint_detection',
      '/welding/pass_classification',
      '/welding/process_selection',
      '/welding/robot_motion_plan',
      '/camera/image_raw',
      '/welding/confidence',
    ];
    const values = [
      'JOINT_DETECTED: butt_weld',
      'PASS: root | conf: 0.97',
      'PROCESS: GTAW | V: 18.5V',
      'PLAN: interpolating...',
      'STREAM: 30fps OK',
      'CONF: 97.3%',
    ];

    let topicIdx = 0;
    function pushLog() {
      const t = topics[topicIdx % topics.length];
      const v = values[topicIdx % values.length];
      topicIdx++;
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;gap:0.75rem;font-family:var(--font-mono);font-size:0.73rem;line-height:1.5;border-bottom:1px solid rgba(0,200,255,0.05);padding:0.3rem 0;opacity:0;transition:opacity 0.3s';
      const ts = new Date().toISOString().substr(11, 8);
      row.innerHTML = `<span style="color:var(--text-muted)">[${ts}]</span><span style="color:var(--arc-blue);min-width:240px">${t}</span><span style="color:var(--arc-cyan)">${v}</span>`;
      container.appendChild(row);
      requestAnimationFrame(() => { row.style.opacity = '1'; });
      // Keep only last 8
      while (container.children.length > 8) container.removeChild(container.firstChild);
    }

    const interval = setInterval(pushLog, 1200);
    // Stop when out of view
    const obs = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) clearInterval(interval);
    });
    obs.observe(container);
  }

  // ===== INITIALIZE ALL =====
  function initAll() {
    initSparkCanvas();
    initArcDiagram();
    initScrollReveal();
    initTilt();
    initMagnetic();
    initProcessSelector();
    initCodeCopy();
    initStatCounters();
    initSectionProgress();
    initArchHighlight();
    initROSTopicsSimulator();
  }

  // Always init navbar & scroll
  initNavbar();
  initSmoothScroll();

})();