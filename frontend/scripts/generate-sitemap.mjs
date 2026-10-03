/**
 * Build-time sitemap generator.
 *
 * Reads the canonical base URL and the route list out of the site's own source
 * of truth (`src/config/site.js` and `src/content/navigation.js`) and writes
 * `public/sitemap.xml` plus a `robots.txt` whose absolute Sitemap URL matches.
 *
 * Why a script instead of a hand-maintained XML file: the previous approach let
 * the sitemap, the canonical base URL and the navigation drift apart, so new
 * pages were silently missing from search results. Running this before `vite
 * build` keeps all three in lockstep.
 *
 * Usage:
 *   node scripts/generate-sitemap.mjs            # uses VITE_SITE_URL or config default
 *   VITE_SITE_URL=https://example.org npm run build
 */

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

/**
 * Pull the routes out of the source files without importing them: the content
 * modules are ES modules that would need a build step (or a JSX-aware loader)
 * to evaluate here, and a regex over a small, stable data file is enough.
 * If this ever stops matching, the script fails loudly rather than emitting an
 * empty sitemap.
 */
async function routesFromNavigation() {
  const file = resolve(root, 'src/content/navigation.js');
  const source = await readFile(file, 'utf8');

  // ROUTES is the nav's own route table:
  //   { path: '/about', priority: '0.9', changefreq: 'monthly', label: 'About' }
  const block = source.match(/export const ROUTES\s*=\s*\[([\s\S]*?)\];/);
  if (!block) {
    throw new Error('Could not find the ROUTES table in src/content/navigation.js');
  }

  const routes = [];
  for (const m of block[1].matchAll(
    /path:\s*['"`]([^'"`]+)['"`][\s\S]*?priority:\s*['"`]([^'"`]*)['"`][\s\S]*?changefreq:\s*['"`]?([^'"`},]*)['"`]?/g
  )) {
    const [, path, priority, changefreq] = m;
    if (!path.startsWith('/') || path.startsWith('//') || path.includes(':')) continue;
    routes.push({
      path,
      priority: priority || '0.5',
      changefreq: changefreq || 'yearly',
    });
  }

  if (routes.length === 0) {
    throw new Error(
      'No routes found in src/content/navigation.js — refusing to write an empty sitemap.'
    );
  }
  return routes;
}

