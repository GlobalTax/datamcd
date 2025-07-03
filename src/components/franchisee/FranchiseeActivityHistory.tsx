
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Eye, Plus, Edit, Trash, FileText } from 'lucide-react';
import { useFranchiseeActivity } from '@/hooks/useFranchiseeActivity';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface FranchiseeActivityHistoryProps {
  franchiseeId: string;
}

export const FranchiseeActivityHistory: React.FC<FranchiseeActivityHistoryProps> = ({
  franchiseeId
}) => {
  const { activityLogs, loading } = useFranchiseeActivity(franchiseeId);

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'valuation_created':
        return <Plus className="w-4 h-4" />;
      case 'valuation_viewed':
        return <Eye className="w-4 h-4" />;
      case 'valuation_updated':
        return <Edit className="w-4 h-4" />;
      case 'restaurant_viewed':
        return <Eye className="w-4 h-4" />;
      case 'report_generated':
        return <FileText className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case 'valuation_created':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'valuation_viewed':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'valuation_updated':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'restaurant_viewed':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'report_generated':
        return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatActivityType = (activityType: string) => {
    const types: Record<string, string> = {
      'valuation_created': 'Valoración creada',
      'valuation_viewed': 'Valoración vista',
      'valuation_updated': 'Valoración actualizada',
      'restaurant_viewed': 'Restaurante visto',
      'report_generated': 'Reporte generado',
      'login': 'Inicio de sesión',
      'logout': 'Cierre de sesión'
    };
    return types[activityType] || activityType;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Historial de Actividad
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-gray-500">Cargando actividad...</p>
        ) : activityLogs.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activityLogs.map((log) => (
              <div key={log.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <div className={`p-1 rounded-full border ${getActivityColor(log.activity_type)}`}>
                      {getActivityIcon(log.activity_type)}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-sm">{formatActivityType(log.activity_type)}</p>
                      {log.activity_description && (
                        <p className="text-xs text-gray-600">{log.activity_description}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {format(new Date(log.created_at), 'dd/MM HH:mm', { locale: es })}
                  </span>
                </div>
                
                {(log.entity_type || log.entity_id) && (
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    {log.entity_type && (
                      <Badge variant="outline" className="text-xs">
                        {log.entity_type}
                      </Badge>
                    )}
                    {log.entity_id && (
                      <span className="font-mono">{log.entity_id}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No hay actividad registrada</p>
        )}
      </CardContent>
    </Card>
  );
};
