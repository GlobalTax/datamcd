
import React from 'react';
import { AdvancedDashboard } from '@/components/advisor/AdvancedDashboard';
import { ConnectionStatus } from '@/components/common/ConnectionStatus';

const AdvisorPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <ConnectionStatus />
      <AdvancedDashboard />
    </div>
  );
};

export default AdvisorPage;
