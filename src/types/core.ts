// === CENTRAL TYPE DEFINITIONS ===
// Re-exports from domain-organized type system
export type {
  // Authentication domain
  User,
  AuthContextType,
  UserProfile,
  Profile,
  AuthSession,
  PasswordValidation
} from './domains/auth/types';

export type {
  // Franchisee domain  
  Franchisee,
  FranchiseeStaff
} from './domains/franchisee';

export type {
  // Restaurant domain
  Restaurant,
  BaseRestaurant,
  FranchiseeRestaurant
} from './domains/restaurant';

export type {
  // Employee domain
  Employee
} from './domains/employee';

// === COMPATIBILITY RE-EXPORTS ===
// Maintain backward compatibility while migrating to domain structure
export type {
  // Legacy compatibility
  FranchiseeInvitation,
  FranchiseeAccessLog,
  FranchiseeActivityLog
} from './franchiseeInvitation';