import React from 'react';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, X } from 'lucide-react';
import { useImpersonation } from '@/hooks/useImpersonation';
import { useNavigate } from 'react-router-dom';

export const ImpersonationBanner: React.FC = () => {
  try {
    const { isImpersonating, impersonatedFranchisee, stopImpersonation } = useImpersonation();
    const navigate = useNavigate();

    if (!isImpersonating || !impersonatedFranchisee) {
      return null;
    }

    const handleStopImpersonation = () => {
      stopImpersonation();
      navigate('/advisor');
    };

    return (
      <Alert className="bg-blue-50 border-blue-200 text-blue-800 rounded-none border-b">
        <User className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              Viendo como: {impersonatedFranchisee.franchisee_name}
            </span>
            <span className="text-sm text-blue-600">
              (Modo Asesor)
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleStopImpersonation}
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            <X className="w-4 h-4 mr-2" />
            Salir del Panel
          </Button>
        </AlertDescription>
      </Alert>
    );
  } catch (error) {
    logger.error('ImpersonationBanner error', { error: error.message, component: 'ImpersonationBanner' });
    return null;
  }
};