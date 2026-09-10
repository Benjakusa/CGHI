// CGP — Enhanced site.js: hero carousel + nav toggle + search overlay
document.addEventListener('DOMContentLoaded', function () {

  /* ── NAV TOGGLE ─────────────────────────────────────────── */
  var toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('nav-open');
      // Close all open dropdowns when nav closes
      if (!document.body.classList.contains('nav-open')) {
        document.querySelectorAll('.dropdown-content.open').forEach(function (d) {
          d.classList.remove('open');
        });
      }
    });
  }
  document.querySelectorAll('nav.primary-nav a').forEach(function (a) {
    a.addEventListener('click', function () { document.body.classList.remove('nav-open'); });
  });
  // Close mobile nav on outside click
  document.addEventListener('click', function (e) {
    if (document.body.classList.contains('nav-open')) {
      var nav = document.querySelector('nav.primary-nav');
      var tog = document.querySelector('.nav-toggle');
      if (nav && tog && !nav.contains(e.target) && !tog.contains(e.target)) {
        document.body.classList.remove('nav-open');
      }
    }
  });

  /* ── MOBILE DROPDOWN TOGGLE ─────────────────────────────── */
  document.querySelectorAll('.dropdown .dropbtn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      // Only on mobile (nav is fixed/stacked)
      if (window.innerWidth <= 900) {
        e.stopPropagation();
        var content = btn.nextElementSibling;
        if (!content) return;
        var isOpen = content.classList.contains('open');
        // Close all other open dropdowns
        document.querySelectorAll('.dropdown-content.open').forEach(function (d) {
          d.classList.remove('open');
        });
        if (!isOpen) content.classList.add('open');
      }
    });
  });

  /* ── HERO CAROUSEL ──────────────────────────────────────── */
  var carousel = document.querySelector('.hero-carousel');
  if (!carousel) return;

  var slides = carousel.querySelectorAll('.hero-slide');
  var dots = carousel.querySelectorAll('.carousel-dot');
  var prevBtn = carousel.querySelector('.carousel-prev');
  var nextBtn = carousel.querySelector('.carousel-next');
  var current = 0;
  var total = slides.length;
  var timer = null;
  var INTERVAL = 6000;
  var paused = false;

  function goTo(n) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (n + total) % total;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAuto() {
    clearInterval(timer);
    if (!paused) timer = setInterval(next, INTERVAL);
  }

  function resetAuto() { startAuto(); }

  // Init
  goTo(0);
  startAuto();

  if (prevBtn) prevBtn.addEventListener('click', function () { prev(); resetAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { next(); resetAuto(); });

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () { goTo(i); resetAuto(); });
  });

  // Keyboard navigation
  carousel.setAttribute('tabindex', '0');
  carousel.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { prev(); resetAuto(); }
    if (e.key === 'ArrowRight') { next(); resetAuto(); }
  });

  // Pause on hover
  carousel.addEventListener('mouseenter', function () { paused = true; clearInterval(timer); });
  carousel.addEventListener('mouseleave', function () { paused = false; startAuto(); });

  // Touch / swipe
  var touchStartX = 0;
  var touchEndX = 0;
  carousel.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].clientX;
    paused = true;
    clearInterval(timer);
  }, { passive: true });
  carousel.addEventListener('touchend', function (e) {
    touchEndX = e.changedTouches[0].clientX;
    var diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) next(); else prev();
    }
    paused = false;
    startAuto();
  }, { passive: true });

  /* ── ANIMATED COUNTERS ──────────────────────────────────── */
  function animateCounter(el, target, suffix, duration) {
    var start = 0;
    var step = target / (duration / 16);
    var fn = function () {
      start += step;
      if (start >= target) { el.textContent = target + suffix; return; }
      el.textContent = Math.floor(start) + suffix;
      requestAnimationFrame(fn);
    };
    requestAnimationFrame(fn);
  }

  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var target = parseFloat(el.dataset.count);
          var suffix = el.dataset.suffix || '';
          animateCounter(el, target, suffix, 1400);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { io.observe(c); });
  }

  /* ── ACCORDION KEYBOARD ─────────────────────────────────── */
  document.querySelectorAll('.accordion-item summary').forEach(function (s) {
    s.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); s.click(); }
    });
  });

});
