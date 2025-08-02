import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Incident {
  id: string;
  title: string;
  type: string;
  priority: string;
  status: string;
  created_at: string;
  assigned_to?: string;
  description?: string;
}

interface IncidentMetrics {
  activeIncidents: number;
  criticalIncidents: number;
  totalIncidents: number;
  resolvedThisMonth: number;
  avgResolutionTime: number | null;
  incidentsByType: Array<{ name: string; value: number }>;
  monthlyTrend: Array<{ month: string; incidents: number }>;
}

export const useRestaurantIncidents = (restaurantId: string) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [metrics, setMetrics] = useState<IncidentMetrics>({
    activeIncidents: 0,
    criticalIncidents: 0,
    totalIncidents: 0,
    resolvedThisMonth: 0,
    avgResolutionTime: null,
    incidentsByType: [],
    monthlyTrend: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    const fetchIncidentsData = async () => {
      try {
        setLoading(true);

        // Fetch incidents data
        const { data: incidentsData } = await supabase
          .from('incidents')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .order('created_at', { ascending: false });

        setIncidents(incidentsData || []);

        if (incidentsData) {
          // Calculate metrics
          const activeIncidents = incidentsData.filter(i => 
            i.status !== 'closed' && i.status !== 'resolved'
          ).length;

          const criticalIncidents = incidentsData.filter(i => 
            i.priority === 'high' && i.status !== 'closed' && i.status !== 'resolved'
          ).length;

          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          
          const resolvedThisMonth = incidentsData.filter(i => {
            if (!i.resolved_at) return false;
            const resolvedDate = new Date(i.resolved_at);
            return resolvedDate.getMonth() === currentMonth && 
                   resolvedDate.getFullYear() === currentYear;
          }).length;

          // Calculate average resolution time
          const resolvedIncidents = incidentsData.filter(i => i.resolved_at && i.created_at);
          let avgResolutionTime = null;
          if (resolvedIncidents.length > 0) {
            const totalTime = resolvedIncidents.reduce((sum, incident) => {
              const created = new Date(incident.created_at).getTime();
              const resolved = new Date(incident.resolved_at!).getTime();
              return sum + (resolved - created);
            }, 0);
            avgResolutionTime = Math.round(totalTime / resolvedIncidents.length / (1000 * 60 * 60)); // hours
          }

          // Group by type
          const typeGroups = incidentsData.reduce((acc, incident) => {
            acc[incident.type] = (acc[incident.type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const incidentsByType = Object.entries(typeGroups).map(([name, value]) => ({
            name,
            value,
          }));

          // Monthly trend (last 6 months)
          const monthNames = [
            'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
            'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
          ];

          const monthlyTrend = [];
          for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const month = date.getMonth();
            const year = date.getFullYear();

            const count = incidentsData.filter(incident => {
              const createdDate = new Date(incident.created_at);
              return createdDate.getMonth() === month && createdDate.getFullYear() === year;
            }).length;

            monthlyTrend.push({
              month: monthNames[month],
              incidents: count,
            });
          }

          setMetrics({
            activeIncidents,
            criticalIncidents,
            totalIncidents: incidentsData.length,
            resolvedThisMonth,
            avgResolutionTime,
            incidentsByType,
            monthlyTrend,
          });
        }

      } catch (error) {
        console.error('Error fetching incidents data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidentsData();
  }, [restaurantId]);

  return { incidents, metrics, loading };
};