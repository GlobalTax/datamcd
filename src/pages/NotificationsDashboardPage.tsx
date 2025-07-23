
import React from 'react';
import { NotificationDashboard } from '@/components/dashboard/widgets/NotificationDashboard';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuthCompat';

export default function NotificationsDashboardPage() {
  const { effectiveFranchisee } = useUnifiedAuth();

  return (
    <div className="container mx-auto py-6">
      <NotificationDashboard franchiseeId={effectiveFranchisee?.id} />
    </div>
  );
}
