import React from 'react';
import { AuthProvider } from './AuthContext';
import { UserProfileProvider } from './UserProfileContext';
import { FranchiseeProvider } from './FranchiseeContext';
import { ImpersonationProvider } from './ImpersonationContext';

interface CombinedAuthProvidersProps {
  children: React.ReactNode;
}

/**
 * Combined provider that wraps all auth-related contexts in the correct order.
 * This maintains the same functionality as the original AuthProvider while
 * separating concerns into focused contexts.
 */
export const CombinedAuthProviders: React.FC<CombinedAuthProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      <UserProfileProvider>
        <FranchiseeProvider>
          <ImpersonationProvider>
            {children}
          </ImpersonationProvider>
        </FranchiseeProvider>
      </UserProfileProvider>
    </AuthProvider>
  );
};

// Compatibility export
export { CombinedAuthProviders as AuthProvider };