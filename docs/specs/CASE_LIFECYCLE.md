# Case Lifecycle & State Machine

This document defines the complete lifecycle of a case (report) in Lomito, from citizen submission through resolution or archival.

## Status Definitions

| Status        | Meaning                                                                                                                                               | Who sets it                      | Visible to public? |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ------------------ |
| `pending`     | Freshly submitted. Awaiting moderator review. No action taken yet.                                                                                    | System (default on INSERT)       | Yes                |
| `verified`    | A moderator has confirmed the report is legitimate and actionable. Eligible for escalation to authorities.                                            | Moderator                        | Yes                |
| `in_progress` | An authority or moderator is actively working the case. Government may have been notified or assigned a folio.                                        | Moderator or Government          | Yes                |
| `resolved`    | The case reached a final outcome — animal rescued, situation remediated, or otherwise closed.                                                         | Moderator or Government          | Yes                |
| `rejected`    | A moderator determined the report is invalid, duplicate, or not actionable. Includes a rejection reason.                                              | Moderator                        | Yes (dimmed)       |
| `archived`    | Hidden from default views. Reached via: (a) 3+ community flags trigger auto-archive, or (b) manual moderator/admin action on old or irrelevant cases. | System (auto) or Moderator/Admin | No (hidden)        |

## State Machine

```
                                ┌─────────────┐
                    ┌──────────>│  rejected   │
                    │           └─────────────┘
                    │
┌─────────┐   ┌────┴────┐   ┌──────────┐   ┌─────────────┐   ┌──────────┐
│ (submit)├──>│ pending ├──>│ verified ├──>│ in_progress ├──>│ resolved │
└─────────┘   └────┬────┘   └────┬─────┘   └──────┬──────┘   └────┬─────┘
                   │             │                 │                │
                   │             │                 │                │
                   v             v                 v                v
              ┌────────────────────────────────────────────────────────┐
              │                       archived                         │
              └────────────────────────────────────────────────────────┘
```

### Allowed Transitions

| From          | To            | Trigger                                     | Actor                 |
| ------------- | ------------- | ------------------------------------------- | --------------------- |
| _(new)_       | `pending`     | Citizen submits report form                 | System                |
| `pending`     | `verified`    | Moderator approves the case                 | Moderator             |
| `pending`     | `rejected`    | Moderator dismisses with reason             | Moderator             |
| `pending`     | `archived`    | 3 community flags (auto)                    | System                |
| `verified`    | `in_progress` | Authority begins work or moderator advances | Government, Moderator |
| `verified`    | `archived`    | 3 community flags or manual                 | System, Moderator     |
| `in_progress` | `resolved`    | Authority or moderator closes the case      | Government, Moderator |
| `in_progress` | `archived`    | Manual archival of stale case               | Moderator, Admin      |
| `resolved`    | `archived`    | Manual archival (cleanup)                   | Admin                 |
| `rejected`    | `pending`     | Admin reopens a mistakenly rejected case    | Admin                 |
| `archived`    | `pending`     | Admin reopens an archived case              | Admin                 |
| Any           | Any           | Admin override (DB trigger allows bypass)   | Admin                 |

### Transitions That Should NOT Happen

These are enforced at the DB level by the `validate_status_transition` BEFORE UPDATE trigger (migration `20260218100000`). Non-admin attempts raise an exception:

- `rejected` -> any status (terminal; admins can reopen to `pending`)
- `archived` -> any status (terminal; admins can reopen to `pending`)
- `resolved` -> `pending` or `verified` (no backwards movement)
- `in_progress` -> `pending` (no backwards movement)
- `verified` -> `pending` (no backwards movement)

> **Note:** The `validate_case_status_transition` trigger enforces all transitions. Admins (role = `admin` in `profiles`) bypass the guard and can force any transition, including reopening rejected/archived cases.

## Report Submission Flow

### What the citizen does

```
Step 0: Category + Animal Type
Step 1: Pin location on map + optional location notes
Step 2: Incident timestamp + description + urgency level
Step 3: Photos (optional, up to 5)
Step 4: Review & submit
```

### What happens on submit

| Order | What                         | Where                                              | Details                                                                                 |
| ----- | ---------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1     | Case row INSERT              | `cases` table                                      | Status defaults to `pending`, urgency defaults to `medium`                              |
| 2     | Auto-assign jurisdiction     | `auto_assign_jurisdiction` trigger (BEFORE INSERT) | PostGIS `ST_Contains` finds the smallest jurisdiction polygon containing the case point |
| 3     | Generate folio               | `generate_case_folio` trigger (BEFORE INSERT)      | Format: `TIJ-2026-000001` (prefix from jurisdiction name)                               |
| 4     | Create timeline entry        | `auto_create_timeline` trigger (AFTER INSERT)      | Action: `created`, details: `{ category, urgency }`                                     |
| 5     | Subscribe reporter           | `auto_subscribe_reporter` trigger (AFTER INSERT)   | Reporter receives push notifications on future updates                                  |
| 6     | Upload photos                | App code (after INSERT succeeds)                   | Client-compressed images uploaded to Supabase Storage, `case_media` rows inserted       |
| 7     | Explicit subscription upsert | App code                                           | Redundant safety net if follow-up opt-in is enabled                                     |

