import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building2, Plus, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FranchiseesSectionProps {
  totalFranchisees: number;
  activeFranchisees: number;
}

export const FranchiseesSection: React.FC<FranchiseesSectionProps> = ({
  totalFranchisees,
  activeFranchisees
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestión de Franquiciados
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Franquiciado
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Ver Todos
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <h4 className="font-semibold text-blue-900">Total Franquiciados</h4>
                <p className="text-2xl font-bold text-blue-700">{totalFranchisees}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-900">Activos</h4>
                <p className="text-2xl font-bold text-green-700">{activeFranchisees}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-orange-600" />
              <div>
                <h4 className="font-semibold text-orange-900">Pendientes</h4>
                <p className="text-2xl font-bold text-orange-700">{totalFranchisees - activeFranchisees}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-3">Franquiciados Recientes</h5>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  MR
                </div>
                <div>
                  <p className="font-medium">McDonald's Restaurant</p>
                  <p className="text-sm text-gray-600">3 restaurantes</p>
                </div>
              </div>
              <Badge variant="outline">Activo</Badge>
            </div>
            
            <div className="flex items-center justify-center py-4 text-gray-500">
              <p className="text-sm">Conecte con su base de datos para ver franquiciados reales</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};