import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { NewIncidentManagement } from "@/components/incidents/NewIncidentManagement";
import { ConnectionStatusProvider } from "@/components/common/ConnectionStatusProvider";
import { ConnectionStatus } from "@/components/common/ConnectionStatus";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

export default function IncidentManagementPage() {
  return (
    <ConnectionStatusProvider>
      <ErrorBoundary>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-background">
            <ConnectionStatus />
            <AppSidebar />
            <SidebarInset className="flex-1">
              <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-card px-6">
                <SidebarTrigger className="-ml-1" />
                <div className="flex-1">
                  <h1 className="text-lg font-semibold text-foreground">Gestión de Incidencias</h1>
                  <p className="text-sm text-muted-foreground">Administrar incidencias patrimoniales de restaurantes</p>
                </div>
              </header>

              <main className="flex-1 p-6">
                <ErrorBoundary>
                  <NewIncidentManagement />
                </ErrorBoundary>
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </ErrorBoundary>
    </ConnectionStatusProvider>
  );
}