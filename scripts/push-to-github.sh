#!/usr/bin/env bash
# Push both MERIDIAN repos to GitHub.
#
# Usage:
#   ./scripts/push-to-github.sh <github-username> <gh-token-or-ssh-key-path>
#
# Examples:
#   # With a Personal Access Token:
#   ./scripts/push-to-github.sh testdemoqwenai2025-creator ghp_xxxxxxxxxxxx
#
#   # With SSH (default key path):
#   ./scripts/push-to-github.sh testdemoqwenai2025-creator ssh
#
# Creates two repos:
#   - <username>/dataanalysistemplate (PRIVATE)  — full source code
#   - <username>/demoanalytics        (PUBLIC)   — static preview mirror
#
# Then pushes both and enables GitHub Pages on the public repo.

set -euo pipefail

if [ $# -lt 2 ]; then
  echo "Usage: $0 <github-username> <gh-token-or-ssh>"
  echo ""
  echo "Examples:"
  echo "  $0 testdemoqwenai2025-creator ghp_xxxxxxxxxxxx   # with PAT"
  echo "  $0 testdemoqwenai2025-creator ssh                 # with SSH key"
  exit 1
fi

USERNAME="$1"
AUTH_METHOD="$2"  # 'ssh' or 'ghp_XXXX'
PRIVATE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PUBLIC_DIR="$(cd "$PRIVATE_DIR/../demoanalytics" 2>/dev/null && pwd || echo "")"

echo "→ Pushing MERIDIAN repos to GitHub"
echo "  Username:    $USERNAME"
echo "  Auth method: $([ "$AUTH_METHOD" = "ssh" ] && echo "SSH key" || echo "Personal Access Token")"
echo "  Private:     $PRIVATE_DIR"
echo "  Public:      $PUBLIC_DIR"
echo ""

if [ "$AUTH_METHOD" = "ssh" ]; then
  PRIVATE_REMOTE="git@github.com:$USERNAME/dataanalysistemplate.git"
  PUBLIC_REMOTE="git@github.com:$USERNAME/demoanalytics.git"
  AUTH_FLAG=""
else
  # PAT: embed in URL
  PRIVATE_REMOTE="https://$AUTH_METHOD@github.com/$USERNAME/dataanalysistemplate.git"
  PUBLIC_REMOTE="https://$AUTH_METHOD@github.com/$USERNAME/demoanalytics.git"
  AUTH_FLAG="-c credential.helper="
fi

# 1. Create repos via GitHub API (only works with PAT)
if [ "$AUTH_METHOD" != "ssh" ]; then
  echo "→ Creating private repo $USERNAME/dataanalysistemplate via API..."
  curl -s -X POST "https://api.github.com/user/repos" \
    -H "Authorization: token $AUTH_METHOD" \
    -H "Accept: application/vnd.github+json" \
    -d '{"name":"dataanalysistemplate","private":true,"description":"MERIDIAN Data Analyst Template - full source (private)"}' \
    -o /dev/null -w "  HTTP %{http_code}\n"

  echo "→ Creating public repo $USERNAME/demoanalytics via API..."
  curl -s -X POST "https://api.github.com/user/repos" \
    -H "Authorization: token $AUTH_METHOD" \
    -H "Accept: application/vnd.github+json" \
    -d '{"name":"demoanalytics","private":false,"description":"MERIDIAN Data Analyst Template - public preview (GitHub Pages)"}' \
    -o /dev/null -w "  HTTP %{http_code}\n"
  echo ""
fi

# 2. Push private repo
echo "→ Pushing private repo..."
cd "$PRIVATE_DIR"
if git remote get-url origin >/dev/null 2>&1; then
  git $AUTH_FLAG remote set-url origin "$PRIVATE_REMOTE"
else
  git $AUTH_FLAG remote add origin "$PRIVATE_REMOTE"
fi
git $AUTH_FLAG push -u origin main
echo ""

# 3. Sync to public repo
if [ -z "$PUBLIC_DIR" ] || [ ! -d "$PUBLIC_DIR" ]; then
  echo "→ Public repo not found at sibling directory. Cloning..."
  cd "$(dirname "$PRIVATE_DIR")"
  git $AUTH_FLAG clone "$PUBLIC_REMOTE" demoanalytics
  PUBLIC_DIR="$(pwd)/demoanalytics"
fi

echo "→ Syncing private -> public..."
cd "$PRIVATE_DIR"
./scripts/sync-to-public.sh "$PUBLIC_DIR" || true  # push step will fail, that's OK
echo ""

# 4. Push public repo
echo "→ Pushing public repo..."
cd "$PUBLIC_DIR"
if git remote get-url origin >/dev/null 2>&1; then
  git $AUTH_FLAG remote set-url origin "$PUBLIC_REMOTE"
else
  git $AUTH_FLAG remote add origin "$PUBLIC_REMOTE"
fi
git $AUTH_FLAG push -u origin main
echo ""

# 5. Enable GitHub Pages (only works with PAT)
if [ "$AUTH_METHOD" != "ssh" ]; then
  echo "→ Enabling GitHub Pages on $USERNAME/demoanalytics..."
  # Enable Pages with Actions as the source
  curl -s -X POST "https://api.github.com/repos/$USERNAME/demoanalytics/pages" \
    -H "Authorization: token $AUTH_METHOD" \
    -H "Accept: application/vnd.github+json" \
    -d '{"build_type":"workflow"}' \
    -o /dev/null -w "  HTTP %{http_code}\n"
  echo ""
fi

echo "✓ Done!"
echo ""
echo "  Private repo:  https://github.com/$USERNAME/dataanalysistemplate"
echo "  Public repo:    https://github.com/$USERNAME/demoanalytics"
echo "  Public preview: https://$USERNAME.github.io/demoanalytics/"
echo ""
echo "  Note: GitHub Pages deployment takes ~2 minutes after the first push."
echo "  Check progress at: https://github.com/$USERNAME/demoanalytics/actions"
