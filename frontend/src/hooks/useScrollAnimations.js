

import { useEffect } from 'react';

/**
 * Targets the reveal walks on every scan.
 *
 * The list is declarative and lives in one place: the animation applies
 * site-wide, so a new section only has to reuse an existing pattern (a
 * `.grid-3`, a `.section-header`, a card) to inherit the behaviour.
 *
 * Two tiers:
 *   BLOCKS - single elements that animate as one unit (headings, figures).
 *   ITEM_PARENTS - repeated containers whose children stagger by position.
 */
const BLOCKS = [
  '.section-header',
  '.page-header .wrap > *',
  '.frame-figure',
  '.cta-strip-inner',
  '.prose > *',
  '.subheading-row',
  '.privacy-section',
  '.footer-brand',
  '.footer-column',
  '.footer-bottom',
  '.section-trailing-link',
].join(', ');

const ITEM_PARENTS = [
  '.grid-3',
  '.grid-2',
  '.grid-2--center',
  '.grid-2--flush',
  '.grid-auto',
  '.grid-4',
  '.partner-grid',
  '.partner-grid--lg',
  '.stats-single-card-grid',
  '.fact-grid',
  '.areas-grid',
  '.collab-grid',
  '.discipline-grid',
  '.wwd-card-grid',
  '.mv-grid',
  '.pillar-grid',
  '.contact-info-grid',
  '.sos-grid',
  '.footer-grid',
].join(', ');

/**
 * Subtrees that must never be animated:
 *
 *   .site-header     - the nav is interactive (dropdowns, focus order); a
 *                      transform on an open panel would trap focus and offset
 *                      hit-testing.
 *   .partner-marquee - the track is transformed continuously by its own
 *                      looping animation; a reveal transform would fight it.
 *   skeletons        - placeholders that get replaced by real content.
 *   form controls    - animating an input risks a visible flash between its
 *                      focused and resting state. Forms reveal via their
 *                      container instead.
 */
const SKIP =
  '.site-header, .partner-marquee, .skeleton, .skeleton-card, .async-section, ' +
  'input, select, textarea, button, label, option, .carousel-dots';

/** Opt out for a single element, for one-off cases. */
const SKIP_SELECTOR = '[data-reveal-skip]';

/**
 * Children of the repeated containers.
 *
 * Built by mapping each parent selector individually rather than appending
 * ` > *` to the joined list: in a comma-separated selector the combinator binds
 * only to the final entry, so `'.grid-3, .grid-auto' + ' > *'` silently becomes
 * `'.grid-3, .grid-auto, .grid-auto > *'` — the leading selectors stop matching
 * children entirely, every sibling index resolves to -1 and the stagger
 * collapses to no delay at all.
 */
const ITEM_CHILDREN = ITEM_PARENTS.split(', ')
  .map((sel) => `${sel} > *`)
  .join(', ');

/** Everything the reveal system considers a candidate. */
const CANDIDATES = `${BLOCKS}, ${ITEM_CHILDREN}`;

/** Stagger step and ceiling: ~55ms apart, capped so long rows stay snappy. */
const STAGGER_MS = 55;
const STAGGER_CAP = 6;

