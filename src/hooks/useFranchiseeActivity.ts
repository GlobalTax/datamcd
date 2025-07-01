
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/notifications';

export interface FranchiseeActivity {
  id: string;
  franchisee_id: string;
  activity_type: string;
  description: string;
  created_at: string;
  user_id?: string;
  entity_id?: string;
  entity_type?: string;
  activity_description?: string;
  metadata?: any;
}

export const useFranchiseeActivity = (franchiseeId: string) => {
  const [activities, setActivities] = useState<FranchiseeActivity[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('franchisee_activity_log')
        .select('*')
        .eq('franchisee_id', franchiseeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map the data to match our interface
      const mappedActivities = (data || []).map(item => ({
        id: item.id,
        franchisee_id: item.franchisee_id,
        activity_type: item.activity_type,
        description: item.activity_description || item.activity_type,
        created_at: item.created_at,
        user_id: item.user_id,
        entity_id: item.entity_id,
        entity_type: item.entity_type,
        activity_description: item.activity_description,
        metadata: item.metadata
      }));
      
      setActivities(mappedActivities);
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
        .from('franchisee_activity_log')
        .insert({
          franchisee_id: activity.franchisee_id,
          activity_type: activity.activity_type,
          activity_description: activity.description,
          user_id: activity.user_id,
          entity_id: activity.entity_id,
          entity_type: activity.entity_type,
          metadata: activity.metadata
        });

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
