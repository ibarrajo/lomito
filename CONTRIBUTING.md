# Contributing to Lomito

Thank you for your interest in contributing to Lomito! This document provides guidelines and workflows to help you contribute effectively.

## Code of Conduct

This project adheres to the Contributor Covenant [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to conduct@lomito.org.

## Getting Started

### Prerequisites

Before you begin, ensure you have:
- Node.js 18+ (Node 20+ recommended)
- npm 9+
- Expo CLI installed globally (`npm install -g expo-cli`)
- Supabase CLI installed globally (`npm install -g supabase`)
- A Supabase account (free tier is sufficient for development)
- A Mapbox account for map API access

### Fork, Clone, and Install

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/lomito.git
   cd lomito
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables:
   ```bash
   cp apps/mobile/.env.example apps/mobile/.env
   ```
   Fill in the required API keys (Supabase URL, Supabase anon key, Mapbox token, etc.)

5. Start local Supabase and apply migrations:
   ```bash
   npx supabase start
   npx supabase db reset
   ```

6. Start the development server:
   ```bash
   npx expo start
   ```

## Development Workflow

### Branching Strategy

- `main` is the default branch and should always be deployable
- Create a new branch for each feature or bug fix:
  ```bash
  git checkout -b feat/your-feature-name
  git checkout -b fix/your-bug-fix-name
  ```

### Conventional Commits

All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat:` — New feature
- `fix:` — Bug fix
- `chore:` — Maintenance tasks, dependency updates
- `docs:` — Documentation changes
- `style:` — Code style/formatting (not design/UI changes)
- `refactor:` — Code restructuring without behavior change
- `test:` — Adding or updating tests
- `perf:` — Performance improvements

**Examples:**
```
feat: add community flagging to case detail screen
fix: prevent duplicate jurisdiction assignment on case update
docs: update README with Mercado Pago integration steps
chore: upgrade expo to SDK 52
```

### Before Submitting a Pull Request

Run the following checks locally:

1. **Type checking:**
   ```bash
   npx tsc --noEmit
   ```

2. **Linting:**
   ```bash
   npx eslint . --max-warnings 0
   ```

3. **Formatting:**
   ```bash
   npm run format
   ```

All checks must pass before submitting a PR.

## Code Conventions

### TypeScript

- **Strict mode enabled.** No `any` types. Use `unknown` if type is genuinely unknown.
- No `@ts-ignore` or `@ts-expect-error` without a linked GitHub issue explaining why.
- Use discriminated unions for state machines (case status, report category).
- All API responses must be typed using Supabase-generated types.

### Naming Conventions

- **Variables and functions:** camelCase (`fetchCaseById`, `userName`)
- **Components and types:** PascalCase (`CaseCard`, `UserProfile`)
- **Constants:** SCREAMING_SNAKE_CASE (`MAX_IMAGE_SIZE`, `DEFAULT_ZOOM_LEVEL`)
- **Filenames:** kebab-case (`case-detail.tsx`, `use-jurisdiction.ts`)

### React Native Best Practices

- **Functional components only.** Use hooks for state management.
- Use `expo-image` instead of `Image` from react-native.
- Use `FlatList` or `FlashList` for lists. Never use `ScrollView` with `.map()`.
- All interactive elements must have `accessibilityLabel` or `aria-label` (web).
- Touch targets must be at least 44x44 pixels.
- Use design tokens for all colors, spacing, and typography. Never hardcode values.

### i18n (Internationalization)

- **Every user-facing string** must use the `t('namespace.key')` function from react-i18next.
- Translation keys should be in English: `map.filter.category`, `report.form.description`
- **Both `packages/shared/src/i18n/es.json` and `en.json` must be updated in the same commit.**
- Use i18next plural rules for pluralization.
- Format dates with `date-fns` using the user's locale.

### Design System

All UI must use design tokens defined in `docs/style/DESIGN_TOKENS.md`:

- **Colors:** Use theme tokens (`theme.colors.primary`, `theme.colors.neutral[900]`), never hardcoded hex values.
- **Spacing:** Use 4px base grid (4, 8, 16, 24, 32, 48).
- **Typography:** DM Sans (headings), Source Sans 3 (body), JetBrains Mono (code/IDs).
- **Border radius:** cards 12px, buttons 8px, inputs 8px, pills 9999px.

## Testing

- **Unit tests:** Use Vitest for utility functions and business logic.
- **Component tests:** Use React Native Testing Library (RNTL) for component behavior.
- Place test files next to the code they test: `case-card.tsx` → `case-card.test.tsx`
- Test coverage is not enforced, but aim for meaningful tests on critical paths (auth, case submission, jurisdiction assignment).

## Pull Request Process

1. **Update your branch** with the latest changes from `main`:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Create a descriptive PR title** following Conventional Commits format:
   ```
   feat: add auto-escalation reminders for government cases
   fix: prevent crash when loading case with no media
   ```

3. **Fill out the PR template** with:
   - Summary of changes
   - Link to related issue (if applicable)
   - Testing steps
   - Screenshots/videos for UI changes
   - Checklist confirming tests pass, types check, i18n updated

4. **Ensure all CI checks pass.** PRs with failing checks will not be reviewed.

5. **Request review** from a maintainer. Be responsive to feedback.

6. **Once approved,** a maintainer will merge your PR.

## Issue Guidelines

### Reporting Bugs

When reporting a bug, include:
- **Steps to reproduce** the issue
- **Expected behavior** vs. **actual behavior**
- **Device and OS version** (e.g., iPhone 12, iOS 17.2)
- **App version** or commit hash
- **Screenshots or videos** if applicable
- **Logs or error messages** from console

### Proposing Features

When proposing a feature:
- **Describe the problem** the feature solves
- **Explain the proposed solution** with mockups or wireframes if applicable
- **Consider alternatives** and explain why your approach is preferred
- **Check existing issues** to avoid duplicates

## Questions?

If you have questions about contributing, feel free to:
- Open a [GitHub Discussion](https://github.com/your-org/lomito/discussions)
- Ask in the issue you're working on
- Reach out to the maintainers

Thank you for contributing to Lomito!
