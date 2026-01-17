# Kindling - Project Instructions

## Project Overview

**Kindling** is a personal project/idea tracker for Michelle. It tracks ideas through stages: Spark → Exploring → Building → Shipped → Paused.

**Key Concepts:**
- **Permasolution**: Build once, runs forever (no ongoing maintenance)
- **Builder-Sustainer Gap**: Michelle is great at building, less interested in sustaining

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Storage**: Browser localStorage
- **AI**: Local Ollama (optional)
- **Hosting**: Netlify (auto-deploy from GitHub)

## Context7 Documentation Lookup

Use `context7` MCP server **only when needed** to minimize token usage.

✅ **Use for:** Unfamiliar APIs, debugging library errors, migration guides
❌ **Skip for:** Basic syntax, working code, simple operations

| Library | Context7 ID | When to Query |
|---------|-------------|---------------|
| Next.js | `/vercel/next.js` | App Router, Server Actions, API routes |
| Tailwind CSS | `/websites/tailwindcss` | Complex utilities, plugins |
| dnd-kit | `/websites/next_dndkit` | Drag & drop, sortable lists |

**Tips:** Be specific ("dnd-kit sortable with keyboard" not "dnd-kit"). Fallback to web search if needed.

## File Structure

```
src/
├── app/
│   ├── page.tsx           # Dashboard
│   ├── kanban/page.tsx    # Kanban board
│   ├── timeline/page.tsx  # Timeline view
│   ├── insights/page.tsx  # Themes & learnings
│   └── api/suggest/       # Ollama API endpoint
├── components/
│   ├── AppProvider.tsx    # Global state & modals
│   ├── Sidebar.tsx        # Navigation
│   ├── IdeaCard.tsx       # Idea display
│   ├── IdeaModal.tsx      # Create/edit form
│   ├── ImportModal.tsx    # JSON/PAIA import
│   └── StatsCard.tsx      # Dashboard stats
├── lib/
│   ├── types.ts           # TypeScript interfaces
│   ├── storage.ts         # localStorage operations
│   ├── paia-parser.ts     # Markdown parser
│   └── ollama.ts          # AI integration
└── hooks/
    └── useIdeas.ts        # State management
```

## Data Model

```typescript
interface Idea {
  id: string;
  title: string;
  description: string;
  stage: 'spark' | 'exploring' | 'building' | 'shipped' | 'paused';
  type: 'permasolution' | 'project' | 'experiment' | 'learning';
  tags: string[];
  effort: 'trivial' | 'small' | 'medium' | 'large' | 'epic';
  notes: string;
  createdAt: string;
  updatedAt: string;
  stageHistory: { stage: string; date: string }[];
}
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Ollama Integration

AI suggestions require Ollama running locally:

```bash
# Start Ollama
ollama serve

# Check available models
ollama list
```

Default model: `llama3.1:8b` (fast)
Alternative: `qwen3:30b` or `llama3.3:70b` (deeper suggestions)

Configure in `.env.local`:
```env
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
```

## Deployment

1. Push to GitHub
2. Connect repo to Netlify
3. Auto-deploys on every push

## PAIA Integration

Import themes and learnings from PAIA memory files:
- `recurring_themes.md` - Recurring patterns
- `learnings.md` - Key insights

Use the Import button in the sidebar → PAIA Themes/Learnings tab.

## Project Scanner (Claude Workflow)

A Claude Code workflow exists to scan all project changelogs and update Kindling cards with recent activity summaries.

**Trigger phrases:** "scan projects", "update kindling", "sync project progress"

**How it works:**
1. Scans `CHANGELOG.md` files across all AI project folders
2. Matches projects to Kindling cards by folder name
3. Extracts recent activity since last scan
4. Shows proposed note updates for approval
5. Updates cards via API

**Instructions location:** `~/.claude/CLAUDE.md` (global config)

**API key:** Uses `KINDLING_API_KEY` environment variable

---

**Last Updated:** 2026-01-17
