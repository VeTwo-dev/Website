#!/usr/bin/env bash
# Build the VeTwo production bundle with .next on tmpfs.
# Both next dev (Turbopack) and next build hang on the slow network
# .next filesystem. Symlinking .next to /dev/shm (3.9 GB tmpfs) and
# passing --webpack (Next 16 defaults to Turbopack; NEXT_TURBOPACK=0
# is ignored by the bun launcher) unblocks the build in ~8 min.
#
# node_modules must be reachable from inside the .next tree: the build
# worker resolves next/dist/compiled/* relative to .next. Next's own
# build cleanup removes a node_modules symlink placed inside .next
# before page-data collection, so a symlink races the build (app-*
# runtime.page MODULE_NOT_FOUND at page-data collection). NODE_PATH is
# consulted by the CJS resolution algorithm and survives cleanup; the
# symlink is still recreated for the server, after the build (see
# start-shm.sh).
set -euo pipefail
SHM=/dev/shm/vetwo-next
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
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

# 3. node_modules must resolve from inside the .next tree (the build
#    worker resolves next/dist/compiled/* relative to .next).
ln -sfn "$ROOT/node_modules" "$SHM/node_modules"

# 4. Build
bun run build -- --webpack
echo "BUILD_OK"
