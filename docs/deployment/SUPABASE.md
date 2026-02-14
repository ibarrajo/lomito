# Supabase Deployment Guide

Comprehensive guide for deploying and managing Lomito's Supabase backend.

---

## Overview

Lomito uses Supabase as its primary backend, leveraging:

- **PostgreSQL + PostGIS** for geospatial data (jurisdiction boundaries, case locations)
- **Row Level Security (RLS)** for role-based access control
- **Edge Functions** for server-side logic (email escalation, webhooks, notifications)
- **Auth** for user authentication
- **Storage** for case media (photos, videos)
- **Realtime** for live case timeline updates

---

## Local Development Setup

### Prerequisites

- Supabase CLI installed: `npm install -g supabase`
- Docker Desktop (required for local Supabase)

### Initialize Local Supabase

```bash
cd /Users/elninja/Code/lomito

# Initialize Supabase (if not already done)
supabase init

# Start local Supabase stack
supabase start
```

This starts:
- PostgreSQL on `localhost:54322`
- Supabase Studio on `http://localhost:54323`
- Edge Functions runtime
- Storage API
- Realtime server

**Credentials:**
- Anon key: printed in terminal after `supabase start`
- Service role key: printed in terminal
- Database URL: `postgresql://postgres:postgres@localhost:54322/postgres`

### Link to Remote Project

```bash
# Link to your production/staging project
supabase link --project-ref <your-project-ref>

# Get project ref from Supabase Dashboard → Project Settings → General
```

### Reset Local Database

```bash
# Reset to clean state and run all migrations
supabase db reset

# This drops all tables and re-runs migrations in order
```

---

## Migrations

### Migration Files

All migrations are in `/Users/elninja/Code/lomito/supabase/migrations/`. They run in lexicographic order.

**Complete Migration List:**

1. **20250214000001_initial_schema.sql**
   - Creates PostGIS extension
   - Defines custom types (user_role, case_status, case_category, etc.)
   - Creates core tables: profiles, jurisdictions, cases, case_media, case_timeline, case_subscriptions, donations
   - Adds PostGIS indexes (GIST) on geometry columns
   - Creates triggers for auto-jurisdiction assignment, auto-timeline creation, auto-subscription
   - Sets up `updated_at` triggers

2. **20250214000002_rls_policies.sql**
   - Enables RLS on all tables
   - Creates policies for `citizen` role (read public data, insert own reports)
   - Creates policies for `moderator` role (update cases in assigned jurisdictions)
   - Creates policies for `government` role (update status, post responses)
   - Creates policies for `admin` role (full access)

3. **20250214000003_jurisdiction_bounds_function.sql**
   - Creates `get_jurisdictions_in_bounds()` function for map viewport queries
   - Uses `ST_Intersects` for efficient bounding box lookups

4. **20250214000004_moderator_rls.sql**
   - Adds moderator-specific RLS policies
   - Scopes moderator access by `user_jurisdictions` junction table
   - Enables moderators to view reporter PII (name, phone, email) for cases in their jurisdictions

5. **20250214000005_case_flags.sql**
   - Adds `case_flags` table for user-reported flags (spam, duplicate, inappropriate)
   - Adds `flag_count` to `cases` table
   - Adds trigger to increment `flag_count` on flag insert

6. **20250214000006_push_tokens.sql**
   - Adds `push_token` column to `profiles` (for Expo push notifications)

7. **20250214000007_notification_trigger.sql**
   - Creates database trigger to call `send-notification` Edge Function on case_timeline insert
   - Uses `pg_net` extension for HTTP requests from database

8. **20250214000008_notification_prefs.sql**
   - Adds `notification_preferences` JSONB column to `profiles`
   - Stores user preferences: `push_enabled`, `email_enabled`, `own_case_updates`, `flagged_cases`

9. **20250214000009_escalation_fields.sql**
   - Adds `escalated_at`, `escalation_email_id`, `government_response_at` to `cases` table

10. **20250214000010_inbound_email_log.sql**
    - Creates `inbound_emails` table to log government email replies
    - Stores raw email content, sender, case_id

11. **20250214000011_escalation_reminders.sql**
    - Adds `last_reminder_sent_at` to `cases` table
    - Supports reminder emails for unresolved escalated cases

