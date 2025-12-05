-- Allow admins to manage camera_types
CREATE POLICY "Admins can manage camera types"
ON public.camera_types
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to manage microphone_types
CREATE POLICY "Admins can manage microphone types"
ON public.microphone_types
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));