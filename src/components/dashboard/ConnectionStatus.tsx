
import React from 'react';
import { Database, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/AuthProvider';

interface ConnectionStatusProps {
  connectionStatus?: 'connected' | 'connecting' | 'error' | 'fallback';
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  connectionStatus 
}) => {
  const { user, loading, error } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-600 rounded-md text-sm font-medium">
        <Database className="w-4 h-4 animate-pulse" />
        <span>Conectando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-600 rounded-md text-sm font-medium">
        <AlertCircle className="w-4 h-4" />
        <span>Error de Conexión</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-600 rounded-md text-sm font-medium">
        <CheckCircle className="w-4 h-4" />
        <span>Datos Reales - Supabase</span>
      </div>
    );
  }

  return null;
};
