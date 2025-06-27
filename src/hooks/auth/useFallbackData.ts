
import { useCallback } from 'react';
import { User, Franchisee } from '@/types/auth';
import { useStaticData } from '../useStaticData';
import { UserDataResult } from './types';

export const useFallbackData = () => {
  const { getFranchiseeData, getRestaurantsData } = useStaticData();
  
  // Cargar datos de fallback
  const loadFallbackData = useCallback(async (): Promise<UserDataResult> => {
    console.log('Loading fallback data');
    
    const fallbackUser: User = {
      id: 'fallback-user',
      email: 'fallback@ejemplo.com',
      role: 'franchisee',
      full_name: 'Usuario Fallback',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const fallbackFranchisee = await getFranchiseeData('fallback-user');
    const fallbackRestaurants = await getRestaurantsData(fallbackFranchisee.id);

    return {
      user: fallbackUser,
      franchisee: fallbackFranchisee,
      restaurants: fallbackRestaurants
    };
  }, [getFranchiseeData, getRestaurantsData]);

  return { loadFallbackData };
};
