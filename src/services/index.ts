// Exportaciones centralizadas de todos los servicios
export { authService } from './auth/AuthService';
export { franchiseeService } from './franchisee/FranchiseeService';
export { restaurantService } from './restaurant/RestaurantService';
export { employeeService } from './employee/EmployeeService';
export { BaseService, createResponse } from './base/BaseService';
export type { ServiceResponse, PaginatedResponse } from './base/BaseService';