import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { logger } from '@/lib/logger';

interface RestaurantContextType {
  currentRestaurantId: string | null;
  setRestaurantId: (id: string | null) => void;
  onRestaurantChange?: (restaurantId: string | null) => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

interface RestaurantContextProviderProps {
  children: ReactNode;
  onRestaurantChange?: (restaurantId: string | null) => void;
}

export const RestaurantContextProvider = ({ 
  children, 
  onRestaurantChange 
}: RestaurantContextProviderProps) => {
  const [currentRestaurantId, setCurrentRestaurantIdStorage] = useLocalStorage<string | null>(
    'current-restaurant-id', 
    null
  );

  const setRestaurantId = useCallback((id: string | null) => {
    logger.info('RestaurantContext: Changing restaurant', { 
      from: currentRestaurantId, 
      to: id 
    });
    
    setCurrentRestaurantIdStorage(id);
    
    // Trigger callback if provided
    if (onRestaurantChange) {
      try {
        onRestaurantChange(id);
      } catch (error) {
        logger.error('RestaurantContext: Error in onRestaurantChange callback', {
          restaurantId: id,
          error: error instanceof Error ? error.message : 'Unknown error'
        }, error instanceof Error ? error : undefined);
      }
    }
  }, [currentRestaurantId, setCurrentRestaurantIdStorage, onRestaurantChange]);

  const contextValue: RestaurantContextType = {
    currentRestaurantId,
    setRestaurantId,
    onRestaurantChange
  };

  logger.debug('RestaurantContext: Provider rendered', { 
    currentRestaurantId,
    hasOnChangeCallback: !!onRestaurantChange 
  });

  return (
    <RestaurantContext.Provider value={contextValue}>
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurantContext = (): RestaurantContextType => {
  const context = useContext(RestaurantContext);
  
  if (context === undefined) {
    const error = new Error('useRestaurantContext must be used within a RestaurantContextProvider');
    logger.error('RestaurantContext: Hook used outside provider', {
      component: 'useRestaurantContext'
    }, error);
    throw error;
  }
  
  return context;
};

// Export the context itself for advanced use cases
export { RestaurantContext };