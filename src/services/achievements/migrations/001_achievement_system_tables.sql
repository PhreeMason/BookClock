-- Achievement System Migration
-- This migration creates the necessary tables for the new event-driven achievement system
-- Create achievement_progress table to track user progress on achievements
CREATE TABLE IF NOT EXISTS achievement_progress (
  id TEXT DEFAULT generate_prefixed_id('ap') PRIMARY KEY,
  user_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  current_value NUMERIC NOT NULL DEFAULT 0,
  target_value NUMERIC NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one progress record per achievement per user
  UNIQUE(user_id, achievement_id)
);

-- Drop existing tables if they exist with wrong schema (UUID instead of TEXT for user_id)
DROP TABLE IF EXISTS achievement_events CASCADE;

-- Create achievement_events table for event logging (optional, for debugging/analytics)
CREATE TABLE achievement_events (
  id TEXT DEFAULT generate_prefixed_id('ae') PRIMARY KEY,
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- Add missing columns to reading_deadlines table if they don't exist
-- Note: format column should already exist based on supabase types
-- Note: set_aside, completed_at, reading_duration_days are redundant - use reading_deadline_status table instead

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_achievement_progress_user ON achievement_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_achievement_progress_achievement ON achievement_progress(achievement_id);
CREATE INDEX IF NOT EXISTS idx_achievement_events_user_type ON achievement_events(user_id, event_type);
CREATE INDEX IF NOT EXISTS idx_reading_deadlines_user_status ON reading_deadlines(user_id);

-- Enable Row Level Security
ALTER TABLE achievement_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own achievement progress" ON achievement_progress;
CREATE POLICY "Users can view their own achievement progress"
  ON achievement_progress
  FOR SELECT
  TO authenticated
  USING (user_id = requesting_user_id());

DROP POLICY IF EXISTS "Users can insert their own achievement progress" ON achievement_progress;
CREATE POLICY "Users can insert their own achievement progress"
  ON achievement_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = requesting_user_id());

DROP POLICY IF EXISTS "Users can update their own achievement progress" ON achievement_progress;
CREATE POLICY "Users can update their own achievement progress"
  ON achievement_progress
  FOR UPDATE
  TO authenticated
  USING (user_id = requesting_user_id())
  WITH CHECK (user_id = requesting_user_id());

DROP POLICY IF EXISTS "Users can delete their own achievement progress" ON achievement_progress;
CREATE POLICY "Users can delete their own achievement progress"
  ON achievement_progress
  FOR DELETE
  TO authenticated
  USING (user_id = requesting_user_id());

DROP POLICY IF EXISTS "Users can view their own achievement events" ON achievement_events;
CREATE POLICY "Users can view their own achievement events"
  ON achievement_events
  FOR SELECT
  TO authenticated
  USING (user_id = requesting_user_id());

DROP POLICY IF EXISTS "Users can insert their own achievement events" ON achievement_events;
CREATE POLICY "Users can insert their own achievement events"
  ON achievement_events
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = requesting_user_id());

-- Function to update achievement_progress last_updated_at timestamp
CREATE OR REPLACE FUNCTION update_achievement_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update last_updated_at
DROP TRIGGER IF EXISTS update_achievement_progress_updated_at_trigger ON achievement_progress;
CREATE TRIGGER update_achievement_progress_updated_at_trigger
  BEFORE UPDATE ON achievement_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_achievement_progress_updated_at();

