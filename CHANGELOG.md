# Kindling - Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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

**Last Updated:** 2026-01-11I
