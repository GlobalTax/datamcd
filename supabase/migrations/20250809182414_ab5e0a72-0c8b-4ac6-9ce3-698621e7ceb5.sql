-- Create table for web vitals and perf metrics
CREATE TABLE IF NOT EXISTS public.web_vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL,
  session_id TEXT NULL,
  pathname TEXT NOT NULL,
  metric TEXT NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  rating TEXT NULL,
  delta DOUBLE PRECISION NULL,
  navigation_type TEXT NULL,
  label TEXT NULL,
  detail JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.web_vitals ENABLE ROW LEVEL SECURITY;

-- Policies: users can insert their own records; admins can read all; users can read own
-- Assuming JWT auth with auth.uid()
CREATE POLICY "Users can insert their own web vitals"
ON public.web_vitals
FOR INSERT
WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can read their own web vitals"
ON public.web_vitals
FOR SELECT
USING (user_id IS NULL OR user_id = auth.uid());

-- Optional: admin role can read all via role claim
CREATE POLICY "Admins can read all web vitals"
ON public.web_vitals
FOR SELECT
USING (
  (select coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'role', 'user')) IN ('admin','advisor','sysadmin')
);

-- Indexes for querying
CREATE INDEX IF NOT EXISTS idx_web_vitals_pathname ON public.web_vitals(pathname);
CREATE INDEX IF NOT EXISTS idx_web_vitals_metric ON public.web_vitals(metric);
CREATE INDEX IF NOT EXISTS idx_web_vitals_created_at ON public.web_vitals(created_at DESC);
