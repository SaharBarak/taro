#!/bin/bash
# Run Ralph loop inside Docker sandbox
# Usage: ./ralph-docker.sh [plan] [max_iterations]
#
# Set CLAUDE_ACCESS_TOKEN env var or add to .env file

set -e

# Determine docker compose command (docker compose vs docker-compose)
if docker compose version &> /dev/null; then
    COMPOSE="docker compose"
elif docker-compose version &> /dev/null; then
    COMPOSE="docker-compose"
else
    echo "Error: Neither 'docker compose' nor 'docker-compose' found"
    echo "Please install Docker Desktop or Docker Compose"
    exit 1
fi

# Load .env if exists (filter to valid VAR=value lines only)
if [ -f .env ]; then
    while IFS='=' read -r key value; do
        # Skip comments, empty lines, and lines without =
        [[ "$key" =~ ^[[:space:]]*# ]] && continue
        [[ -z "$key" ]] && continue
        # Trim whitespace and export valid variable names
        key=$(echo "$key" | xargs)
        [[ "$key" =~ ^[a-zA-Z_][a-zA-Z0-9_]*$ ]] && export "$key=$value"
    done < .env
fi

# Check for Claude access token
if [ -z "$CLAUDE_ACCESS_TOKEN" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "CLAUDE_ACCESS_TOKEN not set!"
    echo ""
    echo "To use your Claude Code subscription inside Docker:"
    echo ""
    echo "  1. Run: claude setup-token"
    echo "  2. Copy the token string"
    echo "  3. Add to .env file:"
    echo "     CLAUDE_ACCESS_TOKEN=your-token-here"
    echo ""
    echo "Or export it directly:"
    echo "     export CLAUDE_ACCESS_TOKEN=your-token-here"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    exit 1
fi

# Build if needed (skip .env file - Docker doesn't like its format)
echo "Building Docker image..."
$COMPOSE --env-file /dev/null build

# Run the loop inside container
echo "Starting Ralph loop in Docker sandbox..."
$COMPOSE --env-file /dev/null run --rm ralph ./loop.sh "$@"