**No notification is sent on creation.** The `created` action is intentionally excluded from the notification trigger — there is no one to notify yet except the reporter who just submitted.

## Status Lifecycle Detail

### pending -> verified

**Who:** Moderator (via moderation queue)

**What happens:**

1. Moderator reviews the case in their jurisdiction queue (sorted by urgency DESC, then age)
2. Calls `updateCaseStatus(caseId, 'verified')`
3. `cases.status` updated to `verified`
4. `case_timeline` entry: action `verified`, actor = moderator
5. Push notification sent to all subscribers: "Your report has been verified"

**Meaning:** The report is real, actionable, and ready for authority engagement. This is the gate that separates noise from signal.

### pending -> rejected

**Who:** Moderator

**What happens:**

1. Moderator calls `rejectCase(caseId, reason)`
2. `cases.status` updated to `rejected`
3. `case_timeline` entry: action `rejected`, details include rejection reason
4. No push notification sent (rejected is excluded from the notification trigger)

**Meaning:** The report is invalid — duplicate, fake, outside jurisdiction, or otherwise not actionable. The rejection reason is stored in the timeline for transparency.

### verified -> in_progress

**Who:** Government official or Moderator

**What happens:**

1. Actor calls `updateStatus(caseId, 'in_progress')`
2. `cases.status` updated to `in_progress`
3. `case_timeline` entry: action `status_changed`
4. Push notification: "Case status has been updated"

**Meaning:** Someone with authority is actively working on it. This often coincides with:

- A government official assigning their internal folio (`assignFolio`)
- An escalation email having been sent to an authority
- A field visit being scheduled

### in_progress -> resolved

**Who:** Government official or Moderator

**What happens:**

1. Actor calls `updateStatus(caseId, 'resolved')`
2. `cases.status` updated to `resolved`
3. `case_timeline` entry: action `status_changed`
4. Push notification: "Case has been resolved"

**Meaning:** The situation has been addressed. The animal was rescued, the complaint was resolved, or the issue no longer exists. This is the happy-path terminal state.

### Any -> archived

**Who:** System (auto-archive) or Moderator/Admin (manual)

**Auto-archive trigger:**

1. A user calls `flagCase(caseId)` inserting into `case_flags`
2. `handle_case_flag` trigger fires, increments `flag_count`
3. If `flag_count >= 3`: status set to `archived`, timeline entry with action `archived`

**Manual archive:**

- Moderator or admin calls `updateCaseStatus(caseId, 'archived')`

**Meaning:** The case is hidden from public map and feed. Used for spam, inappropriate content, or stale cases that are no longer relevant.

## Escalation Pipeline (Parallel to Status)

Escalation is tracked separately from status via dedicated columns. A case can be escalated regardless of its current status (though typically happens after `verified`).

### Escalation columns on `cases`

| Column                      | Type          | Purpose                                                           |
| --------------------------- | ------------- | ----------------------------------------------------------------- |
| `escalated_at`              | `timestamptz` | When the first escalation email was sent (NULL = never escalated) |
| `escalation_email_id`       | `text`        | Resend email ID for tracking                                      |
| `escalation_reminder_count` | `int`         | Number of follow-up reminders sent (0-3)                          |
| `marked_unresponsive`       | `boolean`     | Set to `true` after 30 days with no government reply              |
| `government_response_at`    | `timestamptz` | When an authority first responded (stops reminders)               |

### Escalation flow

```
Citizen or moderator clicks "Escalate"
         │
         v
  ┌─────────────────┐    email sent     ┌──────────────────┐
  │  Not escalated   ├────────────────>│    Escalated       │
  │  escalated_at=NULL│                 │  escalated_at=NOW  │
  └─────────────────┘                  └────────┬───────────┘
                                                │
                          ┌─────────────────────┼───────────────────┐
                          │                     │                   │
                     5 days, no reply      15 days             30 days
                          │                     │                   │
                          v                     v                   v
                    Reminder #1           Reminder #2         Reminder #3
                    (reminder_count=1)    (reminder_count=2)  (reminder_count=3)
                                                               marked_unresponsive=true
                          │                     │                   │
                          └──────────┬──────────┘                   │
                                     │                              │
                          Authority replies (any time)              │
                                     │                              │
                                     v                              v
                          ┌──────────────────┐           ┌─────────────────────┐
                          │   Responded       │           │   Unresponsive       │
                          │ govt_response_at  │           │ marked_unresponsive  │
                          │   = NOW           │           │   = true             │
                          │ (reminders stop)  │           │ (public shame data)  │
                          └──────────────────┘           └─────────────────────┘
```

