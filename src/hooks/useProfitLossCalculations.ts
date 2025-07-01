
export const useProfitLossCalculations = () => {
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

  const calculateMetrics = (data: any) => {
    const totalRevenue = data.total_revenue || data.net_sales + (data.other_revenue || 0);
    
    if (totalRevenue === 0) {
      return {
        grossMargin: 0,
        operatingMargin: 0,
        laborPercentage: 0,
        foodCostPercentage: 0,
        totalExpensePercentage: 0
      };
    }

    const grossProfit = data.gross_profit || totalRevenue - (data.total_cost_of_sales || data.food_cost + (data.paper_cost || 0));
    const operatingIncome = data.operating_income || 0;
    const totalLabor = data.total_labor || data.management_labor + data.crew_labor + (data.benefits || 0);
    const foodCost = data.food_cost || 0;
    const totalExpenses = (data.total_cost_of_sales || 0) + totalLabor + (data.total_operating_expenses || 0) + (data.total_mcdonalds_fees || 0);

    return {
      grossMargin: (grossProfit / totalRevenue) * 100,
      operatingMargin: (operatingIncome / totalRevenue) * 100,
      laborPercentage: (totalLabor / totalRevenue) * 100,
      foodCostPercentage: (foodCost / totalRevenue) * 100,
      totalExpensePercentage: (totalExpenses / totalRevenue) * 100
    };
  };

  return {
    formatCurrency,
    formatPercentage,
    calculateMetrics
  };
};
