import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { useAuth } from './AuthContext';
import { useUserProfile } from './UserProfileContext';
import type { Franchisee, UnifiedRestaurant } from '@/types/domains';

// Custom type for restaurants with base restaurant data
interface RestaurantWithBase extends UnifiedRestaurant {
  base_restaurant?: {
    id: string;
    site_number: string;
    restaurant_name: string;
    address: string;
    city: string;
    state?: string;
    postal_code?: string;
    country: string;
    opening_date?: string;
    restaurant_type: string;
    square_meters?: number;
    seating_capacity?: number;
    created_at?: string;
    updated_at?: string;
  };
}

interface FranchiseeContextType {
  franchisee: Franchisee | null;
  restaurants: RestaurantWithBase[];
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
  const [restaurants, setRestaurants] = useState<RestaurantWithBase[]>([]);
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

      // Transform data to match RestaurantWithBase interface
      const transformedRestaurants: RestaurantWithBase[] = restaurantData?.map(fr => ({
        id: fr.id,
        base_restaurant_id: fr.base_restaurant_id || '',
        site_number: fr.base_restaurants?.site_number || '',
        restaurant_name: fr.base_restaurants?.restaurant_name || '',
        address: fr.base_restaurants?.address || '',
        city: fr.base_restaurants?.city || '',
        state: fr.base_restaurants?.state || null,
        postal_code: fr.base_restaurants?.postal_code || null,
        country: fr.base_restaurants?.country || 'España',
        restaurant_type: fr.base_restaurants?.restaurant_type || 'traditional',
        opening_date: fr.base_restaurants?.opening_date || null,
        square_meters: fr.base_restaurants?.square_meters || null,
        seating_capacity: fr.base_restaurants?.seating_capacity || null,
        autonomous_community: fr.base_restaurants?.autonomous_community || null,
        property_type: fr.base_restaurants?.property_type || null,
        status: fr.status || 'active',
        franchisee_id: fr.franchisee_id,
        franchise_start_date: fr.franchise_start_date || null,
        franchise_end_date: fr.franchise_end_date || null,
        lease_start_date: fr.lease_start_date || null,
        lease_end_date: fr.lease_end_date || null,
        monthly_rent: fr.monthly_rent || null,
        franchise_fee_percentage: fr.franchise_fee_percentage || null,
        advertising_fee_percentage: fr.advertising_fee_percentage || null,
        last_year_revenue: fr.last_year_revenue || null,
        average_monthly_sales: fr.average_monthly_sales || null,
        notes: fr.notes || null,
        franchisee_name: '',
        company_name: null,
        tax_id: null,
        franchisee_city: null,
        franchisee_country: null,
        base_created_at: fr.assigned_at,
        assigned_at: fr.assigned_at,
        updated_at: fr.updated_at,
        status_display: fr.status || 'active',
        is_assigned: true,
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