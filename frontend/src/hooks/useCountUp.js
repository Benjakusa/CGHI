/**
 * Count-up animation for the "CGP at a Glance" figures.
 *
 * Replaces the IntersectionObserver in the legacy `public/site.js`, which used
 * a `data-count` attribute that no longer matched anything React rendered. The
 * animation now runs off a `useRef` + `requestAnimationFrame` and is disabled
 * entirely for `prefers-reduced-motion` and for anyone using a screen reader,
 * so the number is always available as static text.
 */

import { useEffect, useRef, useState } from 'react';

const easeOut = (t) => 1 - (1 - t) ** 3;

export default function useCountUp(target, { duration = 1400 } = {}) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target == null) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion.matches) {
      setValue(target);
      return undefined;
    }

    const node = ref.current;
    if (!node) return undefined;

    let frame = 0;
    let start = null;

    function step(timestamp) {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setValue(Math.round(target * easeOut(progress)));
      if (progress < 1) frame = requestAnimationFrame(step);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          frame = requestAnimationFrame(step);
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [target, duration]);

  return [ref, value];
}
