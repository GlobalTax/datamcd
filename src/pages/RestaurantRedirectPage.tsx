
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/AuthProvider';
import { FranchiseeRestaurant } from '@/types/franchiseeRestaurant';

export default function RestaurantRedirectPage() {
  const navigate = useNavigate();
  const { restaurants, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (restaurants && restaurants.length > 0) {
        // Redirigir al primer restaurante disponible
        const firstRestaurant = restaurants[0] as FranchiseeRestaurant;
        const restaurantId = firstRestaurant.base_restaurant?.id || firstRestaurant.base_restaurant_id || firstRestaurant.id;
        navigate(`/restaurant/${restaurantId}`, { replace: true });
      } else {
        // Si no hay restaurantes, redirigir al dashboard
        navigate('/dashboard', { replace: true });
      }
    }
  }, [restaurants, loading, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  );
}
