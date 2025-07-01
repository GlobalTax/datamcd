
import React from 'react';
import { RestaurantManager } from '@/components/RestaurantManager';
import { useAuth } from '@/hooks/useAuth';
import { useFranchiseeRestaurants } from '@/hooks/useFranchiseeRestaurants';

export default function RestaurantManagementPage() {
  const { user } = useAuth();
  const { restaurants } = useFranchiseeRestaurants();
  
  const handleAddRestaurant = () => {
    console.log('Add restaurant functionality');
  };

  const handleSelectRestaurant = (restaurantId: string) => {
    console.log('Select restaurant:', restaurantId);
  };

  return (
    <div className="container mx-auto p-6">
      <RestaurantManager
        franchisee={user?.franchisee || null}
        onAddRestaurant={handleAddRestaurant}
        onSelectRestaurant={handleSelectRestaurant}
        selectedRestaurant={restaurants[0]?.id || null}
      />
    </div>
  );
}
