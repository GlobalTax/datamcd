import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Building2, FileText, Users, TestTube, UserCheck, Settings2, Check, X, Edit2, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBiloop } from '@/hooks/useBiloop';
import { useFranchisees } from '@/hooks/data/useFranchisees';
import { useBiloopCompanies } from '@/hooks/useBiloopCompanies';
import { useToast } from '@/hooks/use-toast';
import { BiloopWorkersPanel } from '@/components/workers/BiloopWorkersPanel';
import { BiloopCompanyManager } from '@/components/workers/BiloopCompanyManager';
import { BiloopInvoicesTable } from '@/components/workers/BiloopInvoicesTable';
import { BiloopCustomersTable } from '@/components/workers/BiloopCustomersTable';
import { FranchiseeIntegrationsTable } from '@/components/FranchiseeIntegrationsTable';


const BiloopPage = () => {
  const [selectedFranchiseeId, setSelectedFranchiseeId] = useState<string>('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  
  const { 
    loading: biloopLoading, 
    testConnection 
  } = useBiloop();
  
  const { franchisees, loading: franchiseesLoading } = useFranchisees();
  const { companies, loading: companiesLoading, hasCompanies } = useBiloopCompanies(selectedFranchiseeId);
  const { toast } = useToast();

  const loading = biloopLoading || franchiseesLoading || companiesLoading;

  const getSelectedCompany = () => {
    return companies.find(company => company.biloop_company_id === selectedCompanyId);
  };



  const handleTestConnection = async () => {
    if (!selectedCompanyId) {
      toast({
        title: "Error",
        description: "Selecciona una empresa de Biloop primero",
        variant: "destructive",
      });
      return;
    }

    try {
      await testConnection();
      toast({
        title: "Éxito",
        description: "Conexión con Biloop exitosa",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo conectar con Biloop",
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-6">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">Integración Biloop</h1>
              <p className="text-sm text-gray-500">Gestiona tu contabilidad y facturación desde Biloop</p>
            </div>
            <Button onClick={handleTestConnection} disabled={loading}>
              <TestTube className="mr-2 h-4 w-4" />
              Probar conexión
            </Button>
          </header>

          <main className="flex-1 p-6">
            <div className="space-y-6">

      {/* Franchisee Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Seleccionar Franquiciado y Empresa
          </CardTitle>
          <CardDescription>
            Selecciona un franquiciado y luego una de sus empresas de Biloop
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Cargando franquiciados...</span>
            </div>
          ) : (
            <>
              {/* Selector de franquiciado */}
              <div className="grid gap-2">
                <Label>Franquiciados</Label>
                {franchisees.map((franchisee) => (
                  <div
                    key={franchisee.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedFranchiseeId === franchisee.id
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => {
                      setSelectedFranchiseeId(franchisee.id);
                      setSelectedCompanyId(''); // Reset company selection
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{franchisee.franchisee_name}</div>
                        <div className="text-sm text-muted-foreground">{franchisee.company_name}</div>
                      </div>
                      {selectedFranchiseeId === franchisee.id && (
                        <Badge variant="default">Seleccionado</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Selector de empresa Biloop */}
              {selectedFranchiseeId && (
                <div className="space-y-3">
                  <Label>Empresas Biloop</Label>
                  {companies.length > 0 ? (
                    <div className="grid gap-2">
                      {companies.map((company) => (
                        <div
                          key={company.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedCompanyId === company.biloop_company_id
                              ? "bg-blue-50 border-blue-300"
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() => setSelectedCompanyId(company.biloop_company_id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{company.company_name}</div>
                              <div className="text-sm text-muted-foreground">ID: {company.biloop_company_id}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              {company.is_primary && (
                                <Badge variant="secondary">Principal</Badge>
                              )}
                              {selectedCompanyId === company.biloop_company_id && (
                                <Badge variant="default">Seleccionada</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 text-muted-foreground">
                      <p>No hay empresas configuradas para este franquiciado.</p>
                      <p className="text-sm mt-2">Ve a la pestaña "Gestión de Empresas" para configurar empresas.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>


      <Tabs defaultValue="companies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="companies">Gestión de Empresas</TabsTrigger>
          <TabsTrigger value="workers">Trabajadores</TabsTrigger>
          <TabsTrigger value="invoices">Facturas</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
          <TabsTrigger value="integrations">Todas las Integraciones</TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="space-y-4">
          {selectedFranchiseeId ? (
            <BiloopCompanyManager franchiseeId={selectedFranchiseeId} />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecciona un franquiciado para gestionar sus empresas de Biloop</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="workers" className="space-y-4">
          {selectedFranchiseeId ? (
            <BiloopWorkersPanel />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecciona un franquiciado de la tabla superior para ver sus trabajadores</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <BiloopInvoicesTable 
            companyId={selectedCompanyId || null}
            companyName={getSelectedCompany()?.company_name}
          />
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <BiloopCustomersTable 
            companyId={selectedCompanyId || null}
            companyName={getSelectedCompany()?.company_name}
          />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <FranchiseeIntegrationsTable />
        </TabsContent>

      </Tabs>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default BiloopPage;