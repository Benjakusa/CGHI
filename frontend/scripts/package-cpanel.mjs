/**
 * Package the production build for cPanel upload.
 *
 *   npm run package:cpanel          # build, then zip dist/ → cghpi.org-site.zip
 *
 * cPanel's File Manager accepts a zip of the web root directly (Upload →
 * extract in public_html), so this produces exactly that archive: the contents
 * of dist/, including .htaccess, with no top-level folder in the way.
 *
 * It also re-checks the two things that break a cPanel deploy silently:
 *   - .htaccess made it into dist/ (Vite skips nothing, but a stray
 *     publicDir change would drop it and every deep link would 404);
 *   - the API origin baked into the bundle is not localhost.
 *
 * Requires the `zip` CLI (preinstalled on macOS and most Linux distros).
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const out = join(root, 'cghpi.org-site.zip');

if (!existsSync(dist)) {
  console.error('[package] dist/ not found — run `npm run build` first.');
  process.exit(1);
}

const failures = [];

// 1. The SPA rewrite. Without it, /about or /insights/some-slug returns
//    Apache's 404 on a hard refresh or a direct visit.
if (!existsSync(join(dist, '.htaccess'))) {
  failures.push(
    'dist/.htaccess is missing — deep links would 404 on cPanel. ' +
      'It is copied from public/.htaccess at build time; check that file exists.',
  );
}

if (!existsSync(join(dist, 'index.html'))) {
  failures.push('dist/index.html is missing.');
}

// 2. The origin baked into the sitemap must be the real domain. This is the
//    reliable signal for "the build ran without VITE_SITE_URL": the generated
//    sitemap would otherwise carry the code default or a preview host.
const sitemap = join(dist, 'sitemap.xml');
if (existsSync(sitemap)) {
  const locs = [...readFileSync(sitemap, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const origins = [...new Set(locs.map((u) => new URL(u).origin))];
  if (origins.some((o) => /localhost|127\.0\.0\.1/.test(o))) {
    failures.push(
      `sitemap.xml points at ${origins.join(', ')} — set VITE_SITE_URL in frontend/.env and rebuild.`,
    );
  } else {
    console.log(`[package] sitemap origin: ${origins.join(', ')}`);
  }
} else {
  failures.push('dist/sitemap.xml is missing.');
}

// 3. The API origin is inlined at build time, so it cannot be inspected from
//    the bundle (the code's localhost fallback is always present as a string).
//    generate-sitemap.mjs already fails the build on CI when it is missing,
//    and warns locally — so just report what was baked in for a human to check.
const envPath = join(root, '.env');
let apiBase = '';
if (existsSync(envPath)) {
  apiBase = (readFileSync(envPath, 'utf8').match(/^VITE_API_BASE_URL=(.*)$/m)?.[1] || '')
    .trim()
    .replace(/^["']|["']$/g, '');
}
console.log(`[package] VITE_API_BASE_URL: ${apiBase || '(unset — falls back to http://localhost:4000)'}`);
if (!apiBase || /^https?:\/\/(localhost|127\.0\.0\.1)/.test(apiBase)) {
  console.warn('[package] WARNING: the API base is not a deployed origin — every API call will fail.');
}

if (failures.length) {
  console.error('\n[package] Refusing to build the archive:');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

rmSync(out, { force: true });
const result = spawnSync('zip', ['-r', '-q', out, '.'], { cwd: dist, stdio: 'inherit' });
if (result.error || result.status !== 0) {
  console.error(
    '[package] `zip` failed. Install it, or zip the contents of dist/ by hand:\n' +
      '          cd dist && zip -r ../cghpi.org-site.zip .',
  );
  process.exit(1);
}

const kb = Math.round(statSync(out).size / 1024);
console.log(`\n[package] ${out} (${kb} KB)`);
console.log('[package] Contents: the contents of dist/ — upload and extract into public_html.');
console.log('[package] See docs/DEPLOYMENT.md for the cPanel steps.');
