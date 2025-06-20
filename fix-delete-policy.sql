-- Simple fix for delete permissions
-- Run this SQL in your Supabase SQL editor

-- Drop and recreate the delete policy
DROP POLICY IF EXISTS "Enable delete for all users" ON public.songs;

CREATE POLICY "Enable delete for all users" ON public.songs
    FOR DELETE USING (true);

-- Grant delete permissions to anon and authenticated users
GRANT DELETE ON public.songs TO anon;
GRANT DELETE ON public.songs TO authenticated;

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'songs' AND cmd = 'DELETE'; 