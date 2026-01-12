# Kindling - Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [2026-01-12-B] - PAIA Integration Architecture Brainstorming

### Context
Brainstorming session for integrating Kindling with PAIA (Personal AI Assistant) to create a "web of projects within memory framework." Goal: Make Kindling leverage PAIA's recurring themes, learnings, and RSS content to surface context automatically and reveal blindspots.

### Creative Ideas Explored (20 total)

**Most Creative (ranked):**
1. Dream Synthesis Engine - Auto-generate project ideas from theme gaps
2. Emotional Energy Mapper - Track journal sentiment to auto-update project priority
3. Ghost Collaborator Mode - Virtual Board of Directors advisory on each card
4. Temporal Resonance View - Show how current projects rhyme with past patterns
5. Context Constellation - Dynamic memory cloud around each idea
6. Builder-Sustainer Prediction AI - Predict maintenance burden before starting
7. Idea Pollination System - Cross-pollinate insights across unrelated projects
8. Memory-Triggered Insights - Real-time relevant memories while working
9. Future Self Dialogue - AI-generated advice from past patterns
10. Serendipity Engine - Random unexpected connections for inspiration

**Most Practical (ranked):**
1. Auto-Tag from Themes - Suggest tags from recurring_themes.md
2. Smart Card Population - Auto-fill fields based on past projects
3. Learnings-to-Cards Pipeline - One-click add learnings to relevant cards
4. Automatic Stage Detection - Auto-move cards based on PAIA conversations
5. Contextual Note Suggestions - Surface relevant memory snippets
6. Theme Dashboard Integration - Live theme counts, show focus imbalance
7. Pre-Filled Project Templates - Smart defaults from past similar projects
8. Effort Estimation Assistant - AI-calibrated effort suggestions
9. Related Cards Auto-Linking - Detect overlapping projects
10. Weekly Sync Summary - Digest of activity + patterns

### Recommended MVP (Phase 1)
After utility analysis, narrowed to **3 high-value, low-complexity features**:

1. **Auto-Tag from Themes** (1-2 hours)
   - Parse recurring_themes.md, suggest tags on idea creation
   - Solves: Manual tagging overhead

2. **Theme Gap Dashboard** (2 hours)
   - Show project count per theme (e.g., "8 automation, 0 clinical education")
   - Solves: "Am I walking my talk?" blindspot

3. **RSS Resource Linking** (3-4 hours)
   - Surface high-scoring YouTube/podcast content saved in PAIA
   - Match to Kindling cards by tags/description
   - Solves: "I forgot I already found this resource" + "Context at point of need"

**Total effort: 6-8 hours | Maintenance: Near-zero (file-based)**

### RSS Integration Deep Dive

**Problem Identified:**
- PAIA RSS skill fetches YouTube/podcasts but doesn't persist them
- High-value content gets lost after viewing
- User forgets resources exist when starting related projects

**Two-Part Solution:**

**Part 1: PAIA Enhancement (not Kindling work)**
- Add persistence: Save high-scoring items to `scored_content.json`
- Implement scoring system (manual save or auto-save 8+ rated)
- Auto-tag with Ollama (extract keywords from title/description)
- Store metadata: title, URL, score, tags, user notes

**Part 2: Kindling Integration**
- Read `scored_content.json` from PAIA directory
- Match resources to ideas via tag overlap + keyword similarity
- Display "Related Resources" panel on card detail view
- Show only 7.5+ scored items, top 3-5 most relevant
- Quick actions: Open link, add to notes

**Data Flow:**
```
User reviews RSS in PAIA (Telegram/Claude Code)
  ↓
Scores/saves high-value items
  ↓
PAIA writes to scored_content.json with auto-tags
  ↓
Kindling reads file on sync
  ↓
Matches resources to ideas
  ↓
Surfaces at point of need on cards
```

**Permasolution Status:** ✅
- File-based (no database)
- Ollama auto-tags (no manual work)
- Offline-capable
- Zero ongoing maintenance

### Key Design Decisions

**Architecture Choice: File-Based (No IndexedDB)**
- PAIA is pure markdown - keep it that way
- Kindling reads files directly (like current theme parser)
- No graph database needed (was over-engineering)

**Utility Filter Applied:**
- 70% of creative ideas deemed "cool but not useful"
- 30% solve actual blindspots (auto-tag, theme gaps, RSS linking)
- Focus on reducing manual work and revealing patterns

