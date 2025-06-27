
import React from 'react';
import { Building2, TrendingUp, Calculator, BarChart3 } from 'lucide-react';

interface DashboardMetricsProps {
  totalRestaurants: number;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  totalRestaurants
}) => {
  const metrics = [
    {
      label: 'Restaurantes',
      value: totalRestaurants.toString(),
      change: '+2',
      icon: Building2,
      color: 'text-blue-600'
    },
    {
      label: 'Ingresos',
      value: '€2.4M',
      change: '+8.2%',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      label: 'Valoración',
      value: '€1.8M',
      change: 'Media',
      icon: Calculator,
      color: 'text-purple-600'
    },
    {
      label: 'ROI',
      value: '+12.5%',
      change: 'Promedio',
      icon: BarChart3,
      color: 'text-emerald-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-white rounded-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <metric.icon className={`w-5 h-5 ${metric.color}`} />
            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
              {metric.change}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-semibold text-gray-900">{metric.value}</p>
            <p className="text-sm text-gray-500">{metric.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
