
import { useState, useEffect, useRef } from 'react';

interface UseOptimizedQueriesOptions {
  debounceMs?: number;
  maxRetries?: number;
  enabled?: boolean;
}

export const useOptimizedQueries = (
  queryFn: () => Promise<void>,
  dependencies: any[],
  options: UseOptimizedQueriesOptions = {}
) => {
  const {
    debounceMs = 1000,
    maxRetries = 2,
    enabled = true
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const lastDepsRef = useRef<string>('');

  useEffect(() => {
    if (!enabled) return;

    // Crear hash de dependencias para evitar queries duplicadas
    const depsHash = JSON.stringify(dependencies);
    
    // Si las dependencias no han cambiado, no hacer nada
    if (depsHash === lastDepsRef.current) {
      return;
    }

    lastDepsRef.current = depsHash;

    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce la query
    timeoutRef.current = setTimeout(async () => {
      if (loading) return; // Evitar queries concurrentes

      try {
        setLoading(true);
        setError(null);
        await queryFn();
        retryCountRef.current = 0;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        
        // Retry logic con backoff exponencial
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          const retryDelay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
          
          setTimeout(() => {
            queryFn().catch(console.error);
          }, retryDelay);
        }
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, dependencies);

  return { loading, error };
};