**Core Blindspots Being Solved:**
- Problem A: "I keep forgetting good resources I already found"
- Problem B: "I want context when starting projects" (auto-surfacing)
- Problem C: "My projects don't align with my stated themes"
- Problem D: "I'm working on too many similar things" (duplicate detection)

### Outstanding Planning Questions

**Before Building - Need User Input:**

1. **PAIA RSS Persistence:**
   - Does RSS skill already score content 1-10, or add this?
   - Save trigger: Manual "save this" command vs auto-save if watched >50%?
   - Tag strategy: Trust Ollama fully or allow manual editing?

2. **RSS Consumption Pattern:**
   - How many items reviewed per day/week?
   - How many are "save-worthy"?
   - Current interaction flow in Telegram/Claude Code?

3. **Rediscovery Behavior:**
   - Do you actively search for resources when starting projects?
   - Or prefer automatic surfacing without asking?
   - Would auto-suggestions feel helpful or noisy?

4. **Broader Vision:**
   - Is Kindling becoming a "project + research hub"?
   - Or more "let past learning resurface when relevant"?
   - Should it show ALL saved resources or only project-matched ones?

5. **Build Order:**
   - Start with PAIA persistence first, then Kindling integration?
   - Or mock RSS data in Kindling to prove UX first?

### Next Steps

**Phase 1 (PAIA work):**
1. Add persistence to RSS skill (scored_content.json)
2. Implement save/score mechanism
3. Add Ollama auto-tagging

**Phase 2 (Kindling work):**
1. Build auto-tag from themes
2. Build theme gap dashboard
3. Build RSS resource matching + UI

**Decision Point:** User to confirm Phase 1 approach before building.

### Files Modified
- None (brainstorming only)

### Technical Notes
- All features maintain permasolution principle (no maintenance burden)
- File-based architecture leverages existing PAIA structure
- Ollama integration already proven in Kindling chatbot
- Simple text matching sufficient for MVP (embeddings optional for v2)

---

## [2026-01-12-A] - Color Temperature System & Kanban Layout Mockups

### Added

