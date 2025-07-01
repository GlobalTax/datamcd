
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAnnualBudgets } from '@/hooks/useAnnualBudgets';
import { showSuccess, showError } from '@/utils/notifications';
import { useAuth } from '@/hooks/useAuth';

interface AnnualBudgetGridProps {
  year: number;
  restaurantId: string;
}

const AnnualBudgetGrid: React.FC<AnnualBudgetGridProps> = ({ year, restaurantId }) => {
  const { budgets, loading, saveBudget } = useAnnualBudgets();
  const { user } = useAuth();
  const [monthlyData, setMonthlyData] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  const months = [
    { key: 'jan', label: 'Enero' },
    { key: 'feb', label: 'Febrero' },
    { key: 'mar', label: 'Marzo' },
    { key: 'apr', label: 'Abril' },
    { key: 'may', label: 'Mayo' },
    { key: 'jun', label: 'Junio' },
    { key: 'jul', label: 'Julio' },
    { key: 'aug', label: 'Agosto' },
    { key: 'sep', label: 'Septiembre' },
    { key: 'oct', label: 'Octubre' },
    { key: 'nov', label: 'Noviembre' },
    { key: 'dec', label: 'Diciembre' }
  ];

  useEffect(() => {
    // Find the budget for the current year and restaurant
    const budget = budgets.find(
      (b) => b.year === year && b.restaurant_id === restaurantId
    );

    if (budget) {
      setMonthlyData({
        jan: budget.jan || 0,
        feb: budget.feb || 0,
        mar: budget.mar || 0,
        apr: budget.apr || 0,
        may: budget.may || 0,
        jun: budget.jun || 0,
        jul: budget.jul || 0,
        aug: budget.aug || 0,
        sep: budget.sep || 0,
        oct: budget.oct || 0,
        nov: budget.nov || 0,
        dec: budget.dec || 0
      });
    } else {
      setMonthlyData({
        jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
        jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
      });
    }
  }, [budgets, year, restaurantId]);

  const handleChange = (month: string, value: string) => {
    setMonthlyData(prev => ({
      ...prev,
      [month]: parseFloat(value) || 0
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      await saveBudget({
        year,
        restaurant_id: restaurantId,
        category: 'revenue',
        subcategory: null,
        created_by: user?.id || null,
        jan: monthlyData.jan || 0,
        feb: monthlyData.feb || 0,
        mar: monthlyData.mar || 0,
        apr: monthlyData.apr || 0,
        may: monthlyData.may || 0,
        jun: monthlyData.jun || 0,
        jul: monthlyData.jul || 0,
        aug: monthlyData.aug || 0,
        sep: monthlyData.sep || 0,
        oct: monthlyData.oct || 0,
        nov: monthlyData.nov || 0,
        dec: monthlyData.dec || 0
      });
      
      showSuccess('Presupuesto guardado correctamente');
    } catch (error) {
      console.error('Error saving budget:', error);
      showError('Error al guardar el presupuesto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Presupuesto Anual {year}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {months.map((month) => (
            <div key={month.key} className="space-y-2">
              <label
                htmlFor={month.key}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {month.label}
              </label>
              <input
                type="number"
                id={month.key}
                placeholder={`Presupuesto para ${month.label}`}
                className="flex h-10 w-full rounded-md border border-gray-200 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={monthlyData[month.key] || ''}
                onChange={(e) => handleChange(month.key, e.target.value)}
              />
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? 'Guardando...' : 'Guardar Presupuesto'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnnualBudgetGrid;
