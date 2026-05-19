#!/bin/sh
set -e
echo "[entrypoint] starting"
CHROMA_DIR="${CHROMA_PERSIST_DIRECTORY:-.chroma}"
mkdir -p "$CHROMA_DIR"
chmod 700 "$CHROMA_DIR" || true
if [ -z "$PORT" ]; then
	echo "[entrypoint] PORT is not set" >&2
	exit 1
fi
echo "[entrypoint] CHROMA_DIR=$CHROMA_DIR PORT=$PORT"
# Use uvicorn directly for Render. With Root Directory set to `backend`, the module is `app.main`.
exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT" --proxy-headers --workers 1
