
import React from 'react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { FranchiseesManagement } from '@/components/franchisees/FranchiseesManagement';

const FranchiseesPage: React.FC = () => {
  return (
    <StandardLayout
      title="Gestión de Franquiciados"
      description="Administración y supervisión de franquiciados"
    >
      <FranchiseesManagement />
    </StandardLayout>
  );
};

export default FranchiseesPage;
