/**
 * Render the production SPA into static HTML files for non-JavaScript crawlers.
 * Human visitors continue to use the unchanged React SPA; Apache selects these
 * snapshots only for crawler user agents (see public/.htaccess).
 *
 * Uses puppeteer-core driving the system Chrome (no bundled Chromium download).
 * For pages that render data from the API, the page marks itself with
 * data-prerender-ready="true" once data is in the DOM; we wait for that signal
 * instead of guessing with --dump-dom / --virtual-time-budget, which cannot
 * observe pending fetch() promises and hangs.
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const sitemap = await readFile(join(dist, 'sitemap.xml'), 'utf8');
const paths = [...sitemap.matchAll(/<loc>https?:\/\/[^/]+([^<]*)<\/loc>/g)]
  .map((match) => decodeURIComponent(match[1] || '/'));
if (!paths.includes('/')) paths.unshift('/');
if (!paths.length) throw new Error('[prerender] No URLs found in dist/sitemap.xml.');

const chrome = process.env.CHROME_BIN || '/usr/bin/google-chrome';
const previewPort = Number(process.env.PRERENDER_PORT || 4179);
const origin = `http://127.0.0.1:${previewPort}`;

const preview = spawn(
  process.execPath,
  [join(root, 'node_modules/vite/bin/vite.js'), 'preview', '--host', '127.0.0.1', '--port', String(previewPort), '--strictPort'],
  { cwd: root, stdio: 'ignore' }
);

let browser;
try {
  // Wait for Vite preview to accept connections.
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (preview.exitCode !== null) throw new Error('[prerender] Vite preview server exited early.');
    try {
      const response = await fetch(origin);
      ready = response.ok;
      if (ready) break;
    } catch { /* still booting */ }
    await delay(100);
  }
  if (!ready) throw new Error('[prerender] Could not start the local production preview.');

  browser = await puppeteer.launch({
    executablePath: chrome,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-crash-reporter',
      '--disable-breakpad',
      '--disable-background-networking',
      '--no-first-run',
      '--use-mock-keychain',
      '--password-store=basic',
    ],
  });

  const output = join(dist, 'seo-prerender');
  mkdirSync(output, { recursive: true });

  for (const path of [...new Set(paths)]) {
    const relative = path === '/' ? 'index.html' : `${path.replace(/^\/+|\/+$/g, '')}.html`;
    const target = join(output, relative);
    if (!target.startsWith(`${output}${sep}`)) throw new Error(`[prerender] Invalid route path: ${path}`);
    if (existsSync(target) && !process.env.PRERENDER_FORCE) {
      console.log(`[prerender] reuse ${path}`);
      continue;
    }

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(30000);
    try {
      await page.goto(`${origin}${path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });

      // If the page declares a readiness signal (data-driven pages), wait for
      // it. Otherwise give the SPA a short bounded window for React to mount
      // and any immediate fetches to resolve.
      // Career detail pages resolve the advert from the full job list, so wait
      // for the explicit loaded marker rather than a generic presence check.
      if (path.startsWith('/careers/')) {
        // The advert resolves from the full job list; wait for it but do not
        // fail the whole build if a single advert cannot be resolved.
        try {
          await page.waitForSelector('[data-career-loaded="1"]', { timeout: 15000 });
        } catch {
          console.warn(`[prerender] career advert not resolved for ${path}`);
        }
      } else {
        const hasSignal = await page.evaluate(() =>
          Boolean(document.querySelector('[data-prerender-ready]'))
        );
        if (hasSignal) {
          await page.waitForSelector('[data-prerender-ready="true"]', { timeout: 20000 });
        } else {
          await delay(1200);
        }
      }

      const html = (await page.content())
        .replace(/<script\b(?=[^>]*\btype="module")[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<link\b(?=[^>]*\brel="modulepreload")[^>]*>/gi, '')
        .replace(/ class="js-reveal"/, '')
        .replace(/\s*<noscript>[\s\S]*?<\/noscript>/gi, '');

      if (!html.includes('<div id="root">')) {
        throw new Error(`[prerender] Rendered page for ${path} has no #root.`);
      }

      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, html, 'utf8');
      console.log(`[prerender] ${path}`);
    } finally {
      await page.close();
    }
  }

  const missing = [...new Set(paths)].filter((path) => {
    const relative = path === '/' ? 'index.html' : `${path.replace(/^\/+|\/+$/g, '')}.html`;
    return !existsSync(join(output, relative));
  });
  if (missing.length) throw new Error(`[prerender] Missing crawler snapshots: ${missing.join(', ')}`);
  console.log(`[prerender] Verified ${new Set(paths).size} crawler snapshots in dist/seo-prerender/.`);
} finally {
  if (browser) await browser.close().catch(() => {});
  preview.kill('SIGTERM');
}
