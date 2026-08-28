#!/usr/bin/env sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT"
command -v node >/dev/null 2>&1 || { echo "Node.js 18 or newer is required" >&2; exit 1; }
mkdir -p .local workspace downloads output
[ -f config/accounts.local.yaml ] || cp config/accounts.example.yaml config/accounts.local.yaml
[ -f config/gems.local.yaml ] || cp config/gems.example.yaml config/gems.local.yaml
[ -f config/paths.local.yaml ] || cp config/paths.example.yaml config/paths.local.yaml
echo "Setup complete. Edit local account and Gem labels, then run npm test."
echo "Sign in manually in your own browser profile. Do not import cookies or browser data."

