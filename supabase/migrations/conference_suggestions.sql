-- Conference Suggestions
-- Stores conference suggestions from reps for review/approval
-- Created: 2026-07-08

CREATE TABLE IF NOT EXISTS conference_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conference_name TEXT NOT NULL,
  conference_url TEXT,
  conference_dates TEXT,
  conference_location TEXT,
  estimated_cost TEXT,
  submitted_by_name TEXT NOT NULL,
  submitted_by_email TEXT NOT NULL,
  why_relevant TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE conference_suggestions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public form)
CREATE POLICY "Allow anonymous inserts"
  ON conference_suggestions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users full access (admin review)
CREATE POLICY "Allow authenticated full access"
  ON conference_suggestions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Index for admin review
CREATE INDEX idx_conference_suggestions_status
  ON conference_suggestions (status, submitted_at DESC);
