-- Auto-generate folio numbers for new cases
-- Format: TIJ-YYYY-NNNNNN (e.g., TIJ-2025-000001)
-- Rollback: DROP TRIGGER IF EXISTS auto_folio_trigger ON cases; DROP FUNCTION IF EXISTS generate_case_folio();

CREATE OR REPLACE FUNCTION generate_case_folio()
RETURNS TRIGGER AS $$
DECLARE
  prefix TEXT;
  year_str TEXT;
  next_num INTEGER;
BEGIN
  -- Only generate if folio is not already set
  IF NEW.folio IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Use jurisdiction-based prefix or default to TIJ
  SELECT UPPER(LEFT(j.name, 3)) INTO prefix
  FROM jurisdictions j
  WHERE j.id = NEW.jurisdiction_id;

  IF prefix IS NULL THEN
    prefix := 'TIJ';
  END IF;

  year_str := EXTRACT(YEAR FROM NOW())::TEXT;

  -- Get next sequential number for this year
  SELECT COALESCE(MAX(
    CASE
      WHEN folio ~ ('^' || prefix || '-' || year_str || '-[0-9]+$')
      THEN SUBSTRING(folio FROM '[0-9]+$')::INTEGER
      ELSE 0
    END
  ), 0) + 1
  INTO next_num
  FROM cases
  WHERE folio LIKE prefix || '-' || year_str || '-%';

  NEW.folio := prefix || '-' || year_str || '-' || LPAD(next_num::TEXT, 6, '0');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_folio_trigger
  BEFORE INSERT ON cases
  FOR EACH ROW
  EXECUTE FUNCTION generate_case_folio();

-- Backfill existing cases that have NULL folios
DO $$
DECLARE
  r RECORD;
  prefix TEXT;
  year_str TEXT;
  next_num INTEGER;
BEGIN
  FOR r IN SELECT c.id, c.jurisdiction_id, c.created_at
           FROM cases c
           WHERE c.folio IS NULL
           ORDER BY c.created_at
  LOOP
    SELECT UPPER(LEFT(j.name, 3)) INTO prefix
    FROM jurisdictions j
    WHERE j.id = r.jurisdiction_id;

    IF prefix IS NULL THEN
      prefix := 'TIJ';
    END IF;

    year_str := EXTRACT(YEAR FROM r.created_at)::TEXT;

    SELECT COALESCE(MAX(
      CASE
        WHEN folio ~ ('^' || prefix || '-' || year_str || '-[0-9]+$')
        THEN SUBSTRING(folio FROM '[0-9]+$')::INTEGER
        ELSE 0
      END
    ), 0) + 1
    INTO next_num
    FROM cases
    WHERE folio LIKE prefix || '-' || year_str || '-%';

    UPDATE cases
    SET folio = prefix || '-' || year_str || '-' || LPAD(next_num::TEXT, 6, '0')
    WHERE id = r.id;
  END LOOP;
END $$;
