# Claude Code Workflow Guide

> Source: [@affaanmustafa](https://x.com/affaanmustafa) - 10 months of daily Claude Code use
> Saved: 2026-01-18

## Overview

Complete setup reference: skills, hooks, subagents, MCPs, plugins, and what actually works.

---

## Skills and Commands

Skills are shorthand prompts for specific workflows, scoped to certain contexts.

```bash
# Directory structure
~/.claude/skills/
  pmx-guidelines.md      # Project-specific patterns
  coding-standards.md    # Language best practices
  tdd-workflow/          # Multi-file skill with README.md
  security-review/       # Checklist-based skill
  codemap-updater.md     # Update codemaps at checkpoints
```

**Commands** are skills executed via slash commands:
- Skills: `~/.claude/skills` - broader workflow definitions
- Commands: `~/.claude/commands` - quick executable prompts

**Chaining**: Commands can be chained in a single prompt (e.g., `/refactor-clean` then `/test-coverage`)

---

## Hooks

Trigger-based automations that fire on specific events (tool calls and lifecycle events).

### Hook Types

| Type | When | Use Case |
|------|------|----------|
| `PreToolUse` | Before tool executes | Validation, reminders |
| `PostToolUse` | After tool finishes | Formatting, feedback loops |
| `UserPromptSubmit` | When you send a message | Input processing |
| `Stop` | When Claude finishes | Cleanup, audits |
| `PreCompact` | Before context compaction | State preservation |
| `Notification` | Permission requests | Alerts |

### Example: tmux Reminder

```json
{
  "PreToolUse": [
    {
      "matcher": "tool == \"Bash\" && tool_input.command matches \"(npm|pnpm|yarn|cargo|pytest)\"",
      "hooks": [
        {
          "type": "command",
          "command": "if [ -z \"$TMUX\" ]; then echo '[Hook] Consider tmux for session persistence' >&2; fi"
        }
      ]
    }
  ]
}
```

**Pro tip**: Use the `hookify` plugin to create hooks conversationally instead of writing JSON manually.

---

## Subagents

Processes the main Claude can delegate to with limited scopes. Can run in background/foreground.

```bash
~/.claude/agents/
  planner.md           # Feature implementation planning
  architect.md         # System design decisions
  tdd-guide.md         # Test-driven development
  code-reviewer.md     # Quality/security review
  security-reviewer.md # Vulnerability analysis
  build-error-resolver.md
  e2e-runner.md
  refactor-cleaner.md
```

**Key**: Configure allowed tools, MCPs, and permissions per subagent for proper scoping. Subagents work well with skills - delegate tasks that use a subset of your skills.

---

## Rules and Memory

Best practices Claude should ALWAYS follow.

### Two Approaches

1. **Single CLAUDE.md** - Everything in one file
2. **Rules folder** - Modular `.md` files grouped by concern

```bash
~/.claude/rules/
  security.md      # No hardcoded secrets, validate inputs
  coding-style.md  # Immutability, file organization
  testing.md       # TDD workflow, 80% coverage
  git-workflow.md  # Commit format, PR process
  agents.md        # When to delegate to subagents
  performance.md   # Model selection, context management
```

**Example rules:**
- No emojis in codebase
- Refrain from purple hues in frontend
- Always test code before deployment
- Prioritize modular code over mega-files
- Never commit console.logs

---

## MCPs (Model Context Protocol)

Connect Claude to external services directly. Prompt-driven wrapper around APIs.

### Critical: Context Window Management

> Your 200k context window before compacting might only be **70k** with too many tools enabled.

**Rule of thumb**: Have 20-30 MCPs in config, but keep **under 10 enabled / under 80 tools active**.

### Example MCP Config

```json
{
  "github": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-github"] },
  "supabase": {
    "command": "npx",
    "args": ["-y", "@supabase/mcp-server-supabase@latest", "--project-ref=YOUR_REF"]
  },
  "memory": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-memory"] },
  "sequential-thinking": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
  },
  "vercel": { "type": "http", "url": "https://mcp.vercel.com" },
  "firecrawl": { "command": "npx", "args": ["-y", "firecrawl-mcp"] }
}
```

### Disable Per Project

```json
// In ~/.claude.json under projects.[path].disabledMcpServers
"disabledMcpServers": [
  "playwright",
  "cloudflare-workers-builds",
  "AbletonMCP",
  "context7"
]
```

---

## Plugins

Package tools for easy installation. Can be skill + MCP combined, or hooks/tools bundled.

```bash
# Add a marketplace
claude plugin marketplace add https://github.com/mixedbread-ai/mgrep

# Then /plugins to install from there
```

### LSP Plugins

Useful when running Claude Code outside editors - gives real-time type checking, go-to-definition.

```bash
typescript-lsp@claude-plugins-official  # TypeScript intelligence
pyright-lsp@claude-plugins-official     # Python type checking
```

### Recommended Plugins

| Plugin | Purpose |
|--------|---------|
| `hookify` | Create hooks conversationally |
| `mgrep` | Better search than ripgrep (local + web) |
| `context7` | Live documentation |
| `typescript-lsp` | TS intelligence |
| `commit-commands` | Git workflow |
| `pr-review-toolkit` | PR automation |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+U` | Delete entire line |
| `!` | Quick bash command prefix |
| `@` | Search for files |
| `/` | Initiate slash commands |
| `Shift+Enter` | Multi-line input |
| `Tab` | Toggle thinking display |
| `Esc Esc` | Interrupt Claude / restore code |

---

## Parallel Workflows

### /fork
Fork conversations to do non-overlapping tasks in parallel instead of queued messages.

### Git Worktrees
For overlapping parallel Claudes without conflicts:

```bash
git worktree add ../feature-branch feature-branch
# Run separate Claude instances in each worktree
```

### tmux for Long-Running Commands

```bash
tmux new -s dev
# Claude runs commands here, you can detach and reattach
tmux attach -t dev
```

### pm2 for Dev Servers (Underrated Trick)

Use pm2 to run dev servers instead of blocking the terminal. Claude can easily search logs while efficiently managing context window.

```bash
# Install pm2 globally
npm install -g pm2

# Start dev server with pm2
pm2 start "npm run dev" --name "dev-server"

# View logs (Claude can search these)
pm2 logs dev-server

# Other useful commands
pm2 list          # See all processes
pm2 stop dev-server
pm2 restart dev-server
pm2 delete dev-server
```

**Benefits:**
- Dev server runs in background without blocking Claude
- Logs are searchable and don't consume context window
- Easy to restart/stop without losing conversation state
- Multiple servers can run simultaneously

---

## Useful Commands

| Command | Purpose |
|---------|---------|
| `/rewind` | Go back to a previous state |
| `/statusline` | Customize with branch, context %, todos |
| `/checkpoints` | File-level undo points |
| `/compact` | Manually trigger context compaction |
| `/plugins` | Manage MCPs and plugins |
| `/mcp` | Quick MCP management |

---

## Example Hook Configuration

```json
{
  "PreToolUse": [
    { "matcher": "npm|pnpm|yarn|cargo|pytest", "hooks": ["tmux reminder"] },
    { "matcher": "Write && .md file", "hooks": ["block unless README/CLAUDE"] },
    { "matcher": "git push", "hooks": ["open editor for review"] }
  ],
  "PostToolUse": [
    { "matcher": "Edit && .ts/.tsx/.js/.jsx", "hooks": ["prettier --write"] },
    { "matcher": "Edit && .ts/.tsx", "hooks": ["tsc --noEmit"] },
    { "matcher": "Edit", "hooks": ["grep console.log warning"] }
  ],
  "Stop": [
    { "matcher": "*", "hooks": ["check modified files for console.log"] }
  ]
}
```

---

## Editor Integration

### Zed (Recommended)
- Agent Panel Integration - real-time file change tracking
- Performance - Rust-based, instant opens, handles large codebases
- CMD+Shift+R - Command palette for custom slash commands
- Vim Mode support

### Tips
- `Ctrl+G` - Quickly open file Claude is working on
- Enable auto-save so Claude's file reads are current
- Use editor's git features to review changes before committing
- Enable file watchers for auto-reload

---

## Key Takeaways

1. **Don't overcomplicate** - treat configuration like fine-tuning, not architecture
2. **Context window is precious** - disable unused MCPs and plugins
3. **Parallel execution** - fork conversations, use git worktrees
4. **Automate the repetitive** - hooks for formatting, linting, reminders
5. **Scope your subagents** - limited tools = focused execution

---

## Relevance to Kindling/PAIA

Consider implementing:
- **Custom skills** for Kindling workflows (project scanning, PAIA imports)
- **Hooks** for auto-formatting or validation on edits
- **Subagents** for specialized tasks (theme extraction, changelog parsing)
- **Context7 MCP** for Next.js/Tailwind documentation lookups
