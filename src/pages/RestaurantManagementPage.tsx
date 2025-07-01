
import React from 'react';
import { RestaurantManager } from '@/components/RestaurantManager';
import { useAuth } from '@/hooks/useAuth';
import { useFranchiseeRestaurants } from '@/hooks/useFranchiseeRestaurants';

export default function RestaurantManagementPage() {
  const { user, franchisee } = useAuth();
  const { restaurants } = useFranchiseeRestaurants();
  
  const handleAddRestaurant = () => {
    console.log('Add restaurant functionality');
  };

  const handleSelectRestaurant = (restaurant: any) => {
    console.log('Select restaurant:', restaurant);
  };

  // Convert restaurants to the format expected by RestaurantManager
  const convertedRestaurants = restaurants.map(fr => ({
    id: fr.id,
    name: fr.base_restaurant?.restaurant_name || 'Sin nombre',
    location: fr.base_restaurant ? `${fr.base_restaurant.city}, ${fr.base_restaurant.country}` : 'Sin ubicación',
    siteNumber: fr.base_restaurant?.site_number || 'N/A',
    contractEndDate: fr.franchise_end_date || '',
    franchiseEndDate: fr.franchise_end_date || '',
    leaseEndDate: fr.lease_end_date || '',
    lastYearRevenue: fr.last_year_revenue || 0,
    baseRent: fr.monthly_rent || 0,
    rentIndex: 0,
    isOwnedByMcD: false,
    franchiseeId: fr.franchisee_id || '',
    valuationHistory: [],
    currentValuation: null,
    createdAt: new Date(fr.assigned_at)
  }));

  if (!franchisee) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Restringido</h2>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <RestaurantManager
        franchisee={{
          id: franchisee.id,
          name: franchisee.franchisee_name,
          restaurants: convertedRestaurants
        }}
        onAddRestaurant={handleAddRestaurant}
        onSelectRestaurant={handleSelectRestaurant}
        selectedRestaurant={convertedRestaurants[0] || null}
      />
    </div>
  );
}
