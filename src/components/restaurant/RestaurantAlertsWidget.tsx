
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Calendar, TrendingDown, Bell } from 'lucide-react';

interface RestaurantAlertsWidgetProps {
  restaurants: any[];
  franchiseeId?: string;
}

export const RestaurantAlertsWidget: React.FC<RestaurantAlertsWidgetProps> = ({ restaurants, franchiseeId }) => {
  // Generar alertas basadas en los datos de los restaurantes
  const generateAlerts = () => {
    const alerts: Array<{
      id: string;
      type: 'contract' | 'performance' | 'maintenance' | 'finance';
      severity: 'high' | 'medium' | 'low';
      title: string;
      description: string;
      restaurantName?: string;
      dueDate?: Date;
      icon: any;
    }> = [];

    restaurants.forEach(restaurant => {
      const restaurantName = restaurant.base_restaurant?.restaurant_name || `Restaurante ${restaurant.base_restaurant?.site_number}`;

      // Alertas de vencimiento de contrato
      if (restaurant.franchise_end_date) {
        const endDate = new Date(restaurant.franchise_end_date);
        const now = new Date();
        const monthsUntilExpiry = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);

        if (monthsUntilExpiry <= 6 && monthsUntilExpiry > 0) {
          alerts.push({
            id: `contract-${restaurant.id}`,
            type: 'contract',
            severity: monthsUntilExpiry <= 3 ? 'high' : 'medium',
            title: 'Contrato de Franquicia Próximo a Vencer',
            description: `Vence en ${Math.round(monthsUntilExpiry)} meses`,
            restaurantName,
            dueDate: endDate,
            icon: Calendar
          });
        }
      }

      // Alertas de rendimiento
      if (restaurant.last_year_revenue && restaurant.last_year_revenue < 800000) {
        alerts.push({
          id: `performance-${restaurant.id}`,
          type: 'performance',
          severity: 'medium',
          title: 'Rendimiento Bajo Promedio',
          description: 'Facturación por debajo del objetivo',
          restaurantName,
          icon: TrendingDown
        });
      }

      // Alertas financieras
      if (restaurant.monthly_rent && restaurant.last_year_revenue) {
        const annualRent = restaurant.monthly_rent * 12;
        const rentPercentage = (annualRent / restaurant.last_year_revenue) * 100;
        
        if (rentPercentage > 15) {
          alerts.push({
            id: `rent-${restaurant.id}`,
            type: 'finance',
            severity: rentPercentage > 20 ? 'high' : 'medium',
            title: 'Ratio de Renta Elevado',
            description: `${rentPercentage.toFixed(1)}% de la facturación`,
            restaurantName,
            icon: AlertTriangle
          });
        }
      }
    });

    // Ordenar por prioridad
    return alerts.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    }).slice(0, 6); // Mostrar máximo 6 alertas
  };

  const alerts = generateAlerts();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Info';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Alertas de Restaurantes
        </CardTitle>
        {alerts.length > 0 && (
          <Badge variant="destructive" className="text-xs">
            {alerts.length}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {alerts.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay alertas activas</p>
            <p className="text-xs">Todos los restaurantes funcionan correctamente</p>
          </div>
        ) : (
          <div className="space-y-0">
            {alerts.map((alert, index) => (
              <div 
                key={alert.id}
                className="p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    alert.severity === 'high' ? 'bg-red-50' :
                    alert.severity === 'medium' ? 'bg-yellow-50' : 'bg-blue-50'
                  }`}>
                    <alert.icon className={`w-4 h-4 ${
                      alert.severity === 'high' ? 'text-red-600' :
                      alert.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {alert.title}
                      </h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getSeverityColor(alert.severity)}`}
                      >
                        {getSeverityLabel(alert.severity)}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-1">
                      {alert.description}
                    </p>
                    
                    {alert.restaurantName && (
                      <p className="text-xs font-medium text-foreground">
                        {alert.restaurantName}
                      </p>
                    )}
                    
                    {alert.dueDate && (
                      <div className="flex items-center gap-1 mt-2">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {alert.dueDate.toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {alerts.length > 0 && (
          <div className="p-4 border-t bg-muted/30">
            <Button variant="link" className="w-full text-primary text-sm">
              Ver todas las alertas
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
