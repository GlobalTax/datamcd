
import { useCallback } from 'react';

export const useAuthTimeouts = () => {
  // Timeout helper para evitar bloqueos
  const withTimeout = useCallback(async <T>(
    promise: Promise<T>, 
    timeoutMs: number = 8000
  ): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
  }, []);

  return { withTimeout };
};
