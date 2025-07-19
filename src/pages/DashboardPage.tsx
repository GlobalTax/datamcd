
import React from 'react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { DashboardSummary } from '@/components/dashboard/DashboardSummary';
import { RestaurantsSection } from '@/components/dashboard/RestaurantsSection';
import { QuickActions } from '@/components/dashboard/QuickActions';

const DashboardPage = () => {
  return (
    <StandardLayout
      title="Dashboard"
      description="Panel principal de gestión"
    >
      <div className="space-y-6">
        <DashboardSummary />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RestaurantsSection />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>
      </div>
    </StandardLayout>
  );
};

export default DashboardPage;
