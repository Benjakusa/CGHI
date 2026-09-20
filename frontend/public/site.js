// CGP — Enhanced site.js: hero carousel + nav toggle + search overlay

/* ── NAV DROPDOWNS ──────────────────────────────────────────
   The nav markup lives inside the page <header> (inline on most pages,
   the shared React <Navbar /> on others), so a single delegated listener
   covers every menu. Menus still open on hover, but they now also open and
   close on click (a11y: Enter/Space on the focused toggle, Escape closes),
   which the pure CSS :hover rule alone could not do.
   Re-binding is guarded so repeated calls never stack listeners. */
window.bindNavDropdowns = function () {
  if (window.__cgpNavDropdownsBound) return;
  window.__cgpNavDropdownsBound = true;

  function setOpen(dropdown, open) {
    if (!dropdown) return;
    var content = dropdown.querySelector('.dropdown-content');
    var btn = dropdown.querySelector('.dropbtn');
    dropdown.classList.toggle('open', open);
    // An explicit close has to beat the :hover fallback, otherwise clicking
    // the toggle twice while the pointer sits on it looks like nothing happens.
    if (open) dropdown.classList.remove('dismissed');
    else if (dropdown.matches(':hover')) dropdown.classList.add('dismissed');
    if (content) content.classList.toggle('open', open);
    if (btn) {
      btn.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
  }

  function closeAll(except) {
    document.querySelectorAll('header.site-header .dropdown.open').forEach(function (dd) {
      if (dd !== except) setOpen(dd, false);
    });
    document.querySelectorAll('header.site-header .dropdown-content.open').forEach(function (c) {
      if (c.closest('.dropdown') !== except) c.classList.remove('open');
    });
  }

  document.addEventListener('click', function (e) {
    var target = e.target;
    if (!target || !target.closest) return;

    var btn = target.closest('.dropbtn');
    if (btn && btn.closest('header.site-header')) {
      var dd = btn.closest('.dropdown');
      var willOpen = !dd.classList.contains('open');
      e.preventDefault();
      closeAll(dd);
      setOpen(dd, willOpen);
      return;
    }

    // Link inside a menu: let it navigate, then reset the menu state.
    if (target.closest('header.site-header .dropdown-content a')) {
      closeAll(null);
      return;
    }

    // Anywhere else: dismiss every open menu.
    if (!target.closest('header.site-header')) closeAll(null);
  });

  // Once the pointer leaves a menu that was closed by click, let :hover
  // control it again.
  document.addEventListener('mouseout', function (e) {
    var target = e.target;
    if (!target || !target.closest) return;
    var dd = target.closest('header.site-header .dropdown.dismissed');
    if (!dd) return;
    if (e.relatedTarget && dd.contains(e.relatedTarget)) return;
    dd.classList.remove('dismissed');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === 'Esc') closeAll(null);
  });
};

window.initSiteLogic = function () {
  window.bindNavDropdowns();

  /* ── NAV TOGGLE ─────────────────────────────────────────── */
  // React StrictMode re-runs page effects in dev, so initSiteLogic can be
  // called twice per mount: guard the bindings instead of double-toggling.
  var toggle = document.querySelector('.nav-toggle');
  if (toggle && !toggle.dataset.navBound) {
    toggle.dataset.navBound = 'true';
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
    if (a.dataset.navBound) return;
    a.dataset.navBound = 'true';
    a.addEventListener('click', function () { document.body.classList.remove('nav-open'); });
  });
  // Close mobile nav on outside click (bound once, the flag lives on <body>)
  if (!document.body.dataset.navOutsideBound) {
    document.body.dataset.navOutsideBound = 'true';
    document.addEventListener('click', function (e) {
      if (document.body.classList.contains('nav-open')) {
        var nav = document.querySelector('nav.primary-nav');
        var tog = document.querySelector('.nav-toggle');
        if (nav && tog && !nav.contains(e.target) && !tog.contains(e.target)) {
          document.body.classList.remove('nav-open');
        }
      }
    });
  }

  /* ── MOBILE DROPDOWN TOGGLE ─────────────────────────────── */
  document.querySelectorAll('.dropdown .dropbtn').forEach(function (btn) {
    if (btn.dataset.navBound) return;
    btn.dataset.navBound = 'true';
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

};

// Wire the nav dropdowns immediately (delegated, so it also covers markup
// rendered later by React and survives client-side route changes).
window.bindNavDropdowns();

// Auto-run on load
document.addEventListener('DOMContentLoaded', window.initSiteLogic);
