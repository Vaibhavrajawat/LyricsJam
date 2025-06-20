-- Database setup for JamLyrics
-- Run this SQL in your Supabase SQL editor

-- Create songs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.songs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    lyrics TEXT NOT NULL,
    album TEXT
);

-- Add album column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'songs' AND column_name = 'album') THEN
        ALTER TABLE public.songs ADD COLUMN album TEXT;
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON public.songs;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.songs;
DROP POLICY IF EXISTS "Enable update for all users" ON public.songs;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.songs;

-- Create policies that allow all operations for everyone
-- Note: In production, you'd want more restrictive policies

-- Allow SELECT (read) for everyone
CREATE POLICY "Enable read access for all users" ON public.songs
    FOR SELECT USING (true);

-- Allow INSERT for everyone  
CREATE POLICY "Enable insert for all users" ON public.songs
    FOR INSERT WITH CHECK (true);

-- Allow UPDATE for everyone
CREATE POLICY "Enable update for all users" ON public.songs
    FOR UPDATE USING (true) WITH CHECK (true);

-- Allow DELETE for everyone
CREATE POLICY "Enable delete for all users" ON public.songs
    FOR DELETE USING (true);

-- Enable realtime for the songs table
ALTER publication supabase_realtime ADD TABLE public.songs;

-- Grant permissions to anon and authenticated users
GRANT ALL ON public.songs TO anon;
GRANT ALL ON public.songs TO authenticated;

-- Also grant usage on the sequence if it exists
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated; 