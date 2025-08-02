import React from 'react';
import { useParams } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { ConnectionStatusProvider } from "@/components/common/ConnectionStatusProvider";
import { ConnectionStatus } from "@/components/common/ConnectionStatus";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { RestaurantPanel } from '@/components/restaurant/RestaurantPanel';

export default function RestaurantPanelPage() {
  const { restaurantId } = useParams<{ restaurantId: string }>();

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
                  <h1 className="text-lg font-semibold text-foreground">Panel del Restaurante</h1>
                  <p className="text-sm text-muted-foreground">Vista integral de datos y métricas</p>
                </div>
              </header>

              <main className="flex-1 p-6">
                <ErrorBoundary>
                  {restaurantId && <RestaurantPanel restaurantId={restaurantId} />}
                </ErrorBoundary>
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </ErrorBoundary>
    </ConnectionStatusProvider>
  );
}