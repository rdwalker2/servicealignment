-- Allow admin panel to delete records
-- These are internal sales team tools, so anon delete is acceptable

-- Attendance requests: allow anon to delete
CREATE POLICY "Allow anonymous deletes for admin panel"
  ON conference_attendance_requests
  FOR DELETE
  TO anon
  USING (true);

-- Suggestions: allow anon to delete
CREATE POLICY "Allow anonymous deletes for admin panel"
  ON conference_suggestions
  FOR DELETE
  TO anon
  USING (true);
