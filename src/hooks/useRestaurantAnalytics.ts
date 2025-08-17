import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { analyticsKeys } from '@/hooks/queryKeys';
import { useRestaurantContext } from '@/providers/RestaurantContext';

interface RestaurantAnalytics {
  averageTicket: number | null;
  ticketGrowth: number | null;
  monthlyCustomers: number;
  customerGrowth: number | null;
  operationalEfficiency: number | null;
  productivity: number | null;
  profitMargin: number | null;
  monthlyROI: number | null;
  costPerCustomer: number | null;
  avgServiceTime: number | null;
  revenueVsTarget: Array<{ month: string; actual: number; target: number }>;
  satisfactionTrend: Array<{ month: string; rating: number }>;
  costAnalysis: Array<{ month: string; revenue: number; costs: number; profit: number }>;
}

interface AnalyticsConfig {
  restaurantId: string;
  period?: string;
}

export const useRestaurantAnalytics = (config: AnalyticsConfig) => {
  const { restaurantId, period } = config;

  const {
    data: analytics,
    isLoading,
    error
  } = useQuery({
    queryKey: analyticsKeys.restaurant(restaurantId),
    queryFn: async () => {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      // Fetch monthly tracking data for analytics
      const { data: monthlyData } = await supabase
        .from('monthly_tracking')
        .select('*')
        .eq('franchisee_restaurant_id', restaurantId)
        .eq('year', currentYear)
        .order('month');

      // Fetch employees data for productivity calculations
      const { data: employeesData } = await supabase
        .from('employees')
        .select('status')
        .eq('restaurant_id', restaurantId);

      // Fetch budget data for targets
      const { data: budgetData } = await supabase
        .from('annual_budgets')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('year', currentYear)
        .eq('category', 'revenue');

      const defaultAnalytics: RestaurantAnalytics = {
        averageTicket: null,
        ticketGrowth: null,
        monthlyCustomers: 0,
        customerGrowth: null,
        operationalEfficiency: null,
        productivity: null,
        profitMargin: null,
        monthlyROI: null,
        costPerCustomer: null,
        avgServiceTime: null,
        revenueVsTarget: [],
        satisfactionTrend: [],
        costAnalysis: [],
      };

      if (!monthlyData || monthlyData.length === 0) {
        return defaultAnalytics;
      }
      // Calculate current month metrics
      const currentMonthData = monthlyData.find(m => m.month === currentMonth);
      const previousMonthData = monthlyData.find(m => m.month === currentMonth - 1);

      // Average ticket calculation
      const averageTicket = currentMonthData?.customer_count > 0 
        ? (currentMonthData.actual_revenue || 0) / currentMonthData.customer_count 
        : null;

      const previousTicket = previousMonthData?.customer_count > 0 
        ? (previousMonthData.actual_revenue || 0) / previousMonthData.customer_count 
        : null;

      const ticketGrowth = (averageTicket && previousTicket) 
        ? ((averageTicket - previousTicket) / previousTicket) * 100 
        : null;

      // Customer growth
      const monthlyCustomers = currentMonthData?.customer_count || 0;
      const previousCustomers = previousMonthData?.customer_count || 0;
      const customerGrowth = previousCustomers > 0 
        ? ((monthlyCustomers - previousCustomers) / previousCustomers) * 100 
        : null;

      // Calculate total metrics for the year
      const totalRevenue = monthlyData.reduce((sum, m) => sum + (m.actual_revenue || 0), 0);
      const totalCosts = monthlyData.reduce((sum, m) => 
        sum + (m.actual_food_cost || 0) + (m.actual_labor_cost || 0) + 
        (m.actual_rent || 0) + (m.actual_utilities || 0) + 
        (m.actual_marketing || 0) + (m.actual_other_expenses || 0), 0
      );
      const totalCustomers = monthlyData.reduce((sum, m) => sum + (m.customer_count || 0), 0);

      // Profit margin
      const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : null;

      // Operational efficiency (based on revenue per labor hour)
      const totalLaborHours = monthlyData.reduce((sum, m) => sum + (m.labor_hours || 0), 0);
      const operationalEfficiency = totalLaborHours > 0 
        ? Math.min(100, (totalRevenue / totalLaborHours) / 50 * 100) // Normalize to 50€/hour as baseline
        : null;

      // Productivity (revenue per employee per day)
      const activeEmployees = employeesData?.filter(e => e.status === 'active').length || 1;
      const workingDaysPerMonth = 22; // Average working days
      const monthsWithData = monthlyData.length;
      const productivity = monthsWithData > 0 
        ? totalRevenue / (activeEmployees * workingDaysPerMonth * monthsWithData)
        : null;

      // Monthly ROI (simple calculation)
      const monthlyROI = totalCosts > 0 ? ((totalRevenue - totalCosts) / totalCosts) * 100 : null;

      // Cost per customer
      const costPerCustomer = totalCustomers > 0 ? totalCosts / totalCustomers : null;

      // Mock service time (would come from POS system)
      const avgServiceTime = 12; // minutes

      // Prepare chart data
      const monthNames = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
      ];

      // Revenue vs Target
      const revenueVsTarget = monthlyData.map(month => {
        const targetValue = budgetData?.[0] ? 
          Object.values(budgetData[0]).filter(v => typeof v === 'number')[month.month - 1] || 0 : 0;
        
        return {
          month: monthNames[month.month - 1],
          actual: month.actual_revenue || 0,
          target: targetValue as number,
        };
      });

      // Mock satisfaction trend (would come from customer feedback system)
      const satisfactionTrend = monthlyData.map((month, index) => ({
        month: monthNames[month.month - 1],
        rating: 4.0 + Math.random() * 0.8, // Mock data between 4.0-4.8
      }));

      // Cost analysis
      const costAnalysis = monthlyData.map(month => {
        const revenue = month.actual_revenue || 0;
        const costs = (month.actual_food_cost || 0) + (month.actual_labor_cost || 0) + 
                     (month.actual_rent || 0) + (month.actual_utilities || 0) + 
                     (month.actual_marketing || 0) + (month.actual_other_expenses || 0);
        
        return {
          month: monthNames[month.month - 1],
          revenue,
          costs,
          profit: revenue - costs,
        };
      });

      return {
        averageTicket,
        ticketGrowth,
        monthlyCustomers,
        customerGrowth,
        operationalEfficiency,
        productivity,
        profitMargin,
        monthlyROI,
        costPerCustomer,
        avgServiceTime,
        revenueVsTarget,
        satisfactionTrend,
        costAnalysis,
      };
    },
    enabled: !!restaurantId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  return { 
    analytics: analytics || {
      averageTicket: null,
      ticketGrowth: null,
      monthlyCustomers: 0,
      customerGrowth: null,
      operationalEfficiency: null,
      productivity: null,
      profitMargin: null,
      monthlyROI: null,
      costPerCustomer: null,
      avgServiceTime: null,
      revenueVsTarget: [],
      satisfactionTrend: [],
      costAnalysis: [],
    }, 
    loading: isLoading,
    error
  };
};

// Hook específico que usa el contexto de restaurante
export const useCurrentRestaurantAnalytics = (period?: string) => {
  const { currentRestaurantId } = useRestaurantContext();
  
  if (!currentRestaurantId) {
    throw new Error('useCurrentRestaurantAnalytics requiere un restaurante seleccionado');
  }
  
  return useRestaurantAnalytics({ restaurantId: currentRestaurantId, period });
};