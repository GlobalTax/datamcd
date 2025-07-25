import React, { useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/auth/AuthProvider';
import { useBiloop } from '@/hooks/useBiloop';
import { BiloopWorkersTable } from './BiloopWorkersTable';
import { BiloopPayrollManager } from './BiloopPayrollManager';
import { BiloopContractManager } from './BiloopContractManager';
import { BiloopIncidenceManager } from './BiloopIncidenceManager';
import { BiloopAnalyticsDashboard } from './BiloopAnalyticsDashboard';

interface BiloopWorkersPanelProps {
  onRefresh?: () => void;
}

export const BiloopWorkersPanel: React.FC<BiloopWorkersPanelProps> = ({ onRefresh }) => {
  const { franchisee } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const { 
    getEmployees, 
    getPayslips, 
    getContractTypes, 
    getIncidences, 
    getOccupationalCategories,
    getWorkCentersET,
    getWorkCentersSS,
    loading 
  } = useBiloop();

  // Obtener el company_id del franquiciado
  const companyId = franchisee?.biloop_company_id;

  // Si no hay franquiciado autenticado
  if (!franchisee) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Sin acceso de franquiciado</AlertTitle>
          <AlertDescription>
            No se pudo obtener información del franquiciado autenticado.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Si no hay company_id configurado para el franquiciado
  if (!companyId) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Empresa BILOOP no configurada</AlertTitle>
          <AlertDescription>
            No se ha configurado un código de empresa BILOOP válido para el franquiciado <strong>{franchisee.franchisee_name}</strong>.
            <br />
            <br />
            Por favor, contacte con su asesor para configurar el campo <code>biloop_company_id</code> en su perfil de franquiciado.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Panel de Trabajadores BILOOP</h1>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setRefreshKey(prev => prev + 1)}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Franquiciado: <span className="font-semibold">{franchisee.franchisee_name}</span>
        {' • '}
        Empresa BILOOP: <span className="font-semibold">{companyId}</span>
      </div>

      <Tabs defaultValue="workers" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="workers">Trabajadores</TabsTrigger>
          <TabsTrigger value="payroll">Nóminas</TabsTrigger>
          <TabsTrigger value="contracts">Contratos</TabsTrigger>
          <TabsTrigger value="incidents">Incidencias</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
          <TabsTrigger value="centers">Centros ET/SS</TabsTrigger>
        </TabsList>

        <TabsContent value="workers" className="space-y-4">
          <BiloopWorkersTable 
            selectedCompany={companyId}
            key={`workers-${refreshKey}`}
          />
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <BiloopPayrollManager 
            selectedCompany={companyId}
            key={`payroll-${refreshKey}`}
          />
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4">
          <BiloopContractManager 
            selectedCompany={companyId}
            key={`contracts-${refreshKey}`}
          />
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <BiloopIncidenceManager 
            selectedCompany={companyId}
            key={`incidents-${refreshKey}`}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <BiloopAnalyticsDashboard 
            selectedCompany={companyId}
            key={`analytics-${refreshKey}`}
          />
        </TabsContent>

        <TabsContent value="centers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Centros ET</h3>
              <Button
                onClick={async () => {
                  try {
                    const centers = await getWorkCentersET(companyId);
                    console.log('Centros ET:', centers);
                  } catch (error) {
                    console.error('Error cargando centros ET:', error);
                  }
                }}
                className="w-full"
              >
                Cargar Centros ET
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Centros SS</h3>
              <Button
                onClick={async () => {
                  try {
                    const centers = await getWorkCentersSS(companyId);
                    console.log('Centros SS:', centers);
                  } catch (error) {
                    console.error('Error cargando centros SS:', error);
                  }
                }}
                className="w-full"
              >
                Cargar Centros SS
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};