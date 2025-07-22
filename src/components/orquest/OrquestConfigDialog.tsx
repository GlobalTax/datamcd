
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface OrquestConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  franchiseeId?: string;
}

export const OrquestConfigDialog: React.FC<OrquestConfigDialogProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configuración de Orquest - Actualización de Seguridad</DialogTitle>
          <DialogDescription>
            La configuración de API keys ha sido migrada a un sistema más seguro
          </DialogDescription>
        </DialogHeader>
        
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Configuración Actualizada:</strong> Las API keys de Orquest ahora se manejan 
            de forma segura en el servidor. Por favor, usa la nueva sección de "Configuración de APIs" 
            en el panel de administración para activar las integraciones.
          </AlertDescription>
        </Alert>
      </DialogContent>
    </Dialog>
  );
};
