#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=========================================================="
echo "    🚀 Starting Incident Response Agent System"
echo "    • Persistent Memory: Hindsight Cloud (unicase-incident-memory)"
echo "    • LLM Provider: Groq (qwen/qwen3.8-27b)"
echo "=========================================================="

# Cleanup child processes on exit
trap 'kill $(jobs -p) 2>/dev/null' EXIT

# Start backend
echo "Starting FastAPI Backend on http://localhost:8000..."
PYTHONPATH=backend backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &

# Start frontend
echo "Starting Vite Frontend on http://localhost:5173..."
cd frontend
npm run dev -- --host &

wait
