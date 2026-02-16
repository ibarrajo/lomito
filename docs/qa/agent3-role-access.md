# QA Report: Role-Based Access Control

**Agent:** QA Agent 3
**Date:** 2026-02-16
**Environment:** http://localhost:8081 (Expo Web, 1440x900)
**Test Area:** Role-based navigation visibility and route protection

---

## Summary

The **navbar link visibility** works correctly per role, but there is **NO route-level access control** on restricted pages. Any authenticated user can directly navigate to `/moderation` or `/government` via URL and access the full content. This is a **P0 security vulnerability**. Additionally, the `/moderation` page crashes with a JavaScript error for all roles (including the intended moderator/admin users).

---

## Navbar Visibility Matrix

| Navbar Link      | Citizen (maria) | Moderator (mod) | Government (gov) | Admin (dev) | Expected         |
| ---------------- | :-------------: | :-------------: | :--------------: | :---------: | ---------------- |
| Mapa             |        Y        |        Y        |        Y         |      Y      | All              |
| Tablero          |        Y        |        Y        |        Y         |      Y      | All              |
| Acerca de Lomito |        Y        |        Y        |        Y         |      Y      | All              |
| Donar            |        Y        |        Y        |        Y         |      Y      | All              |
| Moderacion       |        N        |        Y        |        N         |      Y      | mod+admin        |
| Gobierno         |        N        |        N        |        Y         |      Y      | gov+admin        |
| Nuevo reporte    |        Y        |        Y        |        Y         |      Y      | All              |
| Avatar initials  |       MG        |       AR        |        RS        |     DA      | Correct per user |

**Navbar verdict: PASS** -- All navbar links are correctly shown/hidden based on role.

---

## Route Access Results

| Route         | Citizen                                 | Moderator                               | Government                   | Admin                        | Expected                                           |
| ------------- | --------------------------------------- | --------------------------------------- | ---------------------------- | ---------------------------- | -------------------------------------------------- |
| `/moderation` | JS crash (ReviewDetailPanel)            | JS crash (ReviewDetailPanel)            | JS crash (ReviewDetailPanel) | JS crash (ReviewDetailPanel) | Citizen/Gov: blocked; Mod/Admin: moderation queue  |
| `/government` | **FULL ACCESS** to Portal gubernamental | **FULL ACCESS** to Portal gubernamental | Full access (correct)        | Full access (correct)        | Citizen/Mod: blocked; Gov/Admin: government portal |

### Detailed Route Access Findings

#### Citizen accessing `/moderation`

- **Result:** JavaScript error crash -- `TypeError: Cannot read properties of undefined (reading '0')` in `review-detail-panel.tsx:102`
- **What renders:** Red error overlay with stack trace (Expo dev error screen)
- **Screenshot:** `docs/qa/screenshots/citizen-moderation-1440.png`
- **Assessment:** The crash happens because `caseData.location.coordinates[0]` is undefined (no case is selected). This is NOT an access control block -- it is an unrelated bug that coincidentally prevents data display. A citizen should be explicitly denied access.

#### Citizen accessing `/government`

- **Result:** FULL DATA VISIBLE -- "Portal gubernamental", 30 case records with folios, categories, urgency levels, escalation status, dates
- **Visible data includes:** Folio numbers (TJ-2026-018, etc.), case categories (Maltrato, Herido, Callejero), urgency levels (Alta, Critica), escalation days, case status
- **Screenshot:** `docs/qa/screenshots/citizen-government-1440.png`
- **Assessment:** Complete access control bypass. A citizen sees everything a government user sees.

#### Moderator accessing `/government`

- **Result:** FULL DATA VISIBLE -- identical to citizen accessing `/government`
- **Screenshot:** `docs/qa/screenshots/moderator-government-1440.png`
- **Assessment:** Moderators should not have access to the government portal.

#### Admin accessing `/moderation`

- **Result:** Same JS crash as all other roles. The crash is caused by `ReviewDetailPanel` rendering without a selected case.
- **Assessment:** The moderation page is broken for ALL roles, not just unauthorized ones.

---

## Root Cause Analysis

### Why route protection is missing

The role-based visibility is implemented in two places, both of which only control **UI visibility**, not **access**:

1. **`apps/mobile/components/navigation/web-navbar.tsx`** (lines 62-65, 194-223):

   ```typescript
   const isModerator =
     profile?.role === 'moderator' || profile?.role === 'admin';
   const isGovernment =
     profile?.role === 'government' || profile?.role === 'admin';
   // ... conditionally renders nav links
   ```

2. **`apps/mobile/app/(tabs)/_layout.tsx`** (lines 21-24, 55-76):
   ```typescript
   const isModerator =
     profile?.role === 'moderator' || profile?.role === 'admin';
   const isGovernment =
     profile?.role === 'government' || profile?.role === 'admin';
   // ... conditionally renders Tabs.Screen
   ```

Neither the screen files (`moderation.tsx`, `government.tsx`) nor the layout file performs any access check or redirect. Hiding a tab in Expo Router does NOT prevent direct URL navigation to the route.

### Why `/moderation` crashes