export default function useScrollAnimations(routeKey) {
  useEffect(() => {
    const root = document.querySelector('.site-shell');
    const header = document.querySelector('.site-header');
    if (!root) return undefined;

    /* ---- Header shadow: unchanged behaviour, kept here so the hook stays the
       single place that owns scroll-driven chrome. ---- */
    const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ---- Hero parallax.

       This was the only thing in the codebase that needed GSAP: a scrubbed
       6% vertical drift on the hero photograph, tied to the hero's own
       geometry. GSAP and ScrollTrigger together were about 110KB of the build,
       downloaded and parsed on every page, to compute one linear interpolation
       that is about fifteen lines here.

       The geometry matches what ScrollTrigger was doing: `start: 'top top'` is
       the hero's top edge meeting the viewport top (rect.top === 0) and `end:
       'bottom top'` is its bottom edge meeting it (rect.top === -rect.height),
       so progress runs -rect.top / rect.height over 0..1. `yPercent: 6` is 6%
       of the image's own height.

       The shift is published as a custom property on `.hero-carousel` and
       applied by CSS, rather than written to each image's style. The slide
       images come from the API and are not in the DOM when this effect runs,
       so writing to them directly raced the fetch — the parallax silently
       never applied. A custom property on the container is picked up by
       whatever slide image appears later, and by later carousel slides.

       Reads are batched into a rAF so a fast scroll costs one layout read per
       frame rather than one per scroll event, and both listeners are passive. */
    let stopParallax = null;
    if (!reduceMotion.matches) {
      const heroes = [...document.querySelectorAll('.hero-carousel')];

      if (heroes.length) {
        const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);
        let pending = 0;

        const paint = () => {
          pending = 0;
          for (const hero of heroes) {
            const rect = hero.getBoundingClientRect();
            if (rect.height === 0) continue;
            hero.style.setProperty(
              '--hero-parallax',
              `${(clamp01(-rect.top / rect.height) * 6).toFixed(3)}%`,
            );
          }
        };

        const schedule = () => {
          if (!pending) pending = requestAnimationFrame(paint);
        };

        // Paint once up front: on a reload the hero is often already partly
        // scrolled, and a zeroed property would snap it on the first frame.
        paint();
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule, { passive: true });
        stopParallax = () => {
          if (pending) cancelAnimationFrame(pending);
          window.removeEventListener('scroll', schedule);
          window.removeEventListener('resize', schedule);
          for (const hero of heroes) hero.style.removeProperty('--hero-parallax');
        };
      }
    }

    const teardownBase = () => {
      window.removeEventListener('scroll', onScroll);
      stopParallax?.();
    };

    /* ---- Reveal setup.
       The pre-animation state lives in CSS behind a `.js-reveal` class that only
       this script sets. If JS never runs, is skipped for reduced motion, or
       throws partway through setup, the class is absent or removed and every
       element renders at its normal position — content can never be stranded
       invisible. That is why the hidden state is not written inline per
       element as it is tagged. */
    const html = document.documentElement;

    if (reduceMotion.matches || typeof IntersectionObserver === 'undefined') {
      return teardownBase;
    }

    html.classList.add('js-reveal');
    // Safety net: any uncaught error drops the whole page back to visible.
    const onError = () => html.classList.remove('js-reveal');
    window.addEventListener('error', onError, { once: true });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target); // plays once per page visit
        });
      },
      {
        // Fire slightly after the element breaks into view so the motion reads
        // as caused by the scroll rather than snapping the instant it appears.
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.01,
      }
    );

    /**
     * Tag candidates and hand them to the observer.
     *
     * `querySelectorAll` returns document order, so an ancestor is always seen
     * before its descendants. That lets the nested check below simply ask
     * whether an ancestor was already tagged, which stops a card being animated
     * inside a grid that is itself animating (doubled transform, doubled
     * offset, and the child appearing to lag twice as long).
     */
    const collect = (scope) => {
      const found = [];
      scope.querySelectorAll(BLOCKS).forEach((el) => found.push(el));
      scope.querySelectorAll(ITEM_PARENTS).forEach((parent) => {
        Array.from(parent.children).forEach((child) => found.push(child));
      });

      found.forEach((el) => {
        if (el.hasAttribute('data-reveal')) return;
        if (el.matches(SKIP) || el.closest(SKIP) || el.closest(SKIP_SELECTOR)) return;
        if (el.parentElement?.closest('[data-reveal]')) return;

        el.setAttribute('data-reveal', '');

        // Stagger only siblings that are themselves reveal targets, so a
        // non-animated child cannot consume an index and skew the timings.
        const parent = el.parentElement;
        if (parent) {
          const index = Array.prototype.indexOf.call(
            Array.from(parent.children).filter(
              (s) => s.matches(CANDIDATES) && !s.closest(SKIP)
            ),
            el
          );
          const delay = Math.min(Math.max(index, 0), STAGGER_CAP) * STAGGER_MS;
          if (delay) el.style.setProperty('--reveal-delay', `${delay}ms`);
        }

        observer.observe(el);
      });
    };

    collect(root);
/* ---- Dynamically rendered content (CMS news, resources, partners, and the
       skeleton -> card swap inside AsyncSection) animates on arrival. Debounced
       because one API response typically inserts a whole grid at once. ---- */
    let timer = 0;
    const mutation = new MutationObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => collect(root), 120);
    });
    mutation.observe(root, { childList: true, subtree: true });

    /* Honour the OS setting changing mid-visit without a reload. */
    const onMotionChange = () => {
      if (!reduceMotion.matches) return;
      root.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-revealed'));
      observer.disconnect();
      mutation.disconnect();
      html.classList.remove('js-reveal');
    };
    reduceMotion.addEventListener('change', onMotionChange);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('error', onError);
      reduceMotion.removeEventListener('change', onMotionChange);
      observer.disconnect();
      mutation.disconnect();
      html.classList.remove('js-reveal');
      teardownBase();
    };
  }, [routeKey]);
}

