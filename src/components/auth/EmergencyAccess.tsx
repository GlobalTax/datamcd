import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const EmergencyAccess = () => {
  const navigate = useNavigate();
  const { forceRoleUpdate, user } = useAuth();

  const handleAdvisorAccess = async () => {
    console.log('Emergency: Direct advisor access triggered');
    const success = await forceRoleUpdate();
    if (success) {
      navigate('/advisor', { replace: true });
    } else {
      // Acceso directo sin esperar actualización
      navigate('/advisor', { replace: true });
    }
  };

  const handleFranchiseeAccess = () => {
    console.log('Emergency: Direct franchisee access triggered');
    navigate('/dashboard', { replace: true });
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-6 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-800 text-center">🚨 Acceso de Emergencia</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-orange-700 text-center">
          <p><strong>Usuario autenticado:</strong> {user.email}</p>
          <p><strong>Rol actual:</strong> {user.role}</p>
          <p className="mt-2">Si no puedes acceder normalmente, usa estos botones:</p>
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={handleAdvisorAccess}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            🔧 Acceso Asesor/Admin
          </Button>
          
          <Button 
            onClick={handleFranchiseeAccess}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            🏪 Acceso Franquiciado
          </Button>
        </div>
        
        <div className="text-xs text-orange-600 text-center">
          Estos botones te llevan directamente a la sección correcta
        </div>
      </CardContent>
    </Card>
  );
};