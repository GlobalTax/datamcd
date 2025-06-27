
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
    const operatingMargin = data.total_revenue > 0 
      ? (data.operating_income / data.total_revenue) * 100 
      : 0;

    return {
      operatingMargin,
      grossMargin: data.total_revenue > 0 
        ? ((data.total_revenue - data.total_cost_of_sales) / data.total_revenue) * 100 
        : 0,
      laborPercentage: data.total_revenue > 0 
        ? (data.total_labor / data.total_revenue) * 100 
        : 0,
      foodCostPercentage: data.total_revenue > 0 
        ? (data.food_cost / data.total_revenue) * 100 
        : 0,
      totalExpensePercentage: data.total_revenue > 0 
        ? ((data.total_cost_of_sales + data.total_labor + data.total_operating_expenses + data.total_mcdonalds_fees) / data.total_revenue) * 100 
        : 0,
    };
  };

  return {
    formatCurrency,
    formatPercentage,
    calculateMetrics
  };
};
