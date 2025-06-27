
import React, { createContext, useContext } from 'react';
import { useRealAuth } from './useRealAuth';
import { AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    user,
    franchisee,
    restaurants,
    loading,
    error,
    session,
    signIn,
    signUp,
    signOut,
    refreshData
  } = useRealAuth();

  console.log('AuthProvider - Real auth state:', { 
    user: user ? { id: user.id, role: user.role, email: user.email } : null, 
    loading,
    error,
    hasSession: !!session
  });

  const value: AuthContextType = {
    user,
    session,
    franchisee,
    restaurants,
    loading,
    error,
    signIn,
    signUp,
    signOut
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
