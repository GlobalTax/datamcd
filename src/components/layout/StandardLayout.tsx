
import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { McdonaldsHeader } from './McdonaldsHeader';

interface StandardLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export const StandardLayout: React.FC<StandardLayoutProps> = ({
  children,
  title,
  description
}) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AppSidebar />
        <SidebarInset className="flex-1">
          {/* Updated header with McDonald's branding */}
          <McdonaldsHeader />

          {/* Page Header with McDonald's styling */}
          <div className="border-b bg-card px-6 py-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              </div>
            </div>
          </div>

          <main className="flex-1 p-6 bg-background">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
