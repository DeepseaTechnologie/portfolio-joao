/* ===================================================
   ETL × GEMINI AI — Interactive JavaScript
   Terminal animation, data canvas, code tabs, counters
   =================================================== */
(function () {
  'use strict';

  /* ─── Utility ─── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ─── Navbar scroll ─── */
  const navbar = $('#navbar');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ═══════════════════════════════════════
     DATA STREAM CANVAS
  ════════════════════════════════════════ */
  function initDataCanvas() {
    const canvas = $('#dataCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [], cols = [], frame = 0;

    const CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノETLGEMINIDATA>_$#'.split('');
    const COL_W = 20;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      const numCols = Math.floor(W / COL_W);
      cols = new Array(numCols).fill(0).map(() => Math.random() * -H);
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Floating orbs
    for (let i = 0; i < 8; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 120 + 60,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.03 + 0.01,
      });
    }

    function draw() {
      ctx.fillStyle = 'rgba(6, 8, 9, 0.06)';
      ctx.fillRect(0, 0, W, H);

      // Matrix rain
      ctx.font = `${COL_W - 4}px "Space Mono", monospace`;
      cols.forEach((y, i) => {
        const x = i * COL_W;
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];

        // Leading char (bright)
        ctx.fillStyle = `rgba(0, 255, 140, ${0.6 + Math.random() * 0.4})`;
        ctx.fillText(char, x, y);

        // Trail
        ctx.fillStyle = `rgba(0, 255, 140, ${0.04 + Math.random() * 0.04})`;
        ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], x, y - COL_W * 2);

        cols[i] += COL_W;
        if (cols[i] > H + 200) cols[i] = -Math.random() * H * 0.5;
      });

      // Floating orbs
      particles.forEach(p => {
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        grad.addColorStop(0, `rgba(0, 255, 140, ${p.alpha})`);
        grad.addColorStop(0.5, `rgba(0, 229, 255, ${p.alpha * 0.3})`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.vx; p.y += p.vy;
        if (p.x < -p.r) p.x = W + p.r;
        if (p.x > W + p.r) p.x = -p.r;
        if (p.y < -p.r) p.y = H + p.r;
        if (p.y > H + p.r) p.y = -p.r;
      });

      frame++;
      requestAnimationFrame(draw);
    }

    draw();
  }

  /* ═══════════════════════════════════════
     TERMINAL ANIMATION
  ════════════════════════════════════════ */
  function initTerminal() {
    const lines = [
      { id: 'tl1', delay: 400,  text: '» Iniciando pipeline ETL...', cls: 'term-info' },
      { id: 'tl2', delay: 900,  text: '✓ CSV carregado: 45 usuários encontrados', cls: 'term-success' },
      { id: 'tl3', delay: 1300, text: '⚙ Categorizando por departamento...', cls: 'term-warn' },
      { id: 'tl4', delay: 1800, text: '» [EXTRACT] Engineering: 12 | Sales: 11 | HR: 10 | IT: 12', cls: 'term-data' },
      { id: 'tl5', delay: 2300, text: '✓ Categorização completa', cls: 'term-success' },
      { id: 'tl6', delay: 2700, text: '» [TRANSFORM] Conectando à API Gemini...', cls: 'term-info' },
      { id: 'tl7', delay: 3100, text: '✓ Gemini online. Processando usuários...', cls: 'term-success' },
      { id: 'tl8', delay: 3500, text: '» [LOAD] Gerando 45 arquivos Markdown...', cls: 'term-data' },
      { id: 'tl9', delay: 4200, text: '', cls: '' },
      { id: 'tl10', delay: 4400, text: '✅ Pipeline concluído em 3m 42s — 45 arquivos gerados', cls: 'term-bright' },
    ];

    lines.forEach(({ id, delay, text, cls }) => {
      setTimeout(() => {
        const el = $(`#${id}`);
        if (!el) return;
        if (cls) el.className = `term-line ${cls} show`;
        el.textContent = text;
        el.classList.add('show');
      }, delay);
    });

    // Cursor blip
    setTimeout(() => {
      const cursor = $('#termCursor');
      if (cursor) cursor.style.display = 'none';
      setTimeout(() => {
        if (cursor) cursor.style.display = '';
      }, 800);
    }, 4600);
  }

  /* ═══════════════════════════════════════
     COUNTER ANIMATION
  ════════════════════════════════════════ */
  function initCounters() {
    const els = $$('[data-target]');
    const seen = new Set();

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting || seen.has(e.target)) return;
        seen.add(e.target);
        const target = parseInt(e.target.dataset.target, 10);
        const dur = 1600;
        const start = performance.now();
        const tick = now => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 4);
          e.target.textContent = Math.floor(target * eased);
          if (p < 1) requestAnimationFrame(tick);
          else e.target.textContent = target;
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });

    els.forEach(el => obs.observe(el));
  }

  /* ═══════════════════════════════════════
     DATA BAR ANIMATION
  ════════════════════════════════════════ */
  function initDataBars() {
    const bars = $$('.data-bar-fill, .tech-fill');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const w = e.target.dataset.w
          ? e.target.dataset.w + '%'
          : e.target.style.getPropertyValue('--width');
        e.target.style.width = w;
        obs.unobserve(e.target);
      });
    }, { threshold: 0.3 });
    bars.forEach(b => obs.observe(b));
  }

  /* ═══════════════════════════════════════
     CODE TABS
  ════════════════════════════════════════ */
  function initCodeTabs() {
    const tabs = $$('.code-tab');
    const treeSels = $$('.tree-file.selectable');

    function activateTab(panelId) {
      // tabs
      tabs.forEach(t => t.classList.toggle('active', t.dataset.panel === panelId));
      // panels
      $$('.code-panel').forEach(p => p.classList.toggle('active', p.id === `panel-${panelId}`));
      // tree
      treeSels.forEach(t => t.classList.toggle('active', t.dataset.panel === panelId));
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => activateTab(tab.dataset.panel));
    });

    treeSels.forEach(item => {
      item.addEventListener('click', () => activateTab(item.dataset.panel));
    });
  }

  /* ═══════════════════════════════════════
     COPY BUTTONS
  ════════════════════════════════════════ */
  function initCopyButtons() {
    $$('.copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.dataset.copy;
        navigator.clipboard.writeText(text).then(() => {
          btn.classList.add('copied');
          const orig = btn.innerHTML;
          btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg>`;
          setTimeout(() => {
            btn.innerHTML = orig;
            btn.classList.remove('copied');
          }, 1800);
        });
      });
    });
  }

  /* ═══════════════════════════════════════
     GEMINI TYPING EFFECT (output section)
  ════════════════════════════════════════ */
  function initGeminiTyping() {
    const el = $('#geminiTypedText');
    if (!el) return;

    const text = `Leanne Graham é o tipo de pessoa que você encontra numa sexta-feira às 17h ainda com energia pra resolver problemas. 🚀 Trabalhando na Romaguera-Crona em Gwenborough, ela transformou a engenharia num estilo de vida — não apenas uma profissão. Com um email que começa com "Sincere", fica a dica: ela leva tudo muito a sério, do primeiro commit ao último deploy do dia. ☕💻`;
    let i = 0;
    let active = false;

    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !active) {
        active = true;
        const type = () => {
          if (i < text.length) {
            el.textContent += text[i++];
            setTimeout(type, 22 + Math.random() * 18);
          }
        };
        setTimeout(type, 600);
      }
    }, { threshold: 0.5 });

    obs.observe(el);
  }

  /* ═══════════════════════════════════════
     SCROLL REVEAL
  ════════════════════════════════════════ */
  function initReveal() {
    const els = $$('[data-reveal]');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => obs.observe(el));
  }

  /* ═══════════════════════════════════════
     AUTO-ASSIGN DATA-REVEAL TO SECTIONS
  ════════════════════════════════════════ */
  function autoReveal() {
    const targets = $$('.pipe-stage, .tech-card, .step-card, .learn-card, .code-grid, .output-preview');
    targets.forEach((el, i) => {
      el.setAttribute('data-reveal', '');
      el.style.setProperty('--delay', `${(i % 4) * 0.1}s`);
    });
    initReveal();
  }

  /* ═══════════════════════════════════════
     PIPELINE STAGE HOVER GLOW
  ════════════════════════════════════════ */
  function initPipelineHover() {
    $$('.pipe-stage').forEach(stage => {
      stage.addEventListener('mousemove', e => {
        const r = stage.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        stage.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(0,255,140,0.07) 0%, var(--bg-card) 60%)`;
      });
      stage.addEventListener('mouseleave', () => {
        stage.style.background = '';
      });
    });
  }

  /* ═══════════════════════════════════════
     CURSOR CUSTOM GLOW (desktop only)
  ════════════════════════════════════════ */
  function initCursorGlow() {
    if (!window.matchMedia('(hover: hover)').matches) return;
    const glow = document.createElement('div');
    glow.style.cssText = `
      position:fixed; pointer-events:none; z-index:9999; border-radius:50%;
      width:400px; height:400px; margin:-200px 0 0 -200px;
      background: radial-gradient(circle, rgba(0,255,140,0.04) 0%, transparent 70%);
      transition: transform 0.08s linear;
      will-change: transform;
    `;
    document.body.appendChild(glow);

    let mx = 0, my = 0, gx = 0, gy = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    const move = () => {
      gx += (mx - gx) * 0.1;
      gy += (my - gy) * 0.1;
      glow.style.transform = `translate(${gx}px, ${gy}px)`;
      requestAnimationFrame(move);
    };
    move();
  }

  /* ═══════════════════════════════════════
     STATS TICKER (nav area)
  ════════════════════════════════════════ */
  function initStatsTicker() {
    const statusText = $('.status-text');
    if (!statusText) return;
    const states = [
      'pipeline: ativo',
      'gemini: online',
      'usuários: 45',
      'md files: 45',
      'status: 100%',
    ];
    let i = 0;
    setInterval(() => {
      i = (i + 1) % states.length;
      statusText.style.opacity = '0';
      setTimeout(() => {
        statusText.textContent = states[i];
        statusText.style.opacity = '1';
      }, 200);
    }, 2500);
    statusText.style.transition = 'opacity 0.2s';
  }

  /* ═══════════════════════════════════════
     BOOT SEQUENCE
  ════════════════════════════════════════ */
  function init() {
    initDataCanvas();
    initTerminal();
    initCounters();
    initDataBars();
    initCodeTabs();
    initCopyButtons();
    initGeminiTyping();
    autoReveal();
    initPipelineHover();
    initCursorGlow();
    initStatsTicker();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();