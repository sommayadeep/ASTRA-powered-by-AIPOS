#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

if [[ ! -f "$BACKEND_DIR/.venv/bin/activate" ]]; then
  echo "Backend virtual environment not found at backend/.venv"
  echo "Create it with: python3 -m venv backend/.venv && source backend/.venv/bin/activate && pip install -r backend/requirements.txt"
fi

if [[ ! -f "$FRONTEND_DIR/.nodeenv/bin/activate" ]]; then
  echo "Frontend Node runtime not found at frontend/.nodeenv"
  echo "Create it with: cd frontend && python3 -m nodeenv .nodeenv"
fi

export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:8000}"
export FRONTEND_ORIGINS="${FRONTEND_ORIGINS:-http://localhost:3000,http://127.0.0.1:3000}"
export DEMO_SEED="${DEMO_SEED:-1}"
export PYTHONPATH="$ROOT_DIR/backend:$ROOT_DIR"

if [[ -f "$ROOT_DIR/.env" ]]; then
  set -a
  # Load project environment variables so backend/frontend processes see the same configuration.
  source "$ROOT_DIR/.env"
  set +a
fi

echo "Starting AIPOS development stack"
echo "Frontend: $FRONTEND_DIR"
echo "Backend:  $BACKEND_DIR"
echo "Seed data: $DEMO_SEED"

cleanup() {
  jobs -pr | xargs -r kill
}
trap cleanup EXIT INT TERM

(
  cd "$ROOT_DIR"
  if [[ -f "backend/.venv/bin/activate" ]]; then
    source backend/.venv/bin/activate
  fi
  python backend/scripts/check_env.py
  if [[ "$DEMO_SEED" != "0" ]]; then
    python backend/scripts/seed_demo_data.py
  fi
  python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
) &

(
  cd "$FRONTEND_DIR"
  if [[ -f ".nodeenv/bin/activate" ]]; then
    source .nodeenv/bin/activate
  fi
  npm run dev
) &

wait
