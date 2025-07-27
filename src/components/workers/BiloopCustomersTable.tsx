import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Loader2 } from 'lucide-react';
import { useBiloop, BiloopCustomer } from '@/hooks/useBiloop';
import { useToast } from '@/hooks/use-toast';

interface BiloopCustomersTableProps {
  companyId: string | null;
  companyName?: string;
}

export const BiloopCustomersTable: React.FC<BiloopCustomersTableProps> = ({ 
  companyId, 
  companyName 
}) => {
  const [customers, setCustomers] = useState<BiloopCustomer[]>([]);
  const { getCustomers, loading } = useBiloop();
  const { toast } = useToast();

  const loadCustomers = async () => {
    if (!companyId) {
      toast({
        title: "Error",
        description: "Selecciona una empresa de Biloop",
        variant: "destructive",
      });
      return;
    }

    try {
      const data = await getCustomers(companyId);
      const customersArray = Array.isArray(data) ? data : [];
      setCustomers(customersArray);
      
      toast({
        title: "Clientes cargados",
        description: `Se cargaron ${customersArray.length} clientes`,
      });
    } catch (error) {
      console.error('Error loading customers:', error);
      setCustomers([]);
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes",
        variant: "destructive",
      });
    }
  };

  // Auto-cargar cuando cambia la empresa
  useEffect(() => {
    if (companyId) {
      loadCustomers();
    } else {
      setCustomers([]);
    }
  }, [companyId]);

  if (!companyId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Selecciona una empresa para ver sus clientes</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Clientes ({customers.length})
        </CardTitle>
        <CardDescription>
          Clientes de {companyName || 'la empresa seleccionada'}
        </CardDescription>
        <Button onClick={loadCustomers} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Actualizar clientes
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {customers.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay clientes disponibles</p>
              <p className="text-sm mt-2">Haz clic en "Actualizar clientes" para cargar datos</p>
            </div>
          ) : (
            customers.map((customer) => (
              <div
                key={customer.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div>
                  <h3 className="font-semibold">{customer.name}</h3>
                  <p className="text-sm text-muted-foreground">CIF: {customer.taxId}</p>
                  {customer.email && (
                    <p className="text-sm text-muted-foreground">Email: {customer.email}</p>
                  )}
                  {customer.phone && (
                    <p className="text-sm text-muted-foreground">Teléfono: {customer.phone}</p>
                  )}
                </div>
                <Badge variant="outline">ID: {customer.id}</Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};