/*
  # Update Book Covers Bucket - Allow Public Uploads

  1. Changes
    - Remove authentication requirement for uploading book covers
    - Allow public users to upload, update, and delete book covers
    - Maintain public read access for all users
  
  2. Security Note
    - This allows unauthenticated users to upload images
    - File size and type restrictions remain in place (5MB max, images only)
*/

DROP POLICY IF EXISTS "Authenticated users can upload book covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update own book covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete own book covers" ON storage.objects;

CREATE POLICY "Public users can upload book covers"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'book-covers');

CREATE POLICY "Public users can update book covers"
  ON storage.objects
  FOR UPDATE
  TO public
  USING (bucket_id = 'book-covers')
  WITH CHECK (bucket_id = 'book-covers');

CREATE POLICY "Public users can delete book covers"
  ON storage.objects
  FOR DELETE
  TO public
  USING (bucket_id = 'book-covers');