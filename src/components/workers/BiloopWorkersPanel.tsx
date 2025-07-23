import React, { useState, useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw } from 'lucide-react';
import { useBiloop, type BiloopCompany } from '@/hooks/useBiloop';
import { BiloopWorkersTable } from './BiloopWorkersTable';
import { BiloopPayrollManager } from './BiloopPayrollManager';
import { BiloopContractManager } from './BiloopContractManager';
import { BiloopIncidenceManager } from './BiloopIncidenceManager';
import { BiloopAnalyticsDashboard } from './BiloopAnalyticsDashboard';

interface BiloopWorkersPanelProps {
  onRefresh?: () => void;
}

export const BiloopWorkersPanel: React.FC<BiloopWorkersPanelProps> = ({ onRefresh }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [availableCompanies, setAvailableCompanies] = useState<BiloopCompany[]>([]);

  const { 
    getCompanies,
    getEmployees, 
    getPayslips, 
    getContractTypes, 
    getIncidences, 
    getOccupationalCategories,
    getWorkCentersET,
    getWorkCentersSS,
    loading 
  } = useBiloop();

  // Cargar empresas disponibles al iniciar
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const companies = await getCompanies();
        setAvailableCompanies(companies || []);
        
        // Seleccionar la primera empresa por defecto
        if (companies && companies.length > 0) {
          setSelectedCompany(companies[0].id);
        }
      } catch (error) {
        console.error('Error cargando empresas BILOOP:', error);
      }
    };

    loadCompanies();
  }, [getCompanies]);

  // Si no hay company_id seleccionado
  if (!selectedCompany && availableCompanies.length === 0) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Cargando empresas BILOOP</AlertTitle>
          <AlertDescription>
            Cargando lista de empresas disponibles...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Si no hay company_id seleccionado
  if (!selectedCompany) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Empresa BILOOP no configurada</AlertTitle>
          <AlertDescription>
            No se ha configurado un código de empresa BILOOP válido para este franquiciado.
            {availableCompanies.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">Empresas disponibles:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {availableCompanies.map((company) => (
                    <Button
                      key={company.id}
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCompany(company.id)}
                    >
                      {company.name} ({company.id})
                    </Button>
                  ))}
                </div>
              </div>
            )}
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
          {availableCompanies.length > 1 && (
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              {availableCompanies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name} ({company.id})
                </option>
              ))}
            </select>
          )}
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
        {selectedCompany && (
          <>Empresa BILOOP: <span className="font-semibold">{selectedCompany}</span></>
        )}
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
            selectedCompany={selectedCompany}
            key={`workers-${refreshKey}`}
          />
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <BiloopPayrollManager 
            selectedCompany={selectedCompany}
            key={`payroll-${refreshKey}`}
          />
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4">
          <BiloopContractManager 
            selectedCompany={selectedCompany}
            key={`contracts-${refreshKey}`}
          />
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <BiloopIncidenceManager 
            selectedCompany={selectedCompany}
            key={`incidents-${refreshKey}`}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <BiloopAnalyticsDashboard 
            selectedCompany={selectedCompany}
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
                    const centers = await getWorkCentersET(selectedCompany);
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
                    const centers = await getWorkCentersSS(selectedCompany);
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