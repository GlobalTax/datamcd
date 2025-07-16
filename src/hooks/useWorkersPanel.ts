import { useState, useEffect } from 'react';
import { useOrquest } from './useOrquest';
import { useBiloop, BiloopEmployee } from './useBiloop';
import { useToast } from './use-toast';

// Interfaz unificada para trabajadores
export interface UnifiedWorker {
  id: string;
  source: 'orquest' | 'biloop';
  
  // Información básica
  nombre: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  
  // Información laboral
  puesto?: string;
  departamento?: string;
  fechaAlta?: string;
  fechaBaja?: string;
  estado?: string;
  
  // Datos específicos de Orquest
  orquestData?: {
    serviceId?: string;
    datosCompletos?: any;
    updatedAt?: string;
  };
  
  // Datos específicos de Biloop
  biloopData?: {
    dni?: string;
    salary?: number;
    contractType?: string;
    socialSecurityNumber?: string;
    startDate?: string;
    endDate?: string;
    status?: 'active' | 'inactive';
  };
}

export const useWorkersPanel = (franchiseeId?: string) => {
  const [workers, setWorkers] = useState<UnifiedWorker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Hooks de los sistemas externos
  const { 
    employees: orquestEmployees, 
    loading: orquestLoading, 
    syncEmployeesOnly: syncOrquestEmployees 
  } = useOrquest(franchiseeId);
  
  const { 
    getEmployees, 
    createEmployee, 
    transformEmployeesToA3,
    loading: biloopLoading 
  } = useBiloop();

  const [biloopEmployees, setBiloopEmployees] = useState<BiloopEmployee[]>([]);

  // Función para cargar empleados de Biloop
  const loadBiloopEmployees = async () => {
    try {
      const employees = await getEmployees();
      setBiloopEmployees(employees);
    } catch (error) {
      console.error('Error loading Biloop employees:', error);
    }
  };

  // Función para unificar datos de ambos sistemas
  const unifyWorkerData = () => {
    setLoading(true);
    setError(null);

    try {
      const unifiedWorkers: UnifiedWorker[] = [];

      // Procesar empleados de Orquest
      orquestEmployees.forEach(emp => {
        unifiedWorkers.push({
          id: `orquest-${emp.id}`,
          source: 'orquest',
          nombre: emp.nombre || '',
          apellidos: emp.apellidos || '',
          email: emp.email || '',
          telefono: emp.telefono || '',
          puesto: emp.puesto || '',
          departamento: emp.departamento || '',
          fechaAlta: emp.fecha_alta || '',
          fechaBaja: emp.fecha_baja || '',
          estado: emp.estado || '',
          orquestData: {
            serviceId: emp.service_id,
            datosCompletos: emp.datos_completos,
            updatedAt: emp.updated_at || '',
          }
        });
      });

      // Procesar empleados de Biloop
      biloopEmployees.forEach(emp => {
        unifiedWorkers.push({
          id: `biloop-${emp.id}`,
          source: 'biloop',
          nombre: emp.name,
          apellidos: emp.surname,
          email: emp.email || '',
          telefono: emp.phone || '',
          puesto: emp.position || '',
          departamento: emp.department || '',
          fechaAlta: emp.startDate || '',
          fechaBaja: emp.endDate || '',
          estado: emp.status === 'active' ? 'activo' : 'inactivo',
          biloopData: {
            dni: emp.dni,
            salary: emp.salary,
            contractType: emp.contractType,
            socialSecurityNumber: emp.socialSecurityNumber,
            startDate: emp.startDate,
            endDate: emp.endDate,
            status: emp.status,
          }
        });
      });

      setWorkers(unifiedWorkers);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al unificar datos de trabajadores';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para sincronizar datos de Orquest
  const syncOrquestData = async () => {
    try {
      await syncOrquestEmployees();
      toast({
        title: "Sincronización exitosa",
        description: "Datos de Orquest actualizados",
      });
    } catch (error) {
      toast({
        title: "Error de sincronización",
        description: "No se pudieron sincronizar los datos de Orquest",
        variant: "destructive",
      });
    }
  };

  // Función para transformar empleados a formato A3
  const transformToA3 = async (employees: BiloopEmployee[], format: 'a3nom' | 'a3eco' | 'a3') => {
    try {
      if (!franchiseeId) {
        throw new Error('Se requiere un franquiciado seleccionado');
      }

      const result = await transformEmployeesToA3({
        employees,
        companyId: franchiseeId,
        format
      });

      toast({
        title: "Transformación exitosa",
        description: `Empleados transformados a formato ${format.toUpperCase()}`,
      });

      return result;
    } catch (error) {
      toast({
        title: "Error en transformación",
        description: "No se pudieron transformar los empleados",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Crear empleado en Biloop
  const createBiloopEmployee = async (employeeData: Omit<BiloopEmployee, 'id'>) => {
    try {
      const newEmployee = await createEmployee(employeeData);
      await loadBiloopEmployees(); // Recargar lista
      
      toast({
        title: "Empleado creado",
        description: "Empleado creado exitosamente en Biloop",
      });

      return newEmployee;
    } catch (error) {
      toast({
        title: "Error al crear empleado",
        description: "No se pudo crear el empleado en Biloop",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Efectos para cargar y unificar datos
  useEffect(() => {
    if (franchiseeId) {
      loadBiloopEmployees();
    }
  }, [franchiseeId]);

  useEffect(() => {
    unifyWorkerData();
  }, [orquestEmployees, biloopEmployees]);

  return {
    workers,
    loading: loading || orquestLoading || biloopLoading,
    error,
    
    // Datos separados por sistema
    orquestEmployees,
    biloopEmployees,
    
    // Funciones de sincronización
    syncOrquestData,
    loadBiloopEmployees,
    
    // Funciones de transformación
    transformToA3,
    createBiloopEmployee,
    
    // Función de recarga general
    refetch: () => {
      loadBiloopEmployees();
      unifyWorkerData();
    }
  };
};