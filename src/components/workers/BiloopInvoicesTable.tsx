import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2 } from 'lucide-react';
import { useBiloop, BiloopInvoice } from '@/hooks/useBiloop';
import { useToast } from '@/hooks/use-toast';

interface BiloopInvoicesTableProps {
  companyId: string | null;
  companyName?: string;
}

export const BiloopInvoicesTable: React.FC<BiloopInvoicesTableProps> = ({ 
  companyId, 
  companyName 
}) => {
  const [invoices, setInvoices] = useState<BiloopInvoice[]>([]);
  const { getInvoices, loading } = useBiloop();
  const { toast } = useToast();

  const loadInvoices = async () => {
    if (!companyId) {
      toast({
        title: "Error",
        description: "Selecciona una empresa de Biloop",
        variant: "destructive",
      });
      return;
    }

    try {
      const data = await getInvoices(companyId);
      const invoicesArray = Array.isArray(data) ? data : [];
      setInvoices(invoicesArray);
      
      toast({
        title: "Facturas cargadas",
        description: `Se cargaron ${invoicesArray.length} facturas`,
      });
    } catch (error) {
      console.error('Error loading invoices:', error);
      setInvoices([]);
      toast({
        title: "Error",
        description: "No se pudieron cargar las facturas",
        variant: "destructive",
      });
    }
  };

  // Auto-cargar cuando cambia la empresa
  useEffect(() => {
    if (companyId) {
      loadInvoices();
    } else {
      setInvoices([]);
    }
  }, [companyId]);

  if (!companyId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Selecciona una empresa para ver sus facturas</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Facturas ({invoices.length})
        </CardTitle>
        <CardDescription>
          Facturas de {companyName || 'la empresa seleccionada'}
        </CardDescription>
        <Button onClick={loadInvoices} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Actualizar facturas
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {invoices.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay facturas disponibles</p>
              <p className="text-sm mt-2">Haz clic en "Actualizar facturas" para cargar datos</p>
            </div>
          ) : (
            invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
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
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};