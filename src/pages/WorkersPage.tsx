import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { WorkersPanel } from '@/components/workers/WorkersPanel';
import { useUnifiedAuth } from '@/contexts/auth';

export default function WorkersPage() {
  const { user } = useUnifiedAuth();
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-6">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">Gestión de Trabajadores</h1>
              <p className="text-sm text-gray-500">Panel unificado de trabajadores de Orquest y Biloop</p>
            </div>
          </header>

          <main className="flex-1 p-6">
            <WorkersPanel />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}