-- Add viewer_distance_m field to displays table for size recommendations
ALTER TABLE displays ADD COLUMN IF NOT EXISTS viewer_distance_m numeric;