import React from 'react';
import { useOrquestForecasts } from '@/hooks/useOrquestForecasts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OrquestSendForecastDialogProps {
  children: React.ReactNode;
}

export const OrquestSendForecastDialog: React.FC<OrquestSendForecastDialogProps> = ({ children }) => {
  const { sendForecasts, isLoading } = useOrquestForecasts();

  const handleSendForecasts = () => {
    sendForecasts();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Enviar Forecasts a Orquest
          </DialogTitle>
          <DialogDescription>
            Envía las previsiones basadas en los presupuestos anuales a Orquest para optimizar la planificación.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <BarChart3 className="h-4 w-4" />
            <AlertDescription>
              Se enviarán forecasts de ventas y tickets basados en los presupuestos anuales configurados para cada restaurante.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Qué se enviará:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                Forecasts mensuales del año actual y siguiente
              </li>
              <li className="flex items-center gap-2">
                <BarChart3 className="h-3 w-3" />
                Previsiones de ventas (SALES) basadas en presupuestos
              </li>
              <li className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3" />
                Estimaciones de tickets basadas en ventas proyectadas
              </li>
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              onClick={handleSendForecasts}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando forecasts...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Enviar Forecasts
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};