import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FranchiseeStaff } from '@/types/auth';
import { toast } from 'sonner';

export const useFranchiseeStaff = (franchiseeId?: string) => {
  const [staff, setStaff] = useState<FranchiseeStaff[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStaff = async () => {
    if (!franchiseeId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('franchisee_staff')
        .select(`
          *,
          profiles:user_id (
            email,
            full_name,
            phone
          )
        `)
        .eq('franchisee_id', franchiseeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStaff(data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Error al cargar personal');
    } finally {
      setLoading(false);
    }
  };

  const addStaffMember = async (userId: string, position?: string) => {
    if (!franchiseeId) return false;

    try {
      const { error } = await supabase
        .from('franchisee_staff')
        .insert({
          user_id: userId,
          franchisee_id: franchiseeId,
          position: position || 'Empleado'
        });

      if (error) throw error;
      
      toast.success('Personal agregado exitosamente');
      fetchStaff();
      return true;
    } catch (error) {
      console.error('Error adding staff member:', error);
      toast.error('Error al agregar personal');
      return false;
    }
  };

  const removeStaffMember = async (staffId: string) => {
    try {
      const { error } = await supabase
        .from('franchisee_staff')
        .delete()
        .eq('id', staffId);

      if (error) throw error;
      
      toast.success('Personal removido exitosamente');
      fetchStaff();
      return true;
    } catch (error) {
      console.error('Error removing staff member:', error);
      toast.error('Error al remover personal');
      return false;
    }
  };

  const updateStaffPosition = async (staffId: string, position: string) => {
    try {
      const { error } = await supabase
        .from('franchisee_staff')
        .update({ position })
        .eq('id', staffId);

      if (error) throw error;
      
      toast.success('Posición actualizada exitosamente');
      fetchStaff();
      return true;
    } catch (error) {
      console.error('Error updating staff position:', error);
      toast.error('Error al actualizar posición');
      return false;
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [franchiseeId]);

  return {
    staff,
    loading,
    fetchStaff,
    addStaffMember,
    removeStaffMember,
    updateStaffPosition
  };
};