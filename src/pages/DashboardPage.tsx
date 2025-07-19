
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { DashboardSummary } from '@/components/dashboard/DashboardSummary';
import { RestaurantsSection } from '@/components/dashboard/RestaurantsSection';
import { QuickActions } from '@/components/dashboard/QuickActions';

const DashboardPage = () => {
  const navigate = useNavigate();

  // Mock data para satisfacer las props requeridas
  const displayRestaurants = []; // Array vacío por ahora
  const totalRestaurants = 0;
  const franchiseeId = '';
  const franchiseeRestaurants = [];
  const hasSupabaseRestaurants = false;
  const allLocalRestaurants = [];
  
  const handleNavigateToValuation = () => {
    navigate('/valuation');
  };

  const handleNavigateToAnnualBudget = () => {
    navigate('/annual-budget');
  };

  const handleNavigateToProfitLoss = (siteNumber: string) => {
    navigate(`/profit-loss?site=${siteNumber}`);
  };

  return (
    <StandardLayout
      title="Dashboard"
      description="Panel principal de gestión"
    >
      <div className="space-y-6">
        <DashboardSummary 
          totalRestaurants={totalRestaurants}
          displayRestaurants={displayRestaurants}
          isTemporaryData={true}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RestaurantsSection 
              franchiseeId={franchiseeId}
              franchiseeRestaurants={franchiseeRestaurants}
              hasSupabaseRestaurants={hasSupabaseRestaurants}
              allLocalRestaurants={allLocalRestaurants}
            />
          </div>
          <div>
            <QuickActions 
              displayRestaurants={displayRestaurants}
              onNavigateToValuation={handleNavigateToValuation}
              onNavigateToAnnualBudget={handleNavigateToAnnualBudget}
              onNavigateToProfitLoss={handleNavigateToProfitLoss}
            />
          </div>
        </div>
      </div>
    </StandardLayout>
  );
};

export default DashboardPage;
