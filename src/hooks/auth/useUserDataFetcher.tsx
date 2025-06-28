
import { useProfileFetcher } from './useProfileFetcher';
import { useFranchiseeFetcher } from './useFranchiseeFetcher';
import { useRestaurantsFetcher } from './useRestaurantsFetcher';
import { User, Franchisee, Restaurant } from '@/types/auth';

interface UserDataFetcherProps {
  setUser: (user: User | null) => void;
  setFranchisee: (franchisee: Franchisee | null) => void;
  setRestaurants: (restaurants: Restaurant[]) => void;
  clearUserData: () => void;
}

export const useUserDataFetcher = ({
  setUser,
  setFranchisee,
  setRestaurants,
  clearUserData
}: UserDataFetcherProps) => {
  
  const { fetchUserProfile } = useProfileFetcher({ setUser, clearUserData });
  const { fetchFranchiseeData } = useFranchiseeFetcher({ setFranchisee });
  const { fetchRestaurantsData } = useRestaurantsFetcher({ setRestaurants });
  
  const fetchUserData = async (userId: string) => {
    try {
      console.log('fetchUserData - Starting fetch for user:', userId);
      
      const profile = await fetchUserProfile(userId);
      
      if (!profile) {
        return;
      }

      // Only fetch franchisee data if user is a franchisee
      if (profile.role === 'franchisee') {
        console.log('fetchUserData - User is franchisee, fetching franchisee data');
        const franchiseeData = await fetchFranchiseeData(userId, profile);
        
        if (franchiseeData) {
          console.log('fetchUserData - About to fetch restaurants for franchisee:', franchiseeData.id);
          await fetchRestaurantsData(franchiseeData.id);
        }
      } else {
        console.log('fetchUserData - User is not franchisee, role:', profile.role);
        // Clear franchisee data for non-franchisee users
        setFranchisee(null);
        setRestaurants([]);
      }
      
      console.log('fetchUserData - User data fetch completed successfully');
    } catch (error) {
      console.error('fetchUserData - Unexpected error in fetchUserData:', error);
      clearUserData();
    }
  };

  return { fetchUserData };
};
