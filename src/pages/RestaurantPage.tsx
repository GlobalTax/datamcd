
import React from 'react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { RestaurantDashboard } from '@/components/restaurant/RestaurantDashboard';

const RestaurantPage = () => {
  return (
    <StandardLayout
      title="Gestión de Restaurantes"
      description="Dashboard para la gestión y monitorización de restaurantes"
    >
      <RestaurantDashboard />
    </StandardLayout>
  );
};

export default RestaurantPage;
