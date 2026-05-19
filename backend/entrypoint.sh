#!/bin/sh
set -e
CHROMA_DIR="${CHROMA_PERSIST_DIRECTORY:-.chroma}"
mkdir -p "$CHROMA_DIR"
chmod 700 "$CHROMA_DIR"
# If a checked-in .chroma exists in the repo, do not move it when using .chroma as the target.
# This avoids mv errors like '.chroma/.chroma' on free Render instances.
# Use uvicorn directly for Render. With Root Directory set to `backend`, the module is `app.main`.
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT --proxy-headers --workers 1
