-- =============================================================================
-- 003_storage_policies.sql
-- Storage bucket RLS policies for the 'images' bucket
--
-- Run in Supabase SQL Editor AFTER creating the bucket in the dashboard.
--
-- Security model:
--   - Anyone can read objects in the images bucket (product images are public)
--   - Only authenticated users can upload (INSERT)
--   - Path must match allowed folder pattern (no path traversal)
--   - Users can only delete their own uploads
--   - Admins can delete any object
-- =============================================================================

-- Ensure RLS is enabled on storage.objects (it is by default in Supabase)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for idempotency
DROP POLICY IF EXISTS "images: public read" ON storage.objects;
DROP POLICY IF EXISTS "images: auth upload" ON storage.objects;
DROP POLICY IF EXISTS "images: users delete own" ON storage.objects;
DROP POLICY IF EXISTS "images: admin delete all" ON storage.objects;
DROP POLICY IF EXISTS "images: admin update" ON storage.objects;

-- 1. Public read — product images must be accessible to all visitors
CREATE POLICY "images: public read" ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'images');

-- 2. Authenticated upload — must be logged in; folder must be in allowed list
--    Allowed folders: products/, avatars/, categories/, uploads/
--    Path format: {folder}/{uuid}.{ext}
--    Prevents path traversal: name must not contain '..'
CREATE POLICY "images: auth upload" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'images'
    AND (
      -- path starts with an allowed folder prefix
      name ~ '^(products|avatars|categories|uploads)/[^/]+$'
    )
    AND name NOT LIKE '%..%'
  );

-- 3. Users can delete files they uploaded
--    Supabase stores the owner in storage.objects.owner = auth.uid()
CREATE POLICY "images: users delete own" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'images'
    AND owner = auth.uid()
  );

-- 4. Admins can delete any object in the bucket
CREATE POLICY "images: admin delete all" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'images'
    AND public.is_admin()
  );

-- 5. Admins and sellers can update object metadata
CREATE POLICY "images: admin update" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'images'
    AND public.is_admin_or_seller()
  );
