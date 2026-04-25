#!/usr/bin/env bash
# Fails if the production web bundle exceeds the configured ceiling.
#
# Run after `npm run build:web:prod`. The intent is to catch unintended
# growth — not to enforce CLAUDE.md's 500 KB target, which is aspirational
# until mapbox-gl (1.7 MB / 22% of bundle) is lazy-loaded on map screens
# only. See ISSUES.md ISSUE-011 for the lazy-load plan.
#
# Override the ceiling via BUNDLE_LIMIT_BYTES env var. Defaults to 8 MB,
# slightly above the current ~7.83 MB main bundle so any new dep that
# adds noticeable weight will trip the check.

set -euo pipefail

BUNDLE_DIR="apps/mobile/dist/_expo/static/js/web"
LIMIT_BYTES="${BUNDLE_LIMIT_BYTES:-$((8 * 1024 * 1024))}"

if [ ! -d "$BUNDLE_DIR" ]; then
  echo "error: $BUNDLE_DIR not found. Run \`npm run build:web:prod\` first." >&2
  exit 1
fi

bundle="$(find "$BUNDLE_DIR" -name 'entry-*.js' -not -name '*.map' | head -1)"
if [ -z "$bundle" ]; then
  echo "error: no entry-*.js found in $BUNDLE_DIR" >&2
  exit 1
fi

if size="$(stat -f%z "$bundle" 2>/dev/null)"; then
  : # macOS/BSD
else
  size="$(stat -c%s "$bundle")" # Linux/GNU
fi

human() {
  awk -v b="$1" 'BEGIN { printf "%.2f MB", b/1024/1024 }'
}

echo "bundle: $bundle"
echo "size:   $(human "$size") ($size bytes)"
echo "limit:  $(human "$LIMIT_BYTES") ($LIMIT_BYTES bytes)"

if [ "$size" -gt "$LIMIT_BYTES" ]; then
  echo "fail: bundle exceeds limit." >&2
  exit 1
fi

echo "ok"
