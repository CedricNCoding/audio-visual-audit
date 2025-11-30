-- Create room_sonorization table
CREATE TABLE public.room_sonorization (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Sonorisation d'ambiance
  ambiance_necessaire BOOLEAN DEFAULT false,
  ambiance_type TEXT,
  
  -- Sonorisation de puissance
  puissance_necessaire BOOLEAN DEFAULT false,
  puissance_niveau TEXT,
  
  -- Diffusion homogène
  diffusion_homogene BOOLEAN DEFAULT false,
  type_diffusion TEXT[],
  
  -- Renforcement voix
  renforcement_voix BOOLEAN DEFAULT false,
  nb_micros_renfort INTEGER DEFAULT 0,
  types_micros_renfort TEXT[],
  mixage_multiple BOOLEAN DEFAULT false,
  
  -- Acoustique
  objectif_acoustique TEXT,
  
  -- Retour sonore
  retour_necessaire BOOLEAN DEFAULT false,
  retour_type TEXT,
  
  -- Risque de larsen
  larsen_risque BOOLEAN DEFAULT false,
  
  -- Sources audio spécifiques
  sources_audio_specifiques TEXT,
  
  -- Traitement audio
  dsp_necessaire BOOLEAN DEFAULT false,
  dante_souhaite BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.room_sonorization ENABLE ROW LEVEL SECURITY;

-- Create policies for room_sonorization
CREATE POLICY "Users can manage room sonorization"
ON public.room_sonorization
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM rooms
    JOIN projects ON projects.id = rooms.project_id
    WHERE rooms.id = room_sonorization.room_id
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view room sonorization"
ON public.room_sonorization
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM rooms
    JOIN projects ON projects.id = rooms.project_id
    WHERE rooms.id = room_sonorization.room_id
    AND projects.user_id = auth.uid()
  )
);