import React, { createContext, useContext, useEffect, useState } from 'react';
import { logger } from '@/lib/logger';

type ConnectionStatus = 'online' | 'offline' | 'reconnecting';

interface ConnectionStatusContextType {
  status: ConnectionStatus;
  isStable: boolean;
}

const ConnectionStatusContext = createContext<ConnectionStatusContextType>({
  status: 'online',
  isStable: true
});

export const useConnectionStatus = () => useContext(ConnectionStatusContext);

interface ConnectionStatusProviderProps {
  children: React.ReactNode;
}

export const ConnectionStatusProvider: React.FC<ConnectionStatusProviderProps> = ({ children }) => {
  const [status, setStatus] = useState<ConnectionStatus>('online');
  const [isStable, setIsStable] = useState(true);

  useEffect(() => {
    const handleOnline = () => {
      logger.info('Connection restored', { component: 'ConnectionStatusProvider' });
      setStatus('online');
      setIsStable(true);
    };

    const handleOffline = () => {
      logger.warn('Connection lost', { component: 'ConnectionStatusProvider' });
      setStatus('offline');
      setIsStable(false);
    };

    // Check initial connection status
    setStatus(navigator.onLine ? 'online' : 'offline');
    setIsStable(navigator.onLine);

    // Listen for connection changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Monitor development server connection
    const checkDevServerConnection = () => {
      if (process.env.NODE_ENV === 'development') {
        fetch('/_sandbox/dev-server', { method: 'HEAD' })
          .then(() => {
            if (status === 'reconnecting') {
              setStatus('online');
              setIsStable(true);
            }
          })
          .catch(() => {
            if (status === 'online') {
              setStatus('reconnecting');
              setIsStable(false);
            }
          });
      }
    };

    const devServerInterval = setInterval(checkDevServerConnection, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(devServerInterval);
    };
  }, [status]);

  return (
    <ConnectionStatusContext.Provider value={{ status, isStable }}>
      {children}
    </ConnectionStatusContext.Provider>
  );
};