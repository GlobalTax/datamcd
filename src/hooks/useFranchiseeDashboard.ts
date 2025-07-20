
import { useState, useEffect } from 'react';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { useFranchiseeRestaurants } from '@/hooks/useFranchiseeRestaurants';
import { toast } from 'sonner';

export interface FranchiseeDashboardData {
  restaurants: any[];
  totalRestaurants: number;
  loading: boolean;
  error: string | null;
  franchiseeInfo: {
    id: string;
    name: string;
    company?: string;
  } | null;
}

export const useFranchiseeDashboard = () => {
  const { user, effectiveFranchisee } = useUnifiedAuth();
  const { restaurants, loading: restaurantsLoading, error } = useFranchiseeRestaurants();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Solo para franquiciados reales (no asesores)
    if (user?.role === 'franchisee' && effectiveFranchisee) {
      setLoading(restaurantsLoading);
    } else {
      setLoading(false);
    }
  }, [user, effectiveFranchisee, restaurantsLoading]);

  const dashboardData: FranchiseeDashboardData = {
    restaurants: restaurants || [],
    totalRestaurants: restaurants?.length || 0,
    loading,
    error,
    franchiseeInfo: effectiveFranchisee ? {
      id: effectiveFranchisee.id,
      name: effectiveFranchisee.franchisee_name,
      company: effectiveFranchisee.company_name
    } : null
  };

  return dashboardData;
};
