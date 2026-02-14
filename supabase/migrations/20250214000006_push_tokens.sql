-- Add push_token column to profiles for Expo push notifications
-- Rollback: ALTER TABLE profiles DROP COLUMN push_token; DROP INDEX idx_profiles_push_token;

-- Add push_token column
ALTER TABLE profiles ADD COLUMN push_token TEXT;

-- Index for efficient token lookups when sending notifications
CREATE INDEX idx_profiles_push_token ON profiles(push_token) WHERE push_token IS NOT NULL;

-- Note: RLS policy for updating push_token already exists via profiles_update_own policy
-- Users can update their own profile including the push_token field
