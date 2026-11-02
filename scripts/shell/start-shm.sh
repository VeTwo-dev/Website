#!/usr/bin/env bash
# Start the VeTwo production server against the tmpfs .next tree
# created by build-shm.sh.
#
# Next's build cleanup removes the node_modules symlink that build-shm.sh
# places inside /dev/shm/vetwo-next (page-data collection resolves
# next/dist/compiled/* and other packages relative to .next), so the
# symlink is recreated here BEFORE the server starts — never during,
# or cleanup may race it (see build-shm.sh header).
#
# Usage: bash start-shm.sh            (foreground; bg via your runner)
#        PORT=3001 bash start-shm.sh
set -euo pipefail
SHM=/dev/shm/vetwo-next
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

if [ ! -f "$SHM/BUILD_ID" ]; then
  echo "error: $SHM/BUILD_ID not found — run bash build-shm.sh first." >&2
  exit 1
fi

# Recreate the symlink Next's cleanup removed after the build.
ln -sfn "$ROOT/node_modules" "$SHM/node_modules"

# .next must be the symlink (not a stale real directory) for the server
# to read the tmpfs build.
if [ ! -L .next ]; then
  echo "error: .next is not a symlink to $SHM — run bash build-shm.sh first." >&2
  exit 1
fi

exec bun run start
