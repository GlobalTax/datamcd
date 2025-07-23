
import React, { createContext, useContext } from 'react';
import { useAuthState, AuthHook } from '@/hooks/auth/useAuthState';

interface AppContextType {
  auth: AuthHook;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuthState();

  const value = {
    auth
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
