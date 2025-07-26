import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Briefcase, 
  Calendar,
  AlertTriangle,
  FileText,
  RefreshCw,
  Plus,
  Eye
} from 'lucide-react';
import { useBiloop } from '@/hooks/useBiloop';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

interface BiloopContractManagerProps {
  selectedCompany: string;
}

export const BiloopContractManager: React.FC<BiloopContractManagerProps> = ({ selectedCompany }) => {
  const [contractTypes, setContractTypes] = useState<any[]>([]);
  const [contractExpirations, setContractExpirations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { 
    getContractTypes, 
    getWorkersContractsExpiration 
  } = useBiloop();
  const { toast } = useToast();

  useEffect(() => {
    loadContractData();
  }, [selectedCompany]);

  const loadContractData = async () => {
    if (!selectedCompany) return;
    
    setLoading(true);
    try {
      // Cargar tipos de contrato
      const typesData = await getContractTypes(selectedCompany);
      setContractTypes(Array.isArray(typesData) ? typesData : []);

      // Cargar vencimientos de contratos
      const expirationsData = await getWorkersContractsExpiration(selectedCompany);
      setContractExpirations(Array.isArray(expirationsData) ? expirationsData : []);

      toast({
        title: "Datos de contratos cargados",
        description: "Tipos y vencimientos actualizados correctamente",
      });
    } catch (error) {
      logger.error('Error loading contract data', {}, error as Error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de contratos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isContractExpiringSoon = (expirationDate: string) => {
    if (!expirationDate) return false;
    const expDate = new Date(expirationDate);
    const today = new Date();
    const daysUntilExpiration = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysUntilExpiration <= 30 && daysUntilExpiration >= 0;
  };

  const getExpirationStatus = (expirationDate: string) => {
    if (!expirationDate) return { status: 'unknown', variant: 'secondary' as const };
    
    const expDate = new Date(expirationDate);
    const today = new Date();
    const daysUntilExpiration = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysUntilExpiration < 0) {
      return { status: 'Vencido', variant: 'destructive' as const };
    } else if (daysUntilExpiration <= 7) {
      return { status: 'Vence esta semana', variant: 'destructive' as const };
    } else if (daysUntilExpiration <= 30) {
      return { status: 'Vence este mes', variant: 'default' as const };
    } else {
      return { status: 'Vigente', variant: 'secondary' as const };
    }
  };

  if (loading && contractTypes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Gestión de Contratos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contract Types */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Tipos de Contrato ({contractTypes.length})
              </CardTitle>
              <CardDescription>
                Gestión de tipos de contrato disponibles
              </CardDescription>
            </div>
            <Button variant="outline" onClick={loadContractData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {contractTypes.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No hay tipos de contrato disponibles</p>
              <Button onClick={loadContractData} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Cargar Tipos
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contractTypes.map((contractType, index) => (
                <Card key={contractType.id || index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">
                        {contractType.codigo || `CT-${index + 1}`}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    <h4 className="font-semibold">{contractType.nombre || `Tipo ${index + 1}`}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {contractType.descripcion || 'Sin descripción disponible'}
                    </p>
                    {contractType.duracion && (
                      <div className="flex items-center gap-1 mt-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        {contractType.duracion}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contract Expirations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Vencimientos de Contratos ({contractExpirations.length})
          </CardTitle>
          <CardDescription>
            Contratos próximos a vencer o ya vencidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contractExpirations.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No hay vencimientos de contratos</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Tipo de Contrato</TableHead>
                    <TableHead>Fecha Inicio</TableHead>
                    <TableHead>Fecha Vencimiento</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contractExpirations.map((contract, index) => {
                    const expirationStatus = getExpirationStatus(contract.fechaVencimiento);
                    return (
                      <TableRow key={contract.id || index}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {contract.empleado || `Empleado ${index + 1}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {contract.dni || 'Sin DNI'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {contract.tipoContrato || 'No especificado'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {contract.fechaInicio 
                              ? new Date(contract.fechaInicio).toLocaleDateString()
                              : 'No disponible'
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {contract.fechaVencimiento 
                              ? new Date(contract.fechaVencimiento).toLocaleDateString()
                              : 'No disponible'
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={expirationStatus.variant}>
                            {expirationStatus.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};