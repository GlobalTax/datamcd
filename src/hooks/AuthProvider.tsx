
import React, { createContext, useContext } from 'react';
import { useUnifiedAuth } from './useUnifiedAuth';
import { AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const authData = useUnifiedAuth();

  console.log('AuthProvider - Current state:', { 
    user: authData.user ? { id: authData.user.id, role: authData.user.role } : null, 
    loading: authData.loading,
    connectionStatus: authData.connectionStatus
  });

  const value: AuthContextType = {
    user: authData.user,
    session: undefined, // No necesitamos session en el nuevo sistema
    franchisee: authData.franchisee,
    restaurants: authData.restaurants,
    loading: authData.loading,
    signIn: authData.signIn,
    signUp: authData.signUp,
    signOut: authData.signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
