/*
  # Create Storage Bucket for Book Covers

  1. New Storage Bucket
    - `book-covers` - Public bucket for storing custom book cover images
  
  2. Security
    - Enable RLS on storage.objects
    - Allow authenticated users to upload their own book covers
    - Allow authenticated users to update their own book covers
    - Allow authenticated users to delete their own book covers
    - Allow public read access to all book covers
  
  3. Configuration
    - Max file size: 5MB
    - Allowed MIME types: image/jpeg, image/png, image/webp
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'book-covers',
  'book-covers',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload book covers"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'book-covers' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Authenticated users can update own book covers"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'book-covers' AND
    auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'book-covers' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Authenticated users can delete own book covers"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'book-covers' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public read access to book covers"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'book-covers');