### Authority routing

When escalating, the system selects the target authority:

1. Query `jurisdiction_authorities` where `handles_report_types` contains the case category
2. Prefer `authority_type = 'primary'` with a valid email
3. Fall back to any authority with email in the jurisdiction
4. Fall back to deprecated `jurisdictions.authority_email` column

### Inbound email replies

Authorities reply to `case-{uuid}@reply.lomito.org`. The `inbound-email` Edge Function:

1. Parses the case ID from the reply-to address
2. Stores the email in `inbound_emails` table
3. Sets `cases.government_response_at = NOW()` (stops auto-reminders)
4. Inserts timeline entry: action `government_response`
5. Push notification to subscribers: "An authority has responded to your case"

## Role Permissions Summary

| Action                   | Citizen | Moderator        | Government       | Admin |
| ------------------------ | ------- | ---------------- | ---------------- | ----- |
| Create case              | Yes     | Yes              | Yes              | Yes   |
| View public case data    | Yes     | Yes              | Yes              | Yes   |
| View reporter PII        | No      | Own jurisdiction | Own jurisdiction | All   |
| Update own pending case  | Yes     | N/A              | N/A              | N/A   |
| Verify case              | No      | Own jurisdiction | No               | Yes   |
| Reject case              | No      | Own jurisdiction | No               | Yes   |
| Set in_progress          | No      | Own jurisdiction | Own jurisdiction | Yes   |
| Set resolved             | No      | Own jurisdiction | Own jurisdiction | Yes   |
| Archive case             | No      | Own jurisdiction | No               | Yes   |
| Assign folio             | No      | No               | Own jurisdiction | Yes   |
| Post government response | No      | No               | Own jurisdiction | Yes   |
| Escalate to authority    | Yes     | Yes              | Yes              | Yes   |
| Flag case                | Yes     | Yes              | Yes              | Yes   |
| Subscribe to case        | Yes     | Yes              | Yes              | Yes   |

## Timeline Actions Reference

Every significant event is recorded in `case_timeline` for full audit trail.

| Action                | Written by                                  | Triggers notification? |
| --------------------- | ------------------------------------------- | ---------------------- |
| `created`             | DB trigger (AFTER INSERT)                   | No                     |
| `verified`            | DB trigger (on status UPDATE to `verified`) | Yes                    |
| `rejected`            | DB trigger (on status UPDATE to `rejected`) | No                     |
| `status_changed`      | DB trigger (on other status UPDATEs)        | Yes                    |
| `assigned`            | App hook (`assignFolio`)                    | No                     |
| `escalated`           | Edge Function (`escalate-case`)             | Yes                    |
| `government_response` | Edge Function (`inbound-email`) or App hook | Yes                    |
| `comment`             | App hook (`addComment`)                     | Yes                    |
| `flagged`             | DB trigger (on `case_flags` INSERT)         | No                     |
| `archived`            | DB trigger (on 3 flags) or App hook         | No                     |
| `marked_unresponsive` | Edge Function (`auto-escalation-check`)     | No                     |
| `media_added`         | Defined in enum, not yet wired              | No                     |

## Known Issues

_All five original issues have been resolved._

1. ~~**No DB-level transition guards.**~~ **FIXED:** `validate_case_status_transition` BEFORE UPDATE trigger enforces allowed transitions with admin bypass (migration `20260218100000`).

2. ~~**Double timeline writes on status change.**~~ **FIXED:** Enhanced `notify_case_status_change()` trigger writes action-specific values (`verified`, `rejected`, `archived`, `status_changed`). Manual timeline INSERTs removed from `use-case-actions.ts` and `use-government-actions.ts`. Rejection reason passed via `set_rejection_reason()` RPC + session variable (migration `20260218100001`).

3. ~~**Stale `flagCase` in `use-case-actions.ts`.**~~ **FIXED:** `flagCase()` deleted from `use-case-actions.ts`. `review-actions.tsx` now inserts directly into `case_flags` table, matching the pattern used by `use-flag-case.ts`.

4. ~~**`marked_unresponsive` doesn't affect status.**~~ **FIXED:** `auto-escalation-check` edge function now writes `action: 'marked_unresponsive'` (was `'escalated'` with type in details). `case-header.tsx` shows a warning badge ("No response" / "Sin respuesta") when `marked_unresponsive = true`.

5. ~~**`rejected` and `archived` have no "undo".**~~ **FIXED:** `reopenCase()` added to `use-case-actions.ts` (sets status to `pending`; DB transition guard allows admin bypass). `review-actions.tsx` exposes reopen confirmation flow. `case-action-card.tsx` disables government action buttons for terminal statuses.
