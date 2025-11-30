-- Add new fields to rooms table for network recommendations, technical validation, and usage scenarios
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS rj45_rack_recommande integer DEFAULT 0;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS rj45_table_recommande integer DEFAULT 0;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS rj45_autres_recommande integer DEFAULT 0;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS rj45_total_recommande integer DEFAULT 0;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS rj45_commentaire text;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS validation_technique_statut text;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS validation_technique_details text[];
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS scenarios_usage text;

-- Add optional fields to displays table for size recommendations
ALTER TABLE displays ADD COLUMN IF NOT EXISTS recommended_size_inches numeric;
ALTER TABLE displays ADD COLUMN IF NOT EXISTS size_comparison_comment text;