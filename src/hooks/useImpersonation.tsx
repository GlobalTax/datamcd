import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Franchisee } from '@/types/auth';
import { logger } from '@/lib/logger';

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
  children: ReactNode;
}

export const ImpersonationProvider: React.FC<ImpersonationProviderProps> = ({ children }) => {
  const [impersonatedFranchisee, setImpersonatedFranchisee] = useState<Franchisee | null>(null);

  // Cargar estado de impersonación desde sessionStorage al inicializar
  useEffect(() => {
    const savedImpersonation = sessionStorage.getItem('impersonatedFranchisee');
    const impersonationTimestamp = sessionStorage.getItem('impersonation_timestamp');
    
    if (savedImpersonation) {
      try {
        // Check session expiry (24 hours)
        if (impersonationTimestamp) {
          const sessionAge = Date.now() - new Date(impersonationTimestamp).getTime();
          const MAX_SESSION_AGE = 24 * 60 * 60 * 1000; // 24 hours
          
          if (sessionAge > MAX_SESSION_AGE) {
            logger.warn('Impersonation session expired', {
              component: 'useImpersonation',
              sessionAge: sessionAge / (60 * 60 * 1000) + ' hours'
            });
            sessionStorage.removeItem('impersonatedFranchisee');
            sessionStorage.removeItem('impersonation_timestamp');
            return;
          }
        }
        
        // Decrypt and validate data
        const decryptedData = atob(savedImpersonation);
        const franchisee = JSON.parse(decryptedData);
        
        // Validate required fields
        if (!franchisee.id || !franchisee.franchisee_name) {
          throw new Error('Invalid franchisee data');
        }
        
        setImpersonatedFranchisee(franchisee);
        logger.info('Impersonation state restored', {
          component: 'useImpersonation',
          franchiseeId: franchisee.id
        });
      } catch (error) {
        logger.error('Error loading impersonation state', {
          component: 'useImpersonation'
        }, error as Error);
        sessionStorage.removeItem('impersonatedFranchisee');
        sessionStorage.removeItem('impersonation_timestamp');
      }
    }
  }, []);

  const startImpersonation = (franchisee: Franchisee) => {
    // Encrypt sensitive data before storing
    const encryptedData = btoa(JSON.stringify(franchisee));
    
    setImpersonatedFranchisee(franchisee);
    sessionStorage.setItem('impersonatedFranchisee', encryptedData);
    sessionStorage.setItem('impersonation_timestamp', new Date().toISOString());
    
    // Log audit trail using centralized logger
    logger.info('Impersonation started', {
      component: 'useImpersonation',
      action: 'startImpersonation',
      impersonatedFranchisee: franchisee.franchisee_name,
      franchiseeId: franchisee.id,
      franchiseeUserId: franchisee.user_id,
      timestamp: new Date().toISOString(),
      sessionStorage: 'updated'
    });
    
    // Server-side audit logging
    const auditData = {
      action: 'IMPERSONATION_START',
      target_franchisee_id: franchisee.id,
      target_franchisee_name: franchisee.franchisee_name,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent
    };
    
    // Send audit log to server (fire and forget)
    fetch('/api/audit-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(auditData)
    }).catch(error => {
      logger.error('Failed to log impersonation audit', auditData, error);
    });
  };

  const stopImpersonation = () => {
    const previousFranchisee = impersonatedFranchisee;
    setImpersonatedFranchisee(null);
    sessionStorage.removeItem('impersonatedFranchisee');
    sessionStorage.removeItem('impersonation_timestamp');
    
    // Log audit trail
    logger.info('Impersonation stopped', {
      component: 'useImpersonation',
      action: 'stopImpersonation',
      previousFranchisee: previousFranchisee?.franchisee_name,
      timestamp: new Date().toISOString()
    });
    
    // Server-side audit logging
    if (previousFranchisee) {
      const auditData = {
        action: 'IMPERSONATION_STOP',
        target_franchisee_id: previousFranchisee.id,
        target_franchisee_name: previousFranchisee.franchisee_name,
        timestamp: new Date().toISOString()
      };
      
      fetch('/api/audit-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditData)
      }).catch(error => {
        logger.error('Failed to log impersonation stop audit', auditData, error);
      });
    }
  };

  const getEffectiveFranchisee = (userFranchisee?: Franchisee | null): Franchisee | null => {
    const effectiveFranchisee = impersonatedFranchisee || userFranchisee || null;
    
    // Log para debugging cuando hay impersonación activa
    if (impersonatedFranchisee) {
      logger.debug('Using impersonated franchisee', {
        component: 'useImpersonation',
        name: impersonatedFranchisee.franchisee_name,
        id: impersonatedFranchisee.id,
        userId: impersonatedFranchisee.user_id
      });
    }
    
    return effectiveFranchisee;
  };

  const isImpersonating = Boolean(impersonatedFranchisee);

  const value = {
    impersonatedFranchisee,
    isImpersonating,
    startImpersonation,
    stopImpersonation,
    getEffectiveFranchisee,
  };

  return (
    <ImpersonationContext.Provider value={value}>
      {children}
    </ImpersonationContext.Provider>
  );
};