import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AlertTriangle, 
  Calendar,
  FileText,
  RefreshCw,
  Plus,
  Eye,
  Filter
} from 'lucide-react';
import { useBiloop } from '@/hooks/useBiloop';
import { useToast } from '@/hooks/use-toast';

interface BiloopIncidenceManagerProps {
  selectedCompany: string;
}

export const BiloopIncidenceManager: React.FC<BiloopIncidenceManagerProps> = ({ selectedCompany }) => {
  const [incidences, setIncidences] = useState<any[]>([]);
  const [leaveReasons, setLeaveReasons] = useState<any[]>([]);
  const [dischargeCauses, setDischargeCauses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { 
    getIncidences, 
    getLeaveReasons,
    getDischargeCauses,
    getDischargeItReasons
  } = useBiloop();
  const { toast } = useToast();

  useEffect(() => {
    loadIncidenceData();
  }, [selectedCompany]);

  const loadIncidenceData = async () => {
    if (!selectedCompany) return;
    
    setLoading(true);
    try {
      // Cargar incidencias
      const incidencesData = await getIncidences(selectedCompany);
      setIncidences(Array.isArray(incidencesData) ? incidencesData : []);

      // Cargar causas de baja
      const leavesData = await getLeaveReasons();
      setLeaveReasons(Array.isArray(leavesData) ? leavesData : []);

      // Cargar causas de alta
      const dischargesData = await getDischargeCauses();
      setDischargeCauses(Array.isArray(dischargesData) ? dischargesData : []);

      toast({
        title: "Datos de incidencias cargados",
        description: "Incidencias y causas actualizadas correctamente",
      });
    } catch (error) {
      console.error('Error loading incidence data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de incidencias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getIncidenceStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'abierta':
      case 'pendiente':
        return { variant: 'default' as const, label: 'Abierta' };
      case 'cerrada':
      case 'resuelta':
        return { variant: 'secondary' as const, label: 'Cerrada' };
      case 'en_proceso':
        return { variant: 'default' as const, label: 'En Proceso' };
      default:
        return { variant: 'outline' as const, label: status || 'Sin estado' };
    }
  };

  const getIncidenceType = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'baja':
        return { variant: 'destructive' as const, label: 'Baja' };
      case 'alta':
        return { variant: 'default' as const, label: 'Alta' };
      case 'modificacion':
        return { variant: 'secondary' as const, label: 'Modificación' };
      default:
        return { variant: 'outline' as const, label: type || 'General' };
    }
  };

  if (loading && incidences.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Gestión de Incidencias
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
      {/* Incidences Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Incidencias Laborales ({incidences.length})
              </CardTitle>
              <CardDescription>
                Gestión de incidencias de trabajadores
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadIncidenceData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Incidencia
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {incidences.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No hay incidencias registradas</p>
              <Button onClick={loadIncidenceData} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Cargar Incidencias
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidences.map((incidence, index) => {
                    const statusInfo = getIncidenceStatus(incidence.estado);
                    const typeInfo = getIncidenceType(incidence.tipo);
                    return (
                      <TableRow key={incidence.id || index}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {incidence.empleado || `Empleado ${index + 1}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {incidence.dni || 'Sin DNI'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={typeInfo.variant}>
                            {typeInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="max-w-xs truncate">
                            {incidence.descripcion || 'Sin descripción'}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {incidence.fecha 
                              ? new Date(incidence.fecha).toLocaleDateString()
                              : 'No disponible'
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant}>
                            {statusInfo.label}
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

      {/* Leave Reasons and Discharge Causes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Leave Reasons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Causas de Baja ({leaveReasons.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaveReasons.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No hay causas de baja disponibles
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {leaveReasons.map((reason, index) => (
                  <div key={reason.id || index} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium text-sm">
                        {reason.descripcion || `Causa ${index + 1}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Código: {reason.codigo || 'N/A'}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {reason.tipo || 'General'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Discharge Causes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Causas de Alta ({dischargeCauses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dischargeCauses.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No hay causas de alta disponibles
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {dischargeCauses.map((cause, index) => (
                  <div key={cause.id || index} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium text-sm">
                        {cause.descripcion || `Causa ${index + 1}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Código: {cause.codigo || 'N/A'}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {cause.tipo || 'General'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};