
import React from 'react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { FranchiseesManagement } from '@/components/franchisees/FranchiseesManagement';

const FranchiseesPage = () => {
  return (
    <StandardLayout
      title="Gestión de Franquiciados"
      description="Centro de gestión para todos los franquiciados y asignación de restaurantes"
    >
      <FranchiseesManagement />
    </StandardLayout>
  );
};

export default FranchiseesPage;
