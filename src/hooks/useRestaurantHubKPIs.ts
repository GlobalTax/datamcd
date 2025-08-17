import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRestaurantKPIs } from '@/hooks/useRestaurantKPIs';
import { useEmployees } from '@/hooks/useEmployees';
import { useProfitLossData } from '@/hooks/useProfitLossData';
import { useOrquest } from '@/hooks/useOrquest';
import { useBiloop } from '@/hooks/useBiloop';

export interface HubKPIData {
  // KPIs Generales
  monthlyRevenue: number | null;
  revenueGrowth: number | null;
  performanceScore: number | null;
  
  // Equipo
  activeEmployees: number;
  totalEmployees: number;
  employeeTurnover: number | null;
  
  // Nómina
  monthlyPayrollCost: number | null;
  totalWorkingHours: number | null;
  averageCostPerHour: number | null;
  
  // P&L
  ebitda: number | null;
  netMargin: number | null;
  ytdRevenue: number | null;
  
  // Presupuesto
  monthlyBudgetDeviation: number | null;
  yearCompletionPercent: number;
  budgetStatus: 'on-track' | 'over-budget' | 'under-budget' | 'no-data';
  
  // Incidencias
  activeIncidents: number;
  criticalIncidents: number;
  avgResolutionTime: number | null;
  
  // Integraciones
  orquestStatus: 'connected' | 'disconnected' | 'error';
  biloopStatus: 'connected' | 'disconnected' | 'error';
  lastSyncDate: Date | null;
  
  // Documentos
  pendingDocuments: number;
  lastDocumentUpdate: Date | null;
}

