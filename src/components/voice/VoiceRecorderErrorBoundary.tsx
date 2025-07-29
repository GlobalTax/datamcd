import React from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface VoiceRecorderErrorBoundaryProps {
  children: React.ReactNode;
}

const VoiceRecorderFallback = () => (
  <Card className="border-destructive/20 bg-destructive/5">
    <CardContent className="p-4">
      <div className="flex items-center gap-2 text-destructive">
        <AlertTriangle className="w-4 h-4" />
        <span className="text-sm">Error en el grabador de voz</span>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        El componente de grabación no está disponible temporalmente.
      </p>
    </CardContent>
  </Card>
);

export const VoiceRecorderErrorBoundary: React.FC<VoiceRecorderErrorBoundaryProps> = ({ children }) => {
  return (
    <ErrorBoundary fallback={<VoiceRecorderFallback />}>
      {children}
    </ErrorBoundary>
  );
};