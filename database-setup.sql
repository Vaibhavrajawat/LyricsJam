-- Create songs table
CREATE TABLE IF NOT EXISTS songs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  lyrics TEXT NOT NULL,
  album TEXT
);

-- Enable Row Level Security
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view songs" ON songs;
DROP POLICY IF EXISTS "Anyone can insert songs" ON songs;
DROP POLICY IF EXISTS "Anyone can update songs" ON songs;
DROP POLICY IF EXISTS "Anyone can delete songs" ON songs;

-- Create new policies
CREATE POLICY "Anyone can view songs" ON songs
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert songs" ON songs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update songs" ON songs
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete songs" ON songs
  FOR DELETE USING (true);

-- Enable realtime for the songs table (ignore errors if already added)
DO $$ 
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE songs;
EXCEPTION
  WHEN duplicate_object THEN 
    NULL;
END $$; 