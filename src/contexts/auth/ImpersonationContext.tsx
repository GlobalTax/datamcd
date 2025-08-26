import React, { createContext, useContext, useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { useUserProfile } from './UserProfileContext';
import type { Franchisee } from '@/types/domains';

interface ImpersonationContextType {
  impersonatedFranchisee: Franchisee | null;
  isImpersonating: boolean;
  startImpersonation: (franchisee: Franchisee) => void;
  stopImpersonation: () => void;
  getEffectiveFranchisee: (userFranchisee?: Franchisee | null) => Franchisee | null;
}

const ImpersonationContext = createContext<ImpersonationContextType | undefined>(undefined);

export const useImpersonation = () => {
  const context = useContext(ImpersonationContext);
  if (context === undefined) {
    throw new Error('useImpersonation must be used within an ImpersonationProvider');
  }
  return context;
};

interface ImpersonationProviderProps {
  children: React.ReactNode;
}

const IMPERSONATION_KEY = 'advisor_impersonation';
const EXPIRY_TIME = 8 * 60 * 60 * 1000; // 8 hours in milliseconds

export const ImpersonationProvider: React.FC<ImpersonationProviderProps> = ({ children }) => {
  const { profile } = useUserProfile();
  const [impersonatedFranchisee, setImpersonatedFranchisee] = useState<Franchisee | null>(null);

  const isImpersonating = impersonatedFranchisee !== null;

  // Load impersonation state from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(IMPERSONATION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Check if not expired
        if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
          logger.info('Restored impersonation session', { 
            franchiseeId: parsed.franchisee.id,
            expiresAt: new Date(parsed.expiresAt)
          });
          setImpersonatedFranchisee(parsed.franchisee);
        } else {
          // Clean up expired session
          sessionStorage.removeItem(IMPERSONATION_KEY);
          logger.info('Removed expired impersonation session');
        }
      }
    } catch (error) {
      logger.error('Error loading impersonation state', { error });
      sessionStorage.removeItem(IMPERSONATION_KEY);
    }
  }, []);

  const startImpersonation = (franchisee: Franchisee) => {
    // Only allow advisors to impersonate
    if (profile?.role !== 'asesor' && profile?.role !== 'admin' && profile?.role !== 'superadmin') {
      logger.warn('Unauthorized impersonation attempt', { 
        userRole: profile?.role,
        userId: profile?.id 
      });
      return;
    }

    logger.info('Starting impersonation', { 
      advisorId: profile.id,
      franchiseeId: franchisee.id,
      franchiseeName: franchisee.franchisee_name
    });

    const impersonationData = {
      franchisee,
      startedAt: Date.now(),
      expiresAt: Date.now() + EXPIRY_TIME,
      advisorId: profile.id
    };

    try {
      sessionStorage.setItem(IMPERSONATION_KEY, JSON.stringify(impersonationData));
      setImpersonatedFranchisee(franchisee);
      
      // Log audit trail
      logger.info('Impersonation started', {
        action: 'impersonation_start',
        advisorId: profile.id,
        franchiseeId: franchisee.id,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error starting impersonation', { error });
    }
  };

  const stopImpersonation = () => {
    if (!isImpersonating) return;

    logger.info('Stopping impersonation', { 
      advisorId: profile?.id,
      franchiseeId: impersonatedFranchisee?.id 
    });

    try {
      sessionStorage.removeItem(IMPERSONATION_KEY);
      setImpersonatedFranchisee(null);
      
      // Log audit trail
      logger.info('Impersonation stopped', {
        action: 'impersonation_stop',
        advisorId: profile?.id,
        franchiseeId: impersonatedFranchisee?.id,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error stopping impersonation', { error });
    }
  };

  const getEffectiveFranchisee = (userFranchisee?: Franchisee | null): Franchisee | null => {
    // If impersonating, return the impersonated franchisee
    if (isImpersonating) {
      return impersonatedFranchisee;
    }
    
    // Otherwise return the user's actual franchisee
    return userFranchisee || null;
  };

  // Auto-cleanup expired sessions
  useEffect(() => {
    if (isImpersonating) {
      const cleanup = setTimeout(() => {
        try {
          const stored = sessionStorage.getItem(IMPERSONATION_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.expiresAt && Date.now() >= parsed.expiresAt) {
              logger.info('Impersonation session expired, cleaning up');
              stopImpersonation();
            }
          }
        } catch (error) {
          logger.error('Error checking impersonation expiry', { error });
        }
      }, 60000); // Check every minute

      return () => clearTimeout(cleanup);
    }
  }, [isImpersonating]);

  const value: ImpersonationContextType = {
    impersonatedFranchisee,
    isImpersonating,
    startImpersonation,
    stopImpersonation,
    getEffectiveFranchisee
  };

  return (
    <ImpersonationContext.Provider value={value}>
      {children}
    </ImpersonationContext.Provider>
  );
};
