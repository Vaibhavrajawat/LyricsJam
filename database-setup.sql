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

-- Allow anyone to view songs
CREATE POLICY "Anyone can view songs" ON songs
  FOR SELECT USING (true);

-- Allow anyone to insert songs  
CREATE POLICY "Anyone can insert songs" ON songs
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update songs
CREATE POLICY "Anyone can update songs" ON songs
  FOR UPDATE USING (true);

-- Allow anyone to delete songs
CREATE POLICY "Anyone can delete songs" ON songs
  FOR DELETE USING (true);

-- Enable realtime for the songs table
ALTER PUBLICATION supabase_realtime ADD TABLE songs; 