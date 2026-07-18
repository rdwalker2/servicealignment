-- Conference Attendance Requests
-- Stores requests from sales reps who want to attend conferences
-- Created: 2026-07-08

CREATE TABLE IF NOT EXISTS conference_attendance_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conference_name TEXT NOT NULL,
  conference_dates TEXT,
  conference_location TEXT,
  rep_name TEXT NOT NULL,
  rep_email TEXT NOT NULL,
  justification TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE conference_attendance_requests ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public form submissions)
CREATE POLICY "Allow anonymous inserts"
  ON conference_attendance_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to read all requests (for admin review)
CREATE POLICY "Allow authenticated reads"
  ON conference_attendance_requests
  FOR SELECT
  TO authenticated
  USING (true);

-- Index on submitted_at for chronological review
CREATE INDEX idx_conference_requests_submitted_at
  ON conference_attendance_requests (submitted_at DESC);

-- Index on conference_name for filtering
CREATE INDEX idx_conference_requests_conference
  ON conference_attendance_requests (conference_name);
