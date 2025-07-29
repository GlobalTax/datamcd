-- Fix the search path issue for the new function
CREATE OR REPLACE FUNCTION public.update_voice_transcript_status()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;