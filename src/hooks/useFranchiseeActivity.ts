import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/notifications';

export interface FranchiseeActivity {
  id: string;
  franchisee_id: string;
  activity_type: string;
  description: string;
  created_at: string;
}

export const useFranchiseeActivity = (franchiseeId: string) => {
  const [activities, setActivities] = useState<FranchiseeActivity[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('franchisee_activity')
        .select('*')
        .eq('franchisee_id', franchiseeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      showError('Error al cargar el historial de actividades');
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (activity: Omit<FranchiseeActivity, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('franchisee_activity')
        .insert(activity);

      if (error) throw error;
      
      await fetchActivities();
    } catch (error) {
      console.error('Error logging activity:', error);
      showError('Error al registrar la actividad');
    }
  };

  useEffect(() => {
    if (franchiseeId) {
      fetchActivities();
    }
  }, [franchiseeId]);

  return {
    activities,
    loading,
    logActivity,
    refetch: fetchActivities
  };
};
