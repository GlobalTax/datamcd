import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye } from 'lucide-react';

// Componente simplificado para mostrar que la funcionalidad de impersonación
// ha sido temporalmente deshabilitada en el modo superadmin
export const ImpersonationControls: React.FC = () => {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Eye className="w-4 h-4" />
          Controles de Impersonación
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">
          Funcionalidad temporalmente deshabilitada en modo administrador.
        </p>
      </CardContent>
    </Card>
  );
};