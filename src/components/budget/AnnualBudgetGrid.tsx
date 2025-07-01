
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAnnualBudgets } from '@/hooks/useAnnualBudgets';
import { showSuccess, showError } from '@/utils/notifications';
import { useAuth } from '@/hooks/useAuth';

interface BudgetEntry {
  month: string;
  value: number | string;
}

interface AnnualBudgetGridProps {
  year: number;
  restaurantId: string;
}

const AnnualBudgetGrid: React.FC<AnnualBudgetGridProps> = ({ year, restaurantId }) => {
  const { budgets, loading, saveBudget } = useAnnualBudgets();
  const { user } = useAuth();
  const [budgetData, setBudgetData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Find the budget for the current year and restaurant
    const budget = budgets.find(
      (b) => b.year === year && b.restaurant_id === restaurantId
    );

    // If a budget exists, load its data into the state
    if (budget) {
      setBudgetData(budget.budget_data || {});
    } else {
      // Initialize with empty data for all months
      const initialData: { [key: string]: string } = {};
      [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
      ].forEach(month => {
        initialData[month] = '';
      });
      setBudgetData(initialData);
    }
  }, [budgets, year, restaurantId]);

  const handleChange = (month: string, value: string) => {
    setBudgetData((prevData: any) => ({
      ...prevData,
      [month]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      await saveBudget({
        year,
        restaurant_id: restaurantId,
        budget_data: budgetData,
        user_id: user?.id
      });
      
      showSuccess('Presupuesto guardado correctamente');
    } catch (error) {
      console.error('Error saving budget:', error);
      showError('Error al guardar el presupuesto');
    } finally {
      setSaving(false);
    }
  };

  const months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Presupuesto Anual {year}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {months.map((month) => (
            <div key={month} className="space-y-2">
              <label
                htmlFor={month}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {month.charAt(0).toUpperCase() + month.slice(1)}
              </label>
              <input
                type="number"
                id={month}
                placeholder={`Presupuesto para ${month}`}
                className="flex h-10 w-full rounded-md border border-gray-200 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={(budgetData as any)[month] || ''}
                onChange={(e) => handleChange(month, e.target.value)}
              />
            </div>
          ))}
        </div>
        <Button onClick={handleSave} disabled={saving || loading}>
          {saving ? 'Guardando...' : 'Guardar Presupuesto'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AnnualBudgetGrid;
