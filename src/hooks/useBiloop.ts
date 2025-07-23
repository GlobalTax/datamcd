import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BiloopCompany {
  id: string;
  name: string;
  taxId: string;
  address?: string;
  city?: string;
  email?: string;
  phone?: string;
}

export interface BiloopInvoice {
  id: string;
  number: string;
  date: string;
  companyId: string;
  companyName: string;
  total: number;
  status: string;
  dueDate?: string;
}

export interface BiloopCustomer {
  id: string;
  name: string;
  taxId: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface BiloopEmployee {
  id: string;
  name: string;
  surname: string;
  nombre?: string;
  apellidos?: string;
  email?: string;
  phone?: string;
  telefono?: string;
  estado?: string;
  fechaAlta?: string;
  dni?: string;
  position?: string;
  department?: string;
  salary?: number;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'inactive';
  contractType?: string;
  socialSecurityNumber?: string;
}

export interface BiloopWorker {
  id: string;
  name: string;
  surname: string;
  email?: string;
  phone?: string;
  dni?: string;
  position?: string;
  department?: string;
  status: 'active' | 'inactive';
  contractType?: string;
  workCenter?: string;
  category?: string;
}

export interface BiloopWorkerConcept {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: string;
  amount?: number;
  percentage?: number;
  formula?: string;
}

export interface BiloopWorkCenter {
  id: string;
  code: string;
  name: string;
  address?: string;
  type: 'ET' | 'SS';
}

export interface BiloopIncidence {
  id: string;
  workerId: string;
  type: string;
  description: string;
  startDate: string;
  endDate?: string;
  status: string;
}

export interface BiloopCategory {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface BiloopConcept {
  id: string;
  code: string;
  name: string;
  type: string;
  formula?: string;
}

export interface BiloopPayslip {
  id: string;
  workerId: string;
  period: string;
  grossAmount: number;
  netAmount: number;
  deductions: number;
  concepts: any[];
}

export interface BiloopContractType {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface BiloopWorkersBreakdown {
  id: string;
  gender: string;
  category: string;
  averageSalary: number;
  count: number;
}

export interface BiloopRemuneration {
  category: string;
  amount: number;
  type: 'median' | 'average';
}

export interface BiloopCostCenter {
  id: string;
  code: string;
  description: string;
}

export interface BiloopOccupationCode {
  id: string;
  code: string;
  description: string;
}

export interface BiloopCompensation {
  id: string;
  workerId: string;
  amount: number;
  reason: string;
  date: string;
}

export interface BiloopCnae {
  id: string;
  code: string;
  description: string;
  type: 'group' | 'division' | 'activity';
}

export interface BiloopCountry {
  id: string;
  code: string;
  name: string;
}

export interface BiloopAgreement {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface BiloopEmployeeTransform {
  employees: BiloopEmployee[];
  companyId: string;
  format: 'a3nom' | 'a3eco' | 'a3';
}

export interface BiloopProfessionalPayment {
  id: string;
  professionalId: string;
  amount: number;
  date: string;
  description?: string;
  status: 'pending' | 'paid' | 'overdue';
  dueDate?: string;
}

export const useBiloop = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const callBiloopAPI = async (endpoint: string, method = 'GET', body?: any, params?: Record<string, string>, companyId?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('biloop-integration', {
        body: { endpoint, method, body, params, company_id: companyId }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Verificar si la respuesta indica un error de la API de Biloop
      if (data && typeof data === 'object' && data.status === 'KO') {
        throw new Error(data.message || 'Error en la API de Biloop');
      }

      return data;
    } catch (error) {
      console.error('Biloop API error:', error);
      toast({
        title: 'Error de conexión con Biloop',
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Método eliminado - ya no se necesita obtener lista de empresas
  // const getCompanies = async (): Promise<BiloopCompany[]> => {
  //   const data = await callBiloopAPI('/api-global/v1/companies');
  //   return data.companies || data || [];
  // };

  const getInvoices = async (companyId?: string, dateFrom?: string, dateTo?: string): Promise<BiloopInvoice[]> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;

    const data = await callBiloopAPI('/api-global/v1/invoices', 'GET', undefined, params);
    return data.invoices || data || [];
  };

  const getCustomers = async (companyId?: string): Promise<BiloopCustomer[]> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;

    const data = await callBiloopAPI('/api-global/v1/customers', 'GET', undefined, params);
    return data.customers || data || [];
  };

  const createCustomer = async (customer: Omit<BiloopCustomer, 'id'>): Promise<BiloopCustomer> => {
    const data = await callBiloopAPI('/api-global/v1/customers', 'POST', customer);
    return data;
  };

  const createInvoice = async (invoice: Omit<BiloopInvoice, 'id'>): Promise<BiloopInvoice> => {
    const data = await callBiloopAPI('/api-global/v1/invoices', 'POST', invoice);
    return data;
  };

  const getInventory = async (companyId?: string): Promise<any[]> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;

    const data = await callBiloopAPI('/api-global/v1/inventory', 'GET', undefined, params);
    return data.items || data || [];
  };

  // Métodos específicos para empleados
  const getEmployees = async (companyId: string): Promise<BiloopEmployee[]> => {
    const data = await callBiloopAPI('/api-nominas/v1/empleados', 'GET', undefined, {}, companyId);
    return data.empleados || data || [];
  };

  const createEmployee = async (employee: Omit<BiloopEmployee, 'id'>): Promise<BiloopEmployee> => {
    const data = await callBiloopAPI('/api-global/v1/employees', 'POST', employee);
    return data;
  };

  const transformEmployeesToA3 = async (transformData: BiloopEmployeeTransform): Promise<string> => {
    const endpoint = `/api-global/v1/a3/transform/employees/json-to-${transformData.format}`;
    const data = await callBiloopAPI(endpoint, 'POST', {
      employees: transformData.employees,
      companyId: transformData.companyId
    });
    
    toast({
      title: 'Transformación exitosa',
      description: `Empleados transformados a formato ${transformData.format.toUpperCase()}`,
    });
    
    return data.txtContent || data.file || data;
  };

  const getProfessionalPayments = async (
    from: string, 
    to: string, 
    companyId?: string
  ): Promise<BiloopProfessionalPayment[]> => {
    const params: Record<string, string> = { from, to };
    if (companyId) params.companyId = companyId;

    const data = await callBiloopAPI('/api-global/v1/professional_payments', 'GET', undefined, params);
    return data.payments || data || [];
  };

  const getOverduePayments = async (
    from: string, 
    to: string, 
    companyId?: string
  ): Promise<BiloopProfessionalPayment[]> => {
    const params: Record<string, string> = { from, to };
    if (companyId) params.companyId = companyId;

    const data = await callBiloopAPI('/api-global/v1/professional_overdue_payments', 'GET', undefined, params);
    return data.overduePayments || data || [];
  };

  const getMovements = async (
    from: string,
    to: string,
    companyId?: string
  ): Promise<any[]> => {
    const params: Record<string, string> = { from, to };
    if (companyId) params.companyId = companyId;

    const data = await callBiloopAPI('/api-global/v1/movements', 'GET', undefined, params);
    return data.movements || data || [];
  };

  const transformMovementsToA3ECO = async (movements: any[], companyId: string): Promise<string> => {
    const data = await callBiloopAPI('/api-global/v1/a3/transform/movements/json-to-a3eco', 'POST', {
      movements,
      companyId
    });
    
    toast({
      title: 'Transformación exitosa',
      description: 'Movimientos transformados a formato A3ECO',
    });
    
    return data.txtContent || data.file || data;
  };

  // Métodos específicos para trabajadores (labor)
  const getWorkers = async (companyId: string): Promise<BiloopWorker[]> => {
    const data = await callBiloopAPI('/api-nominas/v1/trabajadores', 'GET', undefined, {}, companyId);
    return data.trabajadores || data || [];
  };

  const getWorkersConcepts = async (companyId: string): Promise<BiloopWorkerConcept[]> => {
    const data = await callBiloopAPI('/api-nominas/v1/trabajadores/conceptos', 'GET', undefined, {}, companyId);
    return data.conceptos || data || [];
  };

  // Centros de trabajo  
  const getWorkCentersET = async (companyId: string): Promise<BiloopWorkCenter[]> => {
    const data = await callBiloopAPI('/api-nominas/v1/centros-et', 'GET', undefined, {}, companyId);
    return data.centros || data || [];
  };

  const getWorkCentersSS = async (companyId: string): Promise<BiloopWorkCenter[]> => {
    const data = await callBiloopAPI('/api-nominas/v1/centros-ss', 'GET', undefined, {}, companyId);
    return data.centros || data || [];
  };

  const getOccupationalCategories = async (companyId: string): Promise<BiloopCategory[]> => {
    const data = await callBiloopAPI('/api-nominas/v1/categorias-laborales', 'GET', undefined, {}, companyId);
    return data.categorias || data || [];
  };

  const getProfessionalOccupations = async (companyId: string): Promise<any[]> => {
    const data = await callBiloopAPI('/api-nominas/v1/ocupaciones-profesionales', 'GET', undefined, {}, companyId);
    return data.ocupaciones || data || [];
  };

  const getRemunerations = async (companyId: string): Promise<BiloopRemuneration[]> => {
    const data = await callBiloopAPI('/api-nominas/v1/remuneraciones', 'GET', undefined, {}, companyId);
    return data.remuneraciones || data || [];
  };

  const getCosts = async (companyId: string): Promise<any[]> => {
    const data = await callBiloopAPI('/api-nominas/v1/costes', 'GET', undefined, {}, companyId);
    return data.costes || data || [];
  };

  // Incidencias y categorías
  const getIncidences = async (companyId: string): Promise<BiloopIncidence[]> => {
    const data = await callBiloopAPI('/api-nominas/v1/incidencias', 'GET', undefined, {}, companyId);
    return data.incidencias || data || [];
  };

  const getIncidenceCauses = async (companyId: string): Promise<any[]> => {
    const data = await callBiloopAPI('/api-nominas/v1/causas-incidencias', 'GET', undefined, {}, companyId);
    return data.causas || data || [];
  };

  const getCategories = async (companyId?: string): Promise<BiloopCategory[]> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;
    const data = await callBiloopAPI('/api-global/v1/labor/getCategories', 'GET', undefined, params);
    return data.categories || data || [];
  };

  const getConcepts = async (companyId?: string): Promise<BiloopConcept[]> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;
    const data = await callBiloopAPI('/api-global/v1/labor/getConcepts', 'GET', undefined, params);
    return data.concepts || data || [];
  };

