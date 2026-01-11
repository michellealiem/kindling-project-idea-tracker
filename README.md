# Kindling

A personal project/idea tracker that helps you move ideas from spark to shipped.

## Features

- **Dashboard** - Overview of all projects with stats
- **Kanban Board** - Visual workflow (Spark → Exploring → Building → Shipped → Paused)
- **Timeline** - See your project journey over time
- **Insights** - Themes, learnings, and tag patterns

## Key Concepts

- **Permasolution** - Build once, runs forever (highlighted with gold badge)
- **Stage History** - Automatic tracking of when ideas progress through stages
- **PAIA Integration** - Import themes and learnings from your PAIA memory files

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## AI Suggestions (Optional)

Get AI-powered suggestions using your local Ollama:

```bash
# Start Ollama (if not already running)
ollama serve

# The app will connect to http://localhost:11434
```

## Data Storage

Data is stored in your browser's localStorage. Use Export/Import in the sidebar for backups.

## Deployment

Deployed automatically via Netlify when you push to GitHub.

---

Built with Next.js 14, Tailwind CSS, and Lucide icons.
