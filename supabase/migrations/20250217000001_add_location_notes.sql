-- Add location_notes column to cases table for address/reference information
-- Rollback: ALTER TABLE cases DROP COLUMN location_notes;

ALTER TABLE cases ADD COLUMN location_notes TEXT;
