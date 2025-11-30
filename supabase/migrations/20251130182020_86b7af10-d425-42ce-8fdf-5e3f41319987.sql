-- Create storage bucket for room photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('room-photos', 'room-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for room-photos bucket
CREATE POLICY "Anyone can view room photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'room-photos');

CREATE POLICY "Authenticated users can upload room photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'room-photos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update room photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'room-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete room photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'room-photos' AND auth.role() = 'authenticated');