
import React from 'react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { RestaurantDashboard } from '@/components/restaurant/RestaurantDashboard';

const RestaurantDashboardPage = () => {
  return (
    <StandardLayout
      title="Dashboard de Restaurantes"
      description="Centro de comando para la gestión integral de tus restaurantes"
    >
      <RestaurantDashboard />
    </StandardLayout>
  );
};

export default RestaurantDashboardPage;
