#!/bin/sh
set -e
CHROMA_DIR="${CHROMA_PERSIST_DIRECTORY:-.chroma}"
mkdir -p "$CHROMA_DIR"
chmod 700 "$CHROMA_DIR"
# If a checked-in .chroma exists in the repo, move it into the runtime dir
if [ -d "./.chroma" ] && [ "$CHROMA_DIR" != "./.chroma" ]; then
  mv ./.chroma "$CHROMA_DIR" || true
fi
# Use uvicorn directly for Render (works reliably in the build environment)
exec uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT --proxy-headers --workers 1
