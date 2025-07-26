import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { FranchiseesManagement } from "@/components/FranchiseesManagement";
import { useFranchisees } from '@/hooks/data/useFranchisees';

const FranchiseeManagementPage = () => {
  const { refetch } = useFranchisees(); // For future optimizations

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-6">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">Gestión de Franquiciados</h1>
              <p className="text-sm text-gray-500">Administrar franquiciados y sus restaurantes</p>
            </div>
          </header>

          <main className="flex-1 p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Franquiciados</h1>
                <p className="text-gray-600">Administrar franquiciados y sus restaurantes</p>
              </div>
            </div>

            <FranchiseesManagement />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default FranchiseeManagementPage;