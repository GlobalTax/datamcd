
import React from 'react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { AdvisorManagement } from '@/components/AdvisorManagement';

const FranchiseesPage: React.FC = () => {
  return (
    <StandardLayout
      title="Gestión de Franquiciados"
      description="Administración y supervisión de franquiciados"
    >
      <AdvisorManagement />
    </StandardLayout>
  );
};

export default FranchiseesPage;
