
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Database, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  WifiOff 
} from 'lucide-react';

interface StatusWidgetProps {
  user: any;
  franchisee: any;
  connectionStatus: 'online' | 'offline' | 'reconnecting';
  isImpersonating: boolean;
  effectiveFranchisee: any;
}

export const StatusWidget: React.FC<StatusWidgetProps> = ({
  user,
  franchisee,
  connectionStatus,
  isImpersonating,
  effectiveFranchisee
}) => {
  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'offline':
        return <WifiOff className="w-4 h-4 text-red-600" />;
      case 'reconnecting':
        return <Database className="w-4 h-4 text-blue-600 animate-pulse" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'online': return 'En Línea';
      case 'offline': return 'Sin Conexión';
      case 'reconnecting': return 'Reconectando...';
      default: return 'Estado Desconocido';
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'online': return 'bg-green-100 text-green-800 border-green-200';
      case 'offline': return 'bg-red-100 text-red-800 border-red-200';
      case 'reconnecting': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Estado del Sistema
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado de conexión */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <p className="font-medium text-sm">Conexión</p>
              <p className="text-xs text-gray-600">Base de datos</p>
            </div>
          </div>
          <Badge className={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </div>

        {/* Información del usuario */}
        {user && franchisee && (
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900">
                  {effectiveFranchisee?.franchisee_name || franchisee.franchisee_name}
                </h4>
                <p className="text-sm text-blue-700">
                  {user.full_name} ({user.email})
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">
                    {user.role}
                  </Badge>
                  {isImpersonating && (
                    <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                      <Zap className="w-3 h-3 mr-1" />
                      Vista Asesor
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alertas de estado */}
        {connectionStatus === 'offline' && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Sin conexión con la base de datos. Algunos datos pueden no estar actualizados.
            </AlertDescription>
          </Alert>
        )}

        {user && !franchisee && connectionStatus === 'online' && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Tu usuario existe pero no tiene un franquiciado asignado. 
              Contacta con tu asesor.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
