import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, User, Settings } from 'lucide-react';

export default function EmergencyAccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('EmergencyAccessPage - Loaded for debugging access issues');
  }, []);

  const handleDirectAdvisorAccess = () => {
    console.log('EmergencyAccessPage - Direct advisor access initiated');
    navigate('/advisor', { replace: true });
  };

  const handleDirectDashboardAccess = () => {
    console.log('EmergencyAccessPage - Direct dashboard access initiated');
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            🚨 ACCESO DE EMERGENCIA
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            MCDATACENTER - Sistema de Acceso Directo
          </p>
          <p className="mt-1 text-center text-xs text-orange-600">
            Para resolver problemas de autenticación
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Acceso Directo al Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-sm text-gray-700 text-center">
              <p className="font-medium">Usuario: s@golooper.es</p>
              <Badge variant="outline" className="mt-1">Bypass Activado</Badge>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={handleDirectAdvisorAccess}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                <User className="h-4 w-4 mr-2" />
                🔧 ACCEDER COMO ASESOR
              </Button>
              
              <Button
                onClick={handleDirectDashboardAccess}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <Settings className="h-4 w-4 mr-2" />
                🏪 ACCEDER COMO FRANQUICIADO
              </Button>
            </div>
            
            <div className="border-t pt-4 space-y-2">
              <h3 className="text-sm font-medium text-gray-900">Otras opciones:</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate('/auth')}
                  size="sm"
                >
                  Sistema Original
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/auth-improved')}
                  size="sm"
                >
                  Sistema Mejorado
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/debug-auth')}
                  size="sm"
                >
                  Debug Auth
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  size="sm"
                >
                  Página Principal
                </Button>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800">
                  Base de datos actualizada
                </span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                Perfil de usuario creado con rol 'asesor'
              </p>
            </div>
            
            <div className="text-xs text-gray-500 text-center">
              <p>Esta página es temporal para resolver problemas de acceso</p>
              <p>Una vez que funcione el login normal, se puede desactivar</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}