-- Expanded case categories for comprehensive animal welfare reporting
-- Rollback: N/A (enum values cannot be removed in PostgreSQL without recreating the type)

-- 'injured' was added in seed.sql via ALTER TYPE; add it here with IF NOT EXISTS for idempotency
ALTER TYPE case_category ADD VALUE IF NOT EXISTS 'injured';

-- New categories
ALTER TYPE case_category ADD VALUE IF NOT EXISTS 'zoonotic';
ALTER TYPE case_category ADD VALUE IF NOT EXISTS 'dead_animal';
ALTER TYPE case_category ADD VALUE IF NOT EXISTS 'dangerous_dog';
ALTER TYPE case_category ADD VALUE IF NOT EXISTS 'distress';
ALTER TYPE case_category ADD VALUE IF NOT EXISTS 'illegal_sales';
ALTER TYPE case_category ADD VALUE IF NOT EXISTS 'wildlife';
ALTER TYPE case_category ADD VALUE IF NOT EXISTS 'noise_nuisance';
