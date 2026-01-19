# AI Search Optimization Guide (AEO/GEO)

> Source: Microsoft's "From discovery to influence" guide via [@alexgroberman](https://x.com/alexgroberman)
> Saved: 2026-01-18

## Core Message

Retail competition is shifting from **"being found"** to **"being chosen."**

| Traditional SEO | AI-Driven Search |
|-----------------|------------------|
| Ranking | Answers |
| Clicks | Recommendations |
| Page visits | Agent-led decisions |

Visibility is now earned by how clearly AI systems **understand** your products, **trust** your brand, and can **act** on your data.

---

## AEO vs GEO

### Answer/Agentic Engine Optimization (AEO)
Optimizes content so AI assistants can:
- Find it
- Understand it
- Summarize it
- Recommend it
- Act on it

**Focus**: Clarity and machine-readability

### Generative Engine Optimization (GEO)
Optimizes content so AI search systems trust it as:
- Authoritative
- Credible
- Citable

**Focus**: Credibility, reputation, and justification

> SEO still matters, but it's now the **foundation**, not the endpoint.

---

## The AI Shopping Ecosystem

Three overlapping surfaces:

| Type | Examples | Capabilities |
|------|----------|--------------|
| **AI Browsers** | Edge, Chrome with AI | See live pages, interpret in real-time |
| **AI Assistants** | Copilot, ChatGPT, Gemini | Answer questions, summarize, recommend |
| **AI Agents** | Shopping agents | Navigate sites, add to cart, apply promos, checkout |

**Key question**: Not "which AI surface?" but "what data can AI access, trust, and use?"

---

## How AI Decides What to Recommend

Multi-stage reasoning process fusing 3 data sources:

### 1. Crawled Web Data
- Brand reputation
- Category authority
- Expert mentions
- Historical understanding

### 2. Product Feeds and APIs
- Price
- Availability
- Variants
- Inventory
- Key specs

**This is where competitive advantage often comes from** - most brands are under-optimized here.

### 3. Live Website Data
- Real-time pricing
- Promotions
- Reviews
- Media
- Checkout functionality

**If your live site fails, the agent fails** - even if feeds were perfect.

### Example: "Rain jacket under $200"

AI reasoning includes:
- "Patagonia and North Face make quality jackets" (general knowledge)
- "Hiking jackets need to be lightweight and waterproof" (category understanding)
- "Brand X is known for hiking equipment" (brand positioning)
- "Your model is $179 and in stock" (feeds)
- "Competitor is $199 and backordered" (feeds)

Product makes top recommendations because **feeds + availability + price + context align**.

---

## The Evolution: SEO → AEO → GEO

| Level | Example |
|-------|---------|
| **SEO** (keywords) | "Waterproof rain jacket" |
| **AEO** (descriptive clarity) | "Lightweight, packable waterproof rain jacket with ventilation and reflective piping" |
| **GEO** (justification + trust) | "Best-rated by Outdoor Magazine, 4.8 stars, 180-day returns, 3-year warranty" |

- **AEO** drives understanding
- **GEO** drives confidence
- **You need both to be recommended**

---

## 3 Data Layers You Must Control

### Layer 1: Crawled Data
What AI learned during training + real-time web search.
- Shapes baseline brand perception
- **SEO still matters here**

### Layer 2: Product Feeds and APIs
Structured data you actively provide.
- Where precision and control live
- Drives comparisons, rankings, recommendations
- **Where most retailers under-invest**

### Layer 3: Live Website Data
What AI agents see when they visit.
- Reviews, media, dynamic pricing, checkout capability
- **If agents cannot transact, influence stops at recommendation**

---

## Microsoft's 3 Action Pillars

### Pillar 1: Technical Foundations & Structured Data

AI requires **structure and consistency**, not creativity.

**Required schema types:**
- `Product`
- `Offer`
- `AggregateRating`
- `Review`
- `Brand`
- `ItemList`
- `FAQ`

**Dynamic fields to include:**
- Price, Availability, Size, Color
- SKU, GTIN
- `dateModified`
- `inLanguage`, `priceCurrency` (for localization)

**Critical rule**: "Never serve different HTML to bots than to users."

### Pillar 2: Intent-Driven Content Enrichment

AI interprets **intent over keywords**.

**Front-load descriptions with:**
- Who it's for
- What problem it solves
- Why it's better

**Content structures that work:**
- Use-case framing: "Best for day hikes above 40 degrees"
- Headings that mirror real questions
- Modular, citable content blocks
- Q&A sections
- Comparison content
- Feature lists
- "Goes well with" product relationships
- Video transcripts
- Detailed image alt text with `ImageObject` schema

> This is content designed for **extraction**, not reading.

### Pillar 3: Trust & Credibility Signals (GEO)

AI systems prioritize **verifiable truth**.

**Verified social proof:**
- Verified reviews
- Review volume
- Sentiment extraction ("highly rated for comfort and fit")
- `Review` and `AggregateRating` schema

**Authoritative brand identity:**
- Expert reviews
- Press mentions
- Certifications
- Sustainability badges
- Official brand links

**Content integrity:**
- Avoid exaggerated claims
- Maintain consistent brand voice
- Provide structured FAQs and help content

> "AI penalizes low-trust language."

---

## Key Takeaways

1. **SEO alone is good, but not fully enough**
2. **Feeds are now a competitive moat**
3. **Trust is algorithmic**
4. **AI assistants are the new gatekeepers of demand**

### The Winners Will:
- Treat data as a product
- Treat feeds as strategic assets
- Treat content as machine-readable infrastructure
- Treat trust as a measurable ranking factor

This is what Microsoft calls **"AI ranking readiness."**

---

## One Core Idea

> If AI cannot clearly understand your products, justify recommending them, and act on your data in real time, you will not be a legit presence in AI-driven commerce.

---

## Relevance to Kindling/PAIA

For any public-facing projects:
- **Structured data** matters more than ever
- **Intent-driven content** > keyword stuffing
- **Trust signals** (reviews, citations, expert mentions) drive AI recommendations
- Consider how AI agents would interact with shipped products