  // Nóminas
  const getPayrollConceptsMonthBi = async (companyId?: string, month?: string): Promise<any[]> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;
    if (month) params.month = month;
    const data = await callBiloopAPI('/api-global/v1/labor/getPayrollConceptsMonthBi', 'GET', undefined, params);
    return data.payrolls || data || [];
  };

  const getPayslips = async (companyId: string): Promise<BiloopPayslip[]> => {
    const data = await callBiloopAPI('/api-nominas/v1/nominas', 'GET', undefined, {}, companyId);
    return data.nominas || data || [];
  };

  const getAnonymousPayslips = async (companyId?: string): Promise<BiloopPayslip[]> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;
    const data = await callBiloopAPI('/api-global/v1/labor/getAnonymousPayslips', 'GET', undefined, params);
    return data.payslips || data || [];
  };

  const getSummaryPayslips = async (companyId?: string): Promise<any[]> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;
    const data = await callBiloopAPI('/api-global/v1/labor/getSummaryPayslips', 'GET', undefined, params);
    return data.summary || data || [];
  };

  const getPayslipsDetails = async (companyId?: string): Promise<any[]> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;
    const data = await callBiloopAPI('/api-global/v1/labor/getPayslipsDetails', 'GET', undefined, params);
    return data.details || data || [];
  };

  const getPayslipsFile = async (companyId?: string, workerId?: string): Promise<any> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;
    if (workerId) params.workerId = workerId;
    const data = await callBiloopAPI('/api-global/v1/labor/getPayslipsFile', 'GET', undefined, params);
    return data;
  };

  // Contratos y clasificaciones
  const getContractTypes = async (companyId: string): Promise<BiloopContractType[]> => {
    const data = await callBiloopAPI('/api-nominas/v1/tipos-contrato', 'GET', undefined, {}, companyId);
    return data.tipos || data || [];
  };

  const getContractExpirations = async (companyId: string): Promise<any[]> => {
    const data = await callBiloopAPI('/api-nominas/v1/vencimientos-contratos', 'GET', undefined, {}, companyId);
    return data.vencimientos || data || [];
  };

  const getWorkersBreakdown = async (companyId?: string): Promise<BiloopWorkersBreakdown[]> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;
    const data = await callBiloopAPI('/api-global/v1/labor/getWorkersBreakdown', 'GET', undefined, params);
    return data.breakdown || data || [];
  };

  const getMediumRemunerations = async (companyId?: string): Promise<BiloopRemuneration[]> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;
    const data = await callBiloopAPI('/api-global/v1/labor/getMediumRemunerations', 'GET', undefined, params);
    return data.remunerations || data || [];
  };

  const getAverageRemunerations = async (companyId?: string): Promise<BiloopRemuneration[]> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;
    const data = await callBiloopAPI('/api-global/v1/labor/getAverageRemunerations', 'GET', undefined, params);
    return data.remunerations || data || [];
  };

  // Centros de coste y ocupación
  const getCostCenters = async (companyId?: string): Promise<BiloopCostCenter[]> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;
    const data = await callBiloopAPI('/api-global/v1/labor/getCostCenters', 'GET', undefined, params);
    return data.costCenters || data || [];
  };

  const getCostAllocation = async (companyId?: string): Promise<any[]> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;
    const data = await callBiloopAPI('/api-global/v1/labor/getCostAllocation', 'GET', undefined, params);
    return data.allocation || data || [];
  };

  const getOccupationCodes = async (companyId?: string): Promise<BiloopOccupationCode[]> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;
    const data = await callBiloopAPI('/api-global/v1/labor/getOccupationCodes', 'GET', undefined, params);
    return data.codes || data || [];
  };

  const getWorkersCompensation = async (companyId?: string): Promise<BiloopCompensation[]> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;
    const data = await callBiloopAPI('/api-global/v1/labor/getWorkersCompensation', 'GET', undefined, params);
    return data.compensations || data || [];
  };

  // CNAE y clasificaciones
  const getCnaeGroups = async (): Promise<BiloopCnae[]> => {
    const data = await callBiloopAPI('/api-global/v1/labor/getCnaeGroups');
    return data.groups || data || [];
  };

  const getCnaeDivisions = async (): Promise<BiloopCnae[]> => {
    const data = await callBiloopAPI('/api-global/v1/labor/getCnaeDivisions');
    return data.divisions || data || [];
  };

  const getCompaniesCnae = async (companyId?: string): Promise<BiloopCnae[]> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;
    const data = await callBiloopAPI('/api-global/v1/labor/getCompaniesCnae', 'GET', undefined, params);
    return data.cnae || data || [];
  };

  const getCnaeActivities = async (): Promise<BiloopCnae[]> => {
    const data = await callBiloopAPI('/api-global/v1/labor/getCnaeActivities');
    return data.activities || data || [];
  };

  // Países y convenios
  const getCountries = async (): Promise<BiloopCountry[]> => {
    const data = await callBiloopAPI('/api-global/v1/labor/getCountries');
    return data.countries || data || [];
  };

  const getAgreements = async (companyId?: string): Promise<BiloopAgreement[]> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;
    const data = await callBiloopAPI('/api-global/v1/labor/getAgreements', 'GET', undefined, params);
    return data.agreements || data || [];
  };

  // Métodos adicionales de labor (más endpoints)
  const getDischargeItReasons = async (): Promise<any[]> => {
    const data = await callBiloopAPI('/api-global/v1/labor/getDischargeItReasons');
    return data.reasons || data || [];
  };

  const getWorkersContractsExpiration = async (companyId?: string): Promise<any[]> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;
    const data = await callBiloopAPI('/api-global/v1/labor/getWorkersContractsExpiration', 'GET', undefined, params);
    return data.expirations || data || [];
  };

  // Métodos adicionales de labor - Continuación con los endpoints restantes
  const getDischargeWorkerCauses = async (): Promise<any[]> => {
    const data = await callBiloopAPI('/api-global/v1/labor/getDischargeWorkerCauses');
    return data.causes || data || [];
  };

  const getIrpfKeys = async (): Promise<any[]> => {
    const data = await callBiloopAPI('/api-global/v1/labor/getIrpfKeys');
    return data.keys || data || [];
  };

  const getTaxations = async (): Promise<any[]> => {
    const data = await callBiloopAPI('/api-global/v1/labor/getTaxations');
    return data.taxations || data || [];
  };

  const getTaxationTypes = async (): Promise<any[]> => {
    const data = await callBiloopAPI('/api-global/v1/labor/getTaxationTypes');
    return data.types || data || [];
  };

  const getRateGroups = async (): Promise<any[]> => {
    const data = await callBiloopAPI('/api-global/v1/labor/getRateGroups');
    return data.groups || data || [];
  };

  const getContributionTypes = async (): Promise<any[]> => {
    const data = await callBiloopAPI('/api-global/v1/labor/getContributionTypes');
    return data.types || data || [];
  };

  const getEmploymentRelationshipSpecialCharacters = async (): Promise<any[]> => {
    const data = await callBiloopAPI('/api-global/v1/labor/getEmploymentRelationshipSpecialCharacters');
    return data.characters || data || [];
  };

  const getReplacementCauses = async (): Promise<any[]> => {
    const data = await callBiloopAPI('/api-global/v1/labor/getReplacementCauses');
    return data.causes || data || [];
  };

  const getSocialExclusionsDomesticViolence = async (): Promise<any[]> => {
    const data = await callBiloopAPI('/api-global/v1/labor/getSocialExclusionsDomesticViolence');
    return data.exclusions || data || [];
  };

  const getReincorporatedWomen = async (): Promise<any[]> => {
    const data = await callBiloopAPI('/api-global/v1/labor/getReincorporatedWomen');
    return data.women || data || [];
  };

  const getRoadTypes = async (): Promise<any[]> => {
    const data = await callBiloopAPI('/api-global/v1/labor/getRoadTypes');
    return data.types || data || [];
  };

  const getReductionWorkingHourBonuses = async (): Promise<any[]> => {
    const data = await callBiloopAPI('/api-global/v1/labor/getReductionWorkingHourBonuses');
    return data.bonuses || data || [];
  };

  const getDischargeCauses = async (): Promise<any[]> => {
    const data = await callBiloopAPI('/api-global/v1/labor/getDischargeCauses');
    return data.causes || data || [];
  };

  const getWorkerOccupationCodes = async (companyId?: string): Promise<any[]> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;
    const data = await callBiloopAPI('/api-global/v1/labor/getWorkerOccupationCodes', 'GET', undefined, params);
    return data.codes || data || [];
  };

  const getTrainingLevels = async (): Promise<any[]> => {
    const data = await callBiloopAPI('/api-global/v1/labor/getTrainingLevels');
    return data.levels || data || [];
  };

  const getWorkerProvinces = async (): Promise<any[]> => {
    const data = await callBiloopAPI('/api-global/v1/labor/getWorkerProvinces');
    return data.provinces || data || [];
  };

  const getUnemployedContractSubsidies = async (): Promise<any[]> => {
    const data = await callBiloopAPI('/api-global/v1/labor/getUnemployedContractSubsidies');
    return data.subsidies || data || [];
  };

  const getMunicipalities = async (): Promise<any[]> => {
    const data = await callBiloopAPI('/api-global/v1/labor/getMunicipalities');
    return data.municipalities || data || [];
  };

  const getContractBonusExclusionContributions = async (): Promise<any[]> => {
    const data = await callBiloopAPI('/api-global/v1/labor/getContractBonusExclusionContributions');
    return data.exclusions || data || [];
  };

  const getCtelWorkers = async (companyId?: string): Promise<any[]> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;
    const data = await callBiloopAPI('/api-global/v1/labor/getCtelWorkers', 'GET', undefined, params);
    return data.workers || data || [];
  };

  const getNameBonuses = async (): Promise<any[]> => {
    const data = await callBiloopAPI('/api-global/v1/labor/getNameBonuses');
    return data.bonuses || data || [];
  };

  const getAcademicQualifications = async (): Promise<any[]> => {
    const data = await callBiloopAPI('/api-global/v1/labor/getAcademicQualifications');
    return data.qualifications || data || [];
  };

  const getCollectives = async (): Promise<any[]> => {
    const data = await callBiloopAPI('/api-global/v1/labor/getCollectives');
    return data.collectives || data || [];
  };

  const getCostImputation = async (companyId?: string): Promise<any[]> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;
    const data = await callBiloopAPI('/api-global/v1/labor/getCostImputation', 'GET', undefined, params);
    return data.imputation || data || [];
  };

  const getCostEmployees = async (companyId?: string): Promise<any[]> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;
    const data = await callBiloopAPI('/api-global/v1/labor/getCostEmployees', 'GET', undefined, params);
    return data.costs || data || [];
  };

  const getPayrollsCostsImputation = async (companyId?: string): Promise<any[]> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;
    const data = await callBiloopAPI('/api-global/v1/labor/getPayrollsCostsImputation', 'GET', undefined, params);
    return data.costs || data || [];
  };

  const getLeaveReasons = async (): Promise<any[]> => {
    const data = await callBiloopAPI('/api-global/v1/labor/getLeaveReasons');
    return data.reasons || data || [];
  };

  const getWorkerDetails = async (companyId?: string, workerId?: string): Promise<any[]> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;
    if (workerId) params.workerId = workerId;
    const data = await callBiloopAPI('/api-global/v1/labor/getWorkerDetails', 'GET', undefined, params);
    return data.details || data || [];
  };

  const getPayrollConcepts = async (companyId?: string): Promise<any[]> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;
    const data = await callBiloopAPI('/api-global/v1/labor/getPayrollConcepts', 'GET', undefined, params);
    return data.concepts || data || [];
  };

  const getPayrollCosts = async (companyId?: string): Promise<any[]> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;
    const data = await callBiloopAPI('/api-global/v1/labor/getPayrollCosts', 'GET', undefined, params);
    return data.costs || data || [];
  };

  const getRegisterConcepts = async (companyId?: string): Promise<any[]> => {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;
    const data = await callBiloopAPI('/api-global/v1/labor/getRegisterConcepts', 'GET', undefined, params);
    return data.concepts || data || [];
  };

  const testConnection = async (): Promise<boolean> => {
    try {
      // Probar conexión básica con el endpoint de empresas
      const data = await callBiloopAPI('/api-global/v1/companies');
      toast({
        title: 'Conexión exitosa',
        description: 'Conectado correctamente a Biloop',
      });
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      toast({
        title: 'Error de conexión',
        description: 'No se pudo conectar a Biloop. Verifica las credenciales y endpoints.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    loading,
    // Métodos generales (getCompanies eliminado)
    getInvoices,
    getCustomers,
    createCustomer,
    createInvoice,
    getInventory,
    testConnection,
    callBiloopAPI,
    
    // Métodos específicos para empleados
    getEmployees,
    createEmployee,
    transformEmployeesToA3,
    getProfessionalPayments,
    getOverduePayments,
    getMovements,
    transformMovementsToA3ECO,
    
    // Métodos específicos para trabajadores (labor)
    getWorkers,
    getWorkersConcepts,
    getWorkCentersET,
    getWorkCentersSS,
    getIncidences,
    getIncidenceCauses,
    getOccupationalCategories,
    getProfessionalOccupations,
    getRemunerations,
    getCosts,
    getContractExpirations,
    getCategories,
    getConcepts,
    getPayrollConceptsMonthBi,
    getPayslips,
    getAnonymousPayslips,
    getSummaryPayslips,
    getPayslipsDetails,
    getPayslipsFile,
    getContractTypes,
    getWorkersBreakdown,
    getMediumRemunerations,
    getAverageRemunerations,
    getCostCenters,
    getCostAllocation,
    getOccupationCodes,
    getWorkersCompensation,
    getCnaeGroups,
    getCnaeDivisions,
    getCompaniesCnae,
    getCnaeActivities,
    getCountries,
    getAgreements,
    getDischargeItReasons,
    getWorkersContractsExpiration,
    getDischargeWorkerCauses,
    getIrpfKeys,
    getTaxations,
    getTaxationTypes,
    getRateGroups,
    getContributionTypes,
    getEmploymentRelationshipSpecialCharacters,
    getReplacementCauses,
    getSocialExclusionsDomesticViolence,
    getReincorporatedWomen,
    getRoadTypes,
    getReductionWorkingHourBonuses,
    getDischargeCauses,
    getWorkerOccupationCodes,
    getTrainingLevels,
    getWorkerProvinces,
    getUnemployedContractSubsidies,
    getMunicipalities,
    getContractBonusExclusionContributions,
    getCtelWorkers,
    getNameBonuses,
    getAcademicQualifications,
    getCollectives,
    getCostImputation,
    getCostEmployees,
    getPayrollsCostsImputation,
    getLeaveReasons,
    getWorkerDetails,
    getPayrollConcepts,
    getPayrollCosts,
    getRegisterConcepts,
  };
};