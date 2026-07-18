-- Create sfdc_sync_logs table for testing and monitoring SFDC connected app
CREATE TABLE IF NOT EXISTS public.sfdc_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT NOT NULL, -- 'DRY_RUN', 'HALTED', 'ERROR', 'SUCCESS'
    account_domain TEXT,
    sf_account_id TEXT,
    message TEXT NOT NULL,
    payload JSONB
);

-- Enable RLS
ALTER TABLE public.sfdc_sync_logs ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated users
CREATE POLICY "Allow read access for authenticated users" ON public.sfdc_sync_logs
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow insert from anon (webhook)
CREATE POLICY "Allow insert from anon" ON public.sfdc_sync_logs
    FOR INSERT
    TO anon
    WITH CHECK (true);
