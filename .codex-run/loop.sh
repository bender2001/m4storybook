#!/usr/bin/env bash
# Continuously runs the autocode autonomous loop against /home/meir/Desktop/m4storybook
# using Claude Opus 4.7 single agent, and pushes to GitHub after every iteration.
#
# Logs to .codex-run/loop.log and writes per-iteration logs to
# .codex-run/iterations/<iso>.log
set -u
PROJECT="/home/meir/Desktop/m4storybook"
HARNESS="/home/meir/Desktop/autocodev1"
LOG_DIR="$PROJECT/.codex-run"
ITER_DIR="$LOG_DIR/iterations"
HEALTH="$LOG_DIR/health.json"
mkdir -p "$ITER_DIR"

cd "$HARNESS" || exit 1

iter=0
while true; do
  iter=$((iter + 1))
  ts="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
  log="$ITER_DIR/${ts}-iter${iter}.log"
  echo "[loop] iteration ${iter} starting at ${ts}" | tee -a "$LOG_DIR/loop.log"

  # Run a single autocode iteration. Capped at 1 iteration so we get back
  # control between runs and can push.
  start_epoch="$(date +%s)"
  pnpm dev run \
    --project-dir "$PROJECT" \
    --provider claude \
    --model claude-opus-4-7 \
    --max-iterations 1 \
    --max-runtime-hours 4 \
    >"$log" 2>&1
  exit_code=$?
  end_epoch="$(date +%s)"
  duration=$((end_epoch - start_epoch))

  echo "[loop] iteration ${iter} exited ${exit_code} after ${duration}s" | tee -a "$LOG_DIR/loop.log"

  # Capture quick health snapshot the watchdog can read.
  passes=$(jq '[.[] | select(.passes==true)] | length' "$PROJECT/feature_list.json" 2>/dev/null || echo 0)
  total=$(jq 'length' "$PROJECT/feature_list.json" 2>/dev/null || echo 0)
  cat >"$HEALTH" <<EOF
{
  "iteration": ${iter},
  "last_iteration_started": "${ts}",
  "last_iteration_duration_seconds": ${duration},
  "last_exit_code": ${exit_code},
  "passes": ${passes},
  "total": ${total},
  "log": "$(basename "$log")"
}
EOF

  # Push whatever the agent produced. Use --no-verify avoidance: rely on
  # the hooks the agent already validated (none currently).
  cd "$PROJECT" || exit 1
  if [[ -n "$(git status --porcelain)" ]]; then
    git add -A
    git commit -q -m "autocode iteration ${iter}: ${passes}/${total} features passing

Iteration log: .codex-run/iterations/$(basename "$log")

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>" || true
  fi
  # Always push (even if agent committed itself).
  git push origin main >>"$LOG_DIR/loop.log" 2>&1 || echo "[loop] push failed (will retry next iteration)" | tee -a "$LOG_DIR/loop.log"
  cd "$HARNESS" || exit 1

  # Stop if everything passes.
  if [[ "$passes" -gt 0 && "$passes" == "$total" ]]; then
    echo "[loop] all ${total} features pass - stopping" | tee -a "$LOG_DIR/loop.log"
    break
  fi

  # If autocode crashed instantly (<10s), back off briefly so we don't
  # spin against a permanent error before the watchdog catches it.
  if [[ "$duration" -lt 10 && "$exit_code" -ne 0 ]]; then
    echo "[loop] autocode failed fast, backing off 30s" | tee -a "$LOG_DIR/loop.log"
    sleep 30
  fi
done
