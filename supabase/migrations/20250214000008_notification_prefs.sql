-- Add notification_preferences JSONB column to profiles table
-- This stores user preferences for push notifications, email notifications, and specific notification types

ALTER TABLE profiles
ADD COLUMN notification_preferences JSONB
DEFAULT '{"push_enabled": true, "email_enabled": true, "own_case_updates": true, "flagged_cases": false}'::jsonb;

-- Create index on notification_preferences for faster queries
CREATE INDEX idx_profiles_notification_preferences ON profiles USING GIN (notification_preferences);

-- Add comment for documentation
COMMENT ON COLUMN profiles.notification_preferences IS 'User notification preferences: push_enabled, email_enabled, own_case_updates, flagged_cases';
