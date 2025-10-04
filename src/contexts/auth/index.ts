// === AUTHENTICATION CONTEXTS ===
// Centralized exports for all authentication-related contexts

// Core authentication
export { useAuth, AuthProvider as CoreAuthProvider } from './AuthContext';

// User profile management
export { useUserProfile, UserProfileProvider } from './UserProfileContext';

// Franchisee data management
export { useFranchisee, FranchiseeProvider } from './FranchiseeContext';

// Impersonation for advisors
export { useImpersonation, ImpersonationProvider } from './ImpersonationContext';

// Combined provider (main export)
export { CombinedAuthProviders as AuthProvider } from './AuthProviders';

// Compatibility hook that combines all contexts
import { useAuth } from './AuthContext';
import { useUserProfile } from './UserProfileContext';
import { useFranchisee } from './FranchiseeContext';
import { useImpersonation } from './ImpersonationContext';

export const useUnifiedAuth = () => {
  const auth = useAuth();
  const profile = useUserProfile();
  const franchisee = useFranchisee();
  const impersonation = useImpersonation();

  // Construct user with correct role from profile
  const user = auth.user && profile.profile 
    ? { ...auth.user, role: profile.profile.role }
    : auth.user;

  return {
    // Core auth
    user,
    session: auth.session,
    loading: auth.loading || profile.loading || franchisee.loading,
    connectionStatus: auth.connectionStatus,
    
    // User profile
    profile: profile.profile,
    
    // Franchisee data
    franchisee: franchisee.franchisee,
    restaurants: franchisee.restaurants,
    
    // Impersonation
    effectiveFranchisee: impersonation.getEffectiveFranchisee(franchisee.franchisee),
    isImpersonating: impersonation.isImpersonating,
    impersonatedFranchisee: impersonation.impersonatedFranchisee,
    
    // Actions
    signIn: auth.signIn,
    signUp: auth.signUp,
    signOut: auth.signOut,
    refreshProfile: profile.refreshProfile,
    updateProfile: profile.updateProfile,
    refreshData: franchisee.refreshData,
    startImpersonation: impersonation.startImpersonation,
    stopImpersonation: impersonation.stopImpersonation,
    
    // Utilities
    getDebugInfo: auth.getDebugInfo
  };
};

// Type exports - Use the auth domain types
export type { User, AuthContextType } from '@/types/domains/auth/types';
export type { Franchisee, Restaurant } from '@/types/domains';