# Brain Inbox - Centralized Capture System

> A GitHub-based universal inbox accessible from Mac, iPhone, and web.
> Created: 2026-01-19

## Repository Structure

```
brain-inbox/
├── CLAUDE.md                 # Instructions for Claude skills
├── inbox.md                  # Quick capture (tasks, notes, anything)
│
├── readings/                 # Reference materials & articles
│   ├── _index.md             # Quick reference to all readings
│   ├── agent-memory.md       # Topic-based reading notes
│   ├── claude-code.md
│   ├── ai-search-seo.md
│   └── ai-agents.md
│
├── projects/                 # Parsed project TODOs
│   ├── kindling.md
│   ├── paia.md
│   ├── aliem.md
│   └── general.md
│
├── ideas.md                  # Ideas → Kindling cards
├── someday.md                # Low priority / someday maybe
│
└── processed/                # Archive of triaged items
    └── 2026-01.md
```

## Content Types

| Type | Where it goes | Example |
|------|---------------|---------|
| **Task** | `projects/{project}.md` | "Fix PAIA memory bug" |
| **Idea** | `ideas.md` → Kindling | "Dark mode for Kindling" |
| **Reading** | `readings/{topic}.md` | Article, thread, reference doc |
| **Someday** | `someday.md` | "Build iOS app" |
| **Quick note** | `inbox.md` | Anything, triage later |

---

## Readings Format

For articles, threads, and reference materials (like the docs from this session):

```markdown
# readings/agent-memory.md

## Agent Memory Architecture
> Source: @rohit4verse thread
> Date: 2026-01-18
> Relevant to: PAIA, Kindling

### Key Concepts
- File-based memory (Resources → Items → Categories)
- Graph-based memory (Vector + Knowledge Graph)
- Memory decay via cron jobs

### Takeaways for Projects
- **PAIA**: Consider 3-layer hierarchy for theme storage
- **Kindling**: Weekly summarization pattern for insights

### Full Notes
[Link to docs/agent-memory-architecture.md in Kindling repo]
```

---

## Inbox Format

```markdown
# Inbox

Dump anything here. Triage weekly.

## 2026-01-19

### Tasks
- [ ] Fix PAIA memory consolidation bug
- [ ] Add dark mode toggle to Kindling

### Readings to Process
- [ ] @rohit4verse thread on agent memory → readings/agent-memory.md
- [ ] @affaanmustafa Claude Code setup → readings/claude-code.md
- [ ] Microsoft AEO/GEO guide → readings/ai-search-seo.md

### Ideas
- [ ] Blog post: How I use Claude Code daily
- [ ] Kindling feature: Project health scores

### Notes
- Met with Sarah about PAIA roadmap
- Ollama 3.2 released, try new models
```

---

## Workflow

### 1. Capture (from anywhere)

**iPhone (Claude Code app)**:
```
"Add to inbox: research vector DB options for PAIA"
```

**Mac terminal**:
```
"inbox: @dblock article on markdown for AI agents"
```

**GitHub web**: Edit inbox.md directly

### 2. Triage (weekly)

Run: `"triage my inbox"`

Claude processes each item:
- Tasks → `projects/{project}.md`
- Readings → `readings/{topic}.md` (summarize or link)
- Ideas → `ideas.md` (optionally create Kindling card)
- Someday → `someday.md`

### 3. Sync to Projects (optional)

For readings that are already saved in project repos (like the docs we created today in Kindling), just add a reference:

```markdown
# readings/agent-memory.md

See: kindling-project-idea-tracker/docs/agent-memory-architecture.md
```

---

## Skills

### Quick Capture
```markdown
# ~/.claude/skills/inbox-capture.md

When user says "inbox: <note>" or "add to inbox: <note>":
1. Pull brain-inbox repo
2. Append to inbox.md under today's date with - [ ]
3. Commit and push
4. Confirm: "Added to inbox"
```

### Triage
```markdown
# ~/.claude/skills/inbox-triage.md

When user says "triage inbox" or "process notes":
1. Pull brain-inbox repo
2. Read inbox.md, find unchecked items
3. For each item, classify:
   - Type: task | reading | idea | someday
   - Project: kindling | paia | aliem | general
4. Route to appropriate file
5. Mark original as [x] processed
6. Commit and push
7. Show summary
```

### Save Reading
```markdown
# ~/.claude/skills/save-reading.md

When user says "save reading: <url or pasted content>":
1. Pull brain-inbox repo
2. Extract/summarize key points
3. Ask: Topic? (agent-memory, claude-code, ai-search, etc.)
4. Ask: Relevant projects? (kindling, paia, aliem)
5. Append to readings/{topic}.md
6. Add project-specific takeaways
7. Commit and push
```

---

## How Today's Readings Would Be Stored

The docs we saved in Kindling's `/docs` folder are the full versions. In brain-inbox, you'd have quick references:

```markdown
# readings/_index.md

## 2026-01-19
| Topic | Source | Projects | Full Doc |
|-------|--------|----------|----------|
| Agent Memory | @rohit4verse | PAIA | kindling/docs/agent-memory-architecture.md |
| Claude Code Setup | @affaanmustafa | All | kindling/docs/claude-code-workflow-guide.md |
| AEO/GEO | Microsoft/@alexgroberman | ALiEM | kindling/docs/ai-search-optimization-aeo-geo.md |
| Markdown for AI | @dblock | ALiEM | kindling/docs/serving-markdown-for-ai-agents.md |
```

---

## Access Points

| Device | Method |
|--------|--------|
| **Mac** | Claude Code in terminal, git push/pull |
| **iPhone** | Claude Code app, can edit GitHub files |
| **Web** | github.com direct editing |
| **iPad** | Claude Code app or GitHub mobile |

---

## Next Steps

1. Create `brain-inbox` repo on GitHub
2. Add CLAUDE.md with triage instructions
3. Set up skills in `~/.claude/skills/`
4. Start capturing!
