# Study Desk - Project Memory

## Project Overview
Scripture study companion PWA optimized for tablet landscape. Split-pane layout: always-visible journal editor (left) + resource viewer for scriptures and conference talks (right). Warm & papery aesthetic. Vanilla React + Vite + TailwindCSS + TipTap + Dexie.js. No build step beyond Vite.

## Architecture Notes
- Offline-first: Dexie.js (IndexedDB) for all local data, Firebase for future cloud sync
- Standard Works bundled as JSON (~5MB), Conference talks fetched via Open Scripture API and cached
- TipTap rich text editor for journal entries (same patterns as Organize Yourselves)
- Session state persisted in Dexie sessionState table (key-value store)
- PWA with service worker for offline capability
- HashRouter for GitHub Pages compatibility

## Tech Stack
- React 18, Vite 5, TailwindCSS 3.3
- TipTap 3.x (StarterKit + Underline + Placeholder)
- Dexie 3.2 + dexie-react-hooks
- lucide-react for icons, date-fns for dates
- Firebase (future: auth + Firestore sync)

## Design System
- **Colors:** parchment (cream), ink (warm gray), gold (accent), highlight (gold/red/green/blue)
- **Fonts:** Lora (serif, journal/scripture), Inter (sans, UI)
- **Aesthetic:** Warm & papery — cream backgrounds, warm browns, subtle paper texture

## Key Files
- `src/db.js` — Dexie database: journalEntries + sessionState
- `src/hooks/useDb.js` — useLiveQuery hooks for reactive data
- `src/components/journal/JournalEditor.jsx` — TipTap editor with auto-save
- `src/components/layout/AppShell.jsx` — CSS Grid split-pane layout

## Phases
- Phase 1: Core layout, design system, journal editor (COMPLETE)
  - Phase 1 Polish: Tags, dark mode, backup/restore, settings page (COMPLETE)
- Phase 2: Scripture reader with bundled Standard Works
- Phase 3: Conference talks via Open Scripture API
- Phase 4+: Annotations, cross-references, topic index, talk prep, AI features

## Phase 1 Polish Details
- **Tag system:** add/remove tags on entries (chips + input), autocomplete from existing tags, tag filter in sidebar (dropdown) and library (clickable pills with AND logic), tag chips on sidebar entries and entry cards
- **Dark mode:** warm dark palette (dark-bg #1a1712, dark-surface #252017, dark-border #3d3528, dark-muted #4a3f30), ThemeToggle component with Sun/Moon icons, persisted in Dexie sessionState, applied via `dark` class on `<html>`, dark: variants on all components
- **Backup & restore:** JSON export (versioned payload with metadata), JSON import with confirmation modal, BackupRestore component on Settings page
- **Settings page:** `/settings` route, cards for Appearance (theme toggle) + Data (backup/restore) + About, gear icon in JournalPane toolbar
- **TipTap:** downgraded to v2.27.2 (v3.20+ ships without dist/)
