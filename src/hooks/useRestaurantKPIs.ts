import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RestaurantKPIs {
  monthlyRevenue: number | null;
  revenueGrowth: number | null;
  activeIncidents: number;
  criticalIncidents: number;
  pendingIncidents: number;
  activeEmployees: number;
  totalEmployees: number;
  performanceScore: number | null;
}

export const useRestaurantKPIs = (restaurantId: string) => {
  const [kpis, setKpis] = useState<RestaurantKPIs>({
    monthlyRevenue: null,
    revenueGrowth: null,
    activeIncidents: 0,
    criticalIncidents: 0,
    pendingIncidents: 0,
    activeEmployees: 0,
    totalEmployees: 0,
    performanceScore: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    const fetchKPIs = async () => {
      try {
        setLoading(true);

        // Fetch incidents data
        const { data: incidentsData } = await supabase
          .from('incidents')
          .select('priority, status')
          .eq('restaurant_id', restaurantId);

        // Fetch employees data
        const { data: employeesData } = await supabase
          .from('employees')
          .select('status')
          .eq('restaurant_id', restaurantId);

        // Fetch monthly tracking for revenue
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        
        const { data: monthlyData } = await supabase
          .from('monthly_tracking')
          .select('actual_revenue')
          .eq('franchisee_restaurant_id', restaurantId)
          .eq('year', currentYear)
          .eq('month', currentMonth)
          .single();

        // Calculate previous month for growth
        const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
        
        const { data: prevMonthData } = await supabase
          .from('monthly_tracking')
          .select('actual_revenue')
          .eq('franchisee_restaurant_id', restaurantId)
          .eq('year', prevYear)
          .eq('month', prevMonth)
          .single();

        // Process incidents
        const activeIncidents = incidentsData?.filter(i => i.status !== 'closed' && i.status !== 'resolved').length || 0;
        const criticalIncidents = incidentsData?.filter(i => i.priority === 'high' && i.status !== 'closed').length || 0;
        const pendingIncidents = incidentsData?.filter(i => i.status === 'pending').length || 0;

        // Process employees
        const activeEmployees = employeesData?.filter(e => e.status === 'active').length || 0;
        const totalEmployees = employeesData?.length || 0;

        // Calculate revenue growth
        let revenueGrowth = null;
        if (monthlyData?.actual_revenue && prevMonthData?.actual_revenue) {
          revenueGrowth = ((monthlyData.actual_revenue - prevMonthData.actual_revenue) / prevMonthData.actual_revenue) * 100;
        }

        // Calculate performance score (simple algorithm)
        let performanceScore = null;
        if (monthlyData?.actual_revenue) {
          const incidentPenalty = activeIncidents * 5; // 5% penalty per active incident
          const criticalPenalty = criticalIncidents * 10; // 10% additional penalty per critical incident
          const employeeBonus = activeEmployees > 0 ? Math.min(activeEmployees * 2, 20) : 0; // Up to 20% bonus for active employees
          
          performanceScore = Math.max(0, Math.min(100, 85 - incidentPenalty - criticalPenalty + employeeBonus));
        }

        setKpis({
          monthlyRevenue: monthlyData?.actual_revenue || null,
          revenueGrowth,
          activeIncidents,
          criticalIncidents,
          pendingIncidents,
          activeEmployees,
          totalEmployees,
          performanceScore,
        });
      } catch (error) {
        console.error('Error fetching restaurant KPIs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKPIs();
  }, [restaurantId]);

  return { kpis, loading };
};