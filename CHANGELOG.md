# Kindling - Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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

**Last Updated:** 2026-01-10
