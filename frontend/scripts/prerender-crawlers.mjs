/**
 * Render the production SPA into static HTML files for non-JavaScript crawlers.
 * Human visitors continue to use the unchanged React SPA; Apache selects these
 * snapshots only for crawler user agents (see public/.htaccess).
 *
 * Chrome is invoked as a local build tool, so no application dependency or
 * browser code is shipped to site visitors. The sitemap is the route source.
 */

import { existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const sitemap = await (await import('node:fs/promises')).readFile(join(dist, 'sitemap.xml'), 'utf8');
const paths = [...sitemap.matchAll(/<loc>https?:\/\/[^/]+([^<]*)<\/loc>/g)]
  .map((match) => decodeURIComponent(match[1] || '/'));
if (!paths.includes('/')) paths.unshift('/');
if (!paths.length) throw new Error('[prerender] No URLs found in dist/sitemap.xml.');

const chrome = process.env.CHROME_BIN || 'google-chrome';
const previewPort = Number(process.env.PRERENDER_PORT || 4179);
const origin = `http://127.0.0.1:${previewPort}`;
const preview = spawn(
  process.execPath,
  [join(root, 'node_modules/vite/bin/vite.js'), 'preview', '--host', '127.0.0.1', '--port', String(previewPort), '--strictPort'],
  { cwd: root, stdio: 'ignore' }
);
const scratch = mkdtempSync(join(tmpdir(), 'cghpi-prerender-'));

try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (preview.exitCode !== null) throw new Error('[prerender] Vite preview server exited early.');
    try {
      const response = await fetch(origin);
      ready = response.ok;
      if (ready) break;
    } catch { /* Wait until Vite is listening. */ }
    await delay(100);
  }
  if (!ready) throw new Error('[prerender] Could not start the local production preview.');

  const output = join(dist, 'seo-prerender');
  mkdirSync(output, { recursive: true });

  for (const path of [...new Set(paths)]) {
    const profile = join(scratch, `profile-${paths.indexOf(path)}`);
    const relative = path === '/' ? 'index.html' : `${path.replace(/^\/+|\/+$/g, '')}.html`;
    const target = join(output, relative);
    if (!target.startsWith(`${output}${sep}`)) throw new Error(`[prerender] Invalid route path: ${path}`);
    if (existsSync(target) && !process.env.PRERENDER_FORCE) {
      console.log(`[prerender] reuse ${path}`);
      continue;
    }

    const result = spawnSync(chrome, [
      '--headless', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
      '--disable-crash-reporter', '--disable-breakpad', '--disable-web-security',
      `--user-data-dir=${profile}`, '--virtual-time-budget=8000', '--timeout=15000',
      '--dump-dom', `${origin}${path}`,
    ], { encoding: 'utf8', timeout: 25000, maxBuffer: 24 * 1024 * 1024 });

    if (result.error || result.status !== 0 || !result.stdout.includes('<div id="root">')) {
      throw new Error(`[prerender] Chrome could not render ${path}: ${result.error?.message || result.stderr?.slice(-500) || `exit ${result.status}`}`);
    }

    // Static crawlers need the rendered markup and metadata, not a second SPA
    // startup that would replace it with the client loading state.
    const html = result.stdout
      .replace(/<script\b(?=[^>]*\btype="module")[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<link\b(?=[^>]*\brel="modulepreload")[^>]*>/gi, '')
      // The app's scroll reveal hides off-screen sections until they enter the
      // viewport. Static crawler HTML has no scrolling, so disable that
      // visual-only class in the crawler copy to keep all text exposed.
      .replace(/ class="js-reveal"/, '')
      // The SPA shell's no-JavaScript notice is obsolete in this rendered
      // snapshot and would appear as a duplicate heading to crawlers.
      .replace(/\s*<noscript>[\s\S]*?<\/noscript>/gi, '');
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, html, 'utf8');
    console.log(`[prerender] ${path}`);
  }

  const missing = [...new Set(paths)].filter((path) => {
    const relative = path === '/' ? 'index.html' : `${path.replace(/^\/+|\/+$/g, '')}.html`;
    return !existsSync(join(output, relative));
  });
  if (missing.length) throw new Error(`[prerender] Missing crawler snapshots: ${missing.join(', ')}`);
  console.log(`[prerender] Verified ${new Set(paths).size} crawler snapshots in dist/seo-prerender/.`);
} finally {
  preview.kill('SIGTERM');
  rmSync(scratch, { recursive: true, force: true });
}
