
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Franchisee } from '@/types/auth';
import { RestaurantData } from '@/types/staticData';
import { STATIC_FRANCHISEE_DATA, STATIC_RESTAURANTS_DATA } from '@/data/staticData';
import { DataCache } from '@/utils/dataCache';

const dataCache = new DataCache();

export const useStaticData = () => {
  const [isUsingCache, setIsUsingCache] = useState(false);
  
  const getFranchiseeData = async (userId: string): Promise<Franchisee> => {
    console.log('getFranchiseeData - Starting for user:', userId);
    
    // Solo usar datos estáticos para usuarios demo/fallback
    if (userId.startsWith('demo-') || userId.startsWith('fallback-')) {
      console.log('getFranchiseeData - Using static data for demo/fallback user');
      setIsUsingCache(true);
      return STATIC_FRANCHISEE_DATA;
    }
    
    // Verificar cache primero para usuarios reales
    const cacheKey = `franchisee-${userId}`;
    const cached = dataCache.get<Franchisee>(cacheKey);
    if (cached) {
      console.log('getFranchiseeData - Using cached data');
      setIsUsingCache(false);
      return cached;
    }
    
    try {
      console.log('getFranchiseeData - Attempting real data fetch');
      const { data, error } = await Promise.race([
        supabase
          .from('franchisees')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Franchisee timeout')), 8000)
        )
      ]) as any;
      
      if (data && !error) {
        console.log('getFranchiseeData - Real data loaded successfully');
        dataCache.set(cacheKey, data, 60);
        setIsUsingCache(false);
        return data;
      } else {
        console.log('getFranchiseeData - No real data found, using static fallback');
        setIsUsingCache(true);
        return STATIC_FRANCHISEE_DATA;
      }
    } catch (error) {
      console.log('getFranchiseeData - Error loading real data, using static fallback');
      setIsUsingCache(true);
      return STATIC_FRANCHISEE_DATA;
    }
  };
  
  const getRestaurantsData = async (franchiseeId: string): Promise<RestaurantData[]> => {
    console.log('getRestaurantsData - Starting for franchisee:', franchiseeId);
    
    // Solo usar datos estáticos para IDs estáticos
    if (franchiseeId.startsWith('static-') || franchiseeId.startsWith('temp-') || franchiseeId.startsWith('demo-') || franchiseeId.startsWith('fallback-')) {
      console.log('getRestaurantsData - Using static restaurant data for fallback franchisee');
      setIsUsingCache(true);
      return STATIC_RESTAURANTS_DATA;
    }
    
    // Verificar cache
    const cacheKey = `restaurants-${franchiseeId}`;
    const cached = dataCache.get<RestaurantData[]>(cacheKey);
    if (cached) {
      console.log('getRestaurantsData - Using cached restaurant data');
      setIsUsingCache(false);
      return cached;
    }
    
    try {
      console.log('getRestaurantsData - Attempting real restaurants fetch');
      const { data, error } = await Promise.race([
        supabase
          .from('franchisee_restaurants')
          .select(`
            *,
            base_restaurant:base_restaurants(*)
          `)
          .eq('franchisee_id', franchiseeId)
          .eq('status', 'active'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Restaurants timeout')), 8000)
        )
      ]) as any;
      
      if (data && !error && data.length > 0) {
        console.log('getRestaurantsData - Real restaurants loaded successfully');
        dataCache.set(cacheKey, data, 60);
        setIsUsingCache(false);
        return data;
      } else {
        console.log('getRestaurantsData - No real restaurants found, using static fallback');
        setIsUsingCache(true);
        return STATIC_RESTAURANTS_DATA;
      }
    } catch (error) {
      console.log('getRestaurantsData - Error loading real restaurants, using static fallback');
      setIsUsingCache(true);
      return STATIC_RESTAURANTS_DATA;
    }
  };
  
  const clearCache = () => {
    dataCache.clear();
    setIsUsingCache(false);
  };
  
  return {
    getFranchiseeData,
    getRestaurantsData,
    clearCache,
    isUsingCache,
    staticData: {
      franchisee: STATIC_FRANCHISEE_DATA,
      restaurants: STATIC_RESTAURANTS_DATA
    }
  };
};