/** Slugs for the detail pages, so project and article URLs are discoverable. */
async function detailRoutes() {
  const routes = [];

  const insights = resolve(root, 'src/content/insights.js');
  if (existsSync(insights)) {
    const source = await readFile(insights, 'utf8');
    for (const m of source.matchAll(/slug:\s*['"`]([^'"`]+)['"`]/g)) {
      routes.push(`/insights/${m[1]}`);
    }
  }

  const projects = resolve(root, 'src/content/projects.js');
  if (existsSync(projects)) {
    const source = await readFile(projects, 'utf8');
    for (const m of source.matchAll(/\bslug:\s*['"`]([^'"`]+)['"`]/g)) {
      routes.push(`/projects/${m[1]}`);
    }
  }

  return [...new Set(routes)];
}

async function baseUrl() {
  const fromEnv = process.env.VITE_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, '');

  // Fall back to the site's own default so the sitemap cannot disagree with
  // the canonical URLs Seo.jsx emits.
  const config = await readFile(resolve(root, 'src/config/site.js'), 'utf8');
  const match = config.match(/DEFAULT_SITE_URL\s*=\s*['"`]([^'"`]+)['"`]/);
  if (!match) {
    throw new Error(
      'Could not determine the site URL. Set VITE_SITE_URL or add DEFAULT_SITE_URL to src/config/site.js.'
    );
  }
  return match[1].replace(/\/+$/, '');
}

function lastmod() {
  // Only the date, which is what the sitemap protocol asks for.
  return new Date().toISOString().slice(0, 10);
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Guard against baking a broken API origin into the bundle.
 *
 * Vite inlines `VITE_API_BASE_URL` at build time (shell env, then `.env`
 * files); when it is absent the app falls back to `http://localhost:4000`.
 * A production build run without the variable therefore ships a site whose
 * every API call — login, content, contact form — points at localhost.
 *
 * On Vercel (`VERCEL=1`) a missing or localhost API base fails the build;
 * anywhere else it warns loudly so local builds still work.
 */
async function checkApiBase() {
  const fromEnv = process.env.VITE_API_BASE_URL?.trim();
  let fromFile = '';
  try {
    const env = await readFile(resolve(root, '.env'), 'utf8');
    const m = env.match(/^VITE_API_BASE_URL=(.*)$/m);
    fromFile = (m?.[1] || '').trim().replace(/^["']|["']$/g, '');
  } catch {
    /* No local .env (e.g. Vercel provides the variable directly). */
  }
  // Match Vite's precedence: a variable present in the shell environment wins
  // over .env files — even when it is empty (Vite inlines the empty string,
  // which then triggers the code's localhost fallback).
  const present = 'VITE_API_BASE_URL' in process.env;
  const apiBase = present ? (fromEnv || '') : fromFile;
  const missing = !apiBase;
  const localhost = !missing && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(apiBase);
  if (!missing && !localhost) return;

  const detail = missing
    ? 'VITE_API_BASE_URL is not set — the bundle will call http://localhost:4000.'
    : `VITE_API_BASE_URL=${apiBase} — the bundle will call a local backend.`;
  const help = ' Set it in the Vercel project environment (Production and Preview).';

  if (process.env.VERCEL) {
    throw new Error(`[build] ${detail}${help}`);
  }
  console.warn(`[build] WARNING: ${detail}${help}`);
}

async function main() {
  await checkApiBase();
  const base = await baseUrl();
  const today = lastmod();
  const routes = await routesFromNavigation();
  const details = await detailRoutes();

  const entries = [
    ...routes.map((r) => ({ ...r })),
    // Detail pages are not in the nav, so they get conservative values.
    ...details.map((path) => ({ path, priority: '0.6', changefreq: 'monthly' })),
  ].filter((entry) => !entry.path.startsWith('/admin') && entry.path !== '/404');

  const urls = [...new Map(entries.map((e) => [e.path, e])).values()].map((entry) => {
    const loc = `${base}${entry.path === '/' ? '/' : entry.path}`;
    return [
      '  <url>',
      `    <loc>${xmlEscape(loc)}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      `    <changefreq>${entry.changefreq}</changefreq>`,
      `    <priority>${entry.priority}</priority>`,
      '  </url>',
    ].join('\n');
  });

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!-- Generated by scripts/generate-sitemap.mjs. Do not edit by hand. -->',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');

  await writeFile(resolve(root, 'public/sitemap.xml'), sitemap, 'utf8');

  const robots = [
    '# Generated by scripts/generate-sitemap.mjs — do not edit by hand.',
    '',
    'User-agent: *',
    'Allow: /',
    '',
    '# Admin tooling and API have no value in search results.',
    'Disallow: /admin',
    'Disallow: /api/',
    '',
    `Sitemap: ${base}/sitemap.xml`,
    '',
  ].join('\n');

  await writeFile(resolve(root, 'public/robots.txt'), robots, 'utf8');

  // index.html carries the same origin in its canonical and og:url/og:image
  // tags. Crawlers read that raw HTML before React hydrates, so a wrong origin
  // there publishes a preview host as canonical and points social cards at a
  // non-existent image.
  //
  // Rewritten by attribute rather than by replacing a placeholder token: the
  // token approach is destructive (the first build consumes it, so the second
  // build silently keeps whatever origin the first one wrote). Matching the
  // attributes makes this idempotent, so `npm run build` twice is safe.
  const htmlPath = resolve(root, 'index.html');
  const html = await readFile(htmlPath, 'utf8');
  const origins = [
    /(<link rel="canonical" href=")[^"]*(")/,
    /(<meta property="og:url" content=")[^"]*(")/,
    /(<meta property="og:image" content=")[^"]*(")/,
    /(<meta name="twitter:image" content=")[^"]*(")/,
  ];

  let rewritten = false;
  let next = html;
  for (const pattern of origins) {
    // Two captures either side of the value, plus the path suffix to restore.
    const suffix = pattern === origins[0] || pattern === origins[1] ? '/' : '/og/cgp-og-default.png';
    if (!pattern.test(next)) {
      throw new Error(`index.html no longer matches ${pattern} — canonical/og URL templating was changed by hand.`);
    }
    next = next.replace(pattern, `$1${base}${suffix}$2`);
    rewritten = true;
  }
  await writeFile(htmlPath, next, 'utf8');
  if (rewritten) {
    console.log('index.html: canonical, og:url and og:image pinned to the site URL.');
  }

  console.log(
    `sitemap.xml: ${urls.length} URLs (base ${base}) — robots.txt and index.html updated with the same origin.`
  );
}

main().catch((err) => {
  console.error(`generate-sitemap failed: ${err.message}`);
  process.exit(1);
});
