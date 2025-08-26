// Componentes simplificados que eliminan verificaciones de role
import React from 'react';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { logger } from '@/lib/logger';

// Quantum components simplificados
export const SimplifiedQuantumDataDialog = ({ children }: { children: React.ReactNode }) => {
  const { franchisee } = useUnifiedAuth();
  
  return (
    <div onClick={() => logger.debug('Quantum data requested', { franchiseeName: franchisee?.franchisee_name })}>
      {children}
    </div>
  );
};

export const SimplifiedQuantumSyncStatus = () => {
  const { franchisee } = useUnifiedAuth();
  
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-600">
        Estado de sincronización para: {franchisee?.franchisee_name || 'Cargando...'}
      </p>
    </div>
  );
};

// FranchiseeUsers simplificado
export const SimplifiedFranchiseeUsers = () => {
  const { user } = useUnifiedAuth();
  
  if (!user) {
    return <div>Cargando...</div>;
  }
  
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Usuarios del Franquiciado</h3>
      <p className="text-sm text-gray-600">
        Usuario actual: {user.full_name} ({user.email})
      </p>
    </div>
  );
};

// DebugSection simplificado
export const SimplifiedDebugSection = () => {
  const { user, getDebugInfo } = useUnifiedAuth();
  
  const debugInfo = getDebugInfo?.();
  
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h4 className="font-semibold mb-2">Debug Info</h4>
      <pre className="text-xs">
        {JSON.stringify({ 
          user: user ? { id: user.id, email: user.email } : null,
          ...debugInfo 
        }, null, 2)}
      </pre>
    </div>
  );
};

// IndexHeader simplificado
export const SimplifiedIndexHeader = () => {
  const { user } = useUnifiedAuth();
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">McDonald's Portal</h1>
          {user && (
            <div className="text-sm text-gray-600">
              {user.full_name} - Administrador
            </div>
          )}
        </div>
      </div>
    </header>
  );
};