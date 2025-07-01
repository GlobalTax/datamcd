
import React, { useState, useEffect } from 'react';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EnhancedLoadingScreenProps {
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  timeout?: number;
}

const EnhancedLoadingScreen: React.FC<EnhancedLoadingScreenProps> = ({
  message = "Cargando...",
  showRetry = false,
  onRetry,
  timeout = 10000
}) => {
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setElapsedTime(elapsed);
      
      if (elapsed > timeout && !showTimeoutWarning) {
        setShowTimeoutWarning(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeout, showTimeoutWarning]);

  const formatTime = (ms: number) => {
    return Math.round(ms / 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {message}
          </h2>
          
          <p className="text-gray-600 mb-4">
            Tiempo transcurrido: {formatTime(elapsedTime)}s
          </p>

          {showTimeoutWarning && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                <p className="text-yellow-800 font-medium">
                  La carga está tomando más tiempo del esperado
                </p>
              </div>
              <p className="text-yellow-700 text-sm">
                Esto puede deberse a una conexión lenta o problemas temporales del servidor.
              </p>
            </div>
          )}

          {(showRetry || showTimeoutWarning) && onRetry && (
            <Button 
              onClick={onRetry}
              variant="outline"
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          )}

          <div className="mt-6 text-xs text-gray-500">
            <p>Si el problema persiste, prueba:</p>
            <ul className="mt-2 space-y-1">
              <li>• Actualizar la página</li>
              <li>• Limpiar la caché del navegador</li>
              <li>• Comprobar tu conexión a internet</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedLoadingScreen;
