#!/usr/bin/env bash
# Sync the private `dataanalysistemplate` repo to the public `demoanalytics` repo.
#
# Usage:
#   ./scripts/sync-to-public.sh <path-to-public-repo>
#
# Example:
#   # First, set up the public repo as a sibling directory:
#   cd ..
#   git clone git@github.com:your-username/demoanalytics.git
#   cd dataanalysistemplate
#   ./scripts/sync-to-public.sh ../demoanalytics
#
# This script:
#   1. Copies all tracked files from the private repo to the public repo
#      (excluding .git, .next, node_modules, etc.)
#   2. Commits and pushes the changes to the public repo
#
# The public repo is a mirror — it has its own git history, but the
# file contents are kept in sync with the private repo.

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <path-to-public-repo>"
  echo ""
  echo "Example:"
  echo "  $0 ../demoanalytics"
  exit 1
fi

PRIVATE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PUBLIC_DIR="$(cd "$1" && pwd)"

echo "→ Syncing private -> public repo"
echo "  Private: $PRIVATE_DIR"
echo "  Public:  $PUBLIC_DIR"
echo ""

# Verify both are git repos
if [ ! -d "$PRIVATE_DIR/.git" ]; then
  echo "✗ Private dir is not a git repo: $PRIVATE_DIR"
  exit 1
fi
if [ ! -d "$PUBLIC_DIR/.git" ]; then
  echo "✗ Public dir is not a git repo: $PUBLIC_DIR"
  exit 1
fi

# Use git archive to export only tracked files from private repo
echo "→ Exporting tracked files from private repo..."
cd "$PRIVATE_DIR"
TMP_TAR=$(mktemp /tmp/meridian-sync.XXXXXX.tar)
git archive --format=tar HEAD > "$TMP_TAR"

TMP_EXTRACT=$(mktemp -d /tmp/meridian-sync.XXXXXX)
tar -xf "$TMP_TAR" -C "$TMP_EXTRACT"
rm "$TMP_TAR"

echo "→ Files to sync (excluding .gitignore'd):"
rsync -av --delete --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='dev.log' \
  --exclude='server.log' \
  --exclude='db/' \
  --exclude='db.ts' \
  --exclude='.env' \
  --exclude='.env.local' \
  --exclude='tool-results/' \
  --exclude='skills/' \
  --exclude='tests/' \
  --exclude='.zscripts/' \
  --exclude='mini-services-dist/' \
  --exclude='next-service-dist/' \
  --exclude='api' \
  --exclude='prisma' \
  --exclude='seed.ts' \
  --exclude='cover.html' \
  --exclude='cover.pdf' \
  --exclude='body.pdf' \
  --exclude='diagram_*.html' \
  --exclude='diagram_*.png' \
  --exclude='chart_*.png' \
  --exclude='render_*.py' \
  --exclude='build_body.py' \
  --exclude='merge_final.py' \
  --exclude='download/' \
  --exclude='examples/' \
  "$TMP_EXTRACT/" "$PUBLIC_DIR/"

rm -rf "$TMP_EXTRACT"

echo ""
echo "→ Committing to public repo..."
cd "$PUBLIC_DIR"
git add -A

if git diff --cached --quiet; then
  echo "✓ No changes to sync."
  exit 0
fi

COMMIT_MSG="Sync from private dataanalysistemplate repo

Source commit: $(cd "$PRIVATE_DIR" && git rev-parse --short HEAD)
Source message: $(cd "$PRIVATE_DIR" && git log -1 --pretty=%s)
Synced at: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"

git commit -m "$COMMIT_MSG"

echo ""
echo "→ Pushing to public repo origin..."
git push origin HEAD

echo ""
echo "✓ Sync complete."
echo "  Public repo: $PUBLIC_DIR"
echo "  Latest commit: $(git rev-parse --short HEAD)"
