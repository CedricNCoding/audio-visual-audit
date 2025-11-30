-- Add transport field to cables table
ALTER TABLE cables ADD COLUMN IF NOT EXISTS transport text;

-- Add comment field to cables table
ALTER TABLE cables ADD COLUMN IF NOT EXISTS commentaire text;