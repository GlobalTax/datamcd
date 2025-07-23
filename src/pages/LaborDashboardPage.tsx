import React from 'react';
import { LaborDashboard } from '@/components/dashboard/LaborDashboard';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuthCompat';

export default function LaborDashboardPage() {
  const { effectiveFranchisee } = useUnifiedAuth();

  return (
    <div className="container mx-auto py-6">
      <LaborDashboard franchiseeId={effectiveFranchisee?.id} />
    </div>
  );
}