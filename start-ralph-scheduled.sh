#!/bin/bash
# Schedule Ralph Loop to start at 11:01 PM
# Usage: ./start-ralph-scheduled.sh [plan|build] [iterations]

MODE=${1:-plan}
ITERATIONS=${2:-12}

# Calculate seconds until 23:01
TARGET_HOUR=23
TARGET_MIN=01

CURRENT_EPOCH=$(date +%s)
TARGET_EPOCH=$(date -j -f "%H:%M:%S" "${TARGET_HOUR}:${TARGET_MIN}:00" +%s 2>/dev/null)

# If target time has passed today, schedule for tomorrow
if [ "$TARGET_EPOCH" -le "$CURRENT_EPOCH" ]; then
    TARGET_EPOCH=$((TARGET_EPOCH + 86400))
fi

WAIT_SECONDS=$((TARGET_EPOCH - CURRENT_EPOCH))
WAIT_HOURS=$((WAIT_SECONDS / 3600))
WAIT_MINS=$(((WAIT_SECONDS % 3600) / 60))

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Ralph Loop scheduled for 11:01 PM"
echo "Mode: $MODE | Iterations: $ITERATIONS"
echo "Waiting: ${WAIT_HOURS}h ${WAIT_MINS}m"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Press Ctrl+C to cancel"
echo ""

sleep $WAIT_SECONDS

echo "Starting Ralph Loop at $(date)"
cd /Users/moon/workspace/Taro
./ralph-docker.sh $MODE $ITERATIONS
