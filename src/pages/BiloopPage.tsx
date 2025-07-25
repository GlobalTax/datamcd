import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, FileText, Users, Package, TestTube, UserCheck } from 'lucide-react';
import { useBiloop, BiloopCompany, BiloopInvoice, BiloopCustomer } from '@/hooks/useBiloop';
import { useToast } from '@/hooks/use-toast';
import { BiloopWorkersPanel } from '@/components/workers/BiloopWorkersPanel';

const BiloopPage = () => {
  const [companies, setCompanies] = useState<BiloopCompany[]>([]);
  const [invoices, setInvoices] = useState<BiloopInvoice[]>([]);
  const [customers, setCustomers] = useState<BiloopCustomer[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  
  const { 
    loading, 
    getInvoices, 
    getCustomers, 
    getInventory, 
    testConnection 
  } = useBiloop();
  
  const { toast } = useToast();

  // Ya no cargamos empresas desde la API, sino que usamos el company_id del franquiciado
  useEffect(() => {
    // Aquí podrías obtener el company_id del franquiciado autenticado
    // Por simplicidad, pondremos un placeholder
    console.log('BiloopPage loaded - usar company_id del franquiciado');
  }, []);

  const loadInvoices = async () => {
    try {
      const data = await getInvoices(selectedCompany);
      const invoicesArray = Array.isArray(data) ? data : [];
      setInvoices(invoicesArray);
    } catch (error) {
      console.error('Error loading invoices:', error);
      setInvoices([]);
    }
  };

  const loadCustomers = async () => {
    try {
      const data = await getCustomers(selectedCompany);
      const customersArray = Array.isArray(data) ? data : [];
      setCustomers(customersArray);
    } catch (error) {
      console.error('Error loading customers:', error);
      setCustomers([]);
    }
  };

  const loadInventory = async () => {
    try {
      const data = await getInventory(selectedCompany);
      const inventoryArray = Array.isArray(data) ? data : [];
      setInventory(inventoryArray);
    } catch (error) {
      console.error('Error loading inventory:', error);
      setInventory([]);
    }
  };

  const handleTestConnection = async () => {
    await testConnection();
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

      {/* Company Selector */}
      {companies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Empresas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {companies.map((company) => (
                <Badge
                  key={company.id}
                  variant={selectedCompany === company.id ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCompany(company.id)}
                >
                  {company.name} ({company.taxId})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="workers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workers">Trabajadores</TabsTrigger>
          <TabsTrigger value="companies">Empresas</TabsTrigger>
          <TabsTrigger value="invoices">Facturas</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
        </TabsList>

        <TabsContent value="workers" className="space-y-4">
          <BiloopWorkersPanel />
        </TabsContent>

        <TabsContent value="companies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Empresas ({companies.length})
              </CardTitle>
              <CardDescription>
                Lista de empresas disponibles en Biloop
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
              <div className="grid gap-4">
                {companies.map((company) => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-semibold">{company.name}</h3>
                      <p className="text-sm text-muted-foreground">CIF: {company.taxId}</p>
                      {company.email && (
                        <p className="text-sm text-muted-foreground">{company.email}</p>
                      )}
                    </div>
                    <Badge variant="secondary">{company.id}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
              <Button onClick={loadInvoices} disabled={loading || !selectedCompany}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Cargar facturas
              </Button>
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
              <Button onClick={loadCustomers} disabled={loading || !selectedCompany}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Cargar clientes
              </Button>
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
              <Button onClick={loadInventory} disabled={loading || !selectedCompany}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Cargar inventario
              </Button>
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