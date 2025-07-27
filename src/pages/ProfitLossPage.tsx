
import React from 'react';
import { useParams } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { FinancialStatementTabs } from '@/components/profitloss/FinancialStatementTabs';

const ProfitLossPage = () => {
  const { siteNumber } = useParams();
  
  if (!siteNumber) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-6">
              <SidebarTrigger className="-ml-1" />
              <div className="flex-1">
                <h1 className="text-lg font-semibold text-gray-900">Estados Financieros</h1>
                <p className="text-sm text-gray-500">Análisis completo de rentabilidad</p>
              </div>
            </header>
            <main className="flex-1 p-6">
              <div className="flex items-center justify-center h-64">
                <p className="text-red-600">No se especificó el número de restaurante</p>
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-6">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">Estados Financieros</h1>
              <p className="text-sm text-gray-500">Análisis completo - Restaurante #{siteNumber}</p>
            </div>
          </header>
          <main className="flex-1 p-6">
            <FinancialStatementTabs restaurantId={siteNumber} />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ProfitLossPage;
