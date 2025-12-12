-- Create a function to check if user is bureau_etude using text comparison
CREATE OR REPLACE FUNCTION public.is_bureau_etude()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role::text = 'bureau_etude'
  )
$$;

-- Update RLS policies on projects to allow bureau_etude to view all projects
CREATE POLICY "Bureau etude can view all projects" 
ON public.projects 
FOR SELECT 
USING (public.is_bureau_etude());

-- Update RLS policies on rooms to allow bureau_etude to view all rooms
CREATE POLICY "Bureau etude can view all rooms" 
ON public.rooms 
FOR SELECT 
USING (public.is_bureau_etude());

-- Update RLS policies on related tables for bureau_etude read access
CREATE POLICY "Bureau etude can view all sources" 
ON public.sources 
FOR SELECT 
USING (public.is_bureau_etude());

CREATE POLICY "Bureau etude can view all displays" 
ON public.displays 
FOR SELECT 
USING (public.is_bureau_etude());

CREATE POLICY "Bureau etude can view all cables" 
ON public.cables 
FOR SELECT 
USING (public.is_bureau_etude());

CREATE POLICY "Bureau etude can view all connectivity zones" 
ON public.connectivity_zones 
FOR SELECT 
USING (public.is_bureau_etude());

CREATE POLICY "Bureau etude can view all room environment" 
ON public.room_environment 
FOR SELECT 
USING (public.is_bureau_etude());

CREATE POLICY "Bureau etude can view all room usage" 
ON public.room_usage 
FOR SELECT 
USING (public.is_bureau_etude());

CREATE POLICY "Bureau etude can view all room visio" 
ON public.room_visio 
FOR SELECT 
USING (public.is_bureau_etude());

CREATE POLICY "Bureau etude can view all room sonorization" 
ON public.room_sonorization 
FOR SELECT 
USING (public.is_bureau_etude());

CREATE POLICY "Bureau etude can view all elements salle" 
ON public.elements_salle 
FOR SELECT 
USING (public.is_bureau_etude());

CREATE POLICY "Bureau etude can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.is_bureau_etude());