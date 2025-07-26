import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { LaborDashboard } from '@/components/dashboard/LaborDashboard';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';

export default function LaborDashboardPage() {
  const { effectiveFranchisee } = useUnifiedAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-6">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">Dashboard Laboral</h1>
              <p className="text-sm text-gray-500">Análisis de métricas laborales y gestión de personal</p>
            </div>
          </header>

          <main className="flex-1 p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Laboral</h1>
                <p className="text-gray-600">Análisis de métricas laborales y gestión de personal</p>
              </div>
            </div>

            <LaborDashboard franchiseeId={effectiveFranchisee?.id} />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}