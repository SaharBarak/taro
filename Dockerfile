# Taru Ralph Loop - Sandboxed Environment
FROM node:20-slim

# Install essentials only
RUN apt-get update && apt-get install -y \
    git \
    curl \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install Claude CLI globally
RUN npm install -g @anthropic-ai/claude-code

# Pre-install Context7 MCP package for faster startup
RUN npm install -g @upstash/context7-mcp@latest

# Create non-root user for safety
RUN useradd -m -s /bin/bash ralph

# Create .claude directory structure
RUN mkdir -p /home/ralph/.claude && chown -R ralph:ralph /home/ralph/.claude

USER ralph
WORKDIR /home/ralph/project

# Git config for commits (matches GitHub account)
RUN git config --global user.email "sahar.h.barak@gmail.com" \
    && git config --global user.name "SaharBarak"

# Pre-populate known_hosts with GitHub to avoid SSH prompt
RUN mkdir -p /home/ralph/.ssh \
    && ssh-keyscan github.com >> /home/ralph/.ssh/known_hosts 2>/dev/null \
    && chown -R ralph:ralph /home/ralph/.ssh

# Copy entrypoint script
COPY --chown=ralph:ralph docker-entrypoint.sh /home/ralph/docker-entrypoint.sh
RUN chmod +x /home/ralph/docker-entrypoint.sh

# Claude Code authentication token
ENV CLAUDE_ACCESS_TOKEN=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

# Use entrypoint to set up auth
ENTRYPOINT ["/home/ralph/docker-entrypoint.sh"]
CMD ["/bin/bash"]
