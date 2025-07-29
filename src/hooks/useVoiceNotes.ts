import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/auth/AuthProvider';

export interface VoiceNote {
  id: string;
  user_id: string;
  file_url: string;
  language: string;
  created_at: string;
}

export interface VoiceTranscript {
  id: string;
  voice_note_id: string;
  transcript: string;
  ai_summary: string;
  status: 'pending' | 'done' | 'error';
  created_at: string;
  updated_at: string;
}

export interface VoiceEntityLink {
  id: string;
  voice_note_id: string;
  incident_id: string;
}

export const useVoiceNotes = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  // Fetch voice notes
  const {
    data: voiceNotes,
    isLoading: isLoadingVoiceNotes,
    error: voiceNotesError
  } = useQuery({
    queryKey: ['voice-notes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voice_notes')
        .select(`
          *,
          voice_transcripts (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Upload voice note
  const uploadVoiceNote = useMutation({
    mutationFn: async (audioBlob: Blob) => {
      if (!user?.id) throw new Error('User not authenticated');

      const fileId = crypto.randomUUID();
      const fileName = `${user.id}/${fileId}.webm`;
      
      console.log('Uploading voice note:', fileName);
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('voice-notes')
        .upload(fileName, audioBlob, {
          contentType: 'audio/webm',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Error al subir archivo: ${uploadError.message}`);
      }

      setUploadProgress(prev => ({ ...prev, [fileId]: 50 }));

      // Create voice note record
      const { data: voiceNoteData, error: dbError } = await supabase
        .from('voice_notes')
        .insert({
          id: fileId,
          user_id: user.id,
          file_url: uploadData.path,
          language: 'es'
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        // Clean up uploaded file
        await supabase.storage.from('voice-notes').remove([fileName]);
        throw new Error(`Error al guardar nota: ${dbError.message}`);
      }

      setUploadProgress(prev => ({ ...prev, [fileId]: 75 }));

      // Trigger transcription
      console.log('Triggering transcription for:', fileId);
      const { data: transcriptionData, error: transcriptionError } = await supabase.functions
        .invoke('voice-transcription', {
          body: { voice_note_id: fileId }
        });

      if (transcriptionError) {
        console.error('Transcription error:', transcriptionError);
        toast({
          title: "Advertencia",
          description: "La nota se guardó pero falló la transcripción automática.",
          variant: "destructive",
        });
      } else {
        console.log('Transcription completed:', transcriptionData);
      }

      setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
      
      // Clean up progress after a delay
      setTimeout(() => {
        setUploadProgress(prev => {
          const { [fileId]: _, ...rest } = prev;
          return rest;
        });
      }, 2000);

      return voiceNoteData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-notes'] });
      toast({
        title: "Éxito",
        description: "Nota de voz guardada y transcripción iniciada.",
      });
    },
    onError: (error) => {
      console.error('Voice note upload failed:', error);
      toast({
        title: "Error",
        description: error.message || "Error al guardar la nota de voz.",
        variant: "destructive",
      });
    }
  });

  // Delete voice note
  const deleteVoiceNote = useMutation({
    mutationFn: async (voiceNoteId: string) => {
      console.log('Deleting voice note:', voiceNoteId);

      // Get voice note details
      const { data: voiceNote, error: fetchError } = await supabase
        .from('voice_notes')
        .select('file_url')
        .eq('id', voiceNoteId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('voice-notes')
        .remove([voiceNote.file_url]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
      }

      // Delete voice note record (cascade will handle related records)
      const { error: dbError } = await supabase
        .from('voice_notes')
        .delete()
        .eq('id', voiceNoteId);

      if (dbError) throw dbError;

      return voiceNoteId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-notes'] });
      toast({
        title: "Éxito",
        description: "Nota de voz eliminada.",
      });
    },
    onError: (error) => {
      console.error('Voice note deletion failed:', error);
      toast({
        title: "Error",
        description: "Error al eliminar la nota de voz.",
        variant: "destructive",
      });
    }
  });

  // Link voice note to incident
  const linkToIncident = useMutation({
    mutationFn: async ({ voiceNoteId, incidentId }: { voiceNoteId: string; incidentId: string }) => {
      const { data, error } = await supabase
        .from('voice_entity_links')
        .insert({
          voice_note_id: voiceNoteId,
          entity_id: incidentId,
          entity_type: 'incident',
          relationship_type: 'related'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-notes'] });
      toast({
        title: "Éxito",
        description: "Nota de voz vinculada a la incidencia.",
      });
    },
    onError: (error) => {
      console.error('Voice note linking failed:', error);
      toast({
        title: "Error",
        description: "Error al vincular la nota de voz.",
        variant: "destructive",
      });
    }
  });

  // Retry transcription
  const retryTranscription = useMutation({
    mutationFn: async (voiceNoteId: string) => {
      const { data, error } = await supabase.functions
        .invoke('voice-transcription', {
          body: { voice_note_id: voiceNoteId }
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-notes'] });
      toast({
        title: "Éxito",
        description: "Transcripción reiniciada.",
      });
    },
    onError: (error) => {
      console.error('Transcription retry failed:', error);
      toast({
        title: "Error",
        description: "Error al reiniciar la transcripción.",
        variant: "destructive",
      });
    }
  });

  return {
    voiceNotes: voiceNotes || [],
    isLoadingVoiceNotes,
    voiceNotesError,
    uploadProgress,
    uploadVoiceNote: uploadVoiceNote.mutate,
    isUploading: uploadVoiceNote.isPending,
    deleteVoiceNote: deleteVoiceNote.mutate,
    isDeleting: deleteVoiceNote.isPending,
    linkToIncident: linkToIncident.mutate,
    isLinking: linkToIncident.isPending,
    retryTranscription: retryTranscription.mutate,
    isRetrying: retryTranscription.isPending
  };
};