-- Add quote and project reference fields to rooms table
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS numero_devis text,
ADD COLUMN IF NOT EXISTS numero_affaire text;