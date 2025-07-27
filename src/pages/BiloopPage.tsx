import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Building2, FileText, Users, Package, TestTube, UserCheck, Settings2, Check, X, Edit2, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useBiloop, BiloopCompany, BiloopInvoice, BiloopCustomer } from '@/hooks/useBiloop';
import { useFranchisees } from '@/hooks/data/useFranchisees';
import { useIntegrationConfig } from '@/hooks/useIntegrationConfig';
import { useToast } from '@/hooks/use-toast';
import { BiloopWorkersPanel } from '@/components/workers/BiloopWorkersPanel';


const BiloopPage = () => {
  const [invoices, setInvoices] = useState<BiloopInvoice[]>([]);
  const [customers, setCustomers] = useState<BiloopCustomer[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [selectedFranchiseeId, setSelectedFranchiseeId] = useState<string>('');
  const [editingCompanyId, setEditingCompanyId] = useState<string>('');
  const [tempCompanyId, setTempCompanyId] = useState<string>('');
  
  const { 
    loading: biloopLoading, 
    getInvoices, 
    getCustomers, 
    getInventory, 
    testConnection 
  } = useBiloop();
  
  const { franchisees, loading: franchiseesLoading } = useFranchisees();
  const { configs, loading: configsLoading, getConfigStatus, testConnection: testIntegrationConnection, saveConfig } = useIntegrationConfig();
  const { toast } = useToast();

  const loading = biloopLoading || franchiseesLoading || configsLoading;

  const getSelectedFranchiseeConfig = () => {
    return selectedFranchiseeId ? configs[selectedFranchiseeId] : null;
  };

  const getSelectedCompanyId = () => {
    const config = getSelectedFranchiseeConfig();
    return config?.biloop?.company_id || '';
  };

  const loadInvoices = async () => {
    const companyId = getSelectedCompanyId();
    if (!companyId) {
      toast({
        title: "Error",
        description: "Selecciona un franquiciado con configuración de Biloop",
        variant: "destructive",
      });
      return;
    }

    try {
      const data = await getInvoices(companyId);
      const invoicesArray = Array.isArray(data) ? data : [];
      setInvoices(invoicesArray);
    } catch (error) {
      console.error('Error loading invoices:', error);
      setInvoices([]);
    }
  };

  const loadCustomers = async () => {
    const companyId = getSelectedCompanyId();
    if (!companyId) {
      toast({
        title: "Error",
        description: "Selecciona un franquiciado con configuración de Biloop",
        variant: "destructive",
      });
      return;
    }

    try {
      const data = await getCustomers(companyId);
      const customersArray = Array.isArray(data) ? data : [];
      setCustomers(customersArray);
    } catch (error) {
      console.error('Error loading customers:', error);
      setCustomers([]);
    }
  };

  const loadInventory = async () => {
    const companyId = getSelectedCompanyId();
    if (!companyId) {
      toast({
        title: "Error",
        description: "Selecciona un franquiciado con configuración de Biloop",
        variant: "destructive",
      });
      return;
    }

    try {
      const data = await getInventory(companyId);
      const inventoryArray = Array.isArray(data) ? data : [];
      setInventory(inventoryArray);
    } catch (error) {
      console.error('Error loading inventory:', error);
      setInventory([]);
    }
  };

  const handleTestConnection = async () => {
    if (!selectedFranchiseeId) {
      toast({
        title: "Error",
        description: "Selecciona un franquiciado primero",
        variant: "destructive",
      });
      return;
    }

    await testIntegrationConnection('biloop', selectedFranchiseeId);
  };

  const handleEditCompanyId = (franchiseeId: string, currentCompanyId: string) => {
    setEditingCompanyId(franchiseeId);
    setTempCompanyId(currentCompanyId || '');
  };

  const handleSaveCompanyId = async (franchiseeId: string) => {
    try {
      const currentConfig = configs[franchiseeId] || {};

      const updatedConfig = {
        ...currentConfig,
        biloop: {
          ...currentConfig.biloop,
          company_id: tempCompanyId
        }
      };

      await saveConfig(updatedConfig, franchiseeId);
      setEditingCompanyId('');
      setTempCompanyId('');
      
      toast({
        title: "Éxito",
        description: "Company ID actualizado correctamente",
      });
    } catch (error) {
      console.error('Error saving company ID:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el Company ID",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingCompanyId('');
    setTempCompanyId('');
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
            Seleccionar Franquiciado
          </CardTitle>
          <CardDescription>
            Selecciona un franquiciado para gestionar sus empresas de Biloop
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Cargando franquiciados...</span>
            </div>
          ) : (
            <div className="grid gap-2">
              {franchisees.map((franchisee) => (
                <div
                  key={franchisee.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedFranchiseeId === franchisee.id
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedFranchiseeId(franchisee.id)}
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
          )}
        </CardContent>
      </Card>


      <Tabs defaultValue="workers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workers">Trabajadores</TabsTrigger>
          <TabsTrigger value="invoices">Facturas</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
        </TabsList>

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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Facturas ({invoices.length})
              </CardTitle>
              <CardDescription>
                Facturas de la empresa seleccionada
              </CardDescription>
              <Button onClick={loadInvoices} disabled={loading || !selectedFranchiseeId || !getSelectedCompanyId()}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Cargar facturas
              </Button>
              {selectedFranchiseeId && !getSelectedCompanyId() && (
                <p className="text-sm text-muted-foreground mt-2">
                  Este franquiciado no tiene configurado el company_id de Biloop
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-semibold">Factura {invoice.number}</h3>
                      <p className="text-sm text-muted-foreground">
                        Fecha: {new Date(invoice.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Cliente: {invoice.companyName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{invoice.total}€</p>
                      <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Clientes ({customers.length})
              </CardTitle>
              <CardDescription>
                Clientes de la empresa seleccionada
              </CardDescription>
              <Button onClick={loadCustomers} disabled={loading || !selectedFranchiseeId || !getSelectedCompanyId()}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Cargar clientes
              </Button>
              {selectedFranchiseeId && !getSelectedCompanyId() && (
                <p className="text-sm text-muted-foreground mt-2">
                  Este franquiciado no tiene configurado el company_id de Biloop
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-semibold">{customer.name}</h3>
                      <p className="text-sm text-muted-foreground">CIF: {customer.taxId}</p>
                      {customer.email && (
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                      )}
                      {customer.phone && (
                        <p className="text-sm text-muted-foreground">{customer.phone}</p>
                      )}
                    </div>
                    <Badge variant="outline">{customer.id}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Inventario ({inventory.length})
              </CardTitle>
              <CardDescription>
                Productos e inventario de la empresa seleccionada
              </CardDescription>
              <Button onClick={loadInventory} disabled={loading || !selectedFranchiseeId || !getSelectedCompanyId()}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Cargar inventario
              </Button>
              {selectedFranchiseeId && !getSelectedCompanyId() && (
                <p className="text-sm text-muted-foreground mt-2">
                  Este franquiciado no tiene configurado el company_id de Biloop
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {inventory.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-semibold">{item.name || item.description || `Artículo ${index + 1}`}</h3>
                      {item.code && (
                        <p className="text-sm text-muted-foreground">Código: {item.code}</p>
                      )}
                      {item.category && (
                        <p className="text-sm text-muted-foreground">Categoría: {item.category}</p>
                      )}
                    </div>
                    <div className="text-right">
                      {item.quantity !== undefined && (
                        <p className="font-semibold">Stock: {item.quantity}</p>
                      )}
                      {item.price && (
                        <p className="text-sm text-muted-foreground">{item.price}€</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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