#!/usr/bin/env bash
#
# Regenerate every site icon from the organisation logo.
#
#   frontend/scripts/generate-icons.sh
#
# The favicon used to be an unrelated purple bolt inherited from the site
# template. The site icon is now the globe mark from the logo lockup: the white
# globe on the brand-blue square, cropped out of public/Assets/logo.png and
# padded to a square so it stays legible at 16px.
#
# Requirements: ImageMagick (`convert`). Run from anywhere.
#
# The output files are committed, so this only needs re-running when
# public/Assets/logo.png changes.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PUBLIC_DIR="$(dirname "$SCRIPT_DIR")"
ASSETS="$PUBLIC_DIR/Assets"
LOGO="$ASSETS/logo.png"

command -v convert >/dev/null 2>&1 || {
  echo "generate-icons: ImageMagick 'convert' not found. Install it first." >&2
  exit 1
}
[ -f "$LOGO" ] || { echo "generate-icons: missing $LOGO" >&2; exit 1; }

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# 1. The globe inside the 600x334 lockup: bounding box measured with
#    `convert logo.png -crop 215x334+0+0 +repage -fuzz 3% -trim info:` →
#    200x219 at +15+59. Re-derive it rather than hard-coding, so a logo edit
#    cannot silently produce a cropped-in-half favicon.
read -r GW GH GX GY < <(
  convert "$LOGO" -crop 215x334+0+0 +repage -fuzz 3% -trim info: |
    sed -E 's/^.* ([0-9]+)x([0-9]+)\+([0-9]+)\+([0-9]+).*$/\1 \2 \3 \4/'
)
convert "$LOGO" -crop "${GW}x${GH}+${GX}+${GY}" +repage "$WORK/globe.png"

# 2. Pad to a square on the logo's own background (#00ACEE, sampled from
#    logo.png — not the CSS brand colour, or the icon shows a visible seam).
convert "$WORK/globe.png" -background '#00acee' -gravity center -extent 300x300 \
  "$WORK/mark.png"

# 3. Raster icons referenced by index.html and site.webmanifest.
convert "$WORK/mark.png" -resize 512x512 "$ASSETS/icon-512.png"
convert "$WORK/mark.png" -resize 192x192 "$ASSETS/icon-192.png"
convert "$WORK/mark.png" -resize 180x180 "$ASSETS/icon-180.png"

# 4. Legacy multi-size .ico for browsers that ignore SVG/PNG icon links.
convert "$WORK/mark.png" -resize 48x48 \
  \( -define icon:auto-resize=48,32,16 \) "$PUBLIC_DIR/favicon.ico"

# 5. SVG favicon: an <image> carrying a small raster of the mark. Browsers
#    that read SVG favicons get a crisp vector frame; the raster is kept to
#    160px so the inline base64 payload stays ~17KB instead of ~73KB.
convert "$WORK/mark.png" -resize 160x160 "$WORK/mark160.png"
B64="$(base64 -w0 < "$WORK/mark160.png" 2>/dev/null ||
  base64 < "$WORK/mark160.png" | tr -d '\n')"
{
  printf '%s' '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300" role="img" aria-label="CGHPI">'
  printf '<title>CGHPI</title>'
  printf '<image width="300" height="300" href="data:image/png;base64,%s" xlink:href="data:image/png;base64,%s" xmlns:xlink="http://www.w3.org/1999/xlink"/></svg>' "$B64" "$B64"
} > "$PUBLIC_DIR/favicon.svg"

echo "generate-icons: wrote icon-512/icon-192/icon-180, favicon.ico, favicon.svg"
