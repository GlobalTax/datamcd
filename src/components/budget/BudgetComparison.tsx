
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BudgetData } from '@/types/budgetTypes';
import { ActualData } from '@/hooks/useActualData';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface BudgetComparisonProps {
  budgetData: BudgetData[];
  actualData: ActualData[];
  year: number;
}

export const BudgetComparison: React.FC<BudgetComparisonProps> = ({
  budgetData,
  actualData,
  year
}) => {
  const months = [
    { key: 'jan', label: 'Ene' },
    { key: 'feb', label: 'Feb' },
    { key: 'mar', label: 'Mar' },
    { key: 'apr', label: 'Abr' },
    { key: 'may', label: 'May' },
    { key: 'jun', label: 'Jun' },
    { key: 'jul', label: 'Jul' },
    { key: 'aug', label: 'Ago' },
    { key: 'sep', label: 'Sep' },
    { key: 'oct', label: 'Oct' },
    { key: 'nov', label: 'Nov' },
    { key: 'dec', label: 'Dic' }
  ];

  const formatCurrency = (value: number) => {
    return `€${value.toLocaleString()}`;
  };

  const getVariance = (actual: number, budget: number) => {
    return actual - budget;
  };

  const getVariancePercentage = (actual: number, budget: number) => {
    if (budget === 0) return 0;
    return ((actual - budget) / budget) * 100;
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (variance < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getVarianceBadge = (variance: number, percentage: number) => {
    const absPercentage = Math.abs(percentage);
    if (absPercentage < 5) {
      return <Badge variant="secondary">±{absPercentage.toFixed(1)}%</Badge>;
    } else if (variance > 0) {
      return <Badge variant="default" className="bg-green-100 text-green-800">+{absPercentage.toFixed(1)}%</Badge>;
    } else {
      return <Badge variant="destructive">-{absPercentage.toFixed(1)}%</Badge>;
    }
  };

  const getActualValue = (category: string, subcategory: string, month: string): number => {
    const actualItem = actualData.find(item => 
      item.category === category && item.subcategory === subcategory
    );
    return actualItem ? (actualItem[month as keyof ActualData] as number) : 0;
  };

  const getBudgetValue = (category: string, subcategory: string, month: string): number => {
    const budgetItem = budgetData.find(item => 
      item.category === category && item.subcategory === subcategory && !item.isCategory
    );
    return budgetItem ? (budgetItem[month as keyof BudgetData] as number) : 0;
  };

  const getUniqueItems = () => {
    const items = new Set<string>();
    budgetData.filter(item => !item.isCategory).forEach(item => {
      items.add(`${item.category}|${item.subcategory}`);
    });
    actualData.forEach(item => {
      items.add(`${item.category}|${item.subcategory}`);
    });
    return Array.from(items).map(item => {
      const [category, subcategory] = item.split('|');
      return { category, subcategory };
    });
  };

  const uniqueItems = getUniqueItems();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Comparativo Presupuesto vs Real {year}</CardTitle>
        <p className="text-sm text-gray-600">
          Análisis de variaciones entre datos presupuestados y reales
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-white z-10 min-w-[200px]">Concepto</TableHead>
                {months.map(month => (
                  <TableHead key={month.key} className="text-center min-w-[150px]">
                    {month.label}
                  </TableHead>
                ))}
                <TableHead className="text-center min-w-[150px] bg-blue-50 font-bold">Total Anual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uniqueItems.map((item, index) => {
                const key = `${item.category}-${item.subcategory}`;
                return (
                  <TableRow key={key}>
                    <TableCell className="sticky left-0 bg-white z-10 font-medium">
                      <div className="text-gray-700">
                        <div className="font-medium">{item.category}</div>
                        <div className="text-sm text-gray-500">{item.subcategory}</div>
                      </div>
                    </TableCell>
                    {months.map(month => {
                      const actualValue = getActualValue(item.category, item.subcategory || '', month.key);
                      const budgetValue = getBudgetValue(item.category, item.subcategory || '', month.key);
                      const variance = getVariance(actualValue, budgetValue);
                      const variancePercentage = getVariancePercentage(actualValue, budgetValue);

                      return (
                        <TableCell key={month.key} className="text-center">
                          <div className="space-y-1">
                            <div className="text-xs text-gray-500">Real: {formatCurrency(actualValue)}</div>
                            <div className="text-xs text-gray-500">Ppto: {formatCurrency(budgetValue)}</div>
                            <div className="flex items-center justify-center gap-1">
                              {getVarianceIcon(variance)}
                              {getVarianceBadge(variance, variancePercentage)}
                            </div>
                          </div>
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center bg-blue-50">
                      {(() => {
                        const actualTotal = months.reduce((sum, month) => 
                          sum + getActualValue(item.category, item.subcategory || '', month.key), 0
                        );
                        const budgetTotal = months.reduce((sum, month) => 
                          sum + getBudgetValue(item.category, item.subcategory || '', month.key), 0
                        );
                        const totalVariance = getVariance(actualTotal, budgetTotal);
                        const totalVariancePercentage = getVariancePercentage(actualTotal, budgetTotal);

                        return (
                          <div className="space-y-1">
                            <div className="text-xs text-gray-500">Real: {formatCurrency(actualTotal)}</div>
                            <div className="text-xs text-gray-500">Ppto: {formatCurrency(budgetTotal)}</div>
                            <div className="flex items-center justify-center gap-1">
                              {getVarianceIcon(totalVariance)}
                              {getVarianceBadge(totalVariance, totalVariancePercentage)}
                            </div>
                          </div>
                        );
                      })()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