12. **20250214000012_donation_status.sql**
    - Adds `status` column to `donations` table (pending, completed, failed)
    - Adds `external_id` for tracking payment provider IDs

13. **20250214000013_dashboard_stats_function.sql**
    - Creates `get_dashboard_stats()` function for public transparency dashboard
    - Returns aggregated metrics: total cases, resolved cases, avg resolution time, cases by category, cases by jurisdiction

14. **20250214000015_audit_fixes.sql**
    - Adds audit columns to track PII access (moderators/government viewing reporter contact info)
    - Creates `pii_access_log` table

### Running Migrations

**Local:**

```bash
cd /Users/elninja/Code/lomito

# Run all pending migrations
supabase db reset

# Or run migrations without dropping tables
supabase migration up
```

**Production/Staging:**

```bash
# Link to remote project first
supabase link --project-ref <your-project-ref>

# Push migrations to remote
supabase db push

# Confirm before running
```

**Alternative: Manual via Dashboard**

1. Go to Supabase Dashboard → SQL Editor
2. Open each migration file in order
3. Copy SQL and run in SQL Editor
4. Verify success (check Tables and Logs)

### Creating New Migrations

```bash
# Create a new migration file
supabase migration new description_of_change

# This creates: supabase/migrations/YYYYMMDDHHMMSS_description_of_change.sql
# Edit the file and add your SQL
# Include rollback instructions in a comment at the top
```

**Best Practices:**
- Always include rollback SQL in a comment: `-- Rollback: DROP TABLE ...`
- One logical change per migration
- Test locally before pushing to production
- Use descriptive names: `add_case_comments_table`, `add_jurisdiction_parent_index`

### Rollback

To rollback the last migration:

```bash
# Local
supabase db reset

# Production (manual)
# Run the rollback SQL from the migration file in SQL Editor
```

**Warning:** Supabase CLI does not support automatic rollbacks. Always test in staging first.

---

## Edge Functions

Lomito uses 7 Edge Functions for server-side operations.

### Edge Function List

1. **send-notification** (`supabase/functions/send-notification/index.ts`)
   - Sends Expo push notifications to case subscribers
   - Called automatically by database trigger on `case_timeline` insert
   - Filters users based on notification preferences
   - **Secrets required:** None (uses Expo Push API)

2. **inbound-email** (`supabase/functions/inbound-email/index.ts`)
   - Webhook endpoint for Resend inbound email routing
   - Parses government email replies to escalated cases
   - Extracts case ID from reply-to address format: `case-{uuid}@reply.lomito.org`
   - Inserts into `inbound_emails` table and creates timeline event
   - **Secrets required:** `INBOUND_EMAIL_WEBHOOK_SECRET`

3. **escalate-case** (`supabase/functions/escalate-case/index.ts`)
   - Sends HTML email to jurisdiction authority via Resend API
   - Includes case details, location, photos
   - Sets `reply-to` header to case-specific email for inbound routing
   - Updates `cases.escalated_at` and creates timeline event
   - **Secrets required:** `RESEND_API_KEY`

4. **auto-escalation-check** (`supabase/functions/auto-escalation-check/index.ts`)
   - Cron job (runs every 6 hours) to check for cases that need escalation
   - Queries cases where `status = 'verified'` and `created_at > threshold` (e.g., 48 hours)
   - Calls `escalate-case` function for each eligible case
   - **Secrets required:** `RESEND_API_KEY` (indirectly, via escalate-case)
   - **Cron schedule:** Set in Supabase Dashboard → Edge Functions → auto-escalation-check → Settings → Cron

5. **jurisdiction-boundaries** (`supabase/functions/jurisdiction-boundaries/index.ts`)
   - Returns simplified jurisdiction geometries for map rendering
   - Accepts bounding box query params: `?west=...&south=...&east=...&north=...`
   - Uses `ST_Simplify()` to reduce geometry size for client-side rendering
   - **Secrets required:** None

6. **create-donation** (`supabase/functions/create-donation/index.ts`)
   - Creates Mercado Pago payment preference
   - Accepts amount, currency, donor_id, recurring flag
   - Returns payment URL for redirect
   - **Secrets required:** `MERCADO_PAGO_ACCESS_TOKEN`

