import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MonthlyFinancialData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
}

interface BudgetComparison {
  category: string;
  budget: number;
  actual: number;
  variance: number;
}

interface RestaurantFinancials {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  monthlyData: MonthlyFinancialData[];
}

interface RestaurantBudgets {
  comparison: BudgetComparison[];
}

export const useRestaurantFinancials = (restaurantId: string) => {
  const [financials, setFinancials] = useState<RestaurantFinancials>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    monthlyData: [],
  });
  
  const [budgets, setBudgets] = useState<RestaurantBudgets>({
    comparison: [],
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    const fetchFinancialData = async () => {
      try {
        setLoading(true);

        const currentYear = new Date().getFullYear();

        // Fetch monthly tracking data
        const { data: monthlyData } = await supabase
          .from('monthly_tracking')
          .select('*')
          .eq('franchisee_restaurant_id', restaurantId)
          .eq('year', currentYear)
          .order('month');

        // Fetch budget data
        const { data: budgetData } = await supabase
          .from('annual_budgets')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .eq('year', currentYear);

        // Process monthly data
        const monthNames = [
          'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
          'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
        ];

        const processedMonthlyData: MonthlyFinancialData[] = monthlyData?.map(month => {
          const revenue = month.actual_revenue || 0;
          const expenses = (month.actual_food_cost || 0) + 
                          (month.actual_labor_cost || 0) + 
                          (month.actual_rent || 0) + 
                          (month.actual_utilities || 0) + 
                          (month.actual_marketing || 0) + 
                          (month.actual_other_expenses || 0);
          const profit = revenue - expenses;
          const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

          return {
            month: monthNames[month.month - 1],
            revenue,
            expenses,
            profit,
            margin,
          };
        }) || [];

        // Calculate totals
        const totalRevenue = processedMonthlyData.reduce((sum, month) => sum + month.revenue, 0);
        const totalExpenses = processedMonthlyData.reduce((sum, month) => sum + month.expenses, 0);
        const netProfit = totalRevenue - totalExpenses;
        const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

        setFinancials({
          totalRevenue,
          totalExpenses,
          netProfit,
          profitMargin,
          monthlyData: processedMonthlyData,
        });

        // Process budget comparison
        const budgetCategories = [
          { key: 'revenue', name: 'Ingresos' },
          { key: 'food_cost', name: 'Coste Alimentos' },
          { key: 'labor_cost', name: 'Coste Personal' },
          { key: 'rent', name: 'Alquiler' },
          { key: 'utilities', name: 'Servicios' },
          { key: 'marketing', name: 'Marketing' },
          { key: 'other_expenses', name: 'Otros Gastos' },
        ];

        const budgetComparison: BudgetComparison[] = budgetCategories.map(category => {
          const budgetValue = budgetData?.find(b => b.category === category.key);
          const actualValue = monthlyData?.reduce((sum, month) => {
            const key = `actual_${category.key}`;
            return sum + (month[key] || 0);
          }, 0) || 0;

          let budgetTotal = 0;
          if (budgetValue) {
            budgetTotal = (budgetValue.jan || 0) + (budgetValue.feb || 0) + (budgetValue.mar || 0) +
                         (budgetValue.apr || 0) + (budgetValue.may || 0) + (budgetValue.jun || 0) +
                         (budgetValue.jul || 0) + (budgetValue.aug || 0) + (budgetValue.sep || 0) +
                         (budgetValue.oct || 0) + (budgetValue.nov || 0) + (budgetValue.dec || 0);
          }

          return {
            category: category.name,
            budget: budgetTotal,
            actual: actualValue,
            variance: actualValue - budgetTotal,
          };
        });

        setBudgets({ comparison: budgetComparison });

      } catch (error) {
        console.error('Error fetching financial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, [restaurantId]);

  return { financials, budgets, loading };
};