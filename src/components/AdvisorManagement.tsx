import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { showSuccess, showError } from '@/utils/notifications';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Advisor {
  id: string;
  name: string;
  email: string;
  // Add other advisor properties as needed
}

const AdvisorManagement = () => {
  const [advisors, setAdvisors] = useState<Advisor[]>([
    { id: '1', name: 'John Doe', email: 'john.doe@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com' },
  ]);
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: string, data?: any) => {
    try {
      setLoading(true);
      
      // Simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Example: Add a new advisor
      if (action === 'add') {
        const newAdvisor = {
          id: Math.random().toString(),
          name: data.name,
          email: data.email,
        };
        setAdvisors([...advisors, newAdvisor]);
      }
      
      showSuccess(`Acción ${action} completada correctamente`);
    } catch (error) {
      console.error(`Error in ${action}:`, error);
      showError(`Error al ejecutar la acción ${action}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Asesores</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>Lista de asesores registrados</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {advisors.map((advisor) => (
              <TableRow key={advisor.id}>
                <TableCell className="font-medium">{advisor.id}</TableCell>
                <TableCell>{advisor.name}</TableCell>
                <TableCell>{advisor.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button onClick={() => handleAction('add', { name: 'New Advisor', email: 'new@example.com' })} disabled={loading}>
          {loading ? 'Cargando...' : 'Añadir Asesor'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdvisorManagement;
