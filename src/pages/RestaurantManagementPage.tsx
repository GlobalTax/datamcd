
import React from 'react';
import { RestaurantManager } from '@/components/RestaurantManager';
import { useAuth } from '@/hooks/useAuth';

export default function RestaurantManagementPage() {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto p-6">
      <RestaurantManager userId={user?.id || ''} />
    </div>
  );
}
