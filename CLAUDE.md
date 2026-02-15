# Lomito — Civic Animal Welfare Platform

## Project Overview

Lomito is an open-source, map-centric platform for reporting and tracking animal welfare issues in Mexico (launching in Tijuana, Baja California). It provides jurisdiction-aware case tracking, government accountability via email escalation and transparency dashboards, and public impact metrics. The domain is lomito.org.

## Architecture

- **Mobile + Web:** React Native (Expo SDK 52+) with Expo Router v4 (file-based routing). Single codebase targeting iOS, Android, and web.
- **Backend:** Supabase (PostgreSQL + PostGIS for geospatial, Auth, Realtime, Storage, Edge Functions).
- **Maps:** Mapbox GL (react-native-mapbox-gl on native, mapbox-gl-js on web).
- **Notifications:** Firebase Cloud Messaging (push) + Resend (email).
- **Payments:** Mercado Pago (Mexico: OXXO, SPEI) + Stripe (international).
- **Analytics:** PostHog (public-facing dashboard, 1M events/month free tier).
- **i18n:** react-i18next. Spanish (es-MX) primary, English secondary.

## Monorepo Structure

```
lomito/
├── apps/mobile/          # Expo app (iOS + Android + Web)
│   ├── app/              # Expo Router file-based routes
│   ├── components/       # Screen-specific components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Supabase client, PostHog, Mapbox config
│   └── assets/           # Fonts, images, icons
├── packages/
│   ├── shared/           # Types, constants, i18n translations, utils
│   │   └── i18n/         # es.json, en.json
│   └── ui/               # Shared UI component library
├── supabase/
│   ├── migrations/       # SQL migration files
│   ├── seed/             # Seed data (jurisdictions, test cases)
│   └── functions/        # Edge Functions
├── docs/                 # Specs, plans, style guide, ADRs
├── .claude/              # Claude Code config (agents, rules, settings)
├── CLAUDE.md             # This file
└── package.json          # Root workspace config
```

## Code Conventions

- **Language:** TypeScript strict mode throughout. No `any`. All code, comments, variable names, commit messages, and documentation in **English**.
- **Spanish appears ONLY in:** `packages/shared/i18n/es.json` and user-facing legal documents in `docs/legal/`.
- **Naming:** camelCase (variables/functions), PascalCase (components/types), SCREAMING_SNAKE (constants), kebab-case (filenames).
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`). One logical change per commit.
- **Formatting:** Prettier (semi: true, singleQuote: true, trailingComma: 'all'). ESLint with @typescript-eslint.
- **Testing:** Vitest for unit tests, React Native Testing Library for components.
- **Components:** Functional components only. Hooks for state. No class components.
- **Images:** Use `expo-image` (not `Image` from react-native). Lazy loading with blurhash placeholders.
- **Navigation:** Expo Router v4. File-based routing. Native stack with platform-appropriate transitions.
- **Animations:** react-native-reanimated 4 for native animations. Respect `prefers-reduced-motion`.

## Design System Tokens (Quick Reference)

```
Primary:      #13ECC8 (mint)           Secondary:  #1E293B (navy)
Primary Dark: #0FBDA0 (darker mint)    Accent:     #F2994A (warm orange)
Neutral 900:  #1E293B (navy/slate)     Neutral 100: #F6F8F8 (cool off-white)
Error:        #DC2626    Warning: #F59E0B    Success: #059669    Info: #2563EB

Fonts: Public Sans (all text), JetBrains Mono (code/IDs)
Spacing: 4px base grid (4, 8, 16, 24, 32, 48)
Border Radius: cards 12px, buttons 8px, inputs 8px, tags 6px, pills 9999px
Shadows: Neutral-toned (rgba(0,0,0,0.06)) not warm defaults
```

Full token reference: `docs/style/DESIGN_TOKENS.md`

## Key Technical Decisions

1. **Expo managed workflow** with custom dev client (no ejecting). EAS Build for native binaries, EAS Update for OTA.
2. **PostGIS** for all geospatial: jurisdiction boundary polygons, case location points, proximity queries, viewport-bounded map queries.
3. **Row Level Security (RLS)** enforces jurisdiction scoping. Moderators and government users only see cases in their assigned jurisdictions.
4. **Client-side image compression** before upload: max 1200px, JPEG 0.8, EXIF GPS stripped.
5. **Skeleton screens** for loading states, not spinners.
6. **No WebView anywhere on native.** Every screen is pure React Native.
7. **FlatList/FlashList** for all lists. Cursor-based pagination.

## Database Schema (Core Tables)

- `profiles` — extends auth.users: name, phone, municipality, role, avatar_url
- `jurisdictions` — id, name, parent_id, level, geometry (PostGIS), authority_name/email/phone/url, escalation_enabled, verified
- `user_jurisdictions` — user_id, jurisdiction_id (junction for role scoping)
- `cases` — id, reporter_id, category, animal_type, description, location (PostGIS point), jurisdiction_id (auto-assigned), urgency, status, timestamps
- `case_media` — id, case_id, url, type, thumbnail_url, order
- `case_timeline` — id, case_id, actor_id, action, details (JSONB), created_at
- `case_subscriptions` — user_id, case_id
- `donations` — id, amount, currency, method, donor_id, recurring, created_at

## Performance Budgets

- App cold start: < 2s | Map first paint: < 1.5s
- JS bundle (mobile): < 2MB | JS bundle (web initial): < 500KB
- Images: client-compress to < 400KB before upload

## Agent Orchestration

This project uses Claude Code's **native Task system** for work tracking and **subagent delegation** for execution.

### How it works

1. Start with `CLAUDE_CODE_TASK_LIST_ID=lomito` so tasks persist across sessions.
2. The orchestrator (main session on Opus) creates tasks with dependencies via `TaskCreate`.
3. Each task is delegated to a subagent (Sonnet) with fresh context.
4. Subagents read the relevant spec from `docs/` before coding.
5. Each completed task = one atomic commit (run typecheck + lint first).
6. Blockers logged to `docs/plans/ISSUES.md`, then move to next unblocked task.

### Subagent routing

- **Orchestrator (main):** Opus — planning, decomposition, verification
- **Implementation subagents:** Sonnet — focused coding tasks
- **Reviewer subagent:** `.claude/agents/reviewer.md` — read-only code review

### Domain parallel patterns

Dispatch parallel subagents when work spans independent domains:

- **Frontend agent:** React Native components, UI, navigation
- **Backend agent:** Supabase schema, migrations, RLS, Edge Functions
- **Shared agent:** Types, i18n strings, constants, utilities

### Task hydration on session start

If resuming work, run: `Show me all tasks` to reload state. If no tasks exist, read `docs/plans/ORCHESTRATION.md` and hydrate from the phase spec.

## Reference Documents

- `docs/specs/PRD.md` — Full product requirements
- `docs/specs/ENGINEERING_GUIDE.md` — Architecture, performance, analytics, i18n, kickoff checklist
- `docs/style/DESIGN_TOKENS.md` — Complete design token reference
- `docs/plans/ORCHESTRATION.md` — Phased task definitions for hydration
- `docs/plans/ISSUES.md` — Blockers needing human input

## Compact Instructions

When context is compacted, preserve:

1. The monorepo structure and which packages exist
2. Current task list state (done, in progress, blocked)
3. Active subagent assignments
4. Unresolved entries in ISSUES.md
5. Design token values (colors, fonts, spacing)
