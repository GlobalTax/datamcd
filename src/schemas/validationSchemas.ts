
import { z } from 'zod';

// Schema para datos de valoración
export const valuationInputsSchema = z.object({
  sales: z.number().min(0, 'Las ventas deben ser un número positivo'),
  pac: z.number().min(0, 'PAC debe ser un número positivo'),
  rent: z.number().min(0, 'La renta debe ser un número positivo'),
  serviceFees: z.number().min(0, 'Las comisiones deben ser un número positivo'),
  depreciation: z.number().min(0, 'La depreciación debe ser un número positivo'),
  interest: z.number().min(0, 'Los intereses deben ser un número positivo'),
  rentIndex: z.number().min(0, 'El índice de renta debe ser un número positivo'),
  miscell: z.number().min(0, 'Los gastos varios deben ser un número positivo'),
  loanPayment: z.number().min(0, 'El pago del préstamo debe ser un número positivo'),
  inflationRate: z.number().min(0).max(100, 'La tasa de inflación debe estar entre 0 y 100'),
  discountRate: z.number().min(0).max(100, 'La tasa de descuento debe estar entre 0 y 100'),
  growthRate: z.number().min(-100).max(100, 'La tasa de crecimiento debe estar entre -100 y 100'),
  changeDate: z.string().min(1, 'La fecha de cambio es requerida'),
  franchiseEndDate: z.string().min(1, 'La fecha de fin de franquicia es requerida'),
  remainingYears: z.number().min(0, 'Los años restantes deben ser un número positivo')
});

// Schema para datos de restaurante
export const restaurantSchema = z.object({
  site_number: z.string().min(1, 'El número de sitio es requerido'),
  restaurant_name: z.string().min(1, 'El nombre del restaurante es requerido'),
  address: z.string().min(1, 'La dirección es requerida'),
  city: z.string().min(1, 'La ciudad es requerida'),
  country: z.string().min(1, 'El país es requerido'),
  restaurant_type: z.enum(['traditional', 'drive_thru', 'express', 'mccafe'], {
    errorMap: () => ({ message: 'Tipo de restaurante inválido' })
  }),
  opening_date: z.string().optional(),
  square_meters: z.number().min(0, 'Los metros cuadrados deben ser positivos').optional(),
  seating_capacity: z.number().min(0, 'La capacidad debe ser positiva').optional()
});

// Schema para datos de franquiciado
export const franchiseeSchema = z.object({
  franchisee_name: z.string().min(1, 'El nombre del franquiciado es requerido'),
  company_name: z.string().optional(),
  tax_id: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().default('España')
});

// Schema para datos de presupuesto
export const budgetSchema = z.object({
  budget_name: z.string().min(1, 'El nombre del presupuesto es requerido'),
  budget_year: z.number().min(2020).max(2030, 'Año inválido'),
  initial_sales: z.number().min(0, 'Las ventas iniciales deben ser positivas'),
  sales_growth_rate: z.number().min(-100).max(100, 'Tasa de crecimiento inválida'),
  inflation_rate: z.number().min(0).max(100, 'Tasa de inflación inválida'),
  discount_rate: z.number().min(0).max(100, 'Tasa de descuento inválida'),
  years_projection: z.number().min(1).max(20, 'Años de proyección entre 1 y 20'),
  pac_percentage: z.number().min(0).max(100, 'Porcentaje PAC inválido'),
  rent_percentage: z.number().min(0).max(100, 'Porcentaje de renta inválido'),
  service_fees_percentage: z.number().min(0).max(100, 'Porcentaje de comisiones inválido'),
  depreciation: z.number().min(0, 'La depreciación debe ser positiva'),
  interest: z.number().min(0, 'Los intereses deben ser positivos'),
  loan_payment: z.number().min(0, 'El pago del préstamo debe ser positivo'),
  rent_index: z.number().min(0, 'El índice de renta debe ser positivo'),
  miscellaneous: z.number().min(0, 'Los gastos varios deben ser positivos')
});

// Schema para login
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});

// Schema para registro
export const signupSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirma tu contraseña'),
  full_name: z.string().min(1, 'El nombre completo es requerido')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
});

export type ValuationInputsType = z.infer<typeof valuationInputsSchema>;
export type RestaurantType = z.infer<typeof restaurantSchema>;
export type FranchiseeType = z.infer<typeof franchiseeSchema>;
export type BudgetType = z.infer<typeof budgetSchema>;
export type LoginType = z.infer<typeof loginSchema>;
export type SignupType = z.infer<typeof signupSchema>;
