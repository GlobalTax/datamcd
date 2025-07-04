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
  hire_date: string;
  termination_date?: string;
  status: 'active' | 'inactive' | 'terminated' | 'suspended';
  
  // Contract information
  contract_type: 'indefinido' | 'temporal' | 'practicas' | 'becario' | 'freelance';
  contract_start_date: string;
  contract_end_date?: string;
  
  // Salary information
  base_salary?: number;
  hourly_rate?: number;
  salary_frequency?: 'mensual' | 'quincenal' | 'semanal' | 'por_horas';
  
  // Schedule and time
  weekly_hours?: number;
  schedule_type?: 'fijo' | 'variable' | 'turnos';
  
  // Vacation and time off
  vacation_days_per_year: number;
  vacation_days_used: number;
  vacation_days_pending: number;
  sick_days_used: number;
  
  // Additional information
  social_security_number?: string;
  bank_account?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
  
  created_at: string;
  updated_at: string;
  created_by?: string;
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
  overtime_hours: number;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeTimeOff {
  id: string;
  employee_id: string;
  type: 'vacaciones' | 'enfermedad' | 'personal' | 'maternidad' | 'paternidad' | 'otro';
  start_date: string;
  end_date: string;
  days_requested: number;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeePayroll {
  id: string;
  employee_id: string;
  period_start: string;
  period_end: string;
  
  // Hours worked
  regular_hours: number;
  overtime_hours: number;
  
  // Salaries
  base_pay: number;
  overtime_pay: number;
  bonuses: number;
  commissions: number;
  
  // Deductions
  social_security: number;
  income_tax: number;
  other_deductions: number;
  
  // Totals
  gross_pay: number;
  net_pay: number;
  
  status: 'draft' | 'approved' | 'paid';
  payment_date?: string;
  notes?: string;
  
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface EmployeeFormData {
  employee_number: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  position: string;
  department?: string;
  hire_date: string;
  contract_type: 'indefinido' | 'temporal' | 'practicas' | 'becario' | 'freelance';
  contract_start_date: string;
  contract_end_date?: string;
  base_salary?: number;
  hourly_rate?: number;
  salary_frequency?: 'mensual' | 'quincenal' | 'semanal' | 'por_horas';
  weekly_hours?: number;
  schedule_type?: 'fijo' | 'variable' | 'turnos';
  vacation_days_per_year?: number;
  social_security_number?: string;
  bank_account?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
}

export interface EmployeeStats {
  total_employees: number;
  active_employees: number;
  inactive_employees: number;
  total_payroll: number;
  average_salary: number;
  total_overtime_hours: number;
  pending_time_off_requests: number;
}