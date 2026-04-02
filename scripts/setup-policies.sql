-- Storage RLS Policies for note-images bucket

-- Allow authenticated users to upload to their own folder
CREATE POLICY IF NOT EXISTS "Users can upload their own images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'note-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow anyone to view public images
CREATE POLICY IF NOT EXISTS "Public images are viewable by anyone"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'note-images');

-- Allow users to delete their own images
CREATE POLICY IF NOT EXISTS "Users can delete their own images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'note-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
