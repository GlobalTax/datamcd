
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
    const totalRevenue = data.net_sales + (data.other_revenue || 0);
    
    if (totalRevenue === 0) {
      return {
        grossMargin: 0,
        operatingMargin: 0,
        laborPercentage: 0,
        foodCostPercentage: 0,
        totalExpensePercentage: 0
      };
    }

    const grossProfit = totalRevenue - (data.food_cost + (data.paper_cost || 0));
    const operatingIncome = data.operating_income || 0;
    const totalLabor = data.management_labor + data.crew_labor + (data.benefits || 0);
    const foodCost = data.food_cost || 0;
    const totalExpenses = (data.food_cost || 0) + (data.paper_cost || 0) + totalLabor + 
      (data.rent || 0) + (data.utilities || 0) + (data.maintenance || 0) + 
      (data.advertising || 0) + (data.insurance || 0) + (data.supplies || 0) + 
      (data.other_expenses || 0) + (data.franchise_fee || 0) + (data.advertising_fee || 0) + 
      (data.rent_percentage || 0);

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
