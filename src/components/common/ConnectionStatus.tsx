import React from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';

export const ConnectionStatus: React.FC = () => {
  const { connectionStatus } = useUnifiedAuth();

  if (!connectionStatus || connectionStatus === 'online') {
    return null;
  }

  const statusConfig = {
    offline: {
      icon: WifiOff,
      text: 'Sin conexión',
      variant: 'destructive' as const,
      className: 'bg-destructive/10 text-destructive border-destructive/20'
    },
    reconnecting: {
      icon: Loader2,
      text: 'Reconectando...',
      variant: 'secondary' as const,
      className: 'bg-warning/10 text-warning border-warning/20'
    }
  };

  const config = statusConfig[connectionStatus];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className="fixed top-4 right-4 z-50">
      <Badge variant={config.variant} className={config.className}>
        <Icon className={`w-3 h-3 mr-1 ${connectionStatus === 'reconnecting' ? 'animate-spin' : ''}`} />
        {config.text}
      </Badge>
    </div>
  );
};