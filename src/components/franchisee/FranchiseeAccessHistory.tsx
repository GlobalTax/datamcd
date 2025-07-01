
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Globe, Monitor } from 'lucide-react';
import { useFranchiseeActivity } from '@/hooks/useFranchiseeActivity';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface FranchiseeAccessHistoryProps {
  franchiseeId: string;
}

export const FranchiseeAccessHistory: React.FC<FranchiseeAccessHistoryProps> = ({
  franchiseeId
}) => {
  const { activities, loading } = useFranchiseeActivity(franchiseeId);

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}h ${remainingMinutes}m`;
  };

  const getStatusBadge = (log: any) => {
    if (log.logout_time) {
      return <Badge variant="outline" className="text-gray-600">Sesión finalizada</Badge>;
    }
    return <Badge variant="outline" className="text-green-600">Activo</Badge>;
  };

  // Filter activities to show only access-related ones
  const accessLogs = activities.filter(activity => 
    activity.activity_type === 'login' || activity.activity_type === 'logout'
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Historial de Acceso
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-gray-500">Cargando historial...</p>
        ) : accessLogs.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {accessLogs.map((log) => (
              <div key={log.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <User className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="font-medium">
                      {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </span>
                  </div>
                  {getStatusBadge(log)}
                </div>
                
                <div className="text-xs text-gray-600">
                  <span>{log.activity_type === 'login' ? 'Inicio de sesión' : 'Cierre de sesión'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No hay registros de acceso</p>
        )}
      </CardContent>
    </Card>
  );
};
