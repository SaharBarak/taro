#!/bin/bash
# Docker entrypoint - Set up Context7 MCP

# Create Claude settings directory if not exists
mkdir -p /home/ralph/.claude

# Configure Context7 MCP server for Claude Code
# This creates/updates the MCP configuration
if [ ! -f /home/ralph/.claude/settings.json ]; then
    echo '{}' > /home/ralph/.claude/settings.json
fi

# Add Context7 MCP with API key for higher rate limits
if ! grep -q "context7" /home/ralph/.claude/settings.json 2>/dev/null; then
    claude mcp add --transport http context7 https://mcp.context7.com/mcp \
        --header "CONTEXT7_API_KEY: ctx7sk-0bce4c43-b341-4dba-b4d9-e9ba2eaebb4b" 2>/dev/null || true
fi

exec "$@"
