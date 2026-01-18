# Serving Markdown for AI Agents

> Source: [Daniel Doubrovkine (dblock)](https://code.dblock.org/2026/01/15/serving-markdown-for-ai-agents.html)
> Saved: 2026-01-18

## The Third Audience

Dries Buytaert's concept: For decades, websites targeted two audiences:
1. **Humans**
2. **Search engines**

**AI agents are now the third audience** - and most websites aren't optimized for them yet.

---

## Why Markdown?

AI agents prefer clean, structured content over HTML.

**Markdown is ideal because it's:**
- Readable
- Semantic
- Free of navigation chrome (headers, footers, sidebars)

---

## Implementation Pattern

For every HTML post, serve a corresponding `.md` source file at the same URL path.

### URL Structure
```
HTML: /2026/01/15/serving-markdown-for-ai-agents.html
MD:   /2026/01/15/serving-markdown-for-ai-agents.md
```

### Discovery via Link Tag

Add a `<link>` tag in the HTML `<head>` so AI agents can discover the markdown version:

```html
<link href="serving-markdown-for-ai-agents.md"
      type="text/markdown"
      rel="alternate"
      title="Markdown">
```

---

## GitHub Pages Implementation

Since GitHub Pages doesn't support custom Jekyll plugins, use a GitHub Actions workflow:

1. Build Jekyll normally
2. Copy markdown source files to `_site` before deployment
3. Extract date and slug from each post filename
4. Copy to matching URL path with `.md` extension

---

## Should You Do This?

### The Concern
Are we making it easier for AI companies to use our content without sending traffic back?

### The Counterargument
- AI agents are already crawling our sites
- Cleaner input might lead to **better attribution**
- More accurate AI responses that **reference our work**
- The web has always been about making information accessible

> "This is just the next evolution."

---

## Key Takeaway

Optimize for the third audience by providing machine-readable content alongside human-readable HTML. Markdown is the ideal format for AI consumption.

---

## Relevance to ALiEM Blog / Kindling

For any public content:
- Consider serving `.md` alongside `.html`
- Add `<link rel="alternate" type="text/markdown">` for discoverability
- This complements AEO/GEO strategies - structured content for AI
- Could improve how AI assistants cite and reference your work
