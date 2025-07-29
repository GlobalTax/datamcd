import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Pause, Trash2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  disabled?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  disabled = false
}) => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Check for browser support and permissions on mount
  useEffect(() => {
    const checkSupport = () => {
      const supported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
      setIsSupported(supported);
      
      if (!supported) {
        logger.warn('Voice recording not supported', { 
          component: 'VoiceRecorder',
          hasMediaDevices: !!navigator.mediaDevices,
          hasGetUserMedia: !!(navigator.mediaDevices?.getUserMedia),
          hasMediaRecorder: !!window.MediaRecorder
        });
      }
    };

    checkSupport();
  }, []);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      toast({
        title: "No Compatible",
        description: "Tu navegador no soporta grabación de audio.",
        variant: "destructive",
      });
      return;
    }

    try {
      logger.info('Starting voice recording', { component: 'VoiceRecorder' });
      
      // Check permissions first
      const permissionResult = await navigator.permissions?.query({ name: 'microphone' as PermissionName });
      if (permissionResult?.state === 'denied') {
        setHasPermission(false);
        throw new Error('Microphone permission denied');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      setHasPermission(true);
      streamRef.current = stream;
      chunksRef.current = [];

      // Check for supported MIME types
      const supportedTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus'
      ];
      
      const mimeType = supportedTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'audio/webm';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        const error = (event as any).error || new Error('MediaRecorder error');
        logger.error('MediaRecorder error', { 
          component: 'VoiceRecorder',
          error: error.message || 'Unknown error'
        });
        setIsRecording(false);
        toast({
          title: "Error de Grabación",
          description: "Error durante la grabación de audio.",
          variant: "destructive",
        });
      };

      mediaRecorder.onstop = () => {
        logger.info('Recording stopped, processing audio', { component: 'VoiceRecorder' });
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        onRecordingComplete(audioBlob);
        
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start(100); // Capture data every 100ms
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      logger.info('Recording started successfully', { component: 'VoiceRecorder', mimeType });

    } catch (error) {
      logger.error('Error starting recording', { 
        component: 'VoiceRecorder',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, error instanceof Error ? error : undefined);
      
      setHasPermission(false);
      
      let errorMessage = "No se pudo acceder al micrófono.";
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = "Permiso de micrófono denegado. Habilite el micrófono en la configuración del navegador.";
        } else if (error.name === 'NotFoundError') {
          errorMessage = "No se encontró ningún micrófono. Verifique que su dispositivo tenga un micrófono conectado.";
        } else if (error.name === 'NotSupportedError') {
          errorMessage = "Grabación de audio no soportada en este navegador.";
        }
      }
      
      toast({
        title: "Error de Grabación",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [onRecordingComplete, toast, isSupported]);

  const stopRecording = useCallback(() => {
    console.log('Stopping recording...');
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  }, [isRecording]);

  const playRecording = useCallback(() => {
    if (audioURL && !isPlaying) {
      const audio = new Audio(audioURL);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
      };
      
      audio.play();
      setIsPlaying(true);
    }
  }, [audioURL, isPlaying]);

  const pausePlayback = useCallback(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      audioRef.current = null;
    }
  }, [isPlaying]);

  const clearRecording = useCallback(() => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
      setAudioURL(null);
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setRecordingTime(0);
  }, [audioURL]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show unsupported browser message
  if (!isSupported) {
    return (
      <div className="flex flex-col gap-4 p-4 border border-border rounded-lg bg-card">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm">Grabación de audio no disponible en este navegador</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 border border-border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Nota de Voz</h3>
        {isRecording && (
          <div className="flex items-center gap-2 text-destructive">
            <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
            <span className="text-sm font-mono">{formatTime(recordingTime)}</span>
          </div>
        )}
      </div>

      {hasPermission === false && (
        <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
          Sin permisos de micrófono. Actualice la página y permita el acceso al micrófono.
        </div>
      )}

      <div className="flex items-center gap-2">
        {!isRecording && !audioURL && (
          <Button
            onClick={startRecording}
            disabled={disabled || hasPermission === false}
            size="sm"
            className="flex items-center gap-2"
          >
            <Mic className="w-4 h-4" />
            Grabar
          </Button>
        )}

        {isRecording && (
          <Button
            onClick={stopRecording}
            variant="destructive"
            size="sm"
            className="flex items-center gap-2"
          >
            <Square className="w-4 h-4" />
            Detener
          </Button>
        )}

        {audioURL && !isRecording && (
          <>
            <Button
              onClick={isPlaying ? pausePlayback : playRecording}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Reproducir
                </>
              )}
            </Button>
            
            <Button
              onClick={clearRecording}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Borrar
            </Button>
          </>
        )}
      </div>

      {audioURL && (
        <div className="text-xs text-muted-foreground">
          Grabación completada - {formatTime(recordingTime)}
        </div>
      )}
    </div>
  );
};