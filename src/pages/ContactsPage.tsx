import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { ContactsManagement } from '@/components/contacts/ContactsManagement';

export default function ContactsPage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-6">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">Gestión de Contactos</h1>
              <p className="text-sm text-gray-500">Administrar contactos de proveedores, ingenieros y arquitectos</p>
            </div>
          </header>

          <main className="flex-1 p-6">
            <ContactsManagement />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}