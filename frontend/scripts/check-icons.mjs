/**
 * Fails the build if a component uses a Bootstrap Icons class that src/icons.css
 * does not carry.
 *
 * src/icons.css is generated: the icon font is a pyftsubset of upstream
 * Bootstrap Icons containing only the glyphs this site used when it was cut, so
 * a newly used `bi-*` class has no codepoint rule and renders as an empty box.
 * Nothing about that failure is visible in review or at runtime — the button
 * just looks like it has no icon — which is how `bi-paper-plane` survived on
 * the live site: renamed to `bi-send` upstream in 1.10, still requested from a
 * 1.11 stylesheet, so two Careers buttons had silently shipped without one.
 *
 * Checking in `npm run build` means the mistake cannot reach production. The
 * fix is in the header comment of src/icons.css.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const SRC = join(root, 'src');

/** Every .bi-foo we actually declare a codepoint for. */
function declaredIcons() {
  const css = readFileSync(join(SRC, 'icons.css'), 'utf8');
  const found = new Set();
  for (const m of css.matchAll(/\.bi-([a-z0-9-]+)::before/g)) found.add(m[1]);
  return found;
}

/** Every `bi-*` token appearing in a source file. */
function usedIcons() {
  const used = new Map(); // name -> [files]
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) {
        walk(path);
        continue;
      }
      if (!/\.(jsx?|tsx?|html)$/.test(entry)) continue;
      const text = readFileSync(path, 'utf8');
      // `bi bi-name`, `bi-name`, and `className="bi-name"` all count.
      for (const m of text.matchAll(/\bbi-([a-z0-9-]+)\b/g)) {
        const name = m[1];
        if (!used.has(name)) used.set(name, new Set());
        used.get(name).add(relative(root, path));
      }
    }
  };
  walk(SRC);
  return used;
}

const declared = declaredIcons();
const used = usedIcons();
const missing = [...used.entries()]
  .filter(([name]) => !declared.has(name))
  .sort(([a], [b]) => a.localeCompare(b));

if (missing.length) {
  console.error(
    `\ncheck:icons — ${missing.length} Bootstrap Icons class${
      missing.length === 1 ? '' : 'es'
    } used in src/ but not in src/icons.css:\n`,
  );
  for (const [name, files] of missing) {
    console.error(`  bi-${name}\n    ${[...files].join('\n    ')}`);
  }
  console.error(
    '\nThe subset font has no glyph for these, so they render as blank boxes.' +
      '\nSee the header of src/icons.css for how to re-subset.\n',
  );
  process.exit(1);
}

console.log(
  `check:icons ok — ${used.size} Bootstrap Icons classes used, all present in the subset.`,
);