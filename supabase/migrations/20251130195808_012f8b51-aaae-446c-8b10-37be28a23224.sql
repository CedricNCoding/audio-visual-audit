-- Add wall material and principal wall fields to room_environment
ALTER TABLE room_environment
ADD COLUMN mur_a_materiau text,
ADD COLUMN mur_b_materiau text,
ADD COLUMN mur_c_materiau text,
ADD COLUMN mur_d_materiau text,
ADD COLUMN mur_principal text CHECK (mur_principal IN ('A', 'B', 'C', 'D') OR mur_principal IS NULL);