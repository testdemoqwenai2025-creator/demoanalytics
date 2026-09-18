#!/usr/bin/env bash
# Push the local MERIDIAN data analyst template repo to a new GitHub repository.
#
# Usage:
#   ./scripts/push-to-github.sh <your-github-username> [repo-name]
#
# Examples:
#   ./scripts/push-to-github.sh alice                     # creates alice/dataanalysistemplate
#   ./scripts/push-to-github.sh alice my-data-dashboard   # creates alice/my-data-dashboard
#
# Prerequisites:
#   - GitHub CLI (gh) installed and authenticated, OR
#   - SSH key registered with GitHub, OR
#   - HTTPS credential helper configured
#
# To install gh:    https://cli.github.com
# To authenticate:  gh auth login

set -euo pipefail

USERNAME="${1:-}"
REPO_NAME="${2:-dataanalysistemplate}"

if [ -z "$USERNAME" ]; then
  echo "Usage: $0 <github-username> [repo-name]"
  echo ""
  echo "Examples:"
  echo "  $0 alice                       # creates alice/dataanalysistemplate"
  echo "  $0 alice my-data-dashboard     # creates alice/my-data-dashboard"
  exit 1
fi

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

echo "→ Pushing MERIDIAN data analyst template to GitHub"
echo "  Username: $USERNAME"
echo "  Repo:     $REPO_NAME"
echo "  Local:    $REPO_DIR"
echo ""

# Check we have a git repo
if [ ! -d .git ]; then
  echo "✗ No git repository found at $REPO_DIR"
  exit 1
fi

# Check we have commits
if ! git log --oneline -1 >/dev/null 2>&1; then
  echo "✗ No commits yet. Run 'git add -A && git commit -m \"Initial commit\"' first."
  exit 1
fi

# Try gh CLI first (easiest path)
if command -v gh >/dev/null 2>&1; then
  echo "→ Found GitHub CLI. Creating repo $USERNAME/$REPO_NAME..."
  if [ "$USERNAME" = "$(gh api user --jq .login 2>/dev/null || echo '')" ]; then
    # User owns the account, create under their namespace
    gh repo create "$REPO_NAME" --public --source=. --remote=origin --push
    echo ""
    echo "✓ Done. Repo: https://github.com/$USERNAME/$REPO_NAME"
    exit 0
  else
    echo "  gh authenticated as a different user, falling back to manual push..."
  fi
fi

# Fall back to manual remote add + push
REMOTE_URL="git@github.com:$USERNAME/$REPO_NAME.git"

# Remove existing origin if present
if git remote get-url origin >/dev/null 2>&1; then
  echo "→ Updating existing origin remote..."
  git remote set-url origin "$REMOTE_URL"
else
  echo "→ Adding origin remote..."
  git remote add origin "$REMOTE_URL"
fi

echo "→ Pushing to $REMOTE_URL..."
echo ""
echo "  If you see 'Permission denied (publickey)', either:"
echo "    1. Add your SSH key to GitHub: https://github.com/settings/keys"
echo "    2. Or change remote URL to HTTPS:"
echo "       git remote set-url origin https://github.com/$USERNAME/$REPO_NAME.git"
echo ""

if git push -u origin main; then
  echo ""
  echo "✓ Done. Repo: https://github.com/$USERNAME/$REPO_NAME"
else
  echo ""
  echo "✗ Push failed. See the messages above."
  exit 1
fi
