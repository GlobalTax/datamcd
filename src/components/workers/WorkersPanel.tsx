import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  RefreshCw, 
  Download, 
  Plus, 
  Building2, 
  Database,
  FileText,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { useWorkersPanel } from '@/hooks/useWorkersPanel';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { WorkersTable } from './WorkersTable';
import { WorkersStats } from './WorkersStats';
import { BiloopEmployeeForm } from './BiloopEmployeeForm';
import { A3TransformDialog } from './A3TransformDialog';
import { OrquestMetricsPanel } from './OrquestMetricsPanel';

export const WorkersPanel: React.FC = () => {
  const { franchisee } = useUnifiedAuth();
  const franchiseeId = franchisee?.id;
  
  const {
    workers,
    loading,
    error,
    orquestEmployees,
    biloopEmployees,
    syncOrquestData,
    loadBiloopEmployees,
    transformToA3,
    createBiloopEmployee,
    refetch
  } = useWorkersPanel(franchiseeId);

  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showA3Transform, setShowA3Transform] = useState(false);

  const handleSyncOrquest = async () => {
    await syncOrquestData();
  };

  const handleRefreshBiloop = async () => {
    await loadBiloopEmployees();
  };

  const handleRefreshAll = async () => {
    await refetch();
  };

  if (!franchiseeId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-muted-foreground">
            Selecciona un franquiciado para ver los datos de trabajadores
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 font-medium">Error al cargar datos</p>
          <p className="text-muted-foreground text-sm">{error}</p>
          <Button onClick={handleRefreshAll} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de Trabajadores</h1>
          <p className="text-muted-foreground">
            Gestión unificada de empleados desde Orquest y Biloop
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
          <Button onClick={() => setShowEmployeeForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Empleado
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <WorkersStats 
        workers={workers}
        orquestCount={orquestEmployees.length}
        biloopCount={biloopEmployees.length}
        loading={loading}
      />

      {/* Contenido principal con tabs */}
      <Tabs defaultValue="unified" className="space-y-4">
        <TabsList>
          <TabsTrigger value="unified">
            <Users className="h-4 w-4 mr-2" />
            Vista Unificada
          </TabsTrigger>
          <TabsTrigger value="orquest">
            <Building2 className="h-4 w-4 mr-2" />
            Orquest
          </TabsTrigger>
          <TabsTrigger value="orquest-metrics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Métricas Orquest
          </TabsTrigger>
          <TabsTrigger value="biloop">
            <Database className="h-4 w-4 mr-2" />
            Biloop
          </TabsTrigger>
        </TabsList>

        {/* Vista Unificada */}
        <TabsContent value="unified" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todos los Trabajadores</CardTitle>
              <CardDescription>
                Vista consolidada de empleados de ambos sistemas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WorkersTable 
                workers={workers} 
                loading={loading}
                showSource={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vista Orquest */}
        <TabsContent value="orquest" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Empleados de Orquest</CardTitle>
                <CardDescription>
                  Datos sincronizados desde el sistema Orquest
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={handleSyncOrquest}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Sincronizar
              </Button>
            </CardHeader>
            <CardContent>
              <WorkersTable 
                workers={workers.filter(w => w.source === 'orquest')} 
                loading={loading}
                showSource={false}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Métricas Orquest */}
        <TabsContent value="orquest-metrics" className="space-y-4">
          <OrquestMetricsPanel 
            employees={orquestEmployees} 
            loading={loading}
          />
        </TabsContent>

        {/* Vista Biloop */}
        <TabsContent value="biloop" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Empleados de Biloop</CardTitle>
                  <CardDescription>
                    Datos de empleados desde IntegraLOOP (Biloop)
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowA3Transform(true)}
                    disabled={biloopEmployees.length === 0}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Transformar A3
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleRefreshBiloop}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Actualizar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <WorkersTable 
                  workers={workers.filter(w => w.source === 'biloop')} 
                  loading={loading}
                  showSource={false}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <BiloopEmployeeForm
        open={showEmployeeForm}
        onOpenChange={setShowEmployeeForm}
        onSubmit={createBiloopEmployee}
      />

      <A3TransformDialog
        open={showA3Transform}
        onOpenChange={setShowA3Transform}
        employees={biloopEmployees}
        onTransform={transformToA3}
      />
    </div>
  );
};