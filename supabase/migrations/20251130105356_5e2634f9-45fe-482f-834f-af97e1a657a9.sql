-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT NOT NULL,
  site_name TEXT,
  contact_name TEXT,
  decision_service TEXT,
  decision_contact TEXT,
  decision_date DATE,
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- Packages table (predefined room templates)
CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  typology TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view packages"
  ON public.packages FOR SELECT
  USING (true);

-- Rooms table
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  typology TEXT,
  package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view rooms of their projects"
  ON public.rooms FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = rooms.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create rooms in their projects"
  ON public.rooms FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = rooms.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update rooms in their projects"
  ON public.rooms FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = rooms.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete rooms in their projects"
  ON public.rooms FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = rooms.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Room usage and context
CREATE TABLE public.room_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE UNIQUE NOT NULL,
  main_usage TEXT,
  usage_intensity TEXT,
  user_skill_level TEXT,
  platform_type TEXT,
  automation_booking BOOLEAN DEFAULT false,
  automation_lighting BOOLEAN DEFAULT false,
  automation_acoustic BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.room_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view room usage"
  ON public.room_usage FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.rooms
      JOIN public.projects ON projects.id = rooms.project_id
      WHERE rooms.id = room_usage.room_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage room usage"
  ON public.room_usage FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.rooms
      JOIN public.projects ON projects.id = rooms.project_id
      WHERE rooms.id = room_usage.room_id
      AND projects.user_id = auth.uid()
    )
  );

-- Room environment
CREATE TABLE public.room_environment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE UNIQUE NOT NULL,
  length_m DECIMAL(10,2),
  width_m DECIMAL(10,2),
  height_m DECIMAL(10,2),
  wall_material TEXT,
  floor_material TEXT,
  ceiling_material TEXT,
  has_raised_floor BOOLEAN DEFAULT false,
  has_false_ceiling BOOLEAN DEFAULT false,
  brightness_level TEXT,
  has_acoustic_issue BOOLEAN DEFAULT false,
  acoustic_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.room_environment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view room environment"
  ON public.room_environment FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.rooms
      JOIN public.projects ON projects.id = rooms.project_id
      WHERE rooms.id = room_environment.room_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage room environment"
  ON public.room_environment FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.rooms
      JOIN public.projects ON projects.id = rooms.project_id
      WHERE rooms.id = room_environment.room_id
      AND projects.user_id = auth.uid()
    )
  );

-- Room visio/streaming
CREATE TABLE public.room_visio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE UNIQUE NOT NULL,
  visio_required BOOLEAN DEFAULT false,
  visio_platform TEXT,
  need_to_see BOOLEAN DEFAULT false,
  need_to_be_seen BOOLEAN DEFAULT false,
  need_to_hear BOOLEAN DEFAULT false,
  need_to_be_heard BOOLEAN DEFAULT false,
  camera_count INT DEFAULT 0,
  camera_types TEXT[],
  mic_count INT DEFAULT 0,
  mic_types TEXT[],
  streaming_enabled BOOLEAN DEFAULT false,
  streaming_type TEXT,
  streaming_platform TEXT,
  streaming_complexity TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.room_visio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view room visio"
  ON public.room_visio FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.rooms
      JOIN public.projects ON projects.id = rooms.project_id
      WHERE rooms.id = room_visio.room_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage room visio"
  ON public.room_visio FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.rooms
      JOIN public.projects ON projects.id = rooms.project_id
      WHERE rooms.id = room_visio.room_id
      AND projects.user_id = auth.uid()
    )
  );

-- Sources
CREATE TABLE public.sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  source_type TEXT NOT NULL,
  quantity INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage sources"
  ON public.sources FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.rooms
      JOIN public.projects ON projects.id = rooms.project_id
      WHERE rooms.id = sources.room_id
      AND projects.user_id = auth.uid()
    )
  );

-- Displays
CREATE TABLE public.displays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  display_type TEXT NOT NULL,
  size_inches INT,
  width_cm DECIMAL(10,2),
  height_cm DECIMAL(10,2),
  position TEXT,
  bottom_height_cm DECIMAL(10,2),
  viewer_distance_m DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.displays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage displays"
  ON public.displays FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.rooms
      JOIN public.projects ON projects.id = rooms.project_id
      WHERE rooms.id = displays.room_id
      AND projects.user_id = auth.uid()
    )
  );

-- Connectivity zones
CREATE TABLE public.connectivity_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  zone_name TEXT NOT NULL,
  hdmi_count INT DEFAULT 0,
  usbc_count INT DEFAULT 0,
  displayport_count INT DEFAULT 0,
  rj45_count INT DEFAULT 0,
  usba_count INT DEFAULT 0,
  power_230v_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.connectivity_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage connectivity zones"
  ON public.connectivity_zones FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.rooms
      JOIN public.projects ON projects.id = rooms.project_id
      WHERE rooms.id = connectivity_zones.room_id
      AND projects.user_id = auth.uid()
    )
  );

-- Cables
CREATE TABLE public.cables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  point_a TEXT NOT NULL,
  point_b TEXT NOT NULL,
  signal_type TEXT NOT NULL,
  distance_m DECIMAL(10,2) NOT NULL,
  distance_with_margin_m DECIMAL(10,2) GENERATED ALWAYS AS (distance_m * 1.2) STORED,
  cable_recommendation TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.cables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage cables"
  ON public.cables FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.rooms
      JOIN public.projects ON projects.id = rooms.project_id
      WHERE rooms.id = cables.room_id
      AND projects.user_id = auth.uid()
    )
  );

-- Function to auto-calculate cable recommendations
CREATE OR REPLACE FUNCTION calculate_cable_recommendation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.signal_type = 'HDMI' THEN
    IF NEW.distance_m <= 5 THEN
      NEW.cable_recommendation := 'Câble HDMI direct';
    ELSE
      NEW.cable_recommendation := 'Extender HDMI sur réseau';
    END IF;
  ELSIF NEW.signal_type = 'USB' THEN
    IF NEW.distance_m <= 3 THEN
      NEW.cable_recommendation := 'Câble USB direct';
    ELSE
      NEW.cable_recommendation := 'Extender USB sur réseau';
    END IF;
  ELSIF NEW.signal_type = 'DisplayPort' THEN
    IF NEW.distance_m <= 5 THEN
      NEW.cable_recommendation := 'Câble DisplayPort direct';
    ELSE
      NEW.cable_recommendation := 'Extender DisplayPort sur réseau';
    END IF;
  ELSE
    NEW.cable_recommendation := 'Câble ' || NEW.signal_type;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_cable_recommendation
  BEFORE INSERT OR UPDATE ON public.cables
  FOR EACH ROW
  EXECUTE FUNCTION calculate_cable_recommendation();

-- Insert default packages
INSERT INTO public.packages (name, typology, description, template_data, is_default) VALUES
('Huddle Standard', 'Huddle', 'Salle huddle pour 2-4 personnes avec écran et visio', '{"environment": {"length_m": 3, "width_m": 2.5, "height_m": 2.7}, "visio": {"visio_required": true, "camera_count": 1, "mic_count": 1}}', true),
('Réunion Standard', 'Réunion', 'Salle de réunion pour 6-10 personnes', '{"environment": {"length_m": 5, "width_m": 4, "height_m": 2.8}, "visio": {"visio_required": true, "camera_count": 1, "mic_count": 2}}', true),
('Auditorium', 'Auditorium', 'Grande salle pour conférences et présentations', '{"environment": {"length_m": 15, "width_m": 12, "height_m": 4}, "visio": {"streaming_enabled": true}}', true);