The `ReviewDetailPanel` component at `components/moderation/review-detail-panel.tsx:102` accesses `caseData.location.coordinates[0]` without null-checking. When no case is selected (or when the component renders on initial load), `caseData.location` is undefined, causing the crash.

---

## Console Errors

### Recurring across all roles

- `Failed to load resource: 401 (Unauthorized)` on `/functions/v1/track-event` -- analytics edge function returns 401 for all requests
- `"shadow*" style props are deprecated` -- React Native Web deprecation warnings
- `"textShadow*" style props are deprecated` -- React Native Web deprecation warnings
- `Layout children must be of type Screen` -- Expo Router warnings about non-Screen children in layout
- `props.pointerEvents is deprecated` -- React Native Web deprecation
- `Encountered two children with the same key` -- duplicate key errors in lists

### Moderation-specific errors

- `TypeError: Cannot read properties of undefined (reading '0')` in `ReviewDetailPanel` at `review-detail-panel.tsx:102:50`
- This error triggers React error boundary (LogBoxStateSubscription)

### Government-specific errors

- No additional errors beyond the recurring ones (the page loads successfully for ALL roles)

---

## Issues Found

| ID      | Severity | Title                                                           | Description                                                                                                                                                                                                                                                 |
| ------- | -------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RBAC-01 | **P0**   | No route-level access control on `/government`                  | Any authenticated user (citizen, moderator) can navigate directly to `/government` and view the full government portal with all case data, folios, urgency levels, and escalation status. Data is fully visible and interactive.                            |
| RBAC-02 | **P0**   | No route-level access control on `/moderation`                  | Any authenticated user can navigate to `/moderation`. Currently masked by a crash bug (RBAC-03), but if that bug is fixed, citizen and government users would have full access to the moderation queue.                                                     |
| RBAC-03 | **P1**   | Moderation page crashes on load (`review-detail-panel.tsx:102`) | `ReviewDetailPanel` accesses `caseData.location.coordinates[0]` without null-checking. Crashes with `TypeError: Cannot read properties of undefined (reading '0')` for ALL roles including moderator and admin. The moderation page is completely unusable. |
| RBAC-04 | **P2**   | Analytics edge function returns 401 for all requests            | `/functions/v1/track-event` consistently returns 401 Unauthorized. This affects event tracking for all users.                                                                                                                                               |
| RBAC-05 | **P3**   | Avatar initials show "?" for moderator on moderation page       | When the moderator navigates to the moderation page, the avatar initials briefly show "?" instead of the user's initials, suggesting a profile loading race condition.                                                                                      |
| RBAC-06 | **P3**   | Deprecated React Native Web style prop warnings                 | Multiple warnings for `shadow*`, `textShadow*`, and `pointerEvents` deprecated props throughout the app.                                                                                                                                                    |
| RBAC-07 | **P3**   | Duplicate key warnings in list rendering                        | `Encountered two children with the same key` errors appear when navigating between pages, suggesting key generation issues in FlatList/map renders.                                                                                                         |

---

## Screenshot Inventory

| File                                                 | Description                                                                |
| ---------------------------------------------------- | -------------------------------------------------------------------------- |
| `docs/qa/screenshots/navbar-citizen-1440.png`        | Citizen navbar -- Map, Dashboard, About, Donate (no Moderation/Government) |
| `docs/qa/screenshots/citizen-moderation-1440.png`    | Citizen accessing /moderation -- JS error crash screen                     |
| `docs/qa/screenshots/citizen-government-1440.png`    | Citizen accessing /government -- FULL government portal visible            |
| `docs/qa/screenshots/navbar-moderator-1440.png`      | Moderator navbar -- includes Moderation, no Government                     |
| `docs/qa/screenshots/moderator-government-1440.png`  | Moderator accessing /government -- FULL government portal visible          |
| `docs/qa/screenshots/government-moderation-1440.png` | Government accessing /moderation -- JS error crash screen                  |
| `docs/qa/screenshots/navbar-government-1440.png`     | Government navbar -- includes Government, no Moderation                    |
| `docs/qa/screenshots/navbar-admin-1440.png`          | Admin navbar -- includes both Moderation and Government                    |

---

## Recommended Fixes

### P0: Route Guards (RBAC-01, RBAC-02)

Add a role-check guard component to the moderation and government screens:

```typescript
// In moderation.tsx and government.tsx, add at the top of the component:
const { profile, loading } = useUserProfile();
const router = useRouter();

// For moderation:
if (!loading && profile?.role !== 'moderator' && profile?.role !== 'admin') {
  router.replace('/');
  return null;
}

// For government:
if (!loading && profile?.role !== 'government' && profile?.role !== 'admin') {
  router.replace('/');
  return null;
}
```

Alternatively, create a reusable `<RoleGuard requiredRoles={['moderator', 'admin']}>` wrapper component.

### P1: Fix ReviewDetailPanel crash (RBAC-03)

Add null-checking in `review-detail-panel.tsx:102`:

```typescript
const longitude = caseData?.location?.coordinates?.[0] ?? 0;
const latitude = caseData?.location?.coordinates?.[1] ?? 0;
```

Or conditionally render the panel only when a case is selected.
