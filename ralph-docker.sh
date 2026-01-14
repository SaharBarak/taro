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

# Load .env if exists
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
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

# Build if needed
echo "Building Docker image..."
$COMPOSE build

# Run the loop inside container
echo "Starting Ralph loop in Docker sandbox..."
$COMPOSE run --rm ralph ./loop.sh "$@"