**Color Temperature Progression:**
- Implemented intentional color temperature system for stage identification
- Stage colors follow fire metaphor from cool spark → warm action → cool completion:
  - **Spark/Idea** → Violet (#8b5cf6) - Cool potential energy, the initial spark
  - **Exploring** → Amber (#f59e0b) - Warm glow, gathering kindling
  - **Building/Active** → Orange (#fb923c) - Bright flame, active creation
  - **Waiting** → Rose (#e11d48) - Muted ember, banked coals
  - **Simmering** → Deep Red (#991b1b) - Low fire, slow simmer
  - **Shipped** → Emerald (#10b981) - Satisfying completion, warmth radiating
  - **Paused** → Slate (#64748b) - Desaturated gray, covered fire
- Cards now feature 3-4px left border accent in stage color
- Subtle background gradient (5-15% opacity) from stage color
- Kanban columns have colored top borders matching their stage
- Full dark mode support with adjusted brightness

**Kanban Layout Mockups:**
- Created `/kanban-layouts` experimental page with 4 different layout approaches
- Layout switcher to compare options side-by-side
- **Option 1: Collapsible Columns** - Click to collapse/expand individual columns to reduce horizontal scrolling
- **Option 2: Swimlane View** - Horizontal rows instead of vertical columns, no board scrolling needed
- **Option 3: Grouped Hybrid** - Stages grouped into Ideation/In Progress/Complete categories
- **Option 4: Responsive Widths** - Empty columns shrink, Active column expands, dynamic sizing

### Changed
- All idea cards now show stage via color temperature instead of just text labels
- Enhanced visual hierarchy makes stage identification instant and intuitive
- Color system works cohesively with existing fire theme

### Files Created
- `src/app/kanban-layouts/page.tsx` - Layout comparison playground

### Files Modified
- `src/app/globals.css` - Added color temperature CSS variables for all stages (light + dark mode)
- `src/components/IdeaCard.tsx` - Added left border accent and gradient background
- `src/components/DroppableColumn.tsx` - Added colored top border and gradient to columns

### Design Notes
- Color temperature system reduces visual clutter while improving information density
- Collapsible columns layout identified as preferred approach for main Kanban board
- Dashboard improvements deferred for future iteration

---

## [2026-01-11-L] - Password Documentation

### Added
- Documented that `SITE_PASSWORD` must be set in `.env` file for local development
- Password is required to access the deployed app; stored locally, not in git

---

## [2026-01-11-K] - Timeline Delete & UI Polish

### Added
- **Timeline Entry Deletion**: Hover over any timeline entry to reveal an X button for removal
  - Helps manage clutter from overtracking stage changes
  - Confirms before deletion, prevents removing the last entry
  - Removes specific stage history entries without affecting the idea itself

### Fixed
- **ChatBot Dark Mode Visibility**: Fixed nearly invisible UI elements in dark mode
  - X close button now uses `text-gray-400` (was too dark with CSS variable)
  - "Llama 3.1 via Ollama" subheader text lightened
  - Message timestamps lightened
  - "Thinking..." loading indicator lightened
  - Input placeholder text lightened
- **ChatBot Close Button**: Added `pointer-events-auto` to ensure clicks register
- **ChatBot Error Handling**: More specific error messages when Ollama connection fails
- **CSS Color Consistency**: Updated `--muted` to `--muted-foreground` across all pages for better text visibility
  - Dashboard, Kanban, Timeline, Insights pages
  - StatsCard and DroppableColumn components

### Files Modified
- `src/app/timeline/page.tsx` - Delete functionality for timeline entries
- `src/app/page.tsx` - Color consistency fixes
- `src/app/kanban/page.tsx` - Color consistency fixes
- `src/app/insights/page.tsx` - Color consistency fixes
- `src/components/ChatBot.tsx` - Dark mode fixes, close button fix, improved error handling
- `src/components/StatsCard.tsx` - Color consistency fix
- `src/components/DroppableColumn.tsx` - Color consistency fix

---

## [2026-01-11-J] - Security Hardening (High Priority)

### Added

**Zod Input Validation:**
- All API endpoints now validate input with Zod schemas
- `/api/ideas` POST validates title (1-200 chars), description (max 5K), stage, type, effort enums
- `/api/ideas/[id]` PATCH validates partial updates with strict schema (rejects unknown fields)
- `/api/sync` validates bulk idea array (max 1000 ideas) with full schema
- `/api/suggest` validates prompt (max 10K chars)
- `/api/chat` validates message (max 5K chars) and context arrays

**SSRF Protection:**
- Ollama endpoints (`/api/suggest`, `/api/chat`) now validate `OLLAMA_HOST`
- Only localhost connections allowed (127.0.0.1, localhost, ::1)
- Blocks internal network scanning via malicious environment variables

**Rate Limiting:**
- Created reusable rate limiter (`src/lib/rate-limit.ts`)
- AI endpoints limited to 20 requests/minute per IP
- Returns 429 with Retry-After header when exceeded

### Files Created
- `src/lib/rate-limit.ts` - In-memory rate limiting utility

### Files Modified
- `src/app/api/ideas/route.ts` - Zod validation for POST
- `src/app/api/ideas/[id]/route.ts` - Zod validation for PATCH
- `src/app/api/sync/route.ts` - Zod validation with full idea schema
- `src/app/api/suggest/route.ts` - SSRF protection, input validation, rate limiting
- `src/app/api/chat/route.ts` - SSRF protection, input validation, rate limiting

---

## [2026-01-11-I] - Security Hardening (Medium Priority)

### Added

**Security Headers** (`next.config.ts`)
- Content Security Policy (CSP) restricting script/style/connect sources
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

### Fixed

**Input Sanitization:**
- AI suggestions now sanitized before display (control chars removed, 5KB limit)
- Password field limited to 256 characters in AuthGate UI
- Export data validated and size-limited (10MB max)

**Error Message Verbosity:**
- API error details now hidden in production (only shown in development)
- Prevents information disclosure to potential attackers

### Files Modified
- `next.config.ts` - Security headers and CSP
- `src/components/IdeaModal.tsx` - AI suggestion sanitization
- `src/components/AuthGate.tsx` - Password input length limit
- `src/lib/storage.ts` - Export validation and size limits
- `src/app/api/ideas/route.ts` - Production error masking
- `src/app/api/data/route.ts` - Production error masking

---

## [2026-01-11-H] - Security Hardening (Critical)

### Fixed

**Critical Security Issues Resolved:**

1. **Authentication Hardening** (`src/app/api/auth/route.ts`)
   - Replaced plain string comparison with `crypto.timingSafeEqual()` to prevent timing attacks
   - Added rate limiting: 5 attempts per IP, 15-minute lockout after exceeded
   - Limited password input to 256 characters to prevent DoS via large payloads
   - Changed `sameSite` cookie attribute from `lax` to `strict` for better CSRF protection
   - Added proper error handling for malformed requests

2. **API Authentication** (`src/app/api/data/route.ts`)
   - Added authentication check to GET endpoint (was previously unprotected)
   - Added authentication check to POST `/api/data` endpoint (sheet initialization)
   - Both endpoints now require valid `kindling_auth` cookie when `SITE_PASSWORD` is set

### Security Review Summary
- Conducted full codebase security audit
- Verified `.env.local` is properly gitignored (never committed)
- Identified and fixed 3 critical vulnerabilities

### Files Modified
- `src/app/api/auth/route.ts` - Rate limiting, timing-safe comparison, input validation
- `src/app/api/data/route.ts` - Added authentication checks to GET and POST

---

## [2026-01-11-G] - Google Sheets Sync Fix (Complete)

### Fixed

**Private Key Parsing:**
- Fixed Netlify environment variable handling for Google service account private key
- Added robust `parsePrivateKey()` function with multiple parsing strategies
- Handles quoted keys, literal `\n` sequences, and JSON-encoded strings
- Root cause: Key was being truncated when pasted with real newlines; solution is to paste the entire key including surrounding double quotes

**API Route Error Handling:**
- Added `isGoogleSheetsConfigured()` check to all API routes
- Routes now return 503 "Service Unavailable" with clear message when env vars are missing
- Prevents cryptic crashes when Google Sheets credentials aren't configured
- App gracefully falls back to localStorage when API returns 503

**Netlify Configuration:**
- Restored explicit `@netlify/plugin-nextjs` plugin declaration
- Set Node.js version to 20 for build environment

### Added

**Bulk Sync Endpoint:**
- Added `/api/sync` POST endpoint for one-time localStorage to Sheets migration
- Added `bulkSyncIdeas()` function to google-sheets.ts
- Skips ideas that already exist (by ID), creates new ones

### Files Modified
- `src/lib/google-sheets.ts` - Added `parsePrivateKey()`, `isGoogleSheetsConfigured()`, `bulkSyncIdeas()`
- `src/app/api/data/route.ts` - Added config check with detailed error response
- `src/app/api/ideas/route.ts` - Added config check to GET and POST
- `src/app/api/ideas/[id]/route.ts` - Added config check to GET, PATCH, DELETE
- `src/app/api/sync/route.ts` - New bulk sync endpoint
- `netlify.toml` - Restored plugin declaration

---

## [2026-01-11-E] - Timeline Improvements

### Changed

**Milestone-Only Events:**
- Timeline now shows only the first time an idea enters each stage
- Eliminates noise from repeated back-and-forth transitions (e.g., Active → Waiting → Active)
- Provides cleaner view of actual project progression

**Collapsible Date Sections:**
- Last 7 days of events remain fully expanded by default
- Older date sections are collapsed with click-to-expand
- Chevron indicators show expand/collapse state for older dates

### Files Modified
- `src/app/timeline/page.tsx` - Milestone filtering and collapsible sections

---

## [2026-01-11-D] - UX Improvements & Category Refinement

### Changed

**Dashboard Redesign:**
- Consolidated 7 stat cards into cleaner visual hierarchy
- 4 primary cards: Ideas, Exploring, Active, Shipped
- Waiting & Simmering shown as badges under Active card
- Paused card with muted styling
- Eternal Flames card with special amber gradient

**Type Order Reversed (shortest to longest duration):**
- Torch (learning) → Test Spark (experiment) → Campfire (project) → Eternal Flame (permasolution)

**Effort Labels Simplified:**
- Removed confusing fire metaphors (Quick Strike, Kindling, Campfire, Bonfire, Inferno)
- Now clear labels: Trivial, Small, Medium, Large, Epic

**Kanban Drag & Drop Improvements:**
- Cards now tilt 3° and scale up slightly during drag
- Added shadow glow effect while dragging
- Improved collision detection - much easier to drop cards into columns
- Uses pointer-within detection (more forgiving than center-based)

**Chatbot:**
- Shortened header to "Llama 3.1 via Ollama"

### Removed
- Import button from sidebar (Export only now)

### Files Modified
- `src/lib/types.ts` - Reordered TYPE_CONFIG, simplified EFFORT_CONFIG labels
- `src/app/page.tsx` - Redesigned dashboard stats layout
- `src/app/kanban/page.tsx` - Custom collision detection for better drops
- `src/components/DraggableIdeaCard.tsx` - Tilt animation during drag
- `src/components/IdeaModal.tsx` - Updated type order
- `src/components/Sidebar.tsx` - Removed Import button
- `src/components/AppProvider.tsx` - Removed onImportClick prop
- `src/components/ChatBot.tsx` - Shortened model attribution

---

## [2026-01-11-C] - ChatBot & Start Date Feature

### Added

**AI Chatbot (Kindling Companion):**
- Slide-out chat panel available on all pages (Dashboard, Kanban, Timeline, Insights)
- Floating chat button in bottom-right corner
- Conversational AI powered by local Ollama
- Context-aware responses with access to all ideas, themes, and learnings
- Example prompts: "What patterns do you see?", "Which sparks should I focus on?"
- Mobile-responsive design (full screen on mobile, panel on desktop)

**Start Date for Backdating:**
- New "Started Date" field in idea creation/edit modal
- Auto-populates with today's date (PST timezone)
- Allows backdating for projects you forgot to add
- Timeline respects start date for accurate historical positioning
- "Backdated" badge shows on timeline for backdated entries

**7-Stage System Support:**
- Added `waiting` stage (blocked on feedback/dependency)
- Added `simmering` stage (slow background progress)
- Updated all components with new stage icons (Search, Clock icons)

### Files Created
- `src/components/ChatBot.tsx` - Slide-out AI chat component
- `src/app/api/chat/route.ts` - Conversational Ollama API endpoint

### Files Modified
- `src/lib/types.ts` - Added `startedAt` field, `waiting`/`simmering` stages
- `src/components/IdeaModal.tsx` - Added start date picker with PST auto-populate
- `src/components/AppProvider.tsx` - Integrated ChatBot component
- `src/app/timeline/page.tsx` - Uses startedAt for timeline positioning
- `src/components/IdeaCard.tsx` - Updated stage icons for 7-stage system
- `src/components/DroppableColumn.tsx` - Updated stage icons
- `src/components/SearchBar.tsx` - Updated stage icons and filters

---

## [2026-01-11-B] - Browser Title Update

### Changed
- Updated browser tab title from "Kindling | Where Ideas Catch Fire" to "Kindling | Ideas & Projects"

### Files Modified
- `src/app/layout.tsx` - Updated metadata title

---

## [2026-01-11-A] - Google Sheets Integration

### Added

**Cloud Sync via Google Sheets:**
- Ideas now sync to Google Sheets for cross-device access (laptop, desktop, phone)
- Real-time CRUD operations through API routes
- Automatic localStorage fallback for offline support
- Service account authentication for secure server-to-server access

**API Routes:**
- `GET/POST /api/ideas` - List and create ideas
- `GET/PATCH/DELETE /api/ideas/[id]` - Single idea operations
- `GET/POST /api/data` - Full data sync and sheet initialization

### Fixed
- Dark mode gray text contrast improved (#9c958b → #b8b0a5) for better readability

### Files Created
- `src/lib/google-sheets.ts` - Google Sheets storage adapter
- `src/app/api/ideas/route.ts` - Ideas collection API
- `src/app/api/ideas/[id]/route.ts` - Single idea API
- `src/app/api/data/route.ts` - Data sync API

### Files Modified
- `src/hooks/useIdeas.ts` - Added API calls with localStorage fallback
- `src/app/globals.css` - Fixed muted-foreground color in dark mode
- `package.json` - Added google-spreadsheet and googleapis packages

### Configuration
- Requires Google Cloud service account credentials in environment variables
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID`

---

## [2026-01-10-E] - Mouse Sparks & Password Protection

### Added

**Interactive Mouse Sparks:**
- Fire spark trail follows mouse cursor movement
- Orange/amber glowing particles drift upward like embers
- Touch support for mobile devices (touchmove/touchstart)
- Smooth physics with gradual fade-out
- Complements existing background ember particles

**Password Protection:**
- Simple password gate for private access
- 30-day cookie remembers authenticated devices
- Clean login UI with Kindling branding
- Password set via `SITE_PASSWORD` environment variable in Netlify
- No password required for local development

### Files Created
- `src/components/MouseSparks.tsx` - Canvas-based mouse trail animation
- `src/components/AuthGate.tsx` - Password protection wrapper
- `src/app/api/auth/route.ts` - Authentication API endpoint

### Files Modified
- `src/app/layout.tsx` - Wrapped app with AuthGate
- `src/components/AppProvider.tsx` - Added MouseSparks component
- `src/app/globals.css` - Added mouse-sparks-canvas styles
- `.env.local` - Added SITE_PASSWORD configuration

---

## [2026-01-10-D] - Matchstick Favicon

### Changed
- Replaced default favicon (black circle with white triangle) with custom matchstick design
- New favicon features a lit match with warm orange/yellow flame - fits the Kindling fire theme

### Added
- `src/app/icon.svg` - SVG matchstick favicon (scales crisp at any size)

### Removed
- `src/app/favicon.ico` - Old default favicon

---

## [2026-01-10-C] - GitHub & Netlify Setup

### Added
- Connected repository to GitHub: `michellealiem/kindling-project-idea-tracker`
- Configured Netlify auto-deployment from main branch
- Security headers in `netlify.toml` (X-Frame-Options, HSTS, etc.)
- Static asset caching configuration

### Infrastructure
- Repository: https://github.com/michellealiem/kindling-project-idea-tracker
- Hosting: Netlify (auto-deploys on push to main)

---

## [2026-01-10-B] - Rebrand to Kindling (Fire Theme)

### Changed

**Complete rebrand from "Idea Forge" to "Kindling"** with cohesive fire-themed terminology:

**App Branding:**
- App name: Idea Forge → **Kindling**
- Tagline: "Where ideas catch fire"

**Stage Labels:**
- Exploring → **Kindling** (Flame icon)
- Building → **Blazing** (Flame icon)
- Shipped → **Beacon** (Lightbulb icon)
- Paused → **Banked** (CircleDot icon)
- Spark unchanged (Zap icon)

**Type Labels:**
- Permasolution → **Eternal Flame** (Crown icon)
- Project → **Campfire**
- Experiment → **Test Spark**
- Learning → **Torch**

**Effort Labels:**
- Trivial → **Quick Strike**
- Small → **Kindling**
- Medium → **Campfire**
- Large → **Bonfire**
- Epic → **Inferno**

**Visual Effects:**
- Replaced snowflakes with **ember particles** floating upward
- Warm orange glowing particles that drift and fade as they rise

**UI Copy:**
- Loading states: "Stoking the fire...", "Tracing the flames..."
- Empty states: "No flames blazing yet", "Strike your first spark"
- Modal titles: "Strike a Spark", "Tend the Flame"
- Timeline: "Spark ignited", "Started kindling", "Now blazing", "Lit as beacon!", "Banked for later"

### Added
- `src/components/Embers.tsx` - New floating ember particle effect

### Removed
- `src/components/Snowflakes.tsx` - Replaced by Embers

### Files Modified
- `src/lib/types.ts` - Fire-themed stage/type/effort configs
- `src/components/Sidebar.tsx` - Kindling branding
- `src/components/IdeaCard.tsx` - Fire icons, "Eternal" badge
- `src/components/IdeaModal.tsx` - Fire-themed icons and copy
- `src/components/AppProvider.tsx` - Uses Embers instead of Snowflakes
- `src/app/page.tsx` - Dashboard fire-themed labels and copy
- `src/app/kanban/page.tsx` - Fire icons and descriptions
- `src/app/timeline/page.tsx` - Fire icons and stage descriptions
- `src/app/globals.css` - Ember animation CSS (emberRise, emberGlow, emberFlicker)

---

## [2026-01-10-A] - Initial Release

### Added

**Complete project tracker web app** with the following features:

**Core Features:**
- Dashboard with stats overview (sparks, exploring, building, shipped, permasolutions)
- Kanban board with 5 columns (Spark → Exploring → Building → Shipped → Paused)
- Timeline view showing project history and stage progressions
- Insights page for themes, learnings, and tag cloud

**Idea Management:**
- Create, edit, and delete ideas
- Stage tracking with automatic history
- Type classification: permasolution, project, experiment, learning
- Effort estimation: trivial, small, medium, large, epic
- Tag support for categorization
- Notes/annotations field

**PAIA Integration:**
- Import themes from `recurring_themes.md`
- Import learnings from `learnings.md`
- Automatic markdown parsing

**AI Suggestions (via local Ollama):**
- Spark development suggestions
- Progress check-ins
- New idea suggestions based on themes
- Theme connection insights

**Data Management:**
- localStorage persistence
- JSON export/import for backup
- Cross-device sync via export

**Technical:**
- Next.js 14 with TypeScript
- Tailwind CSS for styling
- Responsive design (desktop + mobile)
- Dark mode support
- Netlify deployment ready

### Files Created
- `src/app/` - All page components
- `src/components/` - Reusable UI components
- `src/lib/` - Utilities and type definitions
- `src/hooks/` - React hooks
- `netlify.toml` - Deployment configuration

---

**Last Updated:** 2026-01-11L
