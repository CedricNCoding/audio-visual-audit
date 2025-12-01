-- Create function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create elements_salle table for room element positioning
CREATE TABLE public.elements_salle (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL,
  type_element TEXT NOT NULL,
  label TEXT,
  position_x NUMERIC NOT NULL,
  position_y NUMERIC NOT NULL,
  commentaire TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.elements_salle ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can manage elements_salle"
ON public.elements_salle
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM rooms
    JOIN projects ON projects.id = rooms.project_id
    WHERE rooms.id = elements_salle.room_id
    AND projects.user_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_elements_salle_updated_at
BEFORE UPDATE ON public.elements_salle
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();