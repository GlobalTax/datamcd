
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building, 
  TrendingUp, 
  BarChart3, 
  DollarSign, 
  AlertTriangle, 
  Target 
} from 'lucide-react';
import { DashboardMetrics } from '@/hooks/useDashboardData';

interface MetricsWidgetProps {
  metrics: DashboardMetrics;
  userRole?: string;
}

export const MetricsWidget: React.FC<MetricsWidgetProps> = ({ metrics, userRole }) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const metricCards = [
    {
      title: 'Restaurantes',
      value: metrics.totalRestaurants.toString(),
      icon: Building,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Ingresos Totales',
      value: formatCurrency(metrics.totalRevenue),
      subtitle: formatCurrency(metrics.averageRevenue) + ' promedio',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Margen Operativo',
      value: formatPercentage(metrics.operatingMargin),
      subtitle: 'Estimado anual',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      title: 'ROI Promedio',
      value: formatPercentage(metrics.averageROI),
      subtitle: 'Retorno anual',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    }
  ];

  // Añadir métricas específicas para administradores
  if (userRole === 'asesor' || userRole === 'admin' || userRole === 'superadmin') {
    metricCards.push(
      {
        title: 'Alertas Activas',
        value: metrics.alerts.toString(),
        icon: AlertTriangle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      },
      {
        title: 'Tareas Pendientes',
        value: metrics.tasks.toString(),
        icon: Target,
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-50',
        borderColor: 'border-cyan-200'
      }
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {metricCards.map((metric, index) => (
        <Card key={index} className={`${metric.bgColor} ${metric.borderColor}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              {metric.title}
            </CardTitle>
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
            {metric.subtitle && (
              <p className="text-xs text-gray-600 mt-1">{metric.subtitle}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
