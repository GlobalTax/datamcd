-- Create storage bucket for voice notes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'voice-notes', 
  'voice-notes', 
  false, 
  52428800, -- 50MB limit
  ARRAY['audio/webm', 'audio/wav', 'audio/mp3', 'audio/ogg']
);

-- Create storage policies for voice notes
CREATE POLICY "Users can upload voice notes" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'voice-notes' AND 
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their voice notes" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'voice-notes' AND 
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Admins can view all voice notes" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'voice-notes' AND 
  get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
);

-- Enable RLS on voice_notes table
ALTER TABLE public.voice_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for voice_notes table
CREATE POLICY "Users can create voice notes" 
ON public.voice_notes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their voice notes" 
ON public.voice_notes 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
);

-- Enable RLS on voice_transcripts table
ALTER TABLE public.voice_transcripts ENABLE ROW LEVEL SECURITY;

-- Create policies for voice_transcripts table
CREATE POLICY "Users can view transcripts of their voice notes" 
ON public.voice_transcripts 
FOR SELECT 
USING (
  voice_note_id IN (
    SELECT id FROM public.voice_notes 
    WHERE user_id = auth.uid()
  ) OR 
  get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
);

-- Enable RLS on voice_entity_links table
ALTER TABLE public.voice_entity_links ENABLE ROW LEVEL SECURITY;

-- Create policies for voice_entity_links table
CREATE POLICY "Users can manage links for their voice notes" 
ON public.voice_entity_links 
FOR ALL 
USING (
  voice_note_id IN (
    SELECT id FROM public.voice_notes 
    WHERE user_id = auth.uid()
  ) OR 
  get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
);

-- Create function to update voice transcript status
CREATE OR REPLACE FUNCTION public.update_voice_transcript_status()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for voice transcripts
CREATE TRIGGER update_voice_transcript_status_trigger
  BEFORE UPDATE ON public.voice_transcripts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_voice_transcript_status();