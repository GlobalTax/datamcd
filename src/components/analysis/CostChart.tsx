
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useProfitLossCalculations } from '@/hooks/useProfitLossData';

export const CostChart = () => {
  const { formatCurrency } = useProfitLossCalculations();

  const monthlyData = [
    { month: 'Ene', costs: 76000, profit: 22000 },
    { month: 'Feb', costs: 82000, profit: 23000 },
    { month: 'Mar', costs: 87000, profit: 25000 },
    { month: 'Abr', costs: 84000, profit: 24000 },
    { month: 'May', costs: 89000, profit: 26000 },
    { month: 'Jun', costs: 92000, profit: 28000 },
    { month: 'Jul', costs: 95000, profit: 30000 },
    { month: 'Ago', costs: 91000, profit: 27000 },
    { month: 'Sep', costs: 88000, profit: 26000 },
    { month: 'Oct', costs: 85000, profit: 25000 },
    { month: 'Nov', costs: 89000, profit: 27000 },
    { month: 'Dic', costs: 93000, profit: 29000 }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estructura de Costos Mensual</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}K`} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="costs" fill="#ef4444" name="Costos Totales" />
            <Bar dataKey="profit" fill="#10b981" name="Beneficio" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
