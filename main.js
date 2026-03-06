/* ===== Portfolio Main JavaScript ===== */
(function () {
  'use strict';

  // ===== Loading Screen =====
  const loadingScreen = document.getElementById('loadingScreen');

  function hideLoading() {
    loadingScreen.classList.add('hidden');
    document.body.style.overflow = '';
    initAllAnimations();
  }

  document.body.style.overflow = 'hidden';
  window.addEventListener('load', function () {
    setTimeout(hideLoading, 2200);
  });

  // Failsafe
  setTimeout(hideLoading, 4000);

  // ===== Cursor Glow =====
  const cursorGlow = document.getElementById('cursorGlow');
  let mouseX = 0, mouseY = 0;
  let glowX = 0, glowY = 0;

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursorGlow() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    cursorGlow.style.transform = 'translate(' + (glowX - 300) + 'px, ' + (glowY - 300) + 'px)';
    requestAnimationFrame(animateCursorGlow);
  }

  if (window.matchMedia('(hover: hover)').matches) {
    animateCursorGlow();
  }

  // ===== Neural Network Canvas =====
  function initNeuralCanvas() {
    const canvas = document.getElementById('neuralCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let nodes = [];
    let animationId;
    const isMobile = window.innerWidth < 768;
    const nodeCount = isMobile ? 40 : 80;
    const connectionDistance = isMobile ? 120 : 180;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    function createNodes() {
      nodes = [];
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.01 + Math.random() * 0.02
        });
      }
    }

    createNodes();

    function drawNetwork() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const opacity = (1 - dist / connectionDistance) * 0.15;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = 'rgba(108, 92, 231, ' + opacity + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.pulsePhase += node.pulseSpeed;
        const pulse = Math.sin(node.pulsePhase) * 0.5 + 0.5;
        const r = node.radius + pulse * 1;

        // Glow
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 4);
        gradient.addColorStop(0, 'rgba(108, 92, 231, ' + (0.3 + pulse * 0.2) + ')');
        gradient.addColorStop(1, 'rgba(108, 92, 231, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, r * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = 'rgba(162, 155, 254, ' + (0.6 + pulse * 0.4) + ')';
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fill();

        // Move
        node.x += node.vx;
        node.y += node.vy;

        // Boundary bounce
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        // Mouse interaction
        if (mouseX && mouseY) {
          const mdx = mouseX - node.x;
          const mdy = mouseY - node.y;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mDist < 200) {
            const force = (200 - mDist) / 200 * 0.02;
            node.vx += mdx * force;
            node.vy += mdy * force;
          }
        }

        // Damping
        node.vx *= 0.99;
        node.vy *= 0.99;
      }

      animationId = requestAnimationFrame(drawNetwork);
    }

    // Only run when hero is visible
    const heroSection = document.getElementById('hero');
    const canvasObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        drawNetwork();
      } else {
        cancelAnimationFrame(animationId);
      }
    }, { threshold: 0 });
    canvasObserver.observe(heroSection);
  }

  // ===== Floating Particles =====
  function initParticles() {
    const container = document.getElementById('heroParticles');
    if (!container) return;
    const count = window.innerWidth < 768 ? 15 : 30;

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      const size = Math.random() * 4 + 1;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const opacity = Math.random() * 0.3 + 0.1;
      const duration = Math.random() * 10 + 10;
      const delay = Math.random() * -20;
      const dx = (Math.random() - 0.5) * 60;
      const dy = (Math.random() - 0.5) * 60;
      const isAccent = Math.random() > 0.7;

      particle.style.cssText =
        'width:' + size + 'px;height:' + size + 'px;' +
        'left:' + x + '%;top:' + y + '%;' +
        'background:' + (isAccent ? 'rgba(162,155,254,' + opacity + ')' : 'rgba(108,92,231,' + opacity + ')') + ';' +
        '--opacity:' + opacity + ';--duration:' + duration + 's;--delay:' + delay + 's;' +
        '--dx:' + dx + ';--dy:' + dy + ';';

      container.appendChild(particle);
    }
  }

  // ===== Typing Effect =====
  function initTypingEffect() {
    var typingEl = document.getElementById('typingText');
    if (!typingEl) return;
    var phrases = [
      'Machine Learning Engineer',
      'Deep Learning Specialist',
      'Neural Networks Architect',
      'Computer Vision Expert',
      'NLP & LLM Engineer',
      'MLOps Specialist'
    ];
    var phraseIndex = 0;
    var charIndex = 0;
    var isDeleting = false;
    var typeSpeed = 80;

    function typeLoop() {
      var current = phrases[phraseIndex];

      if (isDeleting) {
        typingEl.textContent = current.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 40;
      } else {
        typingEl.textContent = current.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 80;
      }

      if (!isDeleting && charIndex === current.length) {
        isDeleting = true;
        typeSpeed = 2000;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typeSpeed = 300;
      }

      setTimeout(typeLoop, typeSpeed);
    }

    typeLoop();
  }

  // ===== Counter Animation =====
  function initCounters() {
    var counters = document.querySelectorAll('.counter');
    var observed = new Set();

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !observed.has(entry.target)) {
          observed.add(entry.target);
          animateCounter(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (counter) {
      observer.observe(counter);
    });
  }

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-target'), 10);
    var duration = 2000;
    var start = performance.now();

    function update(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(target * eased);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(update);
  }

  // ===== Skill Bars Animation =====
  function initSkillBars() {
    var bars = document.querySelectorAll('.skill-bar-fill');
    var observed = new Set();

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !observed.has(entry.target)) {
          observed.add(entry.target);
          var width = entry.target.getAttribute('data-width');
          setTimeout(function () {
            entry.target.style.width = width + '%';
          }, 200);
        }
      });
    }, { threshold: 0.3 });

    bars.forEach(function (bar) {
      observer.observe(bar);
    });
  }

  // ===== Scroll Reveal Animations =====
  function initScrollAnimations() {
    var elements = document.querySelectorAll('.animate-on-scroll');

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = parseInt(entry.target.getAttribute('data-delay') || '0', 10);
          setTimeout(function () {
            entry.target.classList.add('visible');
          }, delay);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ===== Navbar =====
  function initNavbar() {
    var navbar = document.getElementById('navbar');
    var navToggle = document.getElementById('navToggle');
    var navLinks = document.getElementById('navLinks');
    var links = document.querySelectorAll('.nav-link');

    // Scroll effect
    var lastScroll = 0;
    window.addEventListener('scroll', function () {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      lastScroll = scrollTop;
    });

    // Mobile toggle
    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close menu on link click
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });

    // Active link on scroll
    var sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', function () {
      var scrollPos = window.scrollY + 150;
      sections.forEach(function (section) {
        var top = section.offsetTop;
        var height = section.offsetHeight;
        var id = section.getAttribute('id');

        if (scrollPos >= top && scrollPos < top + height) {
          links.forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === id) {
              link.classList.add('active');
            }
          });
        }
      });
    });
  }

  // ===== Smooth Scroll =====
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        var targetId = this.getAttribute('href');
        var target = document.querySelector(targetId);
        if (target) {
          var navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10) || 80;
          var targetPos = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
          window.scrollTo({ top: targetPos, behavior: 'smooth' });
        }
      });
    });
  }

  // ===== Project Card Glow Follow =====
  function initProjectGlow() {
    document.querySelectorAll('.project-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var glow = card.querySelector('.project-glow');
        if (glow) {
          glow.style.left = (x - rect.width) + 'px';
          glow.style.top = (y - rect.height) + 'px';
        }
      });
    });
  }

  // ===== Contact Form =====
  function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var originalText = btn.querySelector('.btn-text').textContent;

      btn.querySelector('.btn-text').textContent = 'Enviando...';
      btn.disabled = true;

      var formData = new FormData(form);

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      })
        .then(function (response) {
          if (response.ok) {
            btn.querySelector('.btn-text').textContent = 'Enviado!';
            btn.style.background = 'linear-gradient(135deg, #059669, #34d399)';
            form.reset();
            setTimeout(function () {
              btn.querySelector('.btn-text').textContent = originalText;
              btn.style.background = '';
              btn.disabled = false;
            }, 3000);
          } else {
            throw new Error('Erro no envio');
          }
        })
        .catch(function () {
          btn.querySelector('.btn-text').textContent = 'Erro. Tente novamente.';
          btn.style.background = 'linear-gradient(135deg, #dc2626, #f87171)';
          setTimeout(function () {
            btn.querySelector('.btn-text').textContent = originalText;
            btn.style.background = '';
            btn.disabled = false;
          }, 3000);
        });
    });
  }

  // ===== Tilt Effect on Cards =====
  function initTiltEffect() {
    if (window.matchMedia('(hover: none)').matches) return;

    document.querySelectorAll('.project-card-inner, .skill-category, .timeline-content').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;
        var y = (e.clientY - rect.top) / rect.height;
        var tiltX = (y - 0.5) * 6;
        var tiltY = (x - 0.5) * -6;
        card.style.transform = 'perspective(800px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg) translateY(-5px)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  // ===== Magnetic Buttons =====
  function initMagneticButtons() {
    if (window.matchMedia('(hover: none)').matches) return;

    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = 'translate(' + (x * 0.15) + 'px, ' + (y * 0.15) + 'px)';
      });

      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

  // ===== Initialize Everything =====
  function initAllAnimations() {
    initNeuralCanvas();
    initParticles();
    initTypingEffect();
    initCounters();
    initSkillBars();
    initScrollAnimations();
    initNavbar();
    initSmoothScroll();
    initProjectGlow();
    initContactForm();
    initTiltEffect();
    initMagneticButtons();
  }

  // Initialize non-animation features immediately
  initNavbar();
  initSmoothScroll();

})();
