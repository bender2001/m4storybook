#!/usr/bin/env bash
# Continuously runs the Claude Code CLI (Opus 4.7) as the autonomous coding
# agent against /home/meir/Desktop/m4storybook, pushing to GitHub after every
# iteration.
#
# Each iteration:
#   1. Loads the coding prompt from the autocodev1 prompts/ folder.
#   2. Pipes it to `claude -p` with --model claude-opus-4-7 and bypassed
#      permissions, working in the project directory.
#   3. Captures the run to .codex-run/iterations/<ts>.log.
#   4. Stages, commits, and pushes whatever changed.
#   5. Updates .codex-run/health.json so the watchdog knows the loop is alive.
set -u
PROJECT="/home/meir/Desktop/m4storybook"
HARNESS="/home/meir/Desktop/autocodev1"
LOG_DIR="$PROJECT/.codex-run"

# Log unexpected signals so future crashes leave a fingerprint instead of
# vanishing silently. EXIT trap is unconditional; signal traps fire first.
_loop_trap() {
  local sig="$1"
  echo "[loop] *** received signal ${sig} at $(date -u +%FT%TZ); pid=$$ iter=${iter:-pre-init}" >>"${LOG_DIR}/nohup.out"
  echo "[loop] *** trace:" >>"${LOG_DIR}/nohup.out"
  caller 0 >>"${LOG_DIR}/nohup.out" 2>&1 || true
  exit 130
}
_loop_exit() {
  local code=$?
  if [[ ${code} -ne 0 ]]; then
    echo "[loop] *** exiting with code ${code} at $(date -u +%FT%TZ); pid=$$ iter=${iter:-pre-init}" >>"${LOG_DIR}/nohup.out"
  fi
}
trap '_loop_trap HUP'  HUP
trap '_loop_trap INT'  INT
trap '_loop_trap TERM' TERM
trap '_loop_trap PIPE' PIPE
trap '_loop_exit' EXIT
PROMPT_FILE="$LOG_DIR/coding_prompt.md"
ITER_DIR="$LOG_DIR/iterations"
HEALTH="$LOG_DIR/health.json"
mkdir -p "$ITER_DIR"

if [[ ! -f "$PROMPT_FILE" ]]; then
  echo "[loop] missing prompt $PROMPT_FILE" | tee -a "$LOG_DIR/loop.log"
  exit 1
fi

iter=0
while true; do
  iter=$((iter + 1))
  ts="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
  log="$ITER_DIR/${ts}-iter${iter}.log"
  echo "[loop] iteration ${iter} starting at ${ts}" | tee -a "$LOG_DIR/loop.log"

  start_epoch="$(date +%s)"
  cd "$PROJECT" || exit 1
  # claude CLI: print mode, Opus 4.7, OAuth (no API key needed), bypass
  # permissions so the agent can edit/run freely.
  claude -p \
    --model claude-opus-4-7 \
    --dangerously-skip-permissions \
    --add-dir "$PROJECT" \
    --output-format text \
    --no-session-persistence \
    < "$PROMPT_FILE" \
    >"$log" 2>&1
  exit_code=$?
  end_epoch="$(date +%s)"
  duration=$((end_epoch - start_epoch))

  echo "[loop] iteration ${iter} exited ${exit_code} after ${duration}s" | tee -a "$LOG_DIR/loop.log"

  # Health snapshot for the watchdog.
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

  # Stage, commit, push whatever the agent produced.
  cd "$PROJECT" || exit 1
  if [[ -n "$(git status --porcelain)" ]]; then
    git add -A
    git commit -q -m "autocode iter ${iter}: ${passes}/${total} features passing

Iteration log: .codex-run/iterations/$(basename "$log")

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>" || true
  fi
  git push origin main >>"$LOG_DIR/loop.log" 2>&1 || echo "[loop] push failed (will retry next iteration)" | tee -a "$LOG_DIR/loop.log"

  # All features green? stop.
  if [[ "$passes" -gt 0 && "$passes" == "$total" ]]; then
    echo "[loop] all ${total} features pass - stopping" | tee -a "$LOG_DIR/loop.log"
    break
  fi

  # Fast crash protection.
  if [[ "$duration" -lt 10 && "$exit_code" -ne 0 ]]; then
    echo "[loop] claude failed fast, backing off 30s" | tee -a "$LOG_DIR/loop.log"
    sleep 30
  fi
done
