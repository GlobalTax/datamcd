import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmployeeForm } from './EmployeeForm';
import { Employee, EmployeeFormData } from '@/types/employee';

interface EmployeeEditDialogProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (employeeId: string, data: Partial<EmployeeFormData>) => Promise<boolean>;
}

export const EmployeeEditDialog: React.FC<EmployeeEditDialogProps> = ({
  employee,
  open,
  onOpenChange,
  onUpdate
}) => {
  const handleSubmit = async (data: EmployeeFormData) => {
    if (!employee) return;
    
    const success = await onUpdate(employee.id, data);
    if (success) {
      onOpenChange(false);
    }
  };

  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Editar Empleado: {employee.first_name} {employee.last_name}
          </DialogTitle>
        </DialogHeader>
        
        <EmployeeForm
          employee={employee}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};