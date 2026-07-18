CREATE TABLE IF NOT EXISTS saved_segments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  segment_id text NOT NULL UNIQUE,
  name text NOT NULL,
  icon text NOT NULL DEFAULT 'Filter',
  conditions jsonb NOT NULL DEFAULT '[]',
  created_by text,
  is_global boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE saved_segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read segments" ON saved_segments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert segments" ON saved_segments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update segments" ON saved_segments FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete segments" ON saved_segments FOR DELETE USING (true);
