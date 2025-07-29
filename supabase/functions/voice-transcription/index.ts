import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { voice_note_id } = await req.json();
    
    if (!voice_note_id) {
      throw new Error('voice_note_id is required');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Initialize Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Processing voice note:', voice_note_id);

    // Get voice note details
    const { data: voiceNote, error: voiceNoteError } = await supabase
      .from('voice_notes')
      .select('*')
      .eq('id', voice_note_id)
      .single();

    if (voiceNoteError || !voiceNote) {
      console.error('Voice note not found:', voiceNoteError);
      throw new Error('Voice note not found');
    }

    console.log('Found voice note:', voiceNote.file_url);

    // Download audio file from Supabase Storage
    const { data: audioData, error: downloadError } = await supabase.storage
      .from('voice-notes')
      .download(voiceNote.file_url.replace('/storage/v1/object/public/voice-notes/', ''));

    if (downloadError || !audioData) {
      console.error('Failed to download audio:', downloadError);
      throw new Error('Failed to download audio file');
    }

    console.log('Downloaded audio data, size:', audioData.size);

    // Prepare form data for OpenAI Whisper
    const formData = new FormData();
    formData.append('file', audioData, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', voiceNote.language || 'es');

    console.log('Sending to OpenAI Whisper...');

    // Send to OpenAI Whisper API
    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: formData,
    });

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`Transcription failed: ${errorText}`);
    }

    const transcriptionResult = await transcriptionResponse.json();
    const transcript = transcriptionResult.text;

    console.log('Transcription completed:', transcript);

    // Generate AI summary using GPT
    const summaryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente especializado en gestión de restaurantes McDonald\'s. Resume la siguiente nota de voz de manera concisa, identificando los puntos clave y cualquier acción requerida. Responde en español.'
          },
          {
            role: 'user',
            content: `Transcripción de nota de voz: ${transcript}`
          }
        ],
        max_tokens: 150,
        temperature: 0.3,
      }),
    });

    if (!summaryResponse.ok) {
      const errorText = await summaryResponse.text();
      console.error('Summary generation error:', errorText);
      throw new Error(`Summary generation failed: ${errorText}`);
    }

    const summaryResult = await summaryResponse.json();
    const aiSummary = summaryResult.choices[0].message.content;

    console.log('AI summary generated:', aiSummary);

    // Create or update voice transcript
    const { data: existingTranscript } = await supabase
      .from('voice_transcripts')
      .select('id')
      .eq('voice_note_id', voice_note_id)
      .single();

    let transcriptResult;
    if (existingTranscript) {
      // Update existing transcript
      const { data, error } = await supabase
        .from('voice_transcripts')
        .update({
          transcript,
          ai_summary: aiSummary,
          status: 'done',
          updated_at: new Date().toISOString()
        })
        .eq('voice_note_id', voice_note_id)
        .select()
        .single();
      
      transcriptResult = { data, error };
    } else {
      // Create new transcript
      const { data, error } = await supabase
        .from('voice_transcripts')
        .insert({
          voice_note_id,
          transcript,
          ai_summary: aiSummary,
          status: 'done'
        })
        .select()
        .single();
      
      transcriptResult = { data, error };
    }

    if (transcriptResult.error) {
      console.error('Failed to save transcript:', transcriptResult.error);
      throw new Error('Failed to save transcript');
    }

    console.log('Transcript saved successfully');

    // Extract potential incident keywords for smart linking
    const keywordResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Analiza la siguiente transcripción y extrae palabras clave relacionadas con incidencias en restaurantes (equipos, mantenimiento, problemas, etc.). Devuelve solo una lista de palabras separadas por comas.'
          },
          {
            role: 'user',
            content: transcript
          }
        ],
        max_tokens: 50,
        temperature: 0.1,
      }),
    });

    let keywords = [];
    if (keywordResponse.ok) {
      const keywordResult = await keywordResponse.json();
      keywords = keywordResult.choices[0].message.content
        .split(',')
        .map((k: string) => k.trim())
        .filter((k: string) => k.length > 0);
    }

    return new Response(
      JSON.stringify({
        success: true,
        transcript: transcriptResult.data,
        keywords
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Voice transcription error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});