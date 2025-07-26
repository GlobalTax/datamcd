import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeService } from '@/services';
import { toast } from '@/hooks/use-toast';
import type { Employee } from '@/types/core';

// Query keys for cache management
export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...employeeKeys.lists(), { filters }] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
  byRestaurant: (restaurantId: string) => [...employeeKeys.all, 'restaurant', restaurantId] as const,
};

// Configuration interface for employee hooks
export interface EmployeeConfig {
  restaurantId?: string;
  includeInactive?: boolean;
  filters?: {
    position?: string;
    department?: string;
    status?: string;
  };
}

// Statistics interface
export interface EmployeeStats {
  total: number;
  active: number;
  inactive: number;
  byPosition: Record<string, number>;
  byDepartment: Record<string, number>;
}

// Main hook for employees data management
export function useEmployees(config: EmployeeConfig = {}) {
  const queryClient = useQueryClient();

  // Query for fetching employees
  const {
    data: employees = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: employeeKeys.list(config),
    queryFn: () => employeeService.getEmployees(config.restaurantId),
    select: (data) => {
      if (!data.success || !data.data) return [];
      return applyFilters(data.data, config.filters, config.includeInactive);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Mutation for creating employees
  const createMutation = useMutation({
    mutationFn: (employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) =>
      employeeService.createEmployee(employeeData),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: employeeKeys.all });
        toast({
          title: "Éxito",
          description: "Empleado creado correctamente",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Error al crear el empleado",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Error inesperado al crear el empleado",
        variant: "destructive",
      });
      console.error('Create employee error:', error);
    },
  });

  // Mutation for updating employees
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Employee> }) =>
      employeeService.updateEmployee(id, data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: employeeKeys.all });
        toast({
          title: "Éxito",
          description: "Empleado actualizado correctamente",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Error al actualizar el empleado",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Error inesperado al actualizar el empleado",
        variant: "destructive",
      });
      console.error('Update employee error:', error);
    },
  });

  // Mutation for deleting employees
  const deleteMutation = useMutation({
    mutationFn: (id: string) => employeeService.deleteEmployee(id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: employeeKeys.all });
        toast({
          title: "Éxito",
          description: "Empleado eliminado correctamente",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Error al eliminar el empleado",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Error inesperado al eliminar el empleado",
        variant: "destructive",
      });
      console.error('Delete employee error:', error);
    },
  });

  // Calculate statistics
  const stats: EmployeeStats = {
    total: employees.length,
    active: employees.filter((e: any) => e.status === 'active').length,
    inactive: employees.filter((e: any) => e.status !== 'active').length,
    byPosition: employees.reduce((acc: Record<string, number>, emp: any) => {
      acc[emp.position] = (acc[emp.position] || 0) + 1;
      return acc;
    }, {}),
    byDepartment: employees.reduce((acc: Record<string, number>, emp: any) => {
      if (emp.department) {
        acc[emp.department] = (acc[emp.department] || 0) + 1;
      }
      return acc;
    }, {}),
  };

  return {
    // Data
    employees,
    stats,

    // Loading states (legacy compatibility)
    loading: isLoading,
    isLoading,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Error states
    error,
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,

    // Actions
    refetch,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
  };
}

// Helper function to apply filters
function applyFilters(
  employees: Employee[], 
  filters?: EmployeeConfig['filters'],
  includeInactive = false
): Employee[] {
  let filtered = employees;

  // Filter by status unless includeInactive is true
  if (!includeInactive) {
    filtered = filtered.filter((emp: any) => emp.status === 'active');
  }

  if (!filters) return filtered;

  return filtered.filter((employee: any) => {
    if (filters.position && employee.position !== filters.position) return false;
    if (filters.department && employee.department !== filters.department) return false;
    if (filters.status && employee.status !== filters.status) return false;
    return true;
  });
}

// Hook for a single employee
export function useEmployee(id: string) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => employeeService.getEmployee(id),
    select: (data) => data.success ? data.data : null,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for employees by restaurant
export function useEmployeesByRestaurant(restaurantId: string) {
  return useEmployees({ restaurantId });
}