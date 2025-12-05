-- Add RJ45 fields to room_environment
ALTER TABLE public.room_environment
ADD COLUMN IF NOT EXISTS has_rj45 boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS rj45_count integer DEFAULT 0;

-- Add equipment retrieval and training fields to room_usage
ALTER TABLE public.room_usage
ADD COLUMN IF NOT EXISTS depose_materiel boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS rapatriement_materiel boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS formation_demandee boolean DEFAULT false;

-- Add address, building and parking fields to projects
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS site_address text,
ADD COLUMN IF NOT EXISTS building_name text,
ADD COLUMN IF NOT EXISTS parking_utilitaire boolean DEFAULT false;