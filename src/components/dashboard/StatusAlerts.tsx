
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Users } from 'lucide-react';
import { User, Franchisee } from '@/types/auth';

interface StatusAlertsProps {
  user: User | null;
  franchisee: Franchisee | null;
  restaurants: any[] | undefined;
  connectionStatus: 'connecting' | 'connected' | 'fallback';
}

export const StatusAlerts: React.FC<StatusAlertsProps> = ({ 
  user, 
  franchisee, 
  restaurants, 
  connectionStatus 
}) => {
  return (
    <div className="space-y-4">
      {/* Estado de la cuenta y franquiciado */}
      {user && franchisee && (
        <div className="border-blue-200 bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-900">
                {franchisee.franchisee_name}
              </h3>
              <p className="text-sm text-blue-700">
                Usuario: {user.full_name} ({user.email}) • Rol: {user.role}
              </p>
              <p className="text-xs text-blue-600">
                ID Franquiciado: {franchisee.id} • Restaurantes: {restaurants?.length || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alerta si no hay franquiciado pero sí usuario */}
      {user && !franchisee && connectionStatus === 'connected' && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Tu usuario ({user.email}) existe en Supabase pero no tiene un franquiciado asignado. 
            Contacta con tu asesor para que te asigne un franquiciado.
          </AlertDescription>
        </Alert>
      )}

      {/* Alerta de estado de conexión */}
      {connectionStatus === 'fallback' && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            No se pudo conectar con Supabase. Mostrando datos temporales. 
            Verifica tu conexión a internet y la configuración de Supabase.
            <Button 
              onClick={() => window.location.reload()} 
              variant="link" 
              className="p-0 h-auto ml-2 text-red-800 underline"
            >
              Intentar reconectar
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
