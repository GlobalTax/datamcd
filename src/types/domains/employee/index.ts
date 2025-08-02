// === DOMINIO: EMPLEADOS ===
// Tipos relacionados con empleados, nóminas y tiempo

export interface Employee {
  id: string;
  restaurant_id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  position: string;
  department?: string;
  status: 'active' | 'inactive' | 'terminated';
  hire_date: string;
  contract_start_date: string;
  contract_end_date?: string;
  termination_date?: string;
  contract_type: string;
  hourly_rate?: number;
  base_salary?: number;
  weekly_hours?: number;
  salary_frequency?: string;
  schedule_type?: string;
  social_security_number?: string;
  bank_account?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  vacation_days_per_year?: number;
  vacation_days_used?: number;
  vacation_days_pending?: number;
  sick_days_used?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface EmployeePayroll {
  id: string;
  employee_id: string;
  period_start: string;
  period_end: string;
  payment_date?: string;
  base_pay?: number;
  overtime_pay?: number;
  bonuses?: number;
  commissions?: number;
  gross_pay: number;
  income_tax?: number;
  social_security?: number;
  other_deductions?: number;
  net_pay: number;
  regular_hours?: number;
  overtime_hours?: number;
  status?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface EmployeeTimeOff {
  id: string;
  employee_id: string;
  type: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  status?: string;
  reason?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeTimeTracking {
  id: string;
  employee_id: string;
  date: string;
  clock_in?: string;
  clock_out?: string;
  break_start?: string;
  break_end?: string;
  total_hours?: number;
  overtime_hours?: number;
  status?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Worker types (para integración con sistemas externos)
export interface Worker {
  id: string;
  employee_id?: string;
  external_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  position: string;
  department?: string;
  hire_date: string;
  status: 'active' | 'inactive' | 'terminated';
  hourly_rate?: number;
  weekly_hours?: number;
  restaurant_id: string;
  created_at: string;
  updated_at: string;
}

// Métricas de empleados
export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  newHiresThisMonth: number;
  terminationsThisMonth: number;
  averageHourlyRate: number;
  totalPayrollCost: number;
  departments: {
    [key: string]: number;
  };
  positions: {
    [key: string]: number;
  };
}

// Props para componentes
export interface EmployeeFormProps {
  employee?: Employee;
  restaurantId: string;
  onSave: (employee: Partial<Employee>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface EmployeeListProps {
  restaurantId?: string;
  onEmployeeSelect?: (employee: Employee) => void;
  showActions?: boolean;
  filters?: EmployeeFilters;
}

export interface EmployeeFilters {
  search?: string;
  status?: string[];
  department?: string[];
  position?: string[];
  hireDateFrom?: string;
  hireDateTo?: string;
}

export interface EmployeeEditDialogProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Partial<Employee>) => Promise<void>;
}

export interface EmployeeDeleteDialogProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export interface PayrollViewProps {
  restaurantId?: string;
  employeeId?: string;
  periodStart?: string;
  periodEnd?: string;
}

export interface TimeOffViewProps {
  restaurantId?: string;
  employeeId?: string;
  status?: string;
}

export interface TimeTrackingViewProps {
  restaurantId?: string;
  employeeId?: string;
  dateFrom?: string;
  dateTo?: string;
}