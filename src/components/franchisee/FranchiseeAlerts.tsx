import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Clock, TrendingDown, DollarSign } from 'lucide-react';
import { FranchiseeRestaurant } from '@/types/franchiseeRestaurant';

interface FranchiseeAlertsProps {
  restaurants: FranchiseeRestaurant[];
  franchiseeName: string;
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  description: string;
  restaurant?: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
}

export function FranchiseeAlerts({ restaurants, franchiseeName }: FranchiseeAlertsProps) {
  // Generar alertas basadas en los datos de los restaurantes
  const generateAlerts = (): Alert[] => {
    const alerts: Alert[] = [];
    
    restaurants.forEach((restaurant) => {
      const restaurantName = restaurant.base_restaurant?.restaurant_name || 'Restaurante sin nombre';
      const monthlyRevenue = restaurant.average_monthly_sales || 0;
      const monthlyRent = restaurant.monthly_rent || 0;
      
      // Alerta por ratio de alquiler alto (>15% del revenue)
      if (monthlyRevenue > 0 && monthlyRent > 0) {
        const rentRatio = (monthlyRent / monthlyRevenue) * 100;
        if (rentRatio > 15) {
          alerts.push({
            id: `rent-${restaurant.id}`,
            type: 'warning',
            title: 'Ratio de alquiler elevado',
            description: `El alquiler representa el ${rentRatio.toFixed(1)}% del revenue mensual`,
            restaurant: restaurantName,
            priority: rentRatio > 20 ? 'high' : 'medium',
            createdAt: new Date(),
          });
        }
      }
      
      // Alerta por revenue bajo
      if (monthlyRevenue > 0 && monthlyRevenue < 50000) {
        alerts.push({
          id: `revenue-${restaurant.id}`,
          type: 'error',
          title: 'Revenue mensual bajo',
          description: `Revenue de €${monthlyRevenue.toLocaleString()} está por debajo del promedio`,
          restaurant: restaurantName,
          priority: monthlyRevenue < 30000 ? 'high' : 'medium',
          createdAt: new Date(),
        });
      }
      
      // Alerta por contrato próximo a vencer
      if (restaurant.franchise_end_date) {
        const endDate = new Date(restaurant.franchise_end_date);
        const now = new Date();
        const monthsUntilEnd = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
        
        if (monthsUntilEnd <= 12 && monthsUntilEnd > 0) {
          alerts.push({
            id: `contract-${restaurant.id}`,
            type: 'info',
            title: 'Contrato próximo a vencer',
            description: `El contrato vence en ${Math.ceil(monthsUntilEnd)} meses`,
            restaurant: restaurantName,
            priority: monthsUntilEnd <= 6 ? 'high' : 'low',
            createdAt: new Date(),
          });
        }
      }
    });
    
    // Alertas generales
    const totalRevenue = restaurants.reduce((sum, r) => sum + (r.average_monthly_sales || 0), 0);
    if (totalRevenue === 0) {
      alerts.push({
        id: 'no-revenue',
        type: 'error',
        title: 'Sin datos de revenue',
        description: 'No hay datos de revenue para ningún restaurante',
        priority: 'high',
        createdAt: new Date(),
      });
    }
    
    return alerts.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const alerts = generateAlerts();

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'info':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
  };

  const getAlertBgColor = (type: Alert['type']) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-l-red-500';
      case 'warning':
        return 'bg-orange-50 border-l-orange-500';
      case 'info':
        return 'bg-blue-50 border-l-blue-500';
      default:
        return 'bg-green-50 border-l-green-500';
    }
  };

  const getPriorityBadge = (priority: Alert['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Alta</Badge>;
      case 'medium':
        return <Badge variant="secondary">Media</Badge>;
      case 'low':
        return <Badge variant="outline">Baja</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Alertas y Notificaciones
          </div>
          <Badge variant="outline">{alerts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <p className="text-gray-600">No hay alertas activas</p>
            <p className="text-sm text-gray-500">Todos los indicadores están dentro de los rangos normales</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`border-l-4 p-4 rounded-r-lg ${getAlertBgColor(alert.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">{alert.title}</h4>
                        {getPriorityBadge(alert.priority)}
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{alert.description}</p>
                      {alert.restaurant && (
                        <p className="text-xs text-gray-600">
                          <strong>Restaurante:</strong> {alert.restaurant}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {alert.createdAt.toLocaleString('es-ES')}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                    Resolver
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}