7. **donation-webhook** (`supabase/functions/donation-webhook/index.ts`)
   - Webhook endpoint for Mercado Pago payment notifications
   - Validates webhook signature
   - Updates `donations` table with payment status (completed, failed)
   - **Secrets required:** `MERCADO_PAGO_WEBHOOK_SECRET`

### Deploying Edge Functions

**Deploy all functions:**

```bash
cd /Users/elninja/Code/lomito

supabase functions deploy send-notification
supabase functions deploy inbound-email
supabase functions deploy escalate-case
supabase functions deploy auto-escalation-check
supabase functions deploy jurisdiction-boundaries
supabase functions deploy create-donation
supabase functions deploy donation-webhook
```

**Deploy a single function:**

```bash
supabase functions deploy <function-name>
```

**Note:** Edge Functions are deployed to Deno Deploy runtime (serverless, global CDN).

### Setting Secrets

Edge Functions use environment variables for API keys and secrets. Set them via Supabase CLI:

```bash
# Set a single secret
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx

# Set multiple secrets from .env file
supabase secrets set --env-file .env.production

# List all secrets (values are hidden)
supabase secrets list

# Unset a secret
supabase secrets unset RESEND_API_KEY
```

**Required Secrets:**

| Secret Name                      | Used By                                  | Source                          |
|----------------------------------|------------------------------------------|---------------------------------|
| `RESEND_API_KEY`                 | escalate-case                            | https://resend.com/api-keys     |
| `MERCADO_PAGO_ACCESS_TOKEN`      | create-donation                          | Mercado Pago developer panel    |
| `MERCADO_PAGO_WEBHOOK_SECRET`    | donation-webhook                         | Mercado Pago webhook settings   |
| `INBOUND_EMAIL_WEBHOOK_SECRET`   | inbound-email                            | Resend webhook settings         |
| `SUPABASE_SERVICE_ROLE_KEY`      | All functions (automatically injected)   | Supabase Project Settings → API |

**Note:** `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically injected by Supabase into all Edge Functions. You do not need to set them manually.

### Testing Edge Functions Locally

```bash
# Start local Edge Functions server
supabase functions serve <function-name>

# In another terminal, invoke the function
curl -i --location --request POST 'http://localhost:54321/functions/v1/<function-name>' \
  --header 'Authorization: Bearer <anon-key>' \
  --header 'Content-Type: application/json' \
  --data '{"caseId":"123"}'
```

### Viewing Function Logs

**Production:**
1. Go to Supabase Dashboard → Edge Functions
2. Select function
3. Click "Logs" tab
4. View real-time logs (last 24 hours)

**Local:**
```bash
# Logs print to terminal when running `supabase functions serve`
```

---

## PostGIS Setup

PostGIS is enabled in migration `20250214000001_initial_schema.sql`:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

**Key PostGIS Usage:**

- **Jurisdiction boundaries:** `geometry(MultiPolygon, 4326)` column in `jurisdictions` table
- **Case locations:** `geography(Point, 4326)` column in `cases` table
- **Auto-assignment:** `ST_Contains(jurisdiction.geometry, case.location::geometry)` in trigger
- **Viewport queries:** `ST_Intersects(geometry, ST_MakeEnvelope(west, south, east, north, 4326))`
- **Simplification:** `ST_Simplify(geometry, 0.001)` for client-side rendering

**Indexes:**
- All geometry columns have GIST indexes for fast spatial queries
- See migration `20250214000001_initial_schema.sql` for index definitions

---

## Row Level Security (RLS)

All tables have RLS enabled. Policies are defined in `20250214000002_rls_policies.sql`.

### Policy Overview

**Citizen Role:**
- Read all public case data (cases, case_media, case_timeline, jurisdictions)
- Insert own reports (cases)
- Update own reports before verification (status = 'pending')
- Read own profile
- Update own profile

**Moderator Role:**
- All citizen permissions
- Update cases in assigned jurisdictions (via `user_jurisdictions` join)
- View reporter PII for cases in assigned jurisdictions (audit logged)
- Flag cases
- Post comments on cases in assigned jurisdictions

**Government Role:**
- All citizen permissions
- Update case status in assigned jurisdictions
- Post official responses (timeline action = 'government_response')
- View reporter PII for cases in assigned jurisdictions (audit logged)

**Admin Role:**
- Full access to all tables
- No jurisdiction scoping

### Testing RLS Policies

```sql
-- Switch to test user role
SET ROLE citizen;
SET request.jwt.claim.sub = 'user-uuid';

