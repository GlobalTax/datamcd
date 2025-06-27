
import React from 'react';
import { RefreshCw, Database, AlertTriangle, Zap } from 'lucide-react';

interface ConnectionStatusProps {
  connectionStatus: 'connecting' | 'connected' | 'fallback';
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ connectionStatus }) => {
  const getConnectionStatusDisplay = () => {
    switch (connectionStatus) {
      case 'connecting':
        return {
          icon: <RefreshCw className="w-4 h-4 animate-spin" />,
          text: 'Conectando...',
          color: 'text-blue-600',
          bg: 'bg-blue-100'
        };
      case 'connected':
        return {
          icon: <Database className="w-4 h-4" />,
          text: 'Datos Reales',
          color: 'text-green-600',
          bg: 'bg-green-100'
        };
      case 'fallback':
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          text: 'Datos Temporales',
          color: 'text-orange-600',
          bg: 'bg-orange-100'
        };
    }
  };

  const statusDisplay = getConnectionStatusDisplay();

  return (
    <div className="flex items-center gap-3">
      <div className={`flex items-center gap-2 px-3 py-1 ${statusDisplay.bg} ${statusDisplay.color} rounded-md text-sm font-medium`}>
        {statusDisplay.icon}
        <span>{statusDisplay.text}</span>
      </div>
      {connectionStatus === 'connected' && (
        <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs">
          <Zap className="w-3 h-3" />
          <span>Supabase Live</span>
        </div>
      )}
    </div>
  );
};
