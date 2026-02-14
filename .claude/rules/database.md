---
description: Database and Supabase rules for Lomito
globs: ["supabase/**/*.sql", "**/supabase*.ts"]
---

# Database Rules

## Migrations
- One migration per logical change. Name format: `YYYYMMDDHHMMSS_description.sql`.
- Always include both `up` and rollback comments.
- Every new table MUST have RLS enabled: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
- Write RLS policies immediately after table creation. No table should exist without policies.

## PostGIS
- Case locations: `geography(Point, 4326)` column.
- Jurisdiction boundaries: `geometry(MultiPolygon, 4326)` column.
- Index all geometry columns: `CREATE INDEX idx_name ON table USING GIST (column);`
- Jurisdiction lookup: `ST_Contains(jurisdiction.geometry, case.location::geometry)`
- Map viewport queries: `ST_Intersects(geometry, ST_MakeEnvelope(west, south, east, north, 4326))`
- Simplify boundaries before serving to client: `ST_Simplify(geometry, 0.001)` for zoom 10-16.

## RLS Policies
- `citizen` role: can read all public case data, can insert own reports, can update own reports (before verification only).
- `moderator` role: citizen permissions PLUS can update cases in assigned jurisdictions, can view reporter PII in assigned jurisdictions (audit logged).
- `government` role: citizen permissions PLUS can update case status in assigned jurisdictions, can post official responses, can view reporter PII (audit logged).
- `admin` role: all permissions, no jurisdiction scoping.
- PII access (reporter name, phone, email) is always scoped by `user_jurisdictions` join.

## Supabase Client
- Use `@supabase/supabase-js` v2.
- Initialize with anon key (never service role key in client).
- Generate TypeScript types from database: `supabase gen types typescript`.
- Realtime subscriptions ONLY on case_timeline (for case detail view). Never subscribe to full cases table.
