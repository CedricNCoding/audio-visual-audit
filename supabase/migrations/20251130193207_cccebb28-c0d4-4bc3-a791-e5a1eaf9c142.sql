-- Ajout des nouveaux champs pour la Sonorisation V2.1
-- Ne supprime pas les anciens champs, juste ajoute les nouveaux

-- Type général de sonorisation
ALTER TABLE room_sonorization ADD COLUMN IF NOT EXISTS type_sonorisation text;

-- Besoins de diffusion
ALTER TABLE room_sonorization ADD COLUMN IF NOT EXISTS diffusion_orientee boolean DEFAULT false;
ALTER TABLE room_sonorization ADD COLUMN IF NOT EXISTS diffusion_locale boolean DEFAULT false;

-- Quantité par type de micro
ALTER TABLE room_sonorization ADD COLUMN IF NOT EXISTS nb_micro_main_hf integer DEFAULT 0;
ALTER TABLE room_sonorization ADD COLUMN IF NOT EXISTS nb_micro_cravate_hf integer DEFAULT 0;
ALTER TABLE room_sonorization ADD COLUMN IF NOT EXISTS nb_micro_serre_tete_hf integer DEFAULT 0;
ALTER TABLE room_sonorization ADD COLUMN IF NOT EXISTS nb_micro_pupitre integer DEFAULT 0;
ALTER TABLE room_sonorization ADD COLUMN IF NOT EXISTS nb_micro_plafond_beamforming integer DEFAULT 0;
ALTER TABLE room_sonorization ADD COLUMN IF NOT EXISTS nb_micro_table integer DEFAULT 0;

-- Acoustique
ALTER TABLE room_sonorization ADD COLUMN IF NOT EXISTS acoustique_niveau text;

-- Traitement audio
ALTER TABLE room_sonorization ADD COLUMN IF NOT EXISTS anti_larsen boolean DEFAULT false;

COMMENT ON COLUMN room_sonorization.type_sonorisation IS 'Ambiance, Conférence / Formation, Mixte (ambiance + voix), Aucune sonorisation';
COMMENT ON COLUMN room_sonorization.acoustique_niveau IS 'Acceptable, Problématique, Très réverbérée';
COMMENT ON COLUMN room_sonorization.nb_micro_main_hf IS 'Nombre de micros main HF';
COMMENT ON COLUMN room_sonorization.nb_micro_cravate_hf IS 'Nombre de micros cravate HF';
COMMENT ON COLUMN room_sonorization.nb_micro_serre_tete_hf IS 'Nombre de micros serre-tête HF';
COMMENT ON COLUMN room_sonorization.nb_micro_pupitre IS 'Nombre de micros pupitre filaire';
COMMENT ON COLUMN room_sonorization.nb_micro_plafond_beamforming IS 'Nombre de micros plafond beamforming';
COMMENT ON COLUMN room_sonorization.nb_micro_table IS 'Nombre de micros de table';