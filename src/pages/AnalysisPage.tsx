
import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { AnalysisDashboard } from '@/components/analysis/AnalysisDashboard';

const AnalysisPage = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-6">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">Análisis</h1>
              <p className="text-sm text-gray-500">Análisis financiero y de rendimiento</p>
            </div>
          </header>

          <main className="flex-1 p-6">
            <AnalysisDashboard />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AnalysisPage;
