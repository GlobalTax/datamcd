import { useState, useEffect } from 'react';
import { useOrquest } from './useOrquest';
import { useBiloop, BiloopEmployee } from './useBiloop';
import { useToast } from './use-toast';

// Interfaz unificada para trabajadores con vinculación por NIF
export interface UnifiedWorker {
  id: string;
  nif: string; // Campo clave para vinculación
  source: 'orquest' | 'biloop' | 'unified'; // 'unified' cuando tiene datos de ambos sistemas
  
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
  
  // Datos específicos de Orquest (operacionales)
  orquestData?: {
    id: string;
    serviceId?: string;
    datosCompletos?: any;
    updatedAt?: string;
  };
  
  // Datos específicos de Biloop (regulatorios)
  biloopData?: {
    id: string;
    salary?: number;
    contractType?: string;
    socialSecurityNumber?: string;
    startDate?: string;
    endDate?: string;
    status?: 'active' | 'inactive';
  };
  
  // Indicadores de estado de vinculación
  hasOrquestData: boolean;
  hasBiloopData: boolean;
  isFullyLinked: boolean; // true cuando tiene datos de ambos sistemas
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

  // Función para extraer NIF de diferentes fuentes de datos
  const extractNIF = (orquestEmp?: any, biloopEmp?: BiloopEmployee): string => {
    // Priorizar DNI de Biloop por ser más confiable
    if (biloopEmp?.dni) return biloopEmp.dni;
    
    // Buscar en datos completos de Orquest
    if (orquestEmp?.datos_completos?.dni) return orquestEmp.datos_completos.dni;
    if (orquestEmp?.datos_completos?.nif) return orquestEmp.datos_completos.nif;
    
    // Fallback: generar ID temporal
    return orquestEmp?.id || biloopEmp?.id || 'unknown';
  };

  // Función para unificar datos de ambos sistemas vinculando por NIF
  const unifyWorkerData = () => {
    setLoading(true);
    setError(null);

    try {
      const workersByNIF = new Map<string, UnifiedWorker>();

      // Procesar empleados de Orquest primero
      orquestEmployees.forEach(emp => {
        const nif = extractNIF(emp);
        const workerId = `unified-${nif}`;
        
        workersByNIF.set(nif, {
          id: workerId,
          nif,
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
            id: emp.id,
            serviceId: emp.service_id,
            datosCompletos: emp.datos_completos,
            updatedAt: emp.updated_at || '',
          },
          hasOrquestData: true,
          hasBiloopData: false,
          isFullyLinked: false,
        });
      });

      // Procesar empleados de Biloop y vincular por NIF
      biloopEmployees.forEach(emp => {
        const nif = extractNIF(undefined, emp);
        const existingWorker = workersByNIF.get(nif);
        
        if (existingWorker) {
          // Vincular datos de Biloop con empleado existente de Orquest
          existingWorker.source = 'unified';
          existingWorker.hasBiloopData = true;
          existingWorker.isFullyLinked = true;
          existingWorker.biloopData = {
            id: emp.id,
            salary: emp.salary,
            contractType: emp.contractType,
            socialSecurityNumber: emp.socialSecurityNumber,
            startDate: emp.startDate,
            endDate: emp.endDate,
            status: emp.status,
          };
          
          // Enriquecer información con datos de Biloop (más completos)
          if (emp.name && !existingWorker.nombre) existingWorker.nombre = emp.name;
          if (emp.surname && !existingWorker.apellidos) existingWorker.apellidos = emp.surname;
          if (emp.email && !existingWorker.email) existingWorker.email = emp.email;
          if (emp.phone && !existingWorker.telefono) existingWorker.telefono = emp.phone;
          if (emp.position && !existingWorker.puesto) existingWorker.puesto = emp.position;
          if (emp.department && !existingWorker.departamento) existingWorker.departamento = emp.department;
          
        } else {
          // Crear nuevo empleado solo de Biloop
          const workerId = `unified-${nif}`;
          workersByNIF.set(nif, {
            id: workerId,
            nif,
            source: 'biloop',
            nombre: emp.name,
            apellidos: emp.surname || '',
            email: emp.email || '',
            telefono: emp.phone || '',
            puesto: emp.position || '',
            departamento: emp.department || '',
            fechaAlta: emp.startDate || '',
            fechaBaja: emp.endDate || '',
            estado: emp.status === 'active' ? 'activo' : 'inactivo',
            biloopData: {
              id: emp.id,
              salary: emp.salary,
              contractType: emp.contractType,
              socialSecurityNumber: emp.socialSecurityNumber,
              startDate: emp.startDate,
              endDate: emp.endDate,
              status: emp.status,
            },
            hasOrquestData: false,
            hasBiloopData: true,
            isFullyLinked: false,
          });
        }
      });

      setWorkers(Array.from(workersByNIF.values()));
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