-- Make the room-photos bucket private
UPDATE storage.buckets SET public = false WHERE id = 'room-photos';

-- Drop existing storage policies for room-photos
DROP POLICY IF EXISTS "room_photos_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "room_photos_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "room_photos_delete_policy" ON storage.objects;
DROP POLICY IF EXISTS "room_photos_select_policy" ON storage.objects;

-- Create new ownership-based storage policies
-- Users can only INSERT photos to rooms they own
CREATE POLICY "room_photos_insert_own_rooms"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'room-photos' 
  AND EXISTS (
    SELECT 1 FROM rooms 
    JOIN projects ON projects.id = rooms.project_id
    WHERE rooms.id::text = (storage.foldername(name))[1]
    AND projects.user_id = auth.uid()
  )
);

-- Users can SELECT photos from their own rooms OR admins can view all
CREATE POLICY "room_photos_select_own_rooms"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'room-photos' 
  AND (
    EXISTS (
      SELECT 1 FROM rooms 
      JOIN projects ON projects.id = rooms.project_id
      WHERE rooms.id::text = (storage.foldername(name))[1]
      AND projects.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  )
);

-- Users can DELETE photos from their own rooms OR admins can delete any
CREATE POLICY "room_photos_delete_own_rooms"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'room-photos' 
  AND (
    EXISTS (
      SELECT 1 FROM rooms 
      JOIN projects ON projects.id = rooms.project_id
      WHERE rooms.id::text = (storage.foldername(name))[1]
      AND projects.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  )
);

-- Users can UPDATE photos in their own rooms
CREATE POLICY "room_photos_update_own_rooms"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'room-photos' 
  AND EXISTS (
    SELECT 1 FROM rooms 
    JOIN projects ON projects.id = rooms.project_id
    WHERE rooms.id::text = (storage.foldername(name))[1]
    AND projects.user_id = auth.uid()
  )
);