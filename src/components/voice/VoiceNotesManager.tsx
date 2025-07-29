import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { VoiceRecorder } from './VoiceRecorder';
import { useVoiceNotes } from '@/hooks/useVoiceNotes';
import { 
  FileAudio, 
  Trash2, 
  RefreshCw, 
  Link, 
  Calendar,
  User,
  MessageSquare,
  Play,
  Pause
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface VoiceNotesManagerProps {
  selectedIncidentId?: string;
  onIncidentLink?: (voiceNoteId: string, incidentId: string) => void;
}

export const VoiceNotesManager: React.FC<VoiceNotesManagerProps> = ({
  selectedIncidentId,
  onIncidentLink
}) => {
  const {
    voiceNotes,
    isLoadingVoiceNotes,
    uploadProgress,
    uploadVoiceNote,
    isUploading,
    deleteVoiceNote,
    isDeleting,
    linkToIncident,
    isLinking,
    retryTranscription,
    isRetrying
  } = useVoiceNotes();

  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  const handleRecordingComplete = (audioBlob: Blob) => {
    console.log('Recording completed, uploading...');
    uploadVoiceNote(audioBlob);
  };

  const handleLinkToIncident = (voiceNoteId: string) => {
    if (selectedIncidentId) {
      linkToIncident({ voiceNoteId, incidentId: selectedIncidentId });
      onIncidentLink?.(voiceNoteId, selectedIncidentId);
    }
  };

  const toggleAudioPlayback = async (voiceNote: any) => {
    if (playingAudio === voiceNote.id) {
      setPlayingAudio(null);
      return;
    }

    try {
      // Get the audio file URL from Supabase Storage
      const { data } = await import('@/integrations/supabase/client').then(
        module => module.supabase.storage
          .from('voice-notes')
          .createSignedUrl(voiceNote.file_url, 3600) // 1 hour expiry
      );

      if (data?.signedUrl) {
        const audio = new Audio(data.signedUrl);
        audio.onended = () => setPlayingAudio(null);
        audio.play();
        setPlayingAudio(voiceNote.id);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Voice Recorder Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileAudio className="w-5 h-5" />
            Nueva Nota de Voz
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            disabled={isUploading}
          />
          
          {/* Upload Progress */}
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subiendo y procesando...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Voice Notes List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Notas de Voz ({voiceNotes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingVoiceNotes ? (
            <div className="text-center py-4">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Cargando notas de voz...</p>
            </div>
          ) : voiceNotes.length === 0 ? (
            <div className="text-center py-8">
              <FileAudio className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No hay notas de voz aún</p>
              <p className="text-sm text-muted-foreground">
                Graba tu primera nota usando el micrófono de arriba
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {voiceNotes.map((voiceNote: any) => {
                const transcript = voiceNote.voice_transcripts?.[0];
                
                return (
                  <Card key={voiceNote.id} className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FileAudio className="w-4 h-4 text-primary" />
                          <div className="text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(voiceNote.created_at), 'PPp', { locale: es })}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {/* Play/Pause Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAudioPlayback(voiceNote)}
                            className="p-1 h-8 w-8"
                          >
                            {playingAudio === voiceNote.id ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>

                          {/* Link to Incident Button */}
                          {selectedIncidentId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLinkToIncident(voiceNote.id)}
                              disabled={isLinking}
                              className="p-1 h-8 w-8"
                            >
                              <Link className="w-4 h-4" />
                            </Button>
                          )}

                          {/* Retry Transcription */}
                          {transcript?.status === 'error' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => retryTranscription(voiceNote.id)}
                              disabled={isRetrying}
                              className="p-1 h-8 w-8"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          )}

                          {/* Delete Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteVoiceNote(voiceNote.id)}
                            disabled={isDeleting}
                            className="p-1 h-8 w-8 text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Transcription Status */}
                      <div className="mb-3">
                        {transcript ? (
                          <Badge 
                            variant={
                              transcript.status === 'done' ? 'default' :
                              transcript.status === 'error' ? 'destructive' : 'secondary'
                            }
                          >
                            {transcript.status === 'done' ? 'Transcrito' :
                             transcript.status === 'error' ? 'Error en transcripción' : 'Procesando...'}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Sin transcripción</Badge>
                        )}
                      </div>

                      {/* Transcript Content */}
                      {transcript?.transcript && (
                        <div className="space-y-3">
                          <div className="bg-background p-3 rounded-md border">
                            <h4 className="text-sm font-medium mb-2">Transcripción:</h4>
                            <p className="text-sm text-foreground">{transcript.transcript}</p>
                          </div>

                          {transcript.ai_summary && (
                            <>
                              <Separator />
                              <div className="bg-primary/5 p-3 rounded-md border border-primary/10">
                                <h4 className="text-sm font-medium mb-2 text-primary">Resumen IA:</h4>
                                <p className="text-sm text-foreground">{transcript.ai_summary}</p>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* No transcript available */}
                      {!transcript && (
                        <p className="text-sm text-muted-foreground italic">
                          Transcripción no disponible
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};