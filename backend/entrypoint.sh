#!/bin/sh
set -e
CHROMA_DIR="${CHROMA_PERSIST_DIRECTORY:-.chroma}"
mkdir -p "$CHROMA_DIR"
chmod 700 "$CHROMA_DIR"
# If a checked-in .chroma exists in the repo, move it into the runtime dir
if [ -d "./.chroma" ] && [ "$CHROMA_DIR" != "./.chroma" ]; then
  mv ./.chroma "$CHROMA_DIR" || true
fi
exec gunicorn -k uvicorn.workers.UvicornWorker backend.app.main:app --bind 0.0.0.0:$PORT --workers 4