-- Try to read cases
SELECT * FROM cases;

-- Try to update another user's case
UPDATE cases SET status = 'resolved' WHERE id = 'some-case-id';
-- Should fail with RLS policy violation

-- Reset
RESET ROLE;
```

**Important:** Always test RLS policies in a staging environment before deploying to production.

---

## Monitoring and Debugging

### Database Logs

**Via Dashboard:**
1. Go to Supabase Dashboard → Logs → Database
2. Filter by log level (error, warn, info)
3. Search by query text or error message

**Via SQL:**
```sql
-- View recent slow queries
SELECT * FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Edge Function Logs

See "Viewing Function Logs" section above.

### Realtime Subscriptions

Lomito uses Realtime only for `case_timeline` updates (case detail view).

**Monitor active subscriptions:**
1. Go to Supabase Dashboard → Database → Replication
2. View active publications

**Disable Realtime for a table:**
```sql
ALTER PUBLICATION supabase_realtime DROP TABLE case_timeline;
```

---

## Performance Optimization

### Database Indexes

All geospatial columns have GIST indexes. Additional indexes:

- `cases(status)` — for case list filtering
- `cases(category)` — for case list filtering
- `cases(created_at DESC)` — for case list sorting
- `cases(reporter_id)` — for user's own cases
- `case_timeline(case_id)` — for case detail view
- `case_timeline(created_at DESC)` — for timeline sorting

### Query Optimization

**Use `EXPLAIN ANALYZE` to debug slow queries:**

```sql
EXPLAIN ANALYZE
SELECT * FROM cases
WHERE ST_Intersects(
  location::geometry,
  ST_MakeEnvelope(-117.1, 32.4, -116.9, 32.6, 4326)
);
```

**Expected:** Index scan on `idx_cases_location` (GIST index)

### Connection Pooling

Supabase uses PgBouncer for connection pooling. Default settings are optimal for most use cases.

**If experiencing connection errors:**
1. Go to Supabase Dashboard → Database → Connection Pooling
2. Increase pool size (Pro plan only)

---

## Backup and Restore

### Automated Backups

Supabase Pro plan includes daily automated backups (retained for 7 days).

**Restore from backup:**
1. Go to Supabase Dashboard → Database → Backups
2. Select backup date
3. Click "Restore"

### Manual Backups

```bash
# Export database to SQL file
pg_dump -h db.<your-project-ref>.supabase.co \
  -U postgres \
  -d postgres \
  --clean --if-exists \
  > backup.sql

# Restore from SQL file
psql -h db.<your-project-ref>.supabase.co \
  -U postgres \
  -d postgres \
  < backup.sql
```

---

## Troubleshooting

### Common Issues

**Issue: Migrations fail with "extension postgis does not exist"**

**Solution:**
- Run `CREATE EXTENSION IF NOT EXISTS postgis;` manually in SQL Editor
- Verify PostGIS is available in your Supabase project (it should be by default)

---

**Issue: Edge Function returns "Invalid signature" when testing webhook**

**Solution:**
- For local testing, disable signature validation in the function code
- For production, ensure `INBOUND_EMAIL_WEBHOOK_SECRET` or `MERCADO_PAGO_WEBHOOK_SECRET` is set correctly

---

**Issue: RLS policy blocks legitimate query**

**Solution:**
- Check `auth.uid()` in policy definition matches the user's UUID
- Verify `user_jurisdictions` table has correct entries
- Test policy in isolation using `SET ROLE` (see "Testing RLS Policies" above)

---

**Issue: Auto-escalation cron job not running**

**Solution:**
- Go to Supabase Dashboard → Edge Functions → auto-escalation-check → Settings
- Verify cron schedule is set (e.g., `0 */6 * * *` for every 6 hours)
- Check function logs for errors

---

## Support

For Supabase-specific issues:
- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- GitHub Issues: https://github.com/supabase/supabase/issues

For Lomito-specific issues:
- Contact development team
- File issue in project repository
