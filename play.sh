#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  printf '%s\n' 'COMPILE / CRASH needs Node.js 22 or newer.' >&2
  printf '%s\n' 'Install Node.js LTS from https://nodejs.org/ and run this script again.' >&2
  exit 1
fi

if [ ! -f node_modules/typescript/bin/tsc ]; then
  echo 'Installing the one development dependency...'
  npm ci
fi

echo 'Starting COMPILE / CRASH at http://localhost:5173'
npm run dev
