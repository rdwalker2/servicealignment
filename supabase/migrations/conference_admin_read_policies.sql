-- Add read access for the conference admin panel
-- These are internal sales team tools, so anon read is acceptable

-- Attendance requests: allow anon to read
CREATE POLICY "Allow anonymous reads for admin panel"
  ON conference_attendance_requests
  FOR SELECT
  TO anon
  USING (true);

-- Suggestions: allow anon to read
CREATE POLICY "Allow anonymous reads for admin panel"
  ON conference_suggestions
  FOR SELECT
  TO anon
  USING (true);
