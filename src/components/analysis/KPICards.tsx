
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfitLossCalculations } from '@/hooks/useProfitLossData';

export const KPICards = () => {
  const { formatCurrency, formatPercentage } = useProfitLossCalculations();

  const kpiData = [
    { metric: 'EBITDA', value: 315000, percentage: 23.1, trend: '+5.2%', color: 'text-green-600' },
    { metric: 'ROI', value: 24.8, percentage: 0, trend: '-1.2%', color: 'text-red-600' },
    { metric: 'Margen Neto', value: 18.5, percentage: 0, trend: '+2.1%', color: 'text-green-600' },
    { metric: 'Cash Flow', value: 285000, percentage: 20.9, trend: '+8.7%', color: 'text-green-600' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiData.map((kpi, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{kpi.metric}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpi.metric.includes('Margen') || kpi.metric === 'ROI' 
                ? formatPercentage(kpi.value)
                : formatCurrency(kpi.value)
              }
            </div>
            <p className={`text-xs ${kpi.color}`}>
              {kpi.trend} vs año anterior
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
