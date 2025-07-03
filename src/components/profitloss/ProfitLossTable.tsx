import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfitLossData } from '@/types/profitLoss';
import { useProfitLossCalculations } from '@/hooks/useProfitLossData';

interface ProfitLossTableProps {
  data: ProfitLossData[];
  showOnlyTotals?: boolean;
}

export const ProfitLossTable =  ({ data, showOnlyTotals = false }: ProfitLossTableProps) => {
  const { formatCurrency, formatPercentage, calculateMetrics } = useProfitLossCalculations();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-500">No hay datos disponibles para este año</p>
        </CardContent>
      </Card>
    );
  }

  // Ordenar datos por mes
  const sortedData = [...data].sort((a, b) => a.month - b.month);

  // Calcular totales anuales
  const yearTotals = sortedData.reduce((acc, row) => ({
    net_sales: acc.net_sales + row.net_sales,
    total_revenue: acc.total_revenue + row.total_revenue,
    food_cost: acc.food_cost + row.food_cost,
    total_labor: acc.total_labor + row.total_labor,
    total_operating_expenses: acc.total_operating_expenses + row.total_operating_expenses,
    total_mcdonalds_fees: acc.total_mcdonalds_fees + row.total_mcdonalds_fees,
    operating_income: acc.operating_income + row.operating_income,
  }), {
    net_sales: 0,
    total_revenue: 0,
    food_cost: 0,
    total_labor: 0,
    total_operating_expenses: 0,
    total_mcdonalds_fees: 0,
    operating_income: 0,
  });

  const yearMetrics = calculateMetrics({
    ...yearTotals,
    year: data[0]?.year || new Date().getFullYear(),
    month: 0,
    restaurant_id: data[0]?.restaurant_id || '',
    id: 'yearly-total',
    other_revenue: 0,
    paper_cost: 0,
    total_cost_of_sales: 0,
    management_labor: 0,
    crew_labor: 0,
    benefits: 0,
    rent: 0,
    utilities: 0,
    maintenance: 0,
    advertising: 0,
    insurance: 0,
    supplies: 0,
    other_expenses: 0,
    franchise_fee: 0,
    advertising_fee: 0,
    rent_percentage: 0,
    gross_profit: 0,
    created_at: '',
    updated_at: '',
    created_by: null,
    notes: null,
  });

  const getColumnsToShow = () => {
    if (showOnlyTotals) {
      return [
        { key: 'total_revenue', label: 'Ingresos Totales', color: 'text-green-600' },
        { key: 'operating_income', label: 'Beneficio Operativo', color: 'text-blue-600' }
      ];
    }
    
    return [
      { key: 'net_sales', label: 'Ventas Netas', color: 'text-gray-900' },
      { key: 'total_revenue', label: 'Ingresos Totales', color: 'text-green-600' },
      { key: 'food_cost', label: 'Costo Comida', color: 'text-red-600' },
      { key: 'total_labor', label: 'Mano de Obra', color: 'text-orange-600' },
      { key: 'total_operating_expenses', label: 'Gastos Operativos', color: 'text-gray-700' },
      { key: 'total_mcdonalds_fees', label: 'Fees McDonald\'s', color: 'text-purple-600' },
      { key: 'operating_income', label: 'Beneficio Operativo', color: 'text-blue-600' }
    ];
  };

  const columns = getColumnsToShow();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {showOnlyTotals ? 'Resumen P&L' : 'Datos Mensuales P&L'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3 font-semibold sticky left-0 bg-gray-50 z-10">Mes</th>
                {columns.map(col => (
                  <th key={col.key} className="text-right p-3 font-semibold min-w-[140px]">
                    {col.label}
                    {!showOnlyTotals && col.key !== 'net_sales' && col.key !== 'total_revenue' && (
                      <div className="text-xs font-normal text-gray-500 mt-1">% Ingresos</div>
                    )}
                  </th>
                ))}
                {!showOnlyTotals && (
                  <th className="text-right p-3 font-semibold min-w-[100px]">Margen %</th>
                )}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row) => {
                const metrics = calculateMetrics(row);
                return (
                  <tr key={`${row.year}-${row.month}`} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium sticky left-0 bg-white z-10">
                      {monthNames[row.month - 1]}
                    </td>
                    {columns.map(col => (
                      <td key={col.key} className={`p-3 text-right ${col.color}`}>
                        <div className="font-semibold">
                          {formatCurrency(row[col.key as keyof ProfitLossData] as number)}
                        </div>
                        {!showOnlyTotals && col.key !== 'net_sales' && col.key !== 'total_revenue' && (
                          <div className="text-xs text-gray-500">
                            {formatPercentage(
                              row.total_revenue > 0 
                                ? ((row[col.key as keyof ProfitLossData] as number) / row.total_revenue) * 100 
                                : 0
                            )}
                          </div>
                        )}
                      </td>
                    ))}
                    {!showOnlyTotals && (
                      <td className="p-3 text-right">
                        <span className={metrics.operatingMargin >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {formatPercentage(metrics.operatingMargin)}
                        </span>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 bg-gray-100 font-bold">
                <td className="p-3 sticky left-0 bg-gray-100 z-10">TOTAL ANUAL</td>
                {columns.map(col => (
                  <td key={col.key} className={`p-3 text-right ${col.color}`}>
                    <div className="font-bold text-base">
                      {formatCurrency(yearTotals[col.key as keyof typeof yearTotals])}
                    </div>
                    {!showOnlyTotals && col.key !== 'net_sales' && col.key !== 'total_revenue' && (
                      <div className="text-xs text-gray-600">
                        {formatPercentage(
                          yearTotals.total_revenue > 0 
                            ? (yearTotals[col.key as keyof typeof yearTotals] / yearTotals.total_revenue) * 100 
                            : 0
                        )}
                      </div>
                    )}
                  </td>
                ))}
                {!showOnlyTotals && (
                  <td className="p-3 text-right">
                    <span className={yearMetrics.operatingMargin >= 0 ? 'text-green-600 font-bold text-base' : 'text-red-600 font-bold text-base'}>
                      {formatPercentage(yearMetrics.operatingMargin)}
                    </span>
                  </td>
                )}
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
