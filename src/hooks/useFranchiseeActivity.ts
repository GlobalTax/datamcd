
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { FranchiseeAccessLog, FranchiseeActivityLog } from '@/types/franchiseeInvitation';
import { toast } from 'sonner';

export const useFranchiseeActivity = (franchiseeId?: string) => {
  const { user } = useAuth();
  const [accessLogs, setAccessLogs] = useState<FranchiseeAccessLog[]>([]);
  const [activityLogs, setActivityLogs] = useState<FranchiseeActivityLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAccessLogs = async () => {
    if (!user || !franchiseeId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('franchisee_access_log')
        .select('*')
        .eq('franchisee_id', franchiseeId)
        .order('login_time', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAccessLogs(data || []);
    } catch (err) {
      console.error('Error fetching access logs:', err);
      toast.error('Error al cargar el historial de acceso');
    }
  };

  const fetchActivityLogs = async () => {
    if (!user || !franchiseeId) return;

    try {
      const { data, error } = await supabase
        .from('franchisee_activity_log')
        .select('*')
        .eq('franchisee_id', franchiseeId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setActivityLogs(data || []);
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      toast.error('Error al cargar el historial de actividad');
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (
    activityType: string,
    description?: string,
    entityType?: string,
    entityId?: string,
    metadata?: any
  ) => {
    if (!franchiseeId) return;

    try {
      await supabase
        .from('franchisee_activity_log')
        .insert({
          franchisee_id: franchiseeId,
          user_id: user?.id,
          activity_type: activityType,
          activity_description: description,
          entity_type: entityType,
          entity_id: entityId,
          metadata
        });
    } catch (err) {
      console.error('Error logging activity:', err);
    }
  };

  useEffect(() => {
    if (franchiseeId) {
      fetchAccessLogs();
      fetchActivityLogs();
    }
  }, [franchiseeId, user?.id]);

  return {
    accessLogs,
    activityLogs,
    loading,
    logActivity,
    refetch: () => {
      fetchAccessLogs();
      fetchActivityLogs();
    }
  };
};
