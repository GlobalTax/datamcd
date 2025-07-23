import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  RefreshCw, 
  Receipt, 
  FileText,
  Building2,
  AlertTriangle,
  BarChart3,
  Briefcase,
  Plus
} from 'lucide-react';
import { useBiloop } from '@/hooks/useBiloop';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { BiloopWorkersTable } from './BiloopWorkersTable';
import { BiloopPayrollManager } from './BiloopPayrollManager';
import { BiloopContractManager } from './BiloopContractManager';
import { BiloopIncidenceManager } from './BiloopIncidenceManager';
import { BiloopAnalyticsDashboard } from './BiloopAnalyticsDashboard';

export const BiloopWorkersPanel: React.FC = () => {
  const { effectiveFranchisee } = useUnifiedAuth();
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  
  const {
    loading,
    getEmployees,
    getPayslips,
    getContractTypes,
    getIncidences,
    getCategories,
    getWorkCentersET,
    getWorkCentersSS,
    getCostCenters
  } = useBiloop();

  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefreshAll = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (!effectiveFranchisee) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-muted-foreground">
            Selecciona un franquiciado para ver los datos de trabajadores
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de Trabajadores Biloop</h1>
          <p className="text-muted-foreground">
            Gestión completa de empleados, nóminas y datos laborales desde Biloop
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefreshAll}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar Todo
          </Button>
        </div>
      </div>

      {/* Company Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Empresa Activa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {effectiveFranchisee.franchisee_name}
          </p>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="workers" className="space-y-4" key={refreshKey}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="workers">
            <Users className="h-4 w-4 mr-2" />
            Trabajadores
          </TabsTrigger>
          <TabsTrigger value="payroll">
            <Receipt className="h-4 w-4 mr-2" />
            Nóminas
          </TabsTrigger>
          <TabsTrigger value="contracts">
            <Briefcase className="h-4 w-4 mr-2" />
            Contratos
          </TabsTrigger>
          <TabsTrigger value="incidents">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Incidencias
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Análisis
          </TabsTrigger>
          <TabsTrigger value="centers">
            <Building2 className="h-4 w-4 mr-2" />
            Centros
          </TabsTrigger>
        </TabsList>

        {/* Workers Tab */}
        <TabsContent value="workers" className="space-y-4">
          <BiloopWorkersTable selectedCompany={selectedCompany} />
        </TabsContent>

        {/* Payroll Tab */}
        <TabsContent value="payroll" className="space-y-4">
          <BiloopPayrollManager selectedCompany={selectedCompany} />
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-4">
          <BiloopContractManager selectedCompany={selectedCompany} />
        </TabsContent>

        {/* Incidents Tab */}
        <TabsContent value="incidents" className="space-y-4">
          <BiloopIncidenceManager selectedCompany={selectedCompany} />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <BiloopAnalyticsDashboard selectedCompany={selectedCompany} />
        </TabsContent>

        {/* Work Centers Tab */}
        <TabsContent value="centers" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Centros de Trabajo</CardTitle>
                <CardDescription>
                  Gestión de centros de trabajo ET y SS
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Centros ET</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => getWorkCentersET(selectedCompany)}
                        disabled={loading}
                        className="w-full"
                      >
                        <Building2 className="h-4 w-4 mr-2" />
                        Cargar Centros ET
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Centros SS</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => getWorkCentersSS(selectedCompany)}
                        disabled={loading}
                        className="w-full"
                      >
                        <Building2 className="h-4 w-4 mr-2" />
                        Cargar Centros SS
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};