#!/usr/bin/env bash
# Build + start the production server with .next on tmpfs, in one shot.
# Both next dev (Turbopack) and next build hang on the slow network
# .next filesystem. Symlinking .next to /dev/shm (3.9 GB tmpfs) and
# passing --webpack (Next 16 defaults to Turbopack; NEXT_TURBOPACK=0
# is ignored by the bun launcher) unblocks the build in ~8 min.
#
# The webpack build worker resolves next/dist/compiled/* relative to the
# .next tree, and Next's build cleanup removes a node_modules it finds
# inside .next before page-data collection. We work around that by
# exporting NODE_PATH so Node's resolver finds next/dist/compiled/*
# without anything living inside .next.
set -euo pipefail
SHM=/dev/shm/vetwo-next
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
PORT="${PORT:-3100}"
export NODE_PATH="$ROOT/node_modules"

# 1. Clean any stale .next (fuse-hidden files inside the turbopack cache
#    survive rm -rf, so move it aside instead).
if [ -L .next ] || [ -e .next ]; then
  rm -f .next 2>/dev/null || true
  if [ -e .next ]; then
    mv .next .next-stale-$$ 2>/dev/null || true
  fi
fi

# 2. Start fresh on tmpfs, then symlink .next -> /dev/shm
rm -rf "$SHM"
mkdir -p "$SHM"
ln -sfn "$SHM" .next

# 3. Build (NODE_PATH makes next/dist/compiled/* resolvable without a
#    node_modules inside .next).
echo "=== building (this takes ~8 min) ==="
bun run build -- --webpack
echo "BUILD_OK"

# 4. Start the server
echo "=== starting server on :$PORT ==="
exec bun run start -- -p "$PORT"
