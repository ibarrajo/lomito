---
description: Code quality rules for all Lomito contributions
globs: ['**/*.ts', '**/*.tsx']
---

# Code Quality Rules

## TypeScript

- Strict mode. No `any`. No `@ts-ignore`. No `@ts-expect-error` without a linked issue.
- Prefer `unknown` over `any` when type is genuinely unknown.
- Use discriminated unions for state machines (case status, report category).
- All API responses must be typed. Use Supabase's generated types.

## React Native

- Functional components only. Use hooks.
- Use `expo-image` instead of `Image` from react-native.
- Use `FlatList` or `FlashList` for lists. Never `ScrollView` with `.map()`.
- Bottom sheets via `@gorhom/bottom-sheet`.
- Animations via `react-native-reanimated`. No `Animated` from react-native.

## Accessibility

- All interactive elements must have `accessibilityLabel` (or `aria-label` on web).
- All images must have `alt` text or `accessibilityLabel`.
- Touch targets: minimum 44x44px.
- Color is never the sole indicator of state. Always pair with text or icon.
- Test with VoiceOver (iOS) and TalkBack (Android).

## Performance

- Memoize expensive computations with `useMemo`.
- Memoize callbacks passed to child components with `useCallback`.
- Use `React.memo` for list item components.
- Lazy load screens via Expo Router async routes.
- Images: blurhash placeholder, progressive loading, WebP format.

## i18n

- Every user-facing string uses `t('namespace.key')`.
- Keys in English: `map.filter.category`, `report.form.description`.
- Both `es.json` and `en.json` must be updated in the same commit.
- Pluralization: use i18next plural rules.
- Dates: format with `date-fns` using the user's locale.

## Security

- Never expose Supabase service role key in client code.
- Use Supabase anon key + RLS for all client queries.
- Sanitize all user input before database insertion.
- Strip EXIF data from images before upload.
- Rate limit: client-side debounce on all API calls.
