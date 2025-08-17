import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EmployeeServiceAPI } from '@/services/api/employeeService';
import { EmployeePayroll } from '@/types/employee';
import { employeeKeys } from '@/hooks/queryKeys';
import { useToast } from '@/hooks/use-toast';
import { useRestaurantContext } from '@/providers/RestaurantContext';

interface PayrollConfig {
  restaurantId: string;
  period?: string;
}

export const usePayroll = (config: PayrollConfig) => {
  const { restaurantId, period } = config;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query para obtener registros de nómina
  const {
    data: payrollRecords = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: employeeKeys.payroll(restaurantId, period),
    queryFn: () => EmployeeServiceAPI.fetchPayrollRecords(restaurantId, period),
    enabled: !!restaurantId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Mutación para generar nómina
  const generatePayrollMutation = useMutation({
    mutationFn: ({ employeeId, periodStart, periodEnd }: { 
      employeeId: string; 
      periodStart: string; 
      periodEnd: string; 
    }) => EmployeeServiceAPI.generatePayroll(employeeId, periodStart, periodEnd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.payroll(restaurantId) });
      toast({
        title: "Éxito",
        description: "Nómina generada exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al generar nómina",
        variant: "destructive",
      });
    },
  });

  // Mutación para actualizar estado de nómina
  const updatePayrollStatusMutation = useMutation({
    mutationFn: ({ payrollId, status }: { 
      payrollId: string; 
      status: 'draft' | 'approved' | 'paid' 
    }) => EmployeeServiceAPI.updatePayrollStatus(payrollId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.payroll(restaurantId) });
      toast({
        title: "Éxito",
        description: "Estado de nómina actualizado",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar estado de nómina",
        variant: "destructive",
      });
    },
  });

  return {
    // Data
    payrollRecords,
    
    // Loading states
    loading: isLoading,
    isLoading,
    isGenerating: generatePayrollMutation.isPending,
    isUpdating: updatePayrollStatusMutation.isPending,
    
    // Error states
    error,
    generateError: generatePayrollMutation.error,
    updateError: updatePayrollStatusMutation.error,
    
    // Actions
    refetch,
    generatePayroll: generatePayrollMutation.mutate,
    updatePayrollStatus: updatePayrollStatusMutation.mutate,
  };
};

// Hook específico que usa el contexto de restaurante
export const useRestaurantPayroll = (period?: string) => {
  const { currentRestaurantId } = useRestaurantContext();
  
  if (!currentRestaurantId) {
    throw new Error('useRestaurantPayroll requiere un restaurante seleccionado');
  }
  
  return usePayroll({ restaurantId: currentRestaurantId, period });
};