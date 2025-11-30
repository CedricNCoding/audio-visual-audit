-- Ajouter champs manquants dans room_usage
ALTER TABLE public.room_usage 
ADD COLUMN IF NOT EXISTS reservation_salle boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS nombre_personnes integer;

-- Créer table pour types de caméras (éditable backend)
CREATE TABLE IF NOT EXISTS public.camera_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now()
);

-- Créer table pour types de micros (éditable backend)
CREATE TABLE IF NOT EXISTS public.microphone_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS pour camera_types (lecture publique)
ALTER TABLE public.camera_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view camera types"
ON public.camera_types FOR SELECT
USING (true);

-- RLS pour microphone_types (lecture publique)
ALTER TABLE public.microphone_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view microphone types"
ON public.microphone_types FOR SELECT
USING (true);

-- Ajouter champs pour vidéoprojecteur dans displays
ALTER TABLE public.displays
ADD COLUMN IF NOT EXISTS distance_projection_m numeric,
ADD COLUMN IF NOT EXISTS base_ecran_cm numeric;

-- Ajouter distance vers régie dans connectivity_zones
ALTER TABLE public.connectivity_zones
ADD COLUMN IF NOT EXISTS distance_to_control_room_m numeric;

-- Insérer quelques types par défaut
INSERT INTO public.camera_types (name) VALUES
  ('PTZ'),
  ('Fixe grand angle'),
  ('Tracking'),
  ('Caméra document')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.microphone_types (name) VALUES
  ('Micro plafond'),
  ('Micro table'),
  ('Micro main'),
  ('Micro cravate')
ON CONFLICT (name) DO NOTHING;