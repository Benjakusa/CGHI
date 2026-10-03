/**
 * Small data-fetching hooks.
 *
 * Every content section on the site pulls from the same Express API, so they
 * all share one hook that handles the loading / error / empty states and
 * re-runs when the endpoint changes. It also de-duplicates identical
 * concurrent requests, which matters on the homepage where heroes, partners
 * and insights all resolve in the same tick.
 *
 * Note: the fallback value is held in a ref rather than an effect dependency.
 * Callers naturally write `useApi('/api/jobs', [])`, which allocates a new
 * array every render — as an effect dependency that would re-trigger the
 * request on every state update and never settle.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { API_BASE } from '../context/AuthContext';

const inFlight = new Map();

async function getJson(path) {
  if (inFlight.has(path)) return inFlight.get(path);

  const promise = fetch(`${API_BASE}${path}`, { headers: { Accept: 'application/json' } })
    .then((response) => {
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      return response.json();
    })
    .finally(() => {
      inFlight.delete(path);
    });

  inFlight.set(path, promise);
  return promise;
}

/**
 * @param {string} path  API path, e.g. '/api/news'
 * @param {*} fallback    value used when the request fails or returns null
 */
export default function useApi(path, fallback = null) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nonce, setNonce] = useState(0);
  const alive = useRef(true);
  const fallbackRef = useRef(fallback);

  // Keep the ref in step with the latest fallback without making it an effect
  // dependency (see the note above about inline array literals).
  useEffect(() => {
    fallbackRef.current = fallback;
  }, [fallback]);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getJson(path)
      .then((result) => {
        if (cancelled) return;
        setData(Array.isArray(result) ? result : (result ?? fallbackRef.current));
      })
      .catch((err) => {
        if (cancelled) return;
        // The API being unreachable must never break the page: fall back to
        // the bundled content so the site still renders its real content.
        // The error is still surfaced so a page can offer a retry affordance.
        setData(fallbackRef.current);
        setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [path, nonce]);

  const retry = useCallback(() => setNonce((n) => n + 1), []);

  return { data, loading, error, retry, setData };
}
