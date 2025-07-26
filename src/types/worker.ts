// Tipos unificados para el sistema de trabajadores
export interface UnifiedWorker {
  id: string;
  nif: string; // Campo clave para vinculación entre sistemas
  source: 'orquest' | 'biloop' | 'unified'; // 'unified' cuando tiene datos de ambos sistemas
  
  // Información básica (unificada)
  nombre: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  
  // Información laboral (unificada)
  puesto?: string;
  departamento?: string;
  fechaAlta?: string;
  fechaBaja?: string;
  estado?: string;
  
  // Datos específicos de Orquest (fichajes, horas, incidencias)
  orquestData?: {
    id: string;
    serviceId?: string;
    datosCompletos?: any;
    updatedAt?: string;
    // Datos operacionales específicos
    fichajes?: any[];
    incidencias?: any[];
    horasTrabajadas?: number;
  };
  
  // Datos específicos de Biloop (información económica, nómina)
  biloopData?: {
    id: string;
    salary?: number;
    contractType?: string;
    socialSecurityNumber?: string;
    startDate?: string;
    endDate?: string;
    status?: 'active' | 'inactive';
    // Datos económicos específicos
    conceptosNomina?: any[];
    deducciones?: any[];
    salarioBase?: number;
  };
  
  // Indicadores de estado de vinculación
  hasOrquestData: boolean;
  hasBiloopData: boolean;
  isFullyLinked: boolean; // true cuando tiene datos de ambos sistemas
}

// Configuración de integraciones por franquiciado
export interface WorkerIntegrationConfig {
  franchiseeId: string;
  orquest?: {
    api_key: string;
    base_url: string;
    business_id: string;
    isConfigured: boolean;
  };
  biloop?: {
    company_id: string;
    isConfigured: boolean;
  };
}

// Estadísticas del panel de trabajadores
export interface WorkerStats {
  total: number;
  orquestOnly: number;
  biloopOnly: number;
  fullyLinked: number;
  byDepartment: Record<string, number>;
  byStatus: Record<string, number>;
}

// Resultado de sincronización
export interface WorkerSyncResult {
  success: boolean;
  orquestUpdated?: number;
  biloopUpdated?: number;
  newLinked?: number;
  errors?: string[];
}