

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const BLOCKS = '.section-header, .page-header .wrap > *, .frame-figure, .cta-strip-inner, .prose > *';
const GRID_ITEMS =
  ':is(.grid-auto, .grid-3, .grid-2, .partner-grid, .stats-single-card-grid, .fact-grid) > *';

export default function useScrollAnimations(routeKey) {
  useEffect(() => {
    const main = document.getElementById('main-content');
    if (!main) return undefined;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const header = document.querySelector('.site-header');
    const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (reduce.matches) {
      return () => window.removeEventListener('scroll', onScroll);
    }

    const ctx = gsap.context(() => {
      const reveal = (el, delay = 0) => {
        if (el.dataset.revealed) return;
        el.dataset.revealed = '1';
        gsap.from(el, {
          autoAlpha: 0,
          y: 20,
          duration: 0.7,
          delay,
          ease: 'power2.out',
          clearProps: 'transform,opacity,visibility',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        });
      };

      const scan = () => {
        main.querySelectorAll(BLOCKS).forEach((el) => reveal(el));
        main.querySelectorAll(GRID_ITEMS).forEach((el) => {
          const index = Array.prototype.indexOf.call(el.parentElement.children, el);
          reveal(el, Math.min(index, 8) * 0.125);
        });
        ScrollTrigger.refresh();
      };

      scan();

      main.querySelectorAll('.hero-carousel').forEach((hero) => {
        gsap.to(hero.querySelectorAll('.hero-slide-img'), {
          yPercent: 6,
          ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
        });
      });

      let timer;
      const observer = new MutationObserver(() => {
        window.clearTimeout(timer);
        timer = window.setTimeout(scan, 120);
      });
      observer.observe(main, { childList: true, subtree: true });

      return () => {
        window.clearTimeout(timer);
        observer.disconnect();
      };
    }, main);

    return () => {
      window.removeEventListener('scroll', onScroll);
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [routeKey]);
}