export const useRestaurantHubKPIs = (restaurantId: string, franchiseeId?: string) => {
  const [hubData, setHubData] = useState<HubKPIData>({
    monthlyRevenue: null,
    revenueGrowth: null,
    performanceScore: null,
    activeEmployees: 0,
    totalEmployees: 0,
    employeeTurnover: null,
    monthlyPayrollCost: null,
    totalWorkingHours: null,
    averageCostPerHour: null,
    ebitda: null,
    netMargin: null,
    ytdRevenue: null,
    monthlyBudgetDeviation: null,
    yearCompletionPercent: 0,
    budgetStatus: 'no-data',
    activeIncidents: 0,
    criticalIncidents: 0,
    avgResolutionTime: null,
    orquestStatus: 'disconnected',
    biloopStatus: 'disconnected',
    lastSyncDate: null,
    pendingDocuments: 0,
    lastDocumentUpdate: null,
  });
  const [loading, setLoading] = useState(true);

  // Hook calls for data sources
  const { kpis: restaurantKPIs, loading: kpisLoading } = useRestaurantKPIs(restaurantId);
  const { employees, stats: employeeStats, loading: employeesLoading } = useEmployees(restaurantId);
  const { profitLossData, isLoading: plLoading } = useProfitLossData(restaurantId, new Date().getFullYear());
  const { services: orquestServices, employees: orquestEmployees, loading: orquestLoading } = useOrquest(franchiseeId);

  const fetchBudgetData = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      
      const { data: budgetData } = await supabase
        .from('annual_budgets')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('year', currentYear);

      const { data: actualData } = await supabase
        .from('monthly_tracking')
        .select('*')
        .eq('franchisee_restaurant_id', restaurantId)
        .eq('year', currentYear)
        .eq('month', currentMonth)
        .single();

      let monthlyBudgetDeviation = null;
      let budgetStatus: HubKPIData['budgetStatus'] = 'no-data';
      
      if (budgetData?.length && actualData) {
        const monthlyBudget = budgetData.reduce((sum, item) => {
          const monthKey = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'][currentMonth - 1];
          return sum + (item[monthKey] || 0);
        }, 0);
        
        const actualRevenue = actualData.actual_revenue || 0;
        
        if (monthlyBudget > 0) {
          monthlyBudgetDeviation = ((actualRevenue - monthlyBudget) / monthlyBudget) * 100;
          budgetStatus = monthlyBudgetDeviation > 5 ? 'over-budget' : 
                        monthlyBudgetDeviation < -5 ? 'under-budget' : 'on-track';
        }
      }

      return {
        monthlyBudgetDeviation,
        yearCompletionPercent: (currentMonth / 12) * 100,
        budgetStatus
      };
    } catch (error) {
      console.error('Error fetching budget data:', error);
      return {
        monthlyBudgetDeviation: null,
        yearCompletionPercent: (new Date().getMonth() + 1 / 12) * 100,
        budgetStatus: 'no-data' as const
      };
    }
  };

  const fetchDocumentsData = async () => {
    try {
      // For now, simulate pending documents
      // In a real implementation, this would query a documents table
      return {
        pendingDocuments: Math.floor(Math.random() * 5),
        lastDocumentUpdate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      };
    } catch (error) {
      console.error('Error fetching documents data:', error);
      return {
        pendingDocuments: 0,
        lastDocumentUpdate: null
      };
    }
  };

  const calculateEmployeeTurnover = async () => {
    try {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const { data: terminatedEmployees } = await supabase
        .from('employees')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .gte('termination_date', threeMonthsAgo.toISOString());

      const avgEmployees = employeeStats?.total_employees || 1;
      return terminatedEmployees?.length ? (terminatedEmployees.length / avgEmployees) * 100 : 0;
    } catch (error) {
      console.error('Error calculating employee turnover:', error);
      return null;
    }
  };

  const calculatePayrollData = () => {
    const totalSalaries = employeeStats?.total_payroll || 0;
    const activeCount = employeeStats?.active_employees || 0;
    
    // Estimate working hours (40 hours/week * 4.33 weeks/month * active employees)
    const estimatedHours = activeCount * 40 * 4.33;
    const avgCostPerHour = estimatedHours > 0 ? totalSalaries / estimatedHours : null;
    
    return {
      monthlyPayrollCost: totalSalaries,
      totalWorkingHours: estimatedHours,
      averageCostPerHour: avgCostPerHour
    };
  };

  const calculatePLData = () => {
    if (!profitLossData?.length) return { ebitda: null, netMargin: null, ytdRevenue: null };
    
    const currentYearData = profitLossData.filter(pl => pl.year === new Date().getFullYear());
    const ytdRevenue = currentYearData.reduce((sum, pl) => sum + (pl.total_revenue || 0), 0);
    
    const latestPL = currentYearData[0];
    if (!latestPL) return { ebitda: null, netMargin: null, ytdRevenue };
    
    const ebitda = latestPL.operating_income || 0;
    const netMargin = latestPL.total_revenue > 0 ? (latestPL.operating_income / latestPL.total_revenue) * 100 : 0;
    
    return { ebitda, netMargin, ytdRevenue };
  };

  const getIntegrationStatus = (): { 
    orquestStatus: 'connected' | 'disconnected' | 'error';
    biloopStatus: 'connected' | 'disconnected' | 'error';
    lastSyncDate: Date | null;
  } => {
    const orquestStatus: 'connected' | 'disconnected' | 'error' = orquestServices?.length > 0 ? 'connected' : 'disconnected';
    const biloopStatus: 'connected' | 'disconnected' | 'error' = 'disconnected'; // Would need biloop data
    const lastSyncDate = orquestServices?.length > 0 ? new Date(orquestServices[0].updated_at || Date.now()) : null;
    
    return { orquestStatus, biloopStatus, lastSyncDate };
  };

  useEffect(() => {
    const consolidateData = async () => {
      if (kpisLoading || employeesLoading || plLoading || orquestLoading) {
        return;
      }
      
      setLoading(true);
      
      try {
        const [budgetData, documentsData, turnover] = await Promise.all([
          fetchBudgetData(),
          fetchDocumentsData(),
          calculateEmployeeTurnover()
        ]);
        
        const payrollData = calculatePayrollData();
        const plData = calculatePLData();
        const integrationData = getIntegrationStatus();
        
        setHubData({
          // KPIs Generales
          monthlyRevenue: restaurantKPIs.monthlyRevenue,
          revenueGrowth: restaurantKPIs.revenueGrowth,
          performanceScore: restaurantKPIs.performanceScore,
          
          // Equipo
          activeEmployees: restaurantKPIs.activeEmployees,
          totalEmployees: restaurantKPIs.totalEmployees,
          employeeTurnover: turnover,
          
          // Nómina
          ...payrollData,
          
          // P&L
          ...plData,
          
          // Presupuesto
          ...budgetData,
          
          // Incidencias
          activeIncidents: restaurantKPIs.activeIncidents,
          criticalIncidents: restaurantKPIs.criticalIncidents,
          avgResolutionTime: 2.5, // Hardcoded for now
          
          // Integraciones
          ...integrationData,
          
          // Documentos
          ...documentsData,
        });
      } catch (error) {
        console.error('Error consolidating hub data:', error);
      } finally {
        setLoading(false);
      }
    };

    consolidateData();
  }, [restaurantId, franchiseeId, kpisLoading, employeesLoading, plLoading, orquestLoading, restaurantKPIs, employeeStats, profitLossData, orquestServices]);

  return { hubData, loading };
};