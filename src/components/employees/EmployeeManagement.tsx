import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Users, Clock, Calendar, DollarSign } from 'lucide-react';
import { EmployeeList } from './EmployeeList';
import { EmployeeForm } from './EmployeeForm';
import { EmployeeStats as EmployeeStatsComponent } from './EmployeeStats';
import { TimeTrackingView } from './TimeTrackingView';
import { TimeOffView } from './TimeOffView';
import { PayrollView } from './PayrollView';
import { useEmployees } from '@/hooks/useEmployees';

interface EmployeeManagementProps {
  restaurantId: string;
  restaurantName: string;
}

export const EmployeeManagement: React.FC<EmployeeManagementProps> = ({
  restaurantId,
  restaurantName
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const { employees, loading, stats, createEmployee, updateEmployee, deleteEmployee, refetch } = useEmployees(restaurantId);

  const handleCreateEmployee = async (employeeData: any) => {
    const success = await createEmployee(employeeData, restaurantId);
    if (success) {
      setShowCreateForm(false);
      setActiveTab('list');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Empleados</h1>
          <p className="text-gray-600">{restaurantName}</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Empleado
        </Button>
      </div>

      {/* Stats Overview */}
      {stats && <EmployeeStatsComponent stats={stats} />}

      {/* Create Employee Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Nuevo Empleado</h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowCreateForm(false)}
                >
                  ✕
                </Button>
              </div>
              <EmployeeForm
                onSubmit={handleCreateEmployee}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Empleados
          </TabsTrigger>
          <TabsTrigger value="time-tracking" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Control Horario
          </TabsTrigger>
          <TabsTrigger value="time-off" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Vacaciones
          </TabsTrigger>
          <TabsTrigger value="payroll" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Nóminas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Empleados</CardTitle>
            </CardHeader>
            <CardContent>
              <EmployeeList
                employees={employees}
                loading={loading}
                onRefresh={refetch}
                onUpdateEmployee={updateEmployee}
                onDeleteEmployee={deleteEmployee}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time-tracking">
          <Card>
            <CardHeader>
              <CardTitle>Control de Horarios</CardTitle>
            </CardHeader>
            <CardContent>
              <TimeTrackingView employees={employees} restaurantId={restaurantId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time-off">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Vacaciones y Permisos</CardTitle>
            </CardHeader>
            <CardContent>
              <TimeOffView employees={employees} restaurantId={restaurantId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Nóminas</CardTitle>
            </CardHeader>
            <CardContent>
              <PayrollView employees={employees} restaurantId={restaurantId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};