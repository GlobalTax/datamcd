import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { useAuth } from './AuthContext';
import { useUserProfile } from './UserProfileContext';
import type { Franchisee, Restaurant } from '@/types/domains';

interface FranchiseeContextType {
  franchisee: Franchisee | null;
  restaurants: Restaurant[];
  loading: boolean;
  refreshData: () => Promise<void>;
}

const FranchiseeContext = createContext<FranchiseeContextType | undefined>(undefined);

export const useFranchisee = () => {
  const context = useContext(FranchiseeContext);
  if (context === undefined) {
    throw new Error('useFranchisee must be used within a FranchiseeProvider');
  }
  return context;
};

interface FranchiseeProviderProps {
  children: React.ReactNode;
}

export const FranchiseeProvider: React.FC<FranchiseeProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [franchisee, setFranchisee] = useState<Franchisee | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFranchiseeData = async (userId: string) => {
    try {
      setLoading(true);
      logger.info('Fetching franchisee data', { userId });

      // Fetch franchisee info
      const { data: franchiseeData, error: franchiseeError } = await supabase
        .from('franchisees')
        .select(`
          id,
          user_id,
          franchisee_name,
          company_name,
          tax_id,
          address,
          city,
          state,
          postal_code,
          country,
          biloop_company_id,
          total_restaurants,
          created_at,
          updated_at,
          profiles!inner(
            email,
            full_name,
            phone
          )
        `)
        .eq('user_id', userId)
        .single();

      if (franchiseeError && franchiseeError.code !== 'PGRST116') {
        logger.error('Error fetching franchisee', { error: franchiseeError.message });
        return;
      }

      if (franchiseeData) {
        logger.info('Franchisee data fetched', { franchiseeId: franchiseeData.id });
        setFranchisee(franchiseeData);

        // Fetch restaurants
        await fetchRestaurants(franchiseeData.id);
      } else {
        logger.info('No franchisee found for user', { userId });
        setFranchisee(null);
        setRestaurants([]);
      }
    } catch (error) {
      logger.error('Unexpected error fetching franchisee data', { error, userId });
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurants = async (franchiseeId: string) => {
    try {
      logger.info('Fetching restaurants', { franchiseeId });

      const { data: restaurantData, error: restaurantError } = await supabase
        .from('franchisee_restaurants')
        .select(`
          id,
          franchisee_id,
          base_restaurant_id,
          franchise_start_date,
          franchise_end_date,
          lease_start_date,
          lease_end_date,
          monthly_rent,
          franchise_fee_percentage,
          advertising_fee_percentage,
          last_year_revenue,
          average_monthly_sales,
          status,
          assigned_at,
          updated_at,
          notes,
          base_restaurants!inner(
            id,
            site_number,
            restaurant_name,
            address,
            city,
            state,
            postal_code,
            country,
            opening_date,
            restaurant_type,
            square_meters,
            seating_capacity,
            franchisee_name,
            franchisee_email,
            company_tax_id,
            autonomous_community,
            property_type
          )
        `)
        .eq('franchisee_id', franchiseeId)
        .eq('status', 'active');

      if (restaurantError) {
        logger.error('Error fetching restaurants', { error: restaurantError.message });
        return;
      }

      // Transform data to match Restaurant interface
      const transformedRestaurants = restaurantData?.map(fr => ({
        id: fr.id,
        franchisee_id: fr.franchisee_id,
        site_number: fr.base_restaurants?.site_number || '',
        restaurant_name: fr.base_restaurants?.restaurant_name || '',
        address: fr.base_restaurants?.address || '',
        city: fr.base_restaurants?.city || '',
        state: fr.base_restaurants?.state,
        postal_code: fr.base_restaurants?.postal_code,
        country: fr.base_restaurants?.country || 'España',
        opening_date: fr.base_restaurants?.opening_date,
        restaurant_type: (fr.base_restaurants?.restaurant_type as Restaurant['restaurant_type']) || 'traditional',
        status: fr.status as Restaurant['status'],
        square_meters: fr.base_restaurants?.square_meters,
        seating_capacity: fr.base_restaurants?.seating_capacity,
        created_at: fr.assigned_at,
        updated_at: fr.updated_at,
        // Additional franchise-specific data
        franchise_start_date: fr.franchise_start_date,
        franchise_end_date: fr.franchise_end_date,
        monthly_rent: fr.monthly_rent,
        last_year_revenue: fr.last_year_revenue,
        base_restaurant_id: fr.base_restaurant_id,
        base_restaurant: fr.base_restaurants
      })) || [];

      logger.info('Restaurants fetched', { count: transformedRestaurants.length });
      setRestaurants(transformedRestaurants);
    } catch (error) {
      logger.error('Unexpected error fetching restaurants', { error, franchiseeId });
    }
  };

  const refreshData = async () => {
    if (user?.id) {
      await fetchFranchiseeData(user.id);
    }
  };

  // Fetch data when user or profile changes
  useEffect(() => {
    if (user?.id && profile) {
      // Only fetch franchisee data for franchisee role
      if (profile.role === 'franchisee') {
        fetchFranchiseeData(user.id);
      } else {
        setFranchisee(null);
        setRestaurants([]);
      }
    } else {
      setFranchisee(null);
      setRestaurants([]);
    }
  }, [user?.id, profile?.role]);

  const value: FranchiseeContextType = {
    franchisee,
    restaurants,
    loading,
    refreshData
  };

  return (
    <FranchiseeContext.Provider value={value}>
      {children}
    </FranchiseeContext.Provider>
  );
};