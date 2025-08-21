-- Migration: Add unique constraint on achievement_progress table
-- Purpose: Ensure each user can only have one progress record per achievement
-- This enables efficient upsert operations instead of checking for existing records

-- Add unique constraint on user_id and achievement_id combination
ALTER TABLE achievement_progress 
ADD CONSTRAINT achievement_progress_user_achievement_unique 
UNIQUE (user_id, achievement_